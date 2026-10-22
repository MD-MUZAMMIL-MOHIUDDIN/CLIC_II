import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { machineryService } from '../../services/machineryService';
import { useToast } from '../../context/ToastContext';
import fmcCentresSeed from '../../data/farm-machinery-centres.json';
import { FarmMachinery } from '../../types';
import { formatCurrency } from '../../lib/utils';
import {
  Tractor,
  Layers,
  MapPin,
  CheckCircle,
  Plus,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const FMCDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const centre = fmcCentresSeed.find(f => f.userId === currentUser?.id || f.id === currentUser?.linkedProfileId) || fmcCentresSeed[0];

  const [machinery, setMachinery] = useState<FarmMachinery[]>(() =>
    machineryService.getAllMachinery().slice(4, 9)
  );

  const toggleStatus = (id: string, current: boolean) => {
    machineryService.updateMachinery(id, { available: !current });
    setMachinery([...machineryService.getAllMachinery().slice(4, 9)]);
    showToast('Fleet Status Updated', 'Machine availability has been updated.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-subtle shrink-0">
            <Tractor className="w-8 h-8 text-harvest" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                Farm Machinery Centre (FMC Dealer)
              </span>
              <span className="text-xs text-brand-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-forest-600" />
                {centre.location.village}, {centre.location.district} • {centre.location.state}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              {currentUser?.organizationName || centre.centreName}
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Authorized FMC Dealer: <strong>{currentUser?.fullName || centre.contactPerson}</strong> • {centre.description}
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
          <div className="text-xs text-brand-muted">Harvesters & Seeders</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">14 Units</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Active Work Orders</div>
          <div className="text-2xl font-heading font-extrabold text-teal-700 mt-1">8 Jobs</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Harvested Acreage</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">420 Acres</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Coverage Radius</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">60 km</div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-4">
        <h3 className="font-heading font-bold text-lg text-forest-900">
          Heavy Fleet Implements & Operational Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">Machine Details</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Contract Rate</th>
                <th className="py-3 px-2">Operator Included</th>
                <th className="py-3 px-2">Current Status</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {machinery.map((m) => (
                <tr key={m.id} className="hover:bg-cream-50/50">
                  <td className="py-3.5 px-2 font-bold text-forest-900 flex items-center gap-2">
                    <img src={m.images[0]} alt={m.name} className="w-9 h-9 rounded-lg object-cover" />
                    <span>{m.name}</span>
                  </td>
                  <td className="py-3.5 px-2 text-brand-text">{m.category}</td>
                  <td className="py-3.5 px-2 font-bold text-forest-800">
                    {formatCurrency(m.pricePerUnit)} / {m.pricingUnit}
                  </td>
                  <td className="py-3.5 px-2 text-brand-muted">{m.operatorProvided ? 'Yes' : 'No'}</td>
                  <td className="py-3.5 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {m.available ? 'In Service' : 'On Contract'}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => toggleStatus(m.id, m.available)}
                      className="px-3 py-1.5 rounded-lg border border-brand-border font-semibold hover:bg-cream-100 transition-colors"
                    >
                      {m.available ? 'Mark Deployed' : 'Mark Available'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
