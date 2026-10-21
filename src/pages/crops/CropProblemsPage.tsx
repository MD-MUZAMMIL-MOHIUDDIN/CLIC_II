import React, { useState } from 'react';
import { CropProblemCRUD } from '../../components/crops/CropProblemCRUD';
import { cropProblemService } from '../../services/cropProblemService';
import { problemMediaService } from '../../services/problemMediaService';
import { useToast } from '../../context/ToastContext';
import {
  Bug,
  RotateCcw,
  ChevronRight,
  ShieldAlert,
  Flame,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export const CropProblemsPage: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(() => cropProblemService.getStats());
  const [mediaStats, setMediaStats] = useState(() => problemMediaService.getStats());

  const handleResetDefaults = () => {
    if (window.confirm('Reset all Crop Problems & Diagnostic Media to standard agronomic seed records?')) {
      cropProblemService.resetToDefaults();
      problemMediaService.resetToDefaults();
      setStats(cropProblemService.getStats());
      setMediaStats(problemMediaService.getStats());
      showToast('Master Data Reset', 'Crop problems and diagnostic photos restored to standard defaults.', 'info');
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
            <span className="capitalize font-bold text-forest-900">Crop Problems & Media</span>
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-forest-600 text-white shadow-subtle">
              <Bug className="w-6 h-6 text-harvest" />
            </span>
            Crop Problems & Diagnostic Media
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Manage crop diagnostic problems, economic insect pests, plant diseases, and nutrient deficiencies with field damage photographic evidence (<code className="bg-cream-200 px-1 py-0.2 rounded font-mono text-forest-800">ProblemMedia FK</code>).
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
        {/* Total Problems */}
        <div className="p-3.5 rounded-2xl border border-brand-border bg-white shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-forest-50 text-forest-700">
              <Bug className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-cream-200 text-brand-muted">
              Total
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-forest-900">{stats.totalCount}</div>
          <div className="text-[11px] font-semibold text-brand-muted truncate">Crop Problems</div>
        </div>

        {/* Pests */}
        <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900">
              Pest
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-amber-950">{stats.pestsCount}</div>
          <div className="text-[11px] font-semibold text-amber-800 truncate">Pest Insects</div>
        </div>

        {/* Diseases */}
        <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900">
              Disease
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-rose-950">{stats.diseasesCount}</div>
          <div className="text-[11px] font-semibold text-rose-800 truncate">Crop Diseases</div>
        </div>

        {/* Deficiencies */}
        <div className="p-3.5 rounded-2xl border border-cyan-200 bg-cyan-50/40 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-cyan-200 text-cyan-900">
              Nutrient
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-cyan-950">{stats.deficienciesCount}</div>
          <div className="text-[11px] font-semibold text-cyan-800 truncate">Deficiencies</div>
        </div>

        {/* Total Visual Media */}
        <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-subtle col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <ImageIcon className="w-4 h-4" />
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900">
              Photos
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-emerald-950">{mediaStats.totalCount}</div>
          <div className="text-[11px] font-semibold text-emerald-800 truncate">Diagnostic Photos</div>
        </div>
      </div>

      {/* Main Crop Problems & Media Table CRUD */}
      <CropProblemCRUD />
    </div>
  );
};

export default CropProblemsPage;

