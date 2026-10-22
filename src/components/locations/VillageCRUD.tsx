import React, { useState } from 'react';
import { VillageItem, PanchayatItem, MandalItem, DistrictItem, StateItem } from '../../types';
import { locationMasterService } from '../../services/locationMasterService';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Home,
  AlertTriangle,
  X,
  Check,
  Compass,
  Layers,
  Building2,
  MapPin
} from 'lucide-react';

interface VillageCRUDProps {
  initialPanchayatFilter?: string;
}

export const VillageCRUD: React.FC<VillageCRUDProps> = ({
  initialPanchayatFilter = 'ALL'
}) => {
  const { showToast } = useToast();
  const [villages, setVillages] = useState<VillageItem[]>(() => locationMasterService.getVillages());
  const [panchayats, setPanchayats] = useState<PanchayatItem[]>(() => locationMasterService.getPanchayats());
  const [mandals, setMandals] = useState<MandalItem[]>(() => locationMasterService.getMandals());
  const [districts] = useState<DistrictItem[]>(() => locationMasterService.getDistricts());
  const [states] = useState<StateItem[]>(() => locationMasterService.getStates());

  // 4-Tier Cascading Filters (State -> District -> Mandal -> Panchayat)
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>(() => {
    if (initialPanchayatFilter !== 'ALL') {
      const p = locationMasterService.getPanchayats().find(pan => String(pan.PanchayatId) === initialPanchayatFilter);
      if (p) {
        const m = locationMasterService.getMandals().find(man => String(man.MandalId) === String(p.MandalId));
        if (m) {
          const d = locationMasterService.getDistricts().find(dist => String(dist.DistrictId) === String(m.DistrictId));
          return d ? String(d.StateId) : 'ALL';
        }
      }
    }
    return 'ALL';
  });

  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>(() => {
    if (initialPanchayatFilter !== 'ALL') {
      const p = locationMasterService.getPanchayats().find(pan => String(pan.PanchayatId) === initialPanchayatFilter);
      if (p) {
        const m = locationMasterService.getMandals().find(man => String(man.MandalId) === String(p.MandalId));
        return m ? String(m.DistrictId) : 'ALL';
      }
    }
    return 'ALL';
  });

  const [selectedMandalFilter, setSelectedMandalFilter] = useState<string>(() => {
    if (initialPanchayatFilter !== 'ALL') {
      const p = locationMasterService.getPanchayats().find(pan => String(pan.PanchayatId) === initialPanchayatFilter);
      return p ? String(p.MandalId) : 'ALL';
    }
    return 'ALL';
  });

  const [selectedPanchayatFilter, setSelectedPanchayatFilter] = useState<string>(initialPanchayatFilter);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal (4-Tier Cascading: State -> District -> Mandal -> Panchayat)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VillageItem | null>(null);
  const [modalStateIdInput, setModalStateIdInput] = useState<string>('');
  const [modalDistrictIdInput, setModalDistrictIdInput] = useState<string>('');
  const [modalMandalIdInput, setModalMandalIdInput] = useState<string>('');
  const [panchayatIdInput, setPanchayatIdInput] = useState<string>('');
  const [valueInput, setValueInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<VillageItem | null>(null);

  const refreshList = () => {
    setVillages(locationMasterService.getVillages());
    setPanchayats(locationMasterService.getPanchayats());
    setMandals(locationMasterService.getMandals());
  };

  // Hierarchy Lookup Helper
  const getVillageHierarchyInfo = (panchayatId: string | number) => {
    const p = panchayats.find(pan => String(pan.PanchayatId) === String(panchayatId));
    if (!p) return { panName: '—', mandalName: '—', distName: '—', stateName: '—' };
    const m = mandals.find(man => String(man.MandalId) === String(p.MandalId));
    if (!m) return { panName: p.Text, mandalName: '—', distName: '—', stateName: '—' };
    const d = districts.find(dist => String(dist.DistrictId) === String(m.DistrictId));
    if (!d) return { panName: p.Text, mandalName: m.Text, distName: '—', stateName: '—' };
    const s = states.find(st => String(st.StateId) === String(d.StateId));
    return {
      panName: p.Text,
      mandalName: m.Text,
      distName: d.Text,
      stateName: s ? s.Text : '—'
    };
  };

  // Cascading Filter Dropdown Options
  const availableDistrictsForFilter = selectedStateFilter === 'ALL'
    ? districts
    : districts.filter(d => String(d.StateId) === selectedStateFilter);

  const availableMandalsForFilter = selectedDistrictFilter === 'ALL'
    ? (selectedStateFilter === 'ALL'
        ? mandals
        : mandals.filter(m => {
            const d = districts.find(dist => String(dist.DistrictId) === String(m.DistrictId));
            return d && String(d.StateId) === selectedStateFilter;
          }))
    : mandals.filter(m => String(m.DistrictId) === selectedDistrictFilter);

  const availablePanchayatsForFilter = selectedMandalFilter === 'ALL'
    ? (selectedDistrictFilter === 'ALL'
        ? (selectedStateFilter === 'ALL'
            ? panchayats
            : panchayats.filter(p => {
                const m = mandals.find(man => String(man.MandalId) === String(p.MandalId));
                if (!m) return false;
                const d = districts.find(dist => String(dist.DistrictId) === String(m.DistrictId));
                return d && String(d.StateId) === selectedStateFilter;
              }))
        : panchayats.filter(p => {
            const m = mandals.find(man => String(man.MandalId) === String(p.MandalId));
            return m && String(m.DistrictId) === selectedDistrictFilter;
          }))
    : panchayats.filter(p => String(p.MandalId) === selectedMandalFilter);

  const handleStateFilterChange = (stateId: string) => {
    setSelectedStateFilter(stateId);
    setSelectedDistrictFilter('ALL');
    setSelectedMandalFilter('ALL');
    setSelectedPanchayatFilter('ALL');
  };

  const handleDistrictFilterChange = (distId: string) => {
    setSelectedDistrictFilter(distId);
    setSelectedMandalFilter('ALL');
    setSelectedPanchayatFilter('ALL');
  };

  const handleMandalFilterChange = (mandalId: string) => {
    setSelectedMandalFilter(mandalId);
    setSelectedPanchayatFilter('ALL');
  };

  // Filtered Villages list
  const filteredVillages = villages.filter((item) => {
    if (selectedPanchayatFilter !== 'ALL') {
      if (String(item.PanchayatId) !== selectedPanchayatFilter) return false;
    } else if (selectedMandalFilter !== 'ALL') {
      const p = panchayats.find(pan => String(pan.PanchayatId) === String(item.PanchayatId));
      if (!p || String(p.MandalId) !== selectedMandalFilter) return false;
    } else if (selectedDistrictFilter !== 'ALL') {
      const p = panchayats.find(pan => String(pan.PanchayatId) === String(item.PanchayatId));
      if (!p) return false;
      const m = mandals.find(man => String(man.MandalId) === String(p.MandalId));
      if (!m || String(m.DistrictId) !== selectedDistrictFilter) return false;
    } else if (selectedStateFilter !== 'ALL') {
      const p = panchayats.find(pan => String(pan.PanchayatId) === String(item.PanchayatId));
      if (!p) return false;
      const m = mandals.find(man => String(man.MandalId) === String(p.MandalId));
      if (!m) return false;
      const d = districts.find(dist => String(dist.DistrictId) === String(m.DistrictId));
      if (!d || String(d.StateId) !== selectedStateFilter) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const { panName, mandalName, distName, stateName } = getVillageHierarchyInfo(item.PanchayatId);
      return (
        item.Text.toLowerCase().includes(q) ||
        item.Value.toLowerCase().includes(q) ||
        panName.toLowerCase().includes(q) ||
        mandalName.toLowerCase().includes(q) ||
        distName.toLowerCase().includes(q) ||
        stateName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Modal Handlers (Cascading)
  const handleOpenAdd = () => {
    setEditingItem(null);
    const initialStId = selectedStateFilter !== 'ALL'
      ? selectedStateFilter
      : (states[0] ? String(states[0].StateId) : '');
    setModalStateIdInput(initialStId);

    const distsForSt = districts.filter(d => String(d.StateId) === initialStId);
    const initialDistId = selectedDistrictFilter !== 'ALL'
      ? selectedDistrictFilter
      : (distsForSt[0] ? String(distsForSt[0].DistrictId) : (districts[0] ? String(districts[0].DistrictId) : ''));
    setModalDistrictIdInput(initialDistId);

    const mandalsForDist = mandals.filter(m => String(m.DistrictId) === initialDistId);
    const initialMandalId = selectedMandalFilter !== 'ALL'
      ? selectedMandalFilter
      : (mandalsForDist[0] ? String(mandalsForDist[0].MandalId) : (mandals[0] ? String(mandals[0].MandalId) : ''));
    setModalMandalIdInput(initialMandalId);

    const pansForMandal = panchayats.filter(p => String(p.MandalId) === initialMandalId);
    const initialPanId = selectedPanchayatFilter !== 'ALL'
      ? selectedPanchayatFilter
      : (pansForMandal[0] ? String(pansForMandal[0].PanchayatId) : (panchayats[0] ? String(panchayats[0].PanchayatId) : ''));
    setPanchayatIdInput(initialPanId);

    setValueInput('');
    setTextInput('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: VillageItem) => {
    setEditingItem(item);
    const p = panchayats.find(pan => String(pan.PanchayatId) === String(item.PanchayatId));
    const m = p ? mandals.find(man => String(man.MandalId) === String(p.MandalId)) : null;
    const d = m ? districts.find(dist => String(dist.DistrictId) === String(m.DistrictId)) : null;

    setModalStateIdInput(d ? String(d.StateId) : (states[0] ? String(states[0].StateId) : ''));
    setModalDistrictIdInput(d ? String(d.DistrictId) : (districts[0] ? String(districts[0].DistrictId) : ''));
    setModalMandalIdInput(m ? String(m.MandalId) : (mandals[0] ? String(mandals[0].MandalId) : ''));
    setPanchayatIdInput(String(item.PanchayatId));
    setValueInput(item.Value);
    setTextInput(item.Text);
    setFormError('');
    setModalOpen(true);
  };

  const handleModalStateChange = (newStId: string) => {
    setModalStateIdInput(newStId);
    const distsForSt = districts.filter(d => String(d.StateId) === newStId);
    const newDistId = distsForSt[0] ? String(distsForSt[0].DistrictId) : '';
    setModalDistrictIdInput(newDistId);

    const mandalsForDist = mandals.filter(m => String(m.DistrictId) === newDistId);
    const newMandalId = mandalsForDist[0] ? String(mandalsForDist[0].MandalId) : '';
    setModalMandalIdInput(newMandalId);

    const pansForMandal = panchayats.filter(p => String(p.MandalId) === newMandalId);
    setPanchayatIdInput(pansForMandal[0] ? String(pansForMandal[0].PanchayatId) : '');
  };

  const handleModalDistrictChange = (newDistId: string) => {
    setModalDistrictIdInput(newDistId);
    const mandalsForDist = mandals.filter(m => String(m.DistrictId) === newDistId);
    const newMandalId = mandalsForDist[0] ? String(mandalsForDist[0].MandalId) : '';
    setModalMandalIdInput(newMandalId);

    const pansForMandal = panchayats.filter(p => String(p.MandalId) === newMandalId);
    setPanchayatIdInput(pansForMandal[0] ? String(pansForMandal[0].PanchayatId) : '');
  };

  const handleModalMandalChange = (newMandalId: string) => {
    setModalMandalIdInput(newMandalId);
    const pansForMandal = panchayats.filter(p => String(p.MandalId) === newMandalId);
    setPanchayatIdInput(pansForMandal[0] ? String(pansForMandal[0].PanchayatId) : '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valueInput.trim()) {
      setFormError('Code / Value is required');
      return;
    }
    if (!textInput.trim()) {
      setFormError('Village Name is required');
      return;
    }
    if (!panchayatIdInput) {
      setFormError('Gram Panchayat is required');
      return;
    }

    if (editingItem) {
      try {
        locationMasterService.updateVillage(String(editingItem.VillageId), {
          Value: valueInput.trim(),
          Text: textInput.trim(),
          PanchayatId: panchayatIdInput
        });
        showToast('Village Updated', `Updated "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update village');
      }
    } else {
      const maxId = villages.reduce((max, v) => {
        const n = Number(v.VillageId);
        return !isNaN(n) && n > max ? n : max;
      }, 0);
      const idToUse = String(maxId + 1);
      try {
        locationMasterService.createVillage({
          VillageId: idToUse,
          Value: valueInput.trim(),
          Text: textInput.trim(),
          PanchayatId: panchayatIdInput
        });
        showToast('Village Created', `Added "${textInput.trim()}" successfully.`, 'success');
        refreshList();
        setModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to create village');
      }
    }
  };

  const handleOpenDelete = (item: VillageItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const name = itemToDelete.Text;
    const success = locationMasterService.deleteVillage(String(itemToDelete.VillageId));
    if (success) {
      showToast('Village Deleted', `Deleted "${name}".`, 'info');
      refreshList();
    } else {
      showToast('Error', 'Failed to delete village.', 'error');
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
              <Home className="w-5 h-5 text-forest-700" />
            </span>
            <div>
              <h2 className="text-lg font-heading font-extrabold text-forest-900 tracking-tight">
                Village Management
              </h2>
              <p className="text-xs text-brand-muted">
                Manage village settlements and rural habitats mapped to their parent Gram Panchayat, Mandal, District, and State.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={panchayats.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white shadow-subtle transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Add Village
        </button>
      </div>

      {/* Controls with 4-Tier Cascading Filter: State -> District -> Mandal -> Panchayat */}
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

          {/* 2. District Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-forest-900 uppercase">District:</span>
            <select
              value={selectedDistrictFilter}
              onChange={(e) => handleDistrictFilterChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">
                {selectedStateFilter === 'ALL' ? 'All Districts' : 'All in State'} ({availableDistrictsForFilter.length})
              </option>
              {availableDistrictsForFilter.map((d) => (
                <option key={String(d.DistrictId)} value={String(d.DistrictId)}>
                  {d.Text} ({d.Value})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Mandal Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-forest-900 uppercase">Mandal:</span>
            <select
              value={selectedMandalFilter}
              onChange={(e) => handleMandalFilterChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">
                {selectedDistrictFilter === 'ALL' ? 'All Mandals' : 'All in District'} ({availableMandalsForFilter.length})
              </option>
              {availableMandalsForFilter.map((m) => (
                <option key={String(m.MandalId)} value={String(m.MandalId)}>
                  {m.Text} ({m.Value})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Gram Panchayat Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-forest-900 uppercase">Panchayat:</span>
            <select
              value={selectedPanchayatFilter}
              onChange={(e) => setSelectedPanchayatFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 text-forest-900 font-medium"
            >
              <option value="ALL">
                {selectedMandalFilter === 'ALL' ? 'All Panchayats' : 'All in Mandal'} ({availablePanchayatsForFilter.length})
              </option>
              {availablePanchayatsForFilter.map((p) => (
                <option key={String(p.PanchayatId)} value={String(p.PanchayatId)}>
                  {p.Text} ({p.Value})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Search village, panchayat, dist..."
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
          Showing <strong className="text-forest-900">{filteredVillages.length}</strong> villages
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-cream-100 text-forest-800 font-semibold border-b border-brand-border uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-14 text-center">#</th>
              <th className="py-3 px-4">Village Name</th>
              <th className="py-3 px-4 w-44">Gram Panchayat</th>
              <th className="py-3 px-4 w-36">Mandal / Block</th>
              <th className="py-3 px-4 w-36">District</th>
              <th className="py-3 px-4 w-32">State</th>
              <th className="py-3 px-4 w-32">Code / Key</th>
              <th className="py-3 px-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filteredVillages.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-brand-muted">
                  No villages found matching your filters.
                </td>
              </tr>
            ) : (
              filteredVillages.map((item, index) => {
                const { panName, mandalName, distName, stateName } = getVillageHierarchyInfo(item.PanchayatId);
                return (
                  <tr key={String(item.VillageId)} className="hover:bg-forest-50/40 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-brand-muted text-xs">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-forest-950 text-sm">
                      {item.Text}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-200 text-forest-900 text-xs font-semibold border border-cream-300">
                        <Compass className="w-3 h-3 text-forest-600" />
                        <span className="truncate max-w-[140px]">{panName}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-100 text-forest-800 text-xs font-medium border border-cream-200">
                        <Layers className="w-3 h-3 text-forest-600" />
                        <span>{mandalName}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-100 text-forest-800 text-xs font-medium border border-cream-200">
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-forest-700 hover:text-forest-900 hover:bg-forest-100 transition-colors"
                          title="Edit Village"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete Village"
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

      {/* Add / Edit Modal (4-Tier Cascading: State -> District -> Mandal -> Panchayat) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-cream-50 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-forest-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-forest-700" />
                {editingItem ? 'Edit Village' : 'Add New Village'}
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
                  value={modalDistrictIdInput}
                  onChange={(e) => handleModalDistrictChange(e.target.value)}
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

              {/* 3. Mandal Selector (Cascaded by District) */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Mandal / Block <span className="text-red-500">*</span>
                </label>
                <select
                  value={modalMandalIdInput}
                  onChange={(e) => handleModalMandalChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                  required
                >
                  <option value="" disabled>Select mandal / block...</option>
                  {mandals
                    .filter(m => !modalDistrictIdInput || String(m.DistrictId) === modalDistrictIdInput)
                    .map((m) => (
                      <option key={String(m.MandalId)} value={String(m.MandalId)}>
                        {m.Text} ({m.Value})
                      </option>
                    ))}
                </select>
              </div>

              {/* 4. Gram Panchayat Selector (Cascaded by Mandal) */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Gram Panchayat <span className="text-red-500">*</span>
                </label>
                <select
                  value={panchayatIdInput}
                  onChange={(e) => setPanchayatIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-medium"
                  required
                >
                  <option value="" disabled>Select gram panchayat...</option>
                  {panchayats
                    .filter(p => !modalMandalIdInput || String(p.MandalId) === modalMandalIdInput)
                    .map((p) => (
                      <option key={String(p.PanchayatId)} value={String(p.PanchayatId)}>
                        {p.Text} ({p.Value})
                      </option>
                    ))}
                </select>
              </div>

              {/* 5. Value (Code / Key) */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Code / Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value.toUpperCase())}
                  placeholder="e.g. KAN_VIL, SEM_VIL"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 font-mono"
                  required
                />
              </div>

              {/* 6. Village Name (Text) */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Village Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g. Kanadia"
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
                  {editingItem ? 'Update Village' : 'Create Village'}
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
                <h4 className="font-heading font-bold text-sm text-forest-900">Delete Village?</h4>
                <p className="text-[11px] text-brand-muted">This action is permanent.</p>
              </div>
            </div>

            <p className="text-xs text-brand-text leading-relaxed">
              Are you sure you want to delete <strong className="text-forest-900">{itemToDelete.Text}</strong>?
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
                Delete Village
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
