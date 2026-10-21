import problemManagementMediaSeed from '../data/problem-management-media.json';
import { ProblemManagementMedia } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const STORAGE_KEY = 'krishi_problem_mgmt_media_v1';

class ProblemManagementMediaService {
  private getData(): ProblemManagementMedia[] {
    return getInitialData<ProblemManagementMedia[]>(STORAGE_KEY, problemManagementMediaSeed as ProblemManagementMedia[]);
  }

  private saveData(data: ProblemManagementMedia[]): void {
    saveStorageData(STORAGE_KEY, data);
  }

  public resetToDefaults(): void {
    this.saveData(problemManagementMediaSeed as ProblemManagementMedia[]);
  }

  public getMedia(managementId?: string): ProblemManagementMedia[] {
    const list = this.getData();
    let result = list;
    if (managementId && managementId !== 'ALL') {
      result = list.filter(m => String(m.ManagementId) === String(managementId));
    }
    return result.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
  }

  public getMediaById(mediaId: string): ProblemManagementMedia | undefined {
    return this.getData().find(m => String(m.ManagementMediaId) === String(mediaId));
  }

  public createMedia(item: {
    ManagementId: string;
    MediaType: string;
    MediaUrl: string;
    MediaDescription: string;
    DisplayOrder?: number;
    IsActive?: boolean;
    ManagementMediaId?: string;
  }): ProblemManagementMedia {
    const data = this.getData();
    const newId =
      item.ManagementMediaId?.trim() ||
      String(
        data.length > 0
          ? Math.max(...data.map(m => Number(m.ManagementMediaId) || 0)) + 1
          : 1
      );

    if (data.some(m => String(m.ManagementMediaId) === String(newId))) {
      throw new Error(`Management Media with ID "${newId}" already exists.`);
    }

    const mgmtMedia = data.filter(m => String(m.ManagementId) === String(item.ManagementId));
    const nextOrder =
      item.DisplayOrder ??
      (mgmtMedia.length > 0
        ? Math.max(...mgmtMedia.map(m => m.DisplayOrder || 0)) + 1
        : 1);

    const newRecord: ProblemManagementMedia = {
      ManagementMediaId: newId,
      ManagementId: String(item.ManagementId).trim(),
      MediaType: item.MediaType.trim().toUpperCase(),
      MediaUrl: item.MediaUrl.trim(),
      MediaDescription: item.MediaDescription.trim(),
      DisplayOrder: nextOrder,
      IsActive: item.IsActive ?? true
    };

    data.push(newRecord);
    this.saveData(data);
    return newRecord;
  }

  public updateMedia(mediaId: string, updates: Partial<ProblemManagementMedia>): ProblemManagementMedia {
    const data = this.getData();
    const idx = data.findIndex(m => String(m.ManagementMediaId) === String(mediaId));
    if (idx === -1) {
      throw new Error(`Management media with ID "${mediaId}" not found.`);
    }

    data[idx] = {
      ...data[idx],
      ...updates,
      ManagementMediaId: data[idx].ManagementMediaId
    };

    this.saveData(data);
    return data[idx];
  }

  public deleteMedia(mediaId: string): void {
    const data = this.getData().filter(m => String(m.ManagementMediaId) !== String(mediaId));
    this.saveData(data);
  }

  public toggleActive(mediaId: string): ProblemManagementMedia {
    const data = this.getData();
    const idx = data.findIndex(m => String(m.ManagementMediaId) === String(mediaId));
    if (idx === -1) {
      throw new Error(`Management media with ID "${mediaId}" not found.`);
    }

    data[idx].IsActive = !data[idx].IsActive;
    this.saveData(data);
    return data[idx];
  }

  public getStats() {
    const data = this.getData();
    const totalCount = data.length;
    const activeCount = data.filter(m => m.IsActive).length;
    const imageCount = data.filter(m => m.MediaType.toUpperCase() === 'IMAGE').length;
    const videoCount = data.filter(m => m.MediaType.toUpperCase() === 'VIDEO').length;
    const uniqueManagements = new Set(data.map(m => String(m.ManagementId)));

    return {
      totalCount,
      activeCount,
      imageCount,
      videoCount,
      managementsCoveredCount: uniqueManagements.size
    };
  }
}

export const problemManagementMediaService = new ProblemManagementMediaService();
