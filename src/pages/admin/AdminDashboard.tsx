import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminAnalytics } from '../../types';
import { formatNaira } from '../../utils/formatters';
import {
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Package,
  PackageCheck,
  PackageOpen,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('2026');

  useEffect(() => {
    fetchDashboardData();
  }, [month, year]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.analytics.getAdmin({
        month: month || undefined,
        year: year || undefined,
      });
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Purchase Cost',
      value: formatNaira(analytics?.cards.totalPurchaseCost),
      desc: 'Inventory acquisition spending',
      icon: DollarSign,
      color: 'from-blue-600 to-indigo-600',
      bgLight: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Total Sales Revenue',
      value: formatNaira(analytics?.cards.totalSales),
      desc: 'Total value of items sold',
      icon: ShoppingCart,
      color: 'from-emerald-600 to-teal-600',
      bgLight: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Total Money Collected',
      value: formatNaira(analytics?.cards.totalMoneyCollected),
      desc: 'Actual cash received so far',
      icon: CheckCircle2,
      color: 'from-teal-600 to-cyan-600',
      bgLight: 'bg-teal-50 text-teal-700',
    },
    {
      title: 'Outstanding Payments',
      value: formatNaira(analytics?.cards.outstandingPayments),
      desc: 'Balance owed by installment buyers',
      icon: AlertCircle,
      color: 'from-amber-600 to-orange-600',
      bgLight: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Total Profit',
      value: formatNaira(analytics?.cards.totalProfit),
      desc: 'Selling price minus purchase cost',
      icon: TrendingUp,
      color: 'from-green-600 to-emerald-700',
      bgLight: 'bg-green-50 text-green-700',
    },
    {
      title: 'Items Purchased',
      value: `${analytics?.cards.itemsPurchased || 0} Units`,
      desc: 'Total quantity acquired',
      icon: Package,
      color: 'from-purple-600 to-indigo-600',
      bgLight: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Items Sold',
      value: `${analytics?.cards.itemsSold || 0} Units`,
      desc: 'Total units sold to customers',
      icon: PackageCheck,
      color: 'from-indigo-600 to-blue-600',
      bgLight: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Items Remaining',
      value: `${analytics?.cards.itemsRemaining || 0} Units`,
      desc: 'Available stock in inventory',
      icon: PackageOpen,
      color: 'from-slate-700 to-slate-900',
      bgLight: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header & Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Business Performance Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analytics for inventory acquisition, sales revenue, cash, and profit.
          </p>
        </div>

        {/* Filter Controls (Section 21) */}
        <div className="flex items-center gap-2.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 pl-2 text-slate-400">
            <Calendar className="w-4 h-4" />
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent py-1.5 px-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent py-1.5 px-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* 8 Metric KPI Cards (Section 19) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {card.title}
                  </span>
                  <div className={`p-2 rounded-xl ${card.bgLight} transition`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <span>{card.desc}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts Section (Section 22 & 55) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Growth Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sales & Cash Collection Trend</h3>
              <p className="text-xs text-slate-500">Monthly sales value compared with cash collected</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Sales (₦)
              </span>
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Cash Paid (₦)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics?.salesTrend || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatNaira(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales Revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="cash"
                  name="Cash Collected"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cashGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Status Breakdown Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Inventory Status</h3>
              <span className="text-xs font-semibold text-slate-500">
                {analytics?.inventoryStatus.totalCount || 0} Total Products
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Current stock availability across all categories.
            </p>

            <div className="space-y-4">
              {/* Available */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-xs font-bold text-blue-900">AVAILABLE</span>
                </div>
                <span className="text-base font-black text-blue-900">
                  {analytics?.inventoryStatus.available || 0}
                </span>
              </div>

              {/* Partially Sold */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-amber-900">PARTIALLY SOLD</span>
                </div>
                <span className="text-base font-black text-amber-900">
                  {analytics?.inventoryStatus.partiallySold || 0}
                </span>
              </div>

              {/* Sold Out (Section 8: Subtle green) */}
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-xs font-bold text-emerald-900">SOLD OUT (Completed)</span>
                </div>
                <span className="text-base font-black text-emerald-900">
                  {analytics?.inventoryStatus.soldOut || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Outstanding Installment Balance</span>
              <span className="font-bold text-slate-900">
                {formatNaira(analytics?.cards.outstandingPayments)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Sales Breakdown Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sales by Category</h3>
            <p className="text-xs text-slate-500">Revenue performance generated per product category</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analytics?.categoryStats || []}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: any) => [formatNaira(Number(val)), 'Revenue']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
