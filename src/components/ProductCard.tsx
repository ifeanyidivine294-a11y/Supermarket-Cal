import React, { useState } from 'react';
import { Product, PricingMode, ProductSize, ProductColour } from '../types';
import { formatNaira } from '../utils/format';
import { Plus, Check, Layers, AlertCircle } from 'lucide-react';
import { VariationModal } from './VariationModal';

interface ProductCardProps {
  product: Product;
  pricingMode: PricingMode;
  onAddToCart: (product: Product, size?: ProductSize, colour?: ProductColour, quantity?: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, pricingMode, onAddToCart }) => {
  const [isVariationOpen, setIsVariationOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const hasSizes = product.pricingType === 'sizes' && product.sizes.length > 0;
  const hasColours = product.colours && product.colours.length > 0;
  const requiresVariationModal = hasSizes || hasColours;

  // Compute displayed price
  const displayPrice = hasSizes
    ? pricingMode === 'retail'
      ? product.sizes[0].retailPrice
      : product.sizes[0].smallBusinessPrice
    : pricingMode === 'retail'
    ? product.retailPrice
    : product.smallBusinessPrice;

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;

  const handleCardClick = () => {
    if (isOutOfStock) return;
    if (requiresVariationModal) {
      setIsVariationOpen(true);
    } else {
      onAddToCart(product);
      triggerAddedAnimation();
    }
  };

  const triggerAddedAnimation = () => {
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
        {/* Stock Alert Badge */}
        {isOutOfStock ? (
          <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">
            Out of stock
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>Low: {product.stockQuantity}</span>
          </div>
        ) : null}

        {/* Product Image */}
        <div className="relative w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center mb-3 group-hover:scale-[1.02] transition-transform">
          <img
            src={product.imageURL}
            alt={product.name}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
            }}
          />

          {/* Variations Pills Overlay */}
          {hasSizes && (
            <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" />
              <span>{product.sizes.length} sizes</span>
            </div>
          )}

          {hasColours && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 p-1 rounded-md shadow-xs backdrop-blur-xs">
              {product.colours.slice(0, 4).map((c) => (
                <span
                  key={c.id}
                  className="w-2.5 h-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-2 mb-1 min-h-[2rem]">
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-base sm:text-lg font-extrabold text-[#12A84A] leading-tight">
                {formatNaira(displayPrice)}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {pricingMode.replace('_', ' ')}
                {hasSizes && ' (from)'}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Qty: {product.stockQuantity}
            </div>
          </div>
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={handleCardClick}
          disabled={isOutOfStock}
          className={`w-full py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : justAdded
              ? 'bg-[#12A84A] text-white scale-98 ring-2 ring-emerald-400'
              : 'bg-[#12A84A] hover:bg-emerald-600 active:scale-95 text-white shadow-emerald-700/20'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <span>Add</span>
              <Plus className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Variation Modal */}
      {requiresVariationModal && (
        <VariationModal
          product={product}
          pricingMode={pricingMode}
          isOpen={isVariationOpen}
          onClose={() => setIsVariationOpen(false)}
          onConfirm={(size, colour, quantity) => {
            onAddToCart(product, size, colour, quantity);
            triggerAddedAnimation();
          }}
        />
      )}
    </>
  );
};
