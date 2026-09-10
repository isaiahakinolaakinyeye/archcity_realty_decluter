import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Product, Category } from '../../types';
import { formatNaira, formatShortDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/Toast';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Package,
  Layers,
  Phone,
  User,
  ArrowUpDown,
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        api.inventory.getAll({
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          search: search || undefined,
        }),
        api.categories.getAll(),
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err: any) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    setIsDeleting(true);
    try {
      await api.inventory.delete(selectedProduct.id);
      toast.success('Product deleted successfully');
      setDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Cannot delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Products
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage multi-unit inventory, purchase costs, resale prices, and sellers.
          </p>
        </div>
        <Link
          to="/admin/inventory/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar (Section 9) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product, seller name, phone, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="PARTIALLY SOLD">Partially Sold</option>
            <option value="SOLD OUT">Sold Out</option>
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
            onClick={fetchData}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Inventory Table / Responsive Cards (Section 8, Section 33, Section 47) */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No inventory items found"
          description="No products match your current search and filter criteria. Try adjusting your filters or add a new item."
          actionText="Add New Product"
          onAction={() => (window.location.href = '/admin/inventory/new')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Desktop & Tablet Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Units (Total / Sold / Rem)</th>
                  <th className="py-3 px-4">Purchase Cost</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Potential Profit</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {products.map((item) => {
                  const isSoldOut = item.status === 'SOLD OUT';
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition ${
                        // Section 8: Completely sold items should have a subtle green background/tint
                        isSoldOut ? 'bg-emerald-50/40 border-l-4 border-l-emerald-500' : ''
                      }`}
                    >
                      {/* Product Image & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Added {formatShortDate(item.purchaseDate)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {item.categoryName}
                        </span>
                      </td>

                      {/* Units (Total / Sold / Remaining) */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold">
                          <span className="text-slate-900">{item.quantityPurchased}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-blue-600">{item.quantitySold}</span>
                          <span className="text-slate-300">/</span>
                          <span
                            className={
                              item.quantityRemaining === 0 ? 'text-emerald-700 font-extrabold' : 'text-slate-700'
                            }
                          >
                            {item.quantityRemaining}
                          </span>
                        </div>
                        <span className="block text-[10px] text-slate-400">Total / Sold / Rem</span>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        {formatNaira(item.purchasePricePerUnit)}
                        <span className="text-[10px] text-slate-400 block font-normal">per unit</span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatNaira(item.sellingPricePerUnit)}
                        <span className="text-[10px] text-slate-400 block font-normal">per unit</span>
                      </td>

                      {/* Potential Profit */}
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {formatNaira(item.unitProfit)}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Total: {formatNaira(item.potentialTotalProfit)}
                        </span>
                      </td>

                      {/* Seller */}
                      <td className="py-3 px-4">
                        <div className="text-slate-900 font-semibold">{item.seller?.name || '-'}</div>
                        <div className="text-[11px] text-slate-500">{item.seller?.phone || ''}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProduct(item);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (Section 33 & 47) */}
          <div className="md:hidden divide-y divide-slate-100">
            {products.map((item) => {
              const isSoldOut = item.status === 'SOLD OUT';
              return (
                <div
                  key={item.id}
                  className={`p-4 space-y-3 ${
                    isSoldOut ? 'bg-emerald-50/40 border-l-4 border-l-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </span>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        {item.categoryName}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 block mt-1">
                        Resale: {formatNaira(item.sellingPricePerUnit)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Units</span>
                      <span className="font-bold text-slate-900">{item.quantityPurchased}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Units Sold</span>
                      <span className="font-bold text-blue-600">{item.quantitySold}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Remaining</span>
                      <span className="font-bold text-emerald-600">{item.quantityRemaining}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Seller: {item.seller?.name || '-'}</span>
                    <button
                      onClick={() => {
                        setSelectedProduct(item);
                        setDeleteModalOpen(true);
                      }}
                      className="text-rose-600 font-semibold p-1 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Destructive Action */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? If any sales are linked to this item, the deletion will be rejected for transaction safety.`}
        confirmText="Delete Product"
        isLoading={isDeleting}
      />
    </div>
  );
};
