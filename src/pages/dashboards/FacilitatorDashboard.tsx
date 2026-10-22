import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { RegistrationApplication, ApprovalStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  MapPin,
  Eye,
  Check,
  X,
  Send
} from 'lucide-react';

export const FacilitatorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [applications, setApplications] = useState<RegistrationApplication[]>(() =>
    approvalService.getApplications()
  );
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Drawer / Modal
  const [selectedApp, setSelectedApp] = useState<RegistrationApplication | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_corrections' | null>(null);

  const filteredApps = applications.filter((app) => {
    if (statusFilter !== 'All' && app.status !== statusFilter) return false;
    if (roleFilter !== 'All' && app.requestedRole !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        app.applicantName.toLowerCase().includes(q) ||
        app.applicantEmail.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleReviewAction = () => {
    if (!selectedApp || !actionType) return;

    if ((actionType === 'reject' || actionType === 'request_corrections') && (!decisionReason || decisionReason.trim().length < 5)) {
      alert('Please provide a mandatory explanatory note for this decision.');
      return;
    }

    const res = approvalService.reviewApplication({
      applicationId: selectedApp.id,
      reviewerId: currentUser?.id || 'usr_facilitator_1',
      action: actionType,
      decisionReason: decisionReason
    });

    if (res.success) {
      setApplications(approvalService.getApplications());
      showToast(
        actionType === 'approve' ? 'Registration Approved' : actionType === 'reject' ? 'Registration Rejected' : 'Corrections Requested',
        `Applicant ${selectedApp.applicantName} record updated.`,
        actionType === 'approve' ? 'success' : 'info'
      );
      setSelectedApp(null);
      setActionType(null);
      setDecisionReason('');
    } else {
      alert(res.error || 'Failed to submit review.');
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-800 text-white flex items-center justify-center font-bold shadow-subtle shrink-0">
            <ShieldCheck className="w-8 h-8 text-harvest" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                Village Facilitator Desk
              </span>
              <span className="text-xs text-brand-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest-600" />
                {currentUser?.location?.village || 'Kanadia'} Village & {currentUser?.location?.mandal || 'Sanwer'} Block • {currentUser?.location?.district || 'Indore'} ({currentUser?.location?.state || 'MP'})
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              Field Registration Review Queue
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Facilitator: <strong>{currentUser?.fullName || 'Rameshwar Sharma'}</strong> • Review and verify local farmer & provider credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border text-xs font-semibold text-brand-text hover:bg-forest-50 transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-forest-600" />
            Profile & Geolocation
          </Link>
          <div className="text-right pl-3 border-l border-brand-border">
            <span className="text-xs text-brand-muted">Total in Queue:</span>
            <div className="font-heading font-extrabold text-2xl text-forest-900">{applications.length}</div>
          </div>
        </div>
      </div>

      {/* Queue Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Pending Verification</div>
          <div className="text-2xl font-heading font-extrabold text-amber-700 mt-1">
            {applications.filter(a => a.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Under Field Review</div>
          <div className="text-2xl font-heading font-extrabold text-blue-700 mt-1">
            {applications.filter(a => a.status === 'under_review').length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Corrections Requested</div>
          <div className="text-2xl font-heading font-extrabold text-orange-700 mt-1">
            {applications.filter(a => a.status === 'corrections_requested').length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Approved & Activated</div>
          <div className="text-2xl font-heading font-extrabold text-emerald-700 mt-1">
            {applications.filter(a => a.status === 'approved').length}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by applicant name, email, or application ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
          >
            <option value="All">All Verification Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="corrections_requested">Corrections Requested</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
          >
            <option value="All">All Requested Roles</option>
            <option value="CHC">Custom Hiring Centre (CHC)</option>
            <option value="FMC">Farm Machinery Centre (FMC)</option>
            <option value="Farmer">Farmer</option>
            <option value="LivestockShop">Livestock Shop</option>
            <option value="Inputstore">Input Store</option>
          </select>
        </div>
      </div>

      {/* Review Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Ref ID</th>
                <th className="py-3 px-3">Applicant Name</th>
                <th className="py-3 px-3">Requested Role</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Submitted</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-cream-50/50">
                  <td className="py-3.5 px-3 font-bold text-forest-800">{app.id}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-forest-900">{app.applicantName}</div>
                    <div className="text-[11px] text-brand-muted">{app.applicantEmail}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-brand-text bg-cream-100 px-2 py-0.5 rounded-md border border-brand-border">
                      {app.requestedRole}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-brand-muted">
                    {app.location.district}, {app.location.state}
                  </td>
                  <td className="py-3.5 px-3 text-brand-muted">
                    {app.submittedAt.split('T')[0]}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setActionType(null);
                        setDecisionReason(app.decisionReason || '');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-xs font-semibold text-forest-700 hover:bg-cream-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Application</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Inspection & Action Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-brand-border bg-forest-50/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-200/60 text-forest-800">
                  Application Review: {selectedApp.id}
                </span>
                <h3 className="font-heading font-bold text-lg text-forest-900 mt-1">
                  {selectedApp.applicantName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-text"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-brand-text">
              <div className="grid grid-cols-2 gap-4 bg-cream-50 p-4 rounded-2xl border border-brand-border">
                <div>
                  <span className="text-brand-muted block">Applicant Email:</span>
                  <strong className="text-forest-900">{selectedApp.applicantEmail}</strong>
                </div>
                <div>
                  <span className="text-brand-muted block">Phone Contact:</span>
                  <strong className="text-forest-900">{selectedApp.applicantMobile}</strong>
                </div>
                <div>
                  <span className="text-brand-muted block">Requested Role:</span>
                  <strong className="text-forest-900">{selectedApp.requestedRole}</strong>
                </div>
                <div>
                  <span className="text-brand-muted block">Jurisdiction Location:</span>
                  <strong className="text-forest-900">{selectedApp.location.village}, {selectedApp.location.district}</strong>
                </div>
              </div>

              {/* Documents Inspection */}
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-xs text-forest-900">
                  Uploaded Verification Credentials
                </h4>
                <div className="space-y-2">
                  {selectedApp.documents?.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-cream-50">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-forest-600" />
                        <div>
                          <div className="font-bold text-forest-900">{doc.type}</div>
                          <div className="text-[11px] text-brand-muted">{doc.fileName} • Ref: {doc.docNumber}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        OCR Validated
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Selector */}
              <div className="space-y-3 pt-2 border-t border-brand-border">
                <h4 className="font-heading font-bold text-xs text-forest-900">
                  Select Verification Outcome
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('approve')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      actionType === 'approve'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600 font-bold'
                        : 'border-brand-border text-brand-muted hover:bg-cream-50'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                    <span>Approve Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('request_corrections')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      actionType === 'request_corrections'
                        ? 'border-orange-600 bg-orange-50 text-orange-950 ring-2 ring-orange-600 font-bold'
                        : 'border-brand-border text-brand-muted hover:bg-cream-50'
                    }`}
                  >
                    <AlertCircle className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                    <span>Request Corrections</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('reject')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      actionType === 'reject'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-600 font-bold'
                        : 'border-brand-border text-brand-muted hover:bg-cream-50'
                    }`}
                  >
                    <XCircle className="w-5 h-5 mx-auto mb-1 text-rose-600" />
                    <span>Reject Application</span>
                  </button>
                </div>
              </div>

              {/* Mandatory Reason Input */}
              {actionType && (
                <div className="space-y-1.5 animate-slide-down">
                  <label className="block font-semibold text-brand-text">
                    {actionType === 'approve' ? 'Verification Inspection Notes (Optional)' : 'Mandatory Reason / Correction Request:'}
                  </label>
                  <textarea
                    rows={3}
                    required={actionType !== 'approve'}
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder={
                      actionType === 'approve'
                        ? 'e.g. Physical centre inspection and RC books verified in order.'
                        : 'e.g. Expired license uploaded, please re-upload valid certificate issued by Dept of Agriculture.'
                    }
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-brand-border bg-cream-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text hover:bg-cream-200 border border-brand-border"
              >
                Close
              </button>

              {actionType && (
                <button
                  onClick={handleReviewAction}
                  className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-forest-600 hover:bg-forest-700 shadow-subtle flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Commit Verification Decision</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
