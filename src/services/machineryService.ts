import machinerySeed from '../data/farm-machinery.json';
import { FarmMachinery, MachineryCategory, PricingUnit } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const MACHINERY_KEY = 'machinery';

class MachineryService {
  public getAllMachinery(): FarmMachinery[] {
    return getInitialData<FarmMachinery[]>(MACHINERY_KEY, machinerySeed as unknown as FarmMachinery[]);
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

  public addMachinery(machineryData: Omit<FarmMachinery, 'id'>): FarmMachinery {
    const list = this.getAllMachinery();
    const newMach: FarmMachinery = {
      ...machineryData,
      id: `mach_${Date.now().toString().slice(-4)}`
    };
    list.unshift(newMach);
    saveStorageData(MACHINERY_KEY, list);
    return newMach;
  }

  public updateMachinery(id: string, updates: Partial<FarmMachinery>): boolean {
    const list = this.getAllMachinery();
    const index = list.findIndex(m => m.id === id);
    if (index === -1) return false;
    list[index] = { ...list[index], ...updates };
    saveStorageData(MACHINERY_KEY, list);
    return true;
  }
}

export const machineryService = new MachineryService();
