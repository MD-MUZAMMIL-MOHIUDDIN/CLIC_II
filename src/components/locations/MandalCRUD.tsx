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
  Compass,
  MapPin
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
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>(() => {
    if (initialDistrictFilter !== 'ALL') {
      const d = districts.find(dist => String(dist.DistrictId) === initialDistrictFilter);
      return d ? String(d.StateId) : 'ALL';
    }
    return 'ALL';
  });
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>(initialDistrictFilter);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MandalItem | null>(null);
  const [modalStateIdInput, setModalStateIdInput] = useState<string>('');
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

  // Districts available for the selected state filter
  const availableDistrictsForFilter = selectedStateFilter === 'ALL'
    ? districts
    : districts.filter(d => String(d.StateId) === selectedStateFilter);

  const handleStateFilterChange = (stateId: string) => {
    setSelectedStateFilter(stateId);
    setSelectedDistrictFilter('ALL');
  };

  const filteredMandals = mandals.filter((item) => {
    if (selectedDistrictFilter !== 'ALL') {
      if (String(item.DistrictId) !== selectedDistrictFilter) return false;
    } else if (selectedStateFilter !== 'ALL') {
      const parentDist = districts.find(d => String(d.DistrictId) === String(item.DistrictId));
      if (!parentDist || String(parentDist.StateId) !== selectedStateFilter) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const { distName, stateName } = getDistrictInfo(item.DistrictId);
      return (
        item.Text.toLowerCase().includes(q) ||
        item.Value.toLowerCase().includes(q) ||
        distName.toLowerCase().includes(q) ||
        stateName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    const initialStId = selectedStateFilter !== 'ALL'
      ? selectedStateFilter
      : (states[0] ? String(states[0].StateId) : '');
    setModalStateIdInput(initialStId);
    const districtsForSt = districts.filter(d => String(d.StateId) === initialStId);
    const initialDistId = selectedDistrictFilter !== 'ALL'
      ? selectedDistrictFilter
      : (districtsForSt[0] ? String(districtsForSt[0].DistrictId) : (districts[0] ? String(districts[0].DistrictId) : ''));
    setDistrictIdInput(initialDistId);
    setValueInput('');
    setTextInput('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: MandalItem) => {
    setEditingItem(item);
    const parentDist = districts.find(d => String(d.DistrictId) === String(item.DistrictId));
    setModalStateIdInput(parentDist ? String(parentDist.StateId) : (states[0] ? String(states[0].StateId) : ''));
    setDistrictIdInput(String(item.DistrictId));
    setValueInput(item.Value);
    setTextInput(item.Text);
    setFormError('');
    setModalOpen(true);
  };

  const handleModalStateChange = (newStId: string) => {
    setModalStateIdInput(newStId);
    const districtsForSt = districts.filter(d => String(d.StateId) === newStId);
    setDistrictIdInput(districtsForSt[0] ? String(districtsForSt[0].DistrictId) : '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valueInput.trim()) {
      setFormError('Code / Value is required');
      return;
    }
    if (!textInput.trim()) {
      setFormError('Mandal Name is required');
      return;
    }
    if (!districtIdInput) {
      setFormError('District is required');
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
      const maxId = mandals.reduce((max, m) => {
        const n = Number(m.MandalId);
        return !isNaN(n) && n > max ? n : max;
      }, 0);
      const idToUse = String(maxId + 1);
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
                Manage sub-district tehsil and block administrative divisions under each State and District.
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

      {/* Controls with Cascading State -> District Filter */}
      <div className="p-4 bg-cream-50/50 border-b border-brand-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* 1. State Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-forest-900 uppercase">State:</span>
            <select
              value={selectedStateFilter}
              onChange={(e) => handleStateFilterChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">All States</option>
              {states.map((s) => (
                <option key={String(s.StateId)} value={String(s.StateId)}>
                  {s.Text} ({s.Value})
                </option>
              ))}
            </select>
          </div>

          {/* 2. District Filter (Cascaded by State) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-forest-900 uppercase">District:</span>
            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">
                {selectedStateFilter === 'ALL' ? 'All Districts' : 'All in this State'} ({availableDistrictsForFilter.length})
              </option>
              {availableDistrictsForFilter.map((d) => (
                <option key={String(d.DistrictId)} value={String(d.DistrictId)}>
                  {d.Text} ({d.Value})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Search by mandal, district, or state..."
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
              <th className="py-3 px-4 w-14 text-center">#</th>
              <th className="py-3 px-4">Mandal / Block Name</th>
              <th className="py-3 px-4 w-44">District</th>
              <th className="py-3 px-4 w-44">State</th>
              <th className="py-3 px-4 w-32">Code / Key</th>
              <th className="py-3 px-4 w-36">Panchayats</th>
              <th className="py-3 px-4 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filteredMandals.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-brand-muted">
                  No mandals found matching your filters.
                </td>
              </tr>
            ) : (
              filteredMandals.map((item, index) => {
                const childCount = locationMasterService.getChildCount('Mandal', String(item.MandalId));
                const { distName, stateName } = getDistrictInfo(item.DistrictId);
                return (
                  <tr key={String(item.MandalId)} className="hover:bg-forest-50/40 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-brand-muted text-xs">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-forest-950 text-sm">
                      {item.Text}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-200 text-forest-900 text-xs font-semibold border border-cream-300">
                        <Building2 className="w-3 h-3 text-forest-600" />
                        <span>{distName}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-medium border border-forest-200">
                        <MapPin className="w-3 h-3 text-forest-600" />
                        <span>{stateName}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-forest-800">
                      <code className="bg-cream-100 px-2 py-0.5 rounded text-[11px]">
                        {item.Value}
                      </code>
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

              {/* 1. State Selector */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={modalStateIdInput}
                  onChange={(e) => handleModalStateChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                  required
                >
                  <option value="" disabled>Select state first...</option>
                  {states.map((s) => (
                    <option key={String(s.StateId)} value={String(s.StateId)}>
                      {s.Text} ({s.Value})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. District Selector (Cascaded by State) */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={districtIdInput}
                  onChange={(e) => setDistrictIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                  required
                >
                  <option value="" disabled>Select district...</option>
                  {districts
                    .filter(d => !modalStateIdInput || String(d.StateId) === modalStateIdInput)
                    .map((d) => (
                      <option key={String(d.DistrictId)} value={String(d.DistrictId)}>
                        {d.Text} ({d.Value})
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
              Are you sure you want to delete <strong className="text-forest-900">{itemToDelete.Text}</strong>?
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
