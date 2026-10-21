import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Handle pending or under review accounts
  if (currentUser.approvalStatus === 'pending' || currentUser.approvalStatus === 'under_review' || currentUser.approvalStatus === 'corrections_requested') {
    return <Navigate to="/application-status" replace />;
  }

  // Handle rejected accounts
  if (currentUser.approvalStatus === 'rejected') {
    return <Navigate to="/application-status" replace />;
  }

  // Handle suspended accounts
  if (currentUser.accountStatus === 'suspended') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-elevation border border-brand-error/20 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-brand-error flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-bold text-xl text-forest-900">Account Suspended</h2>
          <p className="text-xs text-brand-muted mt-2 leading-relaxed">
            Your account ({currentUser.email}) has been temporarily suspended by administrative review. Please contact the platform administration helpline at 1800-180-1551.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl bg-forest-600 text-white font-semibold text-xs shadow-subtle hover:bg-forest-700"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle role restrictions
  if (allowedRoles && !allowedRoles.includes(currentUser.role) && currentUser.role !== 'superadmin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-elevation border border-brand-border p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-bold text-xl text-forest-900">Access Restricted</h2>
          <p className="text-xs text-brand-muted mt-2 leading-relaxed">
            This module is restricted to <strong>{allowedRoles.join(', ')}</strong> roles. Your current active role is <strong>{currentUser.role}</strong>.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-brand-border text-xs font-semibold text-brand-text hover:bg-cream-100"
            >
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Link>
            <Link
              to={currentUser.role === 'Farmer' ? '/farmer' : '/admin'}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-forest-600 text-white text-xs font-semibold hover:bg-forest-700 shadow-subtle"
            >
              <RefreshCw className="w-4 h-4" /> Go to My Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
