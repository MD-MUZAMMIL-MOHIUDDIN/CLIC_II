import React, { useState } from 'react';
import { DropdownItem, RefTypeItem } from '../../types';
import { dropdownMasterService } from '../../services/dropdownMasterService';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ListFilter,
  AlertTriangle,
  X,
  Check,
  Tag,
  Filter
} from 'lucide-react';

interface DropdownsManagerProps {
  initialRefFilter?: string;
  onFilterChange?: (refId: string) => void;
}

export const DropdownsManager: React.FC<DropdownsManagerProps> = ({
  initialRefFilter = 'ALL',
  onFilterChange
}) => {
  const { showToast } = useToast();
  const [dropdowns, setDropdowns] = useState<DropdownItem[]>(() => dropdownMasterService.getDropdowns());
  const [refTypes, setRefTypes] = useState<RefTypeItem[]>(() => dropdownMasterService.getRefTypes());
  const [selectedRefFilter, setSelectedRefFilter] = useState<string>(initialRefFilter);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DropdownItem | null>(null);
  const [dropdownIdInput, setDropdownIdInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [teluguInput, setTeluguInput] = useState('');
  const [refIdInput, setRefIdInput] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DropdownItem | null>(null);

  const refreshList = () => {
    setDropdowns(dropdownMasterService.getDropdowns());
    setRefTypes(dropdownMasterService.getRefTypes());
  };

  const handleRefFilterChange = (val: string) => {
    setSelectedRefFilter(val);
    if (onFilterChange) onFilterChange(val);
  };

  const filteredItems = dropdowns.filter((item) => {
    if (selectedRefFilter !== 'ALL' && String(item.RefId) !== selectedRefFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const qNormalized = q.replace(/_/g, ' ');
      const parentRef = refTypes.find(r => String(r.RefId) === String(item.RefId));
      const refName = parentRef ? parentRef.RefName.toLowerCase() : '';
      const refNameNormalized = refName.replace(/_/g, ' ');

      return (
        item.Text.toLowerCase().includes(q) ||
        item.Value.toLowerCase().includes(q) ||
        String(item.DropdownId).toLowerCase().includes(q) ||
        (item.Category && item.Category.toLowerCase().includes(q)) ||
        (item.Telugu && item.Telugu.toLowerCase().includes(q)) ||
        refName.includes(q) ||
        refNameNormalized.includes(qNormalized)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextId = String(dropdowns.length + 1);
    setDropdownIdInput(nextId);
    setValueInput('');
    setTextInput('');
    setCategoryInput('');
    setTeluguInput('');
    // Default to currently selected filter if valid ref, else first ref
    if (selectedRefFilter !== 'ALL') {
      setRefIdInput(selectedRefFilter);
    } else if (refTypes.length > 0) {
      setRefIdInput(String(refTypes[0].RefId));
    } else {
      setRefIdInput('');
    }
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: DropdownItem) => {
    setEditingItem(item);
    setDropdownIdInput(String(item.DropdownId));
    setValueInput(item.Value);
    setTextInput(item.Text);
    setCategoryInput(item.Category || '');
    setTeluguInput(item.Telugu || '');
    setRefIdInput(String(item.RefId));
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
    if (!refIdInput) {
      setFormError('RefType (RefId) selection is required');
      return;
    }

    if (editingItem) {
      try {
        dropdownMasterService.updateDropdown(String(editingItem.DropdownId), {
          Value: valueInput.trim(),
          Text: textInput.trim(),
          RefId: refIdInput,
          Category: categoryInput.trim() || undefined,
          Telugu: teluguInput.trim() || undefined
        });
        showToast('Dropdown Updated', `Updated "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update dropdown');
      }
    } else {
      const idToUse = dropdownIdInput.trim() || String(Date.now());
      if (dropdowns.some(d => String(d.DropdownId) === idToUse)) {
        setFormError(`A dropdown with DropdownId "${idToUse}" already exists.`);
        return;
      }
      try {
        dropdownMasterService.createDropdown({
          DropdownId: idToUse,
          Value: valueInput.trim(),
          Text: textInput.trim(),
          RefId: refIdInput,
          Category: categoryInput.trim() || undefined,
          Telugu: teluguInput.trim() || undefined
        });
        showToast('Dropdown Created', `Added "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create dropdown');
      }
    }
  };

  const handleOpenDelete = (item: DropdownItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const txt = itemToDelete.Text;
    const success = dropdownMasterService.deleteDropdown(String(itemToDelete.DropdownId));
    if (success) {
      showToast('Dropdown Deleted', `Deleted "${txt}".`, 'info');
      refreshList();
    } else {
      showToast('Error', 'Could not delete dropdown item.', 'error');
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  // Helper to get Ref Name
  const getRefName = (refId: string | number) => {
    const found = refTypes.find(r => String(r.RefId) === String(refId));
    return found ? found.RefName : `RefId #${refId}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
      {/* Component Header */}
      <div className="p-5 border-b border-brand-border bg-gradient-to-r from-cream-50 via-white to-forest-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <ListFilter className="w-5 h-5 text-forest-700" />
            </span>
            <div>
              <h2 className="text-lg font-heading font-extrabold text-forest-900 tracking-tight">
                Dropdown Items (Dropdowns)
              </h2>
              <p className="text-xs text-brand-muted">
                Schema: <code className="bg-cream-200 px-1.5 py-0.5 rounded text-[11px] font-mono text-forest-800">Dropdowns(DropdownId, Value, Text, RefId)</code>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            disabled={refTypes.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white shadow-subtle transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            Add Dropdown Item
          </button>
        </div>
      </div>

      {/* Controls Bar: Filter by RefType, Search, Stats */}
      <div className="p-4 bg-cream-50/50 border-b border-brand-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* RefType Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-brand-muted shrink-0" />
            <select
              value={selectedRefFilter}
              onChange={(e) => handleRefFilterChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">All Ref Types ({dropdowns.length} total)</option>
              {refTypes.map((r) => (
                <option key={String(r.RefId)} value={String(r.RefId)}>
                  {r.RefName} (RefId: {r.RefId})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Search by text, value, or code..."
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
          Showing <strong className="text-forest-900">{filteredItems.length}</strong> items
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-28">DropdownId</th>
              <th className="py-3 px-4 w-48">Value / Code</th>
              <th className="py-3 px-4">Display Label (Text)</th>
              <th className="py-3 px-4 w-56">Reference Type (RefId)</th>
              <th className="py-3 px-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-brand-muted">
                  No dropdown items found matching your filters.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={String(item.DropdownId)} className="hover:bg-forest-50/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-forest-700">
                    <span className="inline-block px-2 py-0.5 rounded bg-forest-100 text-forest-800 text-[11px]">
                      {item.DropdownId}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-forest-800">
                    <code className="bg-cream-100 px-2 py-0.5 rounded text-[11.5px] font-bold text-forest-900 border border-brand-border/60">
                      {item.Value}
                    </code>
                  </td>
                  <td className="py-3 px-4 font-bold text-forest-950">
                    <div className="flex items-center gap-2">
                      <span>{item.Text}</span>
                      {item.Telugu && (
                        <span className="text-[11px] font-normal text-forest-700 bg-forest-50 border border-forest-200 px-1.5 py-0.2 rounded">
                          {item.Telugu}
                        </span>
                      )}
                      {item.Category && (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded uppercase">
                          {item.Category}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cream-200 text-forest-900 text-[11px] font-medium border border-cream-300">
                      <Tag className="w-3 h-3 text-forest-600" />
                      <span className="truncate max-w-[160px]">{getRefName(item.RefId)}</span>
                      <span className="text-[10px] text-brand-muted font-mono">({item.RefId})</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                        title="Edit Dropdown Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(item)}
                        className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Delete Dropdown Item"
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
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-cream-50 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-forest-900 flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-forest-700" />
                {editingItem ? 'Edit Dropdown Item' : 'Add New Dropdown Item'}
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
                  DropdownId <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={dropdownIdInput}
                  onChange={(e) => setDropdownIdInput(e.target.value)}
                  disabled={!!editingItem}
                  placeholder="e.g. 29 or DD-29"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 disabled:bg-cream-100 disabled:text-brand-muted font-mono"
                  required
                />
                <p className="text-[10px] text-brand-muted mt-1">
                  {editingItem ? 'Primary key cannot be modified.' : 'Unique identifier for this dropdown record.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Reference Type (RefId) <span className="text-red-500">*</span>
                </label>
                <select
                  value={refIdInput}
                  onChange={(e) => setRefIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                  required
                >
                  <option value="" disabled>Select parent reference category...</option>
                  {refTypes.map((r) => (
                    <option key={String(r.RefId)} value={String(r.RefId)}>
                      {r.RefName} (RefId: {r.RefId})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-brand-muted mt-1">
                  Foreign key linkage to RefTypes(RefId).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Value (Stored Code / Key) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  placeholder="e.g. CEREALS, TRACTOR, or 1"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-mono"
                  required
                />
                <p className="text-[10px] text-brand-muted mt-1">
                  Stored code / key value for programmatic queries.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Text (Display Label) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g. Cereals or Pest"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                  required
                />
                <p className="text-[10px] text-brand-muted mt-1">
                  User-facing label displayed in selects and UI.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Telugu / Regional Name (Optional)
                </label>
                <input
                  type="text"
                  value={teluguInput}
                  onChange={(e) => setTeluguInput(e.target.value)}
                  placeholder="e.g. తృణధాన్యాలు..."
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                />
                <p className="text-[10px] text-brand-muted mt-1">
                  Optional regional language script representation.
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
                  {editingItem ? 'Update Dropdown Item' : 'Create Dropdown Item'}
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
                <h4 className="font-heading font-bold text-sm text-forest-900">Delete Dropdown Item?</h4>
                <p className="text-[11px] text-brand-muted">This action is permanent.</p>
              </div>
            </div>

            <p className="text-xs text-brand-text leading-relaxed">
              Are you sure you want to delete <strong className="text-forest-900">{itemToDelete.Text}</strong> (Value: {itemToDelete.Value}, DropdownId: {itemToDelete.DropdownId})?
            </p>

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
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
