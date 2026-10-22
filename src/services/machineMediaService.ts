import machineMediaSeed from '../data/machine_media.json';
import { MachineMedia } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const MACHINE_MEDIA_KEY = 'machine_media_v4';

class MachineMediaService {
  public getAllMedia(): MachineMedia[] {
    const list = getInitialData<MachineMedia[]>(MACHINE_MEDIA_KEY, machineMediaSeed as unknown as MachineMedia[]);
    // Ensure machineId is the primary identifier and id mirrors machineId
    return list.map(m => ({
      ...m,
      id: m.machineId || m.id
    }));
  }

  public getMediaById(idOrMachineId: string): MachineMedia | undefined {
    return this.getAllMedia().find(m => m.machineId === idOrMachineId || m.id === idOrMachineId);
  }

  public getMediaByMachineId(machineId: string): MachineMedia | undefined {
    return this.getAllMedia().find(m => m.machineId === machineId);
  }

  public addMedia(mediaData: Omit<MachineMedia, 'id'> & { id?: string }): MachineMedia {
    const list = this.getAllMedia();
    const targetMachineId = mediaData.machineId.trim();

    // Check if media for this machineId already exists; update it if so
    const existingIndex = list.findIndex(m => m.machineId === targetMachineId);
    if (existingIndex !== -1) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...mediaData,
        id: targetMachineId,
        machineId: targetMachineId
      };
      saveStorageData(MACHINE_MEDIA_KEY, list);
      return list[existingIndex];
    }

    const newMedia: MachineMedia = {
      ...mediaData,
      id: targetMachineId,
      machineId: targetMachineId,
      galleryMediaUrls: mediaData.galleryMediaUrls || [],
      videoTitle: mediaData.videoTitle || 'Field Demonstration',
      demoVideoUrl: mediaData.demoVideoUrl || ''
    };
    list.unshift(newMedia);
    saveStorageData(MACHINE_MEDIA_KEY, list);
    return newMedia;
  }

  public updateMedia(machineIdOrId: string, updates: Partial<MachineMedia>): boolean {
    const list = this.getAllMedia();
    const index = list.findIndex(m => m.machineId === machineIdOrId || m.id === machineIdOrId);
    if (index === -1) return false;
    list[index] = { ...list[index], ...updates };
    saveStorageData(MACHINE_MEDIA_KEY, list);
    return true;
  }

  public deleteMedia(machineIdOrId: string): boolean {
    const list = this.getAllMedia();
    const nextList = list.filter(m => m.machineId !== machineIdOrId && m.id !== machineIdOrId);
    if (nextList.length === list.length) return false;
    saveStorageData(MACHINE_MEDIA_KEY, nextList);
    return true;
  }

  // Compatibility aliases
  public getAllVideos(): MachineMedia[] {
    return this.getAllMedia();
  }

  public getVideoById(id: string): MachineMedia | undefined {
    return this.getMediaById(id);
  }

  public getVideosByMachineId(machineId: string): MachineMedia[] {
    const item = this.getMediaByMachineId(machineId);
    return item ? [item] : [];
  }

  public addVideo(videoData: Omit<MachineMedia, 'id'> & { id?: string }): MachineMedia {
    return this.addMedia(videoData);
  }

  public deleteVideo(id: string): boolean {
    return this.deleteMedia(id);
  }
}

export const machineMediaService = new MachineMediaService();
export const machineDemoVideoService = machineMediaService;
