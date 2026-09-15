import React, { useState } from 'react';
import { Calculator, Sparkles, ArrowRight, Percent, IndianRupee, Scale } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface InteractiveRateCalculatorProps {
  initialQuantity?: number;
  initialRate?: number;
  initialCommission?: number;
  initialExpenditureRate?: number;
  onApply?: (values: {
    quantity: number;
    rate: number;
    commissionPercent: number;
    expenditurePercent?: number;
    transport: number;
    hamali: number;
  }) => void;
  compact?: boolean;
}

export const InteractiveRateCalculator: React.FC<InteractiveRateCalculatorProps> = ({
  initialQuantity = 60,
  initialRate = 75,
  initialCommission = 4,
  initialExpenditureRate = 6,
  onApply,
  compact = false,
}) => {
  const [qty, setQty] = useState<number>(initialQuantity);
  const [rate, setRate] = useState<number>(initialRate);
  const [commissionPct, setCommissionPct] = useState<number>(initialCommission);
  const [expenditurePct, setExpenditurePct] = useState<number>(initialExpenditureRate);
  const [transport, setTransport] = useState<number>(80);
  const [hamali, setHamali] = useState<number>(40);

  // Calculations
  const gross = Math.round(qty * rate);
  const commAmount = Math.round(gross * (commissionPct / 100));
  const otherExpAmount = Math.round(gross * (expenditurePct / 100));
  const deductions = transport + hamali + otherExpAmount;
  const netPayable = Math.max(0, gross - (commAmount + deductions));
  const netRatePerKg = qty > 0 ? Number((netPayable / qty).toFixed(2)) : 0;

  // Percentages for visual split
  const farmerPercent = gross > 0 ? Math.round((netPayable / gross) * 100) : 0;
  const merchantPercent = gross > 0 ? Math.round((commAmount / gross) * 100) : 0;
  const deductionsPercent = Math.max(0, 100 - farmerPercent - merchantPercent);

  const handleApply = () => {
    sounds.playBidTick();
    if (onApply) {
      onApply({
        quantity: qty,
        rate,
        commissionPercent: commissionPct,
        expenditurePercent: expenditurePct,
        transport,
        hamali,
      });
    }
  };

  return (
    <div
      id="interactive-rate-calculator"
      className="bg-[#FCFBF9] border border-[#E8E2D9] rounded-2xl p-4 space-y-4 shadow-2xs"
    >
      <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FEF8ED] text-[#DD9F2F] flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2A1F1A] uppercase tracking-wider">
              Interactive Rate & Payout Negotiator
            </h4>
            <span className="text-[10px] text-[#6B5E57] block">
              Drag sliders to preview real-time net realization
            </span>
          </div>
        </div>

        <span className="text-xs font-bold font-mono text-[#2E6349] bg-[#E9F3EE] px-2.5 py-0.5 rounded-full">
          Net ₹{netRatePerKg}/kg in Hand
        </span>
      </div>

      {/* Real-time Proportional Split Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-[#2E6349]">Farmer Payout: ₹{netPayable.toLocaleString('en-IN')} ({farmerPercent}%)</span>
          <span className="text-[#DD9F2F]">Merchant Fee: ₹{commAmount} ({merchantPercent}%)</span>
        </div>

        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden flex">
          <div
            className="h-full bg-[#2E6349] transition-all duration-150"
            style={{ width: `${farmerPercent}%` }}
            title={`Farmer Net: ${farmerPercent}%`}
          />
          <div
            className="h-full bg-[#DD9F2F] transition-all duration-150"
            style={{ width: `${merchantPercent}%` }}
            title={`Merchant Commission: ${merchantPercent}%`}
          />
          <div
            className="h-full bg-[#C2255C] transition-all duration-150"
            style={{ width: `${deductionsPercent}%` }}
            title={`Labor & Market Cess: ${deductionsPercent}%`}
          />
        </div>

        <div className="flex justify-between text-[10px] text-[#6B5E57]">
          <span>Gross: ₹{gross.toLocaleString('en-IN')}</span>
          <span>Coolie / Transport Expense / Other: ₹{deductions}</span>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        {/* Rate Slider */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-[#6B5E57] font-medium">Rate:</span>
            <span className="font-mono font-bold text-[#2A1F1A]">₹{rate}/kg</span>
          </div>
          <input
            type="range"
            min={10}
            max={400}
            step={5}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-[#2E6349] h-1.5 bg-[#E8E2D9] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Quantity Slider */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-[#6B5E57] font-medium">Weight:</span>
            <span className="font-mono font-bold text-[#2A1F1A]">{qty} Kgs</span>
          </div>
          <input
            type="range"
            min={10}
            max={250}
            step={5}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full accent-[#2E6349] h-1.5 bg-[#E8E2D9] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Commission % Slider */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-[#6B5E57] font-medium">Commission:</span>
            <span className="font-mono font-bold text-[#DD9F2F]">{commissionPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={commissionPct}
            onChange={(e) => setCommissionPct(Number(e.target.value))}
            className="w-full accent-[#DD9F2F] h-1.5 bg-[#E8E2D9] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Other Expenditures % Slider */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-[#6B5E57] font-medium">Other Exp:</span>
            <span className="font-mono font-bold text-amber-700">{expenditurePct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={expenditurePct}
            onChange={(e) => setExpenditurePct(Number(e.target.value))}
            className="w-full accent-amber-600 h-1.5 bg-[#E8E2D9] rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {onApply && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={handleApply}
            className="px-3.5 py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1 shadow-2xs active:scale-95"
          >
            <span>Apply These Values to Active Sale</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
