import React, { useState } from 'react';
import { machineryService } from '../services/machineryService';
import { FarmMachinery, MachineryCategory, PricingUnit, MachineOperationType } from '../types';
import { BookingModal } from '../components/chc/BookingModal';
import { MachineryCompareModal } from '../components/machinery/MachineryCompareModal';
import { MachineDetailModal } from '../components/machinery/MachineDetailModal';
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
  ArrowRight,
  Play,
  Film,
  Eye,
  CheckCircle
} from 'lucide-react';

export const MachineryHiringPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<MachineryCategory | 'All'>('All');
  const [selectedOperation, setSelectedOperation] = useState<MachineOperationType | 'All'>('All');
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

  // Detailed Technical Inspection Modal
  const [inspectMachinery, setInspectMachinery] = useState<FarmMachinery | null>(null);

  let machineryList = machineryService.searchMachinery({
    query: searchQuery,
    category: selectedCategory,
    pricingUnit: selectedPricingUnit,
    operatorProvidedOnly: operatorOnly,
    availableOnly
  });

  if (selectedOperation !== 'All') {
    machineryList = machineryList.filter(m => m.operationType === selectedOperation);
  }

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

      {/* Operation Type & Category Filter Pills */}
      <div className="space-y-3">
        {/* Operation Types from dropdown master */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-brand-muted shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-forest-700" />
            Operation:
          </span>
          {(['All', 'Tillage', 'Sowing', 'Plant Protection', 'Harvesting'] as const).map((op) => (
            <button
              key={op}
              onClick={() => setSelectedOperation(op)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedOperation === op
                  ? 'bg-forest-900 text-harvest shadow-subtle'
                  : 'bg-white text-brand-text border border-brand-border hover:bg-cream-100'
              }`}
            >
              {op === 'All' ? 'All Operations' : op}
            </button>
          ))}
        </div>

        {/* Machinery Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-brand-muted shrink-0 mr-1">Category:</span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === 'All'
                ? 'bg-forest-600 text-white shadow-subtle'
                : 'bg-white text-brand-text border border-brand-border hover:bg-cream-100'
            }`}
          >
            All Categories
          </button>
          {categoriesSeed.machineryCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-forest-600 text-white shadow-subtle'
                  : 'bg-white text-brand-text border border-brand-border hover:bg-cream-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
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
                <div className="relative h-52 overflow-hidden bg-cream-100 group">
                  <img
                    src={item.thumbnailUrl || item.images?.[0] || ''}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => setInspectMachinery(item)}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-forest-900 shadow-subtle">
                      {item.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-subtle border ${
                      item.operationType === 'Tillage'
                        ? 'bg-amber-100/95 text-amber-900 border-amber-300'
                        : item.operationType === 'Sowing'
                        ? 'bg-emerald-100/95 text-emerald-900 border-emerald-300'
                        : item.operationType === 'Plant Protection'
                        ? 'bg-blue-100/95 text-blue-900 border-blue-300'
                        : 'bg-purple-100/95 text-purple-900 border-purple-300'
                    }`}>
                      {item.operationType || 'Tillage'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
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
                  {item.demoVideoUrl && (
                    <a
                      href={item.demoVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-forest-900/90 hover:bg-forest-900 text-harvest text-[10px] font-bold shadow-subtle flex items-center gap-1 transition-all"
                      title="Watch demo video"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Watch Demo</span>
                    </a>
                  )}
                  <span className="absolute bottom-3 left-3 bg-forest-950/80 text-white font-mono text-[9px] px-2 py-0.5 rounded backdrop-blur-xs font-semibold">
                    {item.id}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3
                      onClick={() => setInspectMachinery(item)}
                      className="font-heading font-bold text-base text-forest-900 leading-snug line-clamp-1 cursor-pointer hover:text-forest-700 transition-colors"
                    >
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-brand-muted mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-forest-600 shrink-0" />
                      <span>{item.centreName}</span>
                    </p>
                  </div>

                  {/* Commercial Terms: Purchasable & Rentable */}
                  <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-cream-50 border border-brand-border text-[10px]">
                    <div>
                      <span className="text-brand-muted font-medium block">Rentable:</span>
                      {item.isRentable ? (
                        <span className="font-extrabold text-forest-900 font-mono">
                          {formatCurrency(item.pricePerUnit)}/{item.pricingUnit}
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold">No</span>
                      )}
                    </div>
                    <div>
                      <span className="text-brand-muted font-medium block">Purchasable:</span>
                      {item.isPurchasable && item.purchasePrice ? (
                        <span className="font-extrabold text-emerald-800 font-mono">
                          {formatCurrency(item.purchasePrice)}
                        </span>
                      ) : (
                        <span className="text-brand-muted font-medium">Rental only</span>
                      )}
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                    {item.shortDescription || item.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectMachinery(item)}
                  className="p-2.5 rounded-xl border border-brand-border text-brand-text hover:bg-forest-50 hover:text-forest-900 text-xs font-semibold flex items-center justify-center transition-colors"
                  title="Inspect full technical description & gallery"
                >
                  <Eye className="w-4 h-4" />
                </button>

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

      {/* Technical Detail Modal */}
      {inspectMachinery && (
        <MachineDetailModal
          machinery={inspectMachinery}
          onClose={() => setInspectMachinery(null)}
        />
      )}

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
