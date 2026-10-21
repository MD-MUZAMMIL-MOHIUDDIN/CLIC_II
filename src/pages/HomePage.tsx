import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { chcService } from '../services/chcService';
import { machineryService } from '../services/machineryService';
import { scientistService } from '../services/scientistService';
import { knowledgeService } from '../services/knowledgeService';
import { MapViewer } from '../components/common/MapViewer';
import { BookingModal } from '../components/chc/BookingModal';
import { ConsultationRequestModal } from '../components/scientists/ConsultationRequestModal';
import categoriesSeed from '../data/categories.json';
import appConfigSeed from '../data/app-config.json';
import { formatCurrency } from '../lib/utils';
import {
  Search,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  Tractor,
  GraduationCap,
  Sparkles,
  BookOpen,
  Map as MapIcon,
  List as ListIcon,
  ChevronRight,
  Sun,
  Users,
  Compass
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedState, selectedDistrict, availableStates, availableDistricts, setSelectedState, setSelectedDistrict } = useLocation();

  // Search panel states
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchDate, setSearchDate] = useState('');

  // Map vs List toggle for nearby services
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Booking & Consultation modals
  const [selectedMachinery, setSelectedMachinery] = useState<any | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedScientist, setSelectedScientist] = useState<any | null>(null);
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  const chcCentres = chcService.getAllCentres();
  const featuredMachinery = machineryService.getAllMachinery().slice(0, 4);
  const featuredScientists = scientistService.getAllScientists().slice(0, 3);
  const featuredArticles = knowledgeService.getAllArticles().slice(0, 3);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCategory === 'chc') navigate('/chc');
    else if (searchCategory === 'machinery') navigate('/machinery');
    else if (searchCategory === 'livestock') navigate('/livestock');
    else if (searchCategory === 'scientists') navigate('/scientists');
    else if (searchCategory === 'bio-inputs') navigate('/bio-inputs');
    else navigate('/chc');
  };

  const mapMarkers = chcCentres.map((c) => ({
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
    <div className="space-y-20 pb-16">
      {/* 5.A HERO SECTION */}
      <section className="relative pt-6 sm:pt-10 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline & Search Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-harvest-dark" />
              <span>Unified National AgriTech & Custom Hiring Ecosystem</span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-forest-900 tracking-tight leading-[1.15]">
              Everything Your Farm Needs, <span className="text-agri">All in One Place.</span>
            </h1>

            <p className="text-base sm:text-lg text-brand-muted leading-relaxed font-body max-w-xl">
              Discover farm machinery, access local hiring centres, connect with agricultural scientists, explore livestock resources, and find suitable bio-input guidance for your farming needs.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/chc"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-heading font-bold text-sm text-white bg-forest-600 hover:bg-forest-700 shadow-elevation transition-all hover:translate-y-[-1px]"
              >
                <span>Explore Farm Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/scientists"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-heading font-bold text-sm text-forest-900 bg-white hover:bg-cream-100 border border-brand-border shadow-subtle transition-all"
              >
                <GraduationCap className="w-4 h-4 text-forest-600" />
                <span>Consult an Expert</span>
              </Link>
            </div>

            {/* Interactive Search Panel */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-brand-border space-y-4">
              <div className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-forest-600" />
                <span>Discover Services in Your District</span>
              </div>

              <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Service Category */}
                <div>
                  <label className="block text-[11px] font-semibold text-brand-muted mb-1">
                    Service Category
                  </label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  >
                    <option value="all">All Farm Services</option>
                    <option value="chc">Custom Hiring Centres (CHC)</option>
                    <option value="machinery">Tractors & Implements</option>
                    <option value="livestock">Livestock & Cattle Feed</option>
                    <option value="scientists">ICAR Scientist Advisory</option>
                    <option value="bio-inputs">Bio-Input Guidance</option>
                  </select>
                </div>

                {/* State & District */}
                <div>
                  <label className="block text-[11px] font-semibold text-brand-muted mb-1">
                    Service District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  >
                    {availableDistricts.map(d => (
                      <option key={d} value={d}>{d}, {selectedState}</option>
                    ))}
                  </select>
                </div>

                {/* Required Date & Submit */}
                <div>
                  <label className="block text-[11px] font-semibold text-brand-muted mb-1">
                    Required Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs text-brand-text font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle flex items-center justify-center shrink-0"
                      title="Search"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Compact Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-forest-100/70 text-forest-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-extrabold text-sm text-forest-900">{appConfigSeed.stats.verifiedChcs}</div>
                  <div className="text-[11px] text-brand-muted">Verified Centres</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-forest-100/70 text-forest-700 flex items-center justify-center shrink-0">
                  <Tractor className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-extrabold text-sm text-forest-900">{appConfigSeed.stats.registeredMachinery}</div>
                  <div className="text-[11px] text-brand-muted">Farm Machines</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-forest-100/70 text-forest-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-extrabold text-sm text-forest-900">{appConfigSeed.stats.participatingScientists}</div>
                  <div className="text-[11px] text-brand-muted">Agri Scientists</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-forest-100/70 text-forest-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-extrabold text-sm text-forest-900">{appConfigSeed.stats.farmersServed}</div>
                  <div className="text-[11px] text-brand-muted">Farmers Served</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elevation border border-brand-border bg-white">
              <img
                src="https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=900&auto=format&fit=crop&q=80"
                alt="Indian Farmer in lush agricultural field"
                className="w-full h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />

              {/* Floating Live Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-brand-border text-xs font-bold text-forest-900 flex items-center gap-2 shadow-card">
                <span className="w-2.5 h-2.5 rounded-full bg-agri-dark animate-pulse"></span>
                <span>Active Rabi Hiring Season</span>
              </div>

              {/* Floating Quote Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-brand-border shadow-elevation">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center shrink-0 font-bold">
                    <Tractor className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs text-forest-900">
                      Sub-Mission on Agricultural Mechanization (SMAM)
                    </h4>
                    <p className="text-[11px] text-brand-muted mt-0.5 leading-relaxed">
                      Assuring smallholder farmers affordable access to modern tillage, precision sowing, and harvesting equipment within 45 km radius.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.B AGRICULTURAL SERVICE CATEGORIES */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-agri">
              Integrated Service Architecture
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              Agricultural Service Categories
            </h2>
          </div>
          <p className="text-xs text-brand-muted max-w-md">
            Click into any specialized ecosystem module to discover nearby service providers, equipment availability, or scientific advisory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesSeed.serviceCategories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.route}
              className="group bg-white rounded-2xl overflow-hidden border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col hover:border-forest-400 hover:-translate-y-1"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-forest-900 shadow-subtle">
                  {cat.count}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-lg text-forest-900 group-hover:text-forest-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    {cat.shortDescription}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-forest-700 group-hover:text-forest-900 border-t border-cream-200">
                  <span>Explore Directory</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5.C NEARBY AGRICULTURAL SERVICES (MAP & LIST VIEW) */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-agri uppercase tracking-wider">
                <Compass className="w-4 h-4 text-forest-600" />
                <span>Spatial Service Discovery</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-forest-900 mt-0.5">
                Nearby Custom Hiring Centres in {selectedDistrict}
              </h2>
            </div>

            {/* List / Map View Toggle */}
            <div className="flex items-center bg-cream-100 p-1 rounded-xl border border-brand-border self-start sm:self-auto">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-forest-900 shadow-subtle'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-forest-900 shadow-subtle'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Interactive Map</span>
              </button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <MapViewer
              markers={mapMarkers}
              center={[22.7842, 75.8931]}
              zoom={10}
              className="h-[420px]"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chcCentres.map((centre) => (
                <div
                  key={centre.id}
                  className="p-5 rounded-2xl border border-brand-border bg-cream-50/50 hover:bg-cream-50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={centre.imageUrl}
                      alt={centre.centreName}
                      className="w-24 h-24 rounded-xl object-cover shrink-0 border border-brand-border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-heading font-bold text-base text-forest-900 truncate">
                          {centre.centreName}
                        </span>
                        {centre.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-agri" /> Verified CHC
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-brand-muted mt-1">
                        <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                        <span>{centre.location.village}, {centre.location.block}, {centre.location.district}</span>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1 font-bold text-forest-900">
                          <Star className="w-3.5 h-3.5 text-harvest-dark fill-harvest-dark" />
                          {centre.rating} ({centre.reviewCount} reviews)
                        </span>
                        <span className="text-brand-muted">|</span>
                        <span className="text-brand-muted">{centre.operatingHours}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                    {centre.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-brand-border text-xs">
                    <span className="text-brand-muted font-medium">
                      Coverage: <strong>{centre.serviceRadiusKm} km radius</strong>
                    </span>
                    <Link
                      to={`/chc`}
                      className="inline-flex items-center gap-1 font-bold text-forest-700 hover:text-forest-900"
                    >
                      <span>View Machinery Fleet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5.D HOW THE PLATFORM WORKS (4-STEP WORKFLOW) */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-agri">
            Simple 4-Step Agricultural Workflow
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
            How KrishiSeva Works for Farmers
          </h2>
          <p className="text-xs text-brand-muted mt-2">
            Connecting farm requirements with accredited machines, verified local supplies, and recognized scientific expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Discover Services',
              desc: 'Select your crop, location, and required implement—such as tractors, rotavators, or seed drills.',
              icon: Search
            },
            {
              step: '02',
              title: 'Compare Nearby Hubs',
              desc: 'Review rates per hour or per acre, check operator availability, ratings, and equipment specifications.',
              icon: Tractor
            },
            {
              step: '03',
              title: 'Book or Consult',
              desc: 'Submit scheduled hiring requests or connect directly with ICAR scientists with crop photos.',
              icon: Calendar
            },
            {
              step: '04',
              title: 'Track & Cultivate',
              desc: 'Monitor booking updates, driver dispatches, scientific prescriptions, and orders in one unified portal.',
              icon: CheckCircle2
            }
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-6 border border-brand-border shadow-card hover:shadow-card-hover transition-all relative flex flex-col justify-between"
            >
              <div>
                <span className="font-heading font-extrabold text-3xl text-forest-200">
                  {item.step}
                </span>
                <h3 className="font-heading font-bold text-base text-forest-900 mt-2">
                  {item.title}
                </h3>
                <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-cream-200 flex items-center gap-2 text-xs font-semibold text-forest-700">
                <item.icon className="w-4 h-4 text-forest-600" />
                <span>Standardized Protocol</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5.E SEASONAL AGRICULTURAL INSIGHTS */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-forest-900 rounded-3xl p-6 sm:p-10 text-white shadow-elevation relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800 text-harvest text-xs font-bold">
                <Sun className="w-4 h-4" />
                <span>{appConfigSeed.seasonalContext.currentSeason}</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                Rabi Sowing Window & Critical Operations
              </h2>

              <p className="text-xs sm:text-sm text-forest-200 leading-relaxed font-body">
                {appConfigSeed.seasonalContext.weatherAlert} Prepare seed beds thoroughly and utilize certified seed drills to achieve uniform plant density.
              </p>

              <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
                {appConfigSeed.seasonalContext.criticalOperations.map((op, i) => (
                  <div key={i} className="flex items-center gap-2 bg-forest-800/80 p-2.5 rounded-xl border border-forest-700">
                    <CheckCircle2 className="w-4 h-4 text-harvest shrink-0" />
                    <span className="text-cream-100">{op}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link
                  to="/bio-inputs"
                  className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs text-forest-950 bg-harvest hover:bg-harvest-light shadow-subtle transition-all"
                >
                  Explore Bio-Inputs for Rabi
                </Link>
                <Link
                  to="/machinery"
                  className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-forest-800 hover:bg-forest-700 border border-forest-700 transition-all"
                >
                  Hire Rotavators & Drills
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-forest-800/90 rounded-2xl p-6 border border-forest-700 space-y-4">
              <h3 className="font-heading font-bold text-base text-white border-b border-forest-700 pb-2">
                Priority Crops This Month
              </h3>
              <div className="space-y-3 text-xs">
                {appConfigSeed.seasonalContext.focusCrops.map((crop, idx) => (
                  <div key={idx} className="flex items-center justify-between text-forest-200">
                    <span className="font-medium text-white">{crop}</span>
                    <span className="text-[11px] bg-forest-900/80 px-2.5 py-1 rounded-md text-harvest">
                      Recommended Sowing Window
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.F FEATURED SCIENTISTS & EXPERTS */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-agri">
              Scientific Knowledge Network
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              Connect With Agricultural Scientists
            </h2>
          </div>
          <Link
            to="/scientists"
            className="text-xs font-bold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1"
          >
            <span>View All Scientists</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredScientists.map((sci) => (
            <div
              key={sci.id}
              className="bg-white rounded-2xl overflow-hidden border border-brand-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between p-5 space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={sci.avatarUrl}
                  alt={sci.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-brand-border"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-heading font-bold text-sm text-forest-900">{sci.name}</h3>
                    {sci.verified && <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-brand-muted mt-0.5 line-clamp-1">{sci.designation}</p>
                  <p className="text-[11px] text-forest-700 font-semibold line-clamp-1">{sci.institution}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="flex items-center gap-1 font-bold text-forest-900">
                      <Star className="w-3 h-3 text-harvest-dark fill-harvest-dark" />
                      {sci.rating}
                    </span>
                    <span className="text-[11px] text-brand-muted">({sci.consultationCount} consultations)</span>
                  </div>
                </div>
              </div>

              <div className="text-xs bg-cream-50 p-3 rounded-xl border border-brand-border space-y-1">
                <div className="font-semibold text-brand-text">Domain: {sci.specialization}</div>
                <div className="text-[11px] text-brand-muted">Languages: {sci.languages.join(', ')}</div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedScientist(sci);
                    setConsultModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle transition-colors text-center"
                >
                  Request Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5.G EDUCATIONAL KNOWLEDGE SECTION */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-agri">
              Knowledge Repository
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              Field Guides & Technical Bulletins
            </h2>
          </div>
          <Link
            to="/knowledge"
            className="text-xs font-bold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1"
          >
            <span>Read All Guides</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredArticles.map((art) => (
            <Link
              key={art.id}
              to="/knowledge"
              className="group bg-white rounded-2xl overflow-hidden border border-brand-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-5 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                    {art.category}
                  </span>
                  <h3 className="font-heading font-bold text-base text-forest-900 group-hover:text-forest-700 transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-cream-200 mt-auto flex items-center justify-between text-[11px] text-brand-muted">
                <span>By {art.author}</span>
                <span>{art.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

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

      {/* Consultation Modal */}
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
