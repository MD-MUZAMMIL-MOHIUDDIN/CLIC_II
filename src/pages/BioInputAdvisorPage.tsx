import React, { useState } from 'react';
import { bioInputService } from '../services/bioInputService';
import { inputStoreService } from '../services/inputStoreService';
import { BioInput } from '../types';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  BookOpen,
  Store,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const BioInputAdvisorPage: React.FC = () => {
  const [crop, setCrop] = useState('Gram (Chana)');
  const [growthStage, setGrowthStage] = useState('Early Vegetative');
  const [soilType, setSoilType] = useState('Deep Medium Black (Vertisol)');
  const [symptoms, setSymptoms] = useState('collar rot');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const { recommendations, cautionNote } = bioInputService.getAdvisoryRecommendations({
    crop,
    growthStage,
    symptoms,
    category: categoryFilter
  });

  const stores = inputStoreService.getAllStores();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-agri">
            Symptom-Grounded Advisory Interface
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest-900 mt-1">
            Bio-Input Advisor
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 max-w-2xl">
            Explore validated biofertilizers, antagonistic biopesticides, and botanical formulations grounded in ICAR extension standards and ecological soil health.
          </p>
        </div>

        <Link
          to="/scientists"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-heading font-bold text-xs shadow-subtle transition-all self-start md:self-auto"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Consult a Plant Pathologist</span>
        </Link>
      </div>

      {/* Guided Input Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-forest-900 uppercase tracking-wider border-b border-brand-border pb-3">
          <Sprout className="w-4 h-4 text-forest-600" />
          <span>Specify Crop Diagnostic Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Target Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
            >
              <option value="Gram (Chana)">Gram (Chana) - Rabi Pulse</option>
              <option value="Wheat">Wheat (Gehun) - Cereal</option>
              <option value="Soybean">Soybean - Oilseed</option>
              <option value="Mustard">Mustard (Sarson)</option>
              <option value="Cotton">Cotton - Commercial</option>
              <option value="All Field Crops">All General Crops</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Crop Growth Stage</label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
            >
              <option value="Seed Bed Preparation">Seed Bed Preparation / Pre-sowing</option>
              <option value="Sowing / Seed Treatment">Sowing / Seed Inoculation</option>
              <option value="Early Vegetative">Early Vegetative (20-35 Days)</option>
              <option value="Flowering">Flowering & Pod Setting</option>
              <option value="Pod Formation">Pod / Seed Maturation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
            >
              <option value="Deep Medium Black (Vertisol)">Deep Medium Black (Vertisol)</option>
              <option value="Alluvial Loam">Alluvial Loam</option>
              <option value="Red Sandy Loam">Red Sandy Loam</option>
              <option value="Saline Alkaline Affected">Saline / Alkaline Soil</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Observed Concern / Goal</label>
            <select
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
            >
              <option value="collar rot">Fungal Wilt / Collar Rot Symptoms</option>
              <option value="nitrogen fixation">Nitrogen & Phosphorus Mobilization</option>
              <option value="sucking pests">Sucking Pests (Whitefly / Aphids / Thrips)</option>
              <option value="pod borer">Caterpillars (Pod Borer / Spodoptera)</option>
              <option value="organic carbon">Soil Carbon & Microbial Vitality</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cautionary Banner */}
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Eco-Protective Usage Note</p>
          <p className="text-[11px] leading-relaxed text-amber-900">{cautionNote}</p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['All', 'Biofertilizer', 'Biopesticide', 'Botanical Preparation', 'Compost & Soil Health'].map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              categoryFilter === c
                ? 'bg-forest-600 text-white shadow-subtle'
                : 'bg-white text-brand-text border border-brand-border hover:bg-cream-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Structured Recommendation Cards */}
      <div className="space-y-6">
        {recommendations.map((bio) => (
          <div
            key={bio.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card hover:shadow-card-hover transition-all space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-brand-border pb-5">
              <div className="flex items-start gap-4">
                <img
                  src={bio.imageUrl}
                  alt={bio.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-brand-border shadow-subtle"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800">
                      {bio.category}
                    </span>
                    <span className="text-xs text-brand-muted">
                      Suitable for: <strong>{bio.suitableCrops.join(', ')}</strong>
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-forest-900 mt-1">
                    {bio.name}
                  </h3>
                  <p className="text-xs text-forest-700 font-semibold mt-0.5">
                    Purpose: {bio.intendedPurpose}
                  </p>
                </div>
              </div>

              <Link
                to="/scientists"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200 transition-colors shrink-0 self-start md:self-auto"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Verify with Scientist</span>
              </Link>
            </div>

            {/* Scientific Justification & Rationale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-brand-text">
              <div className="space-y-4">
                <div className="bg-cream-50 p-4 rounded-2xl border border-brand-border space-y-1.5">
                  <h4 className="font-heading font-bold text-xs text-forest-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-forest-600" />
                    Why this suggestion? (Scientific Basis)
                  </h4>
                  <p className="text-[11px] text-brand-muted leading-relaxed">
                    {bio.scientificBasis}
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-xs text-forest-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-forest-600" />
                    Recommended Application Schedule & Dosage
                  </h4>
                  <p className="text-[11px] text-brand-muted leading-relaxed bg-cream-50 p-3 rounded-xl border border-brand-border">
                    {bio.applicationSchedule}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-xs text-forest-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-agri" />
                    Precautions & Storage
                  </h4>
                  <p className="text-[11px] text-brand-muted leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-200/60 text-rose-950">
                    {bio.precautions}
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-brand-muted">
                  <div className="font-bold text-forest-900">Official Scientific Reference:</div>
                  <p className="italic">{bio.officialReference}</p>
                </div>

                {/* Local Stores Availability */}
                <div className="pt-2 border-t border-brand-border">
                  <div className="font-bold text-forest-900 text-xs mb-2 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-forest-600" />
                    <span>Available at Listed Local Input Stores:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bio.availableAtStores.map((storeId) => {
                      const s = stores.find(st => st.id === storeId);
                      return (
                        <span key={storeId} className="px-3 py-1 rounded-xl bg-forest-50 border border-forest-200 text-forest-900 text-[11px] font-semibold">
                          {s ? `${s.storeName} (${s.location.district})` : 'Authorized Input Dealer'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
