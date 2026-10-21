import React, { useState } from 'react';
import { ProblemManagementCRUD } from '../../components/crops/ProblemManagementCRUD';
import { problemManagementService } from '../../services/problemManagementService';
import { problemManagementMediaService } from '../../services/problemManagementMediaService';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
  Flame,
  Activity,
  Layers,
  FlaskConical
} from 'lucide-react';

export const ProblemManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const [mgmtStats, setMgmtStats] = useState(() => problemManagementService.getStats());
  const [mgmtMediaStats, setMgmtMediaStats] = useState(() => problemManagementMediaService.getStats());

  const handleResetDefaults = () => {
    if (window.confirm('Reset all Crop Problem Management advisories and practice media to standard seed defaults?')) {
      problemManagementService.resetToDefaults();
      problemManagementMediaService.resetToDefaults();
      setMgmtStats(problemManagementService.getStats());
      setMgmtMediaStats(problemManagementMediaService.getStats());
      showToast('Master Data Reset', 'Crop problem management advisories and practice photos restored to defaults.', 'info');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-muted mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-brand-muted/60" />
            <span className="text-forest-700 font-semibold uppercase tracking-wider text-[11px]">Crops Master</span>
            <ChevronRight className="w-3.5 h-3.5 text-brand-muted/60" />
            <span className="capitalize font-bold text-forest-900">Crop Problem Management</span>
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-forest-600 text-white shadow-subtle">
              <ShieldCheck className="w-6 h-6 text-harvest" />
            </span>
            Crop Problem Management
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Manage stage-wise crop protection protocols, chemical and biological dosages, Economic Threshold Levels (ETL), and field practice visual evidence (<code className="bg-cream-200 px-1 py-0.2 rounded font-mono text-forest-800">ProblemManagementMedia FK</code>).
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Advisories */}
        <div className="p-3.5 rounded-2xl border border-brand-border bg-white shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-forest-50 text-forest-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-cream-200 text-brand-muted">
              Total
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-forest-900">{mgmtStats.totalCount}</div>
          <div className="text-[11px] font-semibold text-brand-muted truncate">IPM Protocols</div>
        </div>

        {/* Cultural Controls */}
        <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900">
              Cultural
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-amber-950">{mgmtStats.culturalCount}</div>
          <div className="text-[11px] font-semibold text-amber-800 truncate">Agronomic Practices</div>
        </div>

        {/* Biological Controls */}
        <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900">
              Bio
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-emerald-950">{mgmtStats.biologicalCount}</div>
          <div className="text-[11px] font-semibold text-emerald-800 truncate">Bio-Agents & Predators</div>
        </div>

        {/* Chemical Controls */}
        <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
              <FlaskConical className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900">
              Chemical
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-rose-950">{mgmtStats.chemicalCount}</div>
          <div className="text-[11px] font-semibold text-rose-800 truncate">Targeted Sprays</div>
        </div>

        {/* Mechanical Controls */}
        <div className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-blue-200 text-blue-900">
              Mechanical
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-blue-950">{mgmtStats.mechanicalCount}</div>
          <div className="text-[11px] font-semibold text-blue-800 truncate">Traps & Barriers</div>
        </div>

        {/* Practice Media */}
        <div className="p-3.5 rounded-2xl border border-forest-200 bg-forest-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-forest-100 text-forest-800">
              <ImageIcon className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-forest-200 text-forest-900">
              Photos
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-forest-950">{mgmtMediaStats.totalCount}</div>
          <div className="text-[11px] font-semibold text-forest-800 truncate">Practice Visual Evidence</div>
        </div>
      </div>

      {/* Dedicated Problem Management CRUD */}
      <ProblemManagementCRUD />
    </div>
  );
};

export default ProblemManagementPage;
