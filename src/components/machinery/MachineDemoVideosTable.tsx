import React, { useState } from 'react';
import { MachineMedia, MachineOperationType } from '../../types';
import { machineMediaService } from '../../services/machineMediaService';
import { machineryService } from '../../services/machineryService';
import { useToast } from '../../context/ToastContext';
import {
  Film,
  Play,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Video,
  Layers,
  X,
  CheckCircle,
  Image as ImageIcon,
  Sparkles,
  Tractor
} from 'lucide-react';

interface MachineDemoVideosTableProps {
  machineIdFilter?: string; // Optional filter for a specific machine or centre
}

export const MachineDemoVideosTable: React.FC<MachineDemoVideosTableProps> = ({
  machineIdFilter
}) => {
  const { showToast } = useToast();
  const [mediaList, setMediaList] = useState<MachineMedia[]>(() =>
    machineMediaService.getAllMedia()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<string>('All');

  // Video Player Modal
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [currentPlayVideo, setCurrentPlayVideo] = useState<{ url: string; title: string } | null>(null);

  // Gallery Viewer Modal
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [activeGalleryItem, setActiveGalleryItem] = useState<{ name: string; images: string[] } | null>(null);

  // Add Media Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMachineId, setNewMachineId] = useState('');
  const [newGalleryUrls, setNewGalleryUrls] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const allMachines = machineryService.getAllMachinery();

  const refreshList = () => {
    setMediaList(machineMediaService.getAllMedia());
  };

  // Join media records with parent FarmMachinery by machineId
  const mediaWithParent = mediaList.map((m) => {
    const parent = allMachines.find((mach) => mach.id === m.machineId);
    return {
      ...m,
      machineName: parent?.name || m.machineName || `Machine ${m.machineId}`,
      operationType: parent?.operationType || m.operationType || 'Tillage',
      thumbnailUrl: parent?.thumbnailUrl || parent?.images?.[0] || m.thumbnailUrl
    };
  });

  const filteredMedia = mediaWithParent.filter((m) => {
    if (machineIdFilter && m.machineId !== machineIdFilter) return false;
    if (selectedOperation !== 'All' && m.operationType !== selectedOperation) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (m.id && m.id.toLowerCase().includes(q)) ||
        m.machineId.toLowerCase().includes(q) ||
        m.machineName.toLowerCase().includes(q) ||
        (m.videoTitle && m.videoTitle.toLowerCase().includes(q)) ||
        m.operationType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenPlay = (url: string, title: string) => {
    setCurrentPlayVideo({ url, title });
    setPlayerModalOpen(true);
  };

  const handleOpenGallery = (name: string, images: string[]) => {
    setActiveGalleryItem({ name, images });
    setGalleryModalOpen(true);
  };

  const handleDelete = (machineId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove media record for "${name}"?`)) {
      machineMediaService.deleteMedia(machineId);
      refreshList();
      showToast('Media Record Removed', `Removed media for ${name}.`, 'info');
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineId.trim() || !newVideoUrl.trim()) {
      showToast('Validation Error', 'Machine ID and Demo Video URL are required.', 'error');
      return;
    }

    const galleryArr = newGalleryUrls
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    machineMediaService.addMedia({
      machineId: newMachineId.trim(),
      galleryMediaUrls: galleryArr.length > 0 ? galleryArr : [
        'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80'
      ],
      videoTitle: newVideoTitle.trim() || 'Field Demonstration',
      demoVideoUrl: newVideoUrl.trim()
    });

    refreshList();
    setAddModalOpen(false);
    setNewMachineId('');
    setNewGalleryUrls('');
    setNewVideoTitle('');
    setNewVideoUrl('');
    showToast('Media Saved', 'Machine media and demo video saved successfully.', 'success');
  };

  const getOpBadge = (op: string) => {
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

  const selectedMachinePreview = allMachines.find((mach) => mach.id === newMachineId.trim());

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-cream-50 p-4 rounded-2xl border border-brand-border">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Machine ID, Name, Video Title..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-border bg-white text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          {/* Operation Filter */}
          <select
            value={selectedOperation}
            onChange={(e) => setSelectedOperation(e.target.value)}
            className="p-2 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-text focus:ring-2 focus:ring-forest-500 focus:outline-none"
          >
            <option value="All">All Operations ({mediaList.length})</option>
            <option value="Tillage">Tillage</option>
            <option value="Sowing">Sowing</option>
            <option value="Plant Protection">Plant Protection</option>
            <option value="Harvesting">Harvesting</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-subtle shrink-0 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4 text-harvest" />
          <span>Add Machine Media</span>
        </button>
      </div>

      {/* Separate Table: Machine Gallery Media & Demo Videos */}
      <div className="overflow-x-auto border border-brand-border rounded-2xl bg-white shadow-xs">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-forest-900 text-white uppercase text-[10px] tracking-wider border-b border-forest-800">
              <th className="py-3 px-3">Machine ID (Relational Key)</th>
              <th className="py-3 px-3">Machine Details</th>
              <th className="py-3 px-3">Operation Type</th>
              <th className="py-3 px-3">Gallery Media URLs</th>
              <th className="py-3 px-3">Demo Video Title & URL</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filteredMedia.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-brand-muted">
                  No media records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredMedia.map((m) => {
                const gallery = m.galleryMediaUrls || [];
                return (
                  <tr key={m.machineId} className="hover:bg-cream-50/70 transition-colors">
                    {/* Machine ID (Sole Relational Key) */}
                    <td className="py-3 px-3">
                      <span className="font-mono px-2 py-0.5 rounded bg-cream-100 text-forest-900 font-bold border border-brand-border">
                        {m.machineId}
                      </span>
                    </td>

                    {/* Machine Name & Thumbnail (joined via machineId) */}
                    <td className="py-3 px-3 font-bold text-forest-900 max-w-[180px]">
                      <div className="flex items-center gap-2">
                        {m.thumbnailUrl && (
                          <img
                            src={m.thumbnailUrl}
                            alt={m.machineName}
                            className="w-8 h-8 rounded-lg object-cover border border-brand-border shrink-0"
                          />
                        )}
                        <span className="truncate">{m.machineName}</span>
                      </div>
                    </td>

                    {/* Operation Type (joined via machineId) */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getOpBadge(m.operationType)}`}>
                        {m.operationType}
                      </span>
                    </td>

                    {/* Gallery Media URLs */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {gallery.slice(0, 2).map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleOpenGallery(m.machineName, gallery)}
                            className="w-7 h-7 rounded-md overflow-hidden border border-brand-border hover:scale-105 transition-transform"
                            title="Preview gallery"
                          >
                            <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                        {gallery.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenGallery(m.machineName, gallery)}
                            className="px-1.5 py-0.5 rounded bg-cream-100 hover:bg-cream-200 border border-brand-border text-[10px] font-bold text-forest-800"
                          >
                            +{gallery.length} Media
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Demo Video Title & URL */}
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-semibold text-brand-text block max-w-[190px] truncate" title={m.videoTitle}>
                          {m.videoTitle || 'Technical Demonstration'}
                        </span>
                        {m.demoVideoUrl ? (
                          <a
                            href={m.demoVideoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[10px] text-teal-700 hover:text-teal-900 underline truncate max-w-[140px] block mt-0.5"
                            title={m.demoVideoUrl}
                          >
                            {m.demoVideoUrl}
                          </a>
                        ) : (
                          <span className="text-[10px] text-brand-muted">No URL</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {m.demoVideoUrl && (
                          <button
                            type="button"
                            onClick={() => handleOpenPlay(m.demoVideoUrl, m.videoTitle || m.machineName)}
                            className="p-1.5 rounded-lg bg-forest-100 hover:bg-forest-200 text-forest-900 font-bold transition-colors"
                            title="Watch demo video"
                          >
                            <Play className="w-3.5 h-3.5 fill-current text-forest-800" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(m.machineId, m.machineName)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete media record"
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

      {/* Video Player Modal */}
      {playerModalOpen && currentPlayVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-forest-950 rounded-3xl border border-forest-800 max-w-2xl w-full p-5 space-y-3 text-white shadow-elevation">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-harvest" />
                <h4 className="font-heading font-bold text-sm text-white truncate max-w-[420px]">
                  {currentPlayVideo.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPlayerModalOpen(false)}
                className="text-forest-300 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-forest-800">
              <iframe
                src={currentPlayVideo.url}
                title={currentPlayVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-forest-300 pt-1">
              <span>Source URL: <code className="font-mono text-white text-[11px]">{currentPlayVideo.url}</code></span>
              <a
                href={currentPlayVideo.url}
                target="_blank"
                rel="noreferrer"
                className="text-harvest hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Viewer Modal */}
      {galleryModalOpen && activeGalleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-brand-border max-w-2xl w-full p-6 space-y-4 shadow-elevation max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-harvest bg-forest-900 px-2 py-0.5 rounded">
                  Gallery Media URLs
                </span>
                <h3 className="font-heading font-bold text-base text-forest-900 mt-1">
                  {activeGalleryItem.name}
                </h3>
              </div>
              <button
                onClick={() => setGalleryModalOpen(false)}
                className="text-brand-muted hover:text-forest-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {activeGalleryItem.images.map((imgUrl, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-brand-border aspect-video group relative bg-cream-100">
                  <img src={imgUrl} alt={`Media ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <a
                    href={imgUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 px-2 py-1 bg-forest-900/80 text-white rounded text-[10px] font-mono flex items-center gap-1"
                  >
                    <span>View Full</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Media Record Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-md w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-harvest bg-forest-900 px-2 py-0.5 rounded">
                  Media Registry
                </span>
                <h3 className="font-heading font-bold text-base text-forest-900 mt-1">
                  Add Media & Demo Video Record
                </h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-brand-muted hover:text-forest-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-brand-text mb-1">
                  Select Machine (Linked by Machine ID) *
                </label>
                <select
                  required
                  value={newMachineId}
                  onChange={(e) => setNewMachineId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs font-semibold focus:ring-2 focus:ring-forest-500 focus:outline-none"
                >
                  <option value="">-- Choose Machine ID --</option>
                  {allMachines.map((mach) => (
                    <option key={mach.id} value={mach.id}>
                      {mach.id} — {mach.name} ({mach.operationType})
                    </option>
                  ))}
                </select>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] text-brand-muted">Or enter custom ID:</span>
                  <input
                    type="text"
                    value={newMachineId}
                    onChange={(e) => setNewMachineId(e.target.value)}
                    placeholder="e.g. mach_111"
                    className="flex-1 p-1.5 rounded-lg border border-brand-border bg-cream-50 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Machine Relationship Preview */}
              {selectedMachinePreview && (
                <div className="p-2.5 rounded-xl bg-forest-50/70 border border-forest-200 flex items-center gap-2.5">
                  <img
                    src={selectedMachinePreview.thumbnailUrl || selectedMachinePreview.images?.[0]}
                    alt={selectedMachinePreview.name}
                    className="w-9 h-9 rounded-lg object-cover border border-forest-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-forest-900 text-xs block truncate">
                      {selectedMachinePreview.name}
                    </span>
                    <span className="text-[10px] text-brand-muted flex items-center gap-1.5">
                      <span className="font-mono">{selectedMachinePreview.id}</span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.2 rounded font-semibold ${getOpBadge(selectedMachinePreview.operationType)}`}>
                        {selectedMachinePreview.operationType}
                      </span>
                    </span>
                  </div>
                </div>
              )}

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
                <label className="block font-semibold text-brand-text mb-1">Demo Video Title</label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="e.g. Field Operation & Soil Pulverization Demo"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-text mb-1">Demo Video URL *</label>
                <input
                  type="url"
                  required
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-cream-50 font-mono text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border font-semibold text-brand-text hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold shadow-subtle"
                >
                  Save Media Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
