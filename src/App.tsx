/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { CartPanel } from './components/CartPanel';
import { RightAdminPanel } from './components/RightAdminPanel';
import { AdminPortal } from './components/AdminPortal';
import { SalespersonHistory } from './components/SalespersonHistory';
import { BackupDataView } from './components/BackupDataView';
import { AuthScreen } from './components/AuthScreen';
import { ProfileCompletionModal } from './components/ProfileCompletionModal';
import { ReceiptModal, PrintableReceipt } from './components/ReceiptModal';
import { DisplaySettingsModal } from './components/DisplaySettingsModal';
import { QATestRunnerModal } from './components/QATestRunnerModal';
import { ProductCategory, Product, Sale } from './types';
import { formatNaira } from './utils/format';
import {
  ShoppingCart,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
  ShieldCheck,
  ChevronUp,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    profile,
    isAdmin,
    isAuthLoading,
    activePortal,
    setActivePortal,
    products,
    isProductsLoading,
    pricingMode,
    addToCart,
    cart,
    grandTotal,
    lastSale,
    displaySettings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [isAddProductQuickOpen, setIsAddProductQuickOpen] = useState(false);

  // If auth is still checking
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#071B3A] text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-[#12A84A] animate-spin mb-3" />
        <h2 className="text-base font-bold">Connecting to Trusted SupermarketCal...</h2>
        <p className="text-xs text-slate-400">Verifying secure Firebase session & registers</p>
      </div>
    );
  }

  // If not signed in, show AuthScreen
  if (!profile) {
    return <AuthScreen />;
  }

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleOpenReceipt = (sale: Sale) => {
    setActiveReceiptSale(sale);
    setIsReceiptModalOpen(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: displaySettings.bgColor || '#F1F5FC' }}
    >
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        {/* Left Sidebar on Desktop */}
        <div className="hidden lg:block">
          <Sidebar
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenTestRunner={() => setIsTestRunnerOpen(true)}
          />
        </div>

        {/* Center Content Workspace */}
        <main className="flex-1 p-3 sm:p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Sample Inventory Notice Banner */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl px-4 py-2 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#12A84A]" />
              <span className="font-semibold text-slate-800">
                SAMPLE INVENTORY: 40 Preloaded Nigerian Supermarket Products
              </span>
              <span className="hidden sm:inline text-slate-400">
                · Researched Asaba & Nigerian market prices. Administrator can edit or add items at any time.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTestRunnerOpen(true)}
              className="text-[11px] font-bold text-[#12A84A] hover:underline shrink-0"
            >
              Verify 5 Mandatory QA Tests →
            </button>
          </div>

          {/* VIEW: 1. Sales POS Calculator */}
          {activePortal === 'sales' && (
            <div className="flex-1 flex flex-col xl:flex-row gap-5 items-start">
              {/* Product Catalogue & Category Bar */}
              <div className="flex-1 w-full space-y-4">
                {/* Horizontal Category Bar */}
                <CategoryBar
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />

                {/* Products Grid */}
                {isProductsLoading ? (
                  <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#12A84A] animate-spin mb-2" />
                    <p className="text-xs font-semibold">Loading supermarket catalogue...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 bg-white rounded-3xl p-6 border border-slate-200">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold">No products found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No items matched "{searchQuery}" in{' '}
                      {selectedCategory === 'All' ? 'all categories' : selectedCategory}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="mt-3 px-3 py-1.5 rounded-xl bg-[#12A84A] text-white text-xs font-bold"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div
                    className={`grid gap-3 sm:gap-4 ${
                      displaySettings.density === 'compact'
                        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
                        : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4'
                    }`}
                  >
                    {filteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.productId}
                        product={prod}
                        pricingMode={pricingMode}
                        onAddToCart={addToCart}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Panel (Desktop Center/Right) */}
              <div className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-20">
                <CartPanel
                  onPrintReceipt={handlePrint}
                  onOpenReceiptModal={() => {
                    if (lastSale) {
                      setActiveReceiptSale(lastSale);
                      setIsReceiptModalOpen(true);
                    }
                  }}
                />
              </div>

              {/* Admin Quick Dashboard Panel (Shown to admin or on large screens) */}
              {isAdmin && (
                <div className="hidden 2xl:block w-80 shrink-0 sticky top-20">
                  <RightAdminPanel
                    onOpenAddProduct={() => setActivePortal('admin')}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                  />
                </div>
              )}
            </div>
          )}

          {/* VIEW: 2. Admin Portal */}
          {activePortal === 'admin' && (
            <AdminPortal onOpenSettings={() => setIsSettingsOpen(true)} />
          )}

          {/* VIEW: 3. Salesperson History */}
          {activePortal === 'history' && (
            <SalespersonHistory onSelectSale={handleOpenReceipt} />
          )}

          {/* VIEW: 4. Backup Data */}
          {activePortal === 'backup' && <BackupDataView />}
        </main>
      </div>

      {/* Floating Mobile Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-3 shadow-2xl">
        <button
          type="button"
          onClick={() => setIsMobileCartOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#12A84A] text-white font-extrabold text-sm flex items-center justify-between shadow-lg shadow-emerald-700/30"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <span>View Current Cart</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-base font-black">
            <span>{formatNaira(grandTotal)}</span>
            <ChevronUp className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Mobile Cart Slide-Up Sheet */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-4 max-h-[88vh] flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-200">
            <button
              type="button"
              onClick={() => setIsMobileCartOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 overflow-y-auto">
              <CartPanel
                onPrintReceipt={() => {
                  setIsMobileCartOpen(false);
                  handlePrint();
                }}
                onOpenReceiptModal={() => {
                  setIsMobileCartOpen(false);
                  if (lastSale) {
                    setActiveReceiptSale(lastSale);
                    setIsReceiptModalOpen(true);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer (Matching Mockup Footer) */}
      <footer className="mt-auto bg-[#071B3A] text-white border-t border-slate-800 px-4 py-3 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#12A84A]" />
          <span className="font-extrabold">Trusted SupermarketCal</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">Asaba, Nigeria</span>
        </div>

        <div className="text-slate-300 font-semibold italic">Shop Smart. Pay Less.</div>

        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Powered by</span>
          <span className="font-bold text-amber-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M4.1 14.5L7.5 2.1c.1-.4.6-.5.9-.2l3.4 6.3-7.7 6.3zm15.8 0l-3-11.8c-.1-.4-.6-.5-.9-.2L3.5 19.5l8.5 4.8c.6.3 1.3.3 1.9 0l8-4.8-2-5zm-7.9 3.2l-3.3-6.2 9.2 6.2h-5.9z" />
            </svg>
            Firebase
          </span>
        </div>
      </footer>

      {/* Global Modals */}
      <ProfileCompletionModal />

      <ReceiptModal
        sale={activeReceiptSale || lastSale}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onPrint={handlePrint}
      />

      <DisplaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <QATestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />

      {/* Hidden Thermal Printable Receipt */}
      <PrintableReceipt sale={activeReceiptSale || lastSale} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
