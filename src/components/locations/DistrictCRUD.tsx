import React, { useState } from 'react';
import { DistrictItem, StateItem } from '../../types';
import { locationMasterService } from '../../services/locationMasterService';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  AlertTriangle,
  X,
  Check,
  Filter,
  MapPin,
  Layers
} from 'lucide-react';

interface DistrictCRUDProps {
  initialStateFilter?: string;
  onSelectDistrict?: (districtId: string) => void;
}

export const DistrictCRUD: React.FC<DistrictCRUDProps> = ({
  initialStateFilter = 'ALL',
  onSelectDistrict
}) => {
  const { showToast } = useToast();
  const [districts, setDistricts] = useState<DistrictItem[]>(() => locationMasterService.getDistricts());
  const [states, setStates] = useState<StateItem[]>(() => locationMasterService.getStates());
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>(initialStateFilter);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DistrictItem | null>(null);
  const [districtIdInput, setDistrictIdInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [stateIdInput, setStateIdInput] = useState('');
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DistrictItem | null>(null);

  const refreshList = () => {
    setDistricts(locationMasterService.getDistricts());
    setStates(locationMasterService.getStates());
  };

  const filteredDistricts = districts.filter((item) => {
    if (selectedStateFilter !== 'ALL' && String(item.StateId) !== selectedStateFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const parentState = states.find(s => String(s.StateId) === String(item.StateId));
      return (
        item.Text.toLowerCase().includes(q) ||
        item.Value.toLowerCase().includes(q) ||
        String(item.DistrictId).toLowerCase().includes(q) ||
        (parentState && parentState.Text.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDistrictIdInput(String(districts.length + 1));
    setValueInput('');
    setTextInput('');
    if (selectedStateFilter !== 'ALL') {
      setStateIdInput(selectedStateFilter);
    } else if (states.length > 0) {
      setStateIdInput(String(states[0].StateId));
    } else {
      setStateIdInput('');
    }
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: DistrictItem) => {
    setEditingItem(item);
    setDistrictIdInput(String(item.DistrictId));
    setValueInput(item.Value);
    setTextInput(item.Text);
    setStateIdInput(String(item.StateId));
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valueInput.trim()) {
      setFormError('Value is required');
      return;
    }
    if (!textInput.trim()) {
      setFormError('Text is required');
      return;
    }
    if (!stateIdInput) {
      setFormError('State (StateId) is required');
      return;
    }

    if (editingItem) {
      try {
        locationMasterService.updateDistrict(String(editingItem.DistrictId), {
          Value: valueInput.trim(),
          Text: textInput.trim(),
          StateId: stateIdInput
        });
        showToast('District Updated', `Updated "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update district');
      }
    } else {
      const maxId = districts.reduce((max, d) => {
        const n = Number(d.DistrictId);
        return !isNaN(n) && n > max ? n : max;
      }, 0);
      const idToUse = String(maxId + 1);
      try {
        locationMasterService.createDistrict({
          DistrictId: idToUse,
          Value: valueInput.trim(),
          Text: textInput.trim(),
          StateId: stateIdInput
        });
        showToast('District Created', `Added "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create district');
      }
    }
  };

  const handleOpenDelete = (item: DistrictItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const name = itemToDelete.Text;
    const success = locationMasterService.deleteDistrict(String(itemToDelete.DistrictId));
    if (success) {
      showToast('District Deleted', `Deleted "${name}" and related sub-regions.`, 'info');
      refreshList();
    } else {
      showToast('Error', 'Failed to delete district.', 'error');
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const getStateName = (stateId: string | number) => {
    const s = states.find(st => String(st.StateId) === String(stateId));
    return s ? s.Text : `State #${stateId}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-brand-border bg-gradient-to-r from-cream-50 via-white to-forest-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <Building2 className="w-5 h-5 text-forest-700" />
            </span>
            <div>
              <h2 className="text-lg font-heading font-extrabold text-forest-900 tracking-tight">
                District Management
              </h2>
              <p className="text-xs text-brand-muted">
                Manage district administrative divisions under each state.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={states.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white shadow-subtle transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Add District
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 bg-cream-50/50 border-b border-brand-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* State Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-brand-muted shrink-0" />
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">All States ({districts.length} total)</option>
              {states.map((s) => (
                <option key={String(s.StateId)} value={String(s.StateId)}>
                  {s.Text} ({s.Value})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Search by district name, value, or code..."
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
          Showing <strong className="text-forest-900">{filteredDistricts.length}</strong> districts
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-14 text-center">#</th>
              <th className="py-3 px-4">District Name</th>
              <th className="py-3 px-4 w-48">State</th>
              <th className="py-3 px-4 w-36">Code / Key</th>
              <th className="py-3 px-4 w-36">Mandals</th>
              <th className="py-3 px-4 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filteredDistricts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-brand-muted">
                  No districts found matching your filters.
                </td>
              </tr>
            ) : (
              filteredDistricts.map((item, index) => {
                const childCount = locationMasterService.getChildCount('District', String(item.DistrictId));
                return (
                  <tr key={String(item.DistrictId)} className="hover:bg-forest-50/40 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-brand-muted text-xs">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-forest-950 text-sm">
                      {item.Text}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-200 text-forest-900 text-xs font-semibold border border-cream-300">
                        <MapPin className="w-3 h-3 text-forest-600" />
                        <span>{getStateName(item.StateId)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-forest-800">
                      <code className="bg-cream-100 px-2 py-0.5 rounded text-[11px]">
                        {item.Value}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      {onSelectDistrict ? (
                        <button
                          onClick={() => onSelectDistrict(String(item.DistrictId))}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-200 hover:bg-forest-100 text-forest-800 font-medium text-[11px] transition-colors"
                          title="View Mandals in this District"
                        >
                          <Layers className="w-3.5 h-3.5 text-forest-600" />
                          <span>{childCount} mandals</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cream-200 text-forest-800 font-medium text-[11px]">
                          {childCount} mandals
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                          title="Edit District"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete District"
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-cream-50 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-forest-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-forest-700" />
                {editingItem ? 'Edit District' : 'Add New District'}
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

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={stateIdInput}
                  onChange={(e) => setStateIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                  required
                >
                  <option value="" disabled>Select parent state...</option>
                  {states.map((s) => (
                    <option key={String(s.StateId)} value={String(s.StateId)}>
                      {s.Text} ({s.Value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value.toUpperCase())}
                  placeholder="e.g. IND, UJJ, KAR"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g. Indore"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
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
                  {editingItem ? 'Update District' : 'Create District'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-forest-900">Delete District?</h4>
                <p className="text-[11px] text-brand-muted">Cascade deletion warning</p>
              </div>
            </div>

            <p className="text-xs text-brand-text leading-relaxed">
              Are you sure you want to delete <strong className="text-forest-900">{itemToDelete.Text}</strong>?
            </p>

            {locationMasterService.getChildCount('District', String(itemToDelete.DistrictId)) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                <strong>Cascade Warning:</strong> Deleting this District will also delete all its{' '}
                {locationMasterService.getChildCount('District', String(itemToDelete.DistrictId))} Mandals,
                Panchayats, and Villages.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-brand-muted hover:text-forest-900 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-subtle"
              >
                Delete District
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
