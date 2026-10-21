import registrationsSeed from '../data/registrations.json';
import usersSeed from '../data/users.json';
import { RegistrationApplication, ApprovalStatus, User } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const REG_KEY = 'registrations';
const USERS_KEY = 'users';

class ApprovalService {
  public getApplications(): RegistrationApplication[] {
    return getInitialData<RegistrationApplication[]>(REG_KEY, registrationsSeed as RegistrationApplication[]);
  }

  private saveApplications(apps: RegistrationApplication[]): void {
    saveStorageData(REG_KEY, apps);
  }

  public getApplicationById(id: string): RegistrationApplication | undefined {
    return this.getApplications().find(a => a.id === id);
  }

  public getApplicationByUserId(userId: string): RegistrationApplication | undefined {
    return this.getApplications().find(a => a.userId === userId);
  }

  public createApplication(data: Omit<RegistrationApplication, 'id' | 'status' | 'submittedAt'>): RegistrationApplication {
    const apps = this.getApplications();
    const newApp: RegistrationApplication = {
      ...data,
      id: `app_${Date.now().toString().slice(-4)}`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    apps.unshift(newApp);
    this.saveApplications(apps);
    return newApp;
  }

  public reviewApplication(params: {
    applicationId: string;
    reviewerId: string;
    action: 'approve' | 'reject' | 'request_corrections' | 'mark_under_review';
    decisionReason?: string;
  }): { success: boolean; application?: RegistrationApplication; error?: string } {
    const apps = this.getApplications();
    const appIndex = apps.findIndex(a => a.id === params.applicationId);
    if (appIndex === -1) {
      return { success: false, error: 'Registration application not found.' };
    }

    const app = apps[appIndex];
    let newStatus: ApprovalStatus = app.status;

    if (params.action === 'approve') {
      newStatus = 'approved';
    } else if (params.action === 'reject') {
      if (!params.decisionReason || params.decisionReason.trim().length < 5) {
        return { success: false, error: 'A valid reason is required when rejecting an application.' };
      }
      newStatus = 'rejected';
    } else if (params.action === 'request_corrections') {
      if (!params.decisionReason || params.decisionReason.trim().length < 5) {
        return { success: false, error: 'Detailed correction notes are required for the applicant.' };
      }
      newStatus = 'corrections_requested';
    } else if (params.action === 'mark_under_review') {
      newStatus = 'under_review';
    }

    app.status = newStatus;
    app.reviewedBy = params.reviewerId;
    app.reviewedAt = new Date().toISOString();
    app.decisionReason = params.decisionReason || app.decisionReason;

    apps[appIndex] = app;
    this.saveApplications(apps);

    // Synchronize user record in users.json
    const users = getInitialData<User[]>(USERS_KEY, usersSeed as User[]);
    const userIndex = users.findIndex(u => u.id === app.userId);
    if (userIndex !== -1) {
      users[userIndex].approvalStatus = newStatus;
      if (newStatus === 'approved') {
        users[userIndex].accountStatus = 'active';
        users[userIndex].verified = true;
      } else if (newStatus === 'rejected') {
        users[userIndex].accountStatus = 'inactive';
      }
      users[userIndex].reviewedAt = app.reviewedAt;
      users[userIndex].reviewedBy = params.reviewerId;
      saveStorageData(USERS_KEY, users);
    }

    return { success: true, application: app };
  }

  public updateApplicationCorrections(applicationId: string, updatedFields: Partial<RegistrationApplication>): { success: boolean; application?: RegistrationApplication } {
    const apps = this.getApplications();
    const appIndex = apps.findIndex(a => a.id === applicationId);
    if (appIndex === -1) return { success: false };

    apps[appIndex] = {
      ...apps[appIndex],
      ...updatedFields,
      status: 'pending', // Re-enter review queue
      submittedAt: new Date().toISOString()
    };
    this.saveApplications(apps);
    return { success: true, application: apps[appIndex] };
  }
}

export const approvalService = new ApprovalService();
