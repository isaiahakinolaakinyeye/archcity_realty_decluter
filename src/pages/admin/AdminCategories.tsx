import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Category } from '../../types';
import { formatNaira } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { useToast } from '../../components/common/Toast';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (err: any) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.categories.update(editingCategory.id, categoryName.trim());
        toast.success('Category updated successfully');
      } else {
        await api.categories.create(categoryName.trim());
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await api.categories.delete(categoryToDelete.id);
      toast.success('Category deleted successfully');
      setDeleteOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Cannot delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Categories & Catalog Usage
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic database categories with product inventory counts and revenue analytics.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Table (Section 30: Category Usage) */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-center">Units (Bought / Sold / Left)</th>
                  <th className="py-3 px-4">Purchase Cost</th>
                  <th className="py-3 px-4">Sales Revenue</th>
                  <th className="py-3 px-4">Realized Profit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{cat.name}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {cat.productCount || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold">
                      <span className="text-slate-900">{cat.totalUnitsPurchased || 0}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-blue-600">{cat.totalUnitsSold || 0}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-emerald-700 font-bold">
                        {cat.totalUnitsRemaining || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {formatNaira(cat.totalPurchaseCost)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatNaira(cat.totalSalesRevenue)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatNaira(cat.realizedProfit)}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setCategoryToDelete(cat);
                          setDeleteOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        maxWidth="sm"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Office Equipment, Electronics, Fashion"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog (Section 40) */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? A category cannot be deleted if products are currently assigned to it.`}
        confirmText="Delete"
      />
    </div>
  );
};
