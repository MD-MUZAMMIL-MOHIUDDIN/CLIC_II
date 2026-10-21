import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Save,
  CheckCircle2
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [orgName, setOrgName] = useState(currentUser?.organizationName || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    userService.updateProfile(currentUser.id, {
      fullName,
      mobile,
      organizationName: orgName
    });

    refreshUser();
    showToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-brand-border pb-5">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-forest-500 shadow-subtle shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xl text-forest-900">
                  {currentUser?.fullName}
                </span>
                <StatusBadge status={currentUser?.approvalStatus || 'approved'} />
              </div>
              <p className="text-xs text-brand-muted mt-0.5">
                Role: <strong>{currentUser?.role}</strong> • Account: <strong>{currentUser?.accountStatus}</strong>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-brand-text mb-1">Full Legal Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-brand-text mb-1">Registered Email (Read-Only)</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full p-2.5 rounded-xl border border-brand-border bg-stone-100 text-stone-600 text-xs cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold text-brand-text mb-1">Mobile Contact</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-brand-text mb-1">Farm / Centre / Enterprise Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div className="p-4 bg-cream-50 rounded-2xl border border-brand-border space-y-1">
            <span className="font-bold text-forest-900 block">Registered Geographic Jurisdiction</span>
            <p className="text-[11px] text-brand-muted">
              {currentUser?.location.village}, {currentUser?.location.block}, {currentUser?.location.district}, {currentUser?.location.state}
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
