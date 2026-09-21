import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  Coins,
  ShieldCheck,
  Zap,
  User,
  Phone,
  Mail,
  Loader2,
  Lock,
  ArrowRight,
  Receipt,
  Sparkles,
  Building,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { Farmer, FifteenDaySettlement } from '../../types';
import { initiateRazorpayPayment, PaymentReceiptData } from '../../services/razorpayClient';
import { RazorpayReceiptModal } from './RazorpayReceiptModal';
import { sounds } from '../../utils/audio';

interface RazorpaySettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFarmerId?: string;
  defaultAmount?: number;
  settlementItem?: FifteenDaySettlement | null;
  onPaymentSettled?: (receipt: PaymentReceiptData) => void;
}

export const RazorpaySettlementModal: React.FC<RazorpaySettlementModalProps> = ({
  isOpen,
  onClose,
  defaultFarmerId,
  defaultAmount,
  settlementItem,
  onPaymentSettled,
}) => {
  const { farmers, lots, settlements, recordPayment, merchantProfile, activeSessionDate } = useMandi();

  // Selected Farmer
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(
    defaultFarmerId || settlementItem?.farmerId || (farmers[0]?.id ?? '')
  );

  const selectedFarmer = useMemo(() => {
    return farmers.find((f) => f.id === selectedFarmerId) || farmers[0];
  }, [farmers, selectedFarmerId]);

  // Compute Outstanding / Due Balance for the selected farmer
  const farmerOutstandingDue = useMemo(() => {
    if (settlementItem) {
      return Math.max(0, settlementItem.balanceDue || settlementItem.farmerNetPayable || 0);
    }
    const farmerLots = lots.filter((l) => l.farmerId === selectedFarmerId);
    return farmerLots.reduce((acc, l) => acc + (l.balanceDue || 0), 0);
  }, [lots, selectedFarmerId, settlementItem]);

  // Payment Form States
  const [payAmount, setPayAmount] = useState<number | ''>(
    defaultAmount !== undefined && defaultAmount > 0
      ? defaultAmount
      : farmerOutstandingDue > 0
      ? farmerOutstandingDue
      : 1000
  );

  const [customerName, setCustomerName] = useState<string>(
    selectedFarmer?.name || settlementItem?.farmerName || 'Farmer'
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    selectedFarmer?.phone || settlementItem?.farmerPhone || '9876543210'
  );
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('APMC Mandi Ledger Settlement');

  // Loading & Flow States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedReceipt, setCapturedReceipt] = useState<PaymentReceiptData | null>(null);

  // Update customer fields if selected farmer changes
  const handleFarmerChange = (farmerId: string) => {
    setSelectedFarmerId(farmerId);
    const farmer = farmers.find((f) => f.id === farmerId);
    if (farmer) {
      setCustomerName(farmer.name);
      setCustomerPhone(farmer.phone);
      const farmerLots = lots.filter((l) => l.farmerId === farmerId);
      const due = farmerLots.reduce((acc, l) => acc + (l.balanceDue || 0), 0);
      setPayAmount(due > 0 ? due : 1000);
    }
  };

  const numericAmount = typeof payAmount === 'number' ? Math.max(0, payAmount) : 0;

  // Handle "Settle Due Payment" Razorpay Checkout Trigger
  const handleSettleDuePayment = async () => {
    if (numericAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than ₹0 to settle.');
      sounds.error();
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    sounds.tap();

    await initiateRazorpayPayment({
      amount: numericAmount,
      customer: {
        name: customerName.trim() || 'Customer / Farmer',
        phone: customerPhone.trim() || '9876543210',
        email: customerEmail.trim() || undefined,
        farmerId: selectedFarmerId,
      },
      description: `Settlement for ${customerName} (${selectedFarmerId})`,
      notes: {
        settlementPeriod: settlementItem
          ? `${settlementItem.periodStart} to ${settlementItem.periodEnd}`
          : 'Due Balance Settlement',
        farmerId: selectedFarmerId,
        customNotes,
      },
      onSuccess: (receipt: PaymentReceiptData) => {
        setIsProcessing(false);
        setCapturedReceipt(receipt);

        // Record payment into MandiContext state
        try {
          recordPayment({
            date: activeSessionDate || new Date().toISOString().slice(0, 10),
            farmerId: selectedFarmerId,
            farmerName: customerName,
            amount: receipt.amountPaid,
            paymentMode: 'Online',
            referenceNumber: receipt.transactionId,
            notes: `Razorpay Online Settlement #${receipt.receiptId} (TXN: ${receipt.transactionId})`,
          });
        } catch (ctxErr) {
          console.warn('Could not auto-record to context state:', ctxErr);
        }

        if (onPaymentSettled) {
          onPaymentSettled(receipt);
        }
      },
      onError: (err: string) => {
        setIsProcessing(false);
        setErrorMessage(err);
        sounds.error();
      },
      onDismiss: () => {
        setIsProcessing(false);
      },
    });
  };

  if (!isOpen) return null;

  // If receipt is captured, show the receipt modal
  if (capturedReceipt) {
    return (
      <RazorpayReceiptModal
        receipt={capturedReceipt}
        autoDownloadPdf={true}
        onClose={() => {
          setCapturedReceipt(null);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="px-5 py-4 bg-[#1B4D3E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <CreditCard className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Settle Due Payment</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Razorpay
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">Instant UPI, Cards, NetBanking & Auto-Receipt</p>
            </div>
          </div>
          <button
            id="close-razorpay-modal-btn"
            type="button"
            onClick={() => {
              sounds.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 bg-[#FCFBF9] overflow-y-auto max-h-[80vh]">
          {/* Section 1: Outstanding Due Balance Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900 to-[#1B4D3E] text-white shadow-md relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" /> Total Outstanding Due Balance
                </span>
                <div className="text-2xl sm:text-3xl font-black mt-1 tracking-tight text-white">
                  ₹{farmerOutstandingDue.toLocaleString('en-IN')}
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                farmerOutstandingDue > 0
                  ? 'bg-rose-500/20 text-rose-200 border-rose-400/40'
                  : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
              }`}>
                {farmerOutstandingDue > 0 ? 'Pending Collection' : 'Zero Due ✓'}
              </span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100/90">
              <span>Account: <strong>{customerName}</strong> ({selectedFarmerId})</span>
              <span className="text-[11px] opacity-80">APMC Mandi Ledger</span>
            </div>
          </div>

          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 2: Farmer / Customer Selection (if not fixed) */}
          {!settlementItem && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2A1F1A]">
                Select Farmer / Customer Account:
              </label>
              <select
                id="razorpay-farmer-select"
                value={selectedFarmerId}
                onChange={(e) => handleFarmerChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] bg-white text-xs font-semibold text-[#2A1F1A] focus:outline-hidden focus:border-[#1B4D3E]"
              >
                {farmers.map((farmer) => {
                  const fLots = lots.filter((l) => l.farmerId === farmer.id);
                  const due = fLots.reduce((acc, l) => acc + (l.balanceDue || 0), 0);
                  return (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.name} ({farmer.phone}) — Due: ₹{due.toLocaleString('en-IN')}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Section 3: Amount to Settle & Quick Presets */}
          <div className="space-y-2.5 p-4 rounded-xl bg-white border border-[#E8E2D9]">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#DD9F2F]" />
                <span>Amount to Settle (INR ₹)</span>
              </label>
              <span className="text-[11px] font-semibold text-[#6B5E57]">
                Currency: <strong>INR (₹)</strong>
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-base font-bold text-gray-500">₹</span>
              <input
                id="razorpay-amount-input"
                type="number"
                min="1"
                placeholder="Enter amount to pay"
                value={payAmount}
                onChange={(e) => {
                  setPayAmount(e.target.value === '' ? '' : parseFloat(e.target.value));
                }}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] text-base font-bold bg-[#FCFBF9] text-[#2A1F1A] focus:outline-hidden focus:border-[#1B4D3E]"
              />
            </div>

            {/* Quick Amount Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {farmerOutstandingDue > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    setPayAmount(farmerOutstandingDue);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    payAmount === farmerOutstandingDue
                      ? 'bg-[#1B4D3E] text-white border-[#1B4D3E]'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Full Due (₹{farmerOutstandingDue.toLocaleString('en-IN')})
                </button>
              )}
              {farmerOutstandingDue > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    setPayAmount(Math.round(farmerOutstandingDue / 2));
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-[#E8E2D9] text-[#6B5E57] hover:bg-gray-50 transition cursor-pointer"
                >
                  50% (₹{Math.round(farmerOutstandingDue / 2).toLocaleString('en-IN')})
                </button>
              )}
              {[2000, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    setPayAmount(preset);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    payAmount === preset
                      ? 'bg-[#1B4D3E] text-white border-[#1B4D3E]'
                      : 'bg-white border-[#E8E2D9] text-[#6B5E57] hover:bg-gray-50'
                  }`}
                >
                  ₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Customer Details */}
          <div className="p-4 rounded-xl bg-white border border-[#E8E2D9] space-y-3">
            <div className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Payer / Customer Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#6B5E57] mb-1">Customer Name</label>
                <input
                  id="razorpay-customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs font-semibold bg-[#FCFBF9] focus:outline-hidden focus:border-[#1B4D3E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B5E57] mb-1">Mobile Phone (for SMS/OTP)</label>
                <input
                  id="razorpay-customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs font-semibold bg-[#FCFBF9] focus:outline-hidden focus:border-[#1B4D3E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#6B5E57] mb-1">
                Email Address (Optional — for instant e-receipt)
              </label>
              <input
                id="razorpay-customer-email"
                type="email"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs bg-[#FCFBF9] focus:outline-hidden focus:border-[#1B4D3E]"
              />
            </div>
          </div>

          {/* Section 5: Trust & Gateway Badges */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 text-[11px] text-gray-600">
            <div className="flex items-center gap-1.5 font-semibold text-gray-700">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Razorpay Secured 256-Bit</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span>UPI &bull; GPay &bull; PhonePe &bull; Cards &bull; NetBanking</span>
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-4 bg-white border-t border-[#E8E2D9] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#6B5E57] hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="settle-due-payment-action-btn"
            type="button"
            onClick={handleSettleDuePayment}
            disabled={isProcessing || numericAmount <= 0}
            className="flex-1 max-w-xs inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B30] text-white text-xs font-bold transition shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching Razorpay...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Settle Due Payment (₹{numericAmount.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
