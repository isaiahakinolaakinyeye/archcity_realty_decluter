import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Product, Customer, Sale } from '../../types';
import { formatNaira } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  User,
  Phone,
  CreditCard,
  RotateCcw,
  MapPin,
} from 'lucide-react';

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (sale: Sale) => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPriceInput, setUnitPriceInput] = useState<string>('');

  // Customer info
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Payment info
  const [paymentType, setPaymentType] = useState<'FULL' | 'INSTALLMENT'>('FULL');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Post-sale success state (Section 53)
  const [saleResult, setSaleResult] = useState<{
    sale: Sale;
    product: Product;
    customer: Customer;
  } | null>(null);

  // Fetch only available products when modal opens (Section 10 & 35)
  useEffect(() => {
    if (isOpen) {
      resetForm();
      api.inventory.getAll({ availableOnly: true }).then((prods) => {
        setAvailableProducts(prods);
      });
    }
  }, [isOpen]);

  const resetForm = () => {
    setSelectedProduct(null);
    setSearchQuery('');
    setQuantity(1);
    setUnitPriceInput('');
    setCustomerPhone('');
    setCustomerName('');
    setCustomerAddress('');
    setPaymentType('FULL');
    setAmountPaidInput('');
    setSaleResult(null);
  };

  // Phone lookup helper: if customer exists, auto-fill name and address
  const handlePhoneChange = async (phone: string) => {
    setCustomerPhone(phone);
    const clean = phone.trim();
    if (clean.length >= 7) {
      try {
        const matches = await api.customers.getAll({ search: clean });
        const exact = matches.find((c) => c.phone.replace(/[\s-]/g, '') === clean.replace(/[\s-]/g, ''));
        if (exact) {
          setCustomerName(exact.name);
          if (exact.address) setCustomerAddress(exact.address);
        }
      } catch {}
    }
  };

  const handleProductSelect = (prod: Product) => {
    setSelectedProduct(prod);
    setQuantity(1);
    const priceStr = (prod.sellingPricePerUnit ?? 0).toString();
    setUnitPriceInput(priceStr);
    setAmountPaidInput(priceStr);
  };

  // Unit selling price (negotiable / bargaining)
  const unitSellingPrice = Math.max(0, parseFloat(unitPriceInput) || 0);
  const totalSaleAmount = selectedProduct ? unitSellingPrice * quantity : 0;
  const initialPaid =
    paymentType === 'FULL'
      ? totalSaleAmount
      : Math.min(totalSaleAmount, Math.max(0, parseFloat(amountPaidInput) || 0));
  const remainingBalance = Math.max(0, totalSaleAmount - initialPaid);

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error('Please choose a product to sell');
      return;
    }
    if (quantity <= 0 || quantity > selectedProduct.quantityRemaining) {
      toast.error(`Quantity must be between 1 and ${selectedProduct.quantityRemaining}`);
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Customer phone number is required');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.sales.create({
        productId: selectedProduct.id,
        quantity,
        buyerName: customerName.trim(),
        buyerPhone: customerPhone.trim(),
        buyerAddress: customerAddress.trim() || undefined,
        sellingPricePerUnit: unitSellingPrice,
        amountPaid: initialPaid,
        paymentType,
        soldBy: user?.id || 'user-staff-1',
      });

      toast.success('Sale successfully recorded!');
      setSaleResult({
        sale: res.sale,
        product: res.product,
        customer: res.customer,
      });

      if (onSuccess) {
        onSuccess(res.sale);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error recording sale');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.quantityRemaining > 0 &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={saleResult ? 'Sale Confirmation' : 'Record New Sale'}
      subtitle={
        saleResult
          ? 'Transaction recorded & inventory deducted'
          : 'Rapid point of sale workflow (< 1 minute)'
      }
      maxWidth={saleResult ? 'md' : '2xl'}
    >
      {/* SECTION 53: SUCCESS SCREEN */}
      {saleResult ? (
        <div className="space-y-6 py-2 text-center sm:text-left">
          <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-600/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-extrabold text-emerald-900">Sale Recorded Successfully</h4>
            <p className="text-xs text-emerald-700 mt-1">
              Inventory updated: {saleResult.product.quantityRemaining} units now remaining.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Product:</span>
              <span className="font-bold text-slate-900">{saleResult.product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Quantity & Price:</span>
              <span className="font-bold text-slate-900">
                {saleResult.sale.quantity} units @ {formatNaira(saleResult.sale.sellingPricePerUnit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Buyer:</span>
              <span className="font-bold text-slate-900">
                {saleResult.customer.name} ({saleResult.customer.phone})
              </span>
            </div>
            {saleResult.customer.address && (
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="font-medium text-slate-700">{saleResult.customer.address}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
              <span className="text-slate-600">Total Sale Amount:</span>
              <span className="text-slate-900 font-bold">
                {formatNaira(saleResult.sale.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Amount Paid:</span>
              <span className="text-emerald-700 font-bold">
                {formatNaira(saleResult.sale.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Remaining Balance:</span>
              <span
                className={saleResult.sale.balance > 0 ? 'text-amber-700 font-bold' : 'text-slate-900'}
              >
                {formatNaira(saleResult.sale.balance)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-500">Payment Status:</span>
              <StatusBadge status={saleResult.sale.paymentStatus} size="sm" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={resetForm}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Record Another Sale</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Done / Close
            </button>
          </div>
        </div>
      ) : (
        /* FAST SELLING FORM */
        <form onSubmit={handleSubmitSale} className="space-y-6">
          {/* 1. PRODUCT SEARCH & SELECTION (Section 10 & 35) */}
          {!selectedProduct ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Step 1: Search & Select Available Product
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search available products by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-100 pr-1">
                {filteredProducts.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">
                    No available products match your search. Sold-out items are hidden.
                  </p>
                ) : (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleProductSelect(p)}
                      className="p-3 rounded-xl hover:bg-emerald-50/60 border border-transparent hover:border-emerald-200 cursor-pointer transition flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-11 h-11 rounded-lg object-cover bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-500">{p.categoryName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">
                          {formatNaira(p.sellingPricePerUnit)}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {p.quantityRemaining} available
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Selected Product Summary Box */
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {selectedProduct.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-emerald-700">
                      {formatNaira(selectedProduct.sellingPricePerUnit)} / unit
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      ({selectedProduct.quantityRemaining} units in stock)
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline p-1 shrink-0"
              >
                Change Product
              </button>
            </div>
          )}

          {/* 2. QUANTITY, NEGOTIATED PRICE & BUYER DETAILS */}
          {selectedProduct && (
            <>
              {/* Product Pricing & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity to Sell *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.quantityRemaining}
                    value={quantity}
                    onChange={(e) => {
                      const newQty = Math.max(
                        1,
                        Math.min(
                          selectedProduct.quantityRemaining,
                          parseInt(e.target.value || '1', 10)
                        )
                      );
                      setQuantity(newQty);
                      if (paymentType === 'FULL') {
                        setAmountPaidInput((unitSellingPrice * newQty).toString());
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Available stock: {selectedProduct.quantityRemaining} units
                  </span>
                </div>

                {/* Selling Price per Unit (Negotiable / Bargaining) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Selling Price per Unit (₦) *
                    </label>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Bargaining allowed
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 25000"
                    value={unitPriceInput}
                    onChange={(e) => {
                      const newPrice = e.target.value;
                      setUnitPriceInput(newPrice);
                      const parsed = Math.max(0, parseFloat(newPrice) || 0);
                      if (paymentType === 'FULL') {
                        setAmountPaidInput((parsed * quantity).toString());
                      }
                    }}
                    className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Pre-filled with set price. Adjust if negotiated.
                  </span>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Buyer Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Customer Phone (Unique Key) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Buyer Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 08031234567"
                        value={customerPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Auto-detects existing buyers.
                    </span>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Buyer Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tunde Adeyemi"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Buyer Address (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. No 15 Stadium Road, Ilorin"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. PAYMENT DETAILS (Sections 14, 15, 16) */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Payment Plan
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType('FULL');
                        setAmountPaidInput(totalSaleAmount.toString());
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        paymentType === 'FULL'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Full Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType('INSTALLMENT');
                        setAmountPaidInput('');
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        paymentType === 'INSTALLMENT'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Installment
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-emerald-100">
                    <span className="text-slate-400 block text-[10px]">Total Sale Value</span>
                    <span className="text-base font-black text-slate-900">
                      {formatNaira(totalSaleAmount)}
                    </span>
                  </div>

                  {paymentType === 'INSTALLMENT' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Amount Paid Now (₦) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max={totalSaleAmount}
                        placeholder="e.g. 20000"
                        value={amountPaidInput}
                        onChange={(e) => setAmountPaidInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ) : (
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-slate-400 block text-[10px]">Paid in Full</span>
                      <span className="text-base font-black text-emerald-700">
                        {formatNaira(totalSaleAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {paymentType === 'INSTALLMENT' && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-100">
                    <span className="font-semibold text-slate-600">Remaining Balance:</span>
                    <span className="font-black text-amber-700">{formatNaira(remainingBalance)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  <span>Complete Sale</span>
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </Modal>
  );
};
