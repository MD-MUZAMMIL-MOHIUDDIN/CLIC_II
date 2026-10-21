import React, { useState } from 'react';
import { ScientistProfile, Consultation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { consultationService } from '../../services/consultationService';
import { X, Calendar, Video, Phone, Building, CheckCircle, ArrowRight, Upload, Sparkles } from 'lucide-react';

interface ConsultationRequestModalProps {
  scientist: ScientistProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (consultation: Consultation) => void;
}

export const ConsultationRequestModal: React.FC<ConsultationRequestModalProps> = ({
  scientist,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [crop, setCrop] = useState('Gram (Chana)');
  const [cropStage, setCropStage] = useState('Early Vegetative (30 Days)');
  const [topic, setTopic] = useState('Wilting / Collar Rot Symptoms');
  const [issueDescription, setIssueDescription] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(true);
  const [format, setFormat] = useState<'Video Call' | 'Audio Call' | 'Clinic Visit'>('Video Call');
  const [slot, setSlot] = useState(scientist.availableSlots[0] || 'Tomorrow 10:30 AM - 11:00 AM');
  const [createdConsultation, setCreatedConsultation] = useState<Consultation | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const newConsultation = consultationService.createConsultation({
      scientistId: scientist.id,
      scientistName: scientist.name,
      farmerId: currentUser?.id || 'usr_farmer_1',
      farmerName: currentUser?.fullName || 'Rameshwar Patel',
      farmerPhone: currentUser?.mobile || '9876543210',
      crop,
      cropStage,
      topic,
      issueDescription: issueDescription || 'Observed yellowing of lower foliage and brown stem collar lesions following first irrigation.',
      photoUrl: photoUploaded ? 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80' : undefined,
      slot,
      format
    });

    setCreatedConsultation(newConsultation);
    setStep(4);
    showToast('Consultation Requested', `Appointment submitted to ${scientist.name}. You will receive joining details.`, 'success');
    if (onSuccess) onSuccess(newConsultation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border bg-forest-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={scientist.avatarUrl}
              alt={scientist.name}
              className="w-10 h-10 rounded-full object-cover border border-forest-300"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-200/60 text-forest-800">
                  Expert Consultation
                </span>
                <span className="text-xs text-brand-muted">Step {step} of 4</span>
              </div>
              <h3 className="font-heading font-bold text-base text-forest-900 mt-0.5">
                {scientist.name}
              </h3>
            </div>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-brand-text">
          {/* Step 1: Crop & Stage */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-semibold text-brand-text mb-1">Select Crop</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                >
                  <option value="Gram (Chana)">Gram (Chana) - Rabi Pulse</option>
                  <option value="Wheat (Rabi)">Wheat (Gehun) - Cereal</option>
                  <option value="Mustard">Mustard (Sarson) - Oilseed</option>
                  <option value="Soybean">Soybean - Legume</option>
                  <option value="Tomato / Vegetables">Tomato / Winter Vegetables</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">Crop Growth Stage</label>
                <select
                  value={cropStage}
                  onChange={(e) => setCropStage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                >
                  <option value="Seed Bed Preparation">Seed Bed Preparation / Pre-sowing</option>
                  <option value="Sowing & Emergence">Sowing & Emergence (0-15 Days)</option>
                  <option value="Early Vegetative (30 Days)">Early Vegetative (20-35 Days)</option>
                  <option value="Flowering / Pod Setting">Flowering / Pod Setting</option>
                  <option value="Grain Filling & Maturity">Grain Filling & Maturity</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">Consultation Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Leaf spot, yellowing, pod borer, soil salinity"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Issue Description & Crop Photo */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-semibold text-brand-text mb-1">
                  Describe Symptoms & Farm Conditions
                </label>
                <textarea
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe when the symptom started, affected percentage of the field, fertilizer or pesticide applied recently..."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">
                  Supporting Crop / Soil Photo
                </label>
                <div
                  onClick={() => setPhotoUploaded(!photoUploaded)}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    photoUploaded
                      ? 'border-forest-500 bg-forest-50/50'
                      : 'border-brand-border hover:bg-cream-50'
                  }`}
                >
                  <Upload className="w-6 h-6 text-forest-600 mx-auto mb-1.5" />
                  <p className="font-semibold text-forest-900">
                    {photoUploaded ? 'Photo attached: chana_collar_rot_field.jpg (Uploaded)' : 'Click to attach crop image'}
                  </p>
                  <p className="text-[11px] text-brand-muted mt-0.5">
                    Clear photos of affected leaf/stem or root collar aid rapid scientific diagnosis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Format & Slot */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-brand-text mb-1.5">
                  Consultation Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('Video Call')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      format === 'Video Call'
                        ? 'border-forest-600 bg-forest-50 text-forest-900 ring-1 ring-forest-600 font-bold'
                        : 'border-brand-border text-brand-muted hover:bg-cream-50'
                    }`}
                  >
                    <Video className="w-4 h-4 mx-auto mb-1 text-forest-600" />
                    <span>Video Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('Audio Call')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      format === 'Audio Call'
                        ? 'border-forest-600 bg-forest-50 text-forest-900 ring-1 ring-forest-600 font-bold'
                        : 'border-brand-border text-brand-muted hover:bg-cream-50'
                    }`}
                  >
                    <Phone className="w-4 h-4 mx-auto mb-1 text-forest-600" />
                    <span>Audio Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('Clinic Visit')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      format === 'Clinic Visit'
                        ? 'border-forest-600 bg-forest-50 text-forest-900 ring-1 ring-forest-600 font-bold'
                        : 'border-brand-border text-brand-muted hover:bg-cream-50'
                    }`}
                  >
                    <Building className="w-4 h-4 mx-auto mb-1 text-forest-600" />
                    <span>KVK Clinic</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-forest-600" />
                  Available Appointment Slot
                </label>
                <div className="space-y-2">
                  {scientist.availableSlots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        slot === s
                          ? 'border-forest-600 bg-forest-50 text-forest-900 ring-1 ring-forest-600'
                          : 'border-brand-border hover:bg-cream-50 text-brand-text'
                      }`}
                    >
                      <span>{s}</span>
                      <span className="text-[10px] text-agri font-bold">Open</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-forest-50 rounded-xl border border-forest-200 text-forest-900 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-harvest-dark shrink-0" />
                <span>
                  Consultations are provided under the ICAR Extension Advisory Framework at zero advisory fee for verified farmers.
                </span>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && createdConsultation && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-subtle">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="font-heading font-extrabold text-xl text-forest-900">
                Consultation Request Scheduled!
              </h4>
              <p className="text-brand-muted text-xs max-w-md mx-auto leading-relaxed">
                Your consultation request has been sent to <strong>{createdConsultation.scientistName}</strong>.
              </p>

              <div className="bg-cream-50 p-4 rounded-2xl border border-brand-border max-w-sm mx-auto text-left space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Consultation ID:</span>
                  <span className="font-bold text-forest-800">{createdConsultation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Crop / Topic:</span>
                  <span className="font-semibold text-brand-text">{createdConsultation.crop} - {createdConsultation.topic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Scheduled Slot:</span>
                  <span className="font-semibold text-brand-text">{createdConsultation.slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Format:</span>
                  <span className="font-semibold text-brand-text">{createdConsultation.format}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-cream-50 flex items-center justify-between">
          {step > 1 && step < 4 && (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text hover:bg-cream-200 border border-brand-border transition-colors"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 shadow-subtle transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === 3 ? (
            <button
              onClick={handleSubmit}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 shadow-subtle transition-all"
            >
              <span>Submit Consultation Request</span>
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
