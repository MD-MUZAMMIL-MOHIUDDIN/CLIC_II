import React, { useState } from 'react';
import { Crop, CropProblem, ProblemMedia, ProblemManagement, ProblemManagementMedia, DropdownItem } from '../../types';
import { cropService } from '../../services/cropService';
import { cropProblemService } from '../../services/cropProblemService';
import { problemMediaService } from '../../services/problemMediaService';
import { problemManagementService } from '../../services/problemManagementService';
import { problemManagementMediaService } from '../../services/problemManagementMediaService';
import { dropdownMasterService } from '../../services/dropdownMasterService';
import { ProblemMediaManager } from './ProblemMediaManager';
import { useToast } from '../../context/ToastContext';
import {
  Sprout,
  Bug,
  Image as ImageIcon,
  ShieldCheck,
  Search,
  Filter,
  Maximize2,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Flame,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Eye,
  Layers,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  Compass,
  LayoutGrid
} from 'lucide-react';

interface CropProblemMediaExplorerProps {
  initialCropId?: string;
  onSelectProblem?: (problem: CropProblem) => void;
}

export const CropProblemMediaExplorer: React.FC<CropProblemMediaExplorerProps> = ({
  initialCropId = 'ALL',
  onSelectProblem
}) => {
  const { showToast } = useToast();

  const [crops] = useState<Crop[]>(() => cropService.getCrops());
  const [problems, setProblems] = useState<CropProblem[]>(() => cropProblemService.getCropProblems());
  const [mediaList, setMediaList] = useState<ProblemMedia[]>(() => problemMediaService.getMedia());
  const [managements, setManagements] = useState<ProblemManagement[]>(() => problemManagementService.getManagements());
  const [mgmtMediaList, setMgmtMediaList] = useState<ProblemManagementMedia[]>(() => problemManagementMediaService.getMedia());
  const [categories] = useState<DropdownItem[]>(() => dropdownMasterService.getDropdowns('8'));

  // Filters
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [managementTypeFilter, setManagementTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active view inside each card: 'media' (photos) vs 'management' (control advisory)
  const [cardActiveTab, setCardActiveTab] = useState<Record<string, 'media' | 'management'>>({});

  // Lightbox
  const [lightboxData, setLightboxData] = useState<{
    title: string;
    description: string;
    items: { url: string; caption: string; order: number }[];
    index: number;
  } | null>(null);

  // Quick Add Media modal
  const [addMediaProblem, setAddMediaProblem] = useState<CropProblem | null>(null);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaDescription, setNewMediaDescription] = useState('');
  const [newMediaType, setNewMediaType] = useState('IMAGE');
  const [newMediaOrder, setNewMediaOrder] = useState<number>(1);
  const [addMediaError, setAddMediaError] = useState('');

  // Expandable descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  // Sub-mode toggle: 'atlas' (cards) vs 'gallery' (media library)
  const [viewSubMode, setViewSubMode] = useState<'atlas' | 'gallery'>('atlas');

  const refreshData = () => {
    setProblems(cropProblemService.getCropProblems());
    setMediaList(problemMediaService.getMedia());
    setManagements(problemManagementService.getManagements());
    setMgmtMediaList(problemManagementMediaService.getMedia());
  };

  const getMediaForProblem = (cropProblemId: string) => {
    return mediaList
      .filter(m => String(m.CropProblemId) === String(cropProblemId) && m.IsActive)
      .sort((a, b) => a.DisplayOrder - b.DisplayOrder);
  };

  const getManagementsForProblem = (cropProblemId: string) => {
    let list = managements.filter(m => String(m.CropProblemId) === String(cropProblemId) && m.IsActive);
    if (managementTypeFilter !== 'ALL') {
      list = list.filter(m => m.ManagementType.toLowerCase() === managementTypeFilter.toLowerCase());
    }
    return list;
  };

  const getMediaForManagement = (managementId: string) => {
    return mgmtMediaList
      .filter(m => String(m.ManagementId) === String(managementId) && m.IsActive)
      .sort((a, b) => a.DisplayOrder - b.DisplayOrder);
  };

  const getCropById = (cropId: string) => {
    return crops.find(c => String(c.CropId) === String(cropId));
  };

  const getCategoryName = (catId: string) => {
    const found = categories.find(c => String(c.DropdownId) === String(catId) || String(c.Value) === String(catId));
    return found ? found.Text : `Category #${catId}`;
  };

  const getCategoryDetails = (catId: string) => {
    const name = getCategoryName(catId).toLowerCase();
    if (name.includes('pest')) {
      return {
        label: 'Insect Pest',
        icon: <Flame className="w-3 h-3 text-amber-700" />,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        borderAccent: 'border-l-amber-500'
      };
    }
    if (name.includes('disease')) {
      return {
        label: 'Crop Disease',
        icon: <ShieldAlert className="w-3 h-3 text-rose-700" />,
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
        borderAccent: 'border-l-rose-500'
      };
    }
    return {
      label: 'Nutrient Deficiency',
      icon: <Sparkles className="w-3 h-3 text-cyan-700" />,
      badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      borderAccent: 'border-l-cyan-500'
    };
  };

  const getManagementTypeBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('cultural')) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (t.includes('biological')) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    if (t.includes('chemical')) return 'bg-purple-100 text-purple-900 border-purple-300';
    if (t.includes('mechanical')) return 'bg-blue-100 text-blue-900 border-blue-300';
    return 'bg-cream-200 text-forest-900 border-cream-300';
  };

  const filteredProblems = problems.filter((problem) => {
    if (selectedCropId !== 'ALL' && String(problem.CropId) !== selectedCropId) {
      return false;
    }
    if (selectedCategoryFilter !== 'ALL') {
      const cat = categories.find(c => String(c.DropdownId) === selectedCategoryFilter || String(c.Value) === selectedCategoryFilter);
      const matchIds = cat ? [String(cat.DropdownId), String(cat.Value)] : [selectedCategoryFilter];
      if (!matchIds.includes(String(problem.ProblemCategoryId))) return false;
    }
    if (managementTypeFilter !== 'ALL') {
      const probMgmts = managements.filter(m => String(m.CropProblemId) === String(problem.CropProblemId));
      if (!probMgmts.some(m => m.ManagementType.toLowerCase() === managementTypeFilter.toLowerCase())) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const crop = getCropById(problem.CropId);
      const cropName = crop ? crop.CropName.toLowerCase() : '';
      const cropTelugu = crop ? crop.Telugu.toLowerCase() : '';
      const catName = getCategoryName(problem.ProblemCategoryId).toLowerCase();
      const probMgmts = managements.filter(m => String(m.CropProblemId) === String(problem.CropProblemId));
      const mgmtMatch = probMgmts.some(m => m.ManagementDetails.toLowerCase().includes(q) || m.ManagementType.toLowerCase().includes(q));

      return (
        problem.ProblemName.toLowerCase().includes(q) ||
        (problem.ScientificName && problem.ScientificName.toLowerCase().includes(q)) ||
        problem.Symptoms.toLowerCase().includes(q) ||
        (problem.Description && problem.Description.toLowerCase().includes(q)) ||
        cropName.includes(q) ||
        cropTelugu.includes(q) ||
        catName.includes(q) ||
        mgmtMatch
      );
    }
    return true;
  });

  const handleOpenAddMedia = (problem: CropProblem) => {
    setAddMediaProblem(problem);
    const existing = getMediaForProblem(problem.CropProblemId);
    setNewMediaUrl('');
    setNewMediaDescription('');
    setNewMediaType('IMAGE');
    setNewMediaOrder(existing.length + 1);
    setAddMediaError('');
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMediaProblem) return;
    if (!newMediaUrl.trim()) {
      setAddMediaError('Please enter a valid image URL.');
      return;
    }
    if (!newMediaDescription.trim()) {
      setAddMediaError('Please enter a caption.');
      return;
    }

    try {
      problemMediaService.createMedia({
        CropProblemId: addMediaProblem.CropProblemId,
        MediaType: newMediaType,
        MediaUrl: newMediaUrl.trim(),
        MediaDescription: newMediaDescription.trim(),
        DisplayOrder: Number(newMediaOrder) || 1,
        IsActive: true
      });
      showToast('Media Attached', `Added visual evidence to "${addMediaProblem.ProblemName}".`, 'success');
      refreshData();
      setAddMediaProblem(null);
    } catch (err: any) {
      setAddMediaError(err.message || 'Failed to save media.');
    }
  };

  const openProblemMediaLightbox = (problem: CropProblem, index: number) => {
    const media = getMediaForProblem(problem.CropProblemId);
    setLightboxData({
      title: problem.ProblemName,
      description: problem.Symptoms,
      items: media.map(m => ({
        url: m.MediaUrl,
        caption: m.MediaDescription,
        order: m.DisplayOrder
      })),
      index
    });
  };

  const openManagementMediaLightbox = (mgmt: ProblemManagement, index: number) => {
    const media = getMediaForManagement(mgmt.ManagementId);
    setLightboxData({
      title: `${mgmt.ManagementType} Management Practice`,
      description: mgmt.ManagementDetails,
      items: media.map(m => ({
        url: m.MediaUrl,
        caption: m.MediaDescription,
        order: m.DisplayOrder
      })),
      index
    });
  };

  return (
    <div className="space-y-6">
      {/* Perspective Switcher: Atlas Diagnostic Cards vs Media Library */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-brand-border shadow-subtle">
        <div className="flex items-center gap-1.5 p-1 bg-cream-200/80 rounded-xl border border-brand-border">
          <button
            onClick={() => setViewSubMode('atlas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewSubMode === 'atlas'
                ? 'bg-forest-800 text-white shadow-subtle'
                : 'text-brand-muted hover:text-forest-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Problem Atlas</span>
          </button>
          <button
            onClick={() => setViewSubMode('gallery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewSubMode === 'gallery'
                ? 'bg-forest-800 text-white shadow-subtle'
                : 'text-brand-muted hover:text-forest-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Diagnostic Media Gallery ({mediaList.length})</span>
          </button>
        </div>

        <div className="text-xs text-brand-muted font-medium">
          {viewSubMode === 'atlas'
            ? 'Interactive visual cards linking symptoms, diagnostic photos, and IPM control measures'
            : 'Photo evidence repository with live previews, display ordering, and lightbox'}
        </div>
      </div>

      {viewSubMode === 'gallery' ? (
        <ProblemMediaManager />
      ) : (
        <>
          {/* 1. TOP CROP SELECTOR RIBBON */}
          <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-forest-100 text-forest-800">
                  <Sprout className="w-4 h-4 text-forest-700" />
                </span>
                <span className="text-xs font-heading font-extrabold text-forest-900 uppercase tracking-wider">
                  1. Select Field Crop
                </span>
              </div>
              <span className="text-[11px] text-brand-muted">
                Showing {filteredProblems.length} diagnostic problems & management practices
              </span>
            </div>

        {/* Horizontal Crop Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          <button
            onClick={() => setSelectedCropId('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
              selectedCropId === 'ALL'
                ? 'bg-forest-800 text-white border-forest-900 shadow-subtle'
                : 'bg-cream-50 hover:bg-cream-100 text-forest-900 border-brand-border'
            }`}
          >
            <span>🌾 All Crops</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedCropId === 'ALL' ? 'bg-forest-900 text-white' : 'bg-cream-200 text-forest-800'
            }`}>
              {problems.length}
            </span>
          </button>

          {crops.map((crop) => {
            const cropProblemsCount = problems.filter(p => String(p.CropId) === String(crop.CropId)).length;
            const isSelected = selectedCropId === String(crop.CropId);
            return (
              <button
                key={crop.CropId}
                onClick={() => setSelectedCropId(String(crop.CropId))}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2.5 border ${
                  isSelected
                    ? 'bg-forest-700 text-white border-forest-800 shadow-subtle ring-2 ring-forest-500/30'
                    : 'bg-white hover:bg-forest-50/60 text-forest-950 border-brand-border'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span>{crop.CropName}</span>
                    <span className={`text-[11px] font-normal ${isSelected ? 'text-cream-200' : 'text-emerald-800 font-semibold'}`}>
                      ({crop.Telugu})
                    </span>
                  </div>
                  <div className={`text-[9.5px] uppercase tracking-wider ${isSelected ? 'text-cream-300' : 'text-brand-muted'}`}>
                    {crop.Category}
                  </div>
                </div>

                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-forest-900 text-cream-100' : 'bg-cream-200 text-forest-800'
                }`}>
                  {cropProblemsCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CATEGORY, MANAGEMENT TYPE & SEARCH FILTERS */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-subtle flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Problem Category Switch */}
          <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl border border-brand-border">
            <button
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-white text-forest-900 shadow-subtle'
                  : 'text-brand-muted hover:text-forest-900'
              }`}
            >
              All Types
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategoryFilter === String(cat.DropdownId) || selectedCategoryFilter === String(cat.Value);
              return (
                <button
                  key={cat.DropdownId}
                  onClick={() => setSelectedCategoryFilter(String(cat.DropdownId))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-white text-forest-900 shadow-subtle'
                      : 'text-brand-muted hover:text-forest-900'
                  }`}
                >
                  {cat.Text.toLowerCase().includes('pest') && <Flame className="w-3 h-3 text-amber-600" />}
                  {cat.Text.toLowerCase().includes('disease') && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                  {cat.Text.toLowerCase().includes('nutrient') && <Sparkles className="w-3 h-3 text-cyan-600" />}
                  <span>{cat.Text}</span>
                </button>
              );
            })}
          </div>

          {/* Management Type Pill Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700 shrink-0" />
            <select
              value={managementTypeFilter}
              onChange={(e) => setManagementTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-cream-50 border border-brand-border rounded-xl font-medium text-forest-900 focus:outline-none"
            >
              <option value="ALL">All IPM Controls</option>
              <option value="Cultural">🌾 Cultural Control</option>
              <option value="Biological">🐞 Biological Control</option>
              <option value="Chemical">🧪 Chemical Control</option>
              <option value="Mechanical">⚙️ Mechanical Control</option>
            </select>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search symptoms, chemicals, crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-cream-50/70 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 text-forest-900 placeholder:text-brand-muted"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-forest-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. SHOWCASE GRID: CROP -> PROBLEM -> CROP MEDIA & MANAGEMENT -> MANAGEMENT MEDIA */}
      {filteredProblems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-border p-16 text-center text-brand-muted">
          <Bug className="w-12 h-12 text-cream-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-forest-900">No Crop Problems or IPM Practices Found</h3>
          <p className="text-xs text-brand-muted mt-1">Try resetting or broadening your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProblems.map((problem) => {
            const crop = getCropById(problem.CropId);
            const mediaItems = getMediaForProblem(problem.CropProblemId);
            const mgmtItems = getManagementsForProblem(problem.CropProblemId);
            const catDetails = getCategoryDetails(problem.ProblemCategoryId);
            const activeTab = cardActiveTab[problem.CropProblemId] || 'media';

            return (
              <div
                key={problem.CropProblemId}
                className={`bg-white rounded-2xl border border-brand-border shadow-subtle hover:shadow-elevation transition-all flex flex-col justify-between overflow-hidden border-l-4 ${catDetails.borderAccent} group`}
              >
                <div>
                  {/* Card Header */}
                  <div className="p-4 pb-3 border-b border-brand-border/60 bg-gradient-to-r from-cream-50 via-white to-forest-50/20">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {/* Crop Pill */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 text-[11px] font-bold border border-forest-200">
                        <Sprout className="w-3 h-3 text-forest-600" />
                        <span>{crop?.CropName || `Crop #${problem.CropId}`}</span>
                        {crop?.Telugu && <span className="font-normal">({crop.Telugu})</span>}
                      </span>

                      {/* Problem Category Badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border ${catDetails.badgeClass}`}>
                        {catDetails.icon}
                        <span>{catDetails.label}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-heading font-extrabold text-forest-950 group-hover:text-forest-700 transition-colors">
                      {problem.ProblemName}
                    </h3>
                    {problem.ScientificName && (
                      <p className="text-[11px] text-brand-muted italic font-serif">
                        {problem.ScientificName}
                      </p>
                    )}
                  </div>

                  {/* Switch between Diagnostic Media (ProblemMedia) and Control Advisory (ProblemManagement) */}
                  <div className="p-4 pb-0">
                    <div className="grid grid-cols-2 gap-1 bg-cream-100 p-1 rounded-xl border border-brand-border text-xs">
                      <button
                        onClick={() => setCardActiveTab(prev => ({ ...prev, [problem.CropProblemId]: 'media' }))}
                        className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                          activeTab === 'media'
                            ? 'bg-white text-forest-900 shadow-subtle'
                            : 'text-brand-muted hover:text-forest-900'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-forest-700" />
                        <span>Visuals ({mediaItems.length})</span>
                      </button>

                      <button
                        onClick={() => setCardActiveTab(prev => ({ ...prev, [problem.CropProblemId]: 'management' }))}
                        className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                          activeTab === 'management'
                            ? 'bg-white text-forest-900 shadow-subtle'
                            : 'text-brand-muted hover:text-forest-900'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                        <span>IPM Advisory ({mgmtItems.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: DIAGNOSTIC CROP MEDIA (ProblemMedia) */}
                  {activeTab === 'media' && (
                    <div className="p-4 space-y-3">
                      {mediaItems.length > 0 ? (
                        <div className="space-y-2">
                          <div
                            className="relative aspect-video rounded-xl overflow-hidden bg-cream-100 border border-brand-border cursor-pointer group/img shadow-subtle"
                            onClick={() => openProblemMediaLightbox(problem, 0)}
                          >
                            <img
                              src={mediaItems[0].MediaUrl}
                              alt={mediaItems[0].MediaDescription}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                              <div className="flex items-center justify-between text-[10px] font-bold text-harvest mb-0.5">
                                <span>Evidence #1</span>
                                <span className="flex items-center gap-1 bg-black/60 px-1.5 py-0.2 rounded backdrop-blur-sm">
                                  <Maximize2 className="w-3 h-3" /> Zoom
                                </span>
                              </div>
                              <p className="text-[11px] line-clamp-1 leading-snug text-white font-medium">
                                {mediaItems[0].MediaDescription}
                              </p>
                            </div>
                          </div>

                          {mediaItems.length > 1 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                              {mediaItems.slice(1).map((item, idx) => (
                                <div
                                  key={item.ProblemMediaId}
                                  onClick={() => openProblemMediaLightbox(problem, idx + 1)}
                                  className="w-16 h-12 rounded-lg overflow-hidden border border-brand-border cursor-pointer shrink-0 relative group/thumb hover:ring-2 hover:ring-forest-600 transition-all shadow-subtle"
                                  title={item.MediaDescription}
                                >
                                  <img
                                    src={item.MediaUrl}
                                    alt={item.MediaDescription}
                                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                                  />
                                  <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/70 text-white font-mono text-[8px] font-bold">
                                    #{item.DisplayOrder}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => handleOpenAddMedia(problem)}
                          className="py-6 px-4 rounded-xl border border-dashed border-brand-border bg-cream-50/60 hover:bg-forest-50/40 text-center cursor-pointer transition-colors"
                        >
                          <ImageIcon className="w-6 h-6 text-brand-muted/60 mx-auto mb-1.5" />
                          <span className="text-xs font-bold text-forest-800 block">No diagnostic photos yet</span>
                          <span className="text-[10px] text-brand-muted block mt-0.5">Click to attach photo evidence</span>
                        </div>
                      )}

                      {/* Symptoms Callout */}
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                        <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-700" />
                          <span>Field Symptoms</span>
                        </div>
                        <p className="text-amber-950 text-xs leading-relaxed line-clamp-3">
                          {problem.Symptoms}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PROBLEM MANAGEMENT & MANAGEMENT MEDIA (ProblemManagement + ProblemManagementMedia) */}
                  {activeTab === 'management' && (
                    <div className="p-4 space-y-3">
                      {mgmtItems.length > 0 ? (
                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto [scrollbar-width:thin] pr-1">
                          {mgmtItems.map((mgmt) => {
                            const mgmtMedia = getMediaForManagement(mgmt.ManagementId);
                            return (
                              <div
                                key={mgmt.ManagementId}
                                className="p-3 rounded-xl bg-cream-50/80 border border-brand-border space-y-2 text-xs"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${getManagementTypeBadge(mgmt.ManagementType)}`}>
                                    {mgmt.ManagementType}
                                  </span>
                                  <span className="text-[10px] font-bold text-brand-muted">
                                    {mgmt.SeverityLevel}
                                  </span>
                                </div>

                                <div className="text-[10.5px] font-semibold text-forest-900">
                                  <span>Stage: {mgmt.PlantGrowthStage}</span>
                                </div>

                                <p className="text-forest-950 leading-relaxed text-[11px] font-medium">
                                  {mgmt.ManagementDetails}
                                </p>

                                {/* ProblemManagementMedia Thumbnails */}
                                {mgmtMedia.length > 0 && (
                                  <div className="pt-1.5 border-t border-brand-border/60">
                                    <div className="flex items-center gap-1.5 overflow-x-auto">
                                      {mgmtMedia.map((m, mIdx) => (
                                        <div
                                          key={m.ManagementMediaId}
                                          onClick={() => openManagementMediaLightbox(mgmt, mIdx)}
                                          className="w-14 h-10 rounded-lg overflow-hidden border border-brand-border cursor-pointer shrink-0 relative group/mthumb hover:ring-2 hover:ring-forest-600 transition-all"
                                          title={m.MediaDescription}
                                        >
                                          <img src={m.MediaUrl} alt={m.MediaDescription} className="w-full h-full object-cover" />
                                          <span className="absolute bottom-0.5 right-0.5 px-0.5 rounded bg-black/70 text-white font-mono text-[8px]">
                                            #{m.DisplayOrder}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-6 px-4 rounded-xl border border-dashed border-brand-border bg-cream-50/60 text-center text-brand-muted text-xs">
                          <ShieldCheck className="w-6 h-6 text-brand-muted/60 mx-auto mb-1.5" />
                          <span>No IPM management practices registered yet.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-3 px-4 bg-cream-50/80 border-t border-brand-border flex items-center justify-between text-xs">
                  <span className="font-mono text-[10.5px] text-brand-muted">
                    ID: #{problem.CropProblemId}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddMedia(problem)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-brand-border hover:bg-cream-100 text-forest-900 font-semibold text-[11px] flex items-center gap-1 shadow-subtle"
                    >
                      <Plus className="w-3 h-3 text-forest-700" />
                      <span>Attach Photo</span>
                    </button>

                    {onSelectProblem && (
                      <button
                        onClick={() => onSelectProblem(problem)}
                        className="px-2.5 py-1 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold text-[11px] shadow-subtle"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. FULLSCREEN LIGHTBOX */}
      {lightboxData && lightboxData.items[lightboxData.index] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxData(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-3xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-brand-border bg-forest-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
                  <span>{lightboxData.title}</span>
                  <span className="text-xs font-normal text-cream-200">
                    ({lightboxData.index + 1} of {lightboxData.items.length})
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setLightboxData(null)}
                className="p-1.5 rounded-xl text-cream-200 hover:text-white hover:bg-forest-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center min-h-[350px] max-h-[65vh] overflow-hidden select-none">
              <img
                src={lightboxData.items[lightboxData.index].url}
                alt={lightboxData.items[lightboxData.index].caption}
                className="max-w-full max-h-[65vh] object-contain"
              />

              {lightboxData.items.length > 1 && (
                <>
                  <button
                    onClick={() => setLightboxData(prev => prev ? ({ ...prev, index: (prev.index > 0 ? prev.index - 1 : prev.items.length - 1) }) : null)}
                    className="absolute left-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setLightboxData(prev => prev ? ({ ...prev, index: (prev.index < prev.items.length - 1 ? prev.index + 1 : 0) }) : null)}
                    className="absolute right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-4 bg-white space-y-2">
              <p className="text-xs text-forest-950 font-semibold leading-relaxed">
                {lightboxData.items[lightboxData.index].caption}
              </p>
              <div className="pt-2 border-t border-brand-border flex items-center justify-between text-xs">
                <span className="text-[10.5px] text-brand-muted">
                  Order #{lightboxData.items[lightboxData.index].order}
                </span>
                <a
                  href={lightboxData.items[lightboxData.index].url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest-700 hover:text-forest-900 font-bold flex items-center gap-1 text-[11px]"
                >
                  <span>Open Full Resolution</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ATTACH MEDIA MODAL */}
      {addMediaProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-forest-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-harvest" />
                  <span>Attach Diagnostic Photo</span>
                </h3>
                <p className="text-[11px] text-cream-200/80 truncate max-w-xs mt-0.5">
                  To: {addMediaProblem.ProblemName}
                </p>
              </div>
              <button onClick={() => setAddMediaProblem(null)} className="p-1 rounded-lg text-cream-200 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="p-5 space-y-4 text-xs">
              {addMediaError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {addMediaError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Media Image URL (CDN / Web Link) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 font-mono"
                  required
                />
              </div>

              {newMediaUrl && (
                <div className="p-2 rounded-xl bg-cream-50 border border-brand-border flex items-center gap-3">
                  <img
                    src={newMediaUrl}
                    alt="Preview"
                    className="w-14 h-10 object-cover rounded-lg border border-brand-border shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-forest-700 uppercase block">Live Preview</span>
                    <span className="text-[10.5px] text-brand-muted truncate block">{newMediaUrl}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Symptom Caption / Observation <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={newMediaDescription}
                  onChange={(e) => setNewMediaDescription(e.target.value)}
                  placeholder="e.g. Diagnostic leaf spots or hopper burn patches..."
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={newMediaOrder}
                    onChange={(e) => setNewMediaOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">Media Type</label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 font-medium"
                  >
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setAddMediaProblem(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-brand-muted hover:text-forest-900 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 text-white shadow-subtle flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Attach Media</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
