import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { locationMasterService } from '../../services/locationMasterService';
import { dropdownMasterService } from '../../services/dropdownMasterService';
import { cropProblemService } from '../../services/cropProblemService';
import { cropService } from '../../services/cropService';
import { problemMediaService } from '../../services/problemMediaService';
import { problemManagementService } from '../../services/problemManagementService';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import {
  MapPin,
  Building2,
  Layers,
  Compass,
  Home,
  Tag,
  ListFilter,
  LayoutDashboard,
  User,
  Users,
  Sliders,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Shield,
  Database,
  Bug,
  Sprout,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If not logged in, sidebar should not be displayed
  if (!currentUser) return null;

  const locationStats = locationMasterService.getStats();
  const dropdownStats = dropdownMasterService.getStats();
  const cropProblemStats = cropProblemService.getStats();
  const cropStats = cropService.getStats();
  const mediaStats = problemMediaService.getStats();
  const mgmtStats = problemManagementService.getStats();
  const userStats = userService.getStats();
  const roleStats = roleService.getStats();

  const getDashboardRoute = () => {
    switch (currentUser.role) {
      case 'Farmer':
        return '/farmer';
      case 'CHC':
        return '/chc-dashboard';
      case 'FMC':
        return '/fmc-dashboard';
      case 'LivestockShop':
        return '/livestock-shop';
      case 'Inputstore':
        return '/input-store';
      case 'Facilitator':
        return '/facilitator';
      case 'Admin':
        return '/admin';
      case 'superadmin':
        return '/superadmin';
      default:
        return '/farmer';
    }
  };

  const isLocationTabActive = (tabName: string) => {
    if (location.pathname.startsWith(`/locations/${tabName}`)) return true;
    if (location.pathname === '/locations' && location.search.includes(`tab=${tabName}`)) return true;
    if (location.pathname === '/locations' && !location.search && tabName === 'state') return true;
    return false;
  };

  const isDropdownTabActive = (tabName: string) => {
    if (location.pathname.startsWith(`/dropdown-management/${tabName}`)) return true;
    if (location.pathname === '/dropdown-management' && location.search.includes(`tab=${tabName}`)) return true;
    if (location.pathname === '/dropdown-management' && !location.search && tabName === 'ref-types') return true;
    return false;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full min-h-0 bg-white select-none">
      {/* User Header Profile Card */}
      <div className={`p-3.5 border-b border-brand-border bg-gradient-to-b from-forest-50/70 to-white transition-all shrink-0 ${
        isCollapsed ? 'px-2 text-center' : 'px-4'
      }`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&auto=format&fit=crop&q=80'}
            alt={currentUser.fullName}
            className="w-10 h-10 rounded-full aspect-square object-cover border-2 border-forest-600 shadow-subtle shrink-0"
            title={isCollapsed ? `${currentUser.fullName} (${currentUser.role})` : undefined}
          />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="font-heading font-extrabold text-xs text-forest-900 truncate">
                {currentUser.fullName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest-100 text-forest-800 tracking-wide uppercase">
                  {currentUser.role}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Online" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-6 px-3 [scrollbar-width:thin] scrollbar-thumb-cream-300">
        {/* Core Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-muted/80">
              Overview
            </div>
          )}
          <NavLink
            to={getDashboardRoute()}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-forest-800 text-white shadow-subtle'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? 'My Dashboard' : undefined}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-forest-600" />
            {!isCollapsed && <span className="truncate">My Dashboard</span>}
          </NavLink>

          <NavLink
            to="/profile"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-forest-800 text-white shadow-subtle'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? 'Profile Settings' : undefined}
          >
            <User className="w-4 h-4 shrink-0 text-forest-600" />
            {!isCollapsed && <span className="truncate">Profile Settings</span>}
          </NavLink>
        </div>

        {/* Small Heading: USER MANAGEMENT */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <div className="px-2 pb-1">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-agri" />
                USER MANAGEMENT
              </span>
            </div>
          ) : (
            <div className="h-px bg-brand-border my-2" title="user management" />
          )}

          {/* Users */}
          <NavLink
            to="/users"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? `Users (${userStats.totalCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Users className="w-4 h-4 shrink-0 text-harvest" />
              {!isCollapsed && <span className="truncate">Users</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono bg-cream-200 text-brand-muted">
                {userStats.totalCount}
              </span>
            )}
          </NavLink>

          {/* Roles */}
          <NavLink
            to="/roles"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? `Roles (${roleStats.totalCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Shield className="w-4 h-4 shrink-0 text-harvest" />
              {!isCollapsed && <span className="truncate">Roles</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono bg-cream-200 text-brand-muted">
                {roleStats.totalCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* Small Heading: locations */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <div className="px-2 pb-1">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-agri" />
                locations
              </span>
            </div>
          ) : (
            <div className="h-px bg-brand-border my-2" title="locations" />
          )}

          {/* State */}
          <NavLink
            to="/locations/states"
            onClick={onCloseMobile}
            className={() =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isLocationTabActive('state')
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? `State (${locationStats.statesCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <MapPin className={`w-4 h-4 shrink-0 ${isLocationTabActive('state') ? 'text-harvest' : 'text-forest-600'}`} />
              {!isCollapsed && <span className="truncate">State</span>}
            </div>
            {!isCollapsed && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono ${
                isLocationTabActive('state') ? 'bg-forest-800 text-cream-100' : 'bg-cream-200 text-brand-muted'
              }`}>
                {locationStats.statesCount}
              </span>
            )}
          </NavLink>

          {/* District */}
          <NavLink
            to="/locations/districts"
            onClick={onCloseMobile}
            className={() =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isLocationTabActive('district')
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? `District (${locationStats.districtsCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Building2 className={`w-4 h-4 shrink-0 ${isLocationTabActive('district') ? 'text-harvest' : 'text-forest-600'}`} />
              {!isCollapsed && <span className="truncate">District</span>}
            </div>
            {!isCollapsed && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono ${
                isLocationTabActive('district') ? 'bg-forest-800 text-cream-100' : 'bg-cream-200 text-brand-muted'
              }`}>
                {locationStats.districtsCount}
              </span>
            )}
          </NavLink>

          {/* Mandal */}
          <NavLink
            to="/locations/mandals"
            onClick={onCloseMobile}
            className={() =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isLocationTabActive('mandal')
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? `Mandal (${locationStats.mandalsCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Layers className={`w-4 h-4 shrink-0 ${isLocationTabActive('mandal') ? 'text-harvest' : 'text-forest-600'}`} />
              {!isCollapsed && <span className="truncate">Mandal</span>}
            </div>
            {!isCollapsed && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono ${
                isLocationTabActive('mandal') ? 'bg-forest-800 text-cream-100' : 'bg-cream-200 text-brand-muted'
              }`}>
                {locationStats.mandalsCount}
              </span>
            )}
          </NavLink>

          {/* Panchayat */}
          <NavLink
            to="/locations/panchayats"
            onClick={onCloseMobile}
            className={() =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isLocationTabActive('panchayat')
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? `Panchayat (${locationStats.panchayatsCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Compass className={`w-4 h-4 shrink-0 ${isLocationTabActive('panchayat') ? 'text-harvest' : 'text-forest-600'}`} />
              {!isCollapsed && <span className="truncate">Panchayat</span>}
            </div>
            {!isCollapsed && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono ${
                isLocationTabActive('panchayat') ? 'bg-forest-800 text-cream-100' : 'bg-cream-200 text-brand-muted'
              }`}>
                {locationStats.panchayatsCount}
              </span>
            )}
          </NavLink>

          {/* Village */}
          <NavLink
            to="/locations/villages"
            onClick={onCloseMobile}
            className={() =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isLocationTabActive('village')
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? `Village (${locationStats.villagesCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Home className={`w-4 h-4 shrink-0 ${isLocationTabActive('village') ? 'text-harvest' : 'text-forest-600'}`} />
              {!isCollapsed && <span className="truncate">Village</span>}
            </div>
            {!isCollapsed && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono ${
                isLocationTabActive('village') ? 'bg-forest-800 text-cream-100' : 'bg-cream-200 text-brand-muted'
              }`}>
                {locationStats.villagesCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* Small Heading: dropdown management */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <div className="px-2 pb-1">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-agri" />
                dropdown management
              </span>
            </div>
          ) : (
            <div className="h-px bg-brand-border my-2" title="dropdown management" />
          )}

          {/* Ref Types */}
          <NavLink
            to="/dropdown-management/ref-types"
            onClick={onCloseMobile}
            className={() =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isDropdownTabActive('ref-types')
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? `Ref Types (${dropdownStats.refTypesCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Tag className={`w-4 h-4 shrink-0 ${isDropdownTabActive('ref-types') ? 'text-harvest' : 'text-forest-600'}`} />
              {!isCollapsed && <span className="truncate">Ref Types</span>}
            </div>
            {!isCollapsed && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono ${
                isDropdownTabActive('ref-types') ? 'bg-forest-800 text-cream-100' : 'bg-cream-200 text-brand-muted'
              }`}>
                {dropdownStats.refTypesCount}
              </span>
            )}
          </NavLink>

          {/* Dropdowns */}
          <NavLink
            to="/dropdown-management/dropdowns"
            onClick={onCloseMobile}
            className={() =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isDropdownTabActive('dropdowns')
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? `Dropdowns (${dropdownStats.dropdownsCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <ListFilter className={`w-4 h-4 shrink-0 ${isDropdownTabActive('dropdowns') ? 'text-harvest' : 'text-forest-600'}`} />
              {!isCollapsed && <span className="truncate">Dropdowns</span>}
            </div>
            {!isCollapsed && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono ${
                isDropdownTabActive('dropdowns') ? 'bg-forest-800 text-cream-100' : 'bg-cream-200 text-brand-muted'
              }`}>
                {dropdownStats.dropdownsCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* Small Heading: Crops Master */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <div className="px-2 pb-1">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
                <Sprout className="w-3 h-3 text-agri" />
                CROPS MASTER
              </span>
            </div>
          ) : (
            <div className="h-px bg-brand-border my-2" title="crops master" />
          )}

          {/* Crop List */}
          <NavLink
            to="/crops"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? `Crop List (${cropStats.totalCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Sprout className="w-4 h-4 shrink-0 text-harvest" />
              {!isCollapsed && <span className="truncate">Crop List</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono bg-cream-200 text-brand-muted">
                {cropStats.totalCount}
              </span>
            )}
          </NavLink>

          {/* Crop Problems */}
          <NavLink
            to="/crop-problems"
            onClick={onCloseMobile}
            className={() => {
              const isProblemsActive = location.pathname === '/crop-problems' && !location.search.includes('tab=management');
              return `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isProblemsActive
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`;
            }}
            title={isCollapsed ? `Crop Problems (${cropProblemStats.totalCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Bug className="w-4 h-4 shrink-0 text-harvest" />
              {!isCollapsed && <span className="truncate">Crop Problems</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono bg-cream-200 text-brand-muted">
                {cropProblemStats.totalCount}
              </span>
            )}
          </NavLink>

          {/* Crop Problem Management */}
          <NavLink
            to="/problem-management"
            onClick={onCloseMobile}
            className={() => {
              const isMgmtActive = location.pathname === '/problem-management' || (location.pathname === '/crop-problems' && location.search.includes('tab=management'));
              return `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isMgmtActive
                  ? 'bg-forest-700 text-white shadow-subtle font-bold'
                  : 'text-brand-text hover:text-forest-900 hover:bg-forest-50/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`;
            }}
            title={isCollapsed ? `Crop Problem Management (${mgmtStats.totalCount})` : undefined}
          >
            <div className="flex items-center gap-2.5 truncate">
              <ShieldCheck className="w-4 h-4 shrink-0 text-harvest" />
              {!isCollapsed && <span className="truncate">Crop Problem Management</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold font-mono bg-cream-200 text-brand-muted">
                {mgmtStats.totalCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* Public portal quick link */}
        <div className="pt-2 border-t border-brand-border">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-brand-muted hover:text-forest-900 hover:bg-cream-100 transition-colors ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            title={isCollapsed ? 'Public Portal Home' : undefined}
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-brand-muted" />
            {!isCollapsed && <span>Public Portal Home</span>}
          </NavLink>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={`p-3 border-t border-brand-border bg-cream-50/70 shrink-0 flex items-center ${
        isCollapsed ? 'flex-col gap-2 justify-center' : 'justify-between gap-2'
      }`}>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl hover:bg-cream-200 text-brand-muted hover:text-forest-900 transition-colors hidden md:flex items-center justify-center"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        {!isCollapsed && (
          <div className="text-[11px] text-brand-muted font-medium truncate">
            {currentUser.location.district}, {currentUser.location.state}
          </div>
        )}

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="p-1.5 rounded-xl hover:bg-red-50 text-brand-muted hover:text-red-600 transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-full transition-all duration-300 bg-white border-r border-brand-border z-20 select-none ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Offcanvas Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col h-full ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
