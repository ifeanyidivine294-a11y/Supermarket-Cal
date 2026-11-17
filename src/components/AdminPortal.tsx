import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Sale } from '../types';
import { formatNaira } from '../utils/format';
import {
  ShieldCheck,
  Package,
  Users,
  BarChart3,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  Eye,
  Sliders,
  Calendar,
} from 'lucide-react';
import { AddProductModal } from './AddProductModal';

interface AdminPortalProps {
  onOpenSettings: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onOpenSettings }) => {
  const {
    products,
    sales,
    deleteProduct,
    resetToSampleInventory,
    setActivePortal,
    storeSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'monitoring' | 'staff' | 'reports'>('overview');
  const [productSearch, setProductSearch] = useState('');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('All');
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sales time filters
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Filter sales based on time range
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(now.getDate() - 30);

    return sales.filter((s) => {
      const saleDate = new Date(s.createdAt);

      if (timeFilter === 'today') {
        return s.createdAt.slice(0, 10) === todayStr;
      }
      if (timeFilter === 'week') {
        return saleDate >= weekAgo;
      }
      if (timeFilter === 'month') {
        return saleDate >= monthAgo;
      }
      return true;
    });
  }, [sales, timeFilter]);

  // Overall calculations
  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  }, [filteredSales]);

  const totalTransactions = filteredSales.length;

  const totalQuantitySold = useMemo(() => {
    return filteredSales.reduce(
      (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    );
  }, [filteredSales]);

  const totalDiscountsGiven = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + (s.discountAmount || 0), 0);
  }, [filteredSales]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= (storeSettings.lowStockThreshold || 10));
  }, [products, storeSettings.lowStockThreshold]);

  // Staff Performance aggregations
  const staffPerformance = useMemo(() => {
    const map: Record<
      string,
      {
        uid: string;
        name: string;
        role: string;
        transactions: number;
        totalSales: number;
        totalQty: number;
      }
    > = {};

    filteredSales.forEach((s) => {
      const key = s.salespersonName || 'Unassigned Staff';
      if (!map[key]) {
        map[key] = {
          uid: s.salespersonUid,
          name: key,
          role: s.salespersonRole || 'Cashier',
          transactions: 0,
          totalSales: 0,
          totalQty: 0,
        };
      }
      map[key].transactions += 1;
      map[key].totalSales += s.grandTotal;
      map[key].totalQty += s.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    return Object.values(map);
  }, [filteredSales]);

  // Best selling products
  const bestSellers = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        if (!map[item.name]) {
          map[item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        map[item.name].qty += item.quantity;
        map[item.name].revenue += item.lineTotal;
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filteredSales]);

  // Export Sales to CSV
  const handleExportCSV = () => {
    if (sales.length === 0) return alert('No sales transactions to export.');

    const headers = [
      'Receipt Number',
      'Date & Time',
      'Salesperson Name',
      'Office Role',
      'Pricing Mode',
      'Items Summary',
      'Subtotal (NGN)',
      'Discount (NGN)',
      'Grand Total (NGN)',
      'Amount Paid (NGN)',
      'Change (NGN)',
    ];

    const rows = sales.map((s) => {
      const itemsSummary = s.items
        .map((i) => `${i.name} (${i.quantity}x @ NGN ${i.unitPrice})`)
        .join('; ');
      return [
        s.receiptNumber,
        new Date(s.createdAt).toLocaleString('en-NG'),
        `"${s.salespersonName}"`,
        `"${s.salespersonRole}"`,
        s.pricingMode,
        `"${itemsSummary}"`,
        s.subtotal,
        s.discountAmount,
        s.grandTotal,
        s.amountPaid,
        s.change,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TrustedSupermarketCal_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered products list
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Sub-Nav Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#12A84A] flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#071B3A]">
              Administrator Command Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Private Executive Management & Multi-Register Sales Monitoring
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-white text-[#071B3A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'products'
                ? 'bg-white text-[#071B3A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monitoring')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'monitoring'
                ? 'bg-white text-[#071B3A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Monitoring
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'reports'
                ? 'bg-white text-[#071B3A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Business Reports
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Time Filter Buttons */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800">Performance Metrics</h2>
            <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs font-bold">
              {(['today', 'week', 'month', 'all'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeFilter(t)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    timeFilter === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : t === 'month' ? 'This Month' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Revenue
              </div>
              <div className="text-2xl font-black text-[#12A84A] font-mono leading-tight">
                {formatNaira(totalRevenue)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>From actual sales</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Completed Transactions
              </div>
              <div className="text-2xl font-black text-[#071B3A] font-mono leading-tight">
                {totalTransactions.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Average ticket: {formatNaira(totalTransactions ? Math.round(totalRevenue / totalTransactions) : 0)}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Quantity of Goods Sold
              </div>
              <div className="text-2xl font-black text-amber-600 font-mono leading-tight">
                {totalQuantitySold.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Units deducted from inventory</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Active Staff Registers
              </div>
              <div className="text-2xl font-black text-purple-600 font-mono leading-tight">
                {staffPerformance.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Authorized salespeople</div>
            </div>
          </div>

          {/* Low Stock Alerts & Best Sellers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Low Stock Alert */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Products Running Low on Stock ({lowStockProducts.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-[#12A84A] hover:underline"
                >
                  Manage Stock
                </button>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  All supermarket products are currently above the safety threshold.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {lowStockProducts.map((p) => (
                    <div key={p.productId} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.category}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-100 text-red-700">
                          {p.stockQuantity} remaining
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Best Selling Products */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#12A84A] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">Top Selling Products</h3>
                </div>
              </div>

              {bestSellers.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 text-xs">
                  No sales recorded in selected period.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bestSellers.map((item, idx) => (
                    <div key={item.name} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-extrabold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#12A84A] font-mono">{formatNaira(item.revenue)}</div>
                        <div className="text-[10px] text-slate-400">{item.qty} units sold</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title or category..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#12A84A] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset catalogue to the 40 preloaded sample Nigerian supermarket products? Any custom additions will be restored.')) {
                    resetToSampleInventory();
                  }
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
                title="Reset to 40 sample inventory"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Sample Inventory</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedProductToEdit(null);
                  setIsAddProductOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#12A84A] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Retail Price</th>
                    <th className="py-3 px-4 text-right">Small Biz Price</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const hasSizes = p.pricingType === 'sizes' && p.sizes.length > 0;
                    const retailDisplay = hasSizes
                      ? `from ${formatNaira(p.sizes[0].retailPrice)}`
                      : formatNaira(p.retailPrice);
                    const smallBizDisplay = hasSizes
                      ? `from ${formatNaira(p.sizes[0].smallBusinessPrice)}`
                      : formatNaira(p.smallBusinessPrice);

                    return (
                      <tr key={p.productId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                            <img
                              src={p.imageURL}
                              alt={p.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            {hasSizes && (
                              <div className="text-[10px] text-slate-400">
                                {p.sizes.map((s) => s.label).join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600">{p.category}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              hasSizes ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.pricingType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#12A84A] font-mono">
                          {retailDisplay}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-blue-600 font-mono">
                          {smallBizDisplay}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              p.stockQuantity <= 10
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stockQuantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProductToEdit(p);
                                setIsAddProductOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${p.name}"? Historical sales will remain intact.`)) {
                                  deleteProduct(p.productId);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SALES MONITORING TAB (ADMIN ONLY) */}
      {activeTab === 'monitoring' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-[#071B3A]">
                Salesperson Performance & Registers
              </h2>
              <p className="text-xs text-slate-500">
                Detailed real-time monitoring of each staff member's total sales, completed transactions, and item volumes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Report</span>
              </button>
            </div>
          </div>

          {/* Salesperson Aggregation Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Salesperson Registry Breakdown
              </h3>
              <span className="text-xs text-slate-400">{staffPerformance.length} Active Staff</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-5">Salesperson</th>
                    <th className="py-3 px-5">Office Role</th>
                    <th className="py-3 px-5 text-center">Transactions</th>
                    <th className="py-3 px-5 text-center">Units Sold</th>
                    <th className="py-3 px-5 text-right">Total Generated (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No sales transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    staffPerformance.map((st) => (
                      <tr key={st.name} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900">{st.name}</td>
                        <td className="py-3.5 px-5 text-slate-600">{st.role}</td>
                        <td className="py-3.5 px-5 text-center font-bold text-slate-800 font-mono">
                          {st.transactions}
                        </td>
                        <td className="py-3.5 px-5 text-center font-bold text-slate-800 font-mono">
                          {st.totalQty}
                        </td>
                        <td className="py-3.5 px-5 text-right font-extrabold text-[#12A84A] font-mono text-sm">
                          {formatNaira(st.totalSales)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Sales Transactions Audit Log */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Full Financial Transaction Log ({filteredSales.length})
              </h3>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10">
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Cashier / Staff</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Items Count</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">Discount</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((s) => (
                    <tr key={s.saleId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        {s.receiptNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(s.createdAt).toLocaleString('en-NG', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {s.salespersonName}
                        <span className="text-[10px] text-slate-400 block">{s.salespersonRole}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {s.pricingMode.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {s.items.reduce((sum, i) => sum + i.quantity, 0)} items ({s.items.length} lines)
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatNaira(s.subtotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-600">
                        {s.discountAmount > 0 ? `-${formatNaira(s.discountAmount)}` : '₦0'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#12A84A] font-mono text-sm">
                        {formatNaira(s.grandTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#071B3A]">Business Financial Reports</h2>
              <p className="text-xs text-slate-500">
                Revenue streams, retail vs wholesale breakdown, and exportable financial audit sheets.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-[#12A84A] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Full CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Retail vs Small Business Mode Breakdown */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Pricing Mode Volume
              </h3>
              {(() => {
                const retailSales = sales.filter((s) => s.pricingMode === 'retail');
                const smallBizSales = sales.filter((s) => s.pricingMode === 'small_business');

                const retailTotal = retailSales.reduce((sum, s) => sum + s.grandTotal, 0);
                const smallBizTotal = smallBizSales.reduce((sum, s) => sum + s.grandTotal, 0);

                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800">Retail Purchases</span>
                        <span className="font-extrabold text-[#12A84A] font-mono">
                          {formatNaira(retailTotal)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#12A84A] h-full"
                          style={{
                            width: `${(retailTotal / (retailTotal + smallBizTotal || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {retailSales.length} transactions
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800">Small Business Wholesale</span>
                        <span className="font-extrabold text-blue-600 font-mono">
                          {formatNaira(smallBizTotal)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#1769E0] h-full"
                          style={{
                            width: `${(smallBizTotal / (retailTotal + smallBizTotal || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {smallBizSales.length} transactions
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Total Discounts Analysis */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Discounts & Concessions
              </h3>
              <div className="text-2xl font-black text-amber-600 font-mono mb-1">
                {formatNaira(totalDiscountsGiven)}
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Total markdown applied across all customer checkout baskets.
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600">
                Average discount per transaction:{' '}
                <span className="font-bold font-mono">
                  {formatNaira(totalTransactions ? Math.round(totalDiscountsGiven / totalTransactions) : 0)}
                </span>
              </div>
            </div>

            {/* Supermarket Location & Fiscal Identity */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Store Operations Profile
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Store:</span>
                  <span className="font-bold text-slate-900">{storeSettings.storeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Location:</span>
                  <span className="font-medium text-slate-700">{storeSettings.storeAddress}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Standard Currency:</span>
                  <span className="font-bold text-[#12A84A]">Nigerian Naira ({storeSettings.currency})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Low Stock Threshold:</span>
                  <span className="font-bold text-slate-800">{storeSettings.lowStockThreshold} units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setSelectedProductToEdit(null);
        }}
        productToEdit={selectedProductToEdit}
      />
    </div>
  );
};
