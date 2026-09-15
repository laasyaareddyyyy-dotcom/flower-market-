import React from 'react';
import {
  TrendingUp,
  Users,
  Coins,
  AlertCircle,
  PlusCircle,
  Receipt,
  Printer,
  ChevronRight,
  Sparkles,
  Package,
  Calendar,
  Layers,
  Phone,
  Store,
  Volume2,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { SaleLot } from '../../types';
import { speakParchiDetails, sounds } from '../../utils/audio';

export const DashboardView: React.FC = () => {
  const {
    merchantProfile,
    activeSessionDate,
    todayLots,
    todayTurnover,
    todayLotsCount,
    todayFarmersServed,
    todayTotalVolume,
    todayCommissionEarned,
    totalOutstandingDues,
    setMerchantTab,
    setSelectedParchiLot,
    setIsDateSwitcherOpen,
    setActiveSessionDate,
    setIsOwnerSignUpOpen,
    setIsFarmerSignUpOpen,
    setActiveFarmerId,
    language,
    lots,
    farmers,
    t,
  } = useMandi();

  // Sort today's lots newest first
  const sortedLots = [...todayLots].reverse();

  return (
    <div className="space-y-6">
      {/* Merchant Header Yard Banner */}
      <div className="bg-gradient-to-r from-[#2E6349] via-[#24533c] to-[#1F4532] text-white p-4 sm:p-6 rounded-2xl shadow-sm border border-[#2E6349]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            id="dash-owner-photo-btn"
            onClick={() => setIsOwnerSignUpOpen(true)}
            className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#DD9F2F] bg-white/10 shrink-0 shadow-md hover:scale-105 transition cursor-pointer"
            title="View or Change Owner Profile & Photo"
          >
            {merchantProfile.photoUrl ? (
              <img
                src={merchantProfile.photoUrl}
                alt={merchantProfile.ownerName || merchantProfile.shopName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#DD9F2F]">
                <Store className="w-6 h-6" />
              </div>
            )}
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#DD9F2F] tracking-wider uppercase mb-0.5">
              <Store className="w-4 h-4" />
              <span>{merchantProfile.apmcMarketName}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {merchantProfile.shopName}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80 mt-1">
              <span>
                Owner: <strong className="text-[#DD9F2F]">{merchantProfile.ownerName || 'Merchant'}</strong>
              </span>
              <span>•</span>
              <span>{merchantProfile.shopNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15 w-full md:w-auto justify-between md:justify-end">
          <div className="text-left md:text-right pr-2">
            <span className="text-[10px] text-white/70 block uppercase font-medium">
              Trading Session Date
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-[#DD9F2F]">
              {activeSessionDate}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="dash-banner-change-date-btn"
              onClick={() => setIsDateSwitcherOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#DD9F2F] text-[#2A1F1A] text-xs font-bold hover:bg-[#c68c22] transition flex items-center gap-1 shadow-2xs whitespace-nowrap"
              title="Change trading date or start fresh morning session"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Change Date</span>
            </button>
            <button
              id="dash-banner-archive-link"
              onClick={() => setMerchantTab('reports')}
              className="px-2.5 py-1.5 rounded-lg bg-white text-[#2E6349] text-xs font-bold hover:bg-white/90 transition flex items-center gap-1 shadow-2xs whitespace-nowrap"
            >
              <span>Past Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Flower Turnover */}
        <div
          id="metric-today-turnover-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs hover:border-[#2E6349]/30 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
              {t('todayTurnover')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2E6349] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#2A1F1A] tracking-tight">
              ₹{todayTurnover.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#2E6349] font-medium mt-1">
              <Package className="w-3.5 h-3.5" />
              <span>
                {todayLotsCount} {t('lotsTradedToday')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Farmers Served Today */}
        <div
          id="metric-farmers-today-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs hover:border-[#2E6349]/30 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
              {t('farmersServedToday')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#DD9F2F] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#2A1F1A] tracking-tight">
              {todayFarmersServed} <span className="text-sm font-semibold text-[#6B5E57]">growers</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B5E57] font-medium mt-1">
              <Layers className="w-3.5 h-3.5" />
              <span>{todayTotalVolume.toLocaleString('en-IN')} units/kgs total volume</span>
            </div>
          </div>
        </div>

        {/* Card 3: Commission Earned Today */}
        <div
          id="metric-commission-today-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs hover:border-[#2E6349]/30 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
              {t('commissionEarnedToday')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E9F3EE] text-[#2E6349] flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#2E6349] tracking-tight">
              ₹{todayCommissionEarned.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-[#6B5E57] mt-1">
              {merchantProfile.defaultCommissionRate}% standard adathiya commission
            </div>
          </div>
        </div>

        {/* Card 4: Total Outstanding Farmer Payments */}
        <div
          id="metric-outstanding-dues-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs hover:border-[#C2255C]/30 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
              {t('totalOutstandingDues')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#C2255C] flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#C2255C] tracking-tight">
              ₹{totalOutstandingDues.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-[#6B5E57] text-[11px] truncate">{t('acrossAllKhatas')}</span>
              <button
                id="clear-dues-shortcut-btn"
                onClick={() => setMerchantTab('payments')}
                className="font-bold text-[#C2255C] hover:underline flex items-center gap-0.5 ml-1"
              >
                <span>{t('clearDues')}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-[#FFFFFF] p-3 sm:p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs">
        <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
          <span>{t('quickActions')}</span>
          <span className="text-[11px] font-normal text-[#6B5E57]">Direct shortcuts for high-speed mandi trading</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            id="qa-new-sale-btn"
            onClick={() => setMerchantTab('new-sale')}
            className="p-3 rounded-xl bg-[#2E6349] text-white font-bold text-xs sm:text-sm hover:bg-[#1F4532] transition flex items-center justify-center gap-2 shadow-xs group"
          >
            <PlusCircle className="w-4 h-4 text-[#DD9F2F] group-hover:scale-110 transition" />
            <span>+ {t('tabNewSale')}</span>
          </button>

          <button
            id="qa-farmers-btn"
            onClick={() => setMerchantTab('farmers')}
            className="p-3 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] font-bold text-xs sm:text-sm hover:bg-[#F4EFEA] transition flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 text-[#2E6349]" />
            <span>{t('tabFarmers')}</span>
          </button>

          <button
            id="qa-payments-btn"
            onClick={() => setMerchantTab('payments')}
            className="p-3 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] font-bold text-xs sm:text-sm hover:bg-[#F4EFEA] transition flex items-center justify-center gap-2"
          >
            <Coins className="w-4 h-4 text-[#DD9F2F]" />
            <span>{t('tabPayments')}</span>
          </button>

          <button
            id="qa-reports-btn"
            onClick={() => setMerchantTab('reports')}
            className="p-3 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] font-bold text-xs sm:text-sm hover:bg-[#F4EFEA] transition flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4 text-[#6B5E57]" />
            <span>{t('tabReports')}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Today's Mandi Lots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#2A1F1A] flex items-center gap-2">
              <span>{t('todayMandiLots')}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E9F3EE] text-[#2E6349] text-xs font-bold font-mono">
                {todayLots.length}
              </span>
            </h3>
            <p className="text-xs text-[#6B5E57]">{t('todayLotsSubtitle')}</p>
          </div>

          <button
            id="dash-add-lot-btn"
            onClick={() => setMerchantTab('new-sale')}
            className="px-3.5 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-[#DD9F2F]" />
            <span>+ Record Lot</span>
          </button>
        </div>

          {/* Today's Lots List / Empty State */}
          {todayLots.length === 0 ? (
            <div
              id="empty-today-session-banner"
              className="bg-white rounded-2xl border-2 border-dashed border-[#DD9F2F]/50 p-6 sm:p-8 text-center space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FEF8ED] text-[#DD9F2F] flex items-center justify-center">
                <Sparkles className="w-7 h-7 animate-bounce" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E9F3EE] text-[#2E6349] text-xs font-bold font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Session: {activeSessionDate} (Empty / Refreshed)</span>
                </div>
                <h4 className="text-lg font-bold text-[#2A1F1A]">
                  Fresh Trading Session — Ready for Incoming Consignments
                </h4>
                <p className="text-xs text-[#6B5E57] leading-relaxed">
                  Every day starts with a fresh, empty sales record for the morning flower arrivals.
                  All <strong>{farmers.length} registered farmers</strong>, historical khata ledgers, and past sales reports remain safely stored.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  id="record-first-lot-btn"
                  onClick={() => setMerchantTab('new-sale')}
                  className="px-5 py-2.5 rounded-xl bg-[#2E6349] text-white font-bold text-xs sm:text-sm hover:bg-[#1F4532] transition shadow-xs flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-[#DD9F2F]" />
                  <span>+ Record Lot Manually</span>
                </button>

                <button
                  id="view-archive-btn"
                  onClick={() => setMerchantTab('reports')}
                  className="px-4 py-2.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] font-semibold text-xs sm:text-sm hover:bg-[#F4EFEA] transition flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4 text-[#6B5E57]" />
                  <span>Check Past Reports & PDFs</span>
                </button>

                <button
                  id="dash-switch-session-btn"
                  onClick={() => setIsDateSwitcherOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FEF8ED] border border-[#DD9F2F]/40 text-[#2A1F1A] font-semibold text-xs hover:bg-[#faebd1] transition flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#DD9F2F]" />
                  <span>Switch Date / Calendar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedLots.map((lot) => (
                <div
                  key={lot.id}
                  id={`lot-card-${lot.id}`}
                  className="bg-white rounded-2xl p-4 border border-[#E8E2D9] shadow-2xs hover:shadow-xs transition space-y-3"
                >
                  {/* Top row: Parchi #, Time, Status badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4EFEA] pb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#2E6349] bg-[#E9F3EE] px-2 py-0.5 rounded">
                        {lot.parchiNumber}
                      </span>
                      <span className="text-[#6B5E57]">{lot.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          lot.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lot.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {lot.paymentStatus === 'Paid'
                          ? t('statusPaid')
                          : lot.paymentStatus === 'Partial'
                          ? `${t('statusPartial')} (Due ₹${lot.balanceDue})`
                          : `${t('statusUnpaid')} (₹${lot.balanceDue})`}
                      </span>
                    </div>
                  </div>

                  {/* Middle row: Farmer Info & Consignment Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Farmer */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                        {t('farmer')}
                      </span>
                      <span className="font-bold text-sm text-[#2A1F1A] block">
                        {lot.farmerName}
                      </span>
                      <span className="text-[11px] text-[#6B5E57]">📍 {lot.farmerVillage}</span>
                    </div>

                    {/* Variety & Quantity */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                        {t('variety')}
                      </span>
                      <span className="font-bold text-sm text-[#2A1F1A] block">
                        {lot.flowerVariety}
                      </span>
                      <span className="text-[11px] font-semibold text-[#2E6349]">
                        {lot.quantity} {lot.unit} @ ₹{lot.rate}/{lot.unit}
                      </span>
                    </div>

                    {/* Financials */}
                    <div className="sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                        {t('farmerNet')}
                      </span>
                      <span className="text-base font-black text-[#2A1F1A] block">
                        ₹{lot.farmerNetPayable.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#6B5E57]">
                        Gross: ₹{lot.grossTotal} • Comm: ₹{lot.commissionAmount}
                      </span>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F4EFEA]">
                    <div className="text-[11px] text-[#6B5E57]">
                      {lot.notes && <span className="italic">Note: {lot.notes}</span>}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Interactive Voice Readout */}
                      <button
                        type="button"
                        id={`speak-parchi-btn-${lot.id}`}
                        onClick={() => {
                          sounds.playBidTick();
                          speakParchiDetails(
                            lot.farmerName,
                            lot.flowerVariety,
                            lot.quantity,
                            lot.unit,
                            lot.rate,
                            lot.farmerNetPayable,
                            language
                          );
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] hover:bg-[#F4EFEA] text-[#2A1F1A] text-xs font-semibold transition flex items-center gap-1"
                        title="Listen to Parchi Details in Selected Language (వాయిస్ చదవండి)"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#2E6349]" />
                        <span className="hidden sm:inline">Voice</span>
                      </button>

                      {/* Official Form C Print Parchi */}
                      <button
                        id={`view-parchi-btn-${lot.id}`}
                        onClick={() => setSelectedParchiLot(lot)}
                        className="px-3 py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#DD9F2F]" />
                        <span>{t('printParchi')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Historical Guidance Banner */}
          <div className="bg-[#FCFBF9] border border-[#E8E2D9] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-[#6B5E57]">
              <Calendar className="w-5 h-5 text-[#2E6349] shrink-0" />
              <span>{t('historicalArchiveNotice')}</span>
            </div>
            <button
              id="dash-bottom-jump-archive-btn"
              onClick={() => setMerchantTab('reports')}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E2D9] text-[#2E6349] font-bold hover:bg-[#F4EFEA] transition flex items-center gap-1 whitespace-nowrap shadow-2xs"
            >
              <span>{t('jumpToArchive')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
      </div>
    </div>
  );
};
