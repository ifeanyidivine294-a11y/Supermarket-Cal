import React, { useState } from 'react';
import { Product, ProductCategory, ALL_CATEGORIES, ProductSize, ProductColour } from '../types';
import { useApp } from '../context/AppContext';
import { X, Plus, Trash2, Image, Layers, Palette } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct } = useApp();

  const [name, setName] = useState(productToEdit?.name || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [category, setCategory] = useState<ProductCategory>(
    productToEdit?.category || 'Beverages and Drinks'
  );
  const [imageURL, setImageURL] = useState(
    productToEdit?.imageURL ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'
  );
  const [pricingType, setPricingType] = useState<'original' | 'sizes'>(
    productToEdit?.pricingType || 'original'
  );

  const [retailPrice, setRetailPrice] = useState<number>(productToEdit?.retailPrice || 500);
  const [smallBusinessPrice, setSmallBusinessPrice] = useState<number>(
    productToEdit?.smallBusinessPrice || 450
  );
  const [stockQuantity, setStockQuantity] = useState<number>(productToEdit?.stockQuantity || 50);

  // Sizes
  const [sizes, setSizes] = useState<ProductSize[]>(
    productToEdit?.sizes || [
      { id: 'sz_1', label: 'Small', retailPrice: 500, smallBusinessPrice: 450, stockQuantity: 25 },
      { id: 'sz_2', label: 'Large', retailPrice: 900, smallBusinessPrice: 800, stockQuantity: 25 },
    ]
  );

  // Colours
  const [colours, setColours] = useState<ProductColour[]>(productToEdit?.colours || []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddSize = () => {
    const id = `sz_${Date.now()}`;
    setSizes([
      ...sizes,
      {
        id,
        label: '1kg',
        retailPrice: 1000,
        smallBusinessPrice: 900,
        stockQuantity: 20,
      },
    ]);
  };

  const handleRemoveSize = (id: string) => {
    setSizes(sizes.filter((s) => s.id !== id));
  };

  const handleUpdateSize = (id: string, field: keyof ProductSize, val: any) => {
    setSizes(sizes.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const handleAddColour = () => {
    const id = `col_${Date.now()}`;
    setColours([
      ...colours,
      {
        id,
        name: 'Blue',
        hex: '#2563EB',
        stockQuantity: 20,
      },
    ]);
  };

  const handleRemoveColour = (id: string) => {
    setColours(colours.filter((c) => c.id !== id));
  };

  const handleUpdateColour = (id: string, field: keyof ProductColour, val: any) => {
    setColours(colours.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter a product name');

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        imageURL: imageURL.trim(),
        pricingType,
        sizes: pricingType === 'sizes' ? sizes : [],
        colours,
        retailPrice: Number(retailPrice),
        smallBusinessPrice: Number(smallBusinessPrice),
        stockQuantity:
          pricingType === 'sizes'
            ? sizes.reduce((sum, s) => sum + s.stockQuantity, 0)
            : Number(stockQuantity),
        active: true,
      };

      if (productToEdit) {
        await updateProduct(productToEdit.productId, payload);
      } else {
        await addProduct(payload);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-[#071B3A] mb-1">
          {productToEdit ? 'Edit Product' : 'Add New Supermarket Product'}
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Changes are instantly synced with all active sales registers across Trusted SupermarketCal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Coca-Cola 50cl"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#12A84A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#12A84A] focus:outline-none bg-white"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Photograph URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#12A84A] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={imageURL}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400">Live Image Preview</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Description / Packaging Details
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Parboiled stone-free rice with natural taste"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#12A84A] focus:outline-none"
            />
          </div>

          {/* Pricing Structure Type */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pricing Structure Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPricingType('original')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  pricingType === 'original'
                    ? 'border-[#12A84A] bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center mt-0.5 shrink-0">
                  {pricingType === 'original' && <div className="w-2 h-2 rounded-full bg-[#12A84A]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Type 1: Original</div>
                  <div className="text-[11px] text-slate-500">Single price without size variations</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPricingType('sizes')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  pricingType === 'sizes'
                    ? 'border-[#12A84A] bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center mt-0.5 shrink-0">
                  {pricingType === 'sizes' && <div className="w-2 h-2 rounded-full bg-[#12A84A]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Type 2: Sizes / Variations</div>
                  <div className="text-[11px] text-slate-500">Multiple sizes (e.g. 1kg, 5kg, 10kg, 25kg)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Type 1 Pricing Fields */}
          {pricingType === 'original' ? (
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Retail Price (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Small-Business Price (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={smallBusinessPrice}
                  onChange={(e) => setSmallBusinessPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Stock Units <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* Type 2 Size Variations Manager */
            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Custom Sizes & Pricing
                </span>
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-2.5 py-1 rounded-lg bg-[#12A84A] text-white text-[11px] font-bold hover:bg-emerald-600 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Size
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sizes.map((s, idx) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-5 gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <div>
                      <input
                        type="text"
                        value={s.label}
                        onChange={(e) => handleUpdateSize(s.id, 'label', e.target.value)}
                        placeholder="Label (e.g. 5kg)"
                        className="w-full px-2 py-1 rounded border border-slate-200 font-semibold"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={s.retailPrice}
                        onChange={(e) =>
                          handleUpdateSize(s.id, 'retailPrice', Number(e.target.value))
                        }
                        placeholder="Retail ₦"
                        className="w-full px-2 py-1 rounded border border-slate-200 text-right font-bold text-emerald-600"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={s.smallBusinessPrice}
                        onChange={(e) =>
                          handleUpdateSize(s.id, 'smallBusinessPrice', Number(e.target.value))
                        }
                        placeholder="Small Biz ₦"
                        className="w-full px-2 py-1 rounded border border-slate-200 text-right font-bold text-blue-600"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={s.stockQuantity}
                        onChange={(e) =>
                          handleUpdateSize(s.id, 'stockQuantity', Number(e.target.value))
                        }
                        placeholder="Stock"
                        className="w-full px-2 py-1 rounded border border-slate-200 text-right"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(s.id)}
                        disabled={sizes.length <= 1}
                        className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Colour Variations */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-purple-600" />
                Colour Variations (Optional)
              </span>
              <button
                type="button"
                onClick={handleAddColour}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-[11px] font-bold hover:bg-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Colour
              </button>
            </div>

            {colours.length === 0 ? (
              <div className="text-[11px] text-slate-400 italic">No colour variations defined.</div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {colours.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <input
                      type="color"
                      value={col.hex}
                      onChange={(e) => handleUpdateColour(col.id, 'hex', e.target.value)}
                      className="w-7 h-7 rounded border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleUpdateColour(col.id, 'name', e.target.value)}
                      placeholder="Colour name (e.g. Blue)"
                      className="flex-1 px-2 py-1 rounded border border-slate-200 font-medium"
                    />
                    <input
                      type="number"
                      min="0"
                      value={col.stockQuantity}
                      onChange={(e) =>
                        handleUpdateColour(col.id, 'stockQuantity', Number(e.target.value))
                      }
                      placeholder="Stock"
                      className="w-20 px-2 py-1 rounded border border-slate-200 text-right"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveColour(col.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#12A84A] hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all"
            >
              {isSubmitting ? 'Saving...' : productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
