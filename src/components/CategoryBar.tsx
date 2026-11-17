import React from 'react';
import { ProductCategory, ALL_CATEGORIES } from '../types';
import {
  CupSoda,
  Wheat,
  UtensilsCrossed,
  Cookie,
  Milk,
  Sparkles,
  SprayCan,
  Snowflake,
  Baby,
  Boxes,
} from 'lucide-react';

interface CategoryBarProps {
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (category: ProductCategory | 'All') => void;
}

const CATEGORY_ICONS: Record<ProductCategory, React.ReactNode> = {
  'Beverages and Drinks': <CupSoda className="w-5 h-5 text-red-500" />,
  'Rice, Grains and Pasta': <Wheat className="w-5 h-5 text-amber-500" />,
  'Cooking Oil and Seasoning': <UtensilsCrossed className="w-5 h-5 text-yellow-600" />,
  'Snacks and Biscuits': <Cookie className="w-5 h-5 text-orange-500" />,
  'Dairy and Breakfast': <Milk className="w-5 h-5 text-blue-500" />,
  'Toiletries and Personal Care': <Sparkles className="w-5 h-5 text-purple-500" />,
  'Household and Cleaning': <SprayCan className="w-5 h-5 text-emerald-500" />,
  'Frozen Foods': <Snowflake className="w-5 h-5 text-cyan-500" />,
  'Baby Products': <Baby className="w-5 h-5 text-pink-500" />,
  'Other Products': <Boxes className="w-5 h-5 text-indigo-500" />,
};

const SHORT_LABELS: Record<ProductCategory, string> = {
  'Beverages and Drinks': 'Drinks',
  'Rice, Grains and Pasta': 'Rice & Grains',
  'Cooking Oil and Seasoning': 'Oil & Seasoning',
  'Snacks and Biscuits': 'Snacks & Biscuits',
  'Dairy and Breakfast': 'Dairy & Breakfast',
  'Toiletries and Personal Care': 'Toiletries & Care',
  'Household and Cleaning': 'Household Clean',
  'Frozen Foods': 'Frozen Foods',
  'Baby Products': 'Baby Products',
  'Other Products': 'Other Products',
};

export const CategoryBar: React.FC<CategoryBarProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2.5 min-w-max px-1">
        {/* All Products button */}
        <button
          type="button"
          onClick={() => onSelectCategory('All')}
          className={`flex flex-col items-center justify-center w-24 h-20 rounded-2xl p-2 transition-all duration-150 border ${
            selectedCategory === 'All'
              ? 'bg-[#12A84A] text-white border-[#12A84A] shadow-md shadow-emerald-700/20 scale-[1.02]'
              : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <Boxes className={`w-6 h-6 mb-1 ${selectedCategory === 'All' ? 'text-white' : 'text-slate-600'}`} />
          <span className="text-[11px] font-bold text-center leading-tight">All Items</span>
        </button>

        {ALL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`flex flex-col items-center justify-center w-24 h-20 rounded-2xl p-2 transition-all duration-150 border ${
                isSelected
                  ? 'bg-[#12A84A] text-white border-[#12A84A] shadow-md shadow-emerald-700/20 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${
                  isSelected ? 'bg-white/20' : 'bg-slate-100'
                }`}
              >
                {CATEGORY_ICONS[cat]}
              </div>
              <span className="text-[10px] font-bold text-center leading-tight line-clamp-2">
                {SHORT_LABELS[cat]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
