import React, { useState } from 'react';
import { StateItem } from '../../types';
import { locationMasterService } from '../../services/locationMasterService';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  AlertTriangle,
  X,
  Check,
  Building2,
  Layers
} from 'lucide-react';

interface StateCRUDProps {
  onSelectState?: (stateId: string) => void;
}

export const StateCRUD: React.FC<StateCRUDProps> = ({ onSelectState }) => {
  const { showToast } = useToast();
  const [states, setStates] = useState<StateItem[]>(() => locationMasterService.getStates());
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StateItem | null>(null);
  const [stateIdInput, setStateIdInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StateItem | null>(null);

  const refreshList = () => {
    setStates(locationMasterService.getStates());
  };

  const filteredStates = states.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.Text.toLowerCase().includes(q) ||
      s.Value.toLowerCase().includes(q) ||
      String(s.StateId).toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setStateIdInput(String(states.length + 1));
    setValueInput('');
    setTextInput('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: StateItem) => {
    setEditingItem(item);
    setStateIdInput(String(item.StateId));
    setValueInput(item.Value);
    setTextInput(item.Text);
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

    if (editingItem) {
      try {
        locationMasterService.updateState(String(editingItem.StateId), {
          Value: valueInput.trim(),
          Text: textInput.trim()
        });
        showToast('State Updated', `Updated "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update state');
      }
    } else {
      const maxId = states.reduce((max, s) => {
        const n = Number(s.StateId);
        return !isNaN(n) && n > max ? n : max;
      }, 0);
      const idToUse = String(maxId + 1);
      try {
        locationMasterService.createState({
          StateId: idToUse,
          Value: valueInput.trim(),
          Text: textInput.trim()
        });
        showToast('State Created', `Added "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create state');
      }
    }
  };

  const handleOpenDelete = (item: StateItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const name = itemToDelete.Text;
    const success = locationMasterService.deleteState(String(itemToDelete.StateId));
    if (success) {
      showToast('State Deleted', `Deleted "${name}" and related children.`, 'info');
      refreshList();
    } else {
      showToast('Error', 'Failed to delete state.', 'error');
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-brand-border bg-gradient-to-r from-cream-50 via-white to-forest-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <MapPin className="w-5 h-5 text-forest-700" />
            </span>
            <div>
              <h2 className="text-lg font-heading font-extrabold text-forest-900 tracking-tight">
                State Management
              </h2>
              <p className="text-xs text-brand-muted">
                Schema: <code className="bg-cream-200 px-1.5 py-0.5 rounded text-[11px] font-mono text-forest-800">State(StateId, Value, Text)</code>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 text-white shadow-subtle transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Add State
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 bg-cream-50/50 border-b border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by state name, value, or ID..."
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

        <div className="text-xs text-brand-muted">
          Showing <strong className="text-forest-900">{filteredStates.length}</strong> of {states.length} states
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-14 text-center">#</th>
              <th className="py-3 px-4">State Name</th>
              <th className="py-3 px-4 w-36">Code / Key</th>
              <th className="py-3 px-4 w-36">Districts</th>
              <th className="py-3 px-4 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filteredStates.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-brand-muted">
                  No states found matching your search.
                </td>
              </tr>
            ) : (
              filteredStates.map((item, index) => {
                const childCount = locationMasterService.getChildCount('State', String(item.StateId));
                return (
                  <tr key={String(item.StateId)} className="hover:bg-forest-50/40 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-brand-muted text-xs">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-forest-900 text-sm">
                      {item.Text}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-forest-900">
                      <code className="bg-cream-100 px-2 py-0.5 rounded text-[11px]">
                        {item.Value}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      {onSelectState ? (
                        <button
                          onClick={() => onSelectState(String(item.StateId))}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-200 hover:bg-forest-100 text-forest-800 font-medium text-[11px] transition-colors"
                          title="View districts in this state"
                        >
                          <Building2 className="w-3.5 h-3.5 text-forest-600" />
                          <span>{childCount} districts</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cream-200 text-forest-800 font-medium text-[11px]">
                          {childCount} districts
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                          title="Edit State"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete State"
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
                <MapPin className="w-4 h-4 text-forest-700" />
                {editingItem ? 'Edit State' : 'Add New State'}
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
                  Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value.toUpperCase())}
                  placeholder="e.g. MP, PB, HR, MH"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-mono"
                  required
                />
                <p className="text-[10px] text-brand-muted mt-1">
                  State short code / value key.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g. Madhya Pradesh"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                  required
                />
                <p className="text-[10px] text-brand-muted mt-1">
                  Full official display name of the State.
                </p>
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
                  {editingItem ? 'Update State' : 'Create State'}
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
                <h4 className="font-heading font-bold text-sm text-forest-900">Delete State?</h4>
                <p className="text-[11px] text-brand-muted">Cascade deletion warning</p>
              </div>
            </div>

            <p className="text-xs text-brand-text leading-relaxed">
              Are you sure you want to delete <strong className="text-forest-900">{itemToDelete.Text}</strong>?
            </p>

            {locationMasterService.getChildCount('State', String(itemToDelete.StateId)) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                <strong>Cascade Warning:</strong> Deleting this State will also cascade delete all its{' '}
                {locationMasterService.getChildCount('State', String(itemToDelete.StateId))} Districts,
                Mandals, Panchayats, and Villages.
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
                Delete State
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
