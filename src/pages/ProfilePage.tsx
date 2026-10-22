import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { locationMasterService } from '../services/locationMasterService';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { LocationPickerMap } from '../components/common/LocationPickerMap';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Shield,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Lock,
  Building2,
  Crosshair,
  Compass,
  ExternalLink,
  Copy
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Master Location data
  const [masterStates] = useState(() => locationMasterService.getStates());
  const [masterDistricts] = useState(() => locationMasterService.getDistricts());
  const [masterMandals] = useState(() => locationMasterService.getMandals());
  const [masterPanchayats] = useState(() => locationMasterService.getPanchayats());
  const [masterVillages] = useState(() => locationMasterService.getVillages());

  // Personal fields
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [orgName, setOrgName] = useState(currentUser?.organizationName || '');

  // 5-Tier Location fields
  const [state, setState] = useState('Madhya Pradesh');
  const [district, setDistrict] = useState('Indore');
  const [mandal, setMandal] = useState('Sanwer');
  const [panchayat, setPanchayat] = useState('Kanadia Gram Panchayat');
  const [village, setVillage] = useState('Kanadia');

  // Geographical coordinates (Latitude, Longitude)
  const [lat, setLat] = useState<number>(() => currentUser?.location?.lat ?? 22.7196);
  const [lng, setLng] = useState<number>(() => currentUser?.location?.lng ?? 75.8577);
  const [latInput, setLatInput] = useState<string>(() => String(currentUser?.location?.lat ?? 22.7196));
  const [lngInput, setLngInput] = useState<string>(() => String(currentUser?.location?.lng ?? 75.8577));

  // Confirmation modal for mobile changes
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Initialize from currentUser on mount and role switch
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setMobile(currentUser.mobile || '');
      setOrgName(currentUser.organizationName || '');

      const userStateRaw = currentUser.location?.state || masterStates[0]?.Text || 'Madhya Pradesh';
      const stateObj = masterStates.find(s => s.Text.toLowerCase() === userStateRaw.toLowerCase()) || masterStates[0];
      const validState = stateObj?.Text || 'Madhya Pradesh';

      const dList = stateObj ? masterDistricts.filter(d => String(d.StateId) === String(stateObj.StateId)) : [];
      const distMatch = dList.find(d => d.Text.toLowerCase() === (currentUser.location?.district || '').toLowerCase());
      const validDist = distMatch ? distMatch.Text : (dList[0]?.Text || '');

      const mList = distMatch
        ? masterMandals.filter(m => String(m.DistrictId) === String(distMatch.DistrictId))
        : (dList[0] ? masterMandals.filter(m => String(m.DistrictId) === String(dList[0].DistrictId)) : []);
      const mandalMatch = mList.find(m => m.Text.toLowerCase() === (currentUser.location?.mandal || currentUser.location?.block || '').toLowerCase());
      const validMandal = mandalMatch ? mandalMatch.Text : (mList[0]?.Text || '');

      const pList = mandalMatch
        ? masterPanchayats.filter(p => String(p.MandalId) === String(mandalMatch.MandalId))
        : (mList[0] ? masterPanchayats.filter(p => String(p.MandalId) === String(mList[0].MandalId)) : []);
      const panchayatMatch = pList.find(p => p.Text.toLowerCase() === (currentUser.location?.panchayat || '').toLowerCase());
      const validPanchayat = panchayatMatch ? panchayatMatch.Text : (pList[0]?.Text || '');

      const vList = panchayatMatch
        ? masterVillages.filter(v => String(v.PanchayatId) === String(panchayatMatch.PanchayatId))
        : (pList[0] ? masterVillages.filter(v => String(v.PanchayatId) === String(pList[0].PanchayatId)) : []);
      const villageMatch = vList.find(v => v.Text.toLowerCase() === (currentUser.location?.village || '').toLowerCase());
      const validVillage = villageMatch ? villageMatch.Text : (vList[0]?.Text || '');

      setState(validState);
      setDistrict(validDist);
      setMandal(validMandal);
      setPanchayat(validPanchayat);
      setVillage(validVillage);

      // Coordinates
      const userLat = currentUser.location?.lat ?? 22.7196;
      const userLng = currentUser.location?.lng ?? 75.8577;
      setLat(userLat);
      setLng(userLng);
      setLatInput(String(userLat));
      setLngInput(String(userLng));
    }
  }, [currentUser]);

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

  // Coordinate handlers
  const handleMapLocationChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setLatInput(String(newLat));
    setLngInput(String(newLng));
  };

  const handleLatInputChange = (val: string) => {
    setLatInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -90 && parsed <= 90) {
      setLat(parsed);
    }
  };

  const handleLngInputChange = (val: string) => {
    setLngInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -180 && parsed <= 180) {
      setLng(parsed);
    }
  };

  // Execute update
  const executeProfileSave = () => {
    if (!currentUser) return;

    userService.updateProfile(currentUser.id, {
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      organizationName: orgName.trim(),
      location: {
        ...currentUser.location,
        state: state.trim(),
        district: district.trim(),
        block: mandal.trim(),
        mandal: mandal.trim(),
        panchayat: panchayat.trim(),
        village: village.trim(),
        lat: Number(Number(lat).toFixed(6)),
        lng: Number(Number(lng).toFixed(6))
      }
    });

    refreshUser();
    setConfirmModalOpen(false);
    showToast('Profile Updated', 'Your profile details and location jurisdiction have been saved.', 'success');
  };

  // Submit handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!fullName.trim()) {
      showToast('Validation Error', 'Full Name is required.', 'error');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      showToast('Validation Error', 'Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    // Ask confirmation if mobile number changed
    if (mobile.trim() !== (currentUser.mobile || '').trim()) {
      setConfirmModalOpen(true);
      return;
    }

    executeProfileSave();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-6 animate-fade-in">
      {/* Navigation Breadcrumb / Quick Back to Dashboard */}
      <div className="flex items-center justify-between">
        <Link
          to={
            currentUser?.role === 'Admin' || currentUser?.role === 'superadmin'
              ? '/admin'
              : currentUser?.role === 'CHC'
              ? '/chc-dashboard'
              : currentUser?.role === 'FMC'
              ? '/fmc-dashboard'
              : currentUser?.role === 'LivestockShop'
              ? '/livestock-shop'
              : currentUser?.role === 'Inputstore'
              ? '/input-store'
              : currentUser?.role === 'Facilitator'
              ? '/facilitator'
              : '/farmer'
          }
          className="inline-flex items-center gap-2 text-xs font-bold text-forest-800 hover:text-forest-950 bg-white px-4 py-2.5 rounded-2xl border border-brand-border shadow-xs hover:bg-forest-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-forest-600" />
          <span>Back to My Dashboard ({currentUser?.role})</span>
        </Link>
        <span className="text-xs text-brand-muted hidden sm:inline">
          Profile Settings & Village Geolocation
        </span>
      </div>

      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border pb-6 gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-forest-500 shadow-subtle shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-extrabold text-xl text-forest-900">
                  {currentUser?.fullName}
                </span>
                <StatusBadge status={currentUser?.approvalStatus || 'approved'} />
                {currentUser?.verified && (
                  <span title="Verified User" className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted mt-1">
                Account ID: <strong className="text-forest-900 font-mono">{currentUser?.id}</strong> • Role: <strong className="text-forest-900">{currentUser?.role}</strong> • Status: <strong className="text-forest-900 capitalize">{currentUser?.accountStatus}</strong>
              </p>
            </div>
          </div>

          {/* Quick Location Badge */}
          <div className="px-3.5 py-2 rounded-xl bg-forest-50/70 border border-forest-200 text-right sm:block hidden shrink-0">
            <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wider block">
              Active Jurisdiction & Pin
            </span>
            <span className="text-xs font-semibold text-forest-950 flex items-center justify-end gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-forest-600" />
              {village || currentUser?.location?.village || 'Kanadia'}, {district || currentUser?.location?.district || 'Indore'}
            </span>
            <span className="text-[10.5px] text-forest-700 font-mono block mt-0.5">
              {Number(lat).toFixed(4)}°N, {Number(lng).toFixed(4)}°E
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Identity & Contact Details Section */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm text-forest-900 flex items-center gap-2">
              <User className="w-4 h-4 text-forest-700" />
              Personal & Business Information
            </h3>

            {/* Full Name */}
            <div>
              <label className="block font-semibold text-brand-text mb-1">
                Full Legal Name <span className="text-brand-error">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikram Singh Chaudhary"
                className="w-full p-2.5 rounded-xl border border-brand-border bg-white text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none shadow-xs"
              />
            </div>

            {/* Email & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-brand-text">Registered Email (Read-Only)</label>
                  <span className="text-[10px] text-brand-muted flex items-center gap-1 font-medium">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-brand-border bg-stone-100 text-stone-600 text-xs cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-brand-muted mt-1">
                  To modify your login email address, please contact system administration.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-brand-text">
                    Mobile Contact <span className="text-brand-error">*</span>
                  </label>
                  {currentUser && mobile.trim() !== (currentUser.mobile || '').trim() && (
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
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-brand-border bg-white text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none shadow-xs"
                  />
                </div>
                {currentUser && mobile.trim() !== (currentUser.mobile || '').trim() && (
                  <p className="text-[10px] text-amber-800 mt-1 font-medium flex items-center gap-1">
                    <span>Original:</span>
                    <span className="font-mono bg-amber-50 px-1 py-0.5 rounded text-[10px]">{currentUser.mobile}</span>
                    <span className="text-brand-muted text-[10px]">(Confirmation required upon saving)</span>
                  </p>
                )}
              </div>
            </div>

            {/* Farm / Enterprise Name */}
            <div>
              <label className="block font-semibold text-brand-text mb-1">
                Farm / Centre / Enterprise Name
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Malwa Kisan Custom Hiring Centre"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-brand-border bg-white text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* 5-TIER LOCATION & ADMINISTRATIVE JURISDICTION (Same as Add / Edit User) */}
          <div className="p-5 rounded-2xl border border-brand-border bg-cream-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border/70 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-forest-700" />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-forest-900">
                    Location & Administrative Jurisdiction
                  </h4>
                  <p className="text-[10.5px] text-brand-muted">
                    Manage your regional assignment across state, district, mandal, panchayat, and village levels.
                  </p>
                </div>
              </div>
              <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full bg-forest-100 text-forest-800 border border-forest-200 self-start sm:self-auto">
                5-Tier Hierarchy
              </span>
            </div>

            {/* Current path breadcrumb pill */}
            <div className="px-3.5 py-2 rounded-xl bg-white border border-brand-border text-xs flex items-center gap-2 flex-wrap text-brand-muted">
              <span className="font-bold text-forest-900 uppercase text-[10px] tracking-wider">Path:</span>
              <span className="font-medium text-forest-900">{state}</span>
              <span>➔</span>
              <span className="font-medium text-forest-900">{district}</span>
              <span>➔</span>
              <span className="font-medium text-forest-900">{mandal}</span>
              <span>➔</span>
              <span className="font-medium text-forest-900">{panchayat}</span>
              <span>➔</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {village}
              </span>
            </div>

            {/* Row 1: State & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  State <span className="text-brand-error">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none shadow-xs font-medium"
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
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none shadow-xs font-medium"
                >
                  {availableDistrictsForState.map((d) => (
                    <option key={d.DistrictId} value={d.Text}>{d.Text}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Mandal, Panchayat, Village (Strict Dropdown Selection - No Custom Input) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Mandal / Block */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Mandal / Block <span className="text-brand-error">*</span>
                </label>
                <select
                  value={mandal}
                  onChange={(e) => handleMandalChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none shadow-xs font-medium"
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
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none shadow-xs font-medium"
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
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none shadow-xs font-medium"
                >
                  {availableVillagesForPanchayat.map((v) => (
                    <option key={v.VillageId} value={v.Text}>{v.Text}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Strict Master Geographic Validation:</strong> Custom entries for village, panchayat, mandal, or state are not permitted. Every regional jurisdiction must map to verified official records.
              </span>
            </div>

            {/* Geo-Coordinates & Pinpoint Location Marking Section */}
            <div className="pt-4 border-t border-brand-border/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
                    <Crosshair className="w-4 h-4 text-forest-700" />
                  </div>
                  <div>
                    <h5 className="font-heading font-extrabold text-xs text-forest-900 uppercase tracking-wider">
                      Mark Location Coordinates (Latitude, Longitude)
                    </h5>
                    <p className="text-[11px] text-brand-muted">
                      Click anywhere on the map or drag the pin marker to pin your exact farm or operational center.
                    </p>
                  </div>
                </div>

                {/* Readout Pill & Google Maps Link */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-brand-border text-forest-900 text-xs font-mono font-bold shadow-xs">
                    <MapPin className="w-3.5 h-3.5 text-forest-600" />
                    <span>{Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white border border-brand-border hover:bg-cream-100 text-brand-muted hover:text-forest-700 transition-colors shadow-xs"
                    title="View coordinates on Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Numerical Lat/Lng Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1 flex items-center justify-between">
                    <span>Latitude (°N)</span>
                    <span className="text-[10px] text-brand-muted font-normal">Range: -90.00 to 90.00</span>
                  </label>
                  <div className="relative">
                    <Compass className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      type="number"
                      step="0.000001"
                      value={latInput}
                      onChange={(e) => handleLatInputChange(e.target.value)}
                      placeholder="e.g. 22.719568"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-brand-border bg-white font-mono text-forest-950 focus:ring-2 focus:ring-forest-500 focus:outline-none shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1 flex items-center justify-between">
                    <span>Longitude (°E)</span>
                    <span className="text-[10px] text-brand-muted font-normal">Range: -180.00 to 180.00</span>
                  </label>
                  <div className="relative">
                    <Compass className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      type="number"
                      step="0.000001"
                      value={lngInput}
                      onChange={(e) => handleLngInputChange(e.target.value)}
                      placeholder="e.g. 75.857725"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-brand-border bg-white font-mono text-forest-950 focus:ring-2 focus:ring-forest-500 focus:outline-none shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Location Picker Map */}
              <div className="space-y-1.5 pt-1">
                <LocationPickerMap
                  lat={lat}
                  lng={lng}
                  onChange={handleMapLocationChange}
                  zoom={13}
                  heightClass="h-72 sm:h-80"
                />
                <div className="flex items-center justify-between text-[11px] text-brand-muted px-1 flex-wrap gap-2">
                  <span>💡 Tip: Click anywhere on the map or drag the pin marker to mark your location.</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${lat}, ${lng}`);
                      showToast('Copied to Clipboard', `Coordinates ${lat}, ${lng} copied.`, 'info');
                    }}
                    className="inline-flex items-center gap-1 text-forest-700 hover:text-forest-900 font-semibold cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Copy Lat/Long
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-brand-border">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* CONFIRM MOBILE CHANGE MODAL */}
      {confirmModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border w-full max-w-md overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-brand-border bg-amber-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-forest-900">
                    Confirm Mobile Number Update
                  </h3>
                  <p className="text-[11px] text-brand-muted">
                    Primary contact & OTP authentication update
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="text-brand-muted hover:text-brand-text p-1 rounded-lg hover:bg-amber-100/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 mb-1 text-amber-900">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  Important Security Notice
                </p>
                You are changing your registered mobile number. All future login OTPs, transaction alerts, and service notifications will be sent to the new mobile number.
              </div>

              <div className="p-3.5 rounded-xl border border-brand-border bg-cream-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-muted" />
                    Mobile Number
                  </span>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Changing
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs pt-1">
                  <span className="line-through text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 font-mono truncate flex-1">
                    {currentUser.mobile}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-mono truncate flex-1">
                    {mobile}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-brand-border text-brand-muted hover:text-brand-text hover:bg-cream-100 transition-colors"
                >
                  Go Back & Review
                </button>
                <button
                  type="button"
                  onClick={executeProfileSave}
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
    </div>
  );
};
