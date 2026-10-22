import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chcService } from '../../services/chcService';
import { machineryService } from '../../services/machineryService';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FarmMachinery, Booking } from '../../types';
import { formatCurrency } from '../../lib/utils';
import {
  Building2,
  Tractor,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  DollarSign,
  Users,
  Layers,
  ArrowRight,
  MapPin
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

  useEffect(() => {
    setMachineryList(machineryService.getMachineryByCentreId(centre.id));
    setBookings(bookingService.getBookingsByCentreId(centre.id));
  }, [currentUser?.id, centre.id]);

  // Add Machinery Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMachName, setNewMachName] = useState('');
  const [newMachCategory, setNewMachCategory] = useState<any>('Tractors');
  const [newMachPrice, setNewMachPrice] = useState('900');
  const [newMachUnit, setNewMachUnit] = useState<any>('hourly');

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
    const created = machineryService.addMachinery({
      centreId: centre.id,
      centreName: centre.centreName,
      name: newMachName,
      category: newMachCategory,
      model: '2026 Fleet Implement',
      fuelType: 'Diesel Included',
      operatorProvided: true,
      pricePerUnit: Number(newMachPrice),
      pricingUnit: newMachUnit,
      securityDeposit: 1500,
      minimumDuration: '2 Hours',
      available: true,
      specifications: { "Capacity": "Standard", "PTO Power": "40 HP" },
      images: ["https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80"],
      location: centre.location,
      description: "Added to centre fleet inventory under SMAM operational guidelines.",
      cancellationPolicy: "6 Hours prior cancellation allowed."
    });

    setMachineryList(machineryService.getMachineryByCentreId(centre.id));
    setAddModalOpen(false);
    setNewMachName('');
    showToast('Machine Added to Fleet', `${created.name} is now discoverable by farmers.`, 'success');
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

      {/* Section 2: Fleet Management Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-4">
        <h3 className="font-heading font-bold text-lg text-forest-900">
          Centre Machinery Fleet & Rates Management
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">Implement / Machine</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Rental Rate</th>
                <th className="py-3 px-2">Operator</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Toggle Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {machineryList.map((m) => (
                <tr key={m.id} className="hover:bg-cream-50/50">
                  <td className="py-3.5 px-2 font-bold text-forest-900 flex items-center gap-2">
                    <img src={m.images[0]} alt={m.name} className="w-9 h-9 rounded-lg object-cover" />
                    <span>{m.name}</span>
                  </td>
                  <td className="py-3.5 px-2 text-brand-text">{m.category}</td>
                  <td className="py-3.5 px-2 font-bold text-forest-800">
                    {formatCurrency(m.pricePerUnit)} / {m.pricingUnit}
                  </td>
                  <td className="py-3.5 px-2 text-brand-muted">{m.operatorProvided ? 'Centre Driver' : 'Self'}</td>
                  <td className="py-3.5 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {m.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => handleToggleAvailability(m.id, m.available)}
                      className="px-3 py-1.5 rounded-lg border border-brand-border font-semibold hover:bg-cream-100 transition-colors"
                    >
                      {m.available ? 'Mark Booked' : 'Mark Available'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Machinery Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-md w-full p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-forest-900 border-b border-brand-border pb-2">
              Register New Machine to Fleet
            </h3>

            <form onSubmit={handleAddMachinery} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-brand-text mb-1">Machine / Implement Name</label>
                <input
                  type="text"
                  required
                  value={newMachName}
                  onChange={(e) => setNewMachName(e.target.value)}
                  placeholder="e.g. Sonalika DI 60 Tractor (60 HP)"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">Category</label>
                <select
                  value={newMachCategory}
                  onChange={(e) => setNewMachCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                >
                  <option value="Tractors">Tractors</option>
                  <option value="Rotavators">Rotavators</option>
                  <option value="Seed Drills">Seed Drills</option>
                  <option value="Harvesters">Harvesters</option>
                  <option value="Sprayers">Sprayers</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Rental Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={newMachPrice}
                    onChange={(e) => setNewMachPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Pricing Unit</label>
                  <select
                    value={newMachUnit}
                    onChange={(e) => setNewMachUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  >
                    <option value="hourly">Per Hour</option>
                    <option value="acre">Per Acre</option>
                    <option value="daily">Per Day</option>
                  </select>
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
                  className="px-5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold shadow-subtle"
                >
                  Save Implement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
