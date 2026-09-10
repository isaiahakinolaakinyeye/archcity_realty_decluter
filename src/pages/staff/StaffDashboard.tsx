import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StaffAnalytics } from '../../types';
import { formatNaira } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StaffAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.analytics
        .getStaff({ staffId: user.id })
        .then((data) => setAnalytics(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Section 18: Staff cards (strictly NO purchase cost or profit info)
  const cards = [
    {
      title: "Today's Sales Value",
      value: formatNaira(analytics?.todaySales),
      desc: 'Total value sold today',
      icon: ShoppingCart,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: "This Month's Sales",
      value: formatNaira(analytics?.monthSales),
      desc: 'Sales recorded this calendar month',
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Total Cash Collected',
      value: formatNaira(analytics?.totalCollected),
      desc: 'Actual payments received into store',
      icon: CheckCircle2,
      color: 'bg-teal-50 text-teal-700',
    },
    {
      title: 'Outstanding Installments',
      value: formatNaira(analytics?.outstandingInstallmentBalance),
      desc: 'Pending balances from your customers',
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Total Sales Completed',
      value: `${analytics?.numberOfSales || 0} Orders`,
      desc: 'Total orders recorded',
      icon: Clock,
      color: 'bg-purple-50 text-purple-700',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-700">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Staff Sales Terminal
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-md">
            Record walk-in sales, track installments, and serve resale clients efficiently.
          </p>
        </div>

        <Link
          to="/staff/sales"
          className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Record New Sale</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Staff Statistics Cards (Section 18) */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Performance Metrics
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {card.title}
                    </span>
                    <div className={`p-2 rounded-xl ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {card.value}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Access Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Link
          to="/staff/sales"
          className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 transition group flex items-start gap-4"
        >
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl group-hover:scale-105 transition">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
              Point of Sale
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Quickly look up available inventory and record full or installment transactions in under 1 minute.
            </p>
          </div>
        </Link>

        <Link
          to="/staff/my-sales"
          className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition group flex items-start gap-4"
        >
          <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl group-hover:scale-105 transition">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition">
              My Sales History
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Review all sales you recorded, add follow-up installment payments, and check customer receipts.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};
