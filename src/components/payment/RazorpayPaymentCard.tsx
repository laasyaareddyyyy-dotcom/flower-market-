import React, { useState } from 'react';
import {
  CreditCard,
  Coins,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Receipt,
  User,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { RazorpaySettlementModal } from './RazorpaySettlementModal';
import { sounds } from '../../utils/audio';

interface RazorpayPaymentCardProps {
  farmerId?: string;
  customDueAmount?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const RazorpayPaymentCard: React.FC<RazorpayPaymentCardProps> = ({
  farmerId,
  customDueAmount,
  title,
  subtitle,
  className = '',
}) => {
  const { farmers, lots } = useMandi();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Target farmer
  const currentFarmer = farmerId ? farmers.find((f) => f.id === farmerId) : farmers[0];

  // Calculate Due
  const totalOutstandingDue = React.useMemo(() => {
    if (customDueAmount !== undefined) return customDueAmount;
    if (farmerId) {
      const fLots = lots.filter((l) => l.farmerId === farmerId);
      return fLots.reduce((acc, l) => acc + (l.balanceDue || 0), 0);
    }
    return lots.reduce((acc, l) => acc + (l.balanceDue || 0), 0);
  }, [customDueAmount, farmerId, lots]);

  return (
    <>
      <div
        className={`bg-white rounded-2xl border border-[#E8E2D9] shadow-sm hover:shadow-md transition overflow-hidden ${className}`}
      >
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/50 via-white to-amber-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#1B4D3E] text-white">
                <CreditCard className="w-4 h-4 text-emerald-300" />
              </span>
              <h3 className="text-sm font-bold text-[#2A1F1A]">
                {title || 'Online Payment & Settle Dues'}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Razorpay
              </span>
            </div>
            <p className="text-xs text-[#6B5E57]">
              {subtitle || 'Instant digital collection via UPI (GPay/PhonePe), Debit/Credit Cards & NetBanking.'}
            </p>
          </div>

          {/* Amount Due Indicator & Settle Button */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Outstanding Balance
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#1B4D3E]">
                ₹{totalOutstandingDue.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              id="open-razorpay-settle-btn"
              type="button"
              onClick={() => {
                sounds.tap();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B30] text-white text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Settle Due Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Trust Strip */}
        <div className="px-4 py-2 bg-[#FCFBF9] border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Bank-grade 256-bit encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Instant Verified PDF Receipt + Ledger Auto-Update</span>
          </div>
        </div>
      </div>

      {/* Razorpay Settlement Modal */}
      <RazorpaySettlementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultFarmerId={farmerId}
        defaultAmount={totalOutstandingDue > 0 ? totalOutstandingDue : undefined}
      />
    </>
  );
};
