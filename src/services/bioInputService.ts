import bioInputsSeed from '../data/bio-inputs.json';
import { BioInput } from '../types';
import { getInitialData } from './storageHelper';

const BIO_KEY = 'bio_inputs';

class BioInputService {
  public getAllBioInputs(): BioInput[] {
    return getInitialData<BioInput[]>(BIO_KEY, bioInputsSeed as BioInput[]);
  }

  public getBioInputById(id: string): BioInput | undefined {
    return this.getAllBioInputs().find(b => b.id === id);
  }

  public getAdvisoryRecommendations(criteria: {
    crop?: string;
    growthStage?: string;
    symptoms?: string;
    category?: string;
  }): { recommendations: BioInput[]; cautionNote?: string } {
    const all = this.getAllBioInputs();
    let matches: BioInput[] = [];

    if (criteria.category && criteria.category !== 'All') {
      matches = all.filter(b => b.category === criteria.category);
    } else if (criteria.crop || criteria.symptoms || criteria.growthStage) {
      matches = all.filter(b => {
        let score = 0;
        if (criteria.crop && b.suitableCrops.some(c => c.toLowerCase().includes(criteria.crop!.toLowerCase()) || c === 'All Field Crops')) {
          score += 2;
        }
        if (criteria.growthStage && b.growthStages.some(g => g.toLowerCase().includes(criteria.growthStage!.toLowerCase()))) {
          score += 1;
        }
        if (criteria.symptoms) {
          const sym = criteria.symptoms.toLowerCase();
          if (b.intendedPurpose.toLowerCase().includes(sym) || b.scientificBasis.toLowerCase().includes(sym)) {
            score += 3;
          }
        }
        return score > 0;
      });
    }

    if (matches.length === 0) {
      matches = all.slice(0, 3);
    }

    const cautionNote = "Biological solutions are preventive and eco-protective. For severe pest outbreaks exceeding economic thresholds or uncertain symptoms, an immediate consultation with an agricultural scientist or plant pathologist is strongly recommended.";

    return { recommendations: matches, cautionNote };
  }
}

export const bioInputService = new BioInputService();
