import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Customer } from '../../types';
import { formatNaira, formatShortDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Search,
  ArrowRight,
  Phone,
  ShoppingBag,
  Package,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchCustomers();
  }, [filter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.customers.getAll({
        filter: filter !== 'ALL' ? filter : undefined,
        search: search || undefined,
      });
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Directory
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Grouped by unique phone numbers. Track buyers, sellers, and dual clients.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar (Section 27) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer by name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </form>

        {/* Section 27 Filters */}
        <div className="flex items-center gap-2.5">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Customers</option>
            <option value="BUYING">Buyers Only</option>
            <option value="SELLING">Sellers Only</option>
            <option value="MOST_FREQUENT_BUYERS">Most Frequent Buyers</option>
            <option value="HIGHEST_VALUE_BUYERS">Highest-Value Buyers</option>
            <option value="MOST_PAYING_CUSTOMERS">Most Paying Customers</option>
            <option value="MOST_FREQUENT_SELLERS">Most Frequent Sellers</option>
            <option value="HIGHEST_VALUE_SELLERS">Highest-Value Sellers</option>
            <option value="OUTSTANDING_BALANCE">With Outstanding Balance</option>
          </select>

          <button
            type="button"
            onClick={fetchCustomers}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Customers Table (Section 26) */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customer records found"
          description="No customers match your selected filter. Customer records are automatically created/linked during sales and inventory additions."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Relationship</th>
                  <th className="py-3 px-4 text-center">Purchases</th>
                  <th className="py-3 px-4">Total Purchased</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Balance Owed</th>
                  <th className="py-3 px-4">Sold to Us</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    {/* Name & Phone */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                    </td>

                    {/* Customer Type Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.customerType || 'PROSPECT'} size="sm" />
                    </td>

                    {/* Purchase Count */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {c.purchaseCount || 0}
                    </td>

                    {/* Total Purchased */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatNaira(c.totalPurchased)}
                    </td>

                    {/* Total Paid */}
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatNaira(c.totalPaid)}
                    </td>

                    {/* Outstanding Balance */}
                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={
                          (c.outstandingBalance || 0) > 0
                            ? 'text-amber-700 font-extrabold'
                            : 'text-slate-400'
                        }
                      >
                        {formatNaira(c.outstandingBalance)}
                      </span>
                    </td>

                    {/* Items Sold to Business */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-bold">
                        {c.itemsSoldToBusinessCount || 0} units
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Received: {formatNaira(c.totalReceivedByCustomer)}
                      </div>
                    </td>

                    {/* Last Transaction Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatShortDate(c.lastTransactionDate)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
