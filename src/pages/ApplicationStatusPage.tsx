import React, { useState } from 'react';
import { approvalService } from '../services/approvalService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RegistrationApplication } from '../types';
import { Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export const ApplicationStatusPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [searchRef, setSearchRef] = useState(
    currentUser?.id === 'usr_pending_chc' ? 'app_1001' : currentUser?.id === 'usr_rejected_fmc' ? 'app_1004' : 'app_1001'
  );
  const [application, setApplication] = useState<RegistrationApplication | null>(
    () => approvalService.getApplicationById(searchRef) || approvalService.getApplications()[0]
  );
  const [correctionText, setCorrectionText] = useState('');
  const [resubmitted, setResubmitted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const app = approvalService.getApplicationById(searchRef.trim()) ||
      approvalService.getApplications().find(a => a.applicantEmail.toLowerCase() === searchRef.trim().toLowerCase());

    if (app) {
      setApplication(app);
      setResubmitted(false);
    } else {
      showToast('Application Not Found', 'Please enter a valid Application ID (e.g., app_1001, app_1002).', 'error');
    }
  };

  const handleResubmitCorrections = () => {
    if (!application) return;
    const res = approvalService.updateApplicationCorrections(application.id, {
      decisionReason: `Applicant submitted corrections: ${correctionText || 'Updated documentation attached.'}`
    });
    if (res.success && res.application) {
      setApplication(res.application);
      setResubmitted(true);
      showToast('Corrections Resubmitted', 'Application returned to the review queue for re-inspection.', 'success');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="font-heading font-extrabold text-3xl text-forest-900">
          Check Application Status
        </h1>
        <p className="text-xs text-brand-muted max-w-md mx-auto">
          Enter your Application Reference Number or registered email to track verification progress.
        </p>
      </div>

      {/* Lookup Bar */}
      <form onSubmit={handleSearch} className="bg-white p-3 rounded-2xl border border-brand-border shadow-subtle flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder="e.g. app_1001, app_1002, app_1003 or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle"
        >
          Check Status
        </button>
      </form>

      {/* Application Status Card */}
      {application && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cream-200 text-brand-text">
                Reference ID: {application.id}
              </span>
              <h3 className="font-heading font-bold text-xl text-forest-900 mt-1">
                {application.applicantName}
              </h3>
              <p className="text-xs text-brand-muted">
                Applied Role: <strong>{application.requestedRole}</strong> • {application.location.district}, {application.location.state}
              </p>
            </div>

            {/* Status Indicator */}
            <div>
              {application.status === 'approved' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approved & Activated</span>
                </div>
              )}
              {application.status === 'pending' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Pending Facilitator Review</span>
                </div>
              )}
              {application.status === 'under_review' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Field Verification In-Progress</span>
                </div>
              )}
              {application.status === 'corrections_requested' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span>Corrections Required</span>
                </div>
              )}
              {application.status === 'rejected' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Application Rejected</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-cream-50 p-4 rounded-2xl border border-brand-border">
            <div>
              <span className="text-brand-muted block">Submission Date:</span>
              <strong className="text-brand-text">{application.submittedAt.split('T')[0]}</strong>
            </div>
            <div>
              <span className="text-brand-muted block">Assigned Facilitator:</span>
              <strong className="text-brand-text">{application.assignedFacilitatorId ? 'Regional Office (Indore)' : 'Central Desk'}</strong>
            </div>
            <div>
              <span className="text-brand-muted block">Documents Attached:</span>
              <strong className="text-brand-text">{application.documents?.length || 1} Document(s)</strong>
            </div>
          </div>

          {/* Reviewer Note / Decision Reason */}
          {application.decisionReason && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
              application.status === 'rejected'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : application.status === 'corrections_requested'
                ? 'bg-orange-50 border-orange-200 text-orange-950'
                : 'bg-cream-100 border-brand-border text-brand-text'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Verification Officer Remarks:</span>
              </div>
              <p className="text-[11px]">{application.decisionReason}</p>
            </div>
          )}

          {/* Corrections Resubmission Box */}
          {application.status === 'corrections_requested' && !resubmitted && (
            <div className="p-5 bg-white rounded-2xl border-2 border-dashed border-orange-300 space-y-3">
              <h4 className="font-heading font-bold text-xs text-forest-900">
                Update & Resubmit Required Documents
              </h4>
              <textarea
                rows={3}
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                placeholder="Describe the corrections made and updated license or registration number..."
                className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleResubmitCorrections}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Corrections</span>
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-brand-muted">
              Questions? Call <strong>1800-180-1551</strong>
            </span>
            {application.status === 'approved' ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle"
              >
                <span>Proceed to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/"
                className="text-xs font-semibold text-forest-700 hover:underline"
              >
                Return to Home
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
