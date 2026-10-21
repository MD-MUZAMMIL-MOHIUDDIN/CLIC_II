import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StateCRUD } from '../../components/locations/StateCRUD';
import { DistrictCRUD } from '../../components/locations/DistrictCRUD';
import { MandalCRUD } from '../../components/locations/MandalCRUD';
import { PanchayatCRUD } from '../../components/locations/PanchayatCRUD';
import { VillageCRUD } from '../../components/locations/VillageCRUD';
import { locationMasterService } from '../../services/locationMasterService';
import { useToast } from '../../context/ToastContext';
import {
  MapPin,
  Building2,
  Layers,
  Compass,
  Home,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Database
} from 'lucide-react';

type LocationTab = 'state' | 'district' | 'mandal' | 'panchayat' | 'village';

interface LocationsPageProps {
  defaultTab?: LocationTab;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({ defaultTab }) => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as LocationTab) || defaultTab || 'state';
  const [activeTab, setActiveTab] = useState<LocationTab>(tabParam);

  // Drilldown filters
  const [stateFilterForDistrict, setStateFilterForDistrict] = useState<string>('ALL');
  const [distFilterForMandal, setDistFilterForMandal] = useState<string>('ALL');
  const [mandalFilterForPanchayat, setMandalFilterForPanchayat] = useState<string>('ALL');
  const [panchayatFilterForVillage, setPanchayatFilterForVillage] = useState<string>('ALL');

  const [stats, setStats] = useState(() => locationMasterService.getStats());

  useEffect(() => {
    if (defaultTab && defaultTab !== activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    const qTab = searchParams.get('tab') as LocationTab;
    if (qTab && qTab !== activeTab) {
      setActiveTab(qTab);
    }
  }, [searchParams]);

  const switchTab = (tab: LocationTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const refreshStats = () => {
    setStats(locationMasterService.getStats());
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all location data (States, Districts, Mandals, Panchayats, Villages) to default seed values?')) {
      locationMasterService.resetToDefaults();
      showToast('Master Data Reset', 'Locations restored to initial seed dataset.', 'info');
      refreshStats();
      // force reload component view
      switchTab('state');
    }
  };

  // Drilldown navigation handlers
  const handleSelectStateForDistricts = (stateId: string) => {
    setStateFilterForDistrict(stateId);
    switchTab('district');
  };

  const handleSelectDistrictForMandals = (distId: string) => {
    setDistFilterForMandal(distId);
    switchTab('mandal');
  };

  const handleSelectMandalForPanchayats = (mandalId: string) => {
    setMandalFilterForPanchayat(mandalId);
    switchTab('panchayat');
  };

  const handleSelectPanchayatForVillages = (panchayatId: string) => {
    setPanchayatFilterForVillage(panchayatId);
    switchTab('village');
  };

  const tabs: { id: LocationTab; label: string; icon: any; count: number; schema: string }[] = [
    { id: 'state', label: 'State', icon: MapPin, count: stats.statesCount, schema: 'State(StateId, Value, Text)' },
    { id: 'district', label: 'District', icon: Building2, count: stats.districtsCount, schema: 'District(DistrictId, Value, Text, StateId)' },
    { id: 'mandal', label: 'Mandal', icon: Layers, count: stats.mandalsCount, schema: 'Mandal(MandalId, Value, Text, DistrictId)' },
    { id: 'panchayat', label: 'Panchayat', icon: Compass, count: stats.panchayatsCount, schema: 'Panchayat(PanchayatId, Value, Text, MandalId)' },
    { id: 'village', label: 'Village', icon: Home, count: stats.villagesCount, schema: 'Village(VillageId, Value, Text, PanchayatId)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12 animate-fade-in">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-muted mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-brand-muted/60" />
            <span className="text-forest-700 font-semibold uppercase tracking-wider text-[11px]">Locations</span>
            <ChevronRight className="w-3.5 h-3.5 text-brand-muted/60" />
            <span className="capitalize font-bold text-forest-900">{activeTab}</span>
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-forest-600 text-white shadow-subtle">
              <Database className="w-6 h-6" />
            </span>
            Locations Management
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Hierarchical master location administration for States, Districts, Mandals, Panchayats, and Villages with complete CRUD operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-brand-border text-brand-muted hover:text-forest-900 hover:bg-cream-100 shadow-subtle transition-all"
            title="Reset to default seed dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-forest-900 text-white border-forest-800 shadow-card'
                  : 'bg-white text-forest-900 border-brand-border hover:border-forest-400 hover:shadow-subtle'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-2 rounded-xl ${isActive ? 'bg-forest-800 text-harvest' : 'bg-forest-50 text-forest-700'}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-forest-800 text-cream-200' : 'bg-cream-200 text-brand-muted'
                }`}>
                  CRUD
                </span>
              </div>
              <div className="text-xl font-heading font-extrabold">{t.count}</div>
              <div className={`text-xs font-semibold ${isActive ? 'text-cream-200' : 'text-forest-900'}`}>{t.label}s</div>
              <div className={`text-[10px] truncate mt-1 ${isActive ? 'text-cream-300/80' : 'text-brand-muted'}`}>
                {t.schema.split('(')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-brand-border rounded-2xl shadow-subtle overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-forest-700 text-white shadow-subtle'
                  : 'text-brand-muted hover:text-forest-900 hover:bg-cream-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                isActive ? 'bg-forest-800 text-white' : 'bg-cream-200 text-brand-muted'
              }`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab CRUD Component */}
      <div>
        {activeTab === 'state' && (
          <StateCRUD onSelectState={handleSelectStateForDistricts} />
        )}
        {activeTab === 'district' && (
          <DistrictCRUD
            initialStateFilter={stateFilterForDistrict}
            onSelectDistrict={handleSelectDistrictForMandals}
          />
        )}
        {activeTab === 'mandal' && (
          <MandalCRUD
            initialDistrictFilter={distFilterForMandal}
            onSelectMandal={handleSelectMandalForPanchayats}
          />
        )}
        {activeTab === 'panchayat' && (
          <PanchayatCRUD
            initialMandalFilter={mandalFilterForPanchayat}
            onSelectPanchayat={handleSelectPanchayatForVillages}
          />
        )}
        {activeTab === 'village' && (
          <VillageCRUD initialPanchayatFilter={panchayatFilterForVillage} />
        )}
      </div>
    </div>
  );
};
