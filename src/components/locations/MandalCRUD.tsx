import React, { useState } from 'react';
import { MandalItem, DistrictItem, StateItem } from '../../types';
import { locationMasterService } from '../../services/locationMasterService';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  AlertTriangle,
  X,
  Check,
  Filter,
  Building2,
  Compass
} from 'lucide-react';

interface MandalCRUDProps {
  initialDistrictFilter?: string;
  onSelectMandal?: (mandalId: string) => void;
}

export const MandalCRUD: React.FC<MandalCRUDProps> = ({
  initialDistrictFilter = 'ALL',
  onSelectMandal
}) => {
  const { showToast } = useToast();
  const [mandals, setMandals] = useState<MandalItem[]>(() => locationMasterService.getMandals());
  const [districts, setDistricts] = useState<DistrictItem[]>(() => locationMasterService.getDistricts());
  const [states] = useState<StateItem[]>(() => locationMasterService.getStates());
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>(initialDistrictFilter);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MandalItem | null>(null);
  const [mandalIdInput, setMandalIdInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [districtIdInput, setDistrictIdInput] = useState('');
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MandalItem | null>(null);

  const refreshList = () => {
    setMandals(locationMasterService.getMandals());
    setDistricts(locationMasterService.getDistricts());
  };

  const filteredMandals = mandals.filter((item) => {
    if (selectedDistrictFilter !== 'ALL' && String(item.DistrictId) !== selectedDistrictFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const parentDist = districts.find(d => String(d.DistrictId) === String(item.DistrictId));
      return (
        item.Text.toLowerCase().includes(q) ||
        item.Value.toLowerCase().includes(q) ||
        String(item.MandalId).toLowerCase().includes(q) ||
        (parentDist && parentDist.Text.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setMandalIdInput(String(mandals.length + 1));
    setValueInput('');
    setTextInput('');
    if (selectedDistrictFilter !== 'ALL') {
      setDistrictIdInput(selectedDistrictFilter);
    } else if (districts.length > 0) {
      setDistrictIdInput(String(districts[0].DistrictId));
    } else {
      setDistrictIdInput('');
    }
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: MandalItem) => {
    setEditingItem(item);
    setMandalIdInput(String(item.MandalId));
    setValueInput(item.Value);
    setTextInput(item.Text);
    setDistrictIdInput(String(item.DistrictId));
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
    if (!districtIdInput) {
      setFormError('District (DistrictId) is required');
      return;
    }

    if (editingItem) {
      try {
        locationMasterService.updateMandal(String(editingItem.MandalId), {
          Value: valueInput.trim(),
          Text: textInput.trim(),
          DistrictId: districtIdInput
        });
        showToast('Mandal Updated', `Updated "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update mandal');
      }
    } else {
      const idToUse = mandalIdInput.trim() || String(Date.now());
      if (mandals.some(m => String(m.MandalId) === idToUse)) {
        setFormError(`A Mandal with MandalId "${idToUse}" already exists.`);
        return;
      }
      try {
        locationMasterService.createMandal({
          MandalId: idToUse,
          Value: valueInput.trim(),
          Text: textInput.trim(),
          DistrictId: districtIdInput
        });
        showToast('Mandal Created', `Added "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create mandal');
      }
    }
  };

  const handleOpenDelete = (item: MandalItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const name = itemToDelete.Text;
    const success = locationMasterService.deleteMandal(String(itemToDelete.MandalId));
    if (success) {
      showToast('Mandal Deleted', `Deleted "${name}" and related sub-regions.`, 'info');
      refreshList();
    } else {
      showToast('Error', 'Failed to delete mandal.', 'error');
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const getDistrictInfo = (districtId: string | number) => {
    const d = districts.find(dist => String(dist.DistrictId) === String(districtId));
    if (!d) return { distName: `District #${districtId}`, stateName: '' };
    const s = states.find(st => String(st.StateId) === String(d.StateId));
    return {
      distName: d.Text,
      stateName: s ? s.Text : ''
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-brand-border bg-gradient-to-r from-cream-50 via-white to-forest-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <Layers className="w-5 h-5 text-forest-700" />
            </span>
            <div>
              <h2 className="text-lg font-heading font-extrabold text-forest-900 tracking-tight">
                Mandal / Block Management
              </h2>
              <p className="text-xs text-brand-muted">
                Schema: <code className="bg-cream-200 px-1.5 py-0.5 rounded text-[11px] font-mono text-forest-800">Mandal(MandalId, Value, Text, DistrictId)</code>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={districts.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white shadow-subtle transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Add Mandal
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 bg-cream-50/50 border-b border-brand-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* District Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-brand-muted shrink-0" />
            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">All Districts ({mandals.length} total)</option>
              {districts.map((d) => (
                <option key={String(d.DistrictId)} value={String(d.DistrictId)}>
                  {d.Text} ({d.Value})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Search by mandal name, value, or district..."
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
          Showing <strong className="text-forest-900">{filteredMandals.length}</strong> mandals
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-28">MandalId</th>
              <th className="py-3 px-4 w-48">District (DistrictId)</th>
              <th className="py-3 px-4 w-36">Value</th>
              <th className="py-3 px-4">Text (Mandal Name)</th>
              <th className="py-3 px-4 w-36">Panchayats</th>
              <th className="py-3 px-4 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filteredMandals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-brand-muted">
                  No mandals found matching your filters.
                </td>
              </tr>
            ) : (
              filteredMandals.map((item) => {
                const childCount = locationMasterService.getChildCount('Mandal', String(item.MandalId));
                const { distName, stateName } = getDistrictInfo(item.DistrictId);
                return (
                  <tr key={String(item.MandalId)} className="hover:bg-forest-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-forest-700">
                      <span className="inline-block px-2 py-0.5 rounded bg-forest-100 text-forest-800 text-[11px]">
                        {item.MandalId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cream-200 text-forest-900 text-[11px] font-medium border border-cream-300">
                        <Building2 className="w-3 h-3 text-forest-600" />
                        <span className="truncate max-w-[130px]">{distName}</span>
                        {stateName && <span className="text-[10px] text-brand-muted">({stateName})</span>}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-forest-800">
                      <code className="bg-cream-100 px-1.5 py-0.5 rounded text-[11px]">
                        {item.Value}
                      </code>
                    </td>
                    <td className="py-3 px-4 font-bold text-forest-950 text-sm">
                      {item.Text}
                    </td>
                    <td className="py-3 px-4">
                      {onSelectMandal ? (
                        <button
                          onClick={() => onSelectMandal(String(item.MandalId))}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-200 hover:bg-forest-100 text-forest-800 font-medium text-[11px] transition-colors"
                          title="View Panchayats in this Mandal"
                        >
                          <Compass className="w-3.5 h-3.5 text-forest-600" />
                          <span>{childCount} panchayats</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cream-200 text-forest-800 font-medium text-[11px]">
                          {childCount} panchayats
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                          title="Edit Mandal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete Mandal"
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
                <Layers className="w-4 h-4 text-forest-700" />
                {editingItem ? 'Edit Mandal' : 'Add New Mandal'}
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
                  MandalId <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mandalIdInput}
                  onChange={(e) => setMandalIdInput(e.target.value)}
                  disabled={!!editingItem}
                  placeholder="e.g. 15 or MAN-15"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 disabled:bg-cream-100 disabled:text-brand-muted font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  District (DistrictId) <span className="text-red-500">*</span>
                </label>
                <select
                  value={districtIdInput}
                  onChange={(e) => setDistrictIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                  required
                >
                  <option value="" disabled>Select parent district...</option>
                  {districts.map((d) => (
                    <option key={String(d.DistrictId)} value={String(d.DistrictId)}>
                      {d.Text} (DistrictId: {d.DistrictId})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-brand-muted mt-1">
                  Foreign key reference to District(DistrictId).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SAN, DEP, MHW"
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
                  placeholder="e.g. Sanwer"
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
                  {editingItem ? 'Update Mandal' : 'Create Mandal'}
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
                <h4 className="font-heading font-bold text-sm text-forest-900">Delete Mandal?</h4>
                <p className="text-[11px] text-brand-muted">Cascade deletion warning</p>
              </div>
            </div>

            <p className="text-xs text-brand-text leading-relaxed">
              Are you sure you want to delete <strong className="text-forest-900">{itemToDelete.Text}</strong> (MandalId: {itemToDelete.MandalId})?
            </p>

            {locationMasterService.getChildCount('Mandal', String(itemToDelete.MandalId)) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                <strong>Cascade Warning:</strong> Deleting this Mandal will also delete all its{' '}
                {locationMasterService.getChildCount('Mandal', String(itemToDelete.MandalId))} Panchayats
                and their Villages.
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
                Delete Mandal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
