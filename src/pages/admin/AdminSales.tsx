import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Sale, Category } from '../../types';
import { formatNaira, formatShortDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { RecordSaleModal } from '../../components/sales/RecordSaleModal';
import { AddPaymentModal } from '../../components/sales/AddPaymentModal';
import { PaymentHistoryModal } from '../../components/sales/PaymentHistoryModal';
import {
  Plus,
  Search,
  History,
  CreditCard,
  ShoppingBag,
  Filter,
  User,
  Phone,
  Calendar,
} from 'lucide-react';

export const AdminSales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetchSales();
  }, [paymentStatus, categoryFilter]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const [salesData, cats] = await Promise.all([
        api.sales.getAll({
          paymentStatus: paymentStatus !== 'ALL' ? paymentStatus : undefined,
          categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          search: search || undefined,
        }),
        api.categories.getAll(),
      ]);
      setSales(salesData);
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSales();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sales & Transactions
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Complete transaction ledger for all full-payment and installment sales.
          </p>
        </div>

        <button
          onClick={() => setSaleModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Filter and Search Bar (Section 24 & 51) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product, customer name, phone, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Section 51: Installment Filter (All, Paid, Partially Paid, Unpaid) */}
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIALLY PAID">Partially Paid (Installments)</option>
            <option value="UNPAID">Unpaid</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={fetchSales}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Sales Table (Section 24) */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : sales.length === 0 ? (
        <EmptyState
          title="No sales transactions found"
          description="No sales match your current search or payment status filter."
          actionText="Record a Sale"
          onAction={() => setSaleModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Product & Category</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date & Staff</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition">
                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={sale.productImage}
                          alt={sale.productName}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate max-w-xs">
                            {sale.productName}
                          </span>
                          <span className="text-[10px] text-slate-400">{sale.categoryName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sale.buyerName}</div>
                      <div className="text-[11px] text-slate-500">{sale.buyerPhone}</div>
                      {sale.buyerAddress && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={sale.buyerAddress}>
                          📍 {sale.buyerAddress}
                        </div>
                      )}
                    </td>

                    {/* Quantity & Unit Price */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      <div>{sale.quantity}</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        @{formatNaira(sale.sellingPricePerUnit)}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {formatNaira(sale.totalAmount)}
                    </td>

                    {/* Amount Paid */}
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatNaira(sale.amountPaid)}
                    </td>

                    {/* Remaining Balance */}
                    <td className="py-3.5 px-4 font-bold">
                      <span className={sale.balance > 0 ? 'text-amber-700 font-extrabold' : 'text-slate-400'}>
                        {formatNaira(sale.balance)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={sale.paymentStatus} size="sm" />
                    </td>

                    {/* Date & Staff */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-900 font-semibold block">
                        {formatShortDate(sale.saleDate)}
                      </span>
                      <span className="text-[10px] text-slate-400">By: {sale.soldByName || 'Staff'}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {/* Add payment button if balance > 0 */}
                      {sale.balance > 0 && (
                        <button
                          onClick={() => {
                            setSelectedSale(sale);
                            setAddPaymentModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs transition border border-emerald-200"
                          title="Record next installment payment"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay</span>
                        </button>
                      )}

                      {/* Payment history button */}
                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setHistoryModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="View payment transaction history"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-100">
            {sales.map((sale) => (
              <div key={sale.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">{sale.productName}</span>
                  <StatusBadge status={sale.paymentStatus} size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Buyer: {sale.buyerName} ({sale.buyerPhone})</span>
                  <span>{formatShortDate(sale.saleDate)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total</span>
                    <span className="font-bold text-slate-900">{formatNaira(sale.totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Paid</span>
                    <span className="font-bold text-emerald-700">{formatNaira(sale.amountPaid)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Balance</span>
                    <span className="font-bold text-amber-700">{formatNaira(sale.balance)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  {sale.balance > 0 && (
                    <button
                      onClick={() => {
                        setSelectedSale(sale);
                        setAddPaymentModalOpen(true);
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      Record Payment
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedSale(sale);
                      setHistoryModalOpen(true);
                    }}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    History
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      <RecordSaleModal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        onSuccess={() => fetchSales()}
      />

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={addPaymentModalOpen}
        sale={selectedSale}
        onClose={() => setAddPaymentModalOpen(false)}
        onPaymentSuccess={() => fetchSales()}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={historyModalOpen}
        sale={selectedSale}
        onClose={() => setHistoryModalOpen(false)}
      />
    </div>
  );
};
