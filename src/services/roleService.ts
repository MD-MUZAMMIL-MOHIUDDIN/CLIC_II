import { Role } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const ROLES_KEY = 'roles';

const SEED_ROLES: Role[] = [
  {
    id: 'role_superadmin',
    roleKey: 'superadmin',
    roleName: 'Super Administrator',
    description: 'Supreme platform administration, architecture controls, and system governance.',
    status: 'active',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_admin',
    roleKey: 'Admin',
    roleName: 'System Administrator',
    description: 'Administrative command for user onboarding, master data records, and operational monitoring.',
    status: 'active',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_farmer',
    roleKey: 'Farmer',
    roleName: 'Farmer / Cultivator',
    description: 'Primary producer accessing equipment rentals, agro-advisories, and input procurement.',
    status: 'active',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_chc',
    roleKey: 'CHC',
    roleName: 'Custom Hiring Centre',
    description: 'Operator managing village custom hiring equipment fleets and rental dispatches.',
    status: 'active',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_fmc',
    roleKey: 'FMC',
    roleName: 'Farm Machinery Centre',
    description: 'Heavy machinery manager for laser land levelers, combine harvesters, and implements.',
    status: 'active',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_livestock',
    roleKey: 'LivestockShop',
    roleName: 'Livestock Shop Partner',
    description: 'Distributor of cattle breeds, balanced livestock nutrition feed, and veterinary supplies.',
    status: 'active',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_inputstore',
    roleKey: 'Inputstore',
    roleName: 'Agri Input Dealer',
    description: 'Retailer and cooperative store maintaining certified seeds, bio-fertilizers, and organic inputs.',
    status: 'active',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_facilitator',
    roleKey: 'Facilitator',
    roleName: 'Field Facilitator',
    description: 'Ground extension officer verifying farmer onboarding applications and documents.',
    status: 'active',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_scientist',
    roleKey: 'Scientist',
    roleName: 'Agricultural Scientist',
    description: 'KVK & University researcher diagnosing crop problems and authoring IPM recommendations.',
    status: 'active',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_meeting_coordinator',
    roleKey: 'meetingcoordinator',
    roleName: 'Meeting Coordinator',
    description: 'Coordinates village-level kisan meetings, extension programs, and field demonstrations.',
    status: 'active',
    isSystem: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

class RoleService {
  public getAllRoles(): Role[] {
    return getInitialData<Role[]>(ROLES_KEY, SEED_ROLES);
  }

  public getRoleById(id: string): Role | undefined {
    return this.getAllRoles().find(r => r.id === id);
  }

  public getRoleByKey(key: string): Role | undefined {
    return this.getAllRoles().find(r => r.roleKey.toLowerCase() === key.toLowerCase());
  }

  public createRole(roleData: {
    roleKey: string;
    roleName: string;
    description: string;
    status?: 'active' | 'inactive';
  }): { success: boolean; role?: Role; error?: string } {
    const roles = this.getAllRoles();
    const cleanKey = roleData.roleKey.trim();

    if (!cleanKey) {
      return { success: false, error: 'Role Key is required.' };
    }

    if (roles.some(r => r.roleKey.toLowerCase() === cleanKey.toLowerCase())) {
      return { success: false, error: `A role with key "${cleanKey}" already exists.` };
    }

    const newRole: Role = {
      id: `role_${cleanKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`,
      roleKey: cleanKey,
      roleName: roleData.roleName.trim(),
      description: roleData.description.trim(),
      status: roleData.status || 'active',
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    roles.push(newRole);
    saveStorageData(ROLES_KEY, roles);
    return { success: true, role: newRole };
  }

  public updateRole(id: string, updates: Partial<Role>): { success: boolean; role?: Role; error?: string } {
    const roles = this.getAllRoles();
    const index = roles.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Role not found.' };
    }

    if (updates.roleKey) {
      const cleanKey = updates.roleKey.trim();
      const conflict = roles.some(
        r => r.id !== id && r.roleKey.toLowerCase() === cleanKey.toLowerCase()
      );
      if (conflict) {
        return { success: false, error: `Another role with key "${cleanKey}" already exists.` };
      }
    }

    roles[index] = {
      ...roles[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveStorageData(ROLES_KEY, roles);
    return { success: true, role: roles[index] };
  }

  public deleteRole(id: string): { success: boolean; error?: string } {
    const roles = this.getAllRoles();
    const index = roles.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Role not found.' };
    }

    if (roles[index].isSystem) {
      return { success: false, error: 'System roles cannot be deleted as they are required by core platform modules.' };
    }

    roles.splice(index, 1);
    saveStorageData(ROLES_KEY, roles);
    return { success: true };
  }

  public getStats(): {
    totalCount: number;
    activeCount: number;
    systemCount: number;
    customCount: number;
  } {
    const roles = this.getAllRoles();
    return {
      totalCount: roles.length,
      activeCount: roles.filter(r => r.status === 'active').length,
      systemCount: roles.filter(r => r.isSystem).length,
      customCount: roles.filter(r => !r.isSystem).length,
    };
  }
}

export const roleService = new RoleService();
