import React from 'react';
import { Sale } from '../types';
import { formatNaira } from '../utils/format';
import { shareReceiptOnWhatsApp } from '../utils/receipt';
import { X, Printer, Share2, ShoppingCart, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, isOpen, onClose, onPrint }) => {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-4 border-b border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#12A84A] mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">TRUSTED SUPERMARKETCAL</h2>
          <p className="text-[11px] text-slate-500 font-medium">Asaba, Delta State, Nigeria</p>
          <p className="text-[10px] text-emerald-600 font-semibold italic">Shop Smart. Pay Less.</p>
        </div>

        {/* Receipt Metadata */}
        <div className="py-3 border-b border-dashed border-slate-200 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Receipt No:</span>
            <span className="font-mono font-bold text-slate-900">{sale.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date & Time:</span>
            <span className="font-medium text-slate-800">
              {new Date(sale.createdAt).toLocaleString('en-NG', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Salesperson:</span>
            <span className="font-semibold text-slate-800">
              {sale.salespersonName} ({sale.salespersonRole})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Pricing Mode:</span>
            <span className="font-bold text-[#12A84A] uppercase text-[10px]">
              {sale.pricingMode.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 border-b border-dashed border-slate-200 text-xs scrollbar-thin">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Items Purchased ({sale.items.length})
          </div>
          {sale.items.map((item, idx) => {
            const variation = [item.sizeLabel, item.colourName].filter(Boolean).join(' / ');
            return (
              <div key={idx} className="flex justify-between items-start gap-2 py-1">
                <div className="flex-1">
                  <div className="font-bold text-slate-900 leading-tight">{item.name}</div>
                  {variation && <div className="text-[10px] text-slate-500">{variation}</div>}
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.quantity} × {formatNaira(item.unitPrice)}
                  </div>
                </div>
                <div className="font-bold font-mono text-slate-900 text-right">
                  {formatNaira(item.lineTotal)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals Summary */}
        <div className="py-3 space-y-1.5 text-xs border-b border-dashed border-slate-200">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-bold">{formatNaira(sale.subtotal)}</span>
          </div>

          {sale.discountAmount > 0 && (
            <div className="flex justify-between text-amber-600 font-medium">
              <span>
                Discount ({sale.discountType === 'percentage' ? `${sale.discountValue}%` : 'Fixed'}):
              </span>
              <span className="font-mono font-bold">-{formatNaira(sale.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-extrabold text-[#12A84A] pt-1 border-t border-slate-100">
            <span>Grand Total:</span>
            <span className="font-mono">{formatNaira(sale.grandTotal)}</span>
          </div>

          <div className="flex justify-between text-slate-700 pt-1">
            <span>Amount Paid:</span>
            <span className="font-mono font-bold">{formatNaira(sale.amountPaid)}</span>
          </div>

          <div className="flex justify-between text-slate-700">
            <span>Change Returned:</span>
            <span className="font-mono font-bold text-emerald-600">{formatNaira(sale.change)}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center py-2 text-[10px] text-slate-400 italic">
          Thank you for shopping with us! Quality Products... Better Value...
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={() => shareReceiptOnWhatsApp(sale)}
            className="py-2.5 px-3 rounded-2xl bg-[#12A84A] hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp Receipt</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="py-2.5 px-3 rounded-2xl bg-[#071B3A] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const PrintableReceipt: React.FC<{ sale: Sale | null }> = ({ sale }) => {
  if (!sale) return null;

  return (
    <div id="printable-receipt" className="p-4 bg-white text-black font-mono text-xs max-w-[80mm] mx-auto">
      <div className="text-center font-bold text-sm mb-1">TRUSTED SUPERMARKETCAL</div>
      <div className="text-center text-[10px] mb-0.5">Asaba, Delta State, Nigeria</div>
      <div className="text-center text-[9px] mb-2">Shop Smart. Pay Less.</div>
      <div className="border-b border-black mb-2" />

      <div className="text-[10px] mb-1">Receipt: {sale.receiptNumber}</div>
      <div className="text-[10px] mb-1">Date: {new Date(sale.createdAt).toLocaleString('en-NG')}</div>
      <div className="text-[10px] mb-1">Staff: {sale.salespersonName} ({sale.salespersonRole})</div>
      <div className="text-[10px] mb-2">Pricing: {sale.pricingMode.toUpperCase()}</div>
      <div className="border-b border-black mb-2" />

      <div className="mb-2">
        {sale.items.map((i, idx) => (
          <div key={idx} className="mb-1 text-[11px]">
            <div>{i.name}</div>
            <div className="flex justify-between text-[10px]">
              <span>
                {i.quantity} x {formatNaira(i.unitPrice)}
              </span>
              <span>{formatNaira(i.lineTotal)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-b border-black mb-2" />

      <div className="space-y-0.5 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatNaira(sale.subtotal)}</span>
        </div>
        {sale.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{formatNaira(sale.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
          <span>Grand Total:</span>
          <span>{formatNaira(sale.grandTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Amount Paid:</span>
          <span>{formatNaira(sale.amountPaid)}</span>
        </div>
        <div className="flex justify-between">
          <span>Change:</span>
          <span>{formatNaira(sale.change)}</span>
        </div>
      </div>
      <div className="border-b border-black my-2" />

      <div className="text-center text-[10px] mt-2">
        Thank you for shopping with us!
        <br />
        Quality Products... Better Value...
      </div>
    </div>
  );
};
