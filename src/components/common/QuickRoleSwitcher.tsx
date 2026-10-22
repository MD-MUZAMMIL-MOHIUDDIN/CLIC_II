import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ChevronDown, Check, UserCheck, ShieldAlert, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SwitcherItem {
  id: string;
  name: string;
  role: string;
  roleKey: string;
  desc: string;
  villageHierarchy?: string;
  targetRoute: string;
  isEdgeCase?: boolean;
}

export const QuickRoleSwitcher: React.FC = () => {
  const { currentUser, quickSwitchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All Logins (21)' },
    { id: 'farmer', label: '👨🌾 Farmers (4)' },
    { id: 'chc', label: '🚜 CHC Hubs (3)' },
    { id: 'fmc', label: '🏪 FMC Dealers (3)' },
    { id: 'input', label: '🏬 Input Stores (3)' },
    { id: 'livestock', label: '🐄 Livestock (3)' },
    { id: 'facilitator', label: '📋 Facilitator (2)' },
    { id: 'admin', label: '🏛️ Admins & SuperAdmin (3)' },
    { id: 'test', label: '⚠️ Test Cases (3)' },
  ];

  const allLogins: (SwitcherItem & { category: string })[] = [
    // 🌾 Farmers (4) - Kanadia Village
    {
      id: 'usr_farmer_1',
      name: 'Rameshwar Patel',
      role: 'Farmer',
      roleKey: 'Farmer',
      desc: 'Patel Organic Farms',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/farmer',
      category: 'farmer'
    },
    {
      id: 'usr_farmer_2',
      name: 'Jagdish Prasad Sharma',
      role: 'Farmer',
      roleKey: 'Farmer',
      desc: 'Sharma Natural Agro',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/farmer',
      category: 'farmer'
    },
    {
      id: 'usr_farmer_3',
      name: 'Sunita Bai Solanki',
      role: 'Farmer',
      roleKey: 'Farmer',
      desc: 'Maa Annapurna Krishi Farms',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/farmer',
      category: 'farmer'
    },
    {
      id: 'usr_farmer_4',
      name: 'Suresh Chandra Patidar',
      role: 'Farmer',
      roleKey: 'Farmer',
      desc: 'Patidar Hi-Tech Horticulture',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/farmer',
      category: 'farmer'
    },

    // 🚜 CHC Hubs (3) - Kanadia Village
    {
      id: 'usr_chc_1',
      name: 'Vikram Singh Chaudhary',
      role: 'CHC',
      roleKey: 'CHC',
      desc: 'Malwa Kisan Custom Hiring Centre',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/chc-dashboard',
      category: 'chc'
    },
    {
      id: 'usr_chc_2',
      name: 'Dharmendra Solanki',
      role: 'CHC',
      roleKey: 'CHC',
      desc: 'Balram Agri Drone & Harvester Hub',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/chc-dashboard',
      category: 'chc'
    },
    {
      id: 'usr_chc_3',
      name: 'Mahendra Gurjar',
      role: 'CHC',
      roleKey: 'CHC',
      desc: 'Jai Kisan Community Machinery Centre',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/chc-dashboard',
      category: 'chc'
    },

    // 🏪 FMC Dealers (3) - Kanadia Village
    {
      id: 'usr_fmc_1',
      name: 'Sukhwinder Dhillon',
      role: 'FMC',
      roleKey: 'FMC',
      desc: 'Dhillon Farm Machinery & Spares',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/fmc-dashboard',
      category: 'fmc'
    },
    {
      id: 'usr_fmc_2',
      name: 'Rajesh Gehlot',
      role: 'FMC',
      roleKey: 'FMC',
      desc: 'Narmada Agro Implements & Spares',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/fmc-dashboard',
      category: 'fmc'
    },
    {
      id: 'usr_fmc_3',
      name: 'Sunil Choudhary',
      role: 'FMC',
      roleKey: 'FMC',
      desc: 'Bharat Krishi Udyog Equipments',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/fmc-dashboard',
      category: 'fmc'
    },

    // 🏬 Input Stores (3) - Kanadia Village
    {
      id: 'usr_input_1',
      name: 'Meera Venkataraman',
      role: 'Inputstore',
      roleKey: 'Inputstore',
      desc: 'Prithvi Bio-Inputs & Organic Seeds',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/input-store',
      category: 'input'
    },
    {
      id: 'usr_input_2',
      name: 'Arvind Kumar Joshi',
      role: 'Inputstore',
      roleKey: 'Inputstore',
      desc: 'Shanti Krishi Seva Kendra',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/input-store',
      category: 'input'
    },
    {
      id: 'usr_input_3',
      name: 'Deepchand Verma',
      role: 'Inputstore',
      roleKey: 'Inputstore',
      desc: 'Kisan Kalyan Fertilizer & Seeds',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/input-store',
      category: 'input'
    },

    // 🐄 Livestock (3) - Kanadia Village
    {
      id: 'usr_livestock_1',
      name: 'Anil Kumar Yadav',
      role: 'LivestockShop',
      roleKey: 'LivestockShop',
      desc: 'Gopalak Dairy & Livestock Breed Center',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/livestock-shop',
      category: 'livestock'
    },
    {
      id: 'usr_livestock_2',
      name: 'Radheshyam Yadav',
      role: 'LivestockShop',
      roleKey: 'LivestockShop',
      desc: 'Kamdhenu Cattle Feed & Veterinary Supplies',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/livestock-shop',
      category: 'livestock'
    },
    {
      id: 'usr_livestock_3',
      name: 'Mohanlal Ahir',
      role: 'LivestockShop',
      roleKey: 'LivestockShop',
      desc: 'Malwa Murrah & Goat Breeding Farm',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/livestock-shop',
      category: 'livestock'
    },

    // 📋 Facilitators (2) - Kanadia Village
    {
      id: 'usr_facilitator_1',
      name: 'Pooja Sharma',
      role: 'Facilitator',
      roleKey: 'Facilitator',
      desc: 'Kanadia Gram Panchayat Agro Extension',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/facilitator',
      category: 'facilitator'
    },
    {
      id: 'usr_facilitator_2',
      name: 'Manoj Parmar',
      role: 'Facilitator',
      roleKey: 'Facilitator',
      desc: 'Sanwer Block Field Agriculture Center',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/facilitator',
      category: 'facilitator'
    },

    // 🏛️ Admins (2) - District Level Jurisdiction (No Village)
    {
      id: 'usr_admin_1',
      name: 'Dr. Rajeshwar Rao',
      role: 'Admin',
      roleKey: 'Admin',
      desc: 'Directorate of Agriculture, MP (District / State Jurisdiction)',
      villageHierarchy: 'Indore District / MP State Level',
      targetRoute: '/admin',
      category: 'admin'
    },
    {
      id: 'usr_admin_2',
      name: 'Vandana Trivedi',
      role: 'Admin',
      roleKey: 'Admin',
      desc: 'Joint Director of Agriculture (Administration)',
      villageHierarchy: 'Indore District Level',
      targetRoute: '/admin',
      category: 'admin'
    },

    // 👑 SuperAdmin (1) - National Jurisdiction (No Village)
    {
      id: 'usr_superadmin_1',
      name: 'Siddharth Nambiar',
      role: 'superadmin',
      roleKey: 'superadmin',
      desc: 'Ministry of Agriculture Tech Directorate (Central)',
      villageHierarchy: 'National Ministry Level (New Delhi)',
      targetRoute: '/superadmin',
      category: 'admin'
    },

    // ⚠️ Test Cases
    {
      id: 'usr_pending_chc',
      name: 'Kailash Verma (Test)',
      role: 'CHC (Pending)',
      roleKey: 'pending_chc',
      desc: 'Registration Application Pending Verification',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/application-status',
      category: 'test',
      isEdgeCase: true
    },
    {
      id: 'usr_rejected_fmc',
      name: 'Harbhajan Mann (Test)',
      role: 'FMC (Rejected)',
      roleKey: 'rejected_fmc',
      desc: 'Registration Application Rejected',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/application-status',
      category: 'test',
      isEdgeCase: true
    },
    {
      id: 'usr_suspended_user',
      name: 'Naresh Lalwani (Test)',
      role: 'Farmer (Suspended)',
      roleKey: 'suspended',
      desc: 'Account Suspended by Compliance',
      villageHierarchy: 'MP → Indore → Sanwer → Kanadia',
      targetRoute: '/login',
      category: 'test',
      isEdgeCase: true
    }
  ];

  const handleSelectUser = (item: SwitcherItem) => {
    quickSwitchRole(item.id);
    setIsOpen(false);
    navigate(item.targetRoute);
  };

  const displayedLogins = activeCategory === 'all'
    ? allLogins
    : allLogins.filter(item => item.category === activeCategory);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-forest-50 border border-forest-200 text-forest-700 hover:bg-forest-100 transition-colors shadow-subtle"
        title="Interactive Role & Ecosystem Switcher"
      >
        <Sparkles className="w-3.5 h-3.5 text-harvest-dark animate-pulse" />
        <span className="hidden sm:inline">Role View:</span>
        <span className="font-bold text-forest-900 truncate max-w-[130px]">
          {currentUser ? currentUser.fullName.split(' ')[0] : 'Guest'} ({currentUser?.role})
        </span>
        <ChevronDown className="w-3 h-3 text-forest-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 max-w-[95vw] bg-white rounded-2xl shadow-elevation border border-brand-border py-2 z-50 animate-slide-down overflow-hidden">
            {/* Header with 1-Village Ecosystem Banner */}
            <div className="px-4 py-2.5 border-b border-brand-border bg-gradient-to-r from-forest-50 to-cream-50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-harvest-dark" />
                  Ecosystem Logins (21 Users)
                </p>
                <span className="text-[10px] bg-forest-200 text-forest-900 font-bold px-2 py-0.5 rounded-full">
                  1-Village Model
                </span>
              </div>
              <p className="text-[11px] text-forest-800 font-medium mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-forest-600 shrink-0" />
                <span>18 village actors co-located in <strong>Kanadia, Indore, MP</strong></span>
              </p>
            </div>

            {/* Quick Filter Categories */}
            <div className="px-3 py-2 border-b border-brand-border bg-cream-50/50 flex gap-1 overflow-x-auto text-[11px] no-scrollbar">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    activeCategory === c.id
                      ? 'bg-forest-700 text-white shadow-subtle'
                      : 'bg-white text-forest-800 border border-brand-border hover:bg-cream-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* User List */}
            <div className="max-h-96 overflow-y-auto py-1 divide-y divide-cream-100">
              {displayedLogins.map((item) => {
                const isCurrent = currentUser?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectUser(item)}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-forest-50 transition-colors ${
                      isCurrent ? 'bg-forest-50/80 font-medium' : ''
                    } ${item.isEdgeCase ? 'hover:bg-rose-50/60' : ''}`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${item.isEdgeCase ? 'text-rose-900' : 'text-forest-900'}`}>
                          {item.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          item.isEdgeCase
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-cream-200 text-forest-800'
                        }`}>
                          {item.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-brand-muted truncate max-w-[280px]">
                        {item.desc}
                      </div>
                      <div className="text-[10px] text-forest-600 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate max-w-[270px]">{item.villageHierarchy}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCurrent ? (
                        <span className="p-1 rounded-full bg-forest-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <UserCheck className="w-3.5 h-3.5 text-brand-muted opacity-40 hover:opacity-100" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
