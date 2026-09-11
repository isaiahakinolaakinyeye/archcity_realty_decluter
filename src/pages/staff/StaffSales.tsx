import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Product, Customer, Sale } from '../../types';
import { formatNaira, formatNumberWithCommas, parseRawPrice } from '../../utils/formatters';

import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  User,
  Phone,
  CreditCard,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MapPin,
} from 'lucide-react';

export const StaffSales: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPriceInput, setUnitPriceInput] = useState<string>('');

  // Customer state
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Payment state
  const [paymentType, setPaymentType] = useState<'FULL' | 'INSTALLMENT'>('FULL');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Success result state (Section 53)
  const [saleResult, setSaleResult] = useState<{
    sale: Sale;
    product: Product;
    customer: Customer;
  } | null>(null);

  useEffect(() => {
    fetchAvailable();
  }, []);

  // Section 10: Search results must ONLY show products that still have available quantity!
  const fetchAvailable = async () => {
    try {
      const data = await api.inventory.getAll({ availableOnly: true });
      setAvailableProducts(data);
    } catch (err) {
      console.error('Failed to load available products:', err);
    }
  };

  const resetFlow = () => {
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
    fetchAvailable();
  };

  const handlePhoneChange = async (phone: string) => {
    setCustomerPhone(phone);
    const clean = phone.trim();
    if (clean.length >= 7) {
      try {
        const matches = await api.customers.getAll({ search: clean });
        const exact = matches.find(
          (c) => c.phone.replace(/[\s-]/g, '') === clean.replace(/[\s-]/g, '')
        );
        if (exact) {
          setCustomerName(exact.name);
          if (exact.address) setCustomerAddress(exact.address);
        }
      } catch {}
    }
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setQuantity(1);
    const priceVal = prod.sellingPricePerUnit ?? 0;
    setUnitPriceInput(formatNumberWithCommas(priceVal));
    setAmountPaidInput(formatNumberWithCommas(priceVal));
  };

  // Unit selling price (bargaining allowed)
  const unitSellingPrice = parseRawPrice(unitPriceInput);
  const totalSaleAmount = selectedProduct ? unitSellingPrice * quantity : 0;
  const initialPaid =
    paymentType === 'FULL'
      ? totalSaleAmount
      : Math.min(totalSaleAmount, parseRawPrice(amountPaidInput));
  const remainingBalance = Math.max(0, totalSaleAmount - initialPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error('Please select an item to sell');
      return;
    }
    if (quantity <= 0 || quantity > selectedProduct.quantityRemaining) {
      toast.error(`Invalid quantity. Only ${selectedProduct.quantityRemaining} units available.`);
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

      toast.success('Sale successfully completed!');
      setSaleResult({
        sale: res.sale,
        product: res.product,
        customer: res.customer,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to record sale');
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Point of Sale</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Fast resale checkout flow. Completely sold-out items are automatically excluded.
        </p>
      </div>

      {/* SUCCESS SCREEN (Section 53) */}
      {saleResult ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-center max-w-lg mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">Sale Recorded Successfully</h3>
            <p className="text-xs text-slate-500 mt-1">
              Transaction has been registered and inventory stock updated.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-left space-y-3">
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
              <span className="text-slate-500">Remaining in Stock:</span>
              <span className="font-bold text-emerald-700">
                {saleResult.product.quantityRemaining} units
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
                <span className="text-slate-500">Buyer Address:</span>
                <span className="font-medium text-slate-700">{saleResult.customer.address}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Amount:</span>
              <span>{formatNaira(saleResult.sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-700">
              <span>Amount Paid:</span>
              <span>{formatNaira(saleResult.sale.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-600">Remaining Balance:</span>
              <span className={saleResult.sale.balance > 0 ? 'text-amber-700' : 'text-slate-900'}>
                {formatNaira(saleResult.sale.balance)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
              <span className="text-slate-500">Payment Status:</span>
              <StatusBadge status={saleResult.sale.paymentStatus} size="sm" />
            </div>
          </div>

          <button
            onClick={resetFlow}
            className="w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Record Another Sale</span>
          </button>
        </div>
      ) : (
        /* FAST CHECKOUT INTERFACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Selection (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>1. Select Available Product</span>
            </h3>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search available products by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Product List */}
            <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No available items found. Sold out items are automatically hidden.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`pt-2 p-3 rounded-2xl cursor-pointer transition flex items-center justify-between gap-3 border ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'hover:bg-slate-50 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                          <span className="text-[10px] text-slate-400">{p.categoryName}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-slate-900">
                          {formatNaira(p.sellingPricePerUnit)}
                        </p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {p.quantityRemaining} in stock
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Checkout Details & Confirmation (5 cols) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>2. Sale & Buyer Details</span>
                {selectedProduct && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {selectedProduct.name.slice(0, 15)}...
                  </span>
                )}
              </h3>

              {!selectedProduct ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                  Select a product from the list to enter sale quantity and buyer information.
                </div>
              ) : (
                <>
                  {/* Quantity & Negotiated Selling Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Quantity Sold (Max {selectedProduct.quantityRemaining}) *
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
                            setAmountPaidInput(formatNumberWithCommas(unitSellingPrice * newQty));
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Selling Price / Unit (₦) *
                        </label>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          Bargaining
                        </span>
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 25,000"
                        value={unitPriceInput}
                        onChange={(e) => {
                          const formatted = formatNumberWithCommas(e.target.value);
                          setUnitPriceInput(formatted);
                          const parsed = parseRawPrice(formatted);
                          if (paymentType === 'FULL') {
                            setAmountPaidInput(formatNumberWithCommas(parsed * quantity));
                          }
                        }}
                        className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="space-y-2.5 pt-1 border-t border-slate-100">
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
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

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
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

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
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Type */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Payment Plan</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentType('FULL');
                            setAmountPaidInput(formatNumberWithCommas(totalSaleAmount));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            paymentType === 'FULL'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          Full
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentType('INSTALLMENT');
                            setAmountPaidInput('');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            paymentType === 'INSTALLMENT'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          Installment
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-slate-200 pt-2">
                      <span>Total Sale Value:</span>
                      <span>{formatNaira(totalSaleAmount)}</span>
                    </div>

                    {paymentType === 'INSTALLMENT' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Amount Paid Today (₦) *
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="e.g. 15,000"
                          value={amountPaidInput}
                          onChange={(e) => setAmountPaidInput(formatNumberWithCommas(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <div className="flex justify-between text-[11px] font-bold mt-2 pt-2 border-t border-slate-200">
                          <span className="text-slate-500">Remaining Balance:</span>
                          <span className="text-amber-700">{formatNaira(remainingBalance)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Complete Sale CTA */}
            <button
              type="submit"
              disabled={submitting || !selectedProduct}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Complete Sale</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
