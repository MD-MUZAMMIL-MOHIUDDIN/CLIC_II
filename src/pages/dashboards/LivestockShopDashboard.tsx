import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { livestockService } from '../../services/livestockService';
import { useToast } from '../../context/ToastContext';
import { LivestockProduct } from '../../types';
import { formatCurrency } from '../../lib/utils';
import {
  ShoppingBag,
  Plus,
  CheckCircle,
  FileCheck,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export const LivestockShopDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState<LivestockProduct[]>(() =>
    livestockService.getAllProducts().slice(0, 3)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-800 text-white flex items-center justify-center font-bold shadow-subtle shrink-0">
            <ShoppingBag className="w-8 h-8 text-harvest" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                Livestock & Feed Portal
              </span>
              <span className="text-xs text-brand-muted">
                Karnal Hub • Haryana
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest-900 mt-1">
              Gopalak Dairy & Livestock Breed Center
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Certified Murrah Buffalo Breeding, Bypass Feed & Mineral Blocks Supplier
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Active Listings</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">{products.length} Items</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Live Animal Inquiries</div>
          <div className="text-2xl font-heading font-extrabold text-amber-700 mt-1">12 Enquiries</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Feed Bags Dispatched</div>
          <div className="text-2xl font-heading font-extrabold text-forest-900 mt-1">340 Bags</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-subtle">
          <div className="text-xs text-brand-muted">Breeder Health Rating</div>
          <div className="text-2xl font-heading font-extrabold text-emerald-700 mt-1">4.9 / 5.0</div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-4">
        <h3 className="font-heading font-bold text-lg text-forest-900">
          Managed Livestock & Product Inventory
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">Listing Name</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Selling Price</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2">Health Certificate</th>
                <th className="py-3 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-cream-50/50">
                  <td className="py-3.5 px-2 font-bold text-forest-900 flex items-center gap-2">
                    <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-lg object-cover" />
                    <span>{p.name}</span>
                  </td>
                  <td className="py-3.5 px-2 text-brand-text">{p.category}</td>
                  <td className="py-3.5 px-2 font-bold text-forest-800">
                    {formatCurrency(p.price)} {p.priceUnit}
                  </td>
                  <td className="py-3.5 px-2 text-brand-muted">
                    {p.isLiveAnimal ? 'Live Animal' : 'Feed / Equipment'}
                  </td>
                  <td className="py-3.5 px-2">
                    {p.animalDetails?.healthCertificateAvailable ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" /> NDDB Certified
                      </span>
                    ) : (
                      <span className="text-brand-muted">N/A (Product)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800">
                      {p.stockStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
