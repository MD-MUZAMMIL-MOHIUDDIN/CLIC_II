import usersSeed from '../data/users.json';
import permissionsSeed from '../data/permissions.json';
import { User, UserRole, RegistrationApplication, LocationInfo } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';
import { approvalService } from './approvalService';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';

class AuthService {
  private getUsers(): User[] {
    return getInitialData<User[]>(USERS_KEY, usersSeed as User[]);
  }

  private saveUsers(users: User[]): void {
    saveStorageData(USERS_KEY, users);
  }

  public getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(`krishi_${CURRENT_USER_KEY}`);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch {
      // ignore
    }
    // Default to the first farmer user for immediate interactive exploration
    const defaultUser = this.getUsers()[0];
    if (defaultUser) {
      this.setCurrentUser(defaultUser);
      return defaultUser;
    }
    return null;
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(`krishi_${CURRENT_USER_KEY}`, JSON.stringify(user));
    } else {
      localStorage.removeItem(`krishi_${CURRENT_USER_KEY}`);
    }
  }

  public login(email: string, _password?: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'Invalid credentials. User with this email does not exist.' };
    }

    if (user.approvalStatus === 'pending') {
      return { success: false, user, error: 'Your registration is currently PENDING approval from our verification officers.' };
    }
    if (user.approvalStatus === 'under_review') {
      return { success: false, user, error: 'Your registration is currently UNDER REVIEW by an authorized facilitator.' };
    }
    if (user.approvalStatus === 'corrections_requested') {
      return { success: false, user, error: 'Corrections have been requested for your application. Please update your submitted details.' };
    }
    if (user.approvalStatus === 'rejected') {
      return { success: false, user, error: 'Your registration application was rejected. Please contact support or check application status.' };
    }
    if (user.accountStatus === 'suspended') {
      return { success: false, user, error: 'Your account has been temporarily SUSPENDED due to compliance verification. Please reach out to platform administrators.' };
    }
    if (user.accountStatus === 'inactive') {
      return { success: false, user, error: 'Your account is INACTIVE. Please wait for activation or contact support.' };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  public quickSwitchUser(role: UserRole | 'pending_chc' | 'rejected_fmc' | 'suspended'): User | null {
    const users = this.getUsers();
    let target: User | undefined;

    if (role === 'pending_chc') {
      target = users.find(u => u.id === 'usr_pending_chc');
    } else if (role === 'rejected_fmc') {
      target = users.find(u => u.id === 'usr_rejected_fmc');
    } else if (role === 'suspended') {
      target = users.find(u => u.id === 'usr_suspended_user');
    } else {
      target = users.find(u => u.role === role && u.approvalStatus === 'approved' && u.accountStatus === 'active');
    }

    if (target) {
      this.setCurrentUser(target);
      return target;
    }
    return null;
  }

  public logout(): void {
    this.setCurrentUser(null);
  }

  public registerSelf(params: {
    fullName: string;
    email: string;
    mobile: string;
    requestedRole: 'CHC' | 'FMC' | 'Farmer' | 'LivestockShop' | 'Inputstore';
    organizationName?: string;
    location: LocationInfo;
    roleSpecificData?: Record<string, any>;
    documents?: { type: string; docNumber?: string; fileName: string }[];
  }): { success: boolean; user: User; application: RegistrationApplication; error?: string } {
    const users = this.getUsers();

    if (users.some(u => u.email.toLowerCase() === params.email.trim().toLowerCase())) {
      return {
        success: false,
        error: 'An account with this email address is already registered.',
        user: {} as User,
        application: {} as RegistrationApplication
      };
    }

    const newUserId = `usr_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      fullName: params.fullName,
      email: params.email.trim().toLowerCase(),
      mobile: params.mobile,
      role: params.requestedRole,
      approvalStatus: 'pending',
      accountStatus: 'inactive',
      location: params.location,
      profileId: `prof_${Date.now()}`,
      organizationName: params.organizationName || params.fullName,
      createdAt: new Date().toISOString(),
      verified: false
    };

    users.push(newUser);
    this.saveUsers(users);

    const application = approvalService.createApplication({
      userId: newUserId,
      applicantName: params.fullName,
      applicantEmail: params.email,
      applicantMobile: params.mobile,
      requestedRole: params.requestedRole,
      organizationName: params.organizationName,
      location: params.location,
      documents: params.documents,
      roleSpecificData: params.roleSpecificData
    });

    return { success: true, user: newUser, application };
  }

  public hasPermission(role: UserRole, permission: string): boolean {
    const rolesMap = (permissionsSeed as any).roles as Record<string, string[]>;
    const allowed = rolesMap[role] || [];
    return allowed.includes(permission) || role === 'superadmin';
  }
}

export const authService = new AuthService();
