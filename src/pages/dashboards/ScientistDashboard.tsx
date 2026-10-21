import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consultationService } from '../../services/consultationService';
import { useToast } from '../../context/ToastContext';
import { Consultation } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  GraduationCap,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const ScientistDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [consultations, setConsultations] = useState<Consultation[]>(() =>
    consultationService.getAllConsultations()
  );

  // Response Modal
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [prescriptionNote, setPrescriptionNote] = useState('');

  const handleRespond = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation || !prescriptionNote) return;

    consultationService.respondToConsultation(
      selectedConsultation.id,
      prescriptionNote,
      ['bio_001']
    );

    setConsultations(consultationService.getAllConsultations());
    showToast('Advisory Prescription Dispatched', `Response transmitted to farmer ${selectedConsultation.farmerName}.`, 'success');
    setSelectedConsultation(null);
    setPrescriptionNote('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
            alt="Scientist"
            className="w-16 h-16 rounded-2xl object-cover border border-forest-300 shadow-subtle shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                ICAR Principal Scientist
              </span>
              <span className="text-xs text-brand-muted">
                IISR Indore • Plant Pathology
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              Dr. Anandita Sengupta
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Plant Pathology & Biological Fungal Disease Management Advisory Console
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-brand-muted">Lifetime Consultations:</span>
          <div className="font-heading font-extrabold text-2xl text-forest-900">420 Cases</div>
        </div>
      </div>

      {/* Requests Queue */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <h3 className="font-heading font-bold text-lg text-forest-900">
            Incoming Farmer Queries & Appointment Requests
          </h3>
          <span className="text-xs font-semibold text-agri">
            {consultations.length} Cases Logged
          </span>
        </div>

        <div className="space-y-4">
          {consultations.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl border border-brand-border bg-cream-50/50 flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-bold text-base text-forest-900">
                    {c.crop} - {c.topic}
                  </span>
                  <StatusBadge status={c.status} />
                </div>

                <div className="text-xs text-brand-muted">
                  Farmer: <strong>{c.farmerName}</strong> ({c.farmerPhone}) • Scheduled Slot: <strong>{c.slot}</strong> ({c.format})
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-brand-border text-xs text-brand-text">
                  <span className="font-bold text-forest-900 block mb-1">Farmer Observed Symptoms:</span>
                  <p className="text-brand-muted leading-relaxed">{c.issueDescription}</p>
                </div>

                {c.photoUrl && (
                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-brand-muted block mb-1">Field Symptom Photo:</span>
                    <img
                      src={c.photoUrl}
                      alt="Crop symptom"
                      className="w-28 h-20 rounded-xl object-cover border border-brand-border shadow-subtle cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(c.photoUrl, '_blank')}
                    />
                  </div>
                )}

                {c.responseNotes && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                    <strong className="block text-emerald-900">Your Dispatched Prescription:</strong>
                    <p className="text-[11px] mt-0.5">{c.responseNotes}</p>
                  </div>
                )}
              </div>

              {c.status !== 'Responded' && (
                <button
                  onClick={() => {
                    setSelectedConsultation(c);
                    setPrescriptionNote('');
                  }}
                  className="px-4 py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-forest-600 hover:bg-forest-700 shadow-subtle shrink-0 transition-colors"
                >
                  Draft Diagnosis & Response
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Response Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-lg w-full p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-forest-900 border-b border-brand-border pb-2">
              Provide Advisory Prescription to {selectedConsultation.farmerName}
            </h3>

            <form onSubmit={handleRespond} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-brand-text mb-1">
                  Diagnosis & Bio-Input Formulation Recommendations
                </label>
                <textarea
                  rows={4}
                  required
                  value={prescriptionNote}
                  onChange={(e) => setPrescriptionNote(e.target.value)}
                  placeholder="e.g. Symptoms indicate Rhizoctonia collar rot. Drench root zone with Trichoderma viride 1.5% WP @ 5g/L water during late evening. Maintain optimal field drainage."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 focus:ring-2 focus:ring-forest-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-3 bg-forest-50 rounded-xl border border-forest-200 text-forest-900 text-[11px]">
                Note: Prescriptions will be instantly displayed in the farmer's dashboard and shared via registered SMS notification.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setSelectedConsultation(null)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-text font-semibold hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold shadow-subtle"
                >
                  Dispatch Advisory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
