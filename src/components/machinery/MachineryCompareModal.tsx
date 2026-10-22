import React from 'react';
import { FarmMachinery } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { X, Check, Minus } from 'lucide-react';

interface MachineryCompareModalProps {
  machineryList: FarmMachinery[];
  isOpen: boolean;
  onClose: () => void;
  onSelectBooking: (item: FarmMachinery) => void;
}

export const MachineryCompareModal: React.FC<MachineryCompareModalProps> = ({
  machineryList,
  isOpen,
  onClose,
  onSelectBooking
}) => {
  if (!isOpen || machineryList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-elevation border border-brand-border max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border bg-forest-50/70 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-forest-900">
              Farm Equipment Side-by-Side Comparison
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Evaluating {machineryList.length} equipment options for field performance & rental economics
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-brand-muted hover:text-brand-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-x-auto text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="p-3 text-left font-semibold text-brand-muted w-1/4">Specification</th>
                {machineryList.map(m => (
                  <th key={m.id} className="p-3 text-left font-bold text-forest-900 w-1/3">
                    <img
                      src={m.thumbnailUrl || m.images?.[0] || ''}
                      alt={m.name}
                      className="w-full h-28 object-cover rounded-xl mb-2 border border-brand-border"
                    />
                    <div className="text-sm font-heading">{m.name}</div>
                    <div className="text-[11px] text-brand-muted font-normal">{m.centreName}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              <tr>
                <td className="p-3 font-semibold text-brand-muted bg-cream-50/50">Rental Rate</td>
                {machineryList.map(m => (
                  <td key={m.id} className="p-3 font-extrabold text-forest-700 text-sm">
                    {formatCurrency(m.pricePerUnit)} <span className="text-xs text-brand-muted font-normal">/ {m.pricingUnit}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-brand-muted bg-cream-50/50">Category</td>
                {machineryList.map(m => (
                  <td key={m.id} className="p-3 text-brand-text">{m.category}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-brand-muted bg-cream-50/50">Horsepower / Capacity</td>
                {machineryList.map(m => (
                  <td key={m.id} className="p-3 text-brand-text">
                    {m.horsepower ? `${m.horsepower} HP` : m.capacity || 'Standard'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-brand-muted bg-cream-50/50">Centre Operator Included</td>
                {machineryList.map(m => (
                  <td key={m.id} className="p-3">
                    {m.operatorProvided ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <Check className="w-4 h-4" /> Yes (Trained Driver)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-brand-muted">
                        <Minus className="w-4 h-4" /> Self-Operated
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-brand-muted bg-cream-50/50">Fuel Terms</td>
                {machineryList.map(m => (
                  <td key={m.id} className="p-3 text-brand-text">{m.fuelType}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-brand-muted bg-cream-50/50">Security Deposit</td>
                {machineryList.map(m => (
                  <td key={m.id} className="p-3 text-brand-text">
                    {formatCurrency(m.securityDeposit || 1000)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-brand-muted bg-cream-50/50">Action</td>
                {machineryList.map(m => (
                  <td key={m.id} className="p-3">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectBooking(m);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs shadow-subtle transition-colors"
                    >
                      Book This Machine
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
