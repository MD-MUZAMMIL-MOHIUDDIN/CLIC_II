import cropProblemsSeed from '../data/crop-problems.json';
import { CropProblem } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const STORAGE_KEY = 'crop_problems_data_v1';

interface CropProblemFilters {
  cropId?: string;
  problemCategoryId?: string;
  isActive?: boolean | 'ALL';
  search?: string;
}

class CropProblemService {
  private getData(): CropProblem[] {
    return getInitialData<CropProblem[]>(STORAGE_KEY, cropProblemsSeed as CropProblem[]);
  }

  private saveData(data: CropProblem[]): void {
    saveStorageData(STORAGE_KEY, data);
  }

  public resetToDefaults(): void {
    this.saveData(cropProblemsSeed as CropProblem[]);
  }

  public getStats() {
    const list = this.getData();
    return {
      totalCount: list.length,
      pestsCount: list.filter(p => String(p.ProblemCategoryId) === '36').length,
      diseasesCount: list.filter(p => String(p.ProblemCategoryId) === '37').length,
      deficienciesCount: list.filter(p => String(p.ProblemCategoryId) === '38').length,
      activeCount: list.filter(p => p.IsActive).length
    };
  }

  public getCropProblems(filters?: CropProblemFilters): CropProblem[] {
    let list = this.getData();

    if (!filters) return list;

    if (filters.cropId && filters.cropId !== 'ALL') {
      list = list.filter(p => String(p.CropId) === String(filters.cropId));
    }

    if (filters.problemCategoryId && filters.problemCategoryId !== 'ALL') {
      list = list.filter(p => String(p.ProblemCategoryId) === String(filters.problemCategoryId));
    }

    if (filters.isActive !== undefined && filters.isActive !== 'ALL') {
      const boolVal = filters.isActive === true;
      list = list.filter(p => p.IsActive === boolVal);
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p =>
        p.ProblemName.toLowerCase().includes(q) ||
        (p.ScientificName && p.ScientificName.toLowerCase().includes(q)) ||
        p.Description.toLowerCase().includes(q) ||
        p.Symptoms.toLowerCase().includes(q) ||
        String(p.CropProblemId).toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getCropProblemById(id: string): CropProblem | undefined {
    return this.getData().find(p => String(p.CropProblemId) === String(id));
  }

  public createCropProblem(item: {
    CropId: string;
    ProblemCategoryId: string;
    ProblemName: string;
    ScientificName?: string;
    Description: string;
    Symptoms: string;
    IsActive?: boolean;
    CropProblemId?: string;
  }): CropProblem {
    const data = this.getData();
    const newId = item.CropProblemId?.trim() || String(data.length > 0 ? Math.max(...data.map(d => Number(d.CropProblemId) || 0)) + 1 : 1);

    const newProblem: CropProblem = {
      CropProblemId: newId,
      CropId: String(item.CropId),
      ProblemCategoryId: String(item.ProblemCategoryId),
      ProblemName: item.ProblemName.trim(),
      ScientificName: item.ScientificName?.trim() || undefined,
      Description: item.Description.trim(),
      Symptoms: item.Symptoms.trim(),
      IsActive: item.IsActive !== undefined ? item.IsActive : true
    };

    data.push(newProblem);
    this.saveData(data);
    return newProblem;
  }

  public updateCropProblem(id: string, updates: Partial<CropProblem>): CropProblem {
    const data = this.getData();
    const idx = data.findIndex(p => String(p.CropProblemId) === String(id));
    if (idx === -1) throw new Error(`CropProblem with CropProblemId ${id} not found`);

    data[idx] = {
      ...data[idx],
      ...updates,
      CropProblemId: data[idx].CropProblemId
    };

    this.saveData(data);
    return data[idx];
  }

  public deleteCropProblem(id: string): boolean {
    const data = this.getData();
    const strId = String(id);
    const initialLen = data.length;
    const filtered = data.filter(p => String(p.CropProblemId) !== strId);
    if (filtered.length === initialLen) return false;

    this.saveData(filtered);
    return true;
  }

  public toggleActive(id: string): CropProblem {
    const data = this.getData();
    const idx = data.findIndex(p => String(p.CropProblemId) === String(id));
    if (idx === -1) throw new Error(`CropProblem with CropProblemId ${id} not found`);

    data[idx].IsActive = !data[idx].IsActive;
    this.saveData(data);
    return data[idx];
  }
}

export const cropProblemService = new CropProblemService();
