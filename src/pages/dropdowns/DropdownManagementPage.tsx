import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefTypesManager } from '../../components/dropdowns/RefTypesManager';
import { DropdownsManager } from '../../components/dropdowns/DropdownsManager';
import { dropdownMasterService } from '../../services/dropdownMasterService';
import { useToast } from '../../context/ToastContext';
import {
  Tag,
  ListFilter,
  RotateCcw,
  Sliders,
  ChevronRight,
  Sparkles
} from 'lucide-react';

type DropdownTab = 'ref-types' | 'dropdowns';

interface DropdownManagementPageProps {
  defaultTab?: DropdownTab;
}

export const DropdownManagementPage: React.FC<DropdownManagementPageProps> = ({ defaultTab }) => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as DropdownTab) || defaultTab || 'ref-types';
  const [activeTab, setActiveTab] = useState<DropdownTab>(tabParam);
  const [filterRefId, setFilterRefId] = useState<string>('ALL');

  const [stats, setStats] = useState(() => dropdownMasterService.getStats());

  useEffect(() => {
    if (defaultTab && defaultTab !== activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    const qTab = searchParams.get('tab') as DropdownTab;
    if (qTab && qTab !== activeTab) {
      setActiveTab(qTab);
    }
  }, [searchParams]);

  const switchTab = (tab: DropdownTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const refreshStats = () => {
    setStats(dropdownMasterService.getStats());
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all Reference Types and Dropdown options to default seed values?')) {
      dropdownMasterService.resetToDefaults();
      showToast('Master Data Reset', 'Reference types & dropdown items restored to seed defaults.', 'info');
      refreshStats();
      setFilterRefId('ALL');
      switchTab('ref-types');
    }
  };

  const handleSelectRefTypeForFilter = (refId: string) => {
    setFilterRefId(refId);
    switchTab('dropdowns');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-muted mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-brand-muted/60" />
            <span className="text-forest-700 font-semibold uppercase tracking-wider text-[11px]">Dropdown Management</span>
            <ChevronRight className="w-3.5 h-3.5 text-brand-muted/60" />
            <span className="capitalize font-bold text-forest-900">
              {activeTab === 'ref-types' ? 'Reference Types' : 'Dropdown Items'}
            </span>
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-forest-600 text-white shadow-subtle">
              <Sliders className="w-6 h-6" />
            </span>
            Dropdown Management
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Configure dynamic system dropdown options: Manage Reference Categories (RefTypes) and their linked option values (Dropdowns).
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: RefTypes */}
        <button
          onClick={() => switchTab('ref-types')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'ref-types'
              ? 'bg-forest-900 text-white border-forest-800 shadow-card'
              : 'bg-white text-forest-900 border-brand-border hover:border-forest-400 hover:shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`p-2.5 rounded-xl ${activeTab === 'ref-types' ? 'bg-forest-800 text-harvest' : 'bg-forest-50 text-forest-700'}`}>
              <Tag className="w-5 h-5" />
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              activeTab === 'ref-types' ? 'bg-forest-800 text-cream-200' : 'bg-cream-200 text-brand-muted'
            }`}>
              Component 1
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold">{stats.refTypesCount}</div>
          <div className={`text-sm font-bold ${activeTab === 'ref-types' ? 'text-cream-100' : 'text-forest-900'}`}>
            Reference Types (RefTypes)
          </div>
          <p className={`text-[11px] mt-1 ${activeTab === 'ref-types' ? 'text-cream-300/80' : 'text-brand-muted'}`}>
            Schema: RefTypes(RefId, RefName)
          </p>
        </button>

        {/* Card 2: Dropdowns */}
        <button
          onClick={() => switchTab('dropdowns')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'dropdowns'
              ? 'bg-forest-900 text-white border-forest-800 shadow-card'
              : 'bg-white text-forest-900 border-brand-border hover:border-forest-400 hover:shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`p-2.5 rounded-xl ${activeTab === 'dropdowns' ? 'bg-forest-800 text-harvest' : 'bg-forest-50 text-forest-700'}`}>
              <ListFilter className="w-5 h-5" />
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              activeTab === 'dropdowns' ? 'bg-forest-800 text-cream-200' : 'bg-cream-200 text-brand-muted'
            }`}>
              Component 2
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold">{stats.dropdownsCount}</div>
          <div className={`text-sm font-bold ${activeTab === 'dropdowns' ? 'text-cream-100' : 'text-forest-900'}`}>
            Dropdown Items (Dropdowns)
          </div>
          <p className={`text-[11px] mt-1 ${activeTab === 'dropdowns' ? 'text-cream-300/80' : 'text-brand-muted'}`}>
            Schema: Dropdowns(DropdownId, Value, Text, RefId)
          </p>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-brand-border rounded-2xl shadow-subtle">
        <button
          onClick={() => switchTab('ref-types')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'ref-types'
              ? 'bg-forest-700 text-white shadow-subtle'
              : 'text-brand-muted hover:text-forest-900 hover:bg-cream-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Ref Types</span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
            activeTab === 'ref-types' ? 'bg-forest-800 text-white' : 'bg-cream-200 text-brand-muted'
          }`}>
            {stats.refTypesCount}
          </span>
        </button>

        <button
          onClick={() => switchTab('dropdowns')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'dropdowns'
              ? 'bg-forest-700 text-white shadow-subtle'
              : 'text-brand-muted hover:text-forest-900 hover:bg-cream-100'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Dropdowns</span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
            activeTab === 'dropdowns' ? 'bg-forest-800 text-white' : 'bg-cream-200 text-brand-muted'
          }`}>
            {stats.dropdownsCount}
          </span>
        </button>
      </div>

      {/* Active Component */}
      <div>
        {activeTab === 'ref-types' ? (
          <RefTypesManager onSelectRefTypeForFilter={handleSelectRefTypeForFilter} />
        ) : (
          <DropdownsManager
            initialRefFilter={filterRefId}
            onFilterChange={(refId) => setFilterRefId(refId)}
          />
        )}
      </div>
    </div>
  );
};
