import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { locationMasterService } from '../services/locationMasterService';
import {
  Building2,
  Tractor,
  User,
  ShoppingBag,
  Store,
  CheckCircle2,
  ShieldCheck,
  Upload,
  ArrowRight,
  Sparkles,
  AlertCircle,
  MapPin
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  // Location Master Data
  const [masterStates] = useState(() => locationMasterService.getStates());
  const [masterDistricts] = useState(() => locationMasterService.getDistricts());
  const [masterMandals] = useState(() => locationMasterService.getMandals());
  const [masterPanchayats] = useState(() => locationMasterService.getPanchayats());
  const [masterVillages] = useState(() => locationMasterService.getVillages());

  // Registration step
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Farmer' | 'CHC' | 'FMC' | 'LivestockShop' | 'Inputstore'>('Farmer');

  const [state, setState] = useState(masterStates[0]?.Text || 'Madhya Pradesh');
  const [district, setDistrict] = useState('Indore');
  const [mandal, setMandal] = useState('Sanwer');
  const [panchayat, setPanchayat] = useState('Kanadia Gram Panchayat');
  const [village, setVillage] = useState('Kanadia');

  const [organizationName, setOrganizationName] = useState('');
  const [consent, setConsent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Role-Specific Fields
  // Farmer
  const [landSizeAcres, setLandSizeAcres] = useState('8.5');
  const [primaryCrops, setPrimaryCrops] = useState('Wheat, Soybean, Gram');
  const [irrigationSource, setIrrigationSource] = useState('Borewell + Drip');

  // CHC / FMC
  const [fleetCount, setFleetCount] = useState('4');
  const [serviceCoverageKm, setServiceCoverageKm] = useState('35');

  // Document Upload Mock
  const [docUploaded, setDocUploaded] = useState(true);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (!consent) {
      setErrorMsg('Please review and agree to the Agricultural Extension & Verification terms.');
      return;
    }

    // Role-specific payload
    let roleSpecificData: Record<string, any> = {};
    let docs: any[] = [];

    if (selectedRole === 'Farmer') {
      roleSpecificData = {
        landSizeAcres: Number(landSizeAcres),
        primaryCrops: primaryCrops.split(',').map(s => s.trim()),
        irrigationSource
      };
      docs.push({
        type: 'Kisan Credit Card / Land Passbook',
        docNumber: `KCC-${Date.now().toString().slice(-5)}`,
        fileName: 'kisan_passbook_verified.pdf'
      });
    } else if (selectedRole === 'CHC' || selectedRole === 'FMC') {
      roleSpecificData = {
        initialFleetCount: Number(fleetCount),
        serviceCoverageKm: Number(serviceCoverageKm)
      };
      docs.push({
        type: 'Centre GST / Accreditation Certificate',
        docNumber: `SMAM-${Date.now().toString().slice(-6)}`,
        fileName: 'accreditation_certificate.pdf'
      });
    } else {
      docs.push({
        type: 'Agricultural Business Retail License',
        docNumber: `LIC-${Date.now().toString().slice(-5)}`,
        fileName: 'retail_trade_license.pdf'
      });
    }

    const res = register({
      fullName,
      email,
      mobile,
      requestedRole: selectedRole,
      organizationName: organizationName || fullName,
      location: {
        state,
        district,
        block,
        village: village || 'Gram Panchayat Office'
      },
      roleSpecificData,
      documents: docs
    });

    if (res.success && res.application) {
      setSubmittedApp(res.application);
      showToast('Application Submitted!', `Application ${res.application.id} is now queued for facilitator review.`, 'success');
    } else {
      setErrorMsg(res.error || 'Registration failed. Please check your information.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-harvest-dark" />
          <span>National Agricultural Service Onboarding</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest-900">
          Register Your Agricultural Profile
        </h1>
        <p className="text-xs text-brand-muted leading-relaxed">
          Self-register as a Farmer, Custom Hiring Centre (CHC), Farm Machinery owner, or Livestock/Input Store.
        </p>
      </div>

      {!submittedApp ? (
        <form onSubmit={handleRegister} className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-elevation space-y-8">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-brand-error/30 text-rose-900 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-brand-error shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-2">
              Step 1: Choose Your Agricultural Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { role: 'Farmer', label: 'Farmer', icon: User, desc: 'Cultivator' },
                { role: 'CHC', label: 'CHC Centre', icon: Building2, desc: 'Hiring Centre' },
                { role: 'FMC', label: 'FMC Hub', icon: Tractor, desc: 'Machinery Fleet' },
                { role: 'LivestockShop', label: 'Livestock', icon: ShoppingBag, desc: 'Animals & Feed' },
                { role: 'Inputstore', label: 'Input Store', icon: Store, desc: 'Bio & Seeds' }
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role as any)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    selectedRole === item.role
                      ? 'border-forest-600 bg-forest-50 text-forest-900 ring-2 ring-forest-600 font-bold'
                      : 'border-brand-border text-brand-muted hover:bg-cream-50'
                  }`}
                >
                  <item.icon className="w-5 h-5 text-forest-600" />
                  <span className="text-xs">{item.label}</span>
                  <span className="text-[10px] text-brand-muted font-normal block">{item.desc}</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-brand-muted mt-2">
              Note: Facilitator, Administrator, and Scientist accounts are issued under authorized institutional oversight and cannot be self-registered.
            </p>
          </div>

          {/* Basic User Information */}
          <div className="space-y-4 pt-2 border-t border-brand-border">
            <h3 className="font-heading font-bold text-sm text-forest-900">
              Step 2: Basic Contact & Identity Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rameshwar Patel"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Mobile Number (Aadhaar / WhatsApp Linked)</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rameshwar@krishiseva.in"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  {selectedRole === 'Farmer' ? 'Farm / Holding Name (Optional)' : 'Registered Business / Centre Name'}
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder={selectedRole === 'Farmer' ? 'Patel Farms' : 'Malwa Kisan Machinery Hub'}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Create Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Regional Location */}
          <div className="space-y-4 pt-2 border-t border-brand-border">
            <h3 className="font-heading font-bold text-sm text-forest-900">
              Step 3: Service Location & Jurisdiction
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                >
                  {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                >
                  {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Tehsil / Block</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="Sanwer"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Village / Gram Panchayat</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Kanadia"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC ROLE-SPECIFIC FIELDS */}
          <div className="space-y-4 pt-2 border-t border-brand-border">
            <h3 className="font-heading font-bold text-sm text-forest-900">
              Step 4: Role-Specific Operational Details ({selectedRole})
            </h3>

            {selectedRole === 'Farmer' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Operational Land Holding (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={landSizeAcres}
                    onChange={(e) => setLandSizeAcres(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Primary Crops Grown</label>
                  <input
                    type="text"
                    value={primaryCrops}
                    onChange={(e) => setPrimaryCrops(e.target.value)}
                    placeholder="Wheat, Gram, Mustard"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Primary Irrigation System</label>
                  <input
                    type="text"
                    value={irrigationSource}
                    onChange={(e) => setIrrigationSource(e.target.value)}
                    placeholder="Drip + Borewell"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {(selectedRole === 'CHC' || selectedRole === 'FMC') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Initial Machinery Fleet Count</label>
                  <input
                    type="number"
                    value={fleetCount}
                    onChange={(e) => setFleetCount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Operational Radius Coverage (km)</label>
                  <input
                    type="number"
                    value={serviceCoverageKm}
                    onChange={(e) => setServiceCoverageKm(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Document Upload Mock */}
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Verification Documentation (Aadhaar / Land Record / GST / SMAM Approval)
              </label>
              <div
                onClick={() => setDocUploaded(!docUploaded)}
                className="border-2 border-dashed border-forest-300 bg-forest-50/40 rounded-2xl p-4 text-center cursor-pointer hover:bg-forest-50 transition-colors"
              >
                <Upload className="w-5 h-5 text-forest-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-forest-900">
                  {docUploaded ? 'Attached: registration_verification_docs.pdf (Uploaded)' : 'Click to attach supporting PDF/JPG'}
                </p>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  Facilitators inspect uploaded documents before granting dashboard access.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2 border-t border-brand-border">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-brand-muted leading-relaxed">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-forest-600 accent-forest-600"
              />
              <span>
                I hereby declare that the agricultural information and verification documents provided are authentic. I agree that my account status will remain <strong>Pending Approval</strong> until local field verification is completed by an authorized regional facilitator.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-heading font-bold text-xs text-white bg-forest-600 hover:bg-forest-700 shadow-elevation transition-all flex items-center justify-center gap-2"
          >
            <span>Submit Registration Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* Successful Submission Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-border shadow-elevation text-center space-y-5 animate-scale-up">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-subtle">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900">
            Registration Application Received!
          </h2>

          <p className="text-xs text-brand-muted max-w-lg mx-auto leading-relaxed">
            Thank you, <strong>{submittedApp.applicantName}</strong>. Your self-registration application for role <strong>{submittedApp.requestedRole}</strong> has entered the regional review queue.
          </p>

          <div className="bg-cream-50 p-5 rounded-2xl border border-brand-border max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-muted">Application Tracking ID:</span>
              <strong className="text-forest-800 font-extrabold text-sm">{submittedApp.id}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Approval Status:</span>
              <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full text-[10.5px]">
                Pending Verification
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Account Status:</span>
              <span className="font-semibold text-stone-700">Inactive (Awaiting Approval)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Submitted At:</span>
              <span className="text-brand-text">{submittedApp.submittedAt.split('T')[0]}</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 max-w-lg mx-auto text-xs text-amber-950 text-left space-y-1">
            <strong className="block text-amber-900">What Happens Next?</strong>
            <p className="text-[11px] leading-relaxed text-amber-900">
              An authorized Facilitator or Platform Administrator will verify your records against local agricultural land and machinery registries. Once approved, you will receive an SMS and email notification granting full dashboard access.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap gap-3 justify-center">
            <Link
              to="/application-status"
              className="px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle transition-all"
            >
              Track Application Progress
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 rounded-xl bg-white border border-brand-border text-brand-text font-semibold text-xs hover:bg-cream-100 transition-all"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
