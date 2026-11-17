import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sale } from '../types';
import { formatNaira } from '../utils/format';
import { shareReceiptOnWhatsApp } from '../utils/receipt';
import { Search, Share2, Eye, Receipt, Calendar, Clock } from 'lucide-react';

interface SalespersonHistoryProps {
  onSelectSale: (sale: Sale) => void;
}

export const SalespersonHistory: React.FC<SalespersonHistoryProps> = ({ onSelectSale }) => {
  const { sales, profile } = useApp();
  const [search, setSearch] = useState('');

  // Filter staff's own sales by receipt or item name
  const filteredSales = sales.filter((s) => {
    const q = search.toLowerCase();
    const matchesReceipt = s.receiptNumber.toLowerCase().includes(q);
    const matchesItem = s.items.some((i) => i.name.toLowerCase().includes(q));
    return matchesReceipt || matchesItem;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-[#071B3A]">My Sales Register History</h1>
          <p className="text-xs text-slate-500">
            Audit log of your completed customer transactions. You can re-open or share past receipts via WhatsApp.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt # or product..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#12A84A] focus:outline-none"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Pricing Mode</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <div>No completed sales found.</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Completed checkout baskets will appear here automatically.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.saleId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {sale.receiptNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(sale.createdAt).toLocaleString('en-NG', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {sale.pricingMode.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {sale.items.reduce((acc, i) => acc + i.quantity, 0)} units ({sale.items.length} lines)
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#12A84A] font-mono text-sm">
                      {formatNaira(sale.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectSale(sale)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => shareReceiptOnWhatsApp(sale)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#12A84A] font-bold text-[11px] flex items-center gap-1"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
