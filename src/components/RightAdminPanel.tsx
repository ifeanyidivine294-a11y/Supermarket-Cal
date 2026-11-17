import React from 'react';
import { useApp } from '../context/AppContext';
import { formatNaira } from '../utils/format';
import {
  ShieldCheck,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Plus,
  RefreshCw,
  BarChart3,
  Settings,
  ArrowUpRight,
} from 'lucide-react';

interface RightAdminPanelProps {
  onOpenAddProduct: () => void;
  onOpenSettings: () => void;
}

export const RightAdminPanel: React.FC<RightAdminPanelProps> = ({
  onOpenAddProduct,
  onOpenSettings,
}) => {
  const { sales, setActivePortal } = useApp();

  // Compute live statistics for today from Firestore sales records
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter((s) => s.createdAt.slice(0, 10) === todayStr);

  const totalSalesToday = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalItemsSoldToday = todaySales.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
  const totalTransactionsToday = todaySales.length;

  // Group performance by salesperson
  const staffActivityMap: Record<string, { name: string; role: string; total: number; count: number }> = {};

  sales.forEach((s) => {
    const key = s.salespersonName || 'Staff';
    if (!staffActivityMap[key]) {
      staffActivityMap[key] = {
        name: key,
        role: s.salespersonRole || 'Cashier',
        total: 0,
        count: 0,
      };
    }
    staffActivityMap[key].total += s.grandTotal;
    staffActivityMap[key].count += 1;
  });

  const staffList = Object.values(staffActivityMap);
  const activeStaffCount = Math.max(1, staffList.length);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-md flex flex-col justify-between space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#12A84A] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
            Admin Dashboard
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setActivePortal('admin')}
          className="text-xs font-bold text-[#12A84A] hover:text-emerald-700 flex items-center gap-0.5"
        >
          <span>Open Full</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 KPI Grid Cards (Directly matching visual mockup) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Sales Today */}
        <div className="bg-gradient-to-br from-[#1769E0] to-[#0F4EB3] text-white p-3 sm:p-3.5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center mb-1.5">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black font-mono leading-tight">
              {formatNaira(totalSalesToday)}
            </div>
            <div className="text-[10px] text-blue-100 font-medium">Total Sales (Today)</div>
          </div>
        </div>

        {/* Items Sold Today */}
        <div className="bg-gradient-to-br from-[#12A84A] to-[#0E8239] text-white p-3 sm:p-3.5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center mb-1.5">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black font-mono leading-tight">
              {totalItemsSoldToday.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-100 font-medium">Items Sold (Today)</div>
          </div>
        </div>

        {/* Total Transactions Today */}
        <div className="bg-gradient-to-br from-[#F97316] to-[#D95D08] text-white p-3 sm:p-3.5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center mb-1.5">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black font-mono leading-tight">
              {totalTransactionsToday}
            </div>
            <div className="text-[10px] text-orange-100 font-medium">Transactions (Today)</div>
          </div>
        </div>

        {/* Active Staff Count */}
        <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white p-3 sm:p-3.5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center mb-1.5">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black font-mono leading-tight">
              {activeStaffCount}
            </div>
            <div className="text-[10px] text-purple-100 font-medium">Sales People</div>
          </div>
        </div>
      </div>

      {/* Sales People Activity (from mockup) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-800">Sales People Activity</h3>
          <button
            type="button"
            onClick={() => setActivePortal('admin')}
            className="text-[11px] font-bold text-[#12A84A] hover:underline"
          >
            View All →
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 pb-1.5 border-b border-slate-200">
            <span>Name</span>
            <span>Role</span>
            <span className="text-right">Sales (₦)</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {staffList.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-xs">
                No transactions recorded yet today.
              </div>
            ) : (
              staffList.slice(0, 4).map((st) => (
                <div key={st.name} className="grid grid-cols-3 py-2 items-center">
                  <span className="font-bold text-slate-800 truncate">{st.name.split(' ')[0]}</span>
                  <span className="text-slate-500 text-[11px] truncate">{st.role}</span>
                  <span className="font-extrabold text-[#12A84A] text-right font-mono">
                    {formatNaira(st.total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions (from mockup) */}
      <div className="pt-2 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-800 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2">
          {/* Add Product */}
          <button
            type="button"
            onClick={onOpenAddProduct}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#12A84A] text-white hover:bg-emerald-600 transition-colors shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Add Product</span>
          </button>

          {/* Backup Data */}
          <button
            type="button"
            onClick={() => setActivePortal('backup')}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#1769E0] text-white hover:bg-blue-700 transition-colors shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Backup Data</span>
          </button>

          {/* View Reports */}
          <button
            type="button"
            onClick={() => setActivePortal('admin')}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#8B5CF6] text-white hover:bg-purple-700 transition-colors shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">View Reports</span>
          </button>

          {/* Manage Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#F97316] text-white hover:bg-orange-600 transition-colors shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-center leading-tight">Manage Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
