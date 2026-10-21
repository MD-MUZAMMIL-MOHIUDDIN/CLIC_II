import React, { useState } from 'react';
import { FarmMachinery, Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { formatCurrency } from '../../lib/utils';
import { X, Calendar, Clock, MapPin, CheckCircle, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

interface BookingModalProps {
  machinery: FarmMachinery;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  machinery,
  isOpen,
  onClose,
  onBookingSuccess
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('08:00 AM - 02:00 PM');
  const [durationValue, setDurationValue] = useState(
    machinery.pricingUnit === 'hourly' ? 4 : machinery.pricingUnit === 'acre' ? 3 : 1
  );
  const [operatorRequired, setOperatorRequired] = useState(machinery.operatorProvided);
  const [village, setVillage] = useState(currentUser?.location.village || 'Kanadia');
  const [notes, setNotes] = useState('');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const totalCost = machinery.pricePerUnit * durationValue;
  const deposit = machinery.securityDeposit || 1000;

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as any);
    } else {
      // Submit booking
      const newBooking = bookingService.createBooking({
        equipmentId: machinery.id,
        equipmentName: machinery.name,
        centreId: machinery.centreId,
        centreName: machinery.centreName,
        farmerId: currentUser?.id || 'usr_farmer_1',
        farmerName: currentUser?.fullName || 'Rameshwar Patel',
        farmerPhone: currentUser?.mobile || '9876543210',
        farmLocation: {
          state: machinery.location.state,
          district: machinery.location.district,
          block: machinery.location.block,
          village: village
        },
        startDate: startDate,
        endDate: startDate,
        timeSlot: timeSlot,
        durationValue: Number(durationValue),
        durationUnit: machinery.pricingUnit,
        totalCost: totalCost,
        depositAmount: deposit,
        operatorRequired: operatorRequired
      });

      setCreatedBooking(newBooking);
      setStep(4);
      showToast('Booking Request Submitted', `Booking ref: ${newBooking.id} sent to ${machinery.centreName}`, 'success');
      if (onBookingSuccess) onBookingSuccess(newBooking);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border bg-forest-50/70 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-200/60 text-forest-800">
                Custom Hiring Booking
              </span>
              <span className="text-xs text-brand-muted">Step {step} of 4</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-forest-900 mt-1">
              {machinery.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-forest-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full bg-cream-200 h-1.5">
          <div
            className="bg-forest-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-brand-text">
          {/* Step 1: Equipment & Operator */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3.5 bg-cream-50 rounded-2xl border border-brand-border">
                <img
                  src={machinery.images[0]}
                  alt={machinery.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-brand-border"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-forest-900">{machinery.name}</h4>
                  <p className="text-brand-muted text-[11px] mt-0.5">{machinery.centreName}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-extrabold text-forest-800 text-sm">
                      {formatCurrency(machinery.pricePerUnit)}
                    </span>
                    <span className="text-brand-muted font-medium">/ {machinery.pricingUnit}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">
                  Operator Arrangement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOperatorRequired(true)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      operatorRequired
                        ? 'border-forest-600 bg-forest-50/60 ring-1 ring-forest-600'
                        : 'border-brand-border hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-forest-900">
                      <UserCheck className="w-4 h-4 text-forest-600" />
                      Include Centre Driver
                    </div>
                    <p className="text-[11px] text-brand-muted mt-1">
                      Certified tractor operator provided by CHC.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOperatorRequired(false)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !operatorRequired
                        ? 'border-forest-600 bg-forest-50/60 ring-1 ring-forest-600'
                        : 'border-brand-border hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-forest-900">
                      <ShieldCheck className="w-4 h-4 text-forest-600" />
                      Self-Operated
                    </div>
                    <p className="text-[11px] text-brand-muted mt-1">
                      Requires valid commercial tractor driving license.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">
                  Minimum Hiring Notice
                </label>
                <p className="text-brand-muted text-[11px] bg-cream-100 p-2.5 rounded-xl border border-brand-border">
                  Minimum hire duration for this machine is <strong>{machinery.minimumDuration}</strong>. Fuel is {machinery.fuelType}.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Date, Slot & Duration */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-brand-text mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-forest-600" />
                  Select Required Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-medium focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-forest-600" />
                  Select Available Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '07:00 AM - 01:00 PM (Morning)',
                    '01:00 PM - 07:00 PM (Afternoon)',
                    '08:00 AM - 04:00 PM (Full Day)',
                    '06:00 PM - 10:00 PM (Evening)'
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        timeSlot === slot
                          ? 'border-forest-600 bg-forest-50 text-forest-900 ring-1 ring-forest-600'
                          : 'border-brand-border hover:bg-cream-50 text-brand-text'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1.5">
                  Usage Quantity ({machinery.pricingUnit === 'hourly' ? 'Hours' : machinery.pricingUnit === 'acre' ? 'Acres' : 'Days'})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={durationValue}
                    onChange={(e) => setDurationValue(Number(e.target.value))}
                    className="flex-1 accent-forest-600"
                  />
                  <span className="w-16 text-center font-bold text-sm bg-cream-100 py-1.5 rounded-lg border border-brand-border">
                    {durationValue} {machinery.pricingUnit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-forest-600" />
                  Farm Village / Location Landmark
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Village Kanadia, Survey No 142"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Cost Review & Deposit */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-cream-50 p-4 rounded-2xl border border-brand-border space-y-2.5">
                <h4 className="font-heading font-bold text-sm text-forest-900 border-b border-brand-border pb-2">
                  Estimated Rental Breakdown
                </h4>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Base Rate:</span>
                  <span className="font-semibold text-brand-text">{formatCurrency(machinery.pricePerUnit)} / {machinery.pricingUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Duration / Quantity:</span>
                  <span className="font-semibold text-brand-text">{durationValue} {machinery.pricingUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Operator Charge:</span>
                  <span className="font-semibold text-agri">{operatorRequired ? 'Included' : 'Self-Arranged'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Refundable Security Deposit:</span>
                  <span className="font-semibold text-brand-text">{formatCurrency(deposit)}</span>
                </div>
                <div className="border-t border-brand-border pt-2 flex justify-between text-sm font-bold text-forest-900">
                  <span>Estimated Total Amount:</span>
                  <span className="text-forest-700 font-extrabold">{formatCurrency(totalCost + deposit)}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">
                  Special Notes for Centre Operator (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Black soil with heavy moisture, need rotavator after 8 AM."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Booking Terms:</strong> No payment is deducted now. The Custom Hiring Centre will review your booking schedule and field location, then confirm via SMS/Call. Payment is settled upon implement delivery.
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && createdBooking && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-subtle">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="font-heading font-extrabold text-xl text-forest-900">
                Booking Request Sent!
              </h4>
              <p className="text-brand-muted text-xs max-w-md mx-auto leading-relaxed">
                Your hiring request for <strong>{createdBooking.equipmentName}</strong> has been transmitted to <strong>{createdBooking.centreName}</strong>.
              </p>

              <div className="bg-cream-50 p-4 rounded-2xl border border-brand-border max-w-sm mx-auto text-left space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Booking Reference:</span>
                  <span className="font-bold text-forest-800">{createdBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Date & Slot:</span>
                  <span className="font-semibold text-brand-text">{createdBooking.startDate} ({createdBooking.timeSlot})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Status:</span>
                  <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                    Pending Centre Approval
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-cream-50 flex items-center justify-between">
          {step > 1 && step < 4 && (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text hover:bg-cream-200 border border-brand-border transition-colors"
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 shadow-subtle transition-all"
            >
              <span>{step === 3 ? 'Confirm & Submit Request' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 shadow-subtle transition-colors"
            >
              Done & Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
