import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatNaira, formatShortDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Package,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  User,
} from 'lucide-react';

export const AdminCustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.customers
        .getById(id)
        .then((data) => setCustomer(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <TableSkeleton rows={6} />;

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Customer profile not found.</p>
        <Link
          to="/admin/customers"
          className="text-emerald-600 font-bold text-xs mt-2 inline-block hover:underline"
        >
          Return to directory
        </Link>
      </div>
    );
  }

  const { stats, buyingTransactions, sellingTransactions } = customer;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button & Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/customers"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {customer.name}
            </h2>
            <StatusBadge status={customer.customerType} size="sm" />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {customer.phone}
            </span>
            {customer.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {customer.address}
              </span>
            )}
            <span className="text-slate-400">
              Joined {formatShortDate(customer.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Key Statistics Cards (Section 28) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Purchases
          </span>
          <span className="text-lg font-black text-slate-900 mt-1 block">
            {stats.purchaseCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Spent
          </span>
          <span className="text-lg font-black text-slate-900 mt-1 block">
            {formatNaira(stats.totalSpent)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Paid
          </span>
          <span className="text-lg font-black text-emerald-700 mt-1 block">
            {formatNaira(stats.totalPaid)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Balance Owed
          </span>
          <span
            className={`text-lg font-black mt-1 block ${
              stats.outstandingBalance > 0 ? 'text-amber-700' : 'text-slate-900'
            }`}
          >
            {formatNaira(stats.outstandingBalance)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Items Sold to Us
          </span>
          <span className="text-lg font-black text-blue-700 mt-1 block">
            {stats.itemsSoldToBusinessCount} units
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Paid to Seller
          </span>
          <span className="text-lg font-black text-teal-700 mt-1 block">
            {formatNaira(stats.totalReceivedByCustomer)}
          </span>
        </div>
      </div>

      {/* Buying Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <span>Purchases / Buying Transactions ({buyingTransactions.length})</span>
        </h3>

        {buyingTransactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No product purchases recorded for this customer.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2">Unit Price</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Amount Paid</th>
                  <th className="pb-2">Balance</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {buyingTransactions.map((tx: any) => (
                  <tr key={tx.saleId} className="hover:bg-slate-50/60">
                    <td className="py-3 font-bold text-slate-900">{tx.productName}</td>
                    <td className="py-3 text-center">{tx.quantity}</td>
                    <td className="py-3">{formatNaira(tx.unitPrice)}</td>
                    <td className="py-3 font-bold text-slate-900">{formatNaira(tx.totalAmount)}</td>
                    <td className="py-3 text-emerald-700 font-bold">{formatNaira(tx.amountPaid)}</td>
                    <td className="py-3 text-amber-700 font-bold">{formatNaira(tx.balance)}</td>
                    <td className="py-3 text-slate-500">{formatShortDate(tx.date)}</td>
                    <td className="py-3 text-right">
                      <StatusBadge status={tx.paymentStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selling Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Package className="w-4 h-4 text-blue-600" />
          <span>Items Sold to Business ({sellingTransactions.length})</span>
        </h3>

        {sellingTransactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            This customer has not sold any items to the business.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                  <th className="pb-2">Item Acquired</th>
                  <th className="pb-2 text-center">Quantity</th>
                  <th className="pb-2">Purchase Cost / Unit</th>
                  <th className="pb-2">Total Paid to Seller</th>
                  <th className="pb-2">Acquisition Date</th>
                  <th className="pb-2 text-right">Inventory Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sellingTransactions.map((tx: any) => (
                  <tr key={tx.productId} className="hover:bg-slate-50/60">
                    <td className="py-3 font-bold text-slate-900">{tx.productName}</td>
                    <td className="py-3 text-center">{tx.quantity}</td>
                    <td className="py-3">{formatNaira(tx.purchasePricePerUnit)}</td>
                    <td className="py-3 font-bold text-teal-700">{formatNaira(tx.totalReceived)}</td>
                    <td className="py-3 text-slate-500">{formatShortDate(tx.date)}</td>
                    <td className="py-3 text-right">
                      <StatusBadge status={tx.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
