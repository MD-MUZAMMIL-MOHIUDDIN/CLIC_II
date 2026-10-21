import React, { useState } from 'react';
import { PanchayatItem, MandalItem, DistrictItem } from '../../types';
import { locationMasterService } from '../../services/locationMasterService';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Compass,
  AlertTriangle,
  X,
  Check,
  Filter,
  Layers,
  Home
} from 'lucide-react';

interface PanchayatCRUDProps {
  initialMandalFilter?: string;
  onSelectPanchayat?: (panchayatId: string) => void;
}

export const PanchayatCRUD: React.FC<PanchayatCRUDProps> = ({
  initialMandalFilter = 'ALL',
  onSelectPanchayat
}) => {
  const { showToast } = useToast();
  const [panchayats, setPanchayats] = useState<PanchayatItem[]>(() => locationMasterService.getPanchayats());
  const [mandals, setMandals] = useState<MandalItem[]>(() => locationMasterService.getMandals());
  const [districts] = useState<DistrictItem[]>(() => locationMasterService.getDistricts());
  const [selectedMandalFilter, setSelectedMandalFilter] = useState<string>(initialMandalFilter);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PanchayatItem | null>(null);
  const [panchayatIdInput, setPanchayatIdInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [mandalIdInput, setMandalIdInput] = useState('');
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PanchayatItem | null>(null);

  const refreshList = () => {
    setPanchayats(locationMasterService.getPanchayats());
    setMandals(locationMasterService.getMandals());
  };

  const filteredPanchayats = panchayats.filter((item) => {
    if (selectedMandalFilter !== 'ALL' && String(item.MandalId) !== selectedMandalFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const parentMandal = mandals.find(m => String(m.MandalId) === String(item.MandalId));
      return (
        item.Text.toLowerCase().includes(q) ||
        item.Value.toLowerCase().includes(q) ||
        String(item.PanchayatId).toLowerCase().includes(q) ||
        (parentMandal && parentMandal.Text.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setPanchayatIdInput(String(panchayats.length + 1));
    setValueInput('');
    setTextInput('');
    if (selectedMandalFilter !== 'ALL') {
      setMandalIdInput(selectedMandalFilter);
    } else if (mandals.length > 0) {
      setMandalIdInput(String(mandals[0].MandalId));
    } else {
      setMandalIdInput('');
    }
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: PanchayatItem) => {
    setEditingItem(item);
    setPanchayatIdInput(String(item.PanchayatId));
    setValueInput(item.Value);
    setTextInput(item.Text);
    setMandalIdInput(String(item.MandalId));
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
    if (!mandalIdInput) {
      setFormError('Mandal (MandalId) is required');
      return;
    }

    if (editingItem) {
      try {
        locationMasterService.updatePanchayat(String(editingItem.PanchayatId), {
          Value: valueInput.trim(),
          Text: textInput.trim(),
          MandalId: mandalIdInput
        });
        showToast('Panchayat Updated', `Updated "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update panchayat');
      }
    } else {
      const idToUse = panchayatIdInput.trim() || String(Date.now());
      if (panchayats.some(p => String(p.PanchayatId) === idToUse)) {
        setFormError(`A Panchayat with PanchayatId "${idToUse}" already exists.`);
        return;
      }
      try {
        locationMasterService.createPanchayat({
          PanchayatId: idToUse,
          Value: valueInput.trim(),
          Text: textInput.trim(),
          MandalId: mandalIdInput
        });
        showToast('Panchayat Created', `Added "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create panchayat');
      }
    }
  };

  const handleOpenDelete = (item: PanchayatItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const name = itemToDelete.Text;
    const success = locationMasterService.deletePanchayat(String(itemToDelete.PanchayatId));
    if (success) {
      showToast('Panchayat Deleted', `Deleted "${name}" and related villages.`, 'info');
      refreshList();
    } else {
      showToast('Error', 'Failed to delete panchayat.', 'error');
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const getMandalInfo = (mandalId: string | number) => {
    const m = mandals.find(man => String(man.MandalId) === String(mandalId));
    if (!m) return { mandalName: `Mandal #${mandalId}`, distName: '' };
    const d = districts.find(dist => String(dist.DistrictId) === String(m.DistrictId));
    return {
      mandalName: m.Text,
      distName: d ? d.Text : ''
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-brand-border bg-gradient-to-r from-cream-50 via-white to-forest-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <Compass className="w-5 h-5 text-forest-700" />
            </span>
            <div>
              <h2 className="text-lg font-heading font-extrabold text-forest-900 tracking-tight">
                Gram Panchayat Management
              </h2>
              <p className="text-xs text-brand-muted">
                Schema: <code className="bg-cream-200 px-1.5 py-0.5 rounded text-[11px] font-mono text-forest-800">Panchayat(PanchayatId, Value, Text, MandalId)</code>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={mandals.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white shadow-subtle transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Add Panchayat
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 bg-cream-50/50 border-b border-brand-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Mandal Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-brand-muted shrink-0" />
            <select
              value={selectedMandalFilter}
              onChange={(e) => setSelectedMandalFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">All Mandals ({panchayats.length} total)</option>
              {mandals.map((m) => (
                <option key={String(m.MandalId)} value={String(m.MandalId)}>
                  {m.Text} ({m.Value})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Search by panchayat name, value, or code..."
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
          Showing <strong className="text-forest-900">{filteredPanchayats.length}</strong> panchayats
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-28">PanchayatId</th>
              <th className="py-3 px-4 w-48">Mandal (MandalId)</th>
              <th className="py-3 px-4 w-36">Value</th>
              <th className="py-3 px-4">Text (Panchayat Name)</th>
              <th className="py-3 px-4 w-36">Villages</th>
              <th className="py-3 px-4 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filteredPanchayats.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-brand-muted">
                  No panchayats found matching your filters.
                </td>
              </tr>
            ) : (
              filteredPanchayats.map((item) => {
                const childCount = locationMasterService.getChildCount('Panchayat', String(item.PanchayatId));
                const { mandalName, distName } = getMandalInfo(item.MandalId);
                return (
                  <tr key={String(item.PanchayatId)} className="hover:bg-forest-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-forest-700">
                      <span className="inline-block px-2 py-0.5 rounded bg-forest-100 text-forest-800 text-[11px]">
                        {item.PanchayatId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cream-200 text-forest-900 text-[11px] font-medium border border-cream-300">
                        <Layers className="w-3 h-3 text-forest-600" />
                        <span className="truncate max-w-[130px]">{mandalName}</span>
                        {distName && <span className="text-[10px] text-brand-muted">({distName})</span>}
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
                      {onSelectPanchayat ? (
                        <button
                          onClick={() => onSelectPanchayat(String(item.PanchayatId))}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-200 hover:bg-forest-100 text-forest-800 font-medium text-[11px] transition-colors"
                          title="View Villages in this Panchayat"
                        >
                          <Home className="w-3.5 h-3.5 text-forest-600" />
                          <span>{childCount} villages</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cream-200 text-forest-800 font-medium text-[11px]">
                          {childCount} villages
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                          title="Edit Panchayat"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete Panchayat"
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
                <Compass className="w-4 h-4 text-forest-700" />
                {editingItem ? 'Edit Panchayat' : 'Add New Panchayat'}
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
                  PanchayatId <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={panchayatIdInput}
                  onChange={(e) => setPanchayatIdInput(e.target.value)}
                  disabled={!!editingItem}
                  placeholder="e.g. 13 or PAN-13"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 disabled:bg-cream-100 disabled:text-brand-muted font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Mandal (MandalId) <span className="text-red-500">*</span>
                </label>
                <select
                  value={mandalIdInput}
                  onChange={(e) => setMandalIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                  required
                >
                  <option value="" disabled>Select parent mandal / block...</option>
                  {mandals.map((m) => (
                    <option key={String(m.MandalId)} value={String(m.MandalId)}>
                      {m.Text} (MandalId: {m.MandalId})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-brand-muted mt-1">
                  Foreign key reference to Mandal(MandalId).
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
                  placeholder="e.g. KAN_GP, MAG_GP"
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
                  placeholder="e.g. Kanadia Gram Panchayat"
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
                  {editingItem ? 'Update Panchayat' : 'Create Panchayat'}
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
                <h4 className="font-heading font-bold text-sm text-forest-900">Delete Panchayat?</h4>
                <p className="text-[11px] text-brand-muted">Cascade deletion warning</p>
              </div>
            </div>

            <p className="text-xs text-brand-text leading-relaxed">
              Are you sure you want to delete <strong className="text-forest-900">{itemToDelete.Text}</strong> (PanchayatId: {itemToDelete.PanchayatId})?
            </p>

            {locationMasterService.getChildCount('Panchayat', String(itemToDelete.PanchayatId)) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                <strong>Cascade Warning:</strong> Deleting this Panchayat will also delete all its{' '}
                {locationMasterService.getChildCount('Panchayat', String(itemToDelete.PanchayatId))} linked Villages.
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
                Delete Panchayat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
