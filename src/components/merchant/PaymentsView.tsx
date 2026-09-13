import React, { useState } from 'react';
import {
  Coins,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowDownRight,
  Filter,
  CreditCard,
  Building,
  Banknote,
  X,
  History,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { Farmer, PaymentMode } from '../../types';
import { getTodayDateString } from '../../data/initialData';

export const PaymentsView: React.FC = () => {
  const {
    farmers,
    getFarmerStats,
    recordPayment,
    payments,
    totalOutstandingDues,
    totalPaidToDate,
    t,
  } = useMandi();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'settled'>('pending');
  const [selectedFarmerForPayment, setSelectedFarmerForPayment] = useState<Farmer | null>(null);

  // Payment Modal Form State
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMode, setPayMode] = useState<PaymentMode>('Cash');
  const [payDate, setPayDate] = useState<string>(getTodayDateString());
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Calculate farmers with dues
  const farmersWithDuesCount = farmers.filter((f) => {
    const stats = getFarmerStats(f.id);
    return stats.pendingDues > 0;
  }).length;

  // Filtered farmers list
  const filteredFarmers = farmers.filter((f) => {
    const stats = getFarmerStats(f.id);
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return stats.pendingDues > 0;
    if (statusFilter === 'settled') return stats.pendingDues === 0 && stats.totalPaid > 0;
    return true;
  });

  const openPaymentModal = (farmer: Farmer) => {
    const stats = getFarmerStats(farmer.id);
    setSelectedFarmerForPayment(farmer);
    setPayAmount(stats.pendingDues);
    setPayMode('Cash');
    setPayDate(getTodayDateString());
    setPayRef('');
    setPayNotes(`Dues settlement for ${farmer.name}`);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmerForPayment) return;

    const numericAmount = typeof payAmount === 'number' ? payAmount : 0;
    if (numericAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    recordPayment({
      date: payDate,
      farmerId: selectedFarmerForPayment.id,
      farmerName: selectedFarmerForPayment.name,
      amount: numericAmount,
      paymentMode: payMode,
      referenceNumber: payRef.trim() || undefined,
      notes: payNotes.trim() || undefined,
    });

    alert(t('paymentSuccess'));
    setSelectedFarmerForPayment(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#2A1F1A] flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#2E6349]" />
              <span>{t('paymentsTitle')}</span>
            </h2>
            <p className="text-xs text-[#6B5E57]">{t('paymentsSubtitle')}</p>
          </div>

          <button
            id="view-payments-history-btn"
            onClick={() => setShowHistoryModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 shadow-2xs"
          >
            <History className="w-4 h-4 text-[#2E6349]" />
            <span>{t('paymentHistory')} ({payments.length})</span>
          </button>
        </div>

        {/* 3 Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
              {t('totalPendingDues')}
            </span>
            <span className="text-2xl font-black font-mono text-rose-700 mt-1 block">
              ₹{totalOutstandingDues.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">Unpaid balance to growers</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E6349] block">
              {t('totalSettledPaid')}
            </span>
            <span className="text-2xl font-black font-mono text-[#2E6349] mt-1 block">
              ₹{totalPaidToDate.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#2E6349]/80 font-medium">Instant payouts settled</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FEF8ED] border border-[#DD9F2F]/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B45309] block">
              {t('farmersWithDues')}
            </span>
            <span className="text-2xl font-black font-mono text-[#2A1F1A] mt-1 block">
              {farmersWithDuesCount} <span className="text-sm font-semibold text-[#6B5E57]">farmers</span>
            </span>
            <span className="text-[11px] text-[#B45309] font-medium">Awaiting morning disbursement</span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#E8E2D9]">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B5E57]" />
            <input
              id="payments-search-input"
              type="text"
              placeholder="Search farmer name or village for dues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8E2D9] text-xs bg-[#FCFBF9] focus:outline-hidden focus:border-[#2E6349]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              id="filter-status-all"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                statusFilter === 'all'
                  ? 'bg-[#2E6349] text-white border-[#2E6349]'
                  : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#FCFBF9]'
              }`}
            >
              {t('allFarmers')}
            </button>
            <button
              id="filter-status-pending"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                statusFilter === 'pending'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#FCFBF9]'
              }`}
            >
              {t('pendingOnly')} ({farmersWithDuesCount})
            </button>
            <button
              id="filter-status-settled"
              onClick={() => setStatusFilter('settled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                statusFilter === 'settled'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#FCFBF9]'
              }`}
            >
              {t('settledOnly')}
            </button>
          </div>
        </div>
      </div>

      {/* Farmers Settlement Cards Grid */}
      {filteredFarmers.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E8E2D9] text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-[#2E6349] flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm sm:text-base text-[#2A1F1A]">
            {farmers.length === 0
              ? 'No Farmers Registered Yet'
              : statusFilter === 'pending'
              ? 'All Farmer Accounts Fully Settled!'
              : 'No Farmer Khatas Found'}
          </h4>
          <p className="text-xs text-[#6B5E57] max-w-md mx-auto">
            {farmers.length === 0
              ? 'Register farmers in your yard or create new flower sale parchis to track payments and pending balances.'
              : statusFilter === 'pending'
              ? 'There are zero pending balances due to farmers right now. Switch filter to "All Accounts" to view history.'
              : 'Try changing your search or switching filter tabs above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarmers.map((farmer) => {
            const stats = getFarmerStats(farmer.id);
            const hasDues = stats.pendingDues > 0;

            return (
              <div
                key={farmer.id}
                id={`settlement-card-${farmer.id}`}
                className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-2xs transition flex flex-col justify-between space-y-4 ${
                  hasDues
                    ? 'border-rose-300 hover:border-rose-400'
                    : 'border-[#E8E2D9] hover:border-emerald-300'
                }`}
              >
                <div>
                  {/* Farmer Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-[#2A1F1A]">
                        {farmer.name}
                      </h4>
                      <p className="text-xs text-[#6B5E57]">
                        📍 {farmer.village} • Ph: {farmer.phone}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        hasDues
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {hasDues ? 'Pending Dues' : 'Settled'}
                    </span>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="mt-4 p-3 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#6B5E57]">
                      <span>Total Net Payable:</span>
                      <span className="font-mono">₹{stats.totalNetPayable.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[#6B5E57]">
                      <span>Total Paid to Date:</span>
                      <span className="font-mono text-emerald-700">
                        ₹{stats.totalPaid.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-[#E8E2D9] font-bold text-sm">
                      <span className={hasDues ? 'text-rose-900' : 'text-emerald-900'}>
                        Current Balance Due:
                      </span>
                      <span
                        className={`font-mono font-black ${
                          hasDues ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        ₹{stats.pendingDues.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Settle Dues Action */}
                <div>
                  <button
                    id={`settle-dues-btn-${farmer.id}`}
                    onClick={() => openPaymentModal(farmer)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs ${
                      hasDues
                        ? 'bg-[#C2255C] text-white hover:bg-[#a61c4c]'
                        : 'bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>{hasDues ? t('settleDuesBtn') : 'Record Advance / Payment'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Settle Dues Modal */}
      {selectedFarmerForPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#E8E2D9] overflow-hidden">
            <div className="p-4 bg-[#2E6349] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#DD9F2F]" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    {t('recordPaymentTitle')}
                  </h3>
                  <p className="text-[11px] text-white/80">{selectedFarmerForPayment.name} ({selectedFarmerForPayment.village})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFarmerForPayment(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-5 space-y-4 bg-[#FCFBF9]">
              {/* Outstanding Balance Banner */}
              {(() => {
                const currentPending = getFarmerStats(selectedFarmerForPayment.id).pendingDues;
                return (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                    <span className="text-rose-900 font-semibold">Outstanding Farmer Dues:</span>
                    <span className="font-mono font-black text-sm text-rose-700">
                      ₹{currentPending.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })()}

              {/* Amount to Pay */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#2A1F1A]">
                    {t('amountToPay')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const full = getFarmerStats(selectedFarmerForPayment.id).pendingDues;
                      setPayAmount(full);
                    }}
                    className="text-[11px] font-bold text-[#2E6349] hover:underline"
                  >
                    {t('fullClearance')}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">₹</span>
                  <input
                    id="settlement-amount-input"
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={payAmount}
                    onChange={(e) =>
                      setPayAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#E8E2D9] text-sm font-bold bg-white focus:outline-hidden focus:border-[#2E6349]"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1.5">
                  {t('paymentModeLabel')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cash', 'UPI', 'Bank Transfer'] as PaymentMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPayMode(mode)}
                      className={`p-2 rounded-xl text-xs font-bold border transition text-center ${
                        payMode === mode
                          ? 'bg-[#2E6349] text-white border-[#2E6349] shadow-2xs'
                          : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#FCFBF9]'
                      }`}
                    >
                      {mode === 'Cash'
                        ? t('cash')
                        : mode === 'UPI'
                        ? t('upi')
                        : t('bankTransfer')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                    {t('paymentDate')}
                  </label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                    {t('referenceNumber')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR / Receipt #"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs bg-white font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  Settlement Note (Optional)
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs bg-white"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setSelectedFarmerForPayment(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  id="confirm-payment-submit-btn"
                  className="px-5 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] shadow-xs"
                >
                  {t('confirmPayment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-[#2E6349] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#DD9F2F]" />
                <h3 className="font-bold text-sm sm:text-base">Mandi Payouts & Settlement History</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-2 bg-[#FCFBF9]">
              {payments.length === 0 ? (
                <p className="text-center text-xs text-[#6B5E57] py-8">
                  No payment disbursements recorded yet.
                </p>
              ) : (
                [...payments].reverse().map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-white border border-[#E8E2D9] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-sm text-[#2A1F1A] block">{p.farmerName}</span>
                      <span className="text-[11px] text-[#6B5E57]">
                        {p.date} • {p.time} • Mode: <span className="font-semibold">{p.paymentMode}</span>
                      </span>
                      {p.referenceNumber && (
                        <span className="text-[10px] text-[#6B5E57] block font-mono">
                          Ref: {p.referenceNumber}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-emerald-700 block">
                        + ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#6B5E57]">{p.notes || 'Settlement'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-white border-t border-[#E8E2D9] flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs font-semibold"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
