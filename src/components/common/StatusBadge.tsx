import React from 'react';
import { ApprovalStatus, AccountStatus } from '../../types';

interface StatusBadgeProps {
  status: ApprovalStatus | AccountStatus | string;
  type?: 'approval' | 'account' | 'booking' | 'consultation' | 'general';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'confirmed':
      case 'Responded':
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'pending':
      case 'pending_approval':
      case 'Submitted':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'under_review':
      case 'Under Review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Scheduled':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'corrections_requested':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'rejected':
      case 'suspended':
      case 'cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'inactive':
        return 'bg-stone-100 text-stone-700 border-stone-300';
      default:
        return 'bg-cream-200 text-brand-text border-brand-border';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'under_review':
        return 'Under Review';
      case 'corrections_requested':
        return 'Corrections Needed';
      case 'pending_approval':
        return 'Pending Approval';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {getLabel()}
    </span>
  );
};
