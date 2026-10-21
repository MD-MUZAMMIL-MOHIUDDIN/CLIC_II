import React, { useState } from 'react';
import { chcService } from '../services/chcService';
import { machineryService } from '../services/machineryService';
import { useLocation } from '../context/LocationContext';
import { CHCCentre, FarmMachinery } from '../types';
import { MapViewer } from '../components/common/MapViewer';
import { BookingModal } from '../components/chc/BookingModal';
import { formatCurrency } from '../lib/utils';
import {
  Search,
  MapPin,
  CheckCircle2,
  Star,
  Tractor,
  SlidersHorizontal,
  Phone,
  Clock,
  Shield,
  Layers,
  Map as MapIcon,
  List as ListIcon,
  Info,
  Calendar
} from 'lucide-react';

export const CHCDiscoveryPage: React.FC = () => {
  const { selectedState, selectedDistrict } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');

  // Selected Centre Detail Drawer
  const [activeCentre, setActiveCentre] = useState<CHCCentre | null>(null);

  // Booking Modal
  const [selectedMachinery, setSelectedMachinery] = useState<FarmMachinery | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const centres = chcService.searchCentres({
    query: searchQuery,
    verifiedOnly,
    minRating
  });

  const allMachinery = machineryService.getAllMachinery();

  const mapMarkers = centres.map(c => ({
    id: c.id,
    name: c.centreName,
    lat: c.location.lat || 22.7842,
    lng: c.location.lng || 75.8931,
    type: 'chc' as const,
    address: `${c.location.block}, ${c.location.district}`,
    phone: c.contactPhone,
    verified: c.verified
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-agri">
            Agricultural Mechanization Network
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest-900 mt-1">
            Custom Hiring Centres (CHCs)
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 max-w-2xl">
            Locate accredited hubs offering high-horsepower tractors, laser land levellers, rotavators, and precision seed drills operated by certified technicians.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-cream-100 p-1 rounded-xl border border-brand-border self-start md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'cards' ? 'bg-white text-forest-900 shadow-subtle' : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>Directory</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map' ? 'bg-white text-forest-900 shadow-subtle' : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by centre name, village, or implement..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
          >
            <option value="0">All Ratings</option>
            <option value="4.5">Rating 4.5+ ★</option>
            <option value="4.8">Rating 4.8+ ★</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-brand-text cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="w-4 h-4 text-forest-600 rounded accent-forest-600 cursor-pointer"
            />
            <span>SMAM Verified Only</span>
          </label>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <MapViewer
          markers={mapMarkers}
          center={[22.7842, 75.8931]}
          zoom={10}
          className="h-[520px]"
          onMarkerClick={(id) => {
            const c = centres.find(item => item.id === id);
            if (c) setActiveCentre(c);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {centres.map((centre) => {
            const availableEquipment = allMachinery.filter(m => centre.availableEquipmentIds.includes(m.id));

            return (
              <div
                key={centre.id}
                className="bg-white rounded-3xl border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-300 p-6 flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img
                      src={centre.imageUrl}
                      alt={centre.centreName}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-brand-border shadow-subtle"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-heading font-bold text-lg text-forest-900 leading-snug">
                          {centre.centreName}
                        </h3>
                        {centre.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-agri" /> SMAM Verified
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-brand-muted mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                        <span>{centre.location.village}, {centre.location.block}, {centre.location.district}</span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1 font-bold text-forest-900">
                          <Star className="w-3.5 h-3.5 text-harvest-dark fill-harvest-dark" />
                          {centre.rating} ({centre.reviewCount})
                        </span>
                        <span className="text-brand-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {centre.operatingHours}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-brand-muted mt-4 leading-relaxed line-clamp-2">
                    {centre.description}
                  </p>

                  {/* Available Implements Preview */}
                  <div className="mt-4 pt-4 border-t border-brand-border">
                    <div className="text-[11px] font-bold text-brand-text mb-2 flex items-center gap-1.5">
                      <Tractor className="w-3.5 h-3.5 text-forest-600" />
                      <span>Available Machinery Fleet ({availableEquipment.length} Registered)</span>
                    </div>

                    <div className="space-y-2">
                      {availableEquipment.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2.5 bg-cream-50 rounded-xl border border-brand-border text-xs"
                        >
                          <div>
                            <span className="font-bold text-forest-900">{m.name}</span>
                            <span className="text-brand-muted text-[11px] block">{m.category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-extrabold text-forest-800">{formatCurrency(m.pricePerUnit)}</span>
                              <span className="text-brand-muted text-[10px]"> / {m.pricingUnit}</span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedMachinery(m);
                                setBookingModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-forest-600 hover:bg-forest-700 text-white shadow-subtle transition-colors"
                            >
                              Hire
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-brand-border text-xs">
                  <span className="text-brand-muted">
                    Tel: <strong className="text-forest-900">{centre.contactPhone}</strong>
                  </span>
                  <button
                    onClick={() => setActiveCentre(centre)}
                    className="font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
                  >
                    <span>Centre Details & Terms</span>
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Centre Details Modal / Drawer */}
      {activeCentre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-brand-border bg-forest-50/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-200/60 text-forest-800">
                  Accredited CHC Information
                </span>
                <h3 className="font-heading font-bold text-lg text-forest-900 mt-1">
                  {activeCentre.centreName}
                </h3>
              </div>
              <button
                onClick={() => setActiveCentre(null)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-text"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-brand-text">
              <div className="grid grid-cols-2 gap-4 bg-cream-50 p-4 rounded-2xl border border-brand-border">
                <div>
                  <span className="text-brand-muted block">SMAM Registration ID:</span>
                  <span className="font-bold text-forest-900">{activeCentre.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-brand-muted block">In-Charge Manager:</span>
                  <span className="font-bold text-forest-900">{activeCentre.contactPerson}</span>
                </div>
                <div>
                  <span className="text-brand-muted block">Phone Contact:</span>
                  <span className="font-bold text-forest-900">{activeCentre.contactPhone}</span>
                </div>
                <div>
                  <span className="text-brand-muted block">Service Radius:</span>
                  <span className="font-bold text-forest-900">{activeCentre.serviceRadiusKm} km around centre</span>
                </div>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-forest-900 mb-1">Operational Description</h4>
                <p className="text-brand-muted leading-relaxed">{activeCentre.description}</p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-forest-900 mb-2">Centre Hiring Rules & Deposit Policy</h4>
                <ul className="list-disc pl-5 space-y-1 text-brand-muted leading-relaxed">
                  <li>Equipment is provided with certified operators and diesel included unless specified otherwise.</li>
                  <li>Security deposits are 100% refundable immediately upon completion of field work and signoff.</li>
                  <li>Cancellations are accepted up to 6 hours before scheduled dispatch without penalty.</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-border bg-cream-50 flex justify-end">
              <button
                onClick={() => setActiveCentre(null)}
                className="px-5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedMachinery && (
        <BookingModal
          machinery={selectedMachinery}
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedMachinery(null);
          }}
        />
      )}
    </div>
  );
};
