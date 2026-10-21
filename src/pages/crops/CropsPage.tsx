import React from 'react';
import { Link } from 'react-router-dom';
import { CropList } from '../../components/crops/CropList';
import { cropService } from '../../services/cropService';
import { useToast } from '../../context/ToastContext';
import {
  Sprout,
  ChevronRight,
  RotateCcw,
  Bug,
  Sparkles,
  Layers
} from 'lucide-react';

export const CropsPage: React.FC = () => {
  const { showToast } = useToast();

  const handleResetDefaults = () => {
    if (window.confirm('Reset all Crops to initial 9 catalogued seed crops?')) {
      cropService.resetToDefaults();
      showToast('Master Data Reset', 'Crops restored to initial seed catalog.', 'info');
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
            <span className="capitalize font-bold text-forest-900">Crop List</span>
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-forest-600 text-white shadow-subtle">
              <Sprout className="w-6 h-6 text-harvest" />
            </span>
            Crop Catalog & Master List
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Official catalogue of field crops categorized under Cereals, Millets, and Pulses with Telugu script and botanical taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/crop-problems"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-900 border border-brand-border shadow-subtle transition-all"
          >
            <Bug className="w-3.5 h-3.5 text-forest-700" />
            <span>Crop Problems Master &rarr;</span>
          </Link>

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

      {/* Main Crop List Component */}
      <CropList />
    </div>
  );
};
