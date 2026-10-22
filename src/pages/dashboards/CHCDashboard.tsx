import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chcService } from '../../services/chcService';
import { machineryService } from '../../services/machineryService';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FarmMachinery, Booking, MachineOperationType, MachineryCategory, PricingUnit } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { MachineDetailModal } from '../../components/machinery/MachineDetailModal';
import { MachineDemoVideosTable } from '../../components/machinery/MachineDemoVideosTable';
import { MachineMediaModal } from '../../components/machinery/MachineMediaModal';
import {
  Building2,
  Tractor,
  CheckCircle,
  XCircle,
  Plus,
  MapPin,
  Film,
  Eye,
  Image as ImageIcon
} from 'lucide-react';

export const CHCDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const centre = (currentUser ? chcService.getCentreByUserId(currentUser.id) || (currentUser.linkedProfileId ? chcService.getCentreById(currentUser.linkedProfileId) : undefined) : undefined) || chcService.getAllCentres()[0];
  const [machineryList, setMachineryList] = useState<FarmMachinery[]>(() =>
    machineryService.getMachineryByCentreId(centre.id)
  );
  const [bookings, setBookings] = useState<Booking[]>(() =>
    bookingService.getBookingsByCentreId(centre.id)
  );

  // Tab: Fleet Master vs Demo Videos Separate Table
  const [activeTab, setActiveTab] = useState<'fleet' | 'videos'>('fleet');
  const [inspectMachinery, setInspectMachinery] = useState<FarmMachinery | null>(null);
  const [mediaModalMachine, setMediaModalMachine] = useState<FarmMachinery | null>(null);

  useEffect(() => {
    setMachineryList(machineryService.getMachineryByCentreId(centre.id));
    setBookings(bookingService.getBookingsByCentreId(centre.id));
  }, [currentUser?.id, centre.id]);

  // Add Machinery Modal with all 10 fields
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMachId, setNewMachId] = useState('');
  const [newMachName, setNewMachName] = useState('');
  const [newOperationType, setNewOperationType] = useState<MachineOperationType>('Tillage');
  const [newMachCategory, setNewMachCategory] = useState<MachineryCategory>('Tractors');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [newShortDescription, setNewShortDescription] = useState('');
  const [newFullTechnicalDescription, setNewFullTechnicalDescription] = useState('');
  const [newGalleryUrls, setNewGalleryUrls] = useState('');
  const [newDemoVideoUrl, setNewDemoVideoUrl] = useState('');
  const [newIsPurchasable, setNewIsPurchasable] = useState(false);
  const [newPurchasePrice, setNewPurchasePrice] = useState('750000');
  const [newIsRentable, setNewIsRentable] = useState(true);
  const [newMachPrice, setNewMachPrice] = useState('900');
  const [newMachUnit, setNewMachUnit] = useState<PricingUnit>('hourly');

  const handleBookingAction = (bookingId: string, action: 'confirmed' | 'rejected') => {
    bookingService.updateBookingStatus(
      bookingId,
      action,
      action === 'confirmed' ? 'Accepted by centre manager. Operator dispatched.' : 'Centre fleet fully committed for this date.'
    );
    setBookings(bookingService.getBookingsByCentreId(centre.id));
    showToast(
      action === 'confirmed' ? 'Booking Accepted' : 'Booking Declined',
      `Booking ${bookingId} has been ${action}.`,
      action === 'confirmed' ? 'success' : 'info'
    );
  };

  const handleToggleAvailability = (machId: string, currentVal: boolean) => {
    machineryService.updateMachinery(machId, { available: !currentVal });
    setMachineryList(machineryService.getMachineryByCentreId(centre.id));
    showToast('Equipment Status Updated', 'Machinery availability changed for farmers.', 'success');
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
      model: '2026 High-Efficiency Implement',
      thumbnailUrl: finalThumbnail,
      shortDescription: newShortDescription.trim() || 'High efficiency agricultural implement for regional soil cultivation.',
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
      securityDeposit: 1500,
      minimumDuration: '2 Hours',
      available: true,
      specifications: {
        "Operation Type": newOperationType,
        "Capacity": "Standard Field Fleet",
        "Recommended Tractor": "45 - 65 HP"
      },
      images: galleryArr,
      location: centre.location,
      description: newShortDescription.trim(),
      cancellationPolicy: "6 Hours prior cancellation allowed."
    });

    setMachineryList(machineryService.getMachineryByCentreId(centre.id));
    setAddModalOpen(false);
    setNewMachId('');
    setNewMachName('');
    setNewShortDescription('');
    setNewFullTechnicalDescription('');
    setNewDemoVideoUrl('');
    setNewThumbnailUrl('');
    showToast('Machine Registered to Fleet', `${created.name} (${created.operationType}) added successfully.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-700 text-white flex items-center justify-center font-bold shadow-subtle shrink-0">
            <Building2 className="w-8 h-8 text-harvest" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                CHC Centre Portal
              </span>
              <span className="text-xs text-brand-muted">
                SMAM Reg: <strong>{centre.registrationNumber}</strong>
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              {centre.centreName}
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Managed by {centre.contactPerson} • {centre.location.district}, {centre.location.state}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border text-xs font-semibold text-brand-text hover:bg-forest-50 transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-forest-600" />
            Profile & Geolocation
          </Link>
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-heading font-bold text-xs shadow-subtle transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Implement to Fleet</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Total Fleet Items</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">{machineryList.length} Units</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Incoming Requests</div>
          <div className="text-2xl font-heading font-extrabold text-amber-700 mt-1">
            {bookings.filter(b => b.status === 'pending_approval').length} Pending
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Confirmed Work Orders</div>
          <div className="text-2xl font-heading font-extrabold text-emerald-700 mt-1">
            {bookings.filter(b => b.status === 'confirmed').length} Active
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Service Radius</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">{centre.serviceRadiusKm} km</div>
        </div>
      </div>

      {/* Section 1: Incoming Hiring Requests */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-4">
        <h3 className="font-heading font-bold text-lg text-forest-900">
          Incoming Farmer Hiring Requests
        </h3>

        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl border border-brand-border bg-cream-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-forest-900">{b.equipmentName}</span>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xs text-brand-muted">
                  Farmer: <strong>{b.farmerName}</strong> ({b.farmerPhone}) • Location: {b.farmLocation.village}
                </p>
                <div className="flex items-center gap-4 text-xs pt-1">
                  <span className="font-semibold text-forest-800">
                    Schedule: {b.startDate} ({b.timeSlot})
                  </span>
                  <span className="text-brand-muted">
                    Duration: {b.durationValue} {b.durationUnit}
                  </span>
                  <span className="font-bold text-forest-900">
                    Total: {formatCurrency(b.totalCost)}
                  </span>
                </div>
              </div>

              {b.status === 'pending_approval' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleBookingAction(b.id, 'confirmed')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-subtle transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept Request</span>
                  </button>
                  <button
                    onClick={() => handleBookingAction(b.id, 'rejected')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Fleet Management Master & Separate Demo Videos Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                Equipment & Implements Module
              </span>
              <span className="text-xs text-brand-muted">
                Operation Types: Tillage, Sowing, Plant Protection, Harvesting
              </span>
            </div>
            <h3 className="font-heading font-bold text-xl text-forest-900 mt-1">
              Fleet Master & Technical Video Demonstrations
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
                    ? 'bg-forest-800 text-white shadow-subtle'
                    : 'text-brand-muted hover:text-forest-900'
                }`}
              >
                <Tractor className="w-3.5 h-3.5 text-harvest" />
                <span>Fleet Master ({machineryList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'videos'
                    ? 'bg-forest-800 text-white shadow-subtle'
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-subtle transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4 text-harvest" />
                <span>Register Machine</span>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'fleet' ? (
          /* 10-Field Machinery Fleet Table */
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
                  {machineryList.map((m) => (
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
                          {m.operationType || 'Tillage'}
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
                              className="w-7 h-7 rounded-lg overflow-hidden border border-brand-border cursor-pointer hover:ring-2 hover:ring-forest-600 shrink-0 shadow-xs group"
                              title="Click to manage media"
                            >
                              <img src={url} alt="Attached media" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setMediaModalMachine(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-forest-100 text-forest-800 border border-brand-border text-[10px] font-bold transition-all group shrink-0"
                            title="Attach or manage gallery media & demo video"
                          >
                            <ImageIcon className="w-3 h-3 text-forest-600 group-hover:text-forest-800" />
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
                          {m.available ? 'Available' : 'Booked'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setMediaModalMachine(m)}
                            className="p-1.5 rounded-lg border border-brand-border text-forest-800 hover:bg-forest-50 font-semibold"
                            title="Attach & Manage Media"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-forest-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInspectMachinery(m)}
                            className="p-1.5 rounded-lg border border-brand-border text-forest-800 hover:bg-cream-100 font-semibold"
                            title="Inspect complete technical details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(m.id, m.available)}
                            className="px-2.5 py-1 rounded-lg border border-brand-border font-semibold text-[11px] hover:bg-cream-100 transition-colors"
                          >
                            {m.available ? 'Mark Booked' : 'Mark Available'}
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
            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Dedicated Demo Videos Repository:</strong> This separate table maintains video demonstrations and gallery media indexed by Machine ID.
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-harvest bg-forest-900 px-2 py-0.5 rounded">
                  Fleet Registration Form
                </span>
                <h3 className="font-heading font-bold text-base text-forest-900 mt-1">
                  Add New Machine to CHC Fleet
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
                    placeholder="Auto-generated if blank (e.g. mach_111)"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-mono text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>

                {/* 2. Operation Type */}
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Operation Type *</label>
                  <select
                    value={newOperationType}
                    onChange={(e) => setNewOperationType(e.target.value as MachineOperationType)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-semibold focus:ring-2 focus:ring-forest-500 focus:outline-none"
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
                  placeholder="e.g. Sonalika Tiger DI 65 4WD Tractor"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-brand-text mb-1">Category</label>
                <select
                  value={newMachCategory}
                  onChange={(e) => setNewMachCategory(e.target.value as MachineryCategory)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                >
                  <option value="Tractors">Tractors</option>
                  <option value="Rotavators">Rotavators</option>
                  <option value="Seed Drills">Seed Drills</option>
                  <option value="Harvesters">Harvesters</option>
                  <option value="Sprayers">Sprayers</option>
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
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-mono text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
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
                  placeholder="Brief summary for listings, capacity, and key use-case..."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              {/* 6. Full Technical Description */}
              <div>
                <label className="block font-semibold text-brand-text mb-1">Full Technical Description</label>
                <textarea
                  rows={3}
                  value={newFullTechnicalDescription}
                  onChange={(e) => setNewFullTechnicalDescription(e.target.value)}
                  placeholder="Detailed engineering parameters, PTO, transmission, fuel consumption..."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
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
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-mono text-[11px] focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Demo Video URL</label>
                  <input
                    type="url"
                    value={newDemoVideoUrl}
                    onChange={(e) => setNewDemoVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-mono text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Commercial Terms: Properly Separated Purchasable & Rentable Options */}
              <div className="space-y-3 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-forest-800 flex items-center justify-between">
                  <span>Commercial & Availability Terms</span>
                  <span className="text-[10px] text-brand-muted font-normal lowercase">configure buy & rent options</span>
                </div>

                {/* 9. Purchasable? (Yes/No) Card */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  newIsPurchasable
                    ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                    : 'border-brand-border bg-cream-50/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="chc-purchasable-toggle"
                          className="font-bold text-forest-900 cursor-pointer text-xs"
                        >
                          Purchasable? (Yes/No)
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          newIsPurchasable ? 'bg-emerald-100 text-emerald-800' : 'bg-cream-200 text-brand-muted'
                        }`}>
                          {newIsPurchasable ? 'Yes • Direct Sale Enabled' : 'No • Not For Sale'}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-muted mt-0.5">
                        Enable if this machine is available for farmers or FPOs to purchase outright.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                      <input
                        id="chc-purchasable-toggle"
                        type="checkbox"
                        checked={newIsPurchasable}
                        onChange={(e) => setNewIsPurchasable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {newIsPurchasable && (
                    <div className="mt-3 pt-3 border-t border-emerald-200/60">
                      <label className="block text-[11px] font-semibold text-forest-900 mb-1">
                        Outright Purchase Price (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-brand-muted">₹</span>
                        <input
                          type="number"
                          required={newIsPurchasable}
                          value={newPurchasePrice}
                          onChange={(e) => setNewPurchasePrice(e.target.value)}
                          placeholder="e.g. 750000"
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-forest-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 10. Rentable? (Yes/No) Card */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  newIsRentable
                    ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                    : 'border-brand-border bg-cream-50/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="chc-rentable-toggle"
                          className="font-bold text-forest-900 cursor-pointer text-xs"
                        >
                          Rentable? (Yes/No)
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          newIsRentable ? 'bg-emerald-100 text-emerald-800' : 'bg-cream-200 text-brand-muted'
                        }`}>
                          {newIsRentable ? 'Yes • Custom Hiring Enabled' : 'No • Not For Rent'}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-muted mt-0.5">
                        Enable if this machine is available for custom hiring / rental booking.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                      <input
                        id="chc-rentable-toggle"
                        type="checkbox"
                        checked={newIsRentable}
                        onChange={(e) => setNewIsRentable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest-700"></div>
                    </label>
                  </div>

                  {newIsRentable && (
                    <div className="mt-3 pt-3 border-t border-emerald-200/60 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-forest-900 mb-1">
                          Rental Rate (₹) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-brand-muted">₹</span>
                          <input
                            type="number"
                            required={newIsRentable}
                            value={newMachPrice}
                            onChange={(e) => setNewMachPrice(e.target.value)}
                            placeholder="e.g. 900"
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-forest-500 focus:outline-none"
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
                          className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-semibold focus:ring-2 focus:ring-forest-500 focus:outline-none"
                        >
                          <option value="hourly">Per Hour (/hr)</option>
                          <option value="acre">Per Acre (/acre)</option>
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
                  className="px-5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold shadow-subtle"
                >
                  Save Implement to Fleet
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
          setMachineryList(machineryService.getMachineryByCentreId(centre.id));
        }}
      />
    </div>
  );
};

