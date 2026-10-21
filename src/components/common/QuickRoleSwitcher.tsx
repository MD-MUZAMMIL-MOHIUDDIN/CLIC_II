import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { UserCheck, ShieldAlert, Sparkles, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickRoleSwitcher: React.FC = () => {
  const { currentUser, quickSwitchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const rolesList: {
    key: UserRole | 'pending_chc' | 'rejected_fmc' | 'suspended';
    label: string;
    roleDesc: string;
    targetRoute: string;
    isEdgeCase?: boolean;
  }[] = [
    { key: 'Farmer', label: 'Rameshwar Patel', roleDesc: 'Farmer (Indore, MP)', targetRoute: '/farmer' },
    { key: 'CHC', label: 'Vikram Singh Chaudhary', roleDesc: 'Custom Hiring Centre', targetRoute: '/chc-dashboard' },
    { key: 'FMC', label: 'Sukhwinder Dhillon', roleDesc: 'Farm Machinery Hub (Punjab)', targetRoute: '/fmc-dashboard' },
    { key: 'LivestockShop', label: 'Anil Kumar Yadav', roleDesc: 'Livestock & Feed Supplier', targetRoute: '/livestock-shop' },
    { key: 'Inputstore', label: 'Meera Venkataraman', roleDesc: 'Bio-Inputs & Seeds Store', targetRoute: '/input-store' },
    { key: 'Facilitator', label: 'Pooja Sharma', roleDesc: 'Regional Facilitator', targetRoute: '/facilitator' },
    { key: 'Admin', label: 'Dr. Rajeshwar Rao', roleDesc: 'Platform Administrator', targetRoute: '/admin' },
    { key: 'superadmin', label: 'Siddharth Nambiar', roleDesc: 'Super Administrator', targetRoute: '/superadmin' },
    // Edge Cases for testing authorization
    { key: 'pending_chc', label: 'Kailash Verma (Test)', roleDesc: 'CHC: Pending Approval', targetRoute: '/application-status', isEdgeCase: true },
    { key: 'rejected_fmc', label: 'Harbhajan Mann (Test)', roleDesc: 'FMC: Rejected Application', targetRoute: '/application-status', isEdgeCase: true },
    { key: 'suspended', label: 'Naresh Lalwani (Test)', roleDesc: 'Farmer: Suspended Account', targetRoute: '/login', isEdgeCase: true },
  ];

  const handleSelectRole = (item: typeof rolesList[0]) => {
    quickSwitchRole(item.key);
    setIsOpen(false);
    navigate(item.targetRoute);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-forest-50 border border-forest-200 text-forest-700 hover:bg-forest-100 transition-colors shadow-subtle"
        title="Interactive Role & State Simulator"
      >
        <Sparkles className="w-3.5 h-3.5 text-harvest-dark animate-pulse" />
        <span className="hidden sm:inline">Role View:</span>
        <span className="font-bold text-forest-900 truncate max-w-[120px]">
          {currentUser ? `${currentUser.role}` : 'Guest'}
        </span>
        <ChevronDown className="w-3 h-3 text-forest-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-elevation border border-brand-border py-2 z-50 animate-slide-down">
            <div className="px-4 py-2 border-b border-brand-border bg-cream-50">
              <p className="text-xs font-bold text-forest-900 uppercase tracking-wider">Demo Role Simulator</p>
              <p className="text-[11px] text-brand-muted mt-0.5">
                Switch instantly between real ecosystem actors and authorization states.
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto py-1 divide-y divide-cream-200">
              <div className="py-1">
                <span className="px-3 py-1 text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
                  Active User Roles
                </span>
                {rolesList.filter(r => !r.isEdgeCase).map((item) => {
                  const isCurrent = currentUser?.role === item.key && currentUser?.approvalStatus === 'approved' && currentUser?.accountStatus === 'active';
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelectRole(item)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-forest-50 transition-colors ${
                        isCurrent ? 'bg-forest-50 font-medium text-forest-900' : 'text-brand-text'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-forest-800">{item.label}</div>
                        <div className="text-[11px] text-brand-muted">{item.roleDesc}</div>
                      </div>
                      {isCurrent ? (
                        <Check className="w-4 h-4 text-forest-600" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5 text-brand-muted opacity-40" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="py-1 bg-rose-50/40">
                <span className="px-3 py-1 text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  Authorization Edge Cases
                </span>
                {rolesList.filter(r => r.isEdgeCase).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSelectRole(item)}
                    className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-rose-100/50 transition-colors text-rose-900"
                  >
                    <div>
                      <div className="font-semibold text-rose-900">{item.label}</div>
                      <div className="text-[11px] text-rose-700">{item.roleDesc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
