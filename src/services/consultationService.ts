import consultationsSeed from '../data/consultations.json';
import { Consultation } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const CONSULTATIONS_KEY = 'consultations';

class ConsultationService {
  public getAllConsultations(): Consultation[] {
    return getInitialData<Consultation[]>(CONSULTATIONS_KEY, consultationsSeed as Consultation[]);
  }

  public getConsultationsByFarmerId(farmerId: string): Consultation[] {
    return this.getAllConsultations().filter(c => c.farmerId === farmerId);
  }

  public getConsultationsByScientistId(scientistId: string): Consultation[] {
    return this.getAllConsultations().filter(c => c.scientistId === scientistId);
  }

  public createConsultation(data: Omit<Consultation, 'id' | 'submittedAt' | 'status'>): Consultation {
    const list = this.getAllConsultations();
    const newConsultation: Consultation = {
      ...data,
      id: `cns_${Date.now().toString().slice(-4)}`,
      status: 'Submitted',
      submittedAt: new Date().toISOString()
    };
    list.unshift(newConsultation);
    saveStorageData(CONSULTATIONS_KEY, list);
    return newConsultation;
  }

  public respondToConsultation(consultationId: string, responseNotes: string, prescribedBioInputs: string[] = []): boolean {
    const list = this.getAllConsultations();
    const idx = list.findIndex(c => c.id === consultationId);
    if (idx === -1) return false;

    list[idx].status = 'Responded';
    list[idx].responseNotes = responseNotes;
    list[idx].prescribedBioInputs = prescribedBioInputs;
    list[idx].respondedAt = new Date().toISOString();
    saveStorageData(CONSULTATIONS_KEY, list);
    return true;
  }

  public updateStatus(consultationId: string, status: 'Submitted' | 'Under Review' | 'Scheduled' | 'Responded' | 'Closed'): boolean {
    const list = this.getAllConsultations();
    const idx = list.findIndex(c => c.id === consultationId);
    if (idx === -1) return false;

    list[idx].status = status;
    saveStorageData(CONSULTATIONS_KEY, list);
    return true;
  }
}

export const consultationService = new ConsultationService();
