import React, { useState } from 'react';
import { ProblemMedia, CropProblem, Crop } from '../../types';
import { problemMediaService } from '../../services/problemMediaService';
import { cropProblemService } from '../../services/cropProblemService';
import { cropService } from '../../services/cropService';
import { useToast } from '../../context/ToastContext';
import {
  Image as ImageIcon,
  Video,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Check,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Maximize2,
  Bug,
  RefreshCw,
  LayoutGrid,
  List
} from 'lucide-react';

interface ProblemMediaManagerProps {
  initialCropProblemId?: string;
  onClose?: () => void;
  isModalView?: boolean;
}

export const ProblemMediaManager: React.FC<ProblemMediaManagerProps> = ({
  initialCropProblemId = 'ALL',
  onClose,
  isModalView = false
}) => {
  const { showToast } = useToast();

  const [mediaList, setMediaList] = useState<ProblemMedia[]>(() => problemMediaService.getMedia());
  const [problems, setProblems] = useState<CropProblem[]>(() => cropProblemService.getCropProblems());
  const [crops, setCrops] = useState<Crop[]>(() => cropService.getCrops());

  // Filters & View modes
  const [problemFilter, setProblemFilter] = useState<string>(initialCropProblemId);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProblemMedia | null>(null);
  const [previewMedia, setPreviewMedia] = useState<ProblemMedia | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProblemMedia | null>(null);

  // Form State
  const [formMediaId, setFormMediaId] = useState('');
  const [formCropProblemId, setFormCropProblemId] = useState('');
  const [formMediaType, setFormMediaType] = useState('IMAGE');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formMediaDescription, setFormMediaDescription] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setMediaList(problemMediaService.getMedia());
    setProblems(cropProblemService.getCropProblems());
    setCrops(cropService.getCrops());
  };

  const getProblemTitle = (cropProblemId: string) => {
    const prob = problems.find(p => String(p.CropProblemId) === String(cropProblemId));
    if (!prob) return `Problem #${cropProblemId}`;
    const crop = crops.find(c => String(c.CropId) === String(prob.CropId));
    return `${prob.ProblemName} [${crop ? crop.CropName : 'Crop'}]`;
  };

  const filteredMedia = mediaList.filter((m) => {
    if (problemFilter !== 'ALL' && String(m.CropProblemId) !== problemFilter) {
      return false;
    }
    if (typeFilter !== 'ALL' && m.MediaType.toUpperCase() !== typeFilter) {
      return false;
    }
    if (statusFilter !== 'ALL') {
      const matchActive = statusFilter === 'ACTIVE';
      if (m.IsActive !== matchActive) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const probTitle = getProblemTitle(m.CropProblemId).toLowerCase();
      return (
        m.MediaDescription.toLowerCase().includes(q) ||
        m.MediaUrl.toLowerCase().includes(q) ||
        probTitle.includes(q) ||
        String(m.ProblemMediaId).includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextId = String(
      mediaList.length > 0 ? Math.max(...mediaList.map(m => Number(m.ProblemMediaId) || 0)) + 1 : 1
    );
    setFormMediaId(nextId);
    setFormCropProblemId(problemFilter !== 'ALL' ? problemFilter : (problems[0]?.CropProblemId || '1'));
    setFormMediaType('IMAGE');
    setFormMediaUrl('');
    setFormMediaDescription('');
    setFormDisplayOrder(1);
    setFormIsActive(true);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (item: ProblemMedia) => {
    setEditingItem(item);
    setFormMediaId(item.ProblemMediaId);
    setFormCropProblemId(item.CropProblemId);
    setFormMediaType(item.MediaType);
    setFormMediaUrl(item.MediaUrl);
    setFormMediaDescription(item.MediaDescription);
    setFormDisplayOrder(item.DisplayOrder);
    setFormIsActive(item.IsActive);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formCropProblemId) {
      setFormError('Please select a target Crop Problem.');
      return;
    }
    if (!formMediaUrl.trim()) {
      setFormError('Media URL is required.');
      return;
    }
    if (!formMediaDescription.trim()) {
      setFormError('Media Description / Caption is required.');
      return;
    }

    if (editingItem) {
      try {
        problemMediaService.updateMedia(editingItem.ProblemMediaId, {
          CropProblemId: formCropProblemId,
          MediaType: formMediaType.toUpperCase(),
          MediaUrl: formMediaUrl.trim(),
          MediaDescription: formMediaDescription.trim(),
          DisplayOrder: Number(formDisplayOrder) || 1,
          IsActive: formIsActive
        });
        showToast('Media Updated', 'Problem media updated successfully.', 'success');
        refreshList();
        setFormModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update media.');
      }
    } else {
      try {
        problemMediaService.createMedia({
          ProblemMediaId: formMediaId.trim(),
          CropProblemId: formCropProblemId,
          MediaType: formMediaType.toUpperCase(),
          MediaUrl: formMediaUrl.trim(),
          MediaDescription: formMediaDescription.trim(),
          DisplayOrder: Number(formDisplayOrder) || 1,
          IsActive: formIsActive
        });
        showToast('Media Created', 'Problem media created successfully.', 'success');
        refreshList();
        setFormModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create media.');
      }
    }
  };

  const handleToggleActive = (item: ProblemMedia) => {
    problemMediaService.toggleActive(item.ProblemMediaId);
    showToast(
      item.IsActive ? 'Media Deactivated' : 'Media Activated',
      `Media #${item.ProblemMediaId} marked as ${item.IsActive ? 'Inactive' : 'Active'}.`,
      'info'
    );
    refreshList();
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    problemMediaService.deleteMedia(itemToDelete.ProblemMediaId);
    showToast('Deleted', `Media #${itemToDelete.ProblemMediaId} removed.`, 'info');
    setItemToDelete(null);
    setDeleteConfirmOpen(false);
    refreshList();
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 bg-white rounded-2xl border border-brand-border shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-700 text-white shadow-subtle">
              <ImageIcon className="w-5 h-5 text-harvest" />
            </span>
            <div>
              <h2 className="text-sm font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2">
                <span>Problem Media Gallery & Manager</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                  ProblemMedia Schema
                </span>
              </h2>
              <p className="text-[11px] text-brand-muted mt-0.5">
                Manage photographic evidence, field diagnostic symptoms, and display ordering linked to <code className="bg-cream-200 px-1 py-0.2 rounded font-mono text-forest-800">CropProblemId FK</code>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Grid / Table toggle */}
          <div className="flex items-center bg-cream-100 rounded-xl p-0.5 border border-brand-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-forest-900 shadow-subtle'
                  : 'text-brand-muted hover:text-forest-900'
              }`}
              title="Grid Visual Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-forest-900 shadow-subtle'
                  : 'text-brand-muted hover:text-forest-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              problemMediaService.resetToDefaults();
              refreshList();
              showToast('Reset Done', 'Problem media restored to initial 15 seed visual records.', 'info');
            }}
            className="p-2 text-brand-muted hover:text-forest-900 hover:bg-cream-100 rounded-xl transition-colors"
            title="Reset to default seed media"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-subtle transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Media</span>
          </button>

          {isModalView && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-brand-muted hover:text-forest-900 hover:bg-cream-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 bg-cream-50/70 rounded-2xl border border-brand-border flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Problem Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Bug className="w-3.5 h-3.5 text-forest-600 shrink-0" />
            <select
              value={problemFilter}
              onChange={(e) => setProblemFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 text-forest-900 font-medium max-w-xs truncate"
            >
              <option value="ALL">All Problems ({problems.length})</option>
              {problems.map((prob) => (
                <option key={prob.CropProblemId} value={prob.CropProblemId}>
                  #{prob.CropProblemId} - {prob.ProblemName}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-forest-600 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 text-forest-900 font-medium"
            >
              <option value="ALL">All Media Types</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 text-forest-900 font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search description, URL, problem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 text-forest-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-forest-900"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Grid or Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-brand-border p-12 text-center text-brand-muted">
              <ImageIcon className="w-10 h-10 text-cream-300 mx-auto mb-2" />
              <p className="text-xs">No media visuals found matching your criteria.</p>
            </div>
          ) : (
            filteredMedia.map((item) => (
              <div
                key={item.ProblemMediaId}
                className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden flex flex-col group hover:shadow-elevation transition-all"
              >
                {/* Media Image Thumbnail */}
                <div className="relative aspect-video bg-cream-100 overflow-hidden cursor-pointer" onClick={() => setPreviewMedia(item)}>
                  <img
                    src={item.MediaUrl}
                    alt={item.MediaDescription}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  {/* Badges Overlay */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white font-mono font-bold text-[10px]">
                      #{item.ProblemMediaId}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-forest-800/80 backdrop-blur-sm text-harvest font-bold text-[10px] uppercase">
                      Order: {item.DisplayOrder}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm ${
                      item.IsActive ? 'bg-green-600/80 text-white' : 'bg-cream-200/90 text-brand-muted'
                    }`}>
                      {item.IsActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Zoom hint on hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="p-2 rounded-xl bg-black/50 backdrop-blur-sm">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between text-xs space-y-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-forest-700 tracking-wider flex items-center gap-1 truncate mb-1">
                      <Bug className="w-3 h-3 text-agri" />
                      <span>{getProblemTitle(item.CropProblemId)}</span>
                    </div>
                    <p className="text-forest-950 font-medium line-clamp-2 leading-relaxed">
                      {item.MediaDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-brand-border flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-muted">
                      {item.MediaType === 'VIDEO' ? <Video className="w-3.5 h-3.5 text-blue-600" /> : <ImageIcon className="w-3.5 h-3.5 text-forest-600" />}
                      <span>{item.MediaType}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className="p-1 rounded-lg text-brand-muted hover:text-forest-900 hover:bg-cream-100"
                        title={item.IsActive ? 'Deactivate' : 'Activate'}
                      >
                        {item.IsActive ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-brand-muted" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100"
                        title="Edit Media"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete(item);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Media"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-20">MediaId</th>
                  <th className="py-3 px-4 w-24">Preview</th>
                  <th className="py-3 px-4 w-48">Crop Problem (FK)</th>
                  <th className="py-3 px-4 w-24">Type</th>
                  <th className="py-3 px-4">Description / Caption</th>
                  <th className="py-3 px-4 w-20 text-center">Order</th>
                  <th className="py-3 px-4 w-24 text-center">Status</th>
                  <th className="py-3 px-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filteredMedia.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-brand-muted">
                      No media records found.
                    </td>
                  </tr>
                ) : (
                  filteredMedia.map((item) => (
                    <tr key={item.ProblemMediaId} className="hover:bg-forest-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-forest-700">
                        <span className="inline-block px-2 py-0.5 rounded bg-forest-100 text-forest-800 text-[11px]">
                          #{item.ProblemMediaId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <img
                          src={item.MediaUrl}
                          alt={item.MediaDescription}
                          onClick={() => setPreviewMedia(item)}
                          className="w-12 h-9 object-cover rounded-lg border border-brand-border cursor-pointer hover:scale-110 transition-transform"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-forest-900 block truncate max-w-[190px]">
                          {getProblemTitle(item.CropProblemId)}
                        </span>
                        <span className="text-[10px] font-mono text-brand-muted">
                          (CropProblemId: {item.CropProblemId})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-cream-200 text-forest-800 border border-cream-300">
                          {item.MediaType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-forest-900 font-medium">
                        <p className="line-clamp-2 max-w-md">{item.MediaDescription}</p>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-forest-800">
                        {item.DisplayOrder}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            item.IsActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-cream-200 text-brand-muted border border-cream-300'
                          }`}
                        >
                          {item.IsActive ? <CheckCircle2 className="w-3 h-3 text-green-700" /> : <XCircle className="w-3 h-3 text-brand-muted" />}
                          {item.IsActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewMedia(item)}
                            className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
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
        </div>
      )}

      {/* Add / Edit Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-cream-50 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-forest-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-forest-700" />
                {editingItem ? 'Edit Problem Media Record' : 'Add New Problem Media Record'}
              </h3>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-brand-muted hover:text-forest-900 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    ProblemMediaId (PK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formMediaId}
                    onChange={(e) => setFormMediaId(e.target.value)}
                    disabled={!!editingItem}
                    placeholder="e.g. 16"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 disabled:bg-cream-100 font-mono"
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
                    <span className="font-semibold text-forest-900">Active Media</span>
                  </label>
                </div>
              </div>

              {/* CropProblemId FK Select */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Target Crop Problem (CropProblemId FK) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formCropProblemId}
                  onChange={(e) => setFormCropProblemId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 font-medium"
                  required
                >
                  <option value="" disabled>Select parent problem...</option>
                  {problems.map((prob) => (
                    <option key={prob.CropProblemId} value={prob.CropProblemId}>
                      #{prob.CropProblemId} - {prob.ProblemName}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-brand-muted mt-1">
                  Foreign key reference to CropProblem(CropProblemId).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Media Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formMediaType}
                    onChange={(e) => setFormMediaType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 font-medium"
                    required
                  >
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="INFOGRAPHIC">INFOGRAPHIC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Display Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 font-mono"
                    required
                  />
                  <p className="text-[10px] text-brand-muted mt-1">
                    Sequence for visual sorting in gallery.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Media URL (CDN / Image Link) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 font-mono"
                  required
                />
              </div>

              {/* Instant Image Preview */}
              {formMediaUrl && (
                <div className="p-2.5 rounded-xl bg-cream-50 border border-brand-border flex items-center gap-3">
                  <img
                    src={formMediaUrl}
                    alt="Preview"
                    className="w-16 h-12 object-cover rounded-lg border border-brand-border shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-forest-700 uppercase block">Live Preview</span>
                    <span className="text-[11px] text-brand-muted truncate block">{formMediaUrl}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Media Description / Caption <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formMediaDescription}
                  onChange={(e) => setFormMediaDescription(e.target.value)}
                  placeholder="e.g. Diagnostic leaf necrosis with spindle lesions..."
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-brand-muted hover:text-forest-900 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 text-white shadow-subtle flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingItem ? 'Update Media' : 'Save Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-brand-border bg-forest-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-harvest" />
                <span className="font-bold text-xs">
                  {getProblemTitle(previewMedia.CropProblemId)} (Order: {previewMedia.DisplayOrder})
                </span>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1 rounded-lg text-cream-200 hover:text-white hover:bg-forest-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black/90 aspect-video flex items-center justify-center overflow-hidden">
              <img
                src={previewMedia.MediaUrl}
                alt={previewMedia.MediaDescription}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>

            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-forest-950 leading-relaxed">
                {previewMedia.MediaDescription}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-brand-border text-[11px] text-brand-muted">
                <span className="font-mono">MediaId: #{previewMedia.ProblemMediaId}</span>
                <a
                  href={previewMedia.MediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest-700 hover:text-forest-900 font-semibold flex items-center gap-1"
                >
                  <span>Open Full Resolution</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
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
              Delete Media Record?
            </h3>
            <p className="text-xs text-brand-muted mb-4 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-forest-900">Media #{itemToDelete.ProblemMediaId}</span>? This action cannot be undone.
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
