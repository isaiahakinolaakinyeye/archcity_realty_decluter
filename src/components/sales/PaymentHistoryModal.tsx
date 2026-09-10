import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Sale, Payment } from '../../types';
import { formatNaira, formatDateTime } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { Clock, UserCheck, Calendar } from 'lucide-react';

interface PaymentHistoryModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && sale) {
      setLoading(true);
      api.payments
        .getBySaleId(sale.id)
        .then((data) => setPayments(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, sale]);

  if (!sale) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment History & Audit"
      subtitle={`Sale ID: ${sale.id}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Sale Summary Banner */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-900 text-sm">{sale.productName}</span>
            <StatusBadge status={sale.paymentStatus} size="sm" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Sale</span>
              <span className="font-bold text-slate-900">{formatNaira(sale.totalAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Paid</span>
              <span className="font-bold text-emerald-700">{formatNaira(sale.amountPaid)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Remaining</span>
              <span className="font-bold text-amber-700">{formatNaira(sale.balance)}</span>
            </div>
          </div>
        </div>

        {/* Payment History List (Section 15 & 44) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Transaction Logs ({payments.length})</span>
          </h4>

          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading payment records...</div>
          ) : payments.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No individual payment records logged yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {payments.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 block text-sm">
                        {formatNaira(p.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(p.paymentDate)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Recorded By</span>
                    <span className="font-semibold text-slate-600 flex items-center gap-1 justify-end">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      {p.recordedBy || 'Staff'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
