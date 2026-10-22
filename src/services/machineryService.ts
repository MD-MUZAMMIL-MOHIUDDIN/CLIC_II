import machinerySeed from '../data/farm-machinery.json';
import { FarmMachinery, MachineryCategory, PricingUnit } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';
import { machineMediaService } from './machineMediaService';

const MACHINERY_KEY = 'machinery_v3';

class MachineryService {
  public getAllMachinery(): FarmMachinery[] {
    const list = getInitialData<FarmMachinery[]>(MACHINERY_KEY, machinerySeed as unknown as FarmMachinery[]);
    
    // Dynamically join media from machine_media.json purely using machineId as the relationship
    for (const item of list) {
      const media = machineMediaService.getMediaByMachineId(item.id);
      if (media) {
        item.galleryMediaUrls = media.galleryMediaUrls || [];
        item.demoVideoUrl = media.demoVideoUrl || '';
      } else {
        item.galleryMediaUrls = item.galleryMediaUrls || [];
      }
      // Populate helper images array for components needing full image list (thumbnail + gallery)
      item.images = [item.thumbnailUrl, ...(item.galleryMediaUrls || [])];
    }
    return list;
  }

  public getMachineryById(id: string): FarmMachinery | undefined {
    return this.getAllMachinery().find(m => m.id === id);
  }

  public getMachineryByCentreId(centreId: string): FarmMachinery[] {
    return this.getAllMachinery().filter(m => m.centreId === centreId);
  }

  public searchMachinery(params: {
    query?: string;
    category?: MachineryCategory | 'All';
    pricingUnit?: PricingUnit | 'All';
    maxPrice?: number;
    availableOnly?: boolean;
    operatorProvidedOnly?: boolean;
    state?: string;
  }): FarmMachinery[] {
    let list = this.getAllMachinery();

    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.centreName.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }
    if (params.category && params.category !== 'All') {
      list = list.filter(m => m.category === params.category);
    }
    if (params.pricingUnit && params.pricingUnit !== 'All') {
      list = list.filter(m => m.pricingUnit === params.pricingUnit);
    }
    if (params.maxPrice) {
      list = list.filter(m => m.pricePerUnit <= params.maxPrice!);
    }
    if (params.availableOnly) {
      list = list.filter(m => m.available);
    }
    if (params.operatorProvidedOnly) {
      list = list.filter(m => m.operatorProvided);
    }
    if (params.state && params.state !== 'All') {
      list = list.filter(m => m.location.state === params.state);
    }
    return list;
  }

  public addMachinery(machineryData: Omit<FarmMachinery, 'id'> & { id?: string }): FarmMachinery {
    const list = this.getAllMachinery();
    const finalId = machineryData.id?.trim() || `mach_${Date.now().toString().slice(-4)}`;
    
    // Store only machinery fields in machinery storage, separating media
    const { images, galleryMediaUrls, demoVideoUrl, ...cleanData } = machineryData;

    const newMach: FarmMachinery = {
      ...cleanData,
      id: finalId,
      machineId: finalId
    };
    list.unshift(newMach);
    saveStorageData(MACHINERY_KEY, list);

    // Persist media via machineMediaService using machineId
    if ((galleryMediaUrls && galleryMediaUrls.length > 0) || demoVideoUrl) {
      machineMediaService.addMedia({
        machineId: finalId,
        galleryMediaUrls: galleryMediaUrls || [newMach.thumbnailUrl],
        demoVideoUrl: demoVideoUrl || '',
        videoTitle: `${newMach.name} Field Demo`
      });
    }

    // Attach runtime fields
    newMach.galleryMediaUrls = galleryMediaUrls || [];
    newMach.demoVideoUrl = demoVideoUrl;
    newMach.images = [newMach.thumbnailUrl, ...(newMach.galleryMediaUrls || [])];

    return newMach;
  }

  public updateMachinery(id: string, updates: Partial<FarmMachinery>): boolean {
    const list = this.getAllMachinery();
    const index = list.findIndex(m => m.id === id);
    if (index === -1) return false;

    const { images, galleryMediaUrls, demoVideoUrl, ...cleanUpdates } = updates;
    list[index] = { ...list[index], ...cleanUpdates };
    saveStorageData(MACHINERY_KEY, list);

    if (galleryMediaUrls !== undefined || demoVideoUrl !== undefined) {
      const existingMedia = machineMediaService.getMediaByMachineId(id);
      if (existingMedia) {
        machineMediaService.updateMedia(id, {
          galleryMediaUrls: galleryMediaUrls ?? existingMedia.galleryMediaUrls,
          demoVideoUrl: demoVideoUrl ?? existingMedia.demoVideoUrl
        });
      } else {
        machineMediaService.addMedia({
          machineId: id,
          galleryMediaUrls: galleryMediaUrls || [],
          demoVideoUrl: demoVideoUrl || '',
          videoTitle: 'Field Demonstration'
        });
      }
    }

    return true;
  }
}

export const machineryService = new MachineryService();
