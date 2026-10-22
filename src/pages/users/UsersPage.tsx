import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserCRUD } from '../../components/users/UserCRUD';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import {
  Users,
  Shield,
  ChevronRight,
  UserCheck,
  KeyRound,
  Sparkles
} from 'lucide-react';

export const UsersPage: React.FC = () => {
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
            <span className="capitalize font-bold text-forest-900">Users Master</span>
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-forest-600 text-white shadow-subtle">
              <Users className="w-6 h-6 text-harvest" />
            </span>
            Users & Account Credentials
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Create, update, and manage portal users with registered email, mobile, password, and assigned administrative roles.
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
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-forest-100 text-forest-800 font-mono font-bold">
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
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cream-200 text-brand-muted font-mono font-bold">
            {roleStats.totalCount}
          </span>
        </NavLink>
      </div>

      {/* User CRUD Component */}
      <UserCRUD />
    </div>
  );
};
