import React, { useState } from 'react';
import { LivestockProduct } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../lib/utils';
import { X, Send, Phone, MapPin, CheckCircle } from 'lucide-react';

interface EnquiryModalProps {
  product: LivestockProduct;
  isOpen: boolean;
  onClose: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(
    `Hello ${product.sellerName}, I am interested in inquiring about ${product.name}. Please share availability and transportation details to my village.`
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Enquiry Sent to Seller', `Seller ${product.sellerName} will contact you shortly on ${currentUser?.mobile || '9876543210'}.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border bg-forest-50/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-200/60 text-forest-800">
              Seller Direct Enquiry
            </span>
            <h3 className="font-heading font-bold text-base text-forest-900 mt-0.5">
              Contact {product.sellerName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-brand-muted hover:text-brand-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-brand-text">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-2xl border border-brand-border">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-brand-border"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-forest-900">{product.name}</h4>
                  <div className="text-forest-700 font-extrabold text-xs mt-1">
                    {formatCurrency(product.price)} <span className="text-brand-muted font-normal">{product.priceUnit}</span>
                  </div>
                  <div className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-agri" />
                    <span>{product.location.district}, {product.location.state}</span>
                  </div>
                </div>
              </div>

              {!product.isLiveAnimal && (
                <div>
                  <label className="block font-semibold text-brand-text mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-brand-text mb-1">Your Enquiry Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-3 bg-cream-100 rounded-xl border border-brand-border text-brand-muted text-[11px] flex items-center gap-2">
                <Phone className="w-4 h-4 text-forest-600 shrink-0" />
                <span>
                  Seller verified phone: <strong>{product.sellerPhone}</strong>. Your registered phone ({currentUser?.mobile || '9876543210'}) will be shared with the seller.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text hover:bg-cream-100 border border-brand-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 shadow-subtle"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Enquiry</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-heading font-bold text-lg text-forest-900">Enquiry Dispatched</h4>
              <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
                The seller has been notified with your enquiry details and contact information. You can track this enquiry in your Farmer Dashboard.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 shadow-subtle"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
