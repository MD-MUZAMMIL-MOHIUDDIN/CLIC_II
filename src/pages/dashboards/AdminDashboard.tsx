import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { approvalService } from '../../services/approvalService';
import { chcService } from '../../services/chcService';
import { machineryService } from '../../services/machineryService';
import { useToast } from '../../context/ToastContext';
import { useLocation } from '../../context/LocationContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { User, UserRole, AccountStatus, ApprovalStatus } from '../../types';
import {
  ShieldAlert,
  Users,
  Search,
  UserPlus,
  BarChart3,
  CheckCircle,
  XCircle,
  Building2,
  Tractor,
  Layers,
  ArrowRight,
  ShieldCheck,
  Power
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { availableStates, availableDistricts } = useLocation();

  const [users, setUsers] = useState<User[]>(() => userService.getAllUsers());
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Method A: Admin Add User Modal
  const [addUserModalOpen, setAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('CHC');
  const [newOrgName, setNewOrgName] = useState('');
  const [newState, setNewState] = useState('Madhya Pradesh');
  const [newDistrict, setNewDistrict] = useState('Indore');
  const [newAccountStatus, setNewAccountStatus] = useState<AccountStatus>('active');
  const [newApprovalStatus, setNewApprovalStatus] = useState<ApprovalStatus>('approved');

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter !== 'All' && u.accountStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleStatus = (user: User) => {
    const nextStatus: AccountStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
    userService.updateUserStatus(user.id, nextStatus);
    setUsers(userService.getAllUsers());
    showToast(
      nextStatus === 'suspended' ? 'Account Suspended' : 'Account Re-Activated',
      `User ${user.fullName} is now ${nextStatus}.`,
      nextStatus === 'suspended' ? 'error' : 'success'
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = userService.createUser({
      fullName: newFullName,
      email: newEmail,
      mobile: newMobile,
      role: newRole,
      organizationName: newOrgName,
      approvalStatus: newApprovalStatus,
      accountStatus: newAccountStatus,
      location: {
        state: newState,
        district: newDistrict,
        block: 'Central Admin Block',
        village: 'Administrative HQ'
      },
      verified: newApprovalStatus === 'approved'
    });

    if (res.success && res.user) {
      setUsers(userService.getAllUsers());
      setAddModalOpen(false);
      showToast('User Created by Admin', `Profile created for ${res.user.fullName} (${res.user.role}).`, 'success');
      // Reset form
      setNewFullName('');
      setNewEmail('');
      setNewMobile('');
      setNewOrgName('');
    } else {
      alert(res.error || 'Failed to create user.');
    }
  };

  // Recharts Data
  const monthlyData = [
    { month: 'Jun', bookings: 420 },
    { month: 'Jul', bookings: 680 },
    { month: 'Aug', bookings: 950 },
    { month: 'Sep', bookings: 1240 },
    { month: 'Oct (Rabi)', bookings: 1820 },
  ];

  const roleDistribution = [
    { name: 'Farmers', count: 64, color: '#4F8A52' },
    { name: 'CHCs', count: 18, color: '#245C3A' },
    { name: 'FMCs', count: 8, color: '#3A6B3D' },
    { name: 'Livestock', count: 6, color: '#9B6A43' },
    { name: 'Input Stores', count: 4, color: '#8CBF66' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-900 text-white flex items-center justify-center font-bold shadow-subtle shrink-0">
            <ShieldAlert className="w-8 h-8 text-harvest" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                {currentUser?.role === 'superadmin' ? 'Superadmin Directorate' : 'Platform Administration'}
              </span>
              <span className="text-xs text-brand-muted">
                National Governance Console
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              KrishiSeva Administrative Console
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Authorized supervision of user roles, provider verification, machinery listings, and ecosystem audits.
            </p>
          </div>
        </div>

        {/* Method A: Add User CTA */}
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-heading font-bold text-xs shadow-subtle transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User Profile (Method A)</span>
        </button>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-brand-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-heading font-bold text-sm text-forest-900">
              Monthly Machinery Bookings (Volume Trend)
            </h3>
            <span className="text-[11px] font-bold text-forest-700">Rabi Surge (+46%)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#66736A" fontSize={11} />
                <YAxis stroke="#66736A" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E1E7DF' }}
                />
                <Bar dataKey="bookings" fill="#245C3A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-brand-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-heading font-bold text-sm text-forest-900">
              Platform Role Distribution
            </h3>
            <span className="text-[11px] font-semibold text-brand-muted">Active Users</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.name}
                  fontSize={10}
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-forest-900">
              Platform User Management
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Manage accounts, assign roles, enforce suspension policies, and inspect registration verification.
            </p>
          </div>

          <div className="text-xs text-brand-muted">
            Displaying <strong>{filteredUsers.length}</strong> registered users
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
            >
              <option value="All">All User Roles</option>
              <option value="Farmer">Farmer</option>
              <option value="CHC">Custom Hiring Centre (CHC)</option>
              <option value="FMC">Farm Machinery Centre (FMC)</option>
              <option value="LivestockShop">Livestock Shop</option>
              <option value="Inputstore">Input Store</option>
              <option value="Facilitator">Facilitator</option>
              <option value="Admin">Administrator</option>
              <option value="superadmin">Super Administrator</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
            >
              <option value="All">All Account Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">User Profile</th>
                <th className="py-3 px-3">Assigned Role</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Approval</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 px-3 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-cream-50/50">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-forest-900">{u.fullName}</div>
                    <div className="text-[11px] text-brand-muted">{u.email} • {u.mobile}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-brand-muted">
                    {u.location.district}, {u.location.state}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={u.approvalStatus} />
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={u.accountStatus} />
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {u.role !== 'superadmin' && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          u.accountStatus === 'active'
                            ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* METHOD A: Admin Add User Modal */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                  Method A: Administrative Account Creation
                </span>
                <h3 className="font-heading font-bold text-lg text-forest-900 mt-1">
                  Add User Profile & Assign Role
                </h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-brand-muted hover:text-brand-text">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Balwinder Singh"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-text mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="balwinder@krishiseva.in"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-text mb-1">Mobile Contact</label>
                  <input
                    type="tel"
                    required
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="9812345678"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-text mb-1">Assign User Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="CHC">Custom Hiring Centre (CHC)</option>
                    <option value="FMC">Farm Machinery Centre (FMC)</option>
                    <option value="LivestockShop">Livestock Shop</option>
                    <option value="Inputstore">Input Store</option>
                    <option value="Facilitator">Field Facilitator</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">Organization / Centre / Farm Name</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Malwa Krishi Mechanization Unit"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-text mb-1">State Jurisdiction</label>
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  >
                    {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-brand-text mb-1">District</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  >
                    {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Initial Approval Status</label>
                  <select
                    value={newApprovalStatus}
                    onChange={(e) => setNewApprovalStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-brand-text mb-1">Initial Account Status</label>
                  <select
                    value={newAccountStatus}
                    onChange={(e) => setNewAccountStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-text hover:bg-cream-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold shadow-subtle"
                >
                  Create & Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
