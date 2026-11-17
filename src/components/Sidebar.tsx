import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingCart,
  LayoutDashboard,
  Palette,
  CloudDownload,
  LogOut,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenTestRunner: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings, onOpenTestRunner }) => {
  const { activePortal, setActivePortal, isAdmin, logout } = useApp();

  return (
    <aside className="w-64 bg-[#071B3A] text-white flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#12A84A] to-[#0B662C] flex items-center justify-center text-white shadow-xl shadow-emerald-950/50 mb-3">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-extrabold tracking-tight text-white leading-tight">
          Trusted <span className="text-[#12A84A]">SupermarketCal</span>
        </h1>
        <p className="text-xs text-slate-400 italic mt-0.5 font-medium">Shop Smart. Pay Less.</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-2">
        {/* Sales / POS Calculator */}
        <button
          type="button"
          onClick={() => setActivePortal('sales')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 ${
            activePortal === 'sales'
              ? 'bg-[#12A84A] text-white shadow-lg shadow-emerald-900/40'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <div className="leading-tight font-bold">Sales</div>
              <div className="text-[10px] opacity-80 font-normal">Calculator</div>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${activePortal === 'sales' ? 'opacity-100' : 'opacity-40'}`} />
        </button>

        {/* Admin Panel (Manage & Monitor) */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setActivePortal('admin')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 ${
              activePortal === 'admin'
                ? 'bg-[#12A84A] text-white shadow-lg shadow-emerald-900/40'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <div className="text-left">
                <div className="leading-tight font-bold">Admin Panel</div>
                <div className="text-[10px] opacity-80 font-normal">Manage & Monitor</div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${activePortal === 'admin' ? 'opacity-100' : 'opacity-40'}`} />
          </button>
        )}

        {/* Sales History */}
        <button
          type="button"
          onClick={() => setActivePortal('history')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 ${
            activePortal === 'history'
              ? 'bg-[#12A84A] text-white shadow-lg shadow-emerald-900/40'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <div className="leading-tight font-bold">Sales History</div>
              <div className="text-[10px] opacity-80 font-normal">Receipts & Logs</div>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${activePortal === 'history' ? 'opacity-100' : 'opacity-40'}`} />
        </button>

        {/* Settings / Customize App */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-semibold text-sm text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all duration-150"
        >
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 shrink-0 text-amber-400" />
            <div className="text-left">
              <div className="leading-tight font-bold">Settings</div>
              <div className="text-[10px] opacity-80 font-normal">Customize App</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-40" />
        </button>

        {/* Backup Data / Export Products */}
        <button
          type="button"
          onClick={() => setActivePortal('backup')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 ${
            activePortal === 'backup'
              ? 'bg-[#12A84A] text-white shadow-lg shadow-emerald-900/40'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <CloudDownload className="w-5 h-5 shrink-0 text-blue-400" />
            <div className="text-left">
              <div className="leading-tight font-bold">Backup Data</div>
              <div className="text-[10px] opacity-80 font-normal">Export Products</div>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${activePortal === 'backup' ? 'opacity-100' : 'opacity-40'}`} />
        </button>

        {/* QA Test Runner */}
        <button
          type="button"
          onClick={onOpenTestRunner}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-xs text-emerald-400 bg-[#0F284E] border border-emerald-500/30 hover:border-emerald-400 transition-all duration-150"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <div className="text-left">
              <div className="leading-tight font-bold">Run 5 QA Tests</div>
              <div className="text-[10px] text-slate-300">Mandatory Basket Verification</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-semibold text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/70 transition-all duration-150"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <div className="text-left">
            <div className="leading-tight font-bold">Logout</div>
            <div className="text-[10px] opacity-80 font-normal">Sign Out</div>
          </div>
        </button>
      </nav>

      {/* Store Location Footer Card (As featured in Reference Mockup) */}
      <div className="p-3.5 border-t border-slate-800/80">
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
          <img
            src="/assets/aistudio/file_00000000c24c8243bdd627c33af2edb7_e6c63493.png"
            alt="Trusted Supermarket Storefront"
            className="w-full h-24 object-cover object-bottom opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071B3A] via-[#071B3A]/40 to-transparent p-3 flex flex-col justify-end">
            <div className="flex items-center gap-1 text-[11px] font-bold text-white">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Asaba, Nigeria</span>
            </div>
            <div className="text-[10px] text-amber-300 font-semibold italic">
              Quality Products... Better Value...
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
