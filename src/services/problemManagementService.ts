import problemManagementSeed from '../data/problem-management.json';
import { ProblemManagement } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const STORAGE_KEY = 'krishi_problem_management_v1';

class ProblemManagementService {
  private getData(): ProblemManagement[] {
    return getInitialData<ProblemManagement[]>(STORAGE_KEY, problemManagementSeed as ProblemManagement[]);
  }

  private saveData(data: ProblemManagement[]): void {
    saveStorageData(STORAGE_KEY, data);
  }

  public resetToDefaults(): void {
    this.saveData(problemManagementSeed as ProblemManagement[]);
  }

  public getManagements(cropProblemId?: string): ProblemManagement[] {
    const list = this.getData();
    if (cropProblemId && cropProblemId !== 'ALL') {
      return list.filter(m => String(m.CropProblemId) === String(cropProblemId));
    }
    return list;
  }

  public getManagementById(managementId: string): ProblemManagement | undefined {
    return this.getData().find(m => String(m.ManagementId) === String(managementId));
  }

  public createManagement(item: {
    CropProblemId: string;
    PlantGrowthStage: string;
    PestDevelopmentStage: string;
    SeverityLevel: string;
    ManagementType: string;
    ManagementDetails: string;
    IsActive?: boolean;
    ManagementId?: string;
  }): ProblemManagement {
    const data = this.getData();
    const newId =
      item.ManagementId?.trim() ||
      String(
        data.length > 0
          ? Math.max(...data.map(m => Number(m.ManagementId) || 0)) + 1
          : 1
      );

    if (data.some(m => String(m.ManagementId) === String(newId))) {
      throw new Error(`Management record with ID "${newId}" already exists.`);
    }

    const newRecord: ProblemManagement = {
      ManagementId: newId,
      CropProblemId: String(item.CropProblemId).trim(),
      PlantGrowthStage: item.PlantGrowthStage.trim(),
      PestDevelopmentStage: item.PestDevelopmentStage.trim(),
      SeverityLevel: item.SeverityLevel.trim(),
      ManagementType: item.ManagementType.trim(),
      ManagementDetails: item.ManagementDetails.trim(),
      IsActive: item.IsActive ?? true
    };

    data.push(newRecord);
    this.saveData(data);
    return newRecord;
  }

  public updateManagement(managementId: string, updates: Partial<ProblemManagement>): ProblemManagement {
    const data = this.getData();
    const idx = data.findIndex(m => String(m.ManagementId) === String(managementId));
    if (idx === -1) {
      throw new Error(`Management record with ID "${managementId}" not found.`);
    }

    data[idx] = {
      ...data[idx],
      ...updates,
      ManagementId: data[idx].ManagementId
    };

    this.saveData(data);
    return data[idx];
  }

  public deleteManagement(managementId: string): void {
    const data = this.getData().filter(m => String(m.ManagementId) !== String(managementId));
    this.saveData(data);
  }

  public toggleActive(managementId: string): ProblemManagement {
    const data = this.getData();
    const idx = data.findIndex(m => String(m.ManagementId) === String(managementId));
    if (idx === -1) {
      throw new Error(`Management record with ID "${managementId}" not found.`);
    }

    data[idx].IsActive = !data[idx].IsActive;
    this.saveData(data);
    return data[idx];
  }

  public getStats() {
    const data = this.getData();
    const totalCount = data.length;
    const activeCount = data.filter(m => m.IsActive).length;

    const culturalCount = data.filter(m => m.ManagementType.toLowerCase() === 'cultural').length;
    const biologicalCount = data.filter(m => m.ManagementType.toLowerCase() === 'biological').length;
    const chemicalCount = data.filter(m => m.ManagementType.toLowerCase() === 'chemical').length;
    const mechanicalCount = data.filter(m => m.ManagementType.toLowerCase().includes('mechanical')).length;

    const uniqueProblems = new Set(data.map(m => String(m.CropProblemId)));

    return {
      totalCount,
      activeCount,
      culturalCount,
      biologicalCount,
      chemicalCount,
      mechanicalCount,
      problemsCoveredCount: uniqueProblems.size
    };
  }
}

export const problemManagementService = new ProblemManagementService();
