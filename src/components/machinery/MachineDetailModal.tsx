import React, { useState } from 'react';
import { FarmMachinery, MachineOperationType } from '../../types';
import { formatCurrency } from '../../lib/utils';
import {
  X,
  Play,
  CheckCircle,
  XCircle,
  ExternalLink,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

interface MachineDetailModalProps {
  machinery: FarmMachinery | null;
  onClose: () => void;
  onOpenVideo?: (videoUrl: string, title: string) => void;
  onAttachMedia?: (machinery: FarmMachinery) => void;
}

export const MachineDetailModal: React.FC<MachineDetailModalProps> = ({
  machinery,
  onClose,
  onOpenVideo,
  onAttachMedia
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!machinery) return null;

  const defaultImage =
    machinery.thumbnailUrl ||
    (machinery.galleryMediaUrls && machinery.galleryMediaUrls[0]) ||
    machinery.images?.[0] ||
    '';
  const activeImage = selectedImage || defaultImage;

  const getOperationBadgeColor = (type: MachineOperationType | string) => {
    switch (type) {
      case 'Tillage':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Sowing':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Plant Protection':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Harvesting':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-forest-100 text-forest-900 border-forest-300';
    }
  };

  const allGallery = Array.from(
    new Set([
      machinery.thumbnailUrl,
      ...(machinery.galleryMediaUrls || []),
      ...(machinery.images || [])
    ].filter(Boolean))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-3xl w-full p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-brand-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-forest-900 text-harvest font-bold">
                ID: {machinery.id || machinery.machineId}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getOperationBadgeColor(machinery.operationType)}`}>
                Operation: {machinery.operationType}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cream-100 text-brand-text font-semibold">
                {machinery.category}
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-forest-900">
              {machinery.name}
            </h2>
            <div className="text-xs text-brand-muted flex items-center gap-2">
              <span>Model: <strong>{machinery.model}</strong></span>
              <span>•</span>
              <span>Hub: <strong>{machinery.centreName}</strong></span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-brand-muted hover:text-forest-900 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview & Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-3">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-forest-950 border border-brand-border group">
              <img
                src={activeImage || machinery.thumbnailUrl}
                alt={machinery.name}
                className="w-full h-full object-cover"
              />
              {machinery.demoVideoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    if (machinery.demoVideoUrl) {
                      if (onOpenVideo) {
                        onOpenVideo(machinery.demoVideoUrl, machinery.name);
                      } else {
                        window.open(machinery.demoVideoUrl, '_blank');
                      }
                    }
                  }}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-forest-900/90 hover:bg-harvest hover:text-forest-950 text-harvest text-xs font-bold shadow-subtle flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Demo Video</span>
                </button>
              )}
            </div>

            {/* Gallery Media URLs Thumbnails */}
            {allGallery.length > 1 && (
              <div>
                <span className="text-[11px] font-bold text-brand-muted block mb-1.5">
                  Gallery Media URLs ({allGallery.length} Images)
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allGallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activeImage === imgUrl ? 'border-harvest shadow-subtle scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Core Specifications & Commercial Terms */}
          <div className="md:col-span-6 space-y-4 text-xs">
            {/* Commercial Availability Badges */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-cream-50 border border-brand-border">
              <div>
                <span className="text-[10px] text-brand-muted uppercase font-bold block">Purchasable?</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {machinery.isPurchasable ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-800">Yes (Buyable)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span className="font-semibold text-rose-700">No (Rental Only)</span>
                    </>
                  )}
                </div>
                {machinery.isPurchasable && machinery.purchasePrice && (
                  <div className="text-[11px] font-bold text-forest-900 mt-1 font-mono">
                    Buy: {formatCurrency(machinery.purchasePrice)}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] text-brand-muted uppercase font-bold block">Rentable?</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {machinery.isRentable ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-800">Yes (Rentable)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span className="font-semibold text-rose-700">No</span>
                    </>
                  )}
                </div>
                {machinery.isRentable && (
                  <div className="text-[11px] font-bold text-forest-900 mt-1 font-mono">
                    Rent: {formatCurrency(machinery.pricePerUnit)} / {machinery.pricingUnit}
                  </div>
                )}
              </div>
            </div>

            {/* Short Description */}
            <div>
              <span className="font-bold text-forest-900 block mb-1">Short Description:</span>
              <p className="text-brand-text bg-cream-50/70 p-2.5 rounded-xl border border-brand-border leading-relaxed">
                {machinery.shortDescription || machinery.description}
              </p>
            </div>

            {/* Demo Video URL link */}
            <div>
              <span className="font-bold text-forest-900 block mb-1">Demo Video URL:</span>
              <div className="p-2.5 rounded-xl bg-forest-900 text-white flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-forest-200 truncate">
                  {machinery.demoVideoUrl || 'No video URL attached'}
                </span>
                {machinery.demoVideoUrl && (
                  <a
                    href={machinery.demoVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-harvest hover:text-white font-semibold flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Technical Description */}
        <div className="border-t border-brand-border pt-4">
          <h4 className="font-heading font-bold text-sm text-forest-900 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-harvest" />
            Full Technical Description
          </h4>
          <p className="text-xs text-brand-text leading-relaxed bg-cream-50/50 p-4 rounded-2xl border border-brand-border">
            {machinery.fullTechnicalDescription || machinery.description}
          </p>
        </div>

        {/* Technical Engineering Specifications Table */}
        {machinery.specifications && Object.keys(machinery.specifications).length > 0 && (
          <div className="border-t border-brand-border pt-4">
            <h4 className="font-heading font-bold text-sm text-forest-900 mb-2">
              Engineering & Operational Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(machinery.specifications).map(([key, value]) => (
                <div key={key} className="p-2.5 rounded-xl bg-cream-50 border border-brand-border">
                  <div className="text-[10px] text-brand-muted">{key}</div>
                  <div className="font-bold text-xs text-forest-900 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-border">
          {onAttachMedia ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAttachMedia(machinery);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-100 hover:bg-forest-200 text-forest-900 font-bold text-xs border border-forest-300 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-forest-700" />
              <span>Attach & Manage Media</span>
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs shadow-subtle"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
