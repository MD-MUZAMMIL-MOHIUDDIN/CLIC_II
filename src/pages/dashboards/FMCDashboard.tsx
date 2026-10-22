import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { machineryService } from '../../services/machineryService';
import { useToast } from '../../context/ToastContext';
import fmcCentresSeed from '../../data/farm-machinery-centres.json';
import { FarmMachinery, MachineOperationType, MachineryCategory, PricingUnit } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { MachineDetailModal } from '../../components/machinery/MachineDetailModal';
import { MachineDemoVideosTable } from '../../components/machinery/MachineDemoVideosTable';
import { MachineMediaModal } from '../../components/machinery/MachineMediaModal';
import {
  Tractor,
  MapPin,
  CheckCircle,
  XCircle,
  Plus,
  Film,
  Eye,
  Image as ImageIcon
} from 'lucide-react';

export const FMCDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const centre = fmcCentresSeed.find(f => f.userId === currentUser?.id || f.id === currentUser?.linkedProfileId) || fmcCentresSeed[0];

  const [machinery, setMachinery] = useState<FarmMachinery[]>(() => {
    const list = machineryService.getAllMachinery().filter(m => m.centreId === centre.id || m.centreId.startsWith('fmc_'));
    return list.length > 0 ? list : machineryService.getAllMachinery().slice(4, 10);
  });

  // Tab: Fleet Master vs Demo Videos Separate Table
  const [activeTab, setActiveTab] = useState<'fleet' | 'videos'>('fleet');
  const [inspectMachinery, setInspectMachinery] = useState<FarmMachinery | null>(null);
  const [mediaModalMachine, setMediaModalMachine] = useState<FarmMachinery | null>(null);

  // Add Machinery Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMachId, setNewMachId] = useState('');
  const [newMachName, setNewMachName] = useState('');
  const [newOperationType, setNewOperationType] = useState<MachineOperationType>('Harvesting');
  const [newMachCategory, setNewMachCategory] = useState<MachineryCategory>('Harvesters');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [newShortDescription, setNewShortDescription] = useState('');
  const [newFullTechnicalDescription, setNewFullTechnicalDescription] = useState('');
  const [newGalleryUrls, setNewGalleryUrls] = useState('');
  const [newDemoVideoUrl, setNewDemoVideoUrl] = useState('');
  const [newIsPurchasable, setNewIsPurchasable] = useState(true);
  const [newPurchasePrice, setNewPurchasePrice] = useState('2200000');
  const [newIsRentable, setNewIsRentable] = useState(true);
  const [newMachPrice, setNewMachPrice] = useState('2400');
  const [newMachUnit, setNewMachUnit] = useState<PricingUnit>('acre');

  const toggleStatus = (id: string, current: boolean) => {
    machineryService.updateMachinery(id, { available: !current });
    const list = machineryService.getAllMachinery().filter(m => m.centreId === centre.id || m.centreId.startsWith('fmc_'));
    setMachinery(list.length > 0 ? list : machineryService.getAllMachinery().slice(4, 10));
    showToast('Fleet Status Updated', 'Machine availability has been updated.', 'success');
  };

  const handleAddMachinery = (e: React.FormEvent) => {
    e.preventDefault();
    const finalThumbnail = newThumbnailUrl.trim() || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80';
    const galleryArr = newGalleryUrls
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    if (galleryArr.length === 0) {
      galleryArr.push(finalThumbnail);
    }

    const created = machineryService.addMachinery({
      id: newMachId.trim() || undefined,
      centreId: centre.id,
      centreName: centre.centreName,
      name: newMachName.trim(),
      operationType: newOperationType,
      category: newMachCategory,
      model: '2026 Commercial Fleet Implement',
      thumbnailUrl: finalThumbnail,
      shortDescription: newShortDescription.trim() || 'Commercial grade high efficiency farm machinery implement.',
      fullTechnicalDescription: newFullTechnicalDescription.trim() || newShortDescription.trim(),
      galleryMediaUrls: galleryArr,
      demoVideoUrl: newDemoVideoUrl.trim() || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      isPurchasable: newIsPurchasable,
      isRentable: newIsRentable,
      purchasePrice: newIsPurchasable ? Number(newPurchasePrice) : undefined,
      fuelType: 'Diesel / PTO Driven',
      operatorProvided: true,
      pricePerUnit: Number(newMachPrice),
      pricingUnit: newMachUnit,
      securityDeposit: 3000,
      minimumDuration: '3 Acres',
      available: true,
      specifications: {
        "Operation Type": newOperationType,
        "Commercial Grade": "FMC Heavy Implement",
        "Dealer Warranty": "2 Years On-Site"
      },
      images: galleryArr,
      location: centre.location,
      description: newShortDescription.trim(),
      cancellationPolicy: "24 Hours prior cancellation notice required."
    });

    const list = machineryService.getAllMachinery().filter(m => m.centreId === centre.id || m.centreId.startsWith('fmc_'));
    setMachinery(list.length > 0 ? list : machineryService.getAllMachinery().slice(4, 10));
    setAddModalOpen(false);
    setNewMachId('');
    setNewMachName('');
    setNewShortDescription('');
    setNewFullTechnicalDescription('');
    setNewDemoVideoUrl('');
    setNewThumbnailUrl('');
    showToast('Machine Added to Dealership', `${created.name} (${created.operationType}) registered successfully.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-subtle shrink-0">
            <Tractor className="w-8 h-8 text-harvest" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                Farm Machinery Centre (FMC Dealer)
              </span>
              <span className="text-xs text-brand-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-forest-600" />
                {centre.location.village}, {centre.location.district} • {centre.location.state}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              {currentUser?.organizationName || centre.centreName}
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Authorized FMC Dealer: <strong>{currentUser?.fullName || centre.contactPerson}</strong> • {centre.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-border text-xs font-semibold text-brand-text hover:bg-forest-50 transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-forest-600" />
            Profile & Geolocation Settings
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Fleet Implements</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">{machinery.length} Units</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Active Work Orders</div>
          <div className="text-2xl font-heading font-extrabold text-teal-700 mt-1">8 Jobs</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Harvested Acreage</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">420 Acres</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Coverage Radius</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">60 km</div>
        </div>
      </div>

      {/* Section: Fleet Master & Separate Demo Videos Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                FMC Dealership Inventory
              </span>
              <span className="text-xs text-brand-muted">
                Operation Types: Tillage, Sowing, Plant Protection, Harvesting
              </span>
            </div>
            <h3 className="font-heading font-bold text-xl text-forest-900 mt-1">
              Dealership Machinery Inventory & Demonstration Videos
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tab Switcher */}
            <div className="inline-flex p-1 bg-cream-100 rounded-2xl border border-brand-border text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('fleet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'fleet'
                    ? 'bg-teal-900 text-white shadow-subtle'
                    : 'text-brand-muted hover:text-forest-900'
                }`}
              >
                <Tractor className="w-3.5 h-3.5 text-harvest" />
                <span>Inventory Master ({machinery.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'videos'
                    ? 'bg-teal-900 text-white shadow-subtle'
                    : 'text-brand-muted hover:text-forest-900'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-harvest" />
                <span>Media & Demo Videos</span>
              </button>
            </div>

            {activeTab === 'fleet' && (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-subtle transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4 text-harvest" />
                <span>Add Machine</span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'fleet' ? (
          /* 10-Field Machinery Table */
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-2">Machine ID</th>
                    <th className="py-3 px-2">Operation Type</th>
                    <th className="py-3 px-2">Machine Details</th>
                    <th className="py-3 px-2">Short Description</th>
                    <th className="py-3 px-2">Purchasable?</th>
                    <th className="py-3 px-2">Rentable?</th>
                    <th className="py-3 px-2">Attached Media & Demo</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {machinery.map((m) => (
                    <tr key={m.id} className="hover:bg-cream-50/50 transition-colors">
                      {/* Machine ID */}
                      <td className="py-3 px-2 font-mono font-bold text-forest-900">
                        {m.id}
                      </td>

                      {/* Operation Type */}
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.operationType === 'Tillage'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : m.operationType === 'Sowing'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : m.operationType === 'Plant Protection'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-purple-100 text-purple-900 border-purple-300'
                        }`}>
                          {m.operationType || 'Harvesting'}
                        </span>
                      </td>

                      {/* Machine Name & Thumbnail Image URL */}
                      <td className="py-3 px-2 font-bold text-forest-900">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.thumbnailUrl || (m.images && m.images[0])}
                            alt={m.name}
                            className="w-10 h-10 rounded-lg object-cover border border-brand-border shrink-0"
                          />
                          <div>
                            <span className="block truncate max-w-[160px]">{m.name}</span>
                            <span className="text-[10px] text-brand-muted font-normal block">{m.category} • {m.model}</span>
                          </div>
                        </div>
                      </td>

                      {/* Short Description */}
                      <td className="py-3 px-2 text-brand-muted max-w-[200px] truncate" title={m.shortDescription || m.description}>
                        {m.shortDescription || m.description}
                      </td>

                      {/* Purchasable? (Yes/No) */}
                      <td className="py-3 px-2">
                        {m.isPurchasable ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Yes
                            </span>
                            {m.purchasePrice && (
                              <span className="font-mono text-[10px] font-semibold text-brand-text mt-0.5">
                                {formatCurrency(m.purchasePrice)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-brand-muted bg-cream-100 px-2 py-0.5 rounded-full border border-cream-200">
                            No
                          </span>
                        )}
                      </td>

                      {/* Rentable? (Yes/No) */}
                      <td className="py-3 px-2">
                        {m.isRentable ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Yes
                            </span>
                            <span className="font-mono text-[10px] font-bold text-forest-800 mt-0.5">
                              {formatCurrency(m.pricePerUnit)}/{m.pricingUnit}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-brand-muted bg-cream-100 px-2 py-0.5 rounded-full border border-cream-200">
                            No
                          </span>
                        )}
                      </td>

                      {/* Attached Media & Demo Video (inline attach/manage popup) */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5">
                          {m.galleryMediaUrls && m.galleryMediaUrls.slice(0, 2).map((url, i) => (
                            <div
                              key={i}
                              onClick={() => setMediaModalMachine(m)}
                              className="w-7 h-7 rounded-lg overflow-hidden border border-brand-border cursor-pointer hover:ring-2 hover:ring-teal-600 shrink-0 shadow-xs group"
                              title="Click to manage media"
                            >
                              <img src={url} alt="Attached media" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setMediaModalMachine(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-teal-100 text-teal-900 border border-brand-border text-[10px] font-bold transition-all group shrink-0"
                            title="Attach or manage gallery media & demo video"
                          >
                            <ImageIcon className="w-3 h-3 text-teal-700 group-hover:text-teal-900" />
                            <span>{(m.galleryMediaUrls?.length || 0)} Media</span>
                            {m.demoVideoUrl && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Demo video attached" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {m.available ? 'In Service' : 'On Contract'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setMediaModalMachine(m)}
                            className="p-1.5 rounded-lg border border-brand-border text-teal-800 hover:bg-teal-50 font-semibold"
                            title="Attach & Manage Media"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-teal-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInspectMachinery(m)}
                            className="p-1.5 rounded-lg border border-brand-border text-teal-800 hover:bg-cream-100 font-semibold"
                            title="Inspect complete technical details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStatus(m.id, m.available)}
                            className="px-2.5 py-1 rounded-lg border border-brand-border font-semibold text-[11px] hover:bg-cream-100 transition-colors"
                          >
                            {m.available ? 'Deploy' : 'Available'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Separate Demo Videos Table */
          <div className="space-y-2">
            <div className="p-3 bg-teal-50/80 rounded-2xl border border-teal-200 text-xs text-teal-950 leading-relaxed flex items-center gap-2">
              <Film className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                <strong>Dedicated Demo Videos Repository:</strong> Manage full-motion implement video demonstrations indexed by Machine ID.
              </span>
            </div>
            <MachineDemoVideosTable />
          </div>
        )}
      </div>

      {/* Machine Details Inspection Modal */}
      {inspectMachinery && (
        <MachineDetailModal
          machinery={inspectMachinery}
          onClose={() => setInspectMachinery(null)}
          onAttachMedia={(m) => setMediaModalMachine(m)}
        />
      )}

      {/* Add Machinery Modal with all 10 fields */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-xl w-full p-6 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-harvest bg-teal-900 px-2 py-0.5 rounded">
                  FMC Inventory Registration Form
                </span>
                <h3 className="font-heading font-bold text-base text-forest-900 mt-1">
                  Add New Machine to FMC Dealership
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-brand-muted hover:text-forest-900 p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMachinery} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Machine ID */}
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Machine ID</label>
                  <input
                    type="text"
                    value={newMachId}
                    onChange={(e) => setNewMachId(e.target.value)}
                    placeholder="Auto-generated if blank (e.g. mach_112)"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* 2. Operation Type */}
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Operation Type *</label>
                  <select
                    value={newOperationType}
                    onChange={(e) => setNewOperationType(e.target.value as MachineOperationType)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Tillage">Tillage</option>
                    <option value="Sowing">Sowing</option>
                    <option value="Plant Protection">Plant Protection</option>
                    <option value="Harvesting">Harvesting</option>
                  </select>
                </div>
              </div>

              {/* 3. Machine Name */}
              <div>
                <label className="block font-semibold text-brand-text mb-1">Machine Name *</label>
                <input
                  type="text"
                  required
                  value={newMachName}
                  onChange={(e) => setNewMachName(e.target.value)}
                  placeholder="e.g. Preet 987 Super Combine Harvester"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-brand-text mb-1">Category</label>
                <select
                  value={newMachCategory}
                  onChange={(e) => setNewMachCategory(e.target.value as MachineryCategory)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Harvesters">Harvesters</option>
                  <option value="Tractors">Tractors</option>
                  <option value="Rotavators">Rotavators</option>
                  <option value="Seed Drills">Seed Drills</option>
                  <option value="Sprayers">Sprayers</option>
                  <option value="Threshers">Threshers</option>
                  <option value="Cultivators">Cultivators</option>
                  <option value="Implements">Implements</option>
                </select>
              </div>

              {/* 4. Thumbnail Image URL */}
              <div>
                <label className="block font-semibold text-brand-text mb-1">Thumbnail Image URL</label>
                <input
                  type="url"
                  value={newThumbnailUrl}
                  onChange={(e) => setNewThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* 5. Short Description */}
              <div>
                <label className="block font-semibold text-brand-text mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newShortDescription}
                  onChange={(e) => setNewShortDescription(e.target.value)}
                  placeholder="Brief overview of implement throughput and utility..."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* 6. Full Technical Description */}
              <div>
                <label className="block font-semibold text-brand-text mb-1">Full Technical Description</label>
                <textarea
                  rows={3}
                  value={newFullTechnicalDescription}
                  onChange={(e) => setNewFullTechnicalDescription(e.target.value)}
                  placeholder="Detailed mechanical, diesel engine, hydraulic flow, and straw management specs..."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* 7. Gallery Media URLs & 8. Demo Video URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Gallery Media URLs (One per line)</label>
                  <textarea
                    rows={2}
                    value={newGalleryUrls}
                    onChange={(e) => setNewGalleryUrls(e.target.value)}
                    placeholder="https://...&#10;https://..."
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-mono text-[11px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Demo Video URL</label>
                  <input
                    type="url"
                    value={newDemoVideoUrl}
                    onChange={(e) => setNewDemoVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Commercial Terms: Properly Separated Purchasable & Rentable Options */}
              <div className="space-y-3 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-900 flex items-center justify-between">
                  <span>Dealership Commercial & Distribution Terms</span>
                  <span className="text-[10px] text-brand-muted font-normal lowercase">configure sale & lease options</span>
                </div>

                {/* 9. Purchasable? (Yes/No) Card */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  newIsPurchasable
                    ? 'border-teal-300 bg-teal-50/40 shadow-xs'
                    : 'border-brand-border bg-cream-50/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="fmc-purchasable-toggle"
                          className="font-bold text-forest-900 cursor-pointer text-xs"
                        >
                          Purchasable? (Yes/No)
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          newIsPurchasable ? 'bg-teal-100 text-teal-900' : 'bg-cream-200 text-brand-muted'
                        }`}>
                          {newIsPurchasable ? 'Yes • Commercial Sale Enabled' : 'No • Not For Sale'}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-muted mt-0.5">
                        Enable if this unit is available in FMC dealership showroom for purchase.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                      <input
                        id="fmc-purchasable-toggle"
                        type="checkbox"
                        checked={newIsPurchasable}
                        onChange={(e) => setNewIsPurchasable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-700"></div>
                    </label>
                  </div>

                  {newIsPurchasable && (
                    <div className="mt-3 pt-3 border-t border-teal-200/60">
                      <label className="block text-[11px] font-semibold text-forest-900 mb-1">
                        Commercial Purchase Price (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-brand-muted">₹</span>
                        <input
                          type="number"
                          required={newIsPurchasable}
                          value={newPurchasePrice}
                          onChange={(e) => setNewPurchasePrice(e.target.value)}
                          placeholder="e.g. 2200000"
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 10. Rentable? (Yes/No) Card */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  newIsRentable
                    ? 'border-teal-300 bg-teal-50/40 shadow-xs'
                    : 'border-brand-border bg-cream-50/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="fmc-rentable-toggle"
                          className="font-bold text-forest-900 cursor-pointer text-xs"
                        >
                          Rentable? (Yes/No)
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          newIsRentable ? 'bg-teal-100 text-teal-900' : 'bg-cream-200 text-brand-muted'
                        }`}>
                          {newIsRentable ? 'Yes • Commercial Lease Enabled' : 'No • Not For Rent'}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-muted mt-0.5">
                        Enable if this unit is available for fleet deployment and contract leasing.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                      <input
                        id="fmc-rentable-toggle"
                        type="checkbox"
                        checked={newIsRentable}
                        onChange={(e) => setNewIsRentable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-800"></div>
                    </label>
                  </div>

                  {newIsRentable && (
                    <div className="mt-3 pt-3 border-t border-teal-200/60 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-forest-900 mb-1">
                          Lease / Rental Rate (₹) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-brand-muted">₹</span>
                          <input
                            type="number"
                            required={newIsRentable}
                            value={newMachPrice}
                            onChange={(e) => setNewMachPrice(e.target.value)}
                            placeholder="e.g. 2400"
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-forest-900 mb-1">
                          Pricing Unit *
                        </label>
                        <select
                          value={newMachUnit}
                          onChange={(e) => setNewMachUnit(e.target.value as PricingUnit)}
                          className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                          <option value="acre">Per Acre (/acre)</option>
                          <option value="hourly">Per Hour (/hr)</option>
                          <option value="daily">Per Day (/day)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-text hover:bg-cream-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-subtle"
                >
                  Save Machine to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach & Manage Machine Media Modal */}
      <MachineMediaModal
        machine={mediaModalMachine}
        isOpen={!!mediaModalMachine}
        onClose={() => setMediaModalMachine(null)}
        onSaved={() => {
          setMachinery(machineryService.getAllMachinery().filter(m => m.centreId === centre.id || m.centreId.startsWith('fmc_')));
        }}
      />
    </div>
  );
};

