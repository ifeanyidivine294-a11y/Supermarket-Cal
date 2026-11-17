import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatNaira } from '../utils/format';
import { shareReceiptOnWhatsApp } from '../utils/receipt';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Share2,
  ArrowRight,
  Loader2,
  XCircle,
} from 'lucide-react';

interface CartPanelProps {
  onPrintReceipt: () => void;
  onOpenReceiptModal: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onPrintReceipt, onOpenReceiptModal }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    grandTotal,
    amountPaid,
    setAmountPaid,
    change,
    isPaymentValid,
    completeSale,
    isCheckingOut,
    checkoutError,
    lastSale,
  } = useApp();

  const [localPaidInput, setLocalPaidInput] = useState<string>(amountPaid > 0 ? String(amountPaid) : '');

  const handlePaidChange = (val: string) => {
    setLocalPaidInput(val);
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    setAmountPaid(isNaN(num) ? 0 : num);
  };

  const handleQuickCash = (addition: number) => {
    const current = amountPaid || 0;
    const newVal = current + addition;
    setAmountPaid(newVal);
    setLocalPaidInput(String(newVal));
  };

  const handleExactCash = () => {
    setAmountPaid(grandTotal);
    setLocalPaidInput(String(grandTotal));
  };

  const handleCheckout = async () => {
    try {
      await completeSale();
      setLocalPaidInput('');
      onOpenReceiptModal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-md flex flex-col h-full justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                Current Cart
              </h2>
              <div className="text-[10px] text-slate-400 font-medium">
                {cart.length} unique {cart.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Clear Sale
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="overflow-y-auto max-h-[300px] sm:max-h-[360px] pr-1 space-y-2.5 scrollbar-thin">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-2.5 text-slate-300">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <p className="text-xs font-semibold text-slate-500">Your cart is currently empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any product to add it to this sale
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const variationText = [item.selectedSize?.label, item.selectedColour?.name]
                .filter(Boolean)
                .join(' / ');

              return (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                    <img
                      src={item.imageURL}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                    {variationText && (
                      <span className="text-[10px] text-slate-500 font-medium block truncate">
                        {variationText}
                      </span>
                    )}
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {formatNaira(item.unitPrice)} × {item.quantity} ={' '}
                      <span className="font-bold text-[#12A84A]">{formatNaira(item.lineTotal)}</span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                      className="text-slate-500 hover:text-slate-800 p-0.5 transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-slate-900 min-w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                      className="text-slate-500 hover:text-slate-800 p-0.5 transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cart Summary & Checkout */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">Subtotal:</span>
          <span className="text-sm font-bold text-slate-900 font-mono">{formatNaira(subtotal)}</span>
        </div>

        {/* Discount Row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-600 font-medium">Discount:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max={discountType === 'percentage' ? 100 : subtotal}
              value={discountValue === 0 ? '' : discountValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setDiscountValue(isNaN(val) ? 0 : val);
                if (discountType === 'none') setDiscountType('percentage');
              }}
              placeholder="0"
              className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setDiscountType('percentage')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  discountType === 'percentage' ? 'bg-[#12A84A] text-white' : 'text-slate-600'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('fixed')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  discountType === 'fixed' ? 'bg-[#12A84A] text-white' : 'text-slate-600'
                }`}
              >
                ₦
              </button>
            </div>
          </div>
        </div>

        {/* Grand Total Box (Matching Green Mockup Highlight) */}
        <div className="bg-[#12A84A] rounded-2xl p-3 sm:p-3.5 text-white flex items-center justify-between shadow-lg shadow-emerald-700/20">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">Grand Total:</span>
          <span className="text-xl sm:text-2xl font-black font-mono tracking-tight">
            {formatNaira(grandTotal)}
          </span>
        </div>

        {/* Amount Paid Field & Quick Cash Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Amount Paid:</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleExactCash}
                disabled={cart.length === 0}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Exact
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(1000)}
                disabled={cart.length === 0}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                +₦1k
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(5000)}
                disabled={cart.length === 0}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                +₦5k
              </button>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              ₦
            </span>
            <input
              type="text"
              value={localPaidInput}
              onChange={(e) => handlePaidChange(e.target.value)}
              placeholder={grandTotal > 0 ? String(grandTotal) : '0'}
              disabled={cart.length === 0}
              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#12A84A]"
            />
          </div>
        </div>

        {/* Change Banner (Green Checkmark from mockup) */}
        {cart.length > 0 && amountPaid > 0 && (
          <div>
            {isPaymentValid ? (
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#12A84A]" />
                <span>Change: {formatNaira(change)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Underpaid by {formatNaira(grandTotal - amountPaid)}</span>
              </div>
            )}
          </div>
        )}

        {/* Checkout Error Alert */}
        {checkoutError && (
          <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="text-[11px] leading-tight">{checkoutError}</span>
          </div>
        )}

        {/* Action Buttons: Share Receipt & Print */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              if (lastSale) {
                shareReceiptOnWhatsApp(lastSale);
              } else if (cart.length > 0) {
                alert('Please complete the sale first to generate and share the official receipt.');
              }
            }}
            disabled={!lastSale && cart.length === 0}
            className="py-2.5 px-3 rounded-2xl bg-[#1769E0] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Receipt</span>
          </button>

          <button
            type="button"
            onClick={onPrintReceipt}
            disabled={!lastSale && cart.length === 0}
            className="py-2.5 px-3 rounded-2xl bg-[#071B3A] hover:bg-slate-800 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print</span>
          </button>
        </div>

        {/* COMPLETE SALE Button */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={cart.length === 0 || !isPaymentValid || isCheckingOut}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#12A84A] to-[#0D873A] hover:from-emerald-600 hover:to-emerald-700 active:scale-98 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-800/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Recording Transaction...</span>
            </>
          ) : (
            <>
              <span>COMPLETE SALE</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
