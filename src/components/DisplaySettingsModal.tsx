import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DisplaySettings } from '../types';
import { X, Palette, Sun, Moon, RotateCcw, Check, Sparkles } from 'lucide-react';

interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const APPROVED_THEMES = [
  { id: 'navy', label: 'Classic Deep Navy', primary: '#071B3A', accent: '#12A84A' },
  { id: 'emerald', label: 'Fresh Supermarket Green', primary: '#0E6B34', accent: '#12A84A' },
  { id: 'blue', label: 'Commercial Ocean Blue', primary: '#0F396B', accent: '#1769E0' },
  { id: 'slate', label: 'Executive Slate Minimal', primary: '#1E293B', accent: '#38BDF8' },
  { id: 'purple', label: 'Royal Retail Purple', primary: '#3B176B', accent: '#A855F7' },
] as const;

export const DisplaySettingsModal: React.FC<DisplaySettingsModalProps> = ({ isOpen, onClose }) => {
  const { displaySettings, updateDisplaySettings, restoreDefaultDisplaySettings } = useApp();

  const [localSettings, setLocalSettings] = useState<DisplaySettings>(displaySettings);

  if (!isOpen) return null;

  const handleSave = async () => {
    await updateDisplaySettings(localSettings);
    onClose();
  };

  const handleReset = async () => {
    await restoreDefaultDisplaySettings();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#071B3A]">MY DISPLAY SETTINGS</h2>
            <p className="text-xs text-slate-500">
              Personalise your register workstation without affecting other cashiers.
            </p>
          </div>
        </div>

        <div className="space-y-5 py-2">
          {/* Custom Background Color */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Workstation Canvas Background
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={localSettings.bgColor || '#F1F5FC'}
                onChange={(e) => setLocalSettings({ ...localSettings, bgColor: e.target.value })}
                className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
              />
              <div className="text-xs font-mono font-bold text-slate-800">
                {localSettings.bgColor || '#F1F5FC'}
              </div>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, bgColor: '#F1F5FC' })}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                Reset Canvas
              </button>
            </div>
          </div>

          {/* Approved Colour Themes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Approved Brand Accents
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {APPROVED_THEMES.map((th) => {
                const isSelected = (localSettings.colorTheme || 'navy') === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setLocalSettings({ ...localSettings, colorTheme: th.id as any })}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-[#12A84A] bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center -space-x-1 shrink-0">
                      <span
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ backgroundColor: th.primary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ backgroundColor: th.accent }}
                      />
                    </div>
                    <span className="font-bold text-slate-800 flex-1 truncate">{th.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#12A84A] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Density */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Display Grid Density
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, density: 'comfortable' })}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                  localSettings.density !== 'compact'
                    ? 'border-[#12A84A] bg-emerald-50 text-slate-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Comfortable (Standard)
              </button>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, density: 'compact' })}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                  localSettings.density === 'compact'
                    ? 'border-[#12A84A] bg-emerald-50 text-slate-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Compact (High Density)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Default Design</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#12A84A] hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-700/20"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
