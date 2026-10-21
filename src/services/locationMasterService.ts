import locationMasterSeed from '../data/location-master.json';
import { StateItem, DistrictItem, MandalItem, PanchayatItem, VillageItem } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const STORAGE_KEY = 'location_master_data';

interface LocationMasterStorage {
  states: StateItem[];
  districts: DistrictItem[];
  mandals: MandalItem[];
  panchayats: PanchayatItem[];
  villages: VillageItem[];
}

class LocationMasterService {
  private getData(): LocationMasterStorage {
    return getInitialData<LocationMasterStorage>(STORAGE_KEY, {
      states: locationMasterSeed.states as StateItem[],
      districts: locationMasterSeed.districts as DistrictItem[],
      mandals: locationMasterSeed.mandals as MandalItem[],
      panchayats: locationMasterSeed.panchayats as PanchayatItem[],
      villages: locationMasterSeed.villages as VillageItem[]
    });
  }

  private saveData(data: LocationMasterStorage): void {
    saveStorageData(STORAGE_KEY, data);
  }

  public resetToDefaults(): void {
    const defaultData: LocationMasterStorage = {
      states: locationMasterSeed.states as StateItem[],
      districts: locationMasterSeed.districts as DistrictItem[],
      mandals: locationMasterSeed.mandals as MandalItem[],
      panchayats: locationMasterSeed.panchayats as PanchayatItem[],
      villages: locationMasterSeed.villages as VillageItem[]
    };
    this.saveData(defaultData);
  }

  public getStats() {
    const data = this.getData();
    return {
      statesCount: data.states.length,
      districtsCount: data.districts.length,
      mandalsCount: data.mandals.length,
      panchayatsCount: data.panchayats.length,
      villagesCount: data.villages.length
    };
  }

  // ================= STATE CRUD =================
  public getStates(): StateItem[] {
    return this.getData().states;
  }

  public getStateById(id: string): StateItem | undefined {
    return this.getStates().find(s => String(s.StateId) === String(id));
  }

  public createState(item: { Value: string; Text: string; StateId?: string }): StateItem {
    const data = this.getData();
    const newId = item.StateId?.trim() || String(Date.now());
    const newState: StateItem = {
      StateId: newId,
      Value: item.Value.trim(),
      Text: item.Text.trim()
    };
    data.states.push(newState);
    this.saveData(data);
    return newState;
  }

  public updateState(id: string, updates: Partial<StateItem>): StateItem {
    const data = this.getData();
    const idx = data.states.findIndex(s => String(s.StateId) === String(id));
    if (idx === -1) throw new Error(`State with StateId ${id} not found`);
    data.states[idx] = {
      ...data.states[idx],
      ...updates,
      StateId: data.states[idx].StateId // preserve primary key
    };
    this.saveData(data);
    return data.states[idx];
  }

  public deleteState(id: string): boolean {
    const data = this.getData();
    const strId = String(id);
    const initialLen = data.states.length;
    data.states = data.states.filter(s => String(s.StateId) !== strId);
    if (data.states.length === initialLen) return false;

    // Cascade delete child entities
    const districtsToDelete = data.districts.filter(d => String(d.StateId) === strId).map(d => String(d.DistrictId));
    data.districts = data.districts.filter(d => String(d.StateId) !== strId);

    const mandalsToDelete = data.mandals.filter(m => districtsToDelete.includes(String(m.DistrictId))).map(m => String(m.MandalId));
    data.mandals = data.mandals.filter(m => !districtsToDelete.includes(String(m.DistrictId)));

    const panchayatsToDelete = data.panchayats.filter(p => mandalsToDelete.includes(String(p.MandalId))).map(p => String(p.PanchayatId));
    data.panchayats = data.panchayats.filter(p => !mandalsToDelete.includes(String(p.MandalId)));

    data.villages = data.villages.filter(v => !panchayatsToDelete.includes(String(v.PanchayatId)));

    this.saveData(data);
    return true;
  }

  // ================= DISTRICT CRUD =================
  public getDistricts(stateId?: string): DistrictItem[] {
    const list = this.getData().districts;
    if (stateId && stateId !== 'ALL') {
      return list.filter(d => String(d.StateId) === String(stateId));
    }
    return list;
  }

