import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  MapPin,
  ChevronRight,
  Smartphone,
  Users,
  Layers
} from 'lucide-react';

interface QuickUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  org: string;
  village: string;
  panchayat: string;
  hierarchy: string;
  targetRoute: string;
  setNumber: 'Set 1' | 'Set 2' | 'Set 3' | 'Set 4' | 'Admin';
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickSwitchRole } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('farmer@krishiseva.in');
  const [password, setPassword] = useState('kisan@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // View toggle: 'village' (Cluster Sets for Testing) or 'role' (Role Categories)
  const [viewMode, setViewMode] = useState<'village' | 'role'>('village');
  const [activeVillageSet, setActiveVillageSet] = useState<'set1' | 'set2' | 'set3' | 'set4' | 'admin'>('set1');
  const [activeRoleCategory, setActiveRoleCategory] = useState<'farmer' | 'chc' | 'fmc' | 'input' | 'livestock' | 'facilitator' | 'admin'>('farmer');

  // Master List of all 21 Verified Stakeholders
  const allUsers: QuickUser[] = [
    // === VILLAGE SET 1 (Kanadia - Complete Testing Cluster) ===
    {
      id: 'usr_farmer_1',
      name: 'Rameshwar Patel',
      email: 'farmer@krishiseva.in',
      mobile: '9876543210',
      role: 'Farmer',
      org: 'Patel Organic Farms (14 Acres)',
      village: 'Kanadia',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Kanadia',
      setNumber: 'Set 1',
      targetRoute: '/farmer'
    },
    {
      id: 'usr_chc_1',
      name: 'Vikram Singh Chaudhary',
      email: 'chc@krishiseva.in',
      mobile: '9823456781',
      role: 'CHC',
      org: 'Malwa Kisan Custom Hiring Centre',
      village: 'Kanadia',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Kanadia',
      setNumber: 'Set 1',
      targetRoute: '/chc-dashboard'
    },
    {
      id: 'usr_fmc_1',
      name: 'Sukhwinder Dhillon',
      email: 'fmc@krishiseva.in',
      mobile: '9712345672',
      role: 'FMC',
      org: 'Dhillon Farm Machinery & Spares',
      village: 'Kanadia',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Kanadia',
      setNumber: 'Set 1',
      targetRoute: '/fmc-dashboard'
    },
    {
      id: 'usr_input_1',
      name: 'Meera Venkataraman',
      email: 'inputstore@krishiseva.in',
      mobile: '9845678914',
      role: 'Inputstore',
      org: 'Prithvi Bio-Inputs & Organic Seeds',
      village: 'Kanadia',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Kanadia',
      setNumber: 'Set 1',
      targetRoute: '/input-store'
    },
    {
      id: 'usr_livestock_1',
      name: 'Anil Kumar Yadav',
      email: 'livestock@krishiseva.in',
      mobile: '9934567893',
      role: 'LivestockShop',
      org: 'Gopalak Dairy & Livestock Breed Center',
      village: 'Kanadia',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Kanadia',
      setNumber: 'Set 1',
      targetRoute: '/livestock-shop'
    },
    {
      id: 'usr_facilitator_1',
      name: 'Pooja Sharma',
      email: 'facilitator@krishiseva.in',
      mobile: '9765432105',
      role: 'Facilitator',
      org: 'Kanadia Gram Panchayat Agro Extension Unit',
      village: 'Kanadia',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Kanadia',
      setNumber: 'Set 1',
      targetRoute: '/facilitator'
    },

    // === VILLAGE SET 2 (Semliya Chau - Complete Testing Cluster) ===
    {
      id: 'usr_farmer_2',
      name: 'Jagdish Prasad Sharma',
      email: 'farmer2@krishiseva.in',
      mobile: '9826123451',
      role: 'Farmer',
      org: 'Sharma Natural Agro (18 Acres)',
      village: 'Semliya Chau',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Semliya Chau',
      setNumber: 'Set 2',
      targetRoute: '/farmer'
    },
    {
      id: 'usr_chc_2',
      name: 'Dharmendra Solanki',
      email: 'chc2@krishiseva.in',
      mobile: '9823456782',
      role: 'CHC',
      org: 'Balram Agri Drone & Harvester Hub',
      village: 'Semliya Chau',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Semliya Chau',
      setNumber: 'Set 2',
      targetRoute: '/chc-dashboard'
    },
    {
      id: 'usr_fmc_2',
      name: 'Rajesh Gehlot',
      email: 'fmc2@krishiseva.in',
      mobile: '9712345673',
      role: 'FMC',
      org: 'Narmada Agro Implements & Spares',
      village: 'Semliya Chau',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Semliya Chau',
      setNumber: 'Set 2',
      targetRoute: '/fmc-dashboard'
    },
    {
      id: 'usr_input_2',
      name: 'Arvind Kumar Joshi',
      email: 'input2@krishiseva.in',
      mobile: '9845678915',
      role: 'Inputstore',
      org: 'Shanti Krishi Seva Kendra (Fertilizers & Pesticides)',
      village: 'Semliya Chau',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Semliya Chau',
      setNumber: 'Set 2',
      targetRoute: '/input-store'
    },
    {
      id: 'usr_livestock_2',
      name: 'Radheshyam Yadav',
      email: 'livestock2@krishiseva.in',
      mobile: '9934567894',
      role: 'LivestockShop',
      org: 'Kamdhenu Cattle Feed & Veterinary Supplies',
      village: 'Semliya Chau',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Semliya Chau',
      setNumber: 'Set 2',
      targetRoute: '/livestock-shop'
    },
    {
      id: 'usr_facilitator_2',
      name: 'Manoj Parmar',
      email: 'facilitator2@krishiseva.in',
      mobile: '9765432106',
      role: 'Facilitator',
      org: 'Semliya Chau Agro Extension Desk',
      village: 'Semliya Chau',
      panchayat: 'Kanadia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Kanadia GP → Semliya Chau',
      setNumber: 'Set 2',
      targetRoute: '/facilitator'
    },

    // === VILLAGE SET 3 (Manglia Cluster) ===
    {
      id: 'usr_farmer_3',
      name: 'Sunita Bai Solanki',
      email: 'farmer3@krishiseva.in',
      mobile: '9826123452',
      role: 'Farmer',
      org: 'Maa Annapurna Krishi Farms (9 Acres)',
      village: 'Manglia',
      panchayat: 'Manglia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Manglia GP → Manglia',
      setNumber: 'Set 3',
      targetRoute: '/farmer'
    },
    {
      id: 'usr_chc_3',
      name: 'Mahendra Gurjar',
      email: 'chc3@krishiseva.in',
      mobile: '9823456783',
      role: 'CHC',
      org: 'Jai Kisan Community Machinery Centre',
      village: 'Manglia',
      panchayat: 'Manglia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Manglia GP → Manglia',
      setNumber: 'Set 3',
      targetRoute: '/chc-dashboard'
    },
    {
      id: 'usr_fmc_3',
      name: 'Sunil Choudhary',
      email: 'fmc3@krishiseva.in',
      mobile: '9712345674',
      role: 'FMC',
      org: 'Bharat Krishi Udyog Equipments',
      village: 'Manglia',
      panchayat: 'Manglia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Manglia GP → Manglia',
      setNumber: 'Set 3',
      targetRoute: '/fmc-dashboard'
    },
    {
      id: 'usr_input_3',
      name: 'Deepchand Verma',
      email: 'input3@krishiseva.in',
      mobile: '9845678916',
      role: 'Inputstore',
      org: 'Kisan Kalyan Fertilizer & Seeds',
      village: 'Manglia',
      panchayat: 'Manglia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Manglia GP → Manglia',
      setNumber: 'Set 3',
      targetRoute: '/input-store'
    },
    {
      id: 'usr_livestock_3',
      name: 'Mohanlal Ahir',
      email: 'livestock3@krishiseva.in',
      mobile: '9934567895',
      role: 'LivestockShop',
      org: 'Malwa Murrah & Goat Breeding Farm',
      village: 'Manglia',
      panchayat: 'Manglia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Manglia GP → Manglia',
      setNumber: 'Set 3',
      targetRoute: '/livestock-shop'
    },

    // === VILLAGE SET 4 (Hasalpur) ===
    {
      id: 'usr_farmer_4',
      name: 'Suresh Chandra Patidar',
      email: 'farmer4@krishiseva.in',
      mobile: '9826123453',
      role: 'Farmer',
      org: 'Patidar Hi-Tech Horticulture (24 Acres)',
      village: 'Hasalpur',
      panchayat: 'Manglia Gram Panchayat',
      hierarchy: 'MP → Indore → Sanwer → Manglia GP → Hasalpur',
      setNumber: 'Set 4',
      targetRoute: '/farmer'
    },

    // === ADMINISTRATIVE JURISDICTIONS (Admins & SuperAdmin) ===
    {
      id: 'usr_admin_1',
      name: 'Dr. Rajeshwar Rao',
      email: 'admin@krishiseva.in',
      mobile: '9811223344',
      role: 'Admin',
      org: 'Directorate of Agriculture & Farmer Welfare, MP',
      village: 'Indore State HQ',
      panchayat: 'Indore Urban',
      hierarchy: 'Indore District / MP State Level Jurisdiction',
      setNumber: 'Admin',
      targetRoute: '/admin'
    },
    {
      id: 'usr_admin_2',
      name: 'Vandana Trivedi',
      email: 'admin2@krishiseva.in',
      mobile: '9811223345',
      role: 'Admin',
      org: 'District Joint Director of Agriculture (Administration)',
      village: 'Indore District Collectorate',
      panchayat: 'Indore Urban',
      hierarchy: 'Indore District Level Administration',
      setNumber: 'Admin',
      targetRoute: '/admin'
    },
    {
      id: 'usr_superadmin_1',
      name: 'Siddharth Nambiar',
      email: 'superadmin@krishiseva.in',
      mobile: '9900112233',
      role: 'superadmin',
      org: 'Ministry of Agriculture Tech Directorate (Central)',
      village: 'Krishi Bhawan',
      panchayat: 'New Delhi HQ',
      hierarchy: 'National Ministry Level Jurisdiction (New Delhi)',
      setNumber: 'Admin',
      targetRoute: '/superadmin'
    }
  ];

  // Village Test Sets Definition
  const villageSets = [
    {
      id: 'set1' as const,
      title: '🌾 Set 1: Kanadia',
      subtitle: 'Complete Village Cluster (6)',
      village: 'Kanadia',
      desc: 'CHC, FMC, Farmer, Facilitator, Input, Livestock all co-located in Kanadia Village',
      users: allUsers.filter(u => u.setNumber === 'Set 1')
    },
    {
      id: 'set2' as const,
      title: '🌾 Set 2: Semliya Chau',
      subtitle: 'Complete Village Cluster (6)',
      village: 'Semliya Chau',
      desc: 'CHC, FMC, Farmer, Facilitator, Input, Livestock all co-located in Semliya Chau Village',
      users: allUsers.filter(u => u.setNumber === 'Set 2')
    },
    {
      id: 'set3' as const,
      title: '🌾 Set 3: Manglia',
      subtitle: 'Village Cluster (5)',
      village: 'Manglia',
      desc: 'CHC, FMC, Farmer, Input, Livestock in Manglia Village',
      users: allUsers.filter(u => u.setNumber === 'Set 3')
    },
    {
      id: 'set4' as const,
      title: '🌾 Set 4: Hasalpur',
      subtitle: 'Village (1)',
      village: 'Hasalpur',
      desc: 'Farmer 4 in Hasalpur Village',
      users: allUsers.filter(u => u.setNumber === 'Set 4')
    },
    {
      id: 'admin' as const,
      title: '🏛️ Admins (3)',
      subtitle: 'District & National (3)',
      village: 'Indore / Delhi',
      desc: 'Admins (Indore/MP State) & SuperAdmin (National Ministry)',
      users: allUsers.filter(u => u.setNumber === 'Admin')
    }
  ];

  // Role Categories Definition
  const roleCategories = [
    {
      id: 'farmer' as const,
      title: '👨‍🌾 Farmers (4)',
      badge: '4 Villages',
      users: allUsers.filter(u => u.role === 'Farmer')
    },
    {
      id: 'chc' as const,
      title: '🚜 CHC Hubs (3)',
      badge: '3 Villages',
      users: allUsers.filter(u => u.role === 'CHC')
    },
    {
      id: 'fmc' as const,
      title: '🏪 FMC Dealers (3)',
      badge: '3 Villages',
      users: allUsers.filter(u => u.role === 'FMC')
    },
    {
      id: 'input' as const,
      title: '🏬 Input Stores (3)',
      badge: '3 Villages',
      users: allUsers.filter(u => u.role === 'Inputstore')
    },
    {
      id: 'livestock' as const,
      title: '🐄 Livestock (3)',
      badge: '3 Villages',
      users: allUsers.filter(u => u.role === 'LivestockShop')
    },
    {
      id: 'facilitator' as const,
      title: '📋 Facilitators (2)',
      badge: '2 Villages',
      users: allUsers.filter(u => u.role === 'Facilitator')
    },
    {
      id: 'admin' as const,
      title: '🏛️ Admins (3)',
      badge: 'State & National',
      users: allUsers.filter(u => u.role === 'Admin' || u.role === 'superadmin')
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = login(identifier.trim(), password);
    if (res.success && res.user) {
      showToast('Logged In Successfully', `Welcome back, ${res.user.fullName}!`, 'success');
      switch (res.user.role) {
        case 'Farmer':
          navigate('/farmer');
          break;
        case 'CHC':
          navigate('/chc-dashboard');
          break;
        case 'FMC':
          navigate('/fmc-dashboard');
          break;
        case 'LivestockShop':
          navigate('/livestock-shop');
          break;
        case 'Inputstore':
          navigate('/input-store');
          break;
        case 'Facilitator':
          navigate('/facilitator');
          break;
        case 'Admin':
          navigate('/admin');
          break;
        case 'superadmin':
          navigate('/superadmin');
          break;
        default:
          navigate('/farmer');
      }
    } else {
      setErrorMsg(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handle1ClickLogin = (user: QuickUser) => {
    setIdentifier(user.email);
    quickSwitchRole(user.id);
    showToast('Authenticated as ' + user.name, `Logged in as ${user.role} (${user.org}).`, 'success');
    navigate(user.targetRoute);
  };

  const activeVillageData = villageSets.find(s => s.id === activeVillageSet) || villageSets[0];
  const activeRoleData = roleCategories.find(r => r.id === activeRoleCategory) || roleCategories[0];
  const displayedUsers = viewMode === 'village' ? activeVillageData.users : activeRoleData.users;

  // Dynamic input icon detector (Phone if digits/plus, Mail if email, User otherwise)
  const isPhoneFormat = /^[0-9+() -]+$/.test(identifier.trim());

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-elevation border border-brand-border overflow-hidden">
        {/* Left Side: Type of Logins & Village Clusters Explorer */}
        <div className="lg:col-span-6 bg-forest-900 text-white p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            {/* Brand Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-harvest font-bold shadow-subtle">
                KS
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl tracking-tight block">KrishiSeva</span>
                <span className="text-[11px] text-forest-300 font-medium">Integrated Rural AgriTech Platform</span>
              </div>
            </div>

            {/* Multi-Village Testing Ecosystem Banner */}
            <div className="mt-3.5 p-3 rounded-2xl bg-forest-800/90 border border-forest-700/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-harvest flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-harvest" />
                  Multi-Village Testing Ecosystem
                </span>
                <span className="text-[10px] bg-forest-700 text-cream-200 px-2 py-0.5 rounded-full font-semibold">
                  Sanwer Mandal • Indore, MP
                </span>
              </div>
              <p className="text-[11px] text-forest-200 leading-relaxed">
                Stakeholders are grouped into distinct <strong>Village Clusters</strong> so you can test complete end-to-end local workflows (<strong>CHC + FMC + Farmer + Facilitator</strong>) within <strong>Set 1 (Kanadia)</strong> and compare with <strong>Set 2 (Semliya Chau)</strong>.
              </p>
            </div>

            {/* Type of Logins Selector */}
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                {/* View Mode Switcher */}
                <div className="inline-flex p-0.5 bg-forest-950/80 border border-forest-700/80 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('village')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      viewMode === 'village'
                        ? 'bg-harvest text-forest-950 shadow-subtle'
                        : 'text-forest-300 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    By Village Set ({villageSets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('role')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      viewMode === 'role'
                        ? 'bg-harvest text-forest-950 shadow-subtle'
                        : 'text-forest-300 hover:text-white'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    By Role ({roleCategories.length})
                  </button>
                </div>

                <span className="text-[10px] text-forest-300 font-mono">
                  {displayedUsers.length} accounts in view
                </span>
              </div>

              {/* Subcategory Pills */}
              {viewMode === 'village' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  {villageSets.map((set) => {
                    const isActive = activeVillageSet === set.id;
                    return (
                      <button
                        key={set.id}
                        type="button"
                        onClick={() => setActiveVillageSet(set.id)}
                        className={`px-2.5 py-1.5 rounded-xl font-medium text-left truncate transition-all ${
                          isActive
                            ? 'bg-harvest text-forest-950 font-bold shadow-subtle'
                            : 'bg-forest-800/70 text-forest-200 hover:bg-forest-800 border border-forest-700/60'
                        }`}
                      >
                        <div className="truncate font-bold text-xs">{set.title}</div>
                        <div className={`text-[9px] truncate ${isActive ? 'text-forest-900 font-semibold' : 'text-forest-400'}`}>
                          {set.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  {roleCategories.map((cat) => {
                    const isActive = activeRoleCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveRoleCategory(cat.id)}
                        className={`px-2.5 py-1.5 rounded-xl font-medium text-left truncate transition-all ${
                          isActive
                            ? 'bg-harvest text-forest-950 font-bold shadow-subtle'
                            : 'bg-forest-800/70 text-forest-200 hover:bg-forest-800 border border-forest-700/60'
                        }`}
                      >
                        <div className="truncate font-bold text-xs">{cat.title}</div>
                        <div className={`text-[9px] truncate ${isActive ? 'text-forest-900 font-semibold' : 'text-forest-400'}`}>
                          {cat.badge}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Description of Current Selection */}
              {viewMode === 'village' && (
                <div className="text-[10px] text-harvest font-medium flex items-center gap-1.5 px-0.5">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">{activeVillageData.desc}</span>
                </div>
              )}

              {/* User Cards inside Selected Cluster / Category */}
              <div className="space-y-2 mt-1.5 max-h-60 overflow-y-auto pr-1">
                {displayedUsers.map((u) => {
                  const isSelectedEmail = identifier === u.email;
                  const isSelectedMobile = identifier === u.mobile;
                  const isSelected = isSelectedEmail || isSelectedMobile;

                  return (
                    <div
                      key={u.id}
                      className={`p-2.5 rounded-xl border transition-all text-left flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-forest-800 border-harvest/80 shadow-subtle'
                          : 'bg-forest-950/40 border-forest-800 hover:bg-forest-800/60'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-white truncate">
                            {u.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-forest-700 text-harvest font-semibold">
                            {u.role}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-forest-900/90 text-cream-200 font-mono border border-forest-700/80 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-harvest" />
                            {u.village}
                          </span>
                        </div>
                        <div className="text-[11px] text-forest-300 truncate mt-0.5">
                          {u.org}
                        </div>
                        {/* Email & Mobile Display */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-forest-200 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Mail className="w-2.5 h-2.5 text-harvest" />
                            {u.email}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-2.5 h-2.5 text-harvest" />
                            +91 {u.mobile}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-forest-400 font-mono truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 shrink-0 text-harvest" />
                          <span>{u.hierarchy}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setIdentifier(u.email)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              isSelectedEmail
                                ? 'bg-harvest text-forest-950 font-bold'
                                : 'bg-forest-700/70 hover:bg-forest-700 text-forest-200 border border-forest-600/60'
                            }`}
                            title="Fill email into login form"
                          >
                            Email
                          </button>
                          <button
                            type="button"
                            onClick={() => setIdentifier(u.mobile)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              isSelectedMobile
                                ? 'bg-harvest text-forest-950 font-bold'
                                : 'bg-forest-700/70 hover:bg-forest-700 text-forest-200 border border-forest-600/60'
                            }`}
                            title="Fill mobile number into login form"
                          >
                            Mobile
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handle1ClickLogin(u)}
                          className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-harvest hover:bg-harvest-dark text-forest-950 shadow-subtle flex items-center gap-1 transition-transform active:scale-95 w-full justify-center"
                          title={`Instant login as ${u.name}`}
                        >
                          <span>Sign In</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-forest-300 pt-2 border-t border-forest-800/80 flex items-center justify-between">
            <span>Kisan Call Helpline: <strong>1800-180-1551</strong></span>
            <span className="text-harvest text-[10px] font-semibold">Seed Pass: kisan@2026</span>
          </div>
        </div>

        {/* Right Side: Standard Login Form (Accepts Email or Mobile) */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="font-heading font-extrabold text-2xl text-forest-900 tracking-tight">
              Sign In to Your Workspace
            </h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              Sign in with your registered <strong>Email Address</strong> or <strong>10-digit Mobile Number</strong>.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-brand-error/30 text-rose-900 text-xs flex items-start gap-2.5 animate-slide-down">
              <ShieldAlert className="w-4 h-4 text-brand-error shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Authentication Notice:</span>
                <p className="text-[11px] leading-relaxed">{errorMsg}</p>
                {errorMsg.includes('PENDING') || errorMsg.includes('UNDER REVIEW') || errorMsg.includes('Corrections') ? (
                  <Link to="/application-status" className="font-bold text-forest-700 underline block pt-1">
                    Check Application Status & Timeline →
                  </Link>
                ) : null}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Email Address or Mobile Number
                </label>
                <span className="text-[10px] text-forest-700 font-medium bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200">
                  Email or 10-Digit Mobile
                </span>
              </div>
              <div className="relative">
                {isPhoneFormat ? (
                  <Phone className="w-4 h-4 text-forest-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                ) : (
                  <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. farmer@krishiseva.in or 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-brand-text">
                  Password
                </label>
                <span className="text-[11px] text-brand-muted">
                  Default: <code className="bg-cream-100 px-1 py-0.5 rounded font-mono text-forest-800">kisan@2026</code>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-brand-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-forest-600 accent-forest-600"
                />
                <span>Remember this workstation</span>
              </label>

              <Link to="/application-status" className="font-semibold text-forest-700 hover:underline">
                Check Registration Status
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-heading font-bold text-xs text-white bg-forest-600 hover:bg-forest-700 shadow-subtle transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-brand-border pt-4 text-center text-xs text-brand-muted">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-forest-800 hover:underline">
              Register as Farmer or Service Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
