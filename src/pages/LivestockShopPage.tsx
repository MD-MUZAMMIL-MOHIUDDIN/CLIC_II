import React, { useState } from 'react';
import { livestockService } from '../services/livestockService';
import { LivestockProduct } from '../types';
import { EnquiryModal } from '../components/livestock/EnquiryModal';
import categoriesSeed from '../data/categories.json';
import { formatCurrency } from '../lib/utils';
import {
  Search,
  CheckCircle2,
  Phone,
  MapPin,
  Heart,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Sparkles
} from 'lucide-react';

export const LivestockShopPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveOnly, setLiveOnly] = useState(false);

  // Enquiry modal
  const [activeProduct, setActiveProduct] = useState<LivestockProduct | null>(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const products = livestockService.searchProducts({
    query: searchQuery,
    category: selectedCategory,
    liveAnimalsOnly: liveOnly
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-earth">
            Livestock Resources & Animal Nutrition
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest-900 mt-1">
            Livestock Marketplace
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 max-w-2xl">
            Certified dairy breeds, breeding goats, poultry chicks, bypass protein feeds, chelated minerals, and fodder processing machinery.
          </p>
        </div>

        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] max-w-md flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Health Compliance Notice:</strong> All live animal listings must carry veterinary health certificates and mandatory tag numbers. No unverified veterinary medical treatments are sold.
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedCategory === 'All'
              ? 'bg-earth text-white shadow-subtle'
              : 'bg-white text-brand-text border border-brand-border hover:bg-cream-100'
          }`}
        >
          All Listings
        </button>
        {categoriesSeed.livestockCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-earth text-white shadow-subtle'
                : 'bg-white text-brand-text border border-brand-border hover:bg-cream-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-3 relative">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Murrah buffalo, Kadaknath chicks, bypass feed, mineral mixture..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-brand-text cursor-pointer select-none">
            <input
              type="checkbox"
              checked={liveOnly}
              onChange={(e) => setLiveOnly(e.target.checked)}
              className="w-4 h-4 text-forest-600 rounded accent-forest-600 cursor-pointer"
            />
            <span>Live Animals Only (Cattle/Goats)</span>
          </label>
        </div>
      </div>

      {/* Product Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((item) => (
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
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-subtle">
                    {item.stockStatus}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-base text-forest-900 leading-snug line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-brand-muted mt-0.5">
                    <span className="font-semibold text-forest-800">{item.sellerName}</span>
                    {item.verifiedSeller && <CheckCircle2 className="w-3.5 h-3.5 text-agri" />}
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-xl font-heading font-extrabold text-forest-800">
                      {formatCurrency(item.price)}
                    </span>
                    {item.priceUnit && (
                      <span className="text-xs text-brand-muted font-medium"> {item.priceUnit}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-brand-muted">
                    <MapPin className="w-3 h-3 text-forest-600" />
                    <span>{item.location.district}, {item.location.state}</span>
                  </div>
                </div>

                {/* Live Animal Details Box */}
                {item.isLiveAnimal && item.animalDetails && (
                  <div className="bg-cream-50 p-3 rounded-2xl border border-brand-border text-[11px] space-y-1.5 text-brand-muted">
                    <div className="flex justify-between">
                      <span>Breed & Age:</span>
                      <strong className="text-forest-900">{item.animalDetails.breed} ({item.animalDetails.age})</strong>
                    </div>
                    {item.animalDetails.milkYieldPerDay && (
                      <div className="flex justify-between">
                        <span>Milk Yield:</span>
                        <strong className="text-forest-900">{item.animalDetails.milkYieldPerDay}</strong>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span>Vaccinations:</span>
                      <strong className="text-agri text-[10.5px] truncate max-w-[170px]">{item.animalDetails.vaccinationStatus}</strong>
                    </div>
                    {item.animalDetails.healthCertificateAvailable && (
                      <div className="flex items-center gap-1 text-emerald-700 font-bold text-[10px] pt-0.5">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Veterinary Health Certificate Attached</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveProduct(item);
                  setEnquiryOpen(true);
                }}
                className="w-full py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-forest-600 hover:bg-forest-700 shadow-subtle transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact Seller / Inquire</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enquiry Modal */}
      {activeProduct && (
        <EnquiryModal
          product={activeProduct}
          isOpen={enquiryOpen}
          onClose={() => {
            setEnquiryOpen(false);
            setActiveProduct(null);
          }}
        />
      )}
    </div>
  );
};
