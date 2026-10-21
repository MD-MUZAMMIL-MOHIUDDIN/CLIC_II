import React, { useState } from 'react';
import { scientistService } from '../services/scientistService';
import { consultationService } from '../services/consultationService';
import { ScientistProfile, Consultation } from '../types';
import { ConsultationRequestModal } from '../components/scientists/ConsultationRequestModal';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  CheckCircle2,
  Star,
  GraduationCap,
  Video,
  Phone,
  Building,
  Calendar,
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock,
  MessageSquare
} from 'lucide-react';

export const ScientistsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');

  // Consultation modal
  const [selectedScientist, setSelectedScientist] = useState<ScientistProfile | null>(null);
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  const scientists = scientistService.searchScientists({
    query: searchQuery,
    domain: selectedDomain,
    format: selectedFormat
  });

  const farmerConsultations = consultationService.getConsultationsByFarmerId(currentUser?.id || 'usr_farmer_1');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-agri">
            ICAR & KVK Knowledge Network
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-forest-900 mt-1">
            Connect With Agricultural Scientists
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 max-w-2xl">
            Schedule 1-on-1 audio, video, or clinic consultations with certified ICAR, State Agricultural University, and KVK subject matter specialists.
          </p>
        </div>

        <div className="p-3 bg-forest-50 rounded-2xl border border-forest-200 text-forest-900 text-[11px] max-w-md flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
          <span>
            <strong>Official Advisory Framework:</strong> All scientific guidance is provided in accordance with official ICAR Extension Protocols. Crop photographs are analyzed for targeted fungal, pest, and soil deficiency management.
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scientist name, institution, or disease expertise..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
          >
            <option value="All">All Domains</option>
            <option value="Crop">Crop & Plant Pathology</option>
            <option value="Soil">Soil Science & Bio-fertilizers</option>
            <option value="Livestock">Animal Nutrition & Dairy</option>
          </select>
        </div>

        <div>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
          >
            <option value="All">All Consultation Formats</option>
            <option value="Video Call">Video Call</option>
            <option value="Audio Call">Audio Call</option>
            <option value="Clinic Visit">KVK Clinic Visit</option>
          </select>
        </div>
      </div>

      {/* Active Consultations Preview Bar (if any) */}
      {farmerConsultations.length > 0 && (
        <div className="bg-cream-50 p-4 rounded-2xl border border-brand-border space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-forest-900">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-forest-600" />
              Your Active Consultation Requests ({farmerConsultations.length})
            </span>
            <span className="text-agri font-semibold text-[11px]">Synced with ICAR Portal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {farmerConsultations.map((c) => (
              <div key={c.id} className="p-3 bg-white rounded-xl border border-brand-border text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-forest-900">{c.crop} - {c.topic}</div>
                  <div className="text-[11px] text-brand-muted">{c.scientistName} • {c.slot}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  c.status === 'Responded' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scientists Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scientists.map((sci) => (
          <div
            key={sci.id}
            className="bg-white rounded-3xl border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-300 p-6 flex flex-col justify-between space-y-5"
          >
            <div>
              <div className="flex items-start gap-4">
                <img
                  src={sci.avatarUrl}
                  alt={sci.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-brand-border shadow-subtle"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-heading font-bold text-lg text-forest-900 leading-snug">
                      {sci.name}
                    </h3>
                    {sci.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-agri" /> ICAR Verified
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-brand-muted mt-0.5">{sci.designation}</p>
                  <p className="text-xs text-forest-700 font-semibold mt-0.5">{sci.institution}</p>

                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1 font-bold text-forest-900">
                      <Star className="w-3.5 h-3.5 text-harvest-dark fill-harvest-dark" />
                      {sci.rating} ({sci.consultationCount} consultations)
                    </span>
                    <span className="text-brand-muted">|</span>
                    <span className="text-brand-muted font-medium">{sci.experienceYears} Years Exp.</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-brand-muted mt-4 leading-relaxed">
                {sci.about}
              </p>

              {/* Research & Publications Box */}
              <div className="mt-4 pt-3 border-t border-brand-border space-y-2">
                <div className="text-[11px] font-bold text-forest-900">Key Research Interests:</div>
                <div className="flex flex-wrap gap-1.5">
                  {sci.researchInterests.map((r, idx) => (
                    <span key={idx} className="bg-cream-100 text-brand-text text-[10.5px] px-2 py-0.5 rounded-md border border-brand-border">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Available Formats & Slots */}
              <div className="mt-4 bg-cream-50 p-3 rounded-2xl border border-brand-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted font-medium">Supported Formats:</span>
                  <div className="flex items-center gap-2 font-semibold text-forest-900">
                    {sci.consultationFormats.includes('Video Call') && <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-forest-600" /> Video</span>}
                    {sci.consultationFormats.includes('Audio Call') && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-forest-600" /> Audio</span>}
                    {sci.consultationFormats.includes('Clinic Visit') && <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-forest-600" /> Clinic</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-brand-muted">Languages:</span>
                  <span className="font-semibold text-forest-900">{sci.languages.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedScientist(sci);
                  setConsultModalOpen(true);
                }}
                className="w-full py-3 rounded-xl font-heading font-bold text-xs text-white bg-forest-600 hover:bg-forest-700 shadow-subtle transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Request Appointment / Submit Query</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Consultation Request Modal */}
      {selectedScientist && (
        <ConsultationRequestModal
          scientist={selectedScientist}
          isOpen={consultModalOpen}
          onClose={() => {
            setConsultModalOpen(false);
            setSelectedScientist(null);
          }}
        />
      )}
    </div>
  );
};
