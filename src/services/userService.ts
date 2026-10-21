import usersSeed from '../data/users.json';
import { User, UserRole, AccountStatus, ApprovalStatus } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const USERS_KEY = 'users';

class UserService {
  public getAllUsers(): User[] {
    return getInitialData<User[]>(USERS_KEY, usersSeed as User[]);
  }

  public getUserById(id: string): User | undefined {
    return this.getAllUsers().find(u => u.id === id);
  }

  public createUser(userData: {
    fullName: string;
    email: string;
    mobile: string;
    role: UserRole;
    approvalStatus: ApprovalStatus;
    accountStatus: AccountStatus;
    location: any;
    organizationName?: string;
    verified?: boolean;
  }): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    if (users.some(u => u.email.toLowerCase() === userData.email.trim().toLowerCase())) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    const newUser: User = {
      id: `usr_${userData.role.toLowerCase()}_${Date.now().toString().slice(-4)}`,
      ...userData,
      profileId: `prof_${Date.now()}`,
      createdAt: new Date().toISOString(),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`
    };

    users.unshift(newUser);
    saveStorageData(USERS_KEY, users);
    return { success: true, user: newUser };
  }

  public updateUserStatus(userId: string, accountStatus: AccountStatus, approvalStatus?: ApprovalStatus): boolean {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;

    users[index].accountStatus = accountStatus;
    if (approvalStatus) {
      users[index].approvalStatus = approvalStatus;
    }
    saveStorageData(USERS_KEY, users);
    return true;
  }

  public updateProfile(userId: string, data: Partial<User>): boolean {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;

    users[index] = { ...users[index], ...data };
    saveStorageData(USERS_KEY, users);
    return true;
  }
}

export const userService = new UserService();
