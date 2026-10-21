import problemMediaSeed from '../data/problem-media.json';
import { ProblemMedia } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const STORAGE_KEY = 'krishi_problem_media_v1';

class ProblemMediaService {
  private getData(): ProblemMedia[] {
    return getInitialData<ProblemMedia[]>(STORAGE_KEY, problemMediaSeed as ProblemMedia[]);
  }

  private saveData(data: ProblemMedia[]): void {
    saveStorageData(STORAGE_KEY, data);
  }

  public resetToDefaults(): void {
    this.saveData(problemMediaSeed as ProblemMedia[]);
  }

  public getMedia(cropProblemId?: string): ProblemMedia[] {
    const list = this.getData();
    let result = list;
    if (cropProblemId && cropProblemId !== 'ALL') {
      result = list.filter(m => String(m.CropProblemId) === String(cropProblemId));
    }
    return result.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
  }

  public getMediaById(problemMediaId: string): ProblemMedia | undefined {
    return this.getData().find(m => String(m.ProblemMediaId) === String(problemMediaId));
  }

  public getMediaByProblemId(cropProblemId: string): ProblemMedia[] {
    return this.getMedia(cropProblemId).filter(m => m.IsActive);
  }

  public createMedia(item: {
    CropProblemId: string;
    MediaType: string;
    MediaUrl: string;
    MediaDescription: string;
    DisplayOrder?: number;
    IsActive?: boolean;
    ProblemMediaId?: string;
  }): ProblemMedia {
    const data = this.getData();
    const newId =
      item.ProblemMediaId?.trim() ||
      String(
        data.length > 0
          ? Math.max(...data.map(m => Number(m.ProblemMediaId) || 0)) + 1
          : 1
      );

    if (data.some(m => String(m.ProblemMediaId) === String(newId))) {
      throw new Error(`A ProblemMedia record with ID "${newId}" already exists.`);
    }

    // Default display order to next highest in this crop problem
    const problemMedia = data.filter(m => String(m.CropProblemId) === String(item.CropProblemId));
    const nextOrder =
      item.DisplayOrder ??
      (problemMedia.length > 0
        ? Math.max(...problemMedia.map(m => m.DisplayOrder || 0)) + 1
        : 1);

    const newMedia: ProblemMedia = {
      ProblemMediaId: newId,
      CropProblemId: String(item.CropProblemId).trim(),
      MediaType: item.MediaType.trim().toUpperCase(),
      MediaUrl: item.MediaUrl.trim(),
      MediaDescription: item.MediaDescription.trim(),
      DisplayOrder: nextOrder,
      IsActive: item.IsActive ?? true
    };

    data.push(newMedia);
    this.saveData(data);
    return newMedia;
  }

  public updateMedia(problemMediaId: string, updates: Partial<ProblemMedia>): ProblemMedia {
    const data = this.getData();
    const idx = data.findIndex(m => String(m.ProblemMediaId) === String(problemMediaId));
    if (idx === -1) {
      throw new Error(`ProblemMedia with ID "${problemMediaId}" not found.`);
    }

    data[idx] = {
      ...data[idx],
      ...updates,
      ProblemMediaId: data[idx].ProblemMediaId // Immutable PK
    };

    this.saveData(data);
    return data[idx];
  }

  public deleteMedia(problemMediaId: string): void {
    const data = this.getData().filter(m => String(m.ProblemMediaId) !== String(problemMediaId));
    this.saveData(data);
  }

  public toggleActive(problemMediaId: string): ProblemMedia {
    const data = this.getData();
    const idx = data.findIndex(m => String(m.ProblemMediaId) === String(problemMediaId));
    if (idx === -1) {
      throw new Error(`ProblemMedia with ID "${problemMediaId}" not found.`);
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
    const uniqueProblems = new Set(data.map(m => String(m.CropProblemId)));

    return {
      totalCount,
      activeCount,
      imageCount,
      videoCount,
      problemsCoveredCount: uniqueProblems.size
    };
  }
}

export const problemMediaService = new ProblemMediaService();
