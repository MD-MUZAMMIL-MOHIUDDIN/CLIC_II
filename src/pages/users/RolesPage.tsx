import React from 'react';
import { NavLink } from 'react-router-dom';
import { RoleCRUD } from '../../components/users/RoleCRUD';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import {
  Users,
  Shield,
  ChevronRight,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

export const RolesPage: React.FC = () => {
  const userStats = userService.getStats();
  const roleStats = roleService.getStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-muted mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-brand-muted/60" />
            <span className="text-forest-700 font-semibold uppercase tracking-wider text-[11px]">User Management</span>
            <ChevronRight className="w-3.5 h-3.5 text-brand-muted/60" />
            <span className="capitalize font-bold text-forest-900">Roles Master</span>
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-forest-600 text-white shadow-subtle">
              <Shield className="w-6 h-6 text-harvest" />
            </span>
            Roles Master
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Configure system roles, custom authorization tiers, and manage role identifiers across portal users.
          </p>
        </div>
      </div>

      {/* Tabs Switcher for Users and Roles */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-px">
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              isActive
                ? 'border-forest-600 text-forest-900 bg-forest-50/50 rounded-t-xl'
                : 'border-transparent text-brand-muted hover:text-forest-800 hover:bg-cream-100/50 rounded-t-xl'
            }`
          }
        >
          <Users className="w-4 h-4 text-forest-600" />
          <span>Users</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cream-200 text-brand-muted font-mono font-bold">
            {userStats.totalCount}
          </span>
        </NavLink>

        <NavLink
          to="/roles"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              isActive
                ? 'border-forest-600 text-forest-900 bg-forest-50/50 rounded-t-xl'
                : 'border-transparent text-brand-muted hover:text-forest-800 hover:bg-cream-100/50 rounded-t-xl'
            }`
          }
        >
          <Shield className="w-4 h-4 text-forest-600" />
          <span>Roles</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-forest-100 text-forest-800 font-mono font-bold">
            {roleStats.totalCount}
          </span>
        </NavLink>
      </div>

      {/* Role CRUD Component */}
      <RoleCRUD />
    </div>
  );
};