  public getDistrictById(id: string): DistrictItem | undefined {
    return this.getData().districts.find(d => String(d.DistrictId) === String(id));
  }

  public createDistrict(item: { Value: string; Text: string; StateId: string; DistrictId?: string }): DistrictItem {
    const data = this.getData();
    const newId = item.DistrictId?.trim() || String(Date.now());
    const newDistrict: DistrictItem = {
      DistrictId: newId,
      Value: item.Value.trim(),
      Text: item.Text.trim(),
      StateId: String(item.StateId)
    };
    data.districts.push(newDistrict);
    this.saveData(data);
    return newDistrict;
  }

  public updateDistrict(id: string, updates: Partial<DistrictItem>): DistrictItem {
    const data = this.getData();
    const idx = data.districts.findIndex(d => String(d.DistrictId) === String(id));
    if (idx === -1) throw new Error(`District with DistrictId ${id} not found`);
    data.districts[idx] = {
      ...data.districts[idx],
      ...updates,
      DistrictId: data.districts[idx].DistrictId
    };
    this.saveData(data);
    return data.districts[idx];
  }

  public deleteDistrict(id: string): boolean {
    const data = this.getData();
    const strId = String(id);
    const initialLen = data.districts.length;
    data.districts = data.districts.filter(d => String(d.DistrictId) !== strId);
    if (data.districts.length === initialLen) return false;

    // Cascade delete child entities
    const mandalsToDelete = data.mandals.filter(m => String(m.DistrictId) === strId).map(m => String(m.MandalId));
    data.mandals = data.mandals.filter(m => String(m.DistrictId) !== strId);

    const panchayatsToDelete = data.panchayats.filter(p => mandalsToDelete.includes(String(p.MandalId))).map(p => String(p.PanchayatId));
    data.panchayats = data.panchayats.filter(p => !mandalsToDelete.includes(String(p.MandalId)));

    data.villages = data.villages.filter(v => !panchayatsToDelete.includes(String(v.PanchayatId)));

    this.saveData(data);
    return true;
  }

  // ================= MANDAL CRUD =================
  public getMandals(districtId?: string): MandalItem[] {
    const list = this.getData().mandals;
    if (districtId && districtId !== 'ALL') {
      return list.filter(m => String(m.DistrictId) === String(districtId));
    }
    return list;
  }

  public getMandalById(id: string): MandalItem | undefined {
    return this.getData().mandals.find(m => String(m.MandalId) === String(id));
  }

  public createMandal(item: { Value: string; Text: string; DistrictId: string; MandalId?: string }): MandalItem {
    const data = this.getData();
    const newId = item.MandalId?.trim() || String(Date.now());
    const newMandal: MandalItem = {
      MandalId: newId,
      Value: item.Value.trim(),
      Text: item.Text.trim(),
      DistrictId: String(item.DistrictId)
    };
    data.mandals.push(newMandal);
    this.saveData(data);
    return newMandal;
  }

  public updateMandal(id: string, updates: Partial<MandalItem>): MandalItem {
    const data = this.getData();
    const idx = data.mandals.findIndex(m => String(m.MandalId) === String(id));
    if (idx === -1) throw new Error(`Mandal with MandalId ${id} not found`);
    data.mandals[idx] = {
      ...data.mandals[idx],
      ...updates,
      MandalId: data.mandals[idx].MandalId
    };
    this.saveData(data);
    return data.mandals[idx];
  }

  public deleteMandal(id: string): boolean {
    const data = this.getData();
    const strId = String(id);
    const initialLen = data.mandals.length;
    data.mandals = data.mandals.filter(m => String(m.MandalId) !== strId);
    if (data.mandals.length === initialLen) return false;

    // Cascade delete child entities
    const panchayatsToDelete = data.panchayats.filter(p => String(p.MandalId) === strId).map(p => String(p.PanchayatId));
    data.panchayats = data.panchayats.filter(p => String(p.MandalId) !== strId);

    data.villages = data.villages.filter(v => !panchayatsToDelete.includes(String(v.PanchayatId)));

    this.saveData(data);
    return true;
  }

