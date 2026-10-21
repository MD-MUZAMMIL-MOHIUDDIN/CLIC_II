import React, { useState } from 'react';
import { ProblemManagement, ProblemManagementMedia, CropProblem, Crop } from '../../types';
import { problemManagementService } from '../../services/problemManagementService';
import { problemManagementMediaService } from '../../services/problemManagementMediaService';
import { cropProblemService } from '../../services/cropProblemService';
import { cropService } from '../../services/cropService';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
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
  Sprout,
  Bug,
  Image as ImageIcon,
  Flame,
  ShieldAlert,
  Sparkles,
  Layers,
  Activity,
  Calendar,
  Maximize2
} from 'lucide-react';

interface ProblemManagementCRUDProps {
  initialCropProblemId?: string;
  isEmbedded?: boolean;
}

export const ProblemManagementCRUD: React.FC<ProblemManagementCRUDProps> = ({
  initialCropProblemId = 'ALL',
  isEmbedded = false
}) => {
  const { showToast } = useToast();

  const [managements, setManagements] = useState<ProblemManagement[]>(() => problemManagementService.getManagements());
  const [managementMedia, setManagementMedia] = useState<ProblemManagementMedia[]>(() => problemManagementMediaService.getMedia());
  const [problems] = useState<CropProblem[]>(() => cropProblemService.getCropProblems());
  const [crops] = useState<Crop[]>(() => cropService.getCrops());

  // Filters
  const [problemFilter, setProblemFilter] = useState<string>(initialCropProblemId);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProblemManagement | null>(null);
  const [viewItem, setViewItem] = useState<ProblemManagement | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProblemManagement | null>(null);

  // Manage Media Modal
  const [mediaModalItem, setMediaModalItem] = useState<ProblemManagement | null>(null);
  const [addMediaModalOpen, setAddMediaModalOpen] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaDescription, setNewMediaDescription] = useState('');
  const [newMediaType, setNewMediaType] = useState('IMAGE');
  const [newMediaOrder, setNewMediaOrder] = useState<number>(1);
  const [mediaError, setMediaError] = useState('');

  // Form State
  const [formManagementId, setFormManagementId] = useState('');
  const [formCropProblemId, setFormCropProblemId] = useState('');
  const [formPlantGrowthStage, setFormPlantGrowthStage] = useState('Vegetative');
  const [formPestDevelopmentStage, setFormPestDevelopmentStage] = useState('Nymphs & Adults');
  const [formSeverityLevel, setFormSeverityLevel] = useState('Moderate (At ETL)');
  const [formManagementType, setFormManagementType] = useState('Cultural');
  const [formManagementDetails, setFormManagementDetails] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setManagements(problemManagementService.getManagements());
    setManagementMedia(problemManagementMediaService.getMedia());
  };

  const getProblemTitle = (cropProblemId: string) => {
    const prob = problems.find(p => String(p.CropProblemId) === String(cropProblemId));
    if (!prob) return `Problem #${cropProblemId}`;
    const crop = crops.find(c => String(c.CropId) === String(prob.CropId));
    return `${prob.ProblemName} [${crop ? crop.CropName : 'Crop'}]`;
  };

  const getMediaForManagement = (managementId: string) => {
    return managementMedia.filter(m => String(m.ManagementId) === String(managementId));
  };

  const getTypeBadgeClass = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('cultural')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (t.includes('biological')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (t.includes('chemical')) {
      return 'bg-purple-100 text-purple-900 border-purple-300';
    }
    if (t.includes('mechanical') || t.includes('physical')) {
      return 'bg-blue-100 text-blue-900 border-blue-300';
    }
    return 'bg-cream-200 text-forest-900 border-cream-300';
  };

  const filteredItems = managements.filter((item) => {
    if (problemFilter !== 'ALL' && String(item.CropProblemId) !== problemFilter) return false;
    if (typeFilter !== 'ALL' && item.ManagementType.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (severityFilter !== 'ALL' && !item.SeverityLevel.toLowerCase().includes(severityFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const probTitle = getProblemTitle(item.CropProblemId).toLowerCase();
      return (
        item.ManagementDetails.toLowerCase().includes(q) ||
        item.PlantGrowthStage.toLowerCase().includes(q) ||
        item.PestDevelopmentStage.toLowerCase().includes(q) ||
        item.SeverityLevel.toLowerCase().includes(q) ||
        item.ManagementType.toLowerCase().includes(q) ||
        probTitle.includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextId = String(
      managements.length > 0 ? Math.max(...managements.map(m => Number(m.ManagementId) || 0)) + 1 : 1
    );
    setFormManagementId(nextId);
    setFormCropProblemId(problemFilter !== 'ALL' ? problemFilter : (problems[0]?.CropProblemId || '1'));
    setFormPlantGrowthStage('Vegetative');
    setFormPestDevelopmentStage('Nymphs & Adults');
    setFormSeverityLevel('Moderate (At ETL)');
    setFormManagementType('Cultural');
    setFormManagementDetails('');
    setFormIsActive(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ProblemManagement) => {
    setEditingItem(item);
    setFormManagementId(item.ManagementId);
    setFormCropProblemId(item.CropProblemId);
    setFormPlantGrowthStage(item.PlantGrowthStage);
    setFormPestDevelopmentStage(item.PestDevelopmentStage);
    setFormSeverityLevel(item.SeverityLevel);
    setFormManagementType(item.ManagementType);
    setFormManagementDetails(item.ManagementDetails);
    setFormIsActive(item.IsActive);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formCropProblemId) {
      setFormError('Please select a target Crop Problem.');
      return;
    }
    if (!formManagementDetails.trim()) {
      setFormError('Management advisory details are required.');
      return;
    }

    if (editingItem) {
      try {
        problemManagementService.updateManagement(editingItem.ManagementId, {
          CropProblemId: formCropProblemId,
          PlantGrowthStage: formPlantGrowthStage.trim(),
          PestDevelopmentStage: formPestDevelopmentStage.trim(),
          SeverityLevel: formSeverityLevel.trim(),
          ManagementType: formManagementType.trim(),
          ManagementDetails: formManagementDetails.trim(),
          IsActive: formIsActive
        });
        showToast('Advisory Updated', 'Problem management practice updated successfully.', 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update management record.');
      }
    } else {
      try {
        problemManagementService.createManagement({
          ManagementId: formManagementId.trim(),
          CropProblemId: formCropProblemId,
          PlantGrowthStage: formPlantGrowthStage.trim(),
          PestDevelopmentStage: formPestDevelopmentStage.trim(),
          SeverityLevel: formSeverityLevel.trim(),
          ManagementType: formManagementType.trim(),
          ManagementDetails: formManagementDetails.trim(),
          IsActive: formIsActive
        });
        showToast('Advisory Created', 'New IPM management practice added successfully.', 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create management record.');
      }
    }
  };

  const handleToggleActive = (item: ProblemManagement) => {
    problemManagementService.toggleActive(item.ManagementId);
    showToast(
      item.IsActive ? 'Advisory Deactivated' : 'Advisory Activated',
      `Management #${item.ManagementId} marked as ${item.IsActive ? 'Inactive' : 'Active'}.`,
      'info'
    );
    refreshList();
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    problemManagementService.deleteManagement(itemToDelete.ManagementId);
    showToast('Deleted', `Management #${itemToDelete.ManagementId} deleted.`, 'info');
    setItemToDelete(null);
    setDeleteConfirmOpen(false);
    refreshList();
  };

  // Management Media Handlers
  const handleOpenAttachMedia = (item: ProblemManagement) => {
    setMediaModalItem(item);
    setNewMediaUrl('');
    setNewMediaDescription('');
    setNewMediaType('IMAGE');
    const existing = getMediaForManagement(item.ManagementId);
    setNewMediaOrder(existing.length + 1);
    setMediaError('');
    setAddMediaModalOpen(true);
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaModalItem) return;
    if (!newMediaUrl.trim()) {
      setMediaError('Media URL is required.');
      return;
    }
    if (!newMediaDescription.trim()) {
      setMediaError('Description / Caption is required.');
      return;
    }

    try {
      problemManagementMediaService.createMedia({
        ManagementId: mediaModalItem.ManagementId,
        MediaType: newMediaType,
        MediaUrl: newMediaUrl.trim(),
        MediaDescription: newMediaDescription.trim(),
        DisplayOrder: Number(newMediaOrder) || 1,
        IsActive: true
      });
      showToast('Media Attached', 'Added visual practice evidence.', 'success');
      refreshList();
      setAddMediaModalOpen(false);
    } catch (err: any) {
      setMediaError(err.message || 'Failed to save media.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Component Header Banner */}
      {!isEmbedded && (
        <div className="p-4 bg-white rounded-2xl border border-brand-border shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-forest-700 text-white shadow-subtle">
                <ShieldCheck className="w-5 h-5 text-harvest" />
              </span>
              <div>
                <h2 className="text-sm font-heading font-extrabold text-forest-900 tracking-tight flex items-center gap-2">
                  <span>Problem Management & Advisory (IPM Master)</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                    Schema
                  </span>
                </h2>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  ICAR / CIBRC approved recommendations: Cultural, Biological, Chemical, & Mechanical controls linked to <code className="bg-cream-200 px-1 py-0.2 rounded font-mono text-forest-800">CropProblemId FK</code> & <code className="bg-cream-200 px-1 py-0.2 rounded font-mono text-forest-800">ManagementMediaId</code>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-subtle transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Management Advisory</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-3.5 bg-cream-50/70 rounded-2xl border border-brand-border flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Target Problem Filter */}
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
              <option value="ALL">All Control Types</option>
              <option value="Cultural">Cultural</option>
              <option value="Biological">Biological</option>
              <option value="Chemical">Chemical</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 text-forest-900 font-medium"
            >
              <option value="ALL">All Severity Levels</option>
              <option value="Low">Low / Preventive</option>
              <option value="Moderate">Moderate (At ETL)</option>
              <option value="Severe">Severe (Above ETL)</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search advisory dosage, stage, chemicals..."
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

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-16">ID</th>
                <th className="py-3 px-4 w-44">Target Problem</th>
                <th className="py-3 px-4 w-28">Type</th>
                <th className="py-3 px-4 w-36">Plant & Pest Stage</th>
                <th className="py-3 px-4 w-32">Severity</th>
                <th className="py-3 px-4">Management Details / Dosage</th>
                <th className="py-3 px-4 w-28 text-center">Practice Media</th>
                <th className="py-3 px-4 w-20 text-center">Status</th>
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-brand-muted">
                    <ShieldCheck className="w-8 h-8 text-cream-300 mx-auto mb-2" />
                    No management advisory records match your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const media = getMediaForManagement(item.ManagementId);
                  return (
                    <tr key={item.ManagementId} className="hover:bg-forest-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-forest-700">
                        #{item.ManagementId}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-forest-950 block truncate max-w-[170px]">
                          {getProblemTitle(item.CropProblemId)}
                        </span>
                        <span className="text-[10px] text-brand-muted font-mono">
                          CropProblemId: #{item.CropProblemId}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block border px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${getTypeBadgeClass(item.ManagementType)}`}>
                          {item.ManagementType}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-forest-900">{item.PlantGrowthStage}</div>
                        <div className="text-[10.5px] text-brand-muted truncate max-w-[130px]">{item.PestDevelopmentStage}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10.5px] font-semibold text-forest-800 bg-cream-200 px-2 py-0.5 rounded-md">
                          {item.SeverityLevel}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-forest-900 font-medium leading-relaxed">
                        <p className="line-clamp-2 max-w-md">{item.ManagementDetails}</p>
                      </td>

                      {/* ProblemManagementMedia FK Column */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenAttachMedia(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cream-100 hover:bg-forest-100 text-forest-800 border border-brand-border text-[11px] font-semibold transition-all group"
                          title="View or attach visual practice media"
                        >
                          <ImageIcon className="w-3 h-3 text-forest-600 group-hover:text-forest-800" />
                          <span>{media.length} Visual{media.length === 1 ? '' : 's'}</span>
                        </button>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.IsActive ? 'bg-green-100 text-green-800' : 'bg-cream-200 text-brand-muted'
                          }`}
                        >
                          {item.IsActive ? <CheckCircle2 className="w-3 h-3 text-green-700" /> : <XCircle className="w-3 h-3 text-brand-muted" />}
                          {item.IsActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewItem(item)}
                            className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100"
                            title="View Details"
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit ProblemManagement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-cream-50 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-forest-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                {editingItem ? 'Edit Management Advisory Record' : 'Add New IPM Advisory Record'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-brand-muted hover:text-forest-900 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    ManagementId (PK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formManagementId}
                    onChange={(e) => setFormManagementId(e.target.value)}
                    disabled={!!editingItem}
                    placeholder="e.g. 13"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 disabled:bg-cream-100 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Status
                  </label>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-forest-700 focus:ring-forest-500 border-brand-border"
                    />
                    <span className="font-semibold text-forest-900">Active Advisory</span>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Management Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formManagementType}
                    onChange={(e) => setFormManagementType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 font-medium"
                    required
                  >
                    <option value="Cultural">Cultural (Alleyways, Drainage, Rotation)</option>
                    <option value="Biological">Biological (Parasitoids, Bio-Agents, Neem)</option>
                    <option value="Chemical">Chemical (ICAR Approved Insecticides / Fungicides)</option>
                    <option value="Mechanical">Mechanical (Traps, Whorl Application, Handpicking)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Severity Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formSeverityLevel}
                    onChange={(e) => setFormSeverityLevel(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 font-medium"
                    required
                  >
                    <option value="Low (Below ETL)">Low (Below ETL / Preventive)</option>
                    <option value="Moderate (At ETL)">Moderate (At ETL Threshold)</option>
                    <option value="Severe (Above ETL)">Severe (Above ETL Resurgence)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Plant Growth Stage
                  </label>
                  <input
                    type="text"
                    value={formPlantGrowthStage}
                    onChange={(e) => setFormPlantGrowthStage(e.target.value)}
                    placeholder="e.g. Tillering, Vegetative, Flowering"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Pest Development Stage
                  </label>
                  <input
                    type="text"
                    value={formPestDevelopmentStage}
                    onChange={(e) => setFormPestDevelopmentStage(e.target.value)}
                    placeholder="e.g. Nymphs & Adults, 1st Instar Larvae"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Management Details / Dosage & Application Advisory <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formManagementDetails}
                  onChange={(e) => setFormManagementDetails(e.target.value)}
                  placeholder="Chemical active ingredient, dosage per acre, application instructions, PPE safety precautions..."
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 leading-relaxed"
                  required
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
                  {editingItem ? 'Update Advisory' : 'Create Advisory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details & Practice Media Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-forest-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-harvest" />
                  <span>{viewItem.ManagementType} Management Advisory</span>
                </h3>
                <p className="text-[11px] text-cream-200/80 truncate max-w-xs mt-0.5">
                  Target: {getProblemTitle(viewItem.CropProblemId)}
                </p>
              </div>
              <button
                onClick={() => setViewItem(null)}
                className="p-1 rounded-lg text-cream-200 hover:text-white hover:bg-forest-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-brand-border">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-muted block mb-0.5">Plant Growth Stage</span>
                  <span className="font-bold text-forest-950">{viewItem.PlantGrowthStage}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-muted block mb-0.5">Pest Development Stage</span>
                  <span className="font-bold text-forest-950">{viewItem.PestDevelopmentStage}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-brand-muted block mb-1">Advisory & Application Technique</span>
                <p className="text-forest-950 leading-relaxed bg-cream-50 p-3 rounded-xl border border-brand-border font-medium">
                  {viewItem.ManagementDetails}
                </p>
              </div>

              {/* ProblemManagementMedia Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-forest-800 tracking-wider flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-forest-600" />
                    <span>Practice Media & Field Evidence ({getMediaForManagement(viewItem.ManagementId).length})</span>
                  </span>
                  <button
                    onClick={() => handleOpenAttachMedia(viewItem)}
                    className="text-[10.5px] font-bold text-forest-700 hover:underline"
                  >
                    + Add Visual &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {getMediaForManagement(viewItem.ManagementId).map((m) => (
                    <div key={m.ManagementMediaId} className="rounded-xl overflow-hidden border border-brand-border bg-cream-100 aspect-video relative group">
                      <img src={m.MediaUrl} alt={m.MediaDescription} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                        <span className="text-[9px] font-mono font-bold text-harvest">#{m.DisplayOrder}</span>
                        <p className="text-[10px] line-clamp-1">{m.MediaDescription}</p>
                      </div>
                    </div>
                  ))}
                  {getMediaForManagement(viewItem.ManagementId).length === 0 && (
                    <div className="col-span-2 py-3 text-center text-brand-muted bg-cream-50 rounded-xl border border-brand-border">
                      No management practice media attached yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewItem(null)}
                  className="px-4 py-1.5 rounded-xl bg-forest-800 text-white font-bold hover:bg-forest-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attach ProblemManagementMedia Modal */}
      {addMediaModalOpen && mediaModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-forest-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-harvest" />
                  <span>Attach Practice Media</span>
                </h3>
                <p className="text-[11px] text-cream-200/80 truncate max-w-xs mt-0.5">
                  To: Management #{mediaModalItem.ManagementId} ({mediaModalItem.ManagementType})
                </p>
              </div>
              <button
                onClick={() => setAddMediaModalOpen(false)}
                className="p-1 rounded-lg text-cream-200 hover:text-white hover:bg-forest-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="p-5 space-y-4 text-xs">
              {mediaError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {mediaError}
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-forest-700 uppercase block">Live Preview</span>
                    <span className="text-[10.5px] text-brand-muted truncate block">{newMediaUrl}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Description / Practice Instruction <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={newMediaDescription}
                  onChange={(e) => setNewMediaDescription(e.target.value)}
                  placeholder="e.g. Demonstration of alleyway formation or targeted base spraying..."
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMediaOrder}
                    onChange={(e) => setNewMediaOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Media Type
                  </label>
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
                  onClick={() => setAddMediaModalOpen(false)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-sm w-full p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-sm text-forest-900 mb-1">
              Delete Management Advisory?
            </h3>
            <p className="text-xs text-brand-muted mb-4 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-forest-900">Management #{itemToDelete.ManagementId}</span> ({itemToDelete.ManagementType})?
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
