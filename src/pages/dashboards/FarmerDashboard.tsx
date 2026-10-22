import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { consultationService } from '../../services/consultationService';
import { bioInputService } from '../../services/bioInputService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';
import {
  Tractor,
  Calendar,
  GraduationCap,
  Sprout,
  Sun,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

import farmersSeed from '../../data/farmers.json';

export const FarmerDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const farmer = farmersSeed.find(f => f.userId === currentUser?.id || f.id === currentUser?.linkedProfileId) || farmersSeed[0];
  const [activeTab, setActiveTab] = useState<'bookings' | 'consultations' | 'advisories'>('bookings');

  const bookings = bookingService.getBookingsByFarmerId(currentUser?.id || farmer.userId);
  const consultations = consultationService.getConsultationsByFarmerId(currentUser?.id || farmer.userId);
  const bioRecommendations = bioInputService.getAllBioInputs().slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Greeting Strip */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&auto=format&fit=crop&q=80'}
            alt="Farmer Avatar"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-forest-500 shadow-subtle shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                Verified Cultivator
              </span>
              <span className="text-xs text-brand-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest-600" />
                {farmer.location.village}, {farmer.location.district}, {farmer.location.state}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              Namaste, {currentUser?.fullName || farmer.name}
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              {currentUser?.organizationName || farmer.name + ' Farms'} • {farmer.landSizeAcres} Acres Holding ({farmer.soilType})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border text-xs font-semibold text-brand-text hover:bg-forest-50 transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-forest-600" />
            Profile & Geolocation
          </Link>

          {/* Seasonal Alert Card */}
          <div className="bg-forest-900 text-white p-3.5 rounded-2xl flex items-center gap-3 shrink-0 max-w-xs hidden xl:flex">
            <div className="w-9 h-9 rounded-xl bg-forest-800 flex items-center justify-center text-harvest shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-heading font-bold text-harvest text-[11px]">Rabi Sowing Forecast</div>
              <p className="text-[10.5px] text-forest-200 leading-snug">
                Optimal soil moisture in Malwa belt.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center shrink-0">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-forest-900">{bookings.length}</div>
            <div className="text-xs text-brand-muted">Active Bookings</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-forest-900">{consultations.length}</div>
            <div className="text-xs text-brand-muted">Consultations</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-forest-900">{farmer.landSizeAcres} Acres</div>
            <div className="text-xs text-brand-muted">Land Holding</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-forest-900">4 Centres</div>
            <div className="text-xs text-brand-muted">Nearby CHC Network</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'bookings'
              ? 'bg-forest-600 text-white shadow-subtle'
              : 'text-brand-muted hover:text-brand-text'
          }`}
        >
          <Tractor className="w-4 h-4" />
          <span>Equipment Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('consultations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'consultations'
              ? 'bg-forest-600 text-white shadow-subtle'
              : 'text-brand-muted hover:text-brand-text'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Scientist Consultations ({consultations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('advisories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'advisories'
              ? 'bg-forest-600 text-white shadow-subtle'
              : 'text-brand-muted hover:text-brand-text'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Bio-Input Advisories</span>
        </button>
      </div>

      {/* Tab 1: Bookings Content */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-forest-900">
              Upcoming Equipment Bookings
            </h3>
            <Link
              to="/machinery"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
            >
              <span>+ Book New Machine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-bold text-base text-forest-900">
                      {b.equipmentName}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-brand-muted">
                    Hiring Hub: <strong>{b.centreName}</strong> • Ref: {b.id}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-brand-text pt-1">
                    <span className="flex items-center gap-1 text-forest-700 font-semibold">
                      <Calendar className="w-3.5 h-3.5" /> {b.startDate}
                    </span>
                    <span className="flex items-center gap-1 text-brand-muted">
                      <Clock className="w-3.5 h-3.5" /> {b.timeSlot}
                    </span>
                    <span className="font-extrabold text-forest-900">
                      {formatCurrency(b.totalCost)} ({b.durationValue} {b.durationUnit})
                    </span>
                  </div>
                  {b.statusReason && (
                    <p className="text-[11px] text-brand-muted bg-cream-50 p-2 rounded-lg border border-brand-border mt-2">
                      Centre Note: {b.statusReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => alert(`Showing tracking coordinates for booking ${b.id}`)}
                    className="px-4 py-2 rounded-xl border border-brand-border text-xs font-semibold text-brand-text hover:bg-cream-50"
                  >
                    View Details
                  </button>
                  {b.status === 'pending_approval' && (
                    <button
                      onClick={() => {
                        bookingService.updateBookingStatus(b.id, 'cancelled', 'Cancelled by farmer.');
                        window.location.reload();
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Consultations Content */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-forest-900">
              Scientist Consultations & Prescriptions
            </h3>
            <Link
              to="/scientists"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
            >
              <span>+ New Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {consultations.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-3xl border border-brand-border shadow-subtle space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-base text-forest-900">
                        {c.crop} - {c.topic}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-brand-muted mt-0.5">
                      Expert: <strong>{c.scientistName}</strong> • Format: {c.format} ({c.slot})
                    </p>
                  </div>
                  <span className="text-[11px] text-brand-muted">
                    Submitted: {c.submittedAt.split('T')[0]}
                  </span>
                </div>

                <div className="text-xs bg-cream-50 p-3.5 rounded-2xl border border-brand-border space-y-1">
                  <span className="font-bold text-brand-text">Observed Symptoms Reported:</span>
                  <p className="text-brand-muted leading-relaxed">{c.issueDescription}</p>
                </div>

                {c.responseNotes && (
                  <div className="bg-forest-50/70 p-4 rounded-2xl border border-forest-200 text-xs space-y-1.5 text-forest-950">
                    <div className="font-heading font-bold flex items-center gap-1.5 text-forest-900">
                      <CheckCircle2 className="w-4 h-4 text-forest-700" />
                      <span>Scientist Diagnosis & Prescription:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-forest-900">{c.responseNotes}</p>
                    {c.prescribedBioInputs && c.prescribedBioInputs.length > 0 && (
                      <div className="pt-1 flex items-center gap-2">
                        <span className="text-[11px] font-bold">Prescribed Solution:</span>
                        <Link to="/bio-inputs" className="text-[11px] font-bold text-forest-700 underline">
                          Trichoderma viride 1.5% WP (Seed Inoculation)
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Bio-Input Advisories */}
      {activeTab === 'advisories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-forest-900">
              Recommended Bio-Inputs for Rabi Gram & Wheat
            </h3>
            <Link
              to="/bio-inputs"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
            >
              <span>Open Guided Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bioRecommendations.map((b) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                    {b.category}
                  </span>
                  <h4 className="font-heading font-bold text-base text-forest-900 mt-2">
                    {b.name}
                  </h4>
                  <p className="text-xs text-brand-muted mt-1 line-clamp-2">
                    {b.intendedPurpose}
                  </p>
                </div>
                <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-xs font-semibold text-forest-700">
                  <Link to="/bio-inputs" className="hover:underline">
                    View Application Guide →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
