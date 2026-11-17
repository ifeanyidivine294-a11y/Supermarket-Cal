import React from 'react';
import { useApp } from '../context/AppContext';
import { CloudDownload, Database, FileSpreadsheet, RefreshCw, CheckCircle, Upload } from 'lucide-react';

export const BackupDataView: React.FC = () => {
  const { products, sales, resetToSampleInventory, isAdmin } = useApp();

  const handleExportProductsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `TrustedSupermarketCal_Products_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const handleExportProductsCSV = () => {
    const headers = [
      'Product ID',
      'Name',
      'Category',
      'Pricing Type',
      'Retail Price (NGN)',
      'Small Biz Price (NGN)',
      'Stock Quantity',
    ];
    const rows = products.map((p) => [
      p.productId,
      `"${p.name}"`,
      `"${p.category}"`,
      p.pricingType,
      p.retailPrice,
      p.smallBusinessPrice,
      p.stockQuantity,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TrustedSupermarketCal_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-[#071B3A]">System Backup & Data Export</h1>
          <p className="text-xs text-slate-500">
            Export store inventory and sales transactions for offline spreadsheets and record keeping.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Product Inventory */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#12A84A] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Catalogue & Stock Inventory</h3>
              <p className="text-xs text-slate-500">{products.length} registered supermarket products</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Download a full backup of all current product titles, pricing structures (Retail and Small Business), size variations, and available stock units.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleExportProductsCSV}
              className="px-4 py-2.5 rounded-xl bg-[#12A84A] hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export as CSV Spreadsheet</span>
            </button>
            <button
              type="button"
              onClick={handleExportProductsJSON}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <CloudDownload className="w-4 h-4" />
              <span>Export as JSON</span>
            </button>
          </div>
        </div>

        {/* Restore Sample Inventory */}
        {isAdmin && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Reset Initial Sample Inventory</h3>
                <p className="text-xs text-slate-500">Restore the 40 preloaded Nigerian supermarket items</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Resets the database catalogue to the 40 researched Nigerian supermarket products across all 10 categories, including the items required for mandatory QA tests.
            </p>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset to the 40 preloaded sample Nigerian supermarket products?')) {
                  resetToSampleInventory();
                  alert('Sample inventory catalogue restored successfully.');
                }
              }}
              className="px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset to Sample Catalogue</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
