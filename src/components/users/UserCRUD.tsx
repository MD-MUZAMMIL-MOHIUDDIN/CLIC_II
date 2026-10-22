import React, { useState } from 'react';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import { locationMasterService } from '../../services/locationMasterService';
import { useToast } from '../../context/ToastContext';
import { useLocation } from '../../context/LocationContext';
import { User, UserRole, AccountStatus, ApprovalStatus, Role } from '../../types';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  ShieldCheck,
  Building2,
  MapPin,
  RefreshCw,
  Sparkles,
  Power,
  X,
  Filter,
  Plus,
  ArrowRight
} from 'lucide-react';

export const UserCRUD: React.FC = () => {
  const { showToast } = useToast();
  const { availableStates, availableDistricts } = useLocation();

  const [users, setUsers] = useState<User[]>(() => userService.getAllUsers());
  const [roles, setRoles] = useState<Role[]>(() => roleService.getAllRoles());

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Manage Roles Modal state (matches user uploaded screenshot)
  const [manageRolesModalOpen, setManageRolesModalOpen] = useState(false);
  const [manageRolesUser, setManageRolesUser] = useState<User | null>(null);
  const [roleToAssign, setRoleToAssign] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Farmer']);
  const [formRoleToAssign, setFormRoleToAssign] = useState('');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('active');
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('approved');
  // Master Location data from service
  const [masterStates] = useState(() => locationMasterService.getStates());
  const [masterDistricts] = useState(() => locationMasterService.getDistricts());
  const [masterMandals] = useState(() => locationMasterService.getMandals());
  const [masterPanchayats] = useState(() => locationMasterService.getPanchayats());
  const [masterVillages] = useState(() => locationMasterService.getVillages());

  // Form Location states
  const [state, setState] = useState('Madhya Pradesh');
  const [district, setDistrict] = useState('Indore');
  const [mandal, setMandal] = useState('Sanwer');
  const [panchayat, setPanchayat] = useState('Kanadia Gram Panchayat');
  const [village, setVillage] = useState('Kanadia');

  const [organizationName, setOrganizationName] = useState('');

  // Derived cascading location items
  const currentStateObj = masterStates.find(s => s.Text.toLowerCase() === state.toLowerCase()) || masterStates[0];

  const availableDistrictsForState = currentStateObj
    ? masterDistricts.filter(d => String(d.StateId) === String(currentStateObj.StateId))
    : masterDistricts;

  const currentDistObj = availableDistrictsForState.find(d => d.Text.toLowerCase() === district.toLowerCase()) || availableDistrictsForState[0];

  const availableMandalsForDistrict = currentDistObj
    ? masterMandals.filter(m => String(m.DistrictId) === String(currentDistObj.DistrictId))
    : [];

  const currentMandalObj = availableMandalsForDistrict.find(m => m.Text.toLowerCase() === mandal.toLowerCase()) || availableMandalsForDistrict[0];

  const availablePanchayatsForMandal = currentMandalObj
    ? masterPanchayats.filter(p => String(p.MandalId) === String(currentMandalObj.MandalId))
    : [];

  const currentPanchayatObj = availablePanchayatsForMandal.find(p => p.Text.toLowerCase() === panchayat.toLowerCase()) || availablePanchayatsForMandal[0];

  const availableVillagesForPanchayat = currentPanchayatObj
    ? masterVillages.filter(v => String(v.PanchayatId) === String(currentPanchayatObj.PanchayatId))
    : [];

  // Cascading location handlers (Strict dropdown selection)
  const handleStateChange = (newState: string) => {
    setState(newState);
    const sObj = masterStates.find(s => s.Text.toLowerCase() === newState.toLowerCase());
    const dList = sObj ? masterDistricts.filter(d => String(d.StateId) === String(sObj.StateId)) : [];
    const nextDist = dList[0]?.Text || '';
    setDistrict(nextDist);

    const mList = dList[0] ? masterMandals.filter(m => String(m.DistrictId) === String(dList[0].DistrictId)) : [];
    const nextMandal = mList[0]?.Text || '';
    setMandal(nextMandal);

    const pList = mList[0] ? masterPanchayats.filter(p => String(p.MandalId) === String(mList[0].MandalId)) : [];
    const nextPanchayat = pList[0]?.Text || '';
    setPanchayat(nextPanchayat);

    const vList = pList[0] ? masterVillages.filter(v => String(v.PanchayatId) === String(pList[0].PanchayatId)) : [];
    setVillage(vList[0]?.Text || '');
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const dObj = availableDistrictsForState.find(d => d.Text.toLowerCase() === newDistrict.toLowerCase());
    const mList = dObj ? masterMandals.filter(m => String(m.DistrictId) === String(dObj.DistrictId)) : [];
    const nextMandal = mList[0]?.Text || '';
    setMandal(nextMandal);

    const pList = mList[0] ? masterPanchayats.filter(p => String(p.MandalId) === String(mList[0].MandalId)) : [];
    const nextPanchayat = pList[0]?.Text || '';
    setPanchayat(nextPanchayat);

    const vList = pList[0] ? masterVillages.filter(v => String(v.PanchayatId) === String(pList[0].PanchayatId)) : [];
    setVillage(vList[0]?.Text || '');
  };

  const handleMandalChange = (newMandal: string) => {
    setMandal(newMandal);
    const mObj = availableMandalsForDistrict.find(m => m.Text.toLowerCase() === newMandal.toLowerCase());
    const pList = mObj ? masterPanchayats.filter(p => String(p.MandalId) === String(mObj.MandalId)) : [];
    const nextPanchayat = pList[0]?.Text || '';
    setPanchayat(nextPanchayat);

    const vList = pList[0] ? masterVillages.filter(v => String(v.PanchayatId) === String(pList[0].PanchayatId)) : [];
    setVillage(vList[0]?.Text || '');
  };

  const handlePanchayatChange = (newPanchayat: string) => {
    setPanchayat(newPanchayat);
    const pObj = availablePanchayatsForMandal.find(p => p.Text.toLowerCase() === newPanchayat.toLowerCase());
    const vList = pObj ? masterVillages.filter(v => String(v.PanchayatId) === String(pObj.PanchayatId)) : [];
    setVillage(vList[0]?.Text || '');
  };

  const handleVillageChange = (newVillage: string) => {
    setVillage(newVillage);
  };

  // Password reset modal form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Edit User credential update confirmation modal state
  const [credentialConfirmModalOpen, setCredentialConfirmModalOpen] = useState(false);
  const [pendingUpdateData, setPendingUpdateData] = useState<{
    emailChanged: boolean;
    mobileChanged: boolean;
    oldEmail: string;
    newEmail: string;
    oldMobile: string;
    newMobile: string;
  } | null>(null);

  // Refresh lists
  const refreshUsers = () => {
    setUsers(userService.getAllUsers());
    setRoles(roleService.getAllRoles());
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setMobile('');
    setPassword('');
    setShowPassword(false);
    setSelectedRoles([roles[0]?.roleKey || 'Farmer']);
    setFormRoleToAssign('');
    setAccountStatus('active');
    setApprovalStatus('approved');

    const defaultState = masterStates[0]?.Text || 'Madhya Pradesh';
    setState(defaultState);
    const firstStateObj = masterStates[0];
    const dList = firstStateObj ? masterDistricts.filter(d => String(d.StateId) === String(firstStateObj.StateId)) : [];
    const firstDist = dList[0]?.Text || 'Indore';
    setDistrict(firstDist);

    const mList = dList[0] ? masterMandals.filter(m => String(m.DistrictId) === String(dList[0].DistrictId)) : [];
    const firstMandal = mList[0]?.Text || 'Sanwer';
    setMandal(firstMandal);

    const pList = mList[0] ? masterPanchayats.filter(p => String(p.MandalId) === String(mList[0].MandalId)) : [];
    const firstPanchayat = pList[0]?.Text || 'Kanadia Gram Panchayat';
    setPanchayat(firstPanchayat);

    const vList = pList[0] ? masterVillages.filter(v => String(v.PanchayatId) === String(pList[0].PanchayatId)) : [];
    setVillage(vList[0]?.Text || 'Kanadia');

    setOrganizationName('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setEmail(user.email);
    setMobile(user.mobile);
    setPassword('');
    setShowPassword(false);
    setSelectedRoles(user.roles && user.roles.length > 0 ? user.roles : [user.role]);
    setFormRoleToAssign('');
    setAccountStatus(user.accountStatus);
    setApprovalStatus(user.approvalStatus);

    const userStateRaw = user.location?.state || masterStates[0]?.Text || 'Madhya Pradesh';
    const stateObj = masterStates.find(s => s.Text.toLowerCase() === userStateRaw.toLowerCase()) || masterStates[0];
    const validState = stateObj?.Text || 'Madhya Pradesh';

    const dList = stateObj ? masterDistricts.filter(d => String(d.StateId) === String(stateObj.StateId)) : [];
    const distMatch = dList.find(d => d.Text.toLowerCase() === (user.location?.district || '').toLowerCase());
    const validDist = distMatch ? distMatch.Text : (dList[0]?.Text || '');

    const mList = distMatch
      ? masterMandals.filter(m => String(m.DistrictId) === String(distMatch.DistrictId))
      : (dList[0] ? masterMandals.filter(m => String(m.DistrictId) === String(dList[0].DistrictId)) : []);
    const mandalMatch = mList.find(m => m.Text.toLowerCase() === (user.location?.mandal || user.location?.block || '').toLowerCase());
    const validMandal = mandalMatch ? mandalMatch.Text : (mList[0]?.Text || '');

    const pList = mandalMatch
      ? masterPanchayats.filter(p => String(p.MandalId) === String(mandalMatch.MandalId))
      : (mList[0] ? masterPanchayats.filter(p => String(p.MandalId) === String(mList[0].MandalId)) : []);
    const panchayatMatch = pList.find(p => p.Text.toLowerCase() === (user.location?.panchayat || '').toLowerCase());
    const validPanchayat = panchayatMatch ? panchayatMatch.Text : (pList[0]?.Text || '');

    const vList = panchayatMatch
      ? masterVillages.filter(v => String(v.PanchayatId) === String(panchayatMatch.PanchayatId))
      : (pList[0] ? masterVillages.filter(v => String(v.PanchayatId) === String(pList[0].PanchayatId)) : []);
    const villageMatch = vList.find(v => v.Text.toLowerCase() === (user.location?.village || '').toLowerCase());
    const validVillage = villageMatch ? villageMatch.Text : (vList[0]?.Text || '');

    setState(validState);
    setDistrict(validDist);
    setMandal(validMandal);
    setPanchayat(validPanchayat);
    setVillage(validVillage);

    setOrganizationName(user.organizationName || '');
    setModalOpen(true);
  };

  // Open Manage Roles Modal
  const handleOpenManageRoles = (user: User) => {
    setManageRolesUser(user);
    setRoleToAssign('');
    setManageRolesModalOpen(true);
  };

  // Assign Role handler in Manage Roles Modal
  const handleAssignRole = () => {
    if (!manageRolesUser || !roleToAssign) return;
    const res = userService.assignRole(manageRolesUser.id, roleToAssign);
    if (!res.success) {
      showToast('Error', res.error || 'Failed to assign role.', 'error');
      return;
    }
    showToast('Role Assigned', `Added role ${roleToAssign} to ${manageRolesUser.fullName}.`, 'success');
    setManageRolesUser(res.user || null);
    setRoleToAssign('');
    refreshUsers();
  };

  // Remove Role handler in Manage Roles Modal
  const handleRemoveRole = (roleKey: string) => {
    if (!manageRolesUser) return;
    const res = userService.removeRole(manageRolesUser.id, roleKey);
    if (!res.success) {
      showToast('Cannot Remove Role', res.error || 'Failed to remove role.', 'error');
      return;
    }
    showToast('Role Removed', `Removed role ${roleKey} from ${manageRolesUser.fullName}.`, 'info');
    setManageRolesUser(res.user || null);
    refreshUsers();
  };

  // Toggle role in Add/Edit user form
  const toggleRoleInForm = (roleKey: string) => {
    if (selectedRoles.includes(roleKey)) {
      if (selectedRoles.length === 1) {
        showToast('Required', 'User must have at least one role assigned.', 'error');
        return;
      }
      setSelectedRoles(prev => prev.filter(r => r !== roleKey));
    } else {
      setSelectedRoles(prev => [...prev, roleKey]);
    }
  };

  // Open Quick Password Reset Modal
  const handleOpenPasswordModal = (user: User) => {
    setPasswordUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordModalOpen(true);
  };

  // Random Password Generator
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return generated;
  };

  // Execute User Update after credential check/confirmation
  const executeUserUpdate = () => {
    if (!editingUser) return;
    const res = userService.updateUser(editingUser.id, {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      ...(password.trim() ? { password: password.trim() } : {}),
      roles: selectedRoles,
      role: selectedRoles[0] as UserRole,
      accountStatus,
      approvalStatus,
      organizationName: organizationName.trim(),
      location: {
        ...editingUser.location,
        state: state.trim(),
        district: district.trim(),
        block: mandal.trim(),
        mandal: mandal.trim(),
        panchayat: panchayat.trim(),
        village: village.trim()
      }
    });

    if (!res.success) {
      showToast('Update Failed', res.error || 'Failed to update user.', 'error');
      return;
    }

    showToast('User Updated', `User ${fullName} was updated successfully.`, 'success');
    setModalOpen(false);
    setCredentialConfirmModalOpen(false);
    setPendingUpdateData(null);
    refreshUsers();
  };

  // Handle Save (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Validation Error', 'Full Name is required.', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Validation Error', 'Please enter a valid email address.', 'error');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      showToast('Validation Error', 'Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    if (!editingUser && !password.trim()) {
      showToast('Validation Error', 'Password is required when creating a new user.', 'error');
      return;
    }

    if (selectedRoles.length === 0) {
      showToast('Validation Error', 'Please select at least one role for this user.', 'error');
      return;
    }

    if (editingUser) {
      // Check if email or mobile changed -> ask for confirmation
      const emailChanged = email.trim().toLowerCase() !== editingUser.email.toLowerCase();
      const mobileChanged = mobile.trim() !== editingUser.mobile.trim();

      if (emailChanged || mobileChanged) {
        setPendingUpdateData({
          emailChanged,
          mobileChanged,
          oldEmail: editingUser.email,
          newEmail: email.trim().toLowerCase(),
          oldMobile: editingUser.mobile,
          newMobile: mobile.trim()
        });
        setCredentialConfirmModalOpen(true);
        return;
      }

      executeUserUpdate();
    } else {
      // Create new
      const res = userService.createUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password: password.trim(),
        roles: selectedRoles,
        role: selectedRoles[0] as UserRole,
        accountStatus,
        approvalStatus,
        organizationName: organizationName.trim(),
        location: {
          state: state.trim(),
          district: district.trim(),
          block: mandal.trim(),
          mandal: mandal.trim(),
          panchayat: panchayat.trim(),
          village: village.trim()
        }
      });

      if (!res.success) {
        showToast('Creation Failed', res.error || 'Failed to create user.', 'error');
        return;
      }

      showToast('User Created', `User ${fullName} added with ${selectedRoles.length} role(s).`, 'success');
      setModalOpen(false);
      refreshUsers();
    }
  };

  // Handle Quick Password Reset
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Validation Error', 'New Password and Confirm Password do not match.', 'error');
      return;
    }

    const res = userService.updateUser(passwordUser.id, {
      password: newPassword.trim()
    });

    if (res.success) {
      showToast('Password Updated', `New password set for ${passwordUser.fullName}.`, 'success');
      setPasswordModalOpen(false);
      refreshUsers();
    } else {
      showToast('Error', res.error || 'Failed to update password.', 'error');
    }
  };

  // Handle Toggle Account Status
  const handleToggleStatus = (user: User) => {
    const nextStatus: AccountStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
    userService.updateUserStatus(user.id, nextStatus);
    showToast(
      nextStatus === 'active' ? 'Account Activated' : 'Account Suspended',
      `${user.fullName} is now ${nextStatus}.`,
      nextStatus === 'active' ? 'success' : 'info'
    );
    refreshUsers();
  };

  // Handle Delete User
  const handleDeleteUser = () => {
    if (!deleteConfirmUser) return;
    const res = userService.deleteUser(deleteConfirmUser.id);
    if (res.success) {
      showToast('User Deleted', `User ${deleteConfirmUser.fullName} has been removed.`, 'success');
      setDeleteConfirmUser(null);
      refreshUsers();
    } else {
      showToast('Error', res.error || 'Failed to delete user.', 'error');
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const userRoles = u.roles && u.roles.length > 0 ? u.roles : [u.role];
    if (roleFilter !== 'ALL' && !userRoles.includes(roleFilter)) return false;
    if (statusFilter !== 'ALL' && u.accountStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchMobile = u.mobile.includes(q);
      const matchRole = userRoles.some(r => r.toLowerCase().includes(q));
      const matchOrg = u.organizationName?.toLowerCase().includes(q) || false;
      return matchName || matchEmail || matchMobile || matchRole || matchOrg;
    }
    return true;
  });

  const stats = userService.getStats();

  const getRoleBadgeColor = (roleKey: string) => {
    switch (roleKey) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Admin':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Farmer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CHC':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FMC':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'LivestockShop':
        return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
      case 'Inputstore':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Facilitator':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Scientist':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-forest-100 text-forest-800 border-forest-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-brand-border bg-white shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-forest-50 text-forest-700">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cream-200 text-brand-muted">
              Total
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-forest-900">{stats.totalCount}</div>
          <div className="text-xs font-semibold text-brand-muted mt-0.5">Registered Users</div>
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
          <div className="text-xs font-semibold text-emerald-800 mt-0.5">Active Accounts</div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <AlertCircle className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
              Pending
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-amber-950">{stats.pendingApprovalCount}</div>
          <div className="text-xs font-semibold text-amber-800 mt-0.5">Pending Approvals</div>
        </div>

        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-800">
              <Power className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
              Suspended
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-rose-950">{stats.suspendedCount}</div>
          <div className="text-xs font-semibold text-rose-800 mt-0.5">Suspended Accounts</div>
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
            placeholder="Search by name, email, mobile, role..."
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
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-cream-50 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
            <Shield className="w-3.5 h-3.5 text-forest-600" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-medium text-brand-text focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles ({roles.length})</option>
              {roles.map((r) => (
                <option key={r.id} value={r.roleKey}>
                  {r.roleName} ({r.roleKey})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-cream-50 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
            <Filter className="w-3.5 h-3.5 text-forest-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-brand-text focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Add User Button */}
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-forest-600 hover:bg-forest-700 text-white shadow-subtle transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border bg-cream-50/80 text-brand-muted font-heading uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact (Email & Mobile)</th>
                <th className="py-3 px-4">Assigned Roles</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Approval</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-brand-muted">
                    <Users className="w-8 h-8 mx-auto text-brand-muted/40 mb-2" />
                    <p className="font-semibold text-sm text-forest-900">No users match your filters.</p>
                    <p className="text-xs text-brand-muted mt-1">Try resetting the search query or role filter.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isActive = u.accountStatus === 'active';
                  const userRoles = u.roles && u.roles.length > 0 ? u.roles : [u.role];

                  return (
                    <tr key={u.id} className="hover:bg-cream-50/50 transition-colors group">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={u.fullName}
                            className="w-10 h-10 rounded-full aspect-square object-cover border border-brand-border shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-forest-900 flex items-center gap-1.5">
                              <span className="truncate">{u.fullName}</span>
                              {u.verified && (
                                <span title="Verified User" className="inline-flex shrink-0">
                                  <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
                                </span>
                              )}
                            </div>
                            <div className="text-[10.5px] text-brand-muted truncate">
                              {u.email}
                            </div>
                            {u.organizationName && (
                              <div className="text-[10px] text-forest-700 font-medium truncate flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 shrink-0" />
                                {u.organizationName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Mobile, Password Status) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-brand-muted">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-medium text-forest-900">{u.mobile}</span>
                          </div>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              onClick={() => handleOpenPasswordModal(u)}
                              className="text-[10px] font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1 bg-forest-50 px-2 py-0.5 rounded border border-forest-200 transition-colors"
                              title="Reset Password"
                            >
                              <Lock className="w-2.5 h-2.5" />
                              <span>{u.password ? '•••••••• (Reset)' : 'Set Password'}</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Roles (Pills + Manage Roles button from user's image) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          {/* Role Badges */}
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {userRoles.map((r) => (
                              <span
                                key={r}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border uppercase tracking-wide ${getRoleBadgeColor(r)}`}
                              >
                                <Shield className="w-2.5 h-2.5 shrink-0" />
                                <span>{r}</span>
                              </span>
                            ))}
                          </div>

                          {/* [+ Manage Roles] Button (matches user uploaded mockup) */}
                          <button
                            type="button"
                            onClick={() => handleOpenManageRoles(u)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-brand-border bg-white hover:bg-forest-50 hover:border-forest-600 text-forest-900 shadow-xs transition-all"
                          >
                            <Shield className="w-3.5 h-3.5 text-forest-600" />
                            <span>Manage Roles</span>
                          </button>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="text-forest-900 font-medium truncate flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                          <span>
                            {u.location?.village ? `${u.location.village}, ` : ''}{u.location?.district || 'Central HQ'}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-brand-muted truncate pl-5">
                          {[u.location?.panchayat, u.location?.mandal || u.location?.block, u.location?.state].filter(Boolean).join(' • ')}
                        </div>
                        {u.location?.lat !== undefined && u.location?.lng !== undefined && (
                          <div className="text-[10px] text-forest-700 font-mono pl-5 pt-0.5 flex items-center gap-1">
                            <span className="bg-forest-50 px-1.5 py-0.5 rounded border border-forest-200">
                              GPS: {u.location.lat.toFixed(4)}°N, {u.location.lng.toFixed(4)}°E
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          <span className="capitalize">{u.accountStatus}</span>
                        </button>
                      </td>

                      {/* Approval Status */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          u.approvalStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : u.approvalStatus === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {u.approvalStatus.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg text-brand-muted hover:text-forest-900 hover:bg-cream-100 transition-colors"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            className="p-1.5 rounded-lg text-brand-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANAGE ROLES MODAL (Exact layout as shown in user's image) */}
      {manageRolesModalOpen && manageRolesUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border w-full max-w-md overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-brand-border/60">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-forest-900">
                  Manage Roles
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  {manageRolesUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManageRolesModalOpen(false)}
                className="text-brand-muted hover:text-brand-text p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* CURRENT ROLES */}
              <div>
                <h4 className="text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2.5">
                  CURRENT ROLES
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(manageRolesUser.roles && manageRolesUser.roles.length > 0 ? manageRolesUser.roles : [manageRolesUser.role]).map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0D9488] text-white shadow-xs"
                    >
                      <span>{r}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(r)}
                        className="text-rose-200 hover:text-rose-100 font-bold ml-0.5 focus:outline-none"
                        title={`Remove ${r} role`}
                      >
                        <X className="w-3.5 h-3.5 text-rose-300 hover:text-white" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Assign a role */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-2">
                  Assign a role
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={roleToAssign}
                    onChange={(e) => setRoleToAssign(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-forest-600 bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 text-forest-900"
                  >
                    <option value="">Select a role...</option>
                    {roles
                      .filter(r => !(manageRolesUser.roles || [manageRolesUser.role]).includes(r.roleKey))
                      .map(r => (
                        <option key={r.id} value={r.roleKey}>
                          {r.roleName} ({r.roleKey})
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAssignRole}
                    disabled={!roleToAssign}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#5E9387] hover:bg-[#4d7d72] disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-subtle transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setManageRolesModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold rounded-xl border border-brand-border text-forest-900 hover:bg-cream-50 transition-colors shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-brand-border bg-cream-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-subtle">
                  {editingUser ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-forest-900">
                    {editingUser ? 'Edit User Credentials' : 'Add New User'}
                  </h3>
                  <p className="text-[11px] text-brand-muted">
                    {editingUser ? `Updating account: ${editingUser.id}` : 'Fill in identity, credentials, roles, and location.'}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Full Name <span className="text-brand-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajeshwar Rao"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-forest-900">
                      Email Address <span className="text-brand-error">*</span>
                    </label>
                    {editingUser && email.trim().toLowerCase() !== editingUser.email.toLowerCase() && (
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5 text-amber-700" /> Modified
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@krishiseva.in"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    />
                  </div>
                  {editingUser && email.trim().toLowerCase() !== editingUser.email.toLowerCase() && (
                    <p className="text-[10.5px] text-amber-800 mt-1 font-medium flex items-center gap-1">
                      <span>Original:</span>
                      <span className="font-mono bg-amber-50 px-1 py-0.5 rounded text-[10px]">{editingUser.email}</span>
                      <span className="text-brand-muted text-[10px]">(Confirmation required on save)</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-forest-900">
                      Mobile Number <span className="text-brand-error">*</span>
                    </label>
                    {editingUser && mobile.trim() !== editingUser.mobile.trim() && (
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5 text-amber-700" /> Modified
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      type="tel"
                      required
                      maxLength={12}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    />
                  </div>
                  {editingUser && mobile.trim() !== editingUser.mobile.trim() && (
                    <p className="text-[10.5px] text-amber-800 mt-1 font-medium flex items-center gap-1">
                      <span>Original:</span>
                      <span className="font-mono bg-amber-50 px-1 py-0.5 rounded text-[10px]">{editingUser.mobile}</span>
                      <span className="text-brand-muted text-[10px]">(Confirmation required on save)</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-forest-900">
                    Password {editingUser ? '(Leave blank to keep existing)' : <span className="text-brand-error">*</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(generateRandomPassword())}
                    className="text-[10px] text-forest-700 hover:text-forest-900 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-harvest" />
                    Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? 'Enter new password if updating' : 'Create strong password'}
                    className="w-full pl-8 pr-9 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-forest-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Assigned Roles (Select one or more) as mentioned in the image */}
              <div className="p-4 rounded-xl border border-brand-border bg-cream-50/40 space-y-3">
                {/* CURRENT ROLES */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                      CURRENT ROLES
                    </span>
                    <span className="text-[10px] text-brand-muted font-medium">
                      {selectedRoles.length} role(s) assigned
                    </span>
                  </div>

                  {selectedRoles.length === 0 ? (
                    <p className="text-xs text-brand-muted italic py-1">No roles assigned yet. Please select and assign a role below.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedRoles.map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0D9488] text-white shadow-xs"
                        >
                          <span>{r}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedRoles.length === 1) {
                                showToast('Required', 'A user must retain at least one role.', 'error');
                                return;
                              }
                              setSelectedRoles(prev => prev.filter(role => role !== r));
                            }}
                            className="text-rose-200 hover:text-white font-bold ml-0.5 focus:outline-none"
                            title={`Remove ${r} role`}
                          >
                            <X className="w-3.5 h-3.5 text-rose-300 hover:text-white" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assign a role dropdown + Assign button */}
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1.5">
                    Assign a role <span className="text-brand-error">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={formRoleToAssign}
                      onChange={(e) => setFormRoleToAssign(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-forest-600 bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 text-forest-900"
                    >
                      <option value="">Select a role...</option>
                      {roles
                        .filter(r => !selectedRoles.includes(r.roleKey))
                        .map(r => (
                          <option key={r.id} value={r.roleKey}>
                            {r.roleName} ({r.roleKey})
                          </option>
                        ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        if (!formRoleToAssign) return;
                        setSelectedRoles(prev => [...prev, formRoleToAssign]);
                        setFormRoleToAssign('');
                      }}
                      disabled={!formRoleToAssign}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#5E9387] hover:bg-[#4d7d72] disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-subtle transition-colors shrink-0"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">Account Status</label>
                <select
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as AccountStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                >
                  <option value="active">Active (Access Granted)</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Location & Administrative Jurisdiction */}
              <div className="p-4 rounded-xl border border-brand-border bg-cream-50/40 space-y-3">
                <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-forest-700" />
                    <span className="text-xs font-bold text-forest-900 uppercase tracking-wider">
                      Location & Administrative Jurisdiction
                    </span>
                  </div>
                  <span className="text-[10px] text-brand-muted font-medium">
                    State ➔ District ➔ Mandal ➔ Panchayat ➔ Village
                  </span>
                </div>

                {/* Row 1: State & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">
                      State <span className="text-brand-error">*</span>
                    </label>
                    <select
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    >
                      {masterStates.map((s) => (
                        <option key={s.StateId} value={s.Text}>{s.Text}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">
                      District <span className="text-brand-error">*</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    >
                      {availableDistrictsForState.map((d) => (
                        <option key={d.DistrictId} value={d.Text}>{d.Text}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Mandal, Panchayat, Village (Strict Dropdown Selection - No Custom Input) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Mandal */}
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">
                      Mandal / Block <span className="text-brand-error">*</span>
                    </label>
                    <select
                      value={mandal}
                      onChange={(e) => handleMandalChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    >
                      {availableMandalsForDistrict.map((m) => (
                        <option key={m.MandalId} value={m.Text}>{m.Text}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gram Panchayat */}
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">
                      Gram Panchayat <span className="text-brand-error">*</span>
                    </label>
                    <select
                      value={panchayat}
                      onChange={(e) => handlePanchayatChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    >
                      {availablePanchayatsForMandal.map((p) => (
                        <option key={p.PanchayatId} value={p.Text}>{p.Text}</option>
                      ))}
                    </select>
                  </div>

                  {/* Village */}
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">
                      Village <span className="text-brand-error">*</span>
                    </label>
                    <select
                      value={village}
                      onChange={(e) => handleVillageChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    >
                      {availableVillagesForPanchayat.map((v) => (
                        <option key={v.VillageId} value={v.Text}>{v.Text}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2 text-[11px] text-emerald-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Strict Master Data Directory:</strong> Custom village, panchayat, mandal, or state names are strictly prohibited. All levels are bound to official government administrative units.
                  </span>
                </div>
              </div>

              {/* Organization / Farm Name */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Organization / Farm Name (Optional)
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Kisan Samriddhi Agro Pvt Ltd"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
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
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESET PASSWORD MODAL */}
      {passwordModalOpen && passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border w-full max-w-md overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-brand-border bg-cream-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-forest-700" />
                <h3 className="font-heading font-extrabold text-sm text-forest-900">
                  Reset Password for {passwordUser.fullName}
                </h3>
              </div>
              <button onClick={() => setPasswordModalOpen(false)} className="text-brand-muted hover:text-brand-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-6 space-y-4">
              {/* User Identity Banner */}
              <div className="p-3 rounded-xl bg-forest-50/60 border border-forest-200/80 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-forest-900 block">{passwordUser.fullName}</span>
                  <span className="text-[11px] text-brand-muted">{passwordUser.email}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-forest-100 text-forest-800 border border-forest-300 uppercase tracking-wide">
                  {passwordUser.role}
                </span>
              </div>

              {/* New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-forest-900">New Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      const p = generateRandomPassword();
                      setNewPassword(p);
                      setConfirmPassword(p);
                    }}
                    className="text-[10px] text-forest-700 hover:text-forest-900 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-harvest" />
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full pl-8 pr-9 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-forest-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full pl-8 pr-9 py-2 text-xs rounded-xl border ${
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-rose-400 focus:ring-rose-400'
                        : confirmPassword && newPassword === confirmPassword
                        ? 'border-emerald-500 focus:ring-emerald-500'
                        : 'border-brand-border focus:ring-forest-500'
                    } focus:ring-2 focus:outline-none font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" /> Passwords do not match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 shrink-0" /> Passwords match
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-brand-border text-brand-muted hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-forest-600 hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-subtle transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL / MOBILE CHANGE CONFIRMATION MODAL */}
      {credentialConfirmModalOpen && editingUser && pendingUpdateData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border w-full max-w-md overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-brand-border bg-amber-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-forest-900">
                    Confirm Credential Update
                  </h3>
                  <p className="text-[11px] text-brand-muted">
                    Modifying primary contact details for <strong className="text-forest-900">{editingUser.fullName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCredentialConfirmModalOpen(false)}
                className="text-brand-muted hover:text-brand-text p-1 rounded-lg hover:bg-amber-100/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-950">
                <p className="font-semibold flex items-center gap-1.5 mb-1 text-amber-900">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  Primary Authentication Notice
                </p>
                Changing the registered email or mobile number affects how the user logs into the system and receives OTP verifications. Please confirm the changes below:
              </div>

              <div className="space-y-3">
                {pendingUpdateData.emailChanged && (
                  <div className="p-3.5 rounded-xl border border-brand-border bg-cream-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-brand-muted" />
                        Email Address
                      </span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        Modified
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs pt-1">
                      <span className="line-through text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 font-mono truncate flex-1">
                        {pendingUpdateData.oldEmail}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-mono truncate flex-1">
                        {pendingUpdateData.newEmail}
                      </span>
                    </div>
                  </div>
                )}

                {pendingUpdateData.mobileChanged && (
                  <div className="p-3.5 rounded-xl border border-brand-border bg-cream-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand-muted" />
                        Mobile Number
                      </span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        Modified
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs pt-1">
                      <span className="line-through text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 font-mono truncate flex-1">
                        {pendingUpdateData.oldMobile}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-mono truncate flex-1">
                        {pendingUpdateData.newMobile}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCredentialConfirmModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-brand-border text-brand-muted hover:text-brand-text hover:bg-cream-100 transition-colors"
                >
                  Go Back & Review
                </button>
                <button
                  type="button"
                  onClick={executeUserUpdate}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-forest-600 hover:bg-forest-700 text-white shadow-subtle flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm & Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border p-6 max-w-sm w-full animate-scale-up">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-extrabold text-base text-forest-900">Delete User Account</h4>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              Are you sure you want to permanently delete user <strong className="text-forest-900">{deleteConfirmUser.fullName}</strong> ({deleteConfirmUser.email})? This action cannot be undone.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-brand-border text-brand-muted hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-subtle"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
