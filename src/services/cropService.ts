import cropsSeed from '../data/crops.json';
import { Crop } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const STORAGE_KEY = 'krishi_crops_master_v1';

class CropService {
  private getData(): Crop[] {
    return getInitialData<Crop[]>(STORAGE_KEY, cropsSeed as Crop[]);
  }

  private saveData(data: Crop[]): void {
    saveStorageData(STORAGE_KEY, data);
  }

  public resetToDefaults(): void {
    this.saveData(cropsSeed as Crop[]);
  }

  public getCrops(filters?: {
    category?: string;
    status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
    search?: string;
  }): Crop[] {
    let list = this.getData();

    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter(
        c => c.Category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters?.status === 'ACTIVE') {
      list = list.filter(c => c.IsActive);
    } else if (filters?.status === 'INACTIVE') {
      list = list.filter(c => !c.IsActive);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        c =>
          c.CropName.toLowerCase().includes(q) ||
          c.CropCode.toLowerCase().includes(q) ||
          c.Telugu.toLowerCase().includes(q) ||
          c.Category.toLowerCase().includes(q) ||
          (c.ScientificName && c.ScientificName.toLowerCase().includes(q)) ||
          (c.Description && c.Description.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public getCropById(cropId: string): Crop | undefined {
    return this.getData().find(c => String(c.CropId) === String(cropId));
  }

  public createCrop(cropData: {
    CropCode: string;
    CropName: string;
    Category: string;
    Telugu: string;
    ScientificName?: string;
    Season?: string;
    Description?: string;
    IsActive?: boolean;
    CropId?: string;
  }): Crop {
    const data = this.getData();
    const newId =
      cropData.CropId?.trim() ||
      String(
        data.length > 0
          ? Math.max(...data.map(c => Number(c.CropId) || 0)) + 1
          : 1
      );

    // Check duplicate ID
    if (data.some(c => String(c.CropId) === String(newId))) {
      throw new Error(`A crop with CropId "${newId}" already exists.`);
    }

    const newCrop: Crop = {
      CropId: newId,
      CropCode: cropData.CropCode.trim().toUpperCase(),
      CropName: cropData.CropName.trim(),
      Category: cropData.Category.trim(),
      Telugu: cropData.Telugu.trim(),
      ScientificName: cropData.ScientificName?.trim(),
      Season: cropData.Season?.trim(),
      Description: cropData.Description?.trim(),
      IsActive: cropData.IsActive ?? true
    };

    data.push(newCrop);
    this.saveData(data);
    return newCrop;
  }

  public updateCrop(cropId: string, updates: Partial<Crop>): Crop {
    const data = this.getData();
    const idx = data.findIndex(c => String(c.CropId) === String(cropId));
    if (idx === -1) {
      throw new Error(`Crop with CropId "${cropId}" not found.`);
    }

    data[idx] = {
      ...data[idx],
      ...updates,
      CropId: data[idx].CropId // Keep immutable ID
    };

    this.saveData(data);
    return data[idx];
  }

  public deleteCrop(cropId: string): void {
    const data = this.getData().filter(c => String(c.CropId) !== String(cropId));
    this.saveData(data);
  }

  public toggleStatus(cropId: string): Crop {
    const data = this.getData();
    const idx = data.findIndex(c => String(c.CropId) === String(cropId));
    if (idx === -1) {
      throw new Error(`Crop with CropId "${cropId}" not found.`);
    }

    data[idx].IsActive = !data[idx].IsActive;
    this.saveData(data);
    return data[idx];
  }

  public getStats() {
    const data = this.getData();
    const totalCount = data.length;
    const activeCount = data.filter(c => c.IsActive).length;
    const inactiveCount = totalCount - activeCount;

    const cerealsCount = data.filter(c => c.Category.toLowerCase() === 'cereals').length;
    const milletsCount = data.filter(c => c.Category.toLowerCase() === 'millets').length;
    const pulsesCount = data.filter(c => c.Category.toLowerCase() === 'pulses').length;

    const categories = Array.from(new Set(data.map(c => c.Category)));

    return {
      totalCount,
      activeCount,
      inactiveCount,
      cerealsCount,
      milletsCount,
      pulsesCount,
      categories
    };
  }
}

export const cropService = new CropService();
