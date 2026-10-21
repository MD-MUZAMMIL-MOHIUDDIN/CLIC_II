import chcSeed from '../data/chc-centres.json';
import { CHCCentre } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const CHC_KEY = 'chc_centres';

class CHCService {
  public getAllCentres(): CHCCentre[] {
    return getInitialData<CHCCentre[]>(CHC_KEY, chcSeed as CHCCentre[]);
  }

  public getCentreById(id: string): CHCCentre | undefined {
    return this.getAllCentres().find(c => c.id === id);
  }

  public getCentreByUserId(userId: string): CHCCentre | undefined {
    return this.getAllCentres().find(c => c.userId === userId);
  }

  public searchCentres(params: {
    query?: string;
    state?: string;
    district?: string;
    verifiedOnly?: boolean;
    minRating?: number;
  }): CHCCentre[] {
    let list = this.getAllCentres();

    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(c =>
        c.centreName.toLowerCase().includes(q) ||
        c.location.district.toLowerCase().includes(q) ||
        c.location.state.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    if (params.state && params.state !== 'All') {
      list = list.filter(c => c.location.state === params.state);
    }
    if (params.district && params.district !== 'All') {
      list = list.filter(c => c.location.district === params.district);
    }
    if (params.verifiedOnly) {
      list = list.filter(c => c.verified);
    }
    if (params.minRating) {
      list = list.filter(c => c.rating >= params.minRating!);
    }
    return list;
  }

  public updateCentre(id: string, data: Partial<CHCCentre>): boolean {
    const list = this.getAllCentres();
    const index = list.findIndex(c => c.id === id);
    if (index === -1) return false;
    list[index] = { ...list[index], ...data };
    saveStorageData(CHC_KEY, list);
    return true;
  }
}

export const chcService = new CHCService();
