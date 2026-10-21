import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crop, DropdownItem } from '../../types';
import { cropService } from '../../services/cropService';
import { cropProblemService } from '../../services/cropProblemService';
import { problemMediaService } from '../../services/problemMediaService';
import { dropdownMasterService } from '../../services/dropdownMasterService';
import { useToast } from '../../context/ToastContext';
import {
  Sprout,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Eye,
  CheckCircle2,
  XCircle,
  Tag,
  BookOpen,
  Calendar,
  Layers,
  Bug,
  Sparkles,
  Info,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

export const CropList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [crops, setCrops] = useState<Crop[]>(() => cropService.getCrops());
  const [stats, setStats] = useState(() => cropService.getStats());
  const [categoryOptions] = useState<DropdownItem[]>(() => dropdownMasterService.getDropdowns('1'));

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Crop | null>(null);
  const [viewItem, setViewItem] = useState<Crop | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Crop | null>(null);

  // Form State
  const [formCropId, setFormCropId] = useState('');
  const [formCropCode, setFormCropCode] = useState('');
  const [formCropName, setFormCropName] = useState('');
  const [formCategory, setFormCategory] = useState('Cereals');
  const [formTelugu, setFormTelugu] = useState('');
  const [formScientificName, setFormScientificName] = useState('');
  const [formSeason, setFormSeason] = useState('Kharif / Rabi');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setCrops(cropService.getCrops());
    setStats(cropService.getStats());
  };

  const getCategoryBadgeClass = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('cereal')) {
      return 'bg-amber-50 text-amber-900 border-amber-300';
    }
    if (cat.includes('millet')) {
      return 'bg-orange-50 text-orange-900 border-orange-300';
    }
    if (cat.includes('pulse')) {
      return 'bg-emerald-50 text-emerald-900 border-emerald-300';
    }
    if (cat.includes('oilseed')) {
      return 'bg-yellow-50 text-yellow-900 border-yellow-300';
    }
    return 'bg-forest-50 text-forest-900 border-forest-300';
  };

  const getProblemCountForCrop = (cropId: string) => {
    return cropProblemService.getCropProblems().filter(p => String(p.CropId) === String(cropId)).length;
  };

  const filteredCrops = crops.filter((item) => {
    if (categoryFilter !== 'ALL' && item.Category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (statusFilter !== 'ALL') {
      const matchActive = statusFilter === 'ACTIVE';
      if (item.IsActive !== matchActive) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.CropName.toLowerCase().includes(q) ||
        item.CropCode.toLowerCase().includes(q) ||
        item.Telugu.toLowerCase().includes(q) ||
        item.Category.toLowerCase().includes(q) ||
        (item.ScientificName && item.ScientificName.toLowerCase().includes(q)) ||
        (item.Description && item.Description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextId = String(
      crops.length > 0 ? Math.max(...crops.map(c => Number(c.CropId) || 0)) + 1 : 1
    );
    setFormCropId(nextId);
    setFormCropCode('');
    setFormCropName('');
    setFormCategory('Cereals');
    setFormTelugu('');
    setFormScientificName('');
    setFormSeason('Kharif / Rabi');
    setFormDescription('');
    setFormIsActive(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (crop: Crop) => {
    setEditingItem(crop);
    setFormCropId(crop.CropId);
    setFormCropCode(crop.CropCode);
    setFormCropName(crop.CropName);
    setFormCategory(crop.Category);
    setFormTelugu(crop.Telugu);
    setFormScientificName(crop.ScientificName || '');
    setFormSeason(crop.Season || 'Kharif / Rabi');
    setFormDescription(crop.Description || '');
    setFormIsActive(crop.IsActive);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenView = (crop: Crop) => {
    setViewItem(crop);
  };

  const handleOpenDelete = (crop: Crop) => {
    setItemToDelete(crop);
    setDeleteConfirmOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formCropCode.trim()) {
      setFormError('Crop Code is required.');
      return;
    }
    if (!formCropName.trim()) {
      setFormError('Crop Name is required.');
      return;
    }
    if (!formTelugu.trim()) {
      setFormError('Telugu Name is required.');
      return;
    }

    if (editingItem) {
      try {
        cropService.updateCrop(editingItem.CropId, {
          CropCode: formCropCode.trim().toUpperCase(),
          CropName: formCropName.trim(),
          Category: formCategory.trim(),
          Telugu: formTelugu.trim(),
          ScientificName: formScientificName.trim(),
          Season: formSeason.trim(),
          Description: formDescription.trim(),
          IsActive: formIsActive
        });
        showToast('Crop Updated', `Updated "${formCropName.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update Crop.');
      }
    } else {
      try {
        cropService.createCrop({
          CropId: formCropId.trim(),
          CropCode: formCropCode.trim().toUpperCase(),
          CropName: formCropName.trim(),
          Category: formCategory.trim(),
          Telugu: formTelugu.trim(),
          ScientificName: formScientificName.trim(),
          Season: formSeason.trim(),
          Description: formDescription.trim(),
          IsActive: formIsActive
        });
        showToast('Crop Created', `Added "${formCropName.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create Crop.');
      }
    }
  };

  const handleToggleActive = (crop: Crop) => {
    cropService.toggleStatus(crop.CropId);
    showToast(
      crop.IsActive ? 'Crop Deactivated' : 'Crop Activated',
      `"${crop.CropName}" status changed to ${crop.IsActive ? 'Inactive' : 'Active'}.`,
      'info'
    );
    refreshList();
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    cropService.deleteCrop(itemToDelete.CropId);
    showToast('Crop Deleted', `Deleted "${itemToDelete.CropName}".`, 'info');
    setItemToDelete(null);
    setDeleteConfirmOpen(false);
    refreshList();
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Crops */}
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
              Total Crops
            </div>
            <div className="text-2xl font-black text-forest-950 mt-0.5">
              {stats.totalCount}
            </div>
            <div className="text-[10px] text-brand-muted mt-0.5">Catalogued Crops</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5 text-forest-700" />
          </div>
        </div>

        {/* Cereals */}
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Cereals
            </div>
            <div className="text-2xl font-black text-forest-950 mt-0.5">
              {stats.cerealsCount}
            </div>
            <div className="text-[10px] text-brand-muted mt-0.5">Paddy, Maize, Wheat</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <span className="font-extrabold text-sm">🌾</span>
          </div>
        </div>

        {/* Millets */}
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">
              Millets
            </div>
            <div className="text-2xl font-black text-forest-950 mt-0.5">
              {stats.milletsCount}
            </div>
            <div className="text-[10px] text-brand-muted mt-0.5">Jowar, Bajra</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
            <span className="font-extrabold text-sm">🌱</span>
          </div>
        </div>

        {/* Pulses */}
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Pulses
            </div>
            <div className="text-2xl font-black text-forest-950 mt-0.5">
              {stats.pulsesCount}
            </div>
            <div className="text-[10px] text-brand-muted mt-0.5">Red, Bengal, Green, Black</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <span className="font-extrabold text-sm">🫘</span>
          </div>
        </div>

        {/* Active Crops */}
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-subtle flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="text-[11px] font-bold text-forest-700 uppercase tracking-wider">
              Active Crops
            </div>
            <div className="text-2xl font-black text-forest-950 mt-0.5 flex items-baseline gap-1.5">
              <span>{stats.activeCount}</span>
              <span className="text-xs text-brand-muted font-normal">/ {stats.totalCount}</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cream-200 text-forest-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        {/* Banner Header */}
        <div className="p-5 border-b border-brand-border bg-gradient-to-r from-cream-100 via-white to-forest-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-forest-700 text-white shadow-subtle">
                <Sprout className="w-5 h-5 text-harvest" />
              </span>
              <div>
                <h2 className="text-base font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2">
                  <span>Crop Master List</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                    Master Data
                  </span>
                </h2>
                <p className="text-xs text-brand-muted mt-0.5">
                  Complete catalog of crops with Category, Crop Code, English Name, and Telugu localization.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={() => {
                cropService.resetToDefaults();
                refreshList();
                showToast('Reset Done', 'Reset crops list to initial 9 catalogued crops.', 'info');
              }}
              className="p-2 text-brand-muted hover:text-forest-900 hover:bg-cream-200 rounded-xl transition-colors"
              title="Reset to default seed crops"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-subtle transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Crop</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-cream-50/60 border-b border-brand-border flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-forest-600 shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
              >
                <option value="ALL">All Categories ({crops.length})</option>
                <option value="Cereals">Cereals ({stats.cerealsCount})</option>
                <option value="Millets">Millets ({stats.milletsCount})</option>
                <option value="Pulses">Pulses ({stats.pulsesCount})</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only ({stats.activeCount})</option>
                <option value="INACTIVE">Inactive Only ({stats.inactiveCount})</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Search crop name, code, Telugu, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 placeholder:text-brand-muted/70"
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

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-20">CropId</th>
                <th className="py-3 px-4 w-32">Category</th>
                <th className="py-3 px-4 w-36">Crop Code</th>
                <th className="py-3 px-4">Crop Name (English)</th>
                <th className="py-3 px-4 w-36">Telugu (తెలుగు)</th>
                <th className="py-3 px-4 w-40">Problems Linked</th>
                <th className="py-3 px-4 text-center w-28">Status</th>
                <th className="py-3 px-4 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filteredCrops.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-muted">
                    <Sprout className="w-8 h-8 text-cream-300 mx-auto mb-2" />
                    No crops found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredCrops.map((crop) => {
                  const problemCount = getProblemCountForCrop(crop.CropId);
                  return (
                    <tr key={crop.CropId} className="hover:bg-forest-50/40 transition-colors">
                      {/* CropId */}
                      <td className="py-3.5 px-4 font-mono font-bold text-forest-700">
                        <span className="inline-block px-2 py-0.5 rounded bg-forest-100 text-forest-800 text-[11px]">
                          #{crop.CropId}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block border px-2.5 py-0.5 rounded-md font-bold text-[10.5px] uppercase tracking-wider ${getCategoryBadgeClass(crop.Category)}`}>
                          {crop.Category}
                        </span>
                      </td>

                      {/* Crop Code */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-forest-800">
                        <code className="bg-cream-100 px-2 py-0.5 rounded text-[11.5px] font-bold text-forest-900 border border-brand-border/60">
                          {crop.CropCode}
                        </code>
                      </td>

                      {/* Crop Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-forest-950 text-sm">
                          {crop.CropName}
                        </div>
                        {crop.ScientificName && (
                          <div className="text-[11px] italic text-brand-muted font-serif">
                            {crop.ScientificName}
                          </div>
                        )}
                      </td>

                      {/* Telugu Name */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-800 text-sm tracking-wide bg-emerald-50/60 border border-emerald-200/60 px-2.5 py-0.5 rounded-lg inline-block">
                          {crop.Telugu}
                        </span>
                      </td>

                      {/* Problems Linked */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => navigate(`/crop-problems?crop=${crop.CropId}`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cream-200 text-forest-900 text-[11px] font-semibold border border-cream-300 hover:bg-forest-100 hover:text-forest-800 transition-colors"
                          title="View problems for this crop in Crop Problems master"
                        >
                          <Bug className="w-3 h-3 text-forest-600" />
                          <span>{problemCount} Problem{problemCount === 1 ? '' : 's'}</span>
                        </button>
                      </td>

                      {/* IsActive Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(crop)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold transition-all ${
                            crop.IsActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                              : 'bg-cream-200 text-brand-muted hover:bg-cream-300 border border-cream-300'
                          }`}
                          title="Click to toggle status"
                        >
                          {crop.IsActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-green-700" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-brand-muted" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(crop)}
                            className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                            title="View Full Crop Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(crop)}
                            className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                            title="Edit Crop"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(crop)}
                            className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete Crop"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Crop Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-cream-50 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-forest-900 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-forest-700" />
                {editingItem ? 'Edit Crop Details' : 'Add New Crop to Master'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-brand-muted hover:text-forest-900 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    CropId (PK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCropId}
                    onChange={(e) => setFormCropId(e.target.value)}
                    disabled={!!editingItem}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 disabled:bg-cream-100 disabled:text-brand-muted font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Status (IsActive)
                  </label>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-forest-700 focus:ring-forest-500 border-brand-border"
                    />
                    <span className="font-semibold text-forest-900">Active Crop</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                    required
                  >
                    <option value="Cereals">Cereals</option>
                    <option value="Millets">Millets</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Oilseeds">Oilseeds</option>
                    <option value="Commercial Crops">Commercial Crops</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Spices & Condiments">Spices & Condiments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Crop Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCropCode}
                    onChange={(e) => setFormCropCode(e.target.value)}
                    placeholder="e.g. PADDY, MAIZE, COTTON"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Crop Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCropName}
                    onChange={(e) => setFormCropName(e.target.value)}
                    placeholder="e.g. Paddy or Wheat"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Telugu Name (తెలుగు) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTelugu}
                    onChange={(e) => setFormTelugu(e.target.value)}
                    placeholder="e.g. వరి, గోధుమ..."
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Scientific Name (Botanical)
                  </label>
                  <input
                    type="text"
                    value={formScientificName}
                    onChange={(e) => setFormScientificName(e.target.value)}
                    placeholder="e.g. Oryza sativa"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 italic font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Season
                  </label>
                  <input
                    type="text"
                    value={formSeason}
                    onChange={(e) => setFormSeason(e.target.value)}
                    placeholder="e.g. Kharif / Rabi"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Agronomic significance, soil requirements, or economic value..."
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-brand-muted hover:text-forest-900 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 text-white shadow-subtle flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingItem ? 'Update Crop' : 'Create Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-forest-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-harvest/20 flex items-center justify-center text-harvest">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
                    <span>{viewItem.CropName}</span>
                    <span className="text-xs font-normal text-cream-200">({viewItem.Telugu})</span>
                  </h3>
                  {viewItem.ScientificName && (
                    <p className="text-[11px] text-cream-200/80 italic font-serif">
                      {viewItem.ScientificName}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewItem(null)}
                className="p-1 rounded-lg text-cream-200 hover:text-white hover:bg-forest-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-brand-border">
                <div>
                  <span className="text-[10.5px] uppercase tracking-wider text-brand-muted font-bold block mb-1">
                    Category
                  </span>
                  <span className={`inline-block border px-2.5 py-0.5 rounded-md font-bold text-[10.5px] uppercase tracking-wider ${getCategoryBadgeClass(viewItem.Category)}`}>
                    {viewItem.Category}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] uppercase tracking-wider text-brand-muted font-bold block mb-1">
                    Crop Code
                  </span>
                  <code className="bg-cream-100 px-2 py-0.5 rounded text-[11.5px] font-bold text-forest-900 border border-brand-border/60">
                    {viewItem.CropCode}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-brand-border">
                <div>
                  <span className="text-[10.5px] uppercase tracking-wider text-brand-muted font-bold block mb-1">
                    Growing Season
                  </span>
                  <span className="font-semibold text-forest-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-forest-600" />
                    {viewItem.Season || 'Kharif / Rabi'}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] uppercase tracking-wider text-brand-muted font-bold block mb-1">
                    Status
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                    viewItem.IsActive ? 'bg-green-100 text-green-800' : 'bg-cream-200 text-brand-muted'
                  }`}>
                    {viewItem.IsActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {viewItem.IsActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {viewItem.Description && (
                <div className="pb-3 border-b border-brand-border">
                  <span className="text-[10.5px] uppercase tracking-wider text-brand-muted font-bold block mb-1">
                    Agronomic Description
                  </span>
                  <p className="text-forest-900 text-xs leading-relaxed bg-cream-50 p-3 rounded-xl border border-brand-border">
                    {viewItem.Description}
                  </p>
                </div>
              )}

              {/* Linked Crop Problems */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10.5px] uppercase tracking-wider text-brand-muted font-bold flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5 text-forest-700" />
                    Linked Crop Problems ({getProblemCountForCrop(viewItem.CropId)})
                  </span>
                  <button
                    onClick={() => {
                      setViewItem(null);
                      navigate(`/crop-problems?crop=${viewItem.CropId}`);
                    }}
                    className="text-[11px] font-bold text-forest-700 hover:text-forest-900 hover:underline"
                  >
                    View in Problems Master &rarr;
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto [scrollbar-width:thin]">
                  {cropProblemService
                    .getCropProblems()
                    .filter(p => String(p.CropId) === String(viewItem.CropId))
                    .map(prob => {
                      const mediaCount = problemMediaService.getMedia(String(prob.CropProblemId)).length;
                      return (
                        <div
                          key={prob.CropProblemId}
                          onClick={() => {
                            setViewItem(null);
                            navigate(`/crop-problems?crop=${viewItem.CropId}`);
                          }}
                          className="p-2.5 rounded-xl bg-cream-50 hover:bg-forest-50/60 transition-colors cursor-pointer border border-brand-border flex items-center justify-between text-xs group"
                          title="Click to view this problem in Crop Problems Master"
                        >
                          <div>
                            <div className="font-bold text-forest-900 group-hover:text-forest-700 transition-colors flex items-center gap-2">
                              <span>{prob.ProblemName}</span>
                              <span className="inline-flex items-center gap-1 text-[10px] text-brand-muted bg-white px-1.5 py-0.2 rounded border border-brand-border">
                                <ImageIcon className="w-2.5 h-2.5 text-forest-600" />
                                {mediaCount} {mediaCount === 1 ? 'photo' : 'photos'}
                              </span>
                            </div>
                            {prob.ScientificName && (
                              <div className="text-[10.5px] italic text-brand-muted font-mono">{prob.ScientificName}</div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                            #{prob.CropProblemId}
                          </span>
                        </div>
                      );
                    })}
                  {getProblemCountForCrop(viewItem.CropId) === 0 && (
                    <div className="py-3 text-center text-brand-muted text-xs">
                      No problems registered for this crop yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewItem(null)}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-forest-800 text-white hover:bg-forest-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-sm w-full p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-sm text-forest-900 mb-1">
              Delete Crop Record?
            </h3>
            <p className="text-xs text-brand-muted mb-4 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-forest-900">"{itemToDelete.CropName}"</span> (Code: {itemToDelete.CropCode})? Any linked Crop Problems referencing this CropId may be affected.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-brand-muted hover:text-forest-900 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-subtle"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
