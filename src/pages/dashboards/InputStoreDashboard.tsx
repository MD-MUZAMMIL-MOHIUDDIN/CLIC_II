import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bioInputService } from '../../services/bioInputService';
import inputStoresSeed from '../../data/input-stores.json';
import {
  Store,
  Sprout,
  ShieldCheck,
  CheckCircle,
  Package,
  Layers,
  MapPin,
  ArrowRight
} from 'lucide-react';

export const InputStoreDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const store = inputStoresSeed.find(s => s.userId === currentUser?.id || s.id === currentUser?.linkedProfileId) || inputStoresSeed[0];
  const bioProducts = bioInputService.getAllBioInputs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-lime-800 text-white flex items-center justify-center font-bold shadow-subtle shrink-0">
            <Store className="w-8 h-8 text-harvest" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-lime-100 text-lime-900">
                Authorized Agri Input Store
              </span>
              <span className="text-xs text-brand-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-forest-600" />
                {store.location.village}, {store.location.district} • {store.location.state}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              {currentUser?.organizationName || store.storeName}
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Authorized Stockist: <strong>{currentUser?.fullName || store.contactPerson}</strong> • {store.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-border text-xs font-semibold text-brand-text hover:bg-forest-50 transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-forest-600" />
            Profile & Geolocation Settings
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Bio Solutions Stocked</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">18 Formulations</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Active Inoculum Batches</div>
          <div className="text-2xl font-heading font-extrabold text-lime-800 mt-1">12 Validated</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Weekly Dispatches</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">210 Litres</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Quality Compliance</div>
          <div className="text-2xl font-heading font-extrabold text-emerald-700 mt-1">100% Verified</div>
        </div>
      </div>

      {/* Bio-Input Catalog List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-4">
        <h3 className="font-heading font-bold text-lg text-forest-900">
          Stocked Bio-Formulations & Biological Agents
        </h3>

        <div className="space-y-3 text-xs">
          {bioProducts.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl border border-brand-border bg-cream-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                  {p.category}
                </span>
                <h4 className="font-heading font-bold text-base text-forest-900 mt-1">{p.name}</h4>
                <p className="text-brand-muted text-[11px] mt-0.5">{p.intendedPurpose}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800">
                  Ready in Stock (25kg Lot)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
