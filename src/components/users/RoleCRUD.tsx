import React, { useState } from 'react';
import { roleService } from '../../services/roleService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Role } from '../../types';
import {
  Shield,
  ShieldAlert,
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Users,
  CheckCircle2,
  X,
  Filter,
  Sparkles
} from 'lucide-react';

export const RoleCRUD: React.FC = () => {
  const { showToast } = useToast();

  const [roles, setRoles] = useState<Role[]>(() => roleService.getAllRoles());
  const [users, setUsers] = useState(() => userService.getAllUsers());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'system' | 'custom'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<Role | null>(null);

  // Form states
  const [roleKey, setRoleKey] = useState('');
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const refreshData = () => {
    setRoles(roleService.getAllRoles());
    setUsers(userService.getAllUsers());
  };

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setRoleKey('');
    setRoleName('');
    setDescription('');
    setStatus('active');
    setModalOpen(true);
  };

  const handleOpenEditModal = (role: Role) => {
    setEditingRole(role);
    setRoleKey(role.roleKey);
    setRoleName(role.roleName);
    setDescription(role.description);
    setStatus(role.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleName.trim()) {
      showToast('Validation Error', 'Role Name is required.', 'error');
      return;
    }
    if (!roleKey.trim()) {
      showToast('Validation Error', 'Role Key is required.', 'error');
      return;
    }

    if (editingRole) {
      const res = roleService.updateRole(editingRole.id, {
        roleName: roleName.trim(),
        roleKey: editingRole.isSystem ? editingRole.roleKey : roleKey.trim(),
        description: description.trim(),
        status
      });

      if (!res.success) {
        showToast('Update Failed', res.error || 'Failed to update role.', 'error');
        return;
      }
      showToast('Role Updated', `Role ${roleName} was updated successfully.`, 'success');
    } else {
      const res = roleService.createRole({
        roleKey: roleKey.trim(),
        roleName: roleName.trim(),
        description: description.trim(),
        status
      });

      if (!res.success) {
        showToast('Creation Failed', res.error || 'Failed to create role.', 'error');
        return;
      }
      showToast('Role Created', `New role ${roleName} added successfully.`, 'success');
    }

    setModalOpen(false);
    refreshData();
  };

  const handleDeleteRole = () => {
    if (!deleteConfirmRole) return;

    // Check if users currently use this role
    const assignedCount = users.filter(u => (u.roles && u.roles.includes(deleteConfirmRole.roleKey)) || u.role === deleteConfirmRole.roleKey).length;
    if (assignedCount > 0) {
      showToast(
        'Cannot Delete Role',
        `There are ${assignedCount} active user(s) assigned to this role. Please re-assign them first.`,
        'error'
      );
      setDeleteConfirmRole(null);
      return;
    }

    const res = roleService.deleteRole(deleteConfirmRole.id);
    if (!res.success) {
      showToast('Delete Failed', res.error || 'Failed to delete role.', 'error');
      return;
    }

    showToast('Role Deleted', `Role ${deleteConfirmRole.roleName} was deleted.`, 'success');
    setDeleteConfirmRole(null);
    refreshData();
  };

  const filteredRoles = roles.filter((r) => {
    if (typeFilter === 'system' && !r.isSystem) return false;
    if (typeFilter === 'custom' && r.isSystem) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = r.roleName.toLowerCase().includes(q);
      const matchKey = r.roleKey.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      return matchName || matchKey || matchDesc;
    }
    return true;
  });

  const stats = roleService.getStats();

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-brand-border bg-white shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-forest-50 text-forest-700">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cream-200 text-brand-muted">
              Total
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-forest-900">{stats.totalCount}</div>
          <div className="text-xs font-semibold text-brand-muted mt-0.5">Defined Roles</div>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
              Active
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-emerald-950">{stats.activeCount}</div>
          <div className="text-xs font-semibold text-emerald-800 mt-0.5">Active Roles</div>
        </div>

        <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <Lock className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
              Core
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-purple-950">{stats.systemCount}</div>
          <div className="text-xs font-semibold text-purple-800 mt-0.5">System Roles</div>
        </div>

        <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
              Custom
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-blue-950">{stats.customCount}</div>
          <div className="text-xs font-semibold text-blue-800 mt-0.5">Custom Extensions</div>
        </div>
      </div>

      {/* Action Header & Search Controls */}
      <div className="p-4 rounded-2xl border border-brand-border bg-white shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles by title, key, description..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-brand-border bg-cream-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters & Add Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-cream-50 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
            <Filter className="w-3.5 h-3.5 text-forest-600" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent font-medium text-brand-text focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="system">System Roles</option>
              <option value="custom">Custom Roles</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-cream-50 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-medium text-brand-text focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Add Role Button */}
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-forest-600 hover:bg-forest-700 text-white shadow-subtle transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Role</span>
          </button>
        </div>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-brand-border p-12 text-center text-brand-muted">
            <ShieldAlert className="w-8 h-8 mx-auto text-brand-muted/40 mb-2" />
            <p className="font-semibold text-sm text-forest-900">No roles found matching your search.</p>
            <p className="text-xs text-brand-muted mt-1">Try refining your search keyword or clearing the filters.</p>
          </div>
        ) : (
          filteredRoles.map((role) => {
            const userCount = users.filter(u => (u.roles && u.roles.includes(role.roleKey)) || u.role === role.roleKey).length;
            const isActive = role.status === 'active';

            return (
              <div
                key={role.id}
                className="bg-white rounded-2xl border border-brand-border shadow-subtle hover:shadow-card transition-all flex flex-col p-5 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      role.isSystem
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-forest-100 text-forest-800 border border-forest-200'
                    }`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-forest-900 group-hover:text-forest-700 transition-colors">
                        {role.roleName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] bg-cream-100 text-forest-800 px-1.5 py-0.2 rounded font-semibold border border-cream-200">
                          {role.roleKey}
                        </span>
                        {role.isSystem ? (
                          <span className="text-[9.5px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                            System
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-cream-200 text-brand-muted'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-brand-muted'}`} />
                    <span className="capitalize">{role.status}</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-brand-muted leading-relaxed line-clamp-3 my-2 flex-1">
                  {role.description}
                </p>

                {/* Metrics bar: Users Count */}
                <div className="py-2 px-3 rounded-xl bg-cream-50/80 border border-cream-200 my-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-forest-900 font-semibold">
                    <Users className="w-3.5 h-3.5 text-forest-600" />
                    <span>{userCount} Users Assigned</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-brand-border mt-2 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(role)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cream-100 hover:bg-forest-50 text-forest-800 hover:text-forest-900 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Role</span>
                  </button>
                  {!role.isSystem && (
                    <button
                      onClick={() => setDeleteConfirmRole(role)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT ROLE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-brand-border bg-cream-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-subtle">
                  {editingRole ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-forest-900">
                    {editingRole ? `Edit Role: ${editingRole.roleName}` : 'Create New System Role'}
                  </h3>
                  <p className="text-[11px] text-brand-muted">
                    Configure role name, unique role key, and operational description.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-text hover:bg-cream-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Role Name */}
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Role Name <span className="text-brand-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Field Extension Officer"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>

                {/* Role Key */}
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Role Key (Identifier) <span className="text-brand-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingRole?.isSystem}
                    value={roleKey}
                    onChange={(e) => setRoleKey(e.target.value)}
                    placeholder="e.g. FieldOfficer"
                    className={`w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-forest-500 focus:outline-none font-mono ${
                      editingRole?.isSystem ? 'bg-cream-100 text-brand-muted cursor-not-allowed' : ''
                    }`}
                  />
                  {editingRole?.isSystem && (
                    <span className="text-[10px] text-purple-700 font-medium">System role keys cannot be changed.</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">Role Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline responsibilities and purpose of this role..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">Role Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                >
                  <option value="active">Active (Available for user assignment)</option>
                  <option value="inactive">Inactive (Disabled)</option>
                </select>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-brand-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-brand-border text-brand-muted hover:text-brand-text hover:bg-cream-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-forest-600 hover:bg-forest-700 text-white shadow-subtle transition-all"
                >
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border p-6 max-w-sm w-full animate-scale-up">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-extrabold text-base text-forest-900">Delete Role</h4>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              Are you sure you want to permanently delete custom role <strong className="text-forest-900">{deleteConfirmRole.roleName}</strong> ({deleteConfirmRole.roleKey})?
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmRole(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-brand-border text-brand-muted hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-subtle"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
