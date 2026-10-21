import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Crop, CropProblem, DropdownItem } from '../../types';
import { cropProblemService } from '../../services/cropProblemService';
import { cropService } from '../../services/cropService';
import { dropdownMasterService } from '../../services/dropdownMasterService';
import { problemMediaService } from '../../services/problemMediaService';
import { ProblemMediaManager } from './ProblemMediaManager';
import { useToast } from '../../context/ToastContext';
import {
  Bug,
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
  Sprout,
  Activity,
  Layers,
  Sparkles,
  Info,
  Image as ImageIcon
} from 'lucide-react';

export const CropProblemCRUD: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [problems, setProblems] = useState<CropProblem[]>(() => cropProblemService.getCropProblems());
  const [crops, setCrops] = useState<Crop[]>(() => cropService.getCrops());
  const [problemCategories, setProblemCategories] = useState<DropdownItem[]>(() => dropdownMasterService.getDropdowns('8'));

  // Filters
  const [cropFilter, setCropFilter] = useState<string>(() => searchParams.get('crop') || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CropProblem | null>(null);
  const [viewItem, setViewItem] = useState<CropProblem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CropProblem | null>(null);
  const [mediaModalProblemId, setMediaModalProblemId] = useState<string | null>(null);

  // Form State
  const [formCropProblemId, setFormCropProblemId] = useState('');
  const [formCropId, setFormCropId] = useState('');
  const [formProblemCategoryId, setFormProblemCategoryId] = useState('');
  const [formProblemName, setFormProblemName] = useState('');
  const [formScientificName, setFormScientificName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSymptoms, setFormSymptoms] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setProblems(cropProblemService.getCropProblems());
    setCrops(cropService.getCrops());
    setProblemCategories(dropdownMasterService.getDropdowns('8'));
  };

  const getMediaCount = (cropProblemId: string) => {
    return problemMediaService.getMedia(String(cropProblemId)).length;
  };

  const getProblemMedia = (cropProblemId: string) => {
    return problemMediaService.getMedia(String(cropProblemId));
  };

  const getCropName = (cropId: string) => {
    const found = crops.find(c => String(c.CropId) === String(cropId));
    return found ? `${found.CropName} (${found.Category}${found.Telugu ? ` - ${found.Telugu}` : ''})` : `Crop #${cropId}`;
  };

  const getCategoryName = (catId: string) => {
    const found = problemCategories.find(c => String(c.DropdownId) === String(catId) || String(c.Value) === String(catId));
    return found ? found.Text : `Category #${catId}`;
  };

  const getCategoryBadgeClass = (catId: string) => {
    const cat = problemCategories.find(c => String(c.DropdownId) === String(catId) || String(c.Value) === String(catId));
    const name = cat?.Text.toLowerCase() || '';
    if (name.includes('pest')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (name.includes('disease')) {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    if (name.includes('nutrient')) {
      return 'bg-cyan-100 text-cyan-900 border-cyan-300';
    }
    return 'bg-cream-200 text-forest-900 border-cream-300';
  };

  const filteredItems = problems.filter((item) => {
    if (cropFilter !== 'ALL' && String(item.CropId) !== cropFilter) return false;
    if (categoryFilter !== 'ALL') {
      const targetCat = problemCategories.find(c => String(c.DropdownId) === categoryFilter || String(c.Value) === categoryFilter);
      const matchIds = targetCat ? [String(targetCat.DropdownId), String(targetCat.Value)] : [categoryFilter];
      if (!matchIds.includes(String(item.ProblemCategoryId))) return false;
    }
    if (statusFilter !== 'ALL') {
      const matchActive = statusFilter === 'ACTIVE';
      if (item.IsActive !== matchActive) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cropName = getCropName(item.CropId).toLowerCase();
      const catName = getCategoryName(item.ProblemCategoryId).toLowerCase();
      return (
        item.ProblemName.toLowerCase().includes(q) ||
        (item.ScientificName && item.ScientificName.toLowerCase().includes(q)) ||
        item.Description.toLowerCase().includes(q) ||
        item.Symptoms.toLowerCase().includes(q) ||
        cropName.includes(q) ||
        catName.includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextId = String(problems.length > 0 ? Math.max(...problems.map(p => Number(p.CropProblemId) || 0)) + 1 : 1);
    setFormCropProblemId(nextId);
    setFormCropId(crops.length > 0 ? String(crops[0].CropId) : '');
    setFormProblemCategoryId(problemCategories.length > 0 ? String(problemCategories[0].DropdownId) : '');
    setFormProblemName('');
    setFormScientificName('');
    setFormDescription('');
    setFormSymptoms('');
    setFormIsActive(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CropProblem) => {
    setEditingItem(item);
    setFormCropProblemId(String(item.CropProblemId));
    setFormCropId(String(item.CropId));
    setFormProblemCategoryId(String(item.ProblemCategoryId));
    setFormProblemName(item.ProblemName);
    setFormScientificName(item.ScientificName || '');
    setFormDescription(item.Description);
    setFormSymptoms(item.Symptoms);
    setFormIsActive(item.IsActive);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCropId) {
      setFormError('Target Crop selection is required');
      return;
    }
    if (!formProblemCategoryId) {
      setFormError('Problem Category selection is required');
      return;
    }
    if (!formProblemName.trim()) {
      setFormError('Problem Name is required');
      return;
    }
    if (!formSymptoms.trim()) {
      setFormError('Symptoms description is required');
      return;
    }

    if (editingItem) {
      try {
        cropProblemService.updateCropProblem(String(editingItem.CropProblemId), {
          CropId: formCropId,
          ProblemCategoryId: formProblemCategoryId,
          ProblemName: formProblemName.trim(),
          ScientificName: formScientificName.trim() || undefined,
          Description: formDescription.trim(),
          Symptoms: formSymptoms.trim(),
          IsActive: formIsActive
        });
        showToast('Problem Updated', `Updated "${formProblemName.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update CropProblem');
      }
    } else {
      const idToUse = formCropProblemId.trim() || String(Date.now());
      if (problems.some(p => String(p.CropProblemId) === idToUse)) {
        setFormError(`CropProblem with ID "${idToUse}" already exists.`);
        return;
      }
      try {
        cropProblemService.createCropProblem({
          CropProblemId: idToUse,
          CropId: formCropId,
          ProblemCategoryId: formProblemCategoryId,
          ProblemName: formProblemName.trim(),
          ScientificName: formScientificName.trim() || undefined,
          Description: formDescription.trim(),
          Symptoms: formSymptoms.trim(),
          IsActive: formIsActive
        });
        showToast('Problem Created', `Added "${formProblemName.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create CropProblem');
      }
    }
  };

  const handleToggleActive = (item: CropProblem) => {
    cropProblemService.toggleActive(String(item.CropProblemId));
    showToast(
      item.IsActive ? 'Deactivated' : 'Activated',
      `"${item.ProblemName}" marked as ${item.IsActive ? 'Inactive' : 'Active'}.`,
      'info'
    );
    refreshList();
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    cropProblemService.deleteCropProblem(String(itemToDelete.CropProblemId));
    showToast('Deleted', `Deleted "${itemToDelete.ProblemName}".`, 'info');
    setItemToDelete(null);
    setDeleteConfirmOpen(false);
    refreshList();
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
      {/* Component Banner */}
      <div className="p-5 border-b border-brand-border bg-gradient-to-r from-cream-100 via-white to-forest-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-700 text-white shadow-subtle">
              <Bug className="w-5 h-5 text-harvest" />
            </span>
            <div>
              <h2 className="text-base font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2">
                <span>Crop Problems Master (Pests, Diseases & Deficiencies)</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                  CRUD
                </span>
              </h2>
              <p className="text-xs text-brand-muted mt-0.5">
                Schema: <code className="bg-cream-200 px-1.5 py-0.5 rounded text-[11px] font-mono text-forest-800">CropProblem(CropProblemId PK, CropId FK, ProblemCategoryId FK, ProblemName, ScientificName, Description, Symptoms, IsActive)</code>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 text-white shadow-subtle transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Add Crop Problem
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-cream-50/60 border-b border-brand-border flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Crop Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Sprout className="w-4 h-4 text-forest-600 shrink-0" />
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">All Crops ({crops.length})</option>
              {crops.map((c) => (
                <option key={String(c.CropId)} value={String(c.CropId)}>
                  {c.CropName} ({c.Category}{c.Telugu ? ` - ${c.Telugu}` : ''})
                </option>
              ))}
            </select>
          </div>

          {/* Problem Category Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-forest-600 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">All Categories ({problemCategories.length})</option>
              {problemCategories.map((cat) => (
                <option key={String(cat.DropdownId)} value={String(cat.DropdownId)}>
                  {cat.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Activity className="w-4 h-4 text-forest-600 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Search problem, symptom, scientific name..."
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

        <div className="text-xs text-brand-muted">
          Showing <strong className="text-forest-900">{filteredItems.length}</strong> of {problems.length} records
        </div>
      </div>

      {/* Problems Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-20">ID</th>
              <th className="py-3 px-4 w-44">Target Crop (CropId)</th>
              <th className="py-3 px-4 w-36">Problem Category</th>
              <th className="py-3 px-4 w-52">Problem & Scientific Name</th>
              <th className="py-3 px-4">Symptoms</th>
              <th className="py-3 px-4 w-32 text-center">Visual Media</th>
              <th className="py-3 px-4 w-24 text-center">Status</th>
              <th className="py-3 px-4 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-brand-muted">
                  No crop problem records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={String(item.CropProblemId)} className="hover:bg-forest-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-forest-700">
                    <span className="inline-block px-2 py-0.5 rounded bg-forest-100 text-forest-800 text-[11px]">
                      #{item.CropProblemId}
                    </span>
                  </td>

                  {/* Crop FK */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cream-200 text-forest-900 text-[11px] font-semibold border border-cream-300">
                      <Sprout className="w-3 h-3 text-forest-600" />
                      <span className="truncate max-w-[140px]">{getCropName(item.CropId)}</span>
                    </span>
                  </td>

                  {/* Problem Category FK */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-block border px-2.5 py-0.5 rounded-md font-bold text-[10.5px] uppercase tracking-wider ${getCategoryBadgeClass(item.ProblemCategoryId)}`}>
                      {getCategoryName(item.ProblemCategoryId)}
                    </span>
                  </td>

                  {/* Problem & Scientific Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-forest-950">{item.ProblemName}</div>
                    {item.ScientificName && (
                      <div className="text-[11px] italic text-brand-muted">{item.ScientificName}</div>
                    )}
                  </td>

                  {/* Symptoms */}
                  <td className="py-3.5 px-4 text-brand-text">
                    <p className="line-clamp-2 text-xs leading-relaxed max-w-md">
                      {item.Symptoms}
                    </p>
                  </td>

                  {/* Visual Media FK Column: Inline Thumbnails + Manage Button */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {getProblemMedia(item.CropProblemId).slice(0, 2).map((media) => (
                        <div
                          key={media.ProblemMediaId}
                          onClick={() => setMediaModalProblemId(String(item.CropProblemId))}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-brand-border cursor-pointer hover:ring-2 hover:ring-forest-600 shrink-0 shadow-xs group relative"
                          title={media.MediaDescription}
                        >
                          <img
                            src={media.MediaUrl}
                            alt={media.MediaDescription}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => setMediaModalProblemId(String(item.CropProblemId))}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cream-100 hover:bg-forest-100 text-forest-800 border border-brand-border text-xs font-semibold transition-all group"
                        title="View & manage visual media photos for this crop problem"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-forest-600 group-hover:text-forest-800" />
                        <span>{getMediaCount(item.CropProblemId)} Photos</span>
                      </button>
                    </div>
                  </td>

                  {/* IsActive Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold transition-all ${
                        item.IsActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                      }`}
                      title="Click to toggle status"
                    >
                      {item.IsActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-zinc-500" />}
                      <span>{item.IsActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewItem(item)}
                        className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                        title="View Complete Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete(item);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-brand-border bg-cream-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-forest-700 text-white">
                  <Bug className="w-4 h-4 text-harvest" />
                </span>
                <h3 className="font-heading font-extrabold text-sm text-forest-900">
                  {editingItem ? 'Edit Crop Problem' : 'Add New Crop Problem'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-brand-muted hover:text-forest-900 hover:bg-cream-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    CropProblemId (PK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCropProblemId}
                    onChange={(e) => setFormCropProblemId(e.target.value)}
                    disabled={!!editingItem}
                    placeholder="e.g. 13"
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
                    <span className="font-semibold text-forest-900">Active Record</span>
                  </label>
                </div>
              </div>

              {/* Target Crop FK */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Target Crop (CropId FK) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formCropId}
                  onChange={(e) => setFormCropId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                  required
                >
                  <option value="" disabled>Select target crop...</option>
                  {crops.map((c) => (
                    <option key={String(c.CropId)} value={String(c.CropId)}>
                      {c.CropName} {c.Telugu ? `(${c.Telugu})` : ''} [{c.Category}] (Code: {c.CropCode})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-brand-muted mt-1">
                  Foreign key reference to Crop Master entity (CropId).
                </p>
              </div>

              {/* Problem Category FK */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Problem Category (ProblemCategoryId FK) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formProblemCategoryId}
                  onChange={(e) => setFormProblemCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                  required
                >
                  <option value="" disabled>Select problem category...</option>
                  {problemCategories.map((cat) => (
                    <option key={String(cat.DropdownId)} value={String(cat.DropdownId)}>
                      {cat.Text} (ID: {cat.DropdownId})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-brand-muted mt-1">
                  Foreign key linked to crop_problem_category (Pest, Disease, Nutrient Deficiency).
                </p>
              </div>

              {/* Problem Name & Scientific Name */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Problem Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formProblemName}
                  onChange={(e) => setFormProblemName(e.target.value)}
                  placeholder="e.g. Brown Plant Hopper (BPH)"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Scientific Name
                </label>
                <input
                  type="text"
                  value={formScientificName}
                  onChange={(e) => setFormScientificName(e.target.value)}
                  placeholder="e.g. Nilaparvata lugens"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 italic font-mono"
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Symptoms <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formSymptoms}
                  onChange={(e) => setFormSymptoms(e.target.value)}
                  placeholder="Describe characteristic foliar, stem, root, or earhead visual diagnostic symptoms..."
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 leading-relaxed"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Agronomic Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Overview of environmental triggers, favorable weather, or economic threshold levels..."
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 leading-relaxed"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-brand-border shrink-0">
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
                  {editingItem ? 'Update Problem Record' : 'Create Problem Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-forest-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-harvest" />
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-white">
                    {viewItem.ProblemName}
                  </h3>
                  {viewItem.ScientificName && (
                    <p className="text-[11px] text-cream-200/80 italic font-mono">{viewItem.ScientificName}</p>
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
                    Target Crop
                  </span>
                  <span className="font-bold text-forest-950 flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-forest-600" />
                    {getCropName(viewItem.CropId)}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] uppercase tracking-wider text-brand-muted font-bold block mb-1">
                    Problem Classification
                  </span>
                  <span className={`inline-block border px-2.5 py-0.5 rounded-md font-bold text-[10.5px] uppercase tracking-wider ${getCategoryBadgeClass(viewItem.ProblemCategoryId)}`}>
                    {getCategoryName(viewItem.ProblemCategoryId)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-forest-900 uppercase text-[10.5px] tracking-wider mb-1">
                  Diagnostic Visual Symptoms
                </h4>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 leading-relaxed font-medium">
                  {viewItem.Symptoms}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-forest-900 uppercase text-[10.5px] tracking-wider mb-1">
                  Agronomic Description & Impact
                </h4>
                <p className="text-brand-text leading-relaxed bg-cream-50 p-3 rounded-xl border border-brand-border">
                  {viewItem.Description || 'No detailed description specified.'}
                </p>
              </div>

              {/* Diagnostic Visual Evidence Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-forest-900 uppercase text-[10.5px] tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-forest-700" />
                    <span>Diagnostic Visual Evidence ({getMediaCount(viewItem.CropProblemId)})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setMediaModalProblemId(String(viewItem.CropProblemId))}
                    className="text-[11px] font-bold text-forest-700 hover:text-forest-900 hover:underline flex items-center gap-1"
                  >
                    <span>Manage Evidence</span>
                    <span className="text-xs">&rarr;</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getProblemMedia(viewItem.CropProblemId).map((media) => (
                    <div
                      key={media.ProblemMediaId}
                      className="group relative rounded-xl overflow-hidden border border-brand-border bg-cream-100 aspect-video shadow-subtle cursor-pointer"
                      onClick={() => setMediaModalProblemId(String(viewItem.CropProblemId))}
                      title={media.MediaDescription}
                    >
                      <img
                        src={media.MediaUrl}
                        alt={media.MediaDescription}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                        <span className="text-[9px] font-mono font-bold text-harvest">Order: {media.DisplayOrder}</span>
                        <p className="text-[10px] line-clamp-1 leading-tight">{media.MediaDescription}</p>
                      </div>
                    </div>
                  ))}
                  {getMediaCount(viewItem.CropProblemId) === 0 && (
                    <div className="col-span-full py-4 text-center text-brand-muted bg-cream-50 rounded-xl border border-brand-border text-xs">
                      No visual media attached to this problem yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-brand-border text-[11px] text-brand-muted">
                <span>CropProblemId: <strong className="font-mono text-forest-900">#{viewItem.CropProblemId}</strong></span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${viewItem.IsActive ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'}`}>
                  {viewItem.IsActive ? 'Active Diagnostic Rule' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="p-2.5 rounded-full bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </span>
              <div>
                <h4 className="font-heading font-extrabold text-sm text-forest-950">
                  Delete Crop Problem?
                </h4>
                <p className="text-xs text-brand-muted">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-brand-text leading-relaxed">
              Are you sure you want to delete <strong className="text-forest-900">"{itemToDelete.ProblemName}"</strong> (ID: {itemToDelete.CropProblemId})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-brand-muted hover:text-forest-900 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-subtle"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Media Modal */}
      {mediaModalProblemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-5xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6">
            <ProblemMediaManager
              initialCropProblemId={mediaModalProblemId}
              isModalView={true}
              onClose={() => {
                setMediaModalProblemId(null);
                refreshList();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
