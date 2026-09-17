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
  History,
  Truck,
  FileText,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { SaleLot, Shipment } from '../../types';
import { speakParchiDetails, speakShipmentDetails, sounds } from '../../utils/audio';

export const DashboardView: React.FC = () => {
  const {
    merchantProfile,
    activeSessionDate,
    todayLots,
    todayShipments,
    shipments,
    addShipment,
    todayTurnover,
    todayLotsCount,
    todayFarmersServed,
    todayTotalVolume,
    todayCommissionEarned,
    todayTransportTotal,
    todayHamaliTotal,
    todayFarmerNetTotal,
    totalOutstandingDues,
    setMerchantTab,
    setSelectedParchiLot,
    isGeneratePdfOpen,
    setIsGeneratePdfOpen,
    activePdfLot,
    setActivePdfLot,
    openPdfModalForLot,
    openPdfModalForShipment,
    openParchiSlipForShipment,
    setIsDateSwitcherOpen,
    setActiveSessionDate,
    setIsOwnerSignUpOpen,
    setIsFarmerSignUpOpen,
    setActiveFarmerId,
    language,
    lots,
    farmers,
    parchiAuditLogs,
    setIsAuditTrailOpen,
    t,
  } = useMandi();

  // Sort today's shipments and lots newest first
  const sortedShipments = [...todayShipments].reverse();
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

      {/* 4 Core Metric Cards (Simplified Dashboard View) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Amount */}
        <div
          id="metric-today-gross-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs hover:border-[#2E6349]/30 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
              Gross Amount
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

        {/* Card 2: Transport Expense */}
        <div
          id="metric-transport-expense-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs hover:border-[#2E6349]/30 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
              Transport Expense
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#2A1F1A] tracking-tight">
              ₹{todayTransportTotal.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium mt-1">
              <span>{language === 'te' ? 'రవాణా ఖర్చు • సరుకు రవాణా ఛార్జీలు' : 'Freight charges paid'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Hamali / Porter Charges */}
        <div
          id="metric-hamali-porter-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs hover:border-[#2E6349]/30 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
              Hamali / Porter Charges
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#DD9F2F] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#2A1F1A] tracking-tight">
              ₹{todayHamaliTotal.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-[#6B5E57] mt-1">
              {language === 'te' ? 'హమాలీ ఖర్చు • అన్‌లోడింగ్ & కాటా' : 'Unloading & weighing charges'}
            </div>
          </div>
        </div>

        {/* Card 4: Net Amount to Farmer */}
        <div
          id="metric-farmer-net-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#2E6349]/40 shadow-xs hover:border-[#2E6349] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E6349]">
              Net Amount to Farmer
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E9F3EE] text-[#2E6349] flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#2E6349] tracking-tight">
              ₹{todayFarmerNetTotal.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-[#6B5E57] text-[11px] truncate">
                {language === 'te' ? 'రైతుకు నికర మొత్తం' : 'Net to Farmer'}
              </span>
              <span className="font-bold text-[#2E6349]">Final Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-[#FFFFFF] p-3 sm:p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs">
        <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
          <span>{t('quickActions')}</span>
          <span className="text-[11px] font-normal text-[#6B5E57]">Direct shortcuts for mandi workflow &amp; PDF generation</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            id="qa-new-sale-btn"
            onClick={() => setMerchantTab('new-sale')}
            className="p-3 rounded-xl bg-[#2E6349] text-white font-bold text-xs sm:text-sm hover:bg-[#1F4532] transition flex items-center justify-center gap-2 shadow-xs group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#DD9F2F] group-hover:scale-110 transition" />
            <span>+ {t('tabNewSale')}</span>
          </button>

          <button
            id="qa-generate-pdf-btn"
            onClick={() => {
              if (sortedLots.length > 0) {
                openPdfModalForLot(sortedLots[0]);
              } else {
                setIsGeneratePdfOpen(true);
              }
            }}
            className="p-3 rounded-xl bg-[#FEF8ED] border-2 border-[#DD9F2F] text-[#2A1F1A] font-bold text-xs sm:text-sm hover:bg-[#faebd1] transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#DD9F2F]" />
            <span>📄 Generate PDF</span>
          </button>

          <button
            id="qa-reports-btn"
            onClick={() => setMerchantTab('reports')}
            className="p-3 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] font-bold text-xs sm:text-sm hover:bg-[#F4EFEA] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-[#2E6349]" />
            <span>📊 View Report</span>
          </button>

          <button
            id="qa-farmers-btn"
            onClick={() => setMerchantTab('farmers')}
            className="p-3 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] font-bold text-xs sm:text-sm hover:bg-[#F4EFEA] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#2E6349]" />
            <span>{t('tabFarmers')}</span>
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

          <div className="flex items-center gap-2">
            {parchiAuditLogs.length > 0 && (
              <button
                type="button"
                id="dash-open-audit-trail-btn"
                onClick={() => setIsAuditTrailOpen(true)}
                className="px-3 py-2 rounded-xl bg-white border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 shadow-2xs"
                title="View audit trail of printed and discarded parchi slips"
              >
                <History className="w-3.5 h-3.5 text-[#2E6349]" />
                <span>{t('viewAuditTrail')} ({parchiAuditLogs.length})</span>
              </button>
            )}

            <button
              id="dash-add-lot-btn"
              onClick={() => setMerchantTab('new-sale')}
              className="px-3.5 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-4 h-4 text-[#DD9F2F]" />
              <span>+ Record Lot</span>
            </button>
          </div>
        </div>

          {/* Today's Consignments & Lots List / Empty State */}
          {sortedShipments.length === 0 && sortedLots.length === 0 ? (
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
                  <span>+ Record Lot / Consignment</span>
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
            <div className="space-y-4">
              {/* Render Multi-Variety Consignments (Grouped by Shipment / Truck) */}
              {sortedShipments.map((shipment) => {
                const totalQty = shipment.items.reduce((acc, it) => acc + it.quantity, 0);
                const varietySummary = shipment.items.map((i) => `${i.flowerVariety} (${i.quantity} ${i.unit})`).join(', ');

                return (
                  <div
                    key={shipment.id}
                    id={`shipment-card-${shipment.id}`}
                    className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#2E6349]/20 shadow-xs hover:border-[#2E6349]/40 transition space-y-4"
                  >
                    {/* Top Row: Consignment Number, Truck Badge, Farmer Name, Payment Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E2D9]/70 pb-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-[#2E6349] bg-[#E9F3EE] px-2.5 py-1 rounded-lg border border-[#2E6349]/20 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#2E6349]" />
                          <span>{shipment.shipmentNumber}</span>
                        </span>
                        <span className="text-[#6B5E57] font-medium">{shipment.time}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FEF8ED] text-[#916212] font-bold text-[11px] border border-[#DD9F2F]/30 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>One-Truck Consignment ({shipment.items.length} varieties)</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            shipment.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : shipment.paymentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {shipment.paymentStatus === 'Paid'
                            ? t('statusPaid')
                            : shipment.paymentStatus === 'Partial'
                            ? `${t('statusPartial')} (Due ₹${shipment.balanceDue})`
                            : `${t('statusUnpaid')} (₹${shipment.balanceDue})`}
                        </span>
                      </div>
                    </div>

                    {/* Farmer Header & Truck Details */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FCFBF9] p-3 rounded-xl border border-[#E8E2D9]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                          Consignor Farmer
                        </span>
                        <span className="font-bold text-sm sm:text-base text-[#2A1F1A]">
                          {shipment.farmerName}
                        </span>
                        <span className="text-xs text-[#6B5E57] ml-2">📍 {shipment.farmerVillage}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                          Consignment Total Volume
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-[#2E6349]">
                          {totalQty} {shipment.items[0]?.unit || 'Kgs'} across {shipment.items.length} varieties
                        </span>
                      </div>
                    </div>

                    {/* Multi-variety breakdown table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse border border-[#E8E2D9] rounded-xl overflow-hidden">
                        <thead>
                          <tr className="bg-[#F4EFEA] text-[#2A1F1A] font-bold">
                            <th className="p-2.5">#</th>
                            <th className="p-2.5">Flower Variety</th>
                            <th className="p-2.5 text-center">Boxes</th>
                            <th className="p-2.5 text-center">Quality</th>
                            <th className="p-2.5 text-right">Quantity</th>
                            <th className="p-2.5 text-right">Rate</th>
                            <th className="p-2.5 text-right">Variety Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E2D9] bg-white">
                          {shipment.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-[#FCFBF9]">
                              <td className="p-2.5 font-mono text-[#6B5E57]">{idx + 1}</td>
                              <td className="p-2.5 font-bold text-[#2A1F1A]">
                                🌸 {item.flowerVariety}
                              </td>
                              <td className="p-2.5 text-center font-mono text-[#6B5E57]">
                                {item.boxesCount || '—'}
                              </td>
                              <td className="p-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.flowerQuality === 'Good'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : item.flowerQuality === 'Average'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {item.flowerQuality || 'Good'}
                                </span>
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="p-2.5 text-right font-mono">
                                ₹{item.rate}/{item.unit}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-[#2A1F1A]">
                                ₹{Math.round(item.quantity * item.rate).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Consolidated Financial Summary Strip (Deductions Done ONCE) */}
                    <div className="p-3.5 bg-[#F9F6F0] rounded-xl border border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[#6B5E57]">Consignment Gross:</span>
                          <span className="font-bold text-[#2A1F1A]">₹{shipment.grossTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-rose-700">
                            - Transport (1-time): <strong>₹{shipment.transportCharge}</strong>
                          </span>
                          <span className="text-rose-700">
                            - Hamali (1-time): <strong>₹{shipment.hamaliCharge}</strong>
                          </span>
                          <span className="text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            ✓ No double deduction
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                          Net Payable To Farmer
                        </span>
                        <span className="text-lg sm:text-xl font-black text-[#2E6349]">
                          ₹{shipment.netAmountAfterDailyCuts.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8E2D9]">
                      <div className="text-[11px] text-[#6B5E57]">
                        {shipment.notes && <span className="italic">Note: {shipment.notes}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Voice Readout */}
                        <button
                          type="button"
                          id={`speak-shipment-btn-${shipment.id}`}
                          onClick={() => {
                            sounds.playBidTick();
                            speakShipmentDetails(
                              shipment.farmerName,
                              varietySummary,
                              shipment.grossTotal,
                              shipment.transportCharge,
                              shipment.hamaliCharge,
                              shipment.netAmountAfterDailyCuts,
                              language
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] hover:bg-[#F4EFEA] text-[#2A1F1A] text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          title="Listen to Consignment Details in Voice"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#2E6349]" />
                          <span className="hidden sm:inline">Voice</span>
                        </button>

                        {/* Generate PDF Form C (Consolidated) */}
                        <button
                          type="button"
                          id={`generate-pdf-shipment-btn-${shipment.id}`}
                          onClick={() => openPdfModalForShipment(shipment)}
                          className="px-3 py-1.5 rounded-lg bg-[#FEF8ED] border border-[#DD9F2F] text-[#2A1F1A] text-xs font-bold hover:bg-[#faebd1] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Generate Form C PDF for this Consolidated Consignment"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#DD9F2F]" />
                          <span>Generate Form C PDF</span>
                        </button>

                        {/* Thermal / Paper Slip */}
                        <button
                          type="button"
                          id={`print-slip-shipment-btn-${shipment.id}`}
                          onClick={() => openParchiSlipForShipment(shipment)}
                          className="px-3 py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#DD9F2F]" />
                          <span>Parchi Slip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Render Single Lots (if any standalone lots not part of a shipment exist) */}
              {sortedLots
                .filter((lot) => !lot.shipmentId || sortedShipments.length === 0)
                .map((lot) => (
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

                      {/* Financials: Gross, Transport, Hamali, Net Amount to Farmer */}
                      <div className="sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                          Net Amount to Farmer
                        </span>
                        <span className="text-base font-black text-[#2E6349] block">
                          ₹{lot.farmerNetPayable.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#6B5E57] block">
                          Gross: ₹{lot.grossTotal.toLocaleString('en-IN')} | Transport: ₹{(lot.transportCharges || lot.otherExpenditures?.transport || 0).toLocaleString('en-IN')} | Hamali: ₹{(lot.ammaliCharges || lot.otherExpenditures?.hamali || 0).toLocaleString('en-IN')}
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
                          className="px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] hover:bg-[#F4EFEA] text-[#2A1F1A] text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          title={language === 'te' ? 'వాయిస్ చదవండి' : 'Listen to Parchi Details'}
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#2E6349]" />
                          <span className="hidden sm:inline">Voice</span>
                        </button>

                        {/* Generate PDF Button */}
                        <button
                          type="button"
                          id={`generate-pdf-btn-${lot.id}`}
                          onClick={() => openPdfModalForLot(lot)}
                          className="px-3 py-1.5 rounded-lg bg-[#FEF8ED] border border-[#DD9F2F] text-[#2A1F1A] text-xs font-bold hover:bg-[#faebd1] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Select Commission & Deductions and Generate Form C PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#DD9F2F]" />
                          <span>Generate PDF</span>
                        </button>

                        {/* Quick Thermal / Paper Print Slip */}
                        <button
                          type="button"
                          id={`view-parchi-btn-${lot.id}`}
                          onClick={() => setSelectedParchiLot(lot)}
                          className="px-3 py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#DD9F2F]" />
                          <span>Slip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Sticky / Dedicated Dashboard Footer Action Bar */}
          <div
            id="dashboard-footer-action-bar"
            className="sticky bottom-2 z-20 bg-[#2A1F1A] text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <div>
                <span className="text-white/60 block text-[10px] uppercase font-bold">Gross</span>
                <span className="font-bold font-mono text-[#DD9F2F]">₹{todayTurnover.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-l border-white/20 pl-3">
                <span className="text-white/60 block text-[10px] uppercase font-bold">Transport</span>
                <span className="font-bold font-mono text-blue-300">₹{todayTransportTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-l border-white/20 pl-3">
                <span className="text-white/60 block text-[10px] uppercase font-bold">Hamali</span>
                <span className="font-bold font-mono text-amber-300">₹{todayHamaliTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-l border-white/20 pl-3">
                <span className="text-emerald-400 block text-[10px] uppercase font-bold">Net to Farmer</span>
                <span className="font-black font-mono text-emerald-300 text-sm sm:text-base">
                  ₹{todayFarmerNetTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                id="dash-footer-generate-pdf-btn"
                onClick={() => {
                  if (sortedLots.length > 0) {
                    openPdfModalForLot(sortedLots[0]);
                  } else {
                    setIsGeneratePdfOpen(true);
                  }
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#DD9F2F] text-[#2A1F1A] font-black text-xs hover:bg-[#c68c22] transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Generate PDF</span>
              </button>

              <button
                type="button"
                id="dash-footer-view-report-btn"
                onClick={() => setMerchantTab('reports')}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>View Report</span>
              </button>
            </div>
          </div>

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
