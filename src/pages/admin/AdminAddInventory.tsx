import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Category } from '../../types';
import { formatNaira } from '../../utils/formatters';
import { useToast } from '../../components/common/Toast';
import {
  ArrowLeft,
  PackagePlus,
  Eye,
  CheckCircle2,
  User,
  Camera,
  Upload,
  X,
  Loader2,
  ImageIcon,
} from 'lucide-react';

export const AdminAddInventory: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    categoryId: '',
    quantity: '1',
    purchasePricePerUnit: '',
    sellingPricePerUnit: '',
    sellerName: '',
    sellerPhone: '',
    sellerAddress: '',
    purchaseDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    api.categories.getAll().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const qty = parseInt(formData.quantity || '0', 10);
  const cost = parseFloat(formData.purchasePricePerUnit || '0');
  const price = parseFloat(formData.sellingPricePerUnit || '0');
  const unitProfit = price && cost ? price - cost : null;
  const totalPotentialProfit = unitProfit !== null ? unitProfit * qty : null;

  // ─── Image upload helpers ────────────────────────────────────────────
  const uploadImageToCloudinary = async (file: File) => {
    setImageUploading(true);
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Show preview immediately
      setImagePreview(base64);

      // Upload to backend → Cloudinary
      const json = await api.upload(base64);

      setFormData((prev) => ({ ...prev, image: json.url }));
      setImagePreview(json.url);
      toast.success('Image uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed. You can still save with a URL or no image.');
      setImagePreview('');
      setFormData((prev) => ({ ...prev, image: '' }));
    } finally {
      setImageUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    uploadImageToCloudinary(file);
  };

  const clearImage = () => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // ─── Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) { toast.error('Product name is required'); return; }
    if (!formData.categoryId) { toast.error('Please select a category'); return; }
    if (qty <= 0) { toast.error('Quantity must be greater than 0'); return; }
    if (cost < 0 || isNaN(cost)) { toast.error('Please enter a valid purchase cost'); return; }
    if (!formData.sellerName.trim()) { toast.error('Seller name is required'); return; }
    if (!formData.sellerPhone.trim()) { toast.error('Seller phone number is required'); return; }

    setLoading(true);
    try {
      await api.inventory.create({
        name: formData.name.trim(),
        image: formData.image.trim() || undefined,
        categoryId: formData.categoryId,
        quantity: qty,
        purchasePricePerUnit: cost,
        sellingPricePerUnit: price || 0,
        sellerName: formData.sellerName.trim(),
        sellerPhone: formData.sellerPhone.trim(),
        sellerAddress: formData.sellerAddress.trim() || undefined,
        purchaseDate: new Date(formData.purchaseDate).toISOString(),
      });
      toast.success('Inventory item registered successfully!');
      navigate('/admin/inventory');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add inventory item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/inventory"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Add New Inventory Item
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register items acquired from sellers for resale with multi-unit support.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

          {/* Product Details */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <PackagePlus className="w-4 h-4 text-emerald-600" />
              <span>Product Information</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ergonomic Office Chair or Samsung Smart TV"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Image Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Image <span className="font-normal text-slate-400">(Optional)</span>
              </label>

              {imagePreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {imageUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-semibold">Uploading to cloud…</span>
                      </div>
                    </div>
                  )}
                  {!imageUploading && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Add a product photo</p>
                    <p className="text-xs text-slate-400 mt-0.5">Upload from your files or take a photo directly</p>
                  </div>
                  <div className="flex gap-2">
                    {/* File upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload-input"
                    />
                    <label
                      htmlFor="file-upload-input"
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload File
                    </label>

                    {/* Camera capture */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                      id="camera-capture-input"
                    />
                    <label
                      htmlFor="camera-capture-input"
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Take Photo
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400">JPG, PNG, WEBP — max 10MB</p>
                </div>
              )}

              {/* Fallback: manual URL if no upload */}
              {!imagePreview && (
                <div className="mt-2">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Or paste an image URL instead
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={(e) => {
                      handleChange(e);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Quantity Acquired *</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                {qty > 1 && (
                  <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                    Multi-unit item: prices below are <strong>PER UNIT</strong>.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Purchase Cost Per Unit (₦) *
                </label>
                <input
                  type="number"
                  name="purchasePricePerUnit"
                  step="any"
                  min="0"
                  required
                  value={formData.purchasePricePerUnit}
                  onChange={handleChange}
                  placeholder="e.g. 25000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Selling Price Per Unit (₦){' '}
                  <span className="text-slate-400 font-normal">— Optional</span>
                </label>
                <input
                  type="number"
                  name="sellingPricePerUnit"
                  step="any"
                  min="0"
                  value={formData.sellingPricePerUnit}
                  onChange={handleChange}
                  placeholder="Set later if unknown"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <p className="text-[10px] text-slate-400 mt-1">Can be set or updated later.</p>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-blue-600" />
              <span>Seller (Acquisition Source)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Seller Full Name *</label>
                <input
                  type="text"
                  name="sellerName"
                  required
                  value={formData.sellerName}
                  onChange={handleChange}
                  placeholder="e.g. Ibrahim Musa"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Seller Phone Number *</label>
                <input
                  type="tel"
                  name="sellerPhone"
                  required
                  value={formData.sellerPhone}
                  onChange={handleChange}
                  placeholder="e.g. 08031234567"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Seller Address (Optional)</label>
                <input
                  type="text"
                  name="sellerAddress"
                  value={formData.sellerAddress}
                  onChange={handleChange}
                  placeholder="e.g. 14 Admiralty Way, Lekki"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/admin/inventory"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Save Inventory Item</span>
            </button>
          </div>
        </form>

        {/* Live Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Eye className="w-4 h-4 text-slate-400" />
            <span>Live Item Preview</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 sticky top-24">
            <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-400 gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">No image yet</span>
                </div>
              )}
            </div>

            <div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                {categories.find((c) => c.id === formData.categoryId)?.name || 'Category'}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {formData.name || 'Product Title Preview'}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Cost / Unit</span>
                <span className="font-bold text-slate-700">{formatNaira(cost)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Selling Price</span>
                <span className="font-bold text-emerald-700">
                  {price ? formatNaira(price) : <span className="text-slate-400 italic">Not set</span>}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Units Acquired</span>
                <span className="font-bold text-slate-900">{qty} units</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Unit Margin</span>
                <span className="font-bold text-blue-600">
                  {unitProfit !== null ? formatNaira(unitProfit) : <span className="text-slate-400 italic">—</span>}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Total Spending:</span>
                <span>{formatNaira(cost * qty)}</span>
              </div>
              {totalPotentialProfit !== null && (
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Potential Profit:</span>
                  <span>{formatNaira(totalPotentialProfit)}</span>
                </div>
              )}
            </div>

            {formData.sellerName && (
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Seller: <strong>{formData.sellerName}</strong> ({formData.sellerPhone || 'no phone'})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
