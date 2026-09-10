import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Sale } from '../../types';
import { formatNaira, formatShortDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { AddPaymentModal } from '../../components/sales/AddPaymentModal';
import { PaymentHistoryModal } from '../../components/sales/PaymentHistoryModal';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  Search,
  CreditCard,
  History,
  Calendar,
  Filter,
} from 'lucide-react';

export const StaffMySales: React.FC = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('2026');

  // Modals
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetchMySales();
  }, [statusFilter, month, year]);

  const fetchMySales = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.sales.getAll({
        soldBy: user.id,
        paymentStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
        month: month || undefined,
        year: year || undefined,
        search: search || undefined,
      });
      setSales(data);
    } catch (err) {
      console.error('Failed to load my sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMySales();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Sales History
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review sales and installment balances recorded under your terminal account.
        </p>
      </div>

      {/* Filter and Search Bar (Section 17) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product, customer, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY PAID">Partially Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>

          {/* Month Filter */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">All Months</option>
            <option value="1">Jan</option>
            <option value="2">Feb</option>
            <option value="3">Mar</option>
            <option value="4">Apr</option>
            <option value="5">May</option>
            <option value="6">Jun</option>
            <option value="7">Jul</option>
            <option value="8">Aug</option>
            <option value="9">Sep</option>
            <option value="10">Oct</option>
            <option value="11">Nov</option>
            <option value="12">Dec</option>
          </select>

          <button
            type="button"
            onClick={fetchMySales}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : sales.length === 0 ? (
        <EmptyState
          title="No sales recorded yet"
          description="You have not recorded any sales matching this filter criteria."
          actionText="Go to Sales Terminal"
          onAction={() => (window.location.href = '/staff/sales')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sale Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{sale.productName}</span>
                      <span className="text-[10px] text-slate-400">{sale.categoryName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sale.buyerName}</div>
                      <div className="text-[11px] text-slate-500">{sale.buyerPhone}</div>
                      {sale.buyerAddress && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={sale.buyerAddress}>
                          📍 {sale.buyerAddress}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      <div>{sale.quantity}</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        @{formatNaira(sale.sellingPricePerUnit)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {formatNaira(sale.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatNaira(sale.amountPaid)}
                    </td>

                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={
                          sale.balance > 0 ? 'text-amber-700 font-extrabold' : 'text-slate-400'
                        }
                      >
                        {formatNaira(sale.balance)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={sale.paymentStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {formatShortDate(sale.saleDate)}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {sale.balance > 0 && (
                        <button
                          onClick={() => {
                            setSelectedSale(sale);
                            setAddPaymentOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs transition border border-emerald-200"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setHistoryOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="Payment History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddPaymentModal
        isOpen={addPaymentOpen}
        sale={selectedSale}
        onClose={() => setAddPaymentOpen(false)}
        onPaymentSuccess={() => fetchMySales()}
      />

      <PaymentHistoryModal
        isOpen={historyOpen}
        sale={selectedSale}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
};
