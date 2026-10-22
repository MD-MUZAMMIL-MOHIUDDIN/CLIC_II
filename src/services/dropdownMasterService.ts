import dropdownMasterSeed from '../data/dropdown-master.json';
import { RefTypeItem, DropdownItem } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const STORAGE_KEY = 'dropdown_master_data_v6';

interface DropdownMasterStorage {
  refTypes: RefTypeItem[];
  dropdowns: DropdownItem[];
}

class DropdownMasterService {
  private getData(): DropdownMasterStorage {
    const data = getInitialData<DropdownMasterStorage>(STORAGE_KEY, {
      refTypes: dropdownMasterSeed.refTypes as RefTypeItem[],
      dropdowns: dropdownMasterSeed.dropdowns as DropdownItem[]
    });

    // Ensure all seed refTypes exist in stored data
    let modified = false;
    for (const seedRef of dropdownMasterSeed.refTypes as RefTypeItem[]) {
      if (!data.refTypes.some(r => String(r.RefId) === String(seedRef.RefId))) {
        data.refTypes.push(seedRef);
        modified = true;
      }
    }

    // Ensure all seed dropdowns exist in stored data
    for (const seedDrop of dropdownMasterSeed.dropdowns as DropdownItem[]) {
      if (!data.dropdowns.some(d => String(d.DropdownId) === String(seedDrop.DropdownId))) {
        data.dropdowns.push(seedDrop);
        modified = true;
      }
    }

    if (modified) {
      this.saveData(data);
    }

    return data;
  }

  private saveData(data: DropdownMasterStorage): void {
    saveStorageData(STORAGE_KEY, data);
  }

  public resetToDefaults(): void {
    const defaultData: DropdownMasterStorage = {
      refTypes: dropdownMasterSeed.refTypes as RefTypeItem[],
      dropdowns: dropdownMasterSeed.dropdowns as DropdownItem[]
    };
    this.saveData(defaultData);
  }

  public getStats() {
    const data = this.getData();
    return {
      refTypesCount: data.refTypes.length,
      dropdownsCount: data.dropdowns.length
    };
  }

  // ================= REF TYPES CRUD =================
  public getRefTypes(): RefTypeItem[] {
    return this.getData().refTypes;
  }

  public getRefTypeById(id: string): RefTypeItem | undefined {
    return this.getRefTypes().find(r => String(r.RefId) === String(id));
  }

  public createRefType(item: { RefName: string; RefId?: string }): RefTypeItem {
    const data = this.getData();
    const newId = item.RefId?.trim() || String(Date.now());
    const newRefType: RefTypeItem = {
      RefId: newId,
      RefName: item.RefName.trim()
    };
    data.refTypes.push(newRefType);
    this.saveData(data);
    return newRefType;
  }

  public updateRefType(id: string, updates: Partial<RefTypeItem>): RefTypeItem {
    const data = this.getData();
    const idx = data.refTypes.findIndex(r => String(r.RefId) === String(id));
    if (idx === -1) throw new Error(`RefType with RefId ${id} not found`);
    data.refTypes[idx] = {
      ...data.refTypes[idx],
      ...updates,
      RefId: data.refTypes[idx].RefId
    };
    this.saveData(data);
    return data.refTypes[idx];
  }

  public deleteRefType(id: string): boolean {
    const data = this.getData();
    const strId = String(id);
    const initialLen = data.refTypes.length;
    data.refTypes = data.refTypes.filter(r => String(r.RefId) !== strId);
    if (data.refTypes.length === initialLen) return false;

    // Cascade delete associated dropdown items
    data.dropdowns = data.dropdowns.filter(d => String(d.RefId) !== strId);

    this.saveData(data);
    return true;
  }

  public getDropdownCountByRefId(refId: string): number {
    const data = this.getData();
    return data.dropdowns.filter(d => String(d.RefId) === String(refId)).length;
  }

  // ================= DROPDOWNS CRUD =================
  public getDropdowns(refId?: string): DropdownItem[] {
    const list = this.getData().dropdowns;
    if (refId && refId !== 'ALL') {
      return list.filter(d => String(d.RefId) === String(refId));
    }
    return list;
  }

  public getDropdownById(id: string): DropdownItem | undefined {
    return this.getData().dropdowns.find(d => String(d.DropdownId) === String(id));
  }

  public createDropdown(item: {
    Value: string;
    Text: string;
    RefId: string;
    DropdownId?: string;
    Category?: string;
    Telugu?: string;
  }): DropdownItem {
    const data = this.getData();
    const newId = item.DropdownId?.trim() || String(Date.now());
    const newDropdown: DropdownItem = {
      DropdownId: newId,
      Value: item.Value.trim(),
      Text: item.Text.trim(),
      RefId: String(item.RefId),
      ...(item.Category?.trim() ? { Category: item.Category.trim() } : {}),
      ...(item.Telugu?.trim() ? { Telugu: item.Telugu.trim() } : {})
    };
    data.dropdowns.push(newDropdown);
    this.saveData(data);
    return newDropdown;
  }

  public updateDropdown(id: string, updates: Partial<DropdownItem>): DropdownItem {
    const data = this.getData();
    const idx = data.dropdowns.findIndex(d => String(d.DropdownId) === String(id));
    if (idx === -1) throw new Error(`Dropdown with DropdownId ${id} not found`);
    data.dropdowns[idx] = {
      ...data.dropdowns[idx],
      ...updates,
      DropdownId: data.dropdowns[idx].DropdownId
    };
    this.saveData(data);
    return data.dropdowns[idx];
  }

  public deleteDropdown(id: string): boolean {
    const data = this.getData();
    const strId = String(id);
    const initialLen = data.dropdowns.length;
    data.dropdowns = data.dropdowns.filter(d => String(d.DropdownId) !== strId);
    if (data.dropdowns.length === initialLen) return false;
    this.saveData(data);
    return true;
  }
}

export const dropdownMasterService = new DropdownMasterService();
