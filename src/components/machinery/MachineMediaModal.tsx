import React, { useState, useEffect } from 'react';
import { FarmMachinery, MachineOperationType } from '../../types';
import { machineMediaService } from '../../services/machineMediaService';
import { machineryService } from '../../services/machineryService';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Plus,
  Trash2,
  Play,
  Video,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface MachineMediaModalProps {
  machine: FarmMachinery | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&auto=format&fit=crop&q=80'
];

export const MachineMediaModal: React.FC<MachineMediaModalProps> = ({
  machine,
  isOpen,
  onClose,
  onSaved
}) => {
  const { showToast } = useToast();

  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newPhotoInput, setNewPhotoInput] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [previewVideo, setPreviewVideo] = useState(false);

  // Sync state when machine prop changes
  useEffect(() => {
    if (machine) {
      const existingMedia = machineMediaService.getMediaByMachineId(machine.id);
      if (existingMedia) {
        setGalleryUrls(existingMedia.galleryMediaUrls || []);
        setDemoVideoUrl(existingMedia.demoVideoUrl || '');
        setVideoTitle(existingMedia.videoTitle || `${machine.name} Field Demo`);
      } else {
        setGalleryUrls(machine.galleryMediaUrls || (machine.thumbnailUrl ? [machine.thumbnailUrl] : []));
        setDemoVideoUrl(machine.demoVideoUrl || '');
        setVideoTitle(`${machine.name} Field Demo`);
      }
      setPreviewVideo(false);
      setNewPhotoInput('');
    }
  }, [machine, isOpen]);

  if (!isOpen || !machine) return null;

  const handleAddPhoto = () => {
    const trimmed = newPhotoInput.trim();
    if (!trimmed) return;
    if (galleryUrls.includes(trimmed)) {
      showToast('Photo Exists', 'This photo URL is already attached.', 'info');
      return;
    }
    setGalleryUrls([...galleryUrls, trimmed]);
    setNewPhotoInput('');
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setGalleryUrls(galleryUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddPresetPhoto = (url: string) => {
    if (!galleryUrls.includes(url)) {
      setGalleryUrls([...galleryUrls, url]);
      showToast('Photo Added', 'Preset field photo added to gallery.', 'success');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save media into machine_media.json via machineMediaService using machine.id
    machineMediaService.addMedia({
      machineId: machine.id,
      galleryMediaUrls: galleryUrls,
      demoVideoUrl: demoVideoUrl.trim(),
      videoTitle: videoTitle.trim() || `${machine.name} Field Demo`
    });

    // 2. Sync with machineryService
    machineryService.updateMachinery(machine.id, {
      galleryMediaUrls: galleryUrls,
      demoVideoUrl: demoVideoUrl.trim()
    });

    showToast('Media Attached', `Media successfully attached to ${machine.name} (${machine.id}).`, 'success');
    if (onSaved) onSaved();
    onClose();
  };

  const getOpBadge = (op?: MachineOperationType | string) => {
    switch (op) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-2xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-brand-border pb-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-forest-900 text-white font-bold">
                {machine.id}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getOpBadge(machine.operationType)}`}>
                {machine.operationType || 'Tillage'}
              </span>
              <span className="text-[11px] text-brand-muted font-medium">
                {machine.centreName}
              </span>
            </div>
            <h3 className="font-heading font-extrabold text-base text-forest-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-forest-700" />
              <span>Attach & Manage Machine Media</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-brand-muted hover:text-forest-900 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Machine Context Card */}
        <div className="p-3.5 bg-cream-50 rounded-2xl border border-brand-border flex items-center gap-3">
          <img
            src={machine.thumbnailUrl || (machine.images && machine.images[0])}
            alt={machine.name}
            className="w-14 h-14 rounded-xl object-cover border border-brand-border shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="font-heading font-bold text-sm text-forest-900 truncate">
              {machine.name}
            </div>
            <div className="text-xs text-brand-muted truncate">
              {machine.category} • {machine.model}
            </div>
            <div className="text-[11px] text-brand-muted line-clamp-1 mt-0.5">
              {machine.shortDescription || machine.description}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Section 1: Gallery Media Photos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-heading font-bold text-xs text-forest-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-forest-700" />
                <span>Gallery Media URLs ({galleryUrls.length} Photos)</span>
              </label>
              <span className="text-[11px] text-brand-muted">
                Attached directly to Machine ID <span className="font-mono font-semibold">{machine.id}</span>
              </span>
            </div>

            {/* Attached Photos Grid */}
            {galleryUrls.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-brand-border text-center text-brand-muted bg-white">
                No gallery photos attached yet. Add photo URLs below.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {galleryUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-brand-border bg-white shadow-xs aspect-video"
                  >
                    <img
                      src={url}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-lg bg-white/90 text-forest-900 hover:bg-white"
                        title="View photo full size"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add Photo Input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newPhotoInput}
                onChange={(e) => setNewPhotoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhoto();
                  }
                }}
                placeholder="Paste Image URL (https://...)"
                className="flex-1 p-2.5 rounded-xl border border-brand-border bg-white text-xs font-mono focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-3.5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-brand-muted font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-harvest" /> Sample presets:
              </span>
              {SAMPLE_PHOTO_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddPresetPhoto(preset)}
                  className="px-2 py-0.5 rounded-lg border border-brand-border bg-cream-50 hover:bg-cream-100 text-[10px] font-semibold text-brand-text transition-colors"
                >
                  Photo {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Demo Video */}
          <div className="space-y-3 pt-3 border-t border-brand-border">
            <div className="flex items-center justify-between">
              <label className="font-heading font-bold text-xs text-forest-900 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-forest-700" />
                <span>Demo Video URL & Demonstration Title</span>
              </label>
              {demoVideoUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewVideo(!previewVideo)}
                  className="text-[11px] font-bold text-forest-700 hover:text-forest-900 underline flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{previewVideo ? 'Hide Player' : 'Preview Video'}</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-brand-muted mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Field Operation & Dual-Clutch Tillage Demo"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-brand-muted mb-1">
                  Demo Video Embed URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={demoVideoUrl}
                    onChange={(e) => setDemoVideoUrl(e.target.value)}
                    placeholder="https://www.youtube-nocookie.com/embed/..."
                    className="flex-1 p-2.5 rounded-xl border border-brand-border bg-white font-mono text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setDemoVideoUrl('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')}
                    className="px-2.5 py-1.5 rounded-xl border border-brand-border bg-cream-50 hover:bg-cream-100 text-[10px] font-semibold text-brand-text shrink-0"
                  >
                    Use Sample Demo
                  </button>
                </div>
              </div>
            </div>

            {/* Video Player Preview */}
            {previewVideo && demoVideoUrl && (
              <div className="rounded-2xl overflow-hidden border border-brand-border aspect-video bg-black shadow-card">
                <iframe
                  src={demoVideoUrl}
                  title="Demo Video Preview"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-brand-border">
            <div className="text-[11px] text-brand-muted">
              Auto-links media to Machine ID <span className="font-mono font-bold text-forest-900">{machine.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-brand-border font-semibold text-brand-text hover:bg-cream-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-heading font-bold shadow-subtle transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-harvest" />
                <span>Save Machine Media</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
