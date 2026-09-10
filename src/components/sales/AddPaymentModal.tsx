import React, { useState } from 'react';
import { api } from '../../services/api';
import { Sale } from '../../types';
import { formatNaira } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, CheckCircle, Calendar } from 'lucide-react';

interface AddPaymentModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  sale,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  if (!sale) return null;

  const paymentVal = parseFloat(amount || '0');
  const newBalance = Math.max(0, sale.balance - paymentVal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentVal <= 0 || isNaN(paymentVal)) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    if (paymentVal > sale.balance) {
      toast.error(`Payment cannot exceed remaining balance of ${formatNaira(sale.balance)}`);
      return;
    }

    setSubmitting(true);
    try {
      await api.payments.addPayment({
        saleId: sale.id,
        amount: paymentVal,
        recordedBy: user?.id || 'user-staff-1',
        paymentDate: new Date(paymentDate).toISOString(),
      });

      toast.success('Installment payment registered successfully!');
      setAmount('');
      onClose();
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record installment payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Installment Payment"
      subtitle={`Customer: ${sale.buyerName} (${sale.buyerPhone})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Product:</span>
            <span className="font-bold text-slate-900">{sale.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Sale Amount:</span>
            <span className="font-bold text-slate-900">{formatNaira(sale.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount Paid So Far:</span>
            <span className="font-bold text-emerald-700">{formatNaira(sale.amountPaid)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
            <span>Outstanding Balance:</span>
            <span className="text-amber-700 font-black">{formatNaira(sale.balance)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Payment Amount (₦) *
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              step="any"
              min="1"
              max={sale.balance}
              required
              autoFocus
              placeholder="e.g. 20000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
          {paymentVal > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
              <span>New balance after payment:</span>
              <span className="font-bold text-slate-900">{formatNaira(newBalance)}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Date *</label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || paymentVal <= 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>Register Payment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
