import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingCart,
  Search,
  Filter,
  User,
  LogOut,
  SlidersHorizontal,
  ShieldCheck,
  CheckCircle,
  Wifi,
  WifiOff,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { ALL_CATEGORIES, ProductCategory } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: ProductCategory | 'All';
  setSelectedCategory: (c: ProductCategory | 'All') => void;
  onOpenSettings: () => void;
  onOpenTestRunner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenSettings,
  onOpenTestRunner,
}) => {
  const {
    profile,
    isAdmin,
    pricingMode,
    setPricingMode,
    logout,
    loginAsDemoUser,
    activePortal,
    setActivePortal,
    isOnline,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#071B3A] text-white shadow-md border-b border-slate-800">
      <div className="px-4 py-2.5 flex items-center justify-between gap-3 md:gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#12A84A] to-[#0D7F36] text-white shadow-lg shadow-emerald-950/40">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg md:text-xl font-extrabold tracking-tight text-white">
                Trusted <span className="text-[#12A84A]">SupermarketCal</span>
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-300 font-medium tracking-wide">
              Shop Smart. Pay Less. · <span className="text-emerald-400">Asaba, Nigeria</span>
            </p>
          </div>
        </div>

        {/* Pricing Mode Toggle & Search in center */}
        <div className="hidden lg:flex items-center gap-3 flex-1 max-w-2xl">
          {/* RETAIL | SMALL BUSINESS Mode Switcher */}
          <div className="inline-flex p-1 bg-[#0F284E] rounded-xl border border-slate-700/60 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => setPricingMode('retail')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                pricingMode === 'retail'
                  ? 'bg-[#12A84A] text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Retail
            </button>
            <button
              type="button"
              onClick={() => setPricingMode('small_business')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                pricingMode === 'small_business'
                  ? 'bg-[#12A84A] text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Small Business
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or code..."
              className="w-full pl-10 pr-4 py-2 bg-[#0F284E]/90 border border-slate-700/80 rounded-xl text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12A84A] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Categories Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#12A84A] text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">
                {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
              </span>
              <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-80" />
            </button>

            {isCategoryMenuOpen && (
              <div
                className="absolute left-0 mt-2 w-64 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs"
                onMouseLeave={() => setIsCategoryMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setIsCategoryMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 font-medium hover:bg-slate-100 flex items-center justify-between ${
                    selectedCategory === 'All' ? 'text-[#12A84A] font-bold bg-emerald-50' : ''
                  }`}
                >
                  All Categories
                  {selectedCategory === 'All' && <CheckCircle className="w-3.5 h-3.5 text-[#12A84A]" />}
                </button>
                <div className="h-px bg-slate-100 my-1" />
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 font-medium hover:bg-slate-100 flex items-center justify-between ${
                      selectedCategory === cat ? 'text-[#12A84A] font-bold bg-emerald-50' : ''
                    }`}
                  >
                    {cat}
                    {selectedCategory === cat && <CheckCircle className="w-3.5 h-3.5 text-[#12A84A]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions: QA Tests, Network, User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Mandatory QA Test Runner shortcut */}
          <button
            type="button"
            onClick={onOpenTestRunner}
            title="Run mandatory basket tests"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0F284E] border border-slate-700 text-emerald-400 hover:text-emerald-300 hover:border-emerald-600 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QA Tests</span>
          </button>

          {/* Network indicator */}
          <div
            title={isOnline ? 'Online - Firebase Connected' : 'Offline - Local caching'}
            className="hidden sm:flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-slate-800/80 text-slate-300"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 font-medium">Offline</span>
              </>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-[#0F284E] hover:bg-[#153464] border border-slate-700/80 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#12A84A] flex items-center justify-center text-white font-bold text-xs ring-2 ring-emerald-500/30">
                {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <div className="text-xs font-semibold text-white leading-tight">
                  Welcome, {profile?.fullName ? profile.fullName.split(' ')[0] : 'User'}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  {isAdmin && <ShieldCheck className="w-2.5 h-2.5" />}
                  {isAdmin ? 'Admin / Owner' : profile?.officeRole || 'Sales Person'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-xs"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="p-3 bg-slate-50 rounded-xl mb-1.5">
                  <div className="font-bold text-sm text-[#071B3A]">{profile?.fullName || 'Staff Member'}</div>
                  <div className="text-[11px] text-slate-500 truncate">{profile?.email || 'Authenticated User'}</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#12A84A]">
                    {isAdmin ? 'Administrator (Full Access)' : `Staff · ${profile?.officeRole || 'Salesperson'}`}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePortal('sales');
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-100 ${
                      activePortal === 'sales' ? 'bg-emerald-50 text-[#12A84A] font-bold' : 'text-slate-700'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Sales Calculator (POS)
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePortal('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-100 ${
                        activePortal === 'admin' ? 'bg-emerald-50 text-[#12A84A] font-bold' : 'text-slate-700'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Panel & Monitoring
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActivePortal('history');
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-100 ${
                      activePortal === 'history' ? 'bg-emerald-50 text-[#12A84A] font-bold' : 'text-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    My Sales History
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettings();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2 text-slate-700 hover:bg-slate-100"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    My Display Settings
                  </button>
                </div>

                {/* Role Switcher for instant verification */}
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Role Testing Switcher
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        loginAsDemoUser('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                    >
                      Switch to Owner/Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        loginAsDemoUser('salesperson');
                        setIsUserMenuOpen(false);
                      }}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                    >
                      Switch to Salesperson
                    </button>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-only Search and Pricing Mode Bar */}
      <div className="lg:hidden px-4 pb-3 flex flex-col gap-2 border-t border-slate-800/60 pt-2">
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="inline-flex p-0.5 bg-[#0F284E] rounded-xl border border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setPricingMode('retail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                pricingMode === 'retail' ? 'bg-[#12A84A] text-white' : 'text-slate-300'
              }`}
            >
              Retail
            </button>
            <button
              type="button"
              onClick={() => setPricingMode('small_business')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                pricingMode === 'small_business' ? 'bg-[#12A84A] text-white' : 'text-slate-300'
              }`}
            >
              Small Biz
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0F284E] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#12A84A]"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
