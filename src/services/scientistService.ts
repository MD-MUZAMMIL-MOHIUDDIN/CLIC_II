import scientistsSeed from '../data/scientists.json';
import { ScientistProfile } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const SCIENTISTS_KEY = 'scientists';

class ScientistService {
  public getAllScientists(): ScientistProfile[] {
    return getInitialData<ScientistProfile[]>(SCIENTISTS_KEY, scientistsSeed as ScientistProfile[]);
  }

  public getScientistById(id: string): ScientistProfile | undefined {
    return this.getAllScientists().find(s => s.id === id);
  }

  public searchScientists(params: {
    query?: string;
    domain?: string;
    format?: string;
    language?: string;
  }): ScientistProfile[] {
    let list = this.getAllScientists();

    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.institution.toLowerCase().includes(q) ||
        s.specialization.toLowerCase().includes(q) ||
        s.about.toLowerCase().includes(q)
      );
    }
    if (params.domain && params.domain !== 'All') {
      list = list.filter(s => s.domain === params.domain);
    }
    if (params.format && params.format !== 'All') {
      list = list.filter(s => s.consultationFormats.includes(params.format as any));
    }
    if (params.language && params.language !== 'All') {
      list = list.filter(s => s.languages.includes(params.language!));
    }
    return list;
  }
}

export const scientistService = new ScientistService();
