import React, { useState } from 'react';
import { RefTypeItem } from '../../types';
import { dropdownMasterService } from '../../services/dropdownMasterService';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ListFilter,
  Tag,
  AlertTriangle,
  X,
  Check,
  Layers,
  ArrowRight
} from 'lucide-react';

interface RefTypesManagerProps {
  onSelectRefTypeForFilter?: (refId: string) => void;
}

export const RefTypesManager: React.FC<RefTypesManagerProps> = ({ onSelectRefTypeForFilter }) => {
  const { showToast } = useToast();
  const [refTypes, setRefTypes] = useState<RefTypeItem[]>(() => dropdownMasterService.getRefTypes());
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RefTypeItem | null>(null);
  const [refIdInput, setRefIdInput] = useState('');
  const [refNameInput, setRefNameInput] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RefTypeItem | null>(null);

  const refreshList = () => {
    setRefTypes(dropdownMasterService.getRefTypes());
  };

  const filteredItems = refTypes.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.RefName.toLowerCase().includes(q) ||
      String(item.RefId).toLowerCase().includes(q)
    );
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    // Suggest next numeric ID
    const nextId = String(refTypes.length + 1);
    setRefIdInput(nextId);
    setRefNameInput('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: RefTypeItem) => {
    setEditingItem(item);
    setRefIdInput(String(item.RefId));
    setRefNameInput(item.RefName);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNameInput.trim()) {
      setFormError('RefName is required');
      return;
    }

    if (editingItem) {
      try {
        dropdownMasterService.updateRefType(String(editingItem.RefId), {
          RefName: refNameInput.trim()
        });
        showToast('Ref Type Updated', `Updated "${refNameInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update reference type');
      }
    } else {
      const idToUse = refIdInput.trim() || String(Date.now());
      // Check for duplicate ID
      if (refTypes.some(r => String(r.RefId) === idToUse)) {
        setFormError(`A reference type with RefId "${idToUse}" already exists.`);
        return;
      }
      try {
        dropdownMasterService.createRefType({
          RefId: idToUse,
          RefName: refNameInput.trim()
        });
        showToast('Ref Type Created', `Added "${refNameInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create reference type');
      }
    }
  };

  const handleOpenDelete = (item: RefTypeItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const name = itemToDelete.RefName;
    const success = dropdownMasterService.deleteRefType(String(itemToDelete.RefId));
    if (success) {
      showToast('Ref Type Deleted', `Deleted "${name}" and its associated dropdown items.`, 'info');
      refreshList();
    } else {
      showToast('Error', 'Could not delete reference type.', 'error');
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
      {/* Component Header */}
      <div className="p-5 border-b border-brand-border bg-gradient-to-r from-cream-50 via-white to-forest-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <Tag className="w-5 h-5 text-forest-700" />
            </span>
            <div>
              <h2 className="text-lg font-heading font-extrabold text-forest-900 tracking-tight">
                Reference Types (RefTypes)
              </h2>
              <p className="text-xs text-brand-muted">
                Schema: <code className="bg-cream-200 px-1.5 py-0.5 rounded text-[11px] font-mono text-forest-800">RefTypes(RefId, RefName)</code>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 text-white shadow-subtle transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            Add Ref Type
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Counts */}
      <div className="p-4 bg-cream-50/50 border-b border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by RefName or RefId..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 transition-all text-forest-900 placeholder:text-brand-muted/70"
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

        <div className="flex items-center gap-2 text-xs text-brand-muted">
          <span>Showing <strong className="text-forest-900">{filteredItems.length}</strong> of {refTypes.length} types</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-28">RefId</th>
              <th className="py-3 px-4">RefName</th>
              <th className="py-3 px-4 w-36">Dropdown Items</th>
              <th className="py-3 px-4 text-right w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-brand-muted">
                  No reference types found matching your query.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const childCount = dropdownMasterService.getDropdownCountByRefId(String(item.RefId));
                return (
                  <tr key={String(item.RefId)} className="hover:bg-forest-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-forest-700">
                      <span className="inline-block px-2 py-0.5 rounded bg-forest-100 text-forest-800 text-[11px]">
                        {item.RefId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-forest-900">
                      {item.RefName}
                    </td>
                    <td className="py-3 px-4">
                      {onSelectRefTypeForFilter ? (
                        <button
                          onClick={() => onSelectRefTypeForFilter(String(item.RefId))}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-200 hover:bg-forest-100 text-forest-800 font-medium text-[11px] transition-colors group"
                          title="View dropdown items for this type"
                        >
                          <Layers className="w-3.5 h-3.5 text-forest-600" />
                          <span>{childCount} options</span>
                          <ArrowRight className="w-3 h-3 text-forest-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cream-200 text-forest-800 font-medium text-[11px]">
                          {childCount} items
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                          title="Edit Ref Type"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete Ref Type"
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
                <Tag className="w-4 h-4 text-forest-700" />
                {editingItem ? 'Edit Reference Type' : 'Add New Reference Type'}
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
                  RefId <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={refIdInput}
                  onChange={(e) => setRefIdInput(e.target.value)}
                  disabled={!!editingItem}
                  placeholder="e.g. 7 or REF-07"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 disabled:bg-cream-100 disabled:text-brand-muted font-mono"
                  required
                />
                <p className="text-[10px] text-brand-muted mt-1">
                  {editingItem ? 'Primary key cannot be modified.' : 'Unique identifier for the reference category.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  RefName <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={refNameInput}
                  onChange={(e) => setRefNameInput(e.target.value)}
                  placeholder="e.g. Fertilizer Grade"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                  required
                  autoFocus
                />
                <p className="text-[10px] text-brand-muted mt-1">
                  Human-readable label for this dropdown category.
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
                  {editingItem ? 'Update Ref Type' : 'Create Ref Type'}
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
                <h4 className="font-heading font-bold text-sm text-forest-900">Delete Ref Type?</h4>
                <p className="text-[11px] text-brand-muted">This action is permanent.</p>
              </div>
            </div>

            <p className="text-xs text-brand-text leading-relaxed">
              Are you sure you want to delete <strong className="text-forest-900">{itemToDelete.RefName}</strong> (RefId: {itemToDelete.RefId})?
            </p>

            {dropdownMasterService.getDropdownCountByRefId(String(itemToDelete.RefId)) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                <strong>Warning:</strong> This category has{' '}
                {dropdownMasterService.getDropdownCountByRefId(String(itemToDelete.RefId))} dropdown options.
                Deleting will remove all of them.
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
                Delete Ref Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
