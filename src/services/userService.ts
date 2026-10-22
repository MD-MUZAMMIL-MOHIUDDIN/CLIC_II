import usersSeed from '../data/users.json';
import { User, UserRole, AccountStatus, ApprovalStatus } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const USERS_KEY = 'users';

class UserService {
  public getAllUsers(): User[] {
    const rawUsers = getInitialData<User[]>(USERS_KEY, usersSeed as User[]);
    const seed = usersSeed as User[];
    let changed = false;

    for (const s of seed) {
      const idx = rawUsers.findIndex(u => u.id === s.id);
      if (idx === -1) {
        rawUsers.push(s);
        changed = true;
      } else if (
        rawUsers[idx].location?.village !== s.location?.village ||
        rawUsers[idx].location?.panchayat !== s.location?.panchayat ||
        rawUsers[idx].fullName !== s.fullName ||
        rawUsers[idx].role !== s.role
      ) {
        rawUsers[idx] = { ...rawUsers[idx], ...s };
        changed = true;
      }
    }

    if (changed) {
      saveStorageData(USERS_KEY, rawUsers);
    }

    return rawUsers.map(u => ({
      ...u,
      roles: u.roles && u.roles.length > 0 ? u.roles : [u.role]
    }));
  }

  public getUserById(id: string): User | undefined {
    return this.getAllUsers().find(u => u.id === id);
  }

  public createUser(userData: {
    fullName: string;
    email: string;
    mobile: string;
    password?: string;
    role?: UserRole;
    roles?: string[];
    approvalStatus: ApprovalStatus;
    accountStatus: AccountStatus;
    location: any;
    organizationName?: string;
    verified?: boolean;
    avatarUrl?: string;
  }): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    if (users.some(u => u.email.toLowerCase() === userData.email.trim().toLowerCase())) {
      return { success: false, error: 'A user with this email address already exists.' };
    }
    if (userData.mobile && users.some(u => u.mobile.trim() === userData.mobile.trim())) {
      return { success: false, error: 'A user with this mobile number already exists.' };
    }

    const assignedRoles = userData.roles && userData.roles.length > 0
      ? userData.roles
      : [userData.role || 'Farmer'];
    const primaryRole = assignedRoles[0] as UserRole;

    const newUser: User = {
      id: `usr_${primaryRole.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`,
      ...userData,
      role: primaryRole,
      roles: assignedRoles,
      profileId: `prof_${Date.now()}`,
      createdAt: new Date().toISOString(),
      avatarUrl: userData.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
      verified: userData.verified ?? true
    };

    users.unshift(newUser);
    saveStorageData(USERS_KEY, users);
    return { success: true, user: newUser };
  }

  public updateUser(userId: string, data: Partial<User>): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'User not found.' };
    }

    if (data.email) {
      const emailConflict = users.some(
        u => u.id !== userId && u.email.toLowerCase() === data.email!.trim().toLowerCase()
      );
      if (emailConflict) {
        return { success: false, error: 'Another user with this email address already exists.' };
      }
    }

    if (data.mobile) {
      const mobileConflict = users.some(
        u => u.id !== userId && u.mobile.trim() === data.mobile!.trim()
      );
      if (mobileConflict) {
        return { success: false, error: 'Another user with this mobile number already exists.' };
      }
    }

    const updatedRoles = data.roles !== undefined
      ? data.roles
      : users[index].roles || [users[index].role];

    const updatedPrimaryRole = data.role !== undefined
      ? data.role
      : (updatedRoles.length > 0 ? updatedRoles[0] : users[index].role);

    users[index] = {
      ...users[index],
      ...data,
      roles: updatedRoles,
      role: updatedPrimaryRole
    };

    saveStorageData(USERS_KEY, users);
    return { success: true, user: users[index] };
  }

  public assignRole(userId: string, roleKey: string): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'User not found.' };
    }

    const currentRoles = users[index].roles || [users[index].role];
    if (currentRoles.includes(roleKey)) {
      return { success: false, error: `Role "${roleKey}" is already assigned to this user.` };
    }

    const updatedRoles = [...currentRoles, roleKey];
    users[index].roles = updatedRoles;
    if (!users[index].role) {
      users[index].role = roleKey as UserRole;
    }

    saveStorageData(USERS_KEY, users);
    return { success: true, user: users[index] };
  }

  public removeRole(userId: string, roleKey: string): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'User not found.' };
    }

    const currentRoles = users[index].roles || [users[index].role];
    if (!currentRoles.includes(roleKey)) {
      return { success: false, error: `User does not have role "${roleKey}".` };
    }

    if (currentRoles.length === 1) {
      return { success: false, error: 'A user must retain at least one role.' };
    }

    const updatedRoles = currentRoles.filter(r => r !== roleKey);
    users[index].roles = updatedRoles;
    if (users[index].role === roleKey) {
      users[index].role = (updatedRoles[0] || 'Farmer') as UserRole;
    }

    saveStorageData(USERS_KEY, users);
    return { success: true, user: users[index] };
  }

  public deleteUser(userId: string): { success: boolean; error?: string } {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'User not found.' };
    }

    users.splice(index, 1);
    saveStorageData(USERS_KEY, users);
    return { success: true };
  }

  public getStats(): {
    totalCount: number;
    activeCount: number;
    suspendedCount: number;
    pendingApprovalCount: number;
  } {
    const users = this.getAllUsers();
    return {
      totalCount: users.length,
      activeCount: users.filter(u => u.accountStatus === 'active').length,
      suspendedCount: users.filter(u => u.accountStatus === 'suspended').length,
      pendingApprovalCount: users.filter(u => u.approvalStatus === 'pending' || u.approvalStatus === 'under_review').length,
    };
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