  // ================= PANCHAYAT CRUD =================
  public getPanchayats(mandalId?: string): PanchayatItem[] {
    const list = this.getData().panchayats;
    if (mandalId && mandalId !== 'ALL') {
      return list.filter(p => String(p.MandalId) === String(mandalId));
    }
    return list;
  }

  public getPanchayatById(id: string): PanchayatItem | undefined {
    return this.getData().panchayats.find(p => String(p.PanchayatId) === String(id));
  }

  public createPanchayat(item: { Value: string; Text: string; MandalId: string; PanchayatId?: string }): PanchayatItem {
    const data = this.getData();
    const newId = item.PanchayatId?.trim() || String(Date.now());
    const newPanchayat: PanchayatItem = {
      PanchayatId: newId,
      Value: item.Value.trim(),
      Text: item.Text.trim(),
      MandalId: String(item.MandalId)
    };
    data.panchayats.push(newPanchayat);
    this.saveData(data);
    return newPanchayat;
  }

  public updatePanchayat(id: string, updates: Partial<PanchayatItem>): PanchayatItem {
    const data = this.getData();
    const idx = data.panchayats.findIndex(p => String(p.PanchayatId) === String(id));
    if (idx === -1) throw new Error(`Panchayat with PanchayatId ${id} not found`);
    data.panchayats[idx] = {
      ...data.panchayats[idx],
      ...updates,
      PanchayatId: data.panchayats[idx].PanchayatId
    };
    this.saveData(data);
    return data.panchayats[idx];
  }

  public deletePanchayat(id: string): boolean {
    const data = this.getData();
    const strId = String(id);
    const initialLen = data.panchayats.length;
    data.panchayats = data.panchayats.filter(p => String(p.PanchayatId) !== strId);
    if (data.panchayats.length === initialLen) return false;

    // Cascade delete child villages
    data.villages = data.villages.filter(v => String(v.PanchayatId) !== strId);

    this.saveData(data);
    return true;
  }

  // ================= VILLAGE CRUD =================
  public getVillages(panchayatId?: string): VillageItem[] {
    const list = this.getData().villages;
    if (panchayatId && panchayatId !== 'ALL') {
      return list.filter(v => String(v.PanchayatId) === String(panchayatId));
    }
    return list;
  }

  public getVillageById(id: string): VillageItem | undefined {
    return this.getData().villages.find(v => String(v.VillageId) === String(id));
  }

  public createVillage(item: { Value: string; Text: string; PanchayatId: string; VillageId?: string }): VillageItem {
    const data = this.getData();
    const newId = item.VillageId?.trim() || String(Date.now());
    const newVillage: VillageItem = {
      VillageId: newId,
      Value: item.Value.trim(),
      Text: item.Text.trim(),
      PanchayatId: String(item.PanchayatId)
    };
    data.villages.push(newVillage);
    this.saveData(data);
    return newVillage;
  }

  public updateVillage(id: string, updates: Partial<VillageItem>): VillageItem {
    const data = this.getData();
    const idx = data.villages.findIndex(v => String(v.VillageId) === String(id));
    if (idx === -1) throw new Error(`Village with VillageId ${id} not found`);
    data.villages[idx] = {
      ...data.villages[idx],
      ...updates,
      VillageId: data.villages[idx].VillageId
    };
    this.saveData(data);
    return data.villages[idx];
  }

  public deleteVillage(id: string): boolean {
    const data = this.getData();
    const strId = String(id);
    const initialLen = data.villages.length;
    data.villages = data.villages.filter(v => String(v.VillageId) !== strId);
    if (data.villages.length === initialLen) return false;
    this.saveData(data);
    return true;
  }

  // ================= RELATIONSHIP COUNT HELPERS =================
  public getChildCount(level: 'State' | 'District' | 'Mandal' | 'Panchayat', id: string): number {
    const data = this.getData();
    const strId = String(id);
    switch (level) {
      case 'State':
        return data.districts.filter(d => String(d.StateId) === strId).length;
      case 'District':
        return data.mandals.filter(m => String(m.DistrictId) === strId).length;
      case 'Mandal':
        return data.panchayats.filter(p => String(p.MandalId) === strId).length;
      case 'Panchayat':
        return data.villages.filter(v => String(v.PanchayatId) === strId).length;
      default:
        return 0;
    }
  }
}

export const locationMasterService = new LocationMasterService();
