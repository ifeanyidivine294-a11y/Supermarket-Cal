import React, { useState } from 'react';
import { Product, ProductSize, ProductColour, PricingMode } from '../types';
import { formatNaira } from '../utils/format';
import { X, Check, Plus, Minus } from 'lucide-react';

interface VariationModalProps {
  product: Product;
  pricingMode: PricingMode;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (size?: ProductSize, colour?: ProductColour, quantity?: number) => void;
}

export const VariationModal: React.FC<VariationModalProps> = ({
  product,
  pricingMode,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const hasSizes = product.pricingType === 'sizes' && product.sizes.length > 0;
  const hasColours = product.colours && product.colours.length > 0;

  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    hasSizes ? product.sizes[0] : undefined
  );
  const [selectedColour, setSelectedColour] = useState<ProductColour | undefined>(
    hasColours ? product.colours[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);

  // Calculate current unit price based on selected size or base product
  const unitPrice = selectedSize
    ? pricingMode === 'retail'
      ? selectedSize.retailPrice
      : selectedSize.smallBusinessPrice
    : pricingMode === 'retail'
    ? product.retailPrice
    : product.smallBusinessPrice;

  const lineTotal = unitPrice * quantity;

  const handleAdd = () => {
    onConfirm(selectedSize, selectedColour, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Info */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={product.imageURL}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-snug mt-1">{product.name}</h3>
            <div className="text-xs text-slate-500 font-medium">
              Mode: <span className="font-semibold text-slate-700 capitalize">{pricingMode.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Size Selection */}
        {hasSizes && (
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Size / Packaging <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {product.sizes.map((size) => {
                const isSelected = selectedSize?.id === size.id;
                const sizePrice =
                  pricingMode === 'retail' ? size.retailPrice : size.smallBusinessPrice;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'border-[#12A84A] bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{size.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#12A84A]" />}
                    </div>
                    <div className="text-sm font-extrabold text-[#12A84A] mt-1">
                      {formatNaira(sizePrice)}
                    </div>
                    <div className="text-[10px] text-slate-400">Stock: {size.stockQuantity}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Colour Selection */}
        {hasColours && (
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Colour Variation
            </label>
            <div className="flex flex-wrap gap-2.5">
              {product.colours.map((col) => {
                const isSelected = selectedColour?.id === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColour(col)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Stepper */}
        <div className="mb-6 flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <div className="text-xs font-bold text-slate-700">Quantity</div>
            <div className="text-xs text-slate-400">Unit: {formatNaira(unitPrice)}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-extrabold text-slate-900 min-w-8 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer & Add Button */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Total Price:</div>
            <div className="text-xl font-extrabold text-[#12A84A] leading-tight">
              {formatNaira(lineTotal)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-3 px-5 rounded-2xl bg-[#12A84A] hover:bg-emerald-600 active:scale-98 text-white font-bold text-sm shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
