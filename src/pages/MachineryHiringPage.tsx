import React, { useState } from 'react';
import { machineryService } from '../services/machineryService';
import { FarmMachinery, MachineryCategory, PricingUnit } from '../types';
import { BookingModal } from '../components/chc/BookingModal';
import { MachineryCompareModal } from '../components/machinery/MachineryCompareModal';
import categoriesSeed from '../data/categories.json';
import { formatCurrency } from '../lib/utils';
import {
  Search,
  Filter,
  Tractor,
  CheckCircle2,
  XCircle,
  Scale,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

export const MachineryHiringPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<MachineryCategory | 'All'>('All');
  const [selectedPricingUnit, setSelectedPricingUnit] = useState<PricingUnit | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [operatorOnly, setOperatorOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  // Comparison State
  const [compareItems, setCompareItems] = useState<FarmMachinery[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Booking Modal
  const [selectedMachinery, setSelectedMachinery] = useState<FarmMachinery | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const machineryList = machineryService.searchMachinery({
    query: searchQuery,
    category: selectedCategory,
    pricingUnit: selectedPricingUnit,
    operatorProvidedOnly: operatorOnly,
    availableOnly
  });

  const toggleCompare = (item: FarmMachinery) => {
    if (compareItems.some(c => c.id === item.id)) {
      setCompareItems(compareItems.filter(c => c.id !== item.id));
    } else {
      if (compareItems.length >= 3) {
        alert('You can compare a maximum of 3 machines at once.');
        return;
      }
      setCompareItems([...compareItems, item]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-agri">
            Agricultural Mechanization Catalog
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest-900 mt-1">
            Farm Machinery Hiring
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 max-w-2xl">
            Compare rental rates, tractor horsepower, and fuel/operator conditions across verified hubs. Hire machinery by hour, day, or acre.
          </p>
        </div>

        {/* Floating Compare Button */}
        {compareItems.length > 0 && (
          <button
            onClick={() => setCompareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-heading font-bold text-xs shadow-elevation transition-all animate-bounce"
          >
            <Scale className="w-4 h-4" />
            <span>Compare Selected ({compareItems.length})</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedCategory === 'All'
              ? 'bg-forest-600 text-white shadow-subtle'
              : 'bg-white text-brand-text border border-brand-border hover:bg-cream-100'
          }`}
        >
          All Machinery
        </button>
        {categoriesSeed.machineryCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-forest-600 text-white shadow-subtle'
                : 'bg-white text-brand-text border border-brand-border hover:bg-cream-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search and Advanced Filters */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by model, implement, or hiring centre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedPricingUnit}
            onChange={(e) => setSelectedPricingUnit(e.target.value as any)}
            className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
          >
            <option value="All">All Pricing Units</option>
            <option value="hourly">Hourly Rate (₹/hr)</option>
            <option value="acre">Per Acre Rate (₹/acre)</option>
            <option value="daily">Daily Contract (₹/day)</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-brand-text">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={operatorOnly}
              onChange={(e) => setOperatorOnly(e.target.checked)}
              className="w-4 h-4 text-forest-600 rounded accent-forest-600 cursor-pointer"
            />
            <span>Operator Included</span>
          </label>
        </div>
      </div>

      {/* Machinery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machineryList.map((item) => {
          const isCompared = compareItems.some(c => c.id === item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="relative h-52 overflow-hidden bg-cream-100">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-forest-900 shadow-subtle">
                    {item.category}
                  </div>
                  <div className="absolute top-3 right-3">
                    {item.available ? (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-subtle">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Available
                      </span>
                    ) : (
                      <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-subtle">
                        <XCircle className="w-3 h-3 text-rose-600" /> Booked Out
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-heading font-bold text-base text-forest-900 leading-snug line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-brand-muted mt-0.5">{item.centreName}</p>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-xl font-heading font-extrabold text-forest-800">
                        {formatCurrency(item.pricePerUnit)}
                      </span>
                      <span className="text-xs text-brand-muted font-medium"> / {item.pricingUnit}</span>
                    </div>
                    {item.horsepower && (
                      <span className="text-xs font-bold text-brand-text bg-cream-100 px-2.5 py-1 rounded-lg border border-brand-border">
                        {item.horsepower} HP
                      </span>
                    )}
                  </div>

                  {/* Specifications Grid */}
                  <div className="bg-cream-50 p-3 rounded-2xl border border-brand-border text-[11px] space-y-1.5 text-brand-muted">
                    <div className="flex justify-between">
                      <span>Operator:</span>
                      <strong className="text-forest-900">
                        {item.operatorProvided ? 'Provided by Centre' : 'Self-Operated'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Terms:</span>
                      <strong className="text-forest-900">{item.fuelType}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Min. Duration:</span>
                      <strong className="text-forest-900">{item.minimumDuration}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCompare(item)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center transition-colors ${
                    isCompared
                      ? 'bg-forest-100 border-forest-500 text-forest-900'
                      : 'border-brand-border text-brand-muted hover:bg-cream-100'
                  }`}
                  title="Compare implement specifications"
                >
                  <Scale className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setSelectedMachinery(item);
                    setBookingModalOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-forest-600 hover:bg-forest-700 shadow-subtle transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Hire Machinery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Modal */}
      <MachineryCompareModal
        machineryList={compareItems}
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onSelectBooking={(mach) => {
          setSelectedMachinery(mach);
          setBookingModalOpen(true);
        }}
      />

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
