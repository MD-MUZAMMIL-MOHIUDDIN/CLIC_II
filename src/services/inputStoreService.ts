import storesSeed from '../data/input-stores.json';
import { getInitialData, saveStorageData } from './storageHelper';

const STORES_KEY = 'input_stores';

class InputStoreService {
  public getAllStores(): any[] {
    return getInitialData<any[]>(STORES_KEY, storesSeed);
  }

  public getStoreById(id: string): any | undefined {
    return this.getAllStores().find(s => s.id === id);
  }

  public getStoreByUserId(userId: string): any | undefined {
    return this.getAllStores().find(s => s.userId === userId);
  }
}

export const inputStoreService = new InputStoreService();
