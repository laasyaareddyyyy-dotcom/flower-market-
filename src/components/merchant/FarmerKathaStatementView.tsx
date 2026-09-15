import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  User,
  Phone,
  MapPin,
  Printer,
  Share2,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Receipt,
  Layers,
  ArrowDown,
  Sparkles,
  ShieldCheck,
  Store,
  ChevronRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { SaleLot, Farmer } from '../../types';
import { formatDisplayDate, getTodayDateString, getPastDateString } from '../../data/initialData';

interface FarmerKathaStatementViewProps {
  initialFarmer?: Farmer | null;
  onSelectParchiLot?: (lot: SaleLot) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const FarmerKathaStatementView: React.FC<FarmerKathaStatementViewProps> = ({
  initialFarmer,
  onSelectParchiLot,
  onClose,
  isModal = false,
}) => {
  const {
    lots,
    farmers,
    merchantProfile,
    setSelectedParchiLot,
    language,
    t,
  } = useMandi();

  const todayStr = getTodayDateString();

  // Search state
  const [searchNameQuery, setSearchNameQuery] = useState<string>(initialFarmer ? initialFarmer.name : '');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(
    initialFarmer ? initialFarmer.id : farmers[0]?.id || ''
  );

  // Date filters: Start Date and End Date
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  // Notification state
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Active farmer resolution
  const currentFarmer = useMemo(() => {
    return farmers.find((f) => f.id === selectedFarmerId) || initialFarmer || farmers[0] || null;
  }, [farmers, selectedFarmerId, initialFarmer]);

  // Filtered farmers list for search autocomplete
  const matchedFarmers = useMemo(() => {
    const q = searchNameQuery.toLowerCase().trim();
    if (!q) return farmers;
    return farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.phone.includes(q)
    );
  }, [farmers, searchNameQuery]);

  // All lots for this specific farmer
  const farmerAllLots = useMemo(() => {
    if (!currentFarmer) return [];
    const cleanPhone = currentFarmer.phone.replace(/\D/g, '').slice(-10);
    return lots.filter((l) => {
      const lotPhone = l.farmerPhone ? l.farmerPhone.replace(/\D/g, '').slice(-10) : '';
      return (
        l.farmerId === currentFarmer.id ||
        (cleanPhone && lotPhone === cleanPhone) ||
        (l.farmerName && l.farmerName.trim().toLowerCase() === currentFarmer.name.trim().toLowerCase())
      );
    });
  }, [lots, currentFarmer]);

  // Filter lots according to date range [startDate, endDate]
  const dateFilteredLots = useMemo(() => {
    if (!startDate && !endDate) return farmerAllLots;
    return farmerAllLots.filter((lot) => {
      if (!lot.date) return false;
      if (startDate && endDate) {
        return lot.date >= startDate && lot.date <= endDate;
      }
      if (startDate) return lot.date >= startDate;
      if (endDate) return lot.date <= endDate;
      return true;
    });
  }, [farmerAllLots, startDate, endDate]);

  // Is Single Day Mode?
  // "If start date and end date are the same, return just that single day's sale record for the farmer"
  const isSingleDay = Boolean(startDate && endDate && startDate === endDate);

  // Calculations for Katha Statement Waterfall
  const statementMetrics = useMemo(() => {
    const lotsCount = dateFilteredLots.length;
    const totalVolume = dateFilteredLots.reduce((acc, l) => acc + (l.quantity || 0), 0);
    const totalBoxes = dateFilteredLots.reduce((acc, l) => acc + (l.boxesCount || 0), 0);
    const grossTotal = dateFilteredLots.reduce((acc, l) => acc + (l.grossTotal || 0), 0);
    const commissionAmount = dateFilteredLots.reduce((acc, l) => acc + (l.commissionAmount || 0), 0);
    
    // Subtotal after commission
    const subtotalAfterCommission = Math.max(0, grossTotal - commissionAmount);

    // Hamali / Ammali
    const hamaliAmount = dateFilteredLots.reduce(
      (acc, l) => acc + (l.ammaliCharges || l.otherExpenditures?.hamali || 0),
      0
    );

    // Transport
    const transportAmount = dateFilteredLots.reduce(
      (acc, l) => acc + (l.transportCharges || l.otherExpenditures?.transport || 0),
      0
    );

    // Misc
    const miscAmount = dateFilteredLots.reduce(
      (acc, l) => acc + (l.otherExpenditures?.misc || 0),
      0
    );

    // Farmer's Final Net Amount
    const farmerNetMoney = dateFilteredLots.reduce((acc, l) => acc + (l.farmerNetPayable || 0), 0);
    const amountPaid = dateFilteredLots.reduce((acc, l) => acc + (l.amountPaid || 0), 0);
    const balanceDue = dateFilteredLots.reduce((acc, l) => acc + (l.balanceDue || 0), 0);

    return {
      lotsCount,
      totalVolume,
      totalBoxes,
      grossTotal,
      commissionAmount,
      subtotalAfterCommission,
      hamaliAmount,
      transportAmount,
      miscAmount,
      farmerNetMoney,
      amountPaid,
      balanceDue,
    };
  }, [dateFilteredLots]);

  // Quick date shortcuts
  const handleSetQuickDate = (type: 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'all') => {
    if (type === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === 'yesterday') {
      const y = getPastDateString(1);
      setStartDate(y);
      setEndDate(y);
    } else if (type === 'last7') {
      setStartDate(getPastDateString(7));
      setEndDate(todayStr);
    } else if (type === 'thisMonth') {
      const monthStart = `${todayStr.slice(0, 7)}-01`;
      setStartDate(monthStart);
      setEndDate(todayStr);
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Print Katha Statement
  const handlePrintStatement = () => {
    window.print();
  };

  // WhatsApp Share Statement
  const handleShareWhatsApp = () => {
    if (!currentFarmer) return;
    const dateLabel = isSingleDay ? `Date: ${startDate}` : `Period: ${startDate} to ${endDate}`;
    
    const text = `🌸 *${merchantProfile.shopName || 'Flower Mandi Shop'} - FARMER KATHA STATEMENT*
*Farmer:* ${currentFarmer.name} (Ph: ${currentFarmer.phone})
*Village:* ${currentFarmer.village}
*${dateLabel}*
*Total Lots:* ${statementMetrics.lotsCount} | *Boxes:* ${statementMetrics.totalBoxes || 0}
*Total Volume:* ${statementMetrics.totalVolume} units
==============================
*KATHA CALCULATION STATEMENT:*
1. Gross Sale Amount: ₹${statementMetrics.grossTotal.toLocaleString('en-IN')}
2. Less: Commission: -₹${statementMetrics.commissionAmount.toLocaleString('en-IN')}
------------------------------
3. Subtotal (After Commission): ₹${statementMetrics.subtotalAfterCommission.toLocaleString('en-IN')}
4. Less: Hamali / Ammali Charge: -₹${statementMetrics.hamaliAmount.toLocaleString('en-IN')}
5. Less: Transport Charge: -₹${statementMetrics.transportAmount.toLocaleString('en-IN')}
${statementMetrics.miscAmount > 0 ? `Less: Misc Expenses: -₹${statementMetrics.miscAmount.toLocaleString('en-IN')}\n` : ''}==============================
*FARMER'S FINAL NET AMOUNT:* ₹${statementMetrics.farmerNetMoney.toLocaleString('en-IN')}
*Amount Paid / Advance:* ₹${statementMetrics.amountPaid.toLocaleString('en-IN')}
*Balance Due:* ₹${statementMetrics.balanceDue.toLocaleString('en-IN')}
==============================
_Generated via PhoolMitra APMC Mandi System_`;

    const encoded = encodeURIComponent(text);
    const cleanPhone = currentFarmer.phone.replace(/\D/g, '').slice(-10);
    window.open(`https://wa.me/91${cleanPhone}?text=${encoded}`, '_blank');
  };

  // Export CSV Statement
  const handleExportCSV = () => {
    if (!currentFarmer || dateFilteredLots.length === 0) {
      alert('No transactions to export for the selected date range.');
      return;
    }

    const headers = [
      'Parchi Number',
      'Date',
      'Time',
      'Flower Variety',
      'Flower Quality',
      'No. of Boxes',
      'Quantity',
      'Unit',
      'Rate per Unit (INR)',
      'Gross Amount (INR)',
      'Merchant Commission (INR)',
      'Subtotal After Commission (INR)',
      'Hamali / Ammali Charge (INR)',
      'Transport Charge (INR)',
      "Farmer's Final Net Amount (INR)",
      'Amount Paid (INR)',
      'Balance Due (INR)',
      'Payment Status',
    ];

    const rows = dateFilteredLots.map((l) => {
      const gross = l.grossTotal || 0;
      const comm = l.commissionAmount || 0;
      const subtotal = Math.max(0, gross - comm);
      const hamali = l.ammaliCharges || l.otherExpenditures?.hamali || 0;
      const trans = l.transportCharges || l.otherExpenditures?.transport || 0;
      return [
        `"${l.parchiNumber}"`,
        `"${l.date}"`,
        `"${l.time}"`,
        `"${l.flowerVariety}"`,
        `"${l.flowerQuality || 'Good'}"`,
        l.boxesCount || 0,
        l.quantity,
        `"${l.unit}"`,
        l.rate,
        gross,
        comm,
        subtotal,
        hamali,
        trans,
        l.farmerNetPayable,
        l.amountPaid,
        l.balanceDue,
        `"${l.paymentStatus}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Farmer_Katha_${currentFarmer.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`
    );
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#2A1F1A] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#2E6349]" />
              <span>Farmer Katha Statement &amp; Date Range Search</span>
            </h3>
            <p className="text-xs text-[#6B5E57] mt-0.5">
              రైతు ఖాతా స్టేట్‌మెంట్ • Search by name, select date range, or instant single-day record lookup.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="katha-print-btn"
              onClick={handlePrintStatement}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E2D9] text-xs font-bold text-[#2A1F1A] hover:bg-[#FCFBF9] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#2E6349]" />
              <span>Print Statement</span>
            </button>

            <button
              type="button"
              id="katha-whatsapp-btn"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>

            <button
              type="button"
              id="katha-csv-btn"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search controls & Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-[#F4EFEA]">
          {/* 1. Farmer Search by Name */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#2E6349]" />
              <span>Search Farmer by Name / Phone:</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B5E57]" />
              <input
                id="merchant-katha-farmer-search-input"
                type="text"
                placeholder="Type name (e.g. Ramesh Reddy)..."
                value={searchNameQuery}
                onChange={(e) => setSearchNameQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] text-xs font-medium text-[#2A1F1A] focus:outline-hidden focus:border-[#2E6349] focus:bg-white"
              />
            </div>

            {/* Quick dropdown select from matching farmers */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {matchedFarmers.slice(0, 5).map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => {
                    setSelectedFarmerId(f.id);
                    setSearchNameQuery(f.name);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedFarmerId === f.id
                      ? 'bg-[#2E6349] text-white'
                      : 'bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#E9F3EE]'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Start Date Filter */}
          <div className="md:col-span-3 space-y-1.5">
            <label htmlFor="katha-start-date" className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#2E6349]" />
              <span>Start Date (ప్రారంభ తేదీ):</span>
            </label>
            <input
              id="katha-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] text-xs font-bold text-[#2A1F1A] focus:outline-hidden focus:border-[#2E6349] focus:bg-white"
            />
          </div>

          {/* 3. End Date Filter */}
          <div className="md:col-span-4 space-y-1.5">
            <label htmlFor="katha-end-date" className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#2E6349]" />
              <span>End Date (ముగింపు తేదీ):</span>
            </label>
            <input
              id="katha-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] text-xs font-bold text-[#2A1F1A] focus:outline-hidden focus:border-[#2E6349] focus:bg-white"
            />
          </div>
        </div>

        {/* Quick Date Range Shortcuts & Single-Day indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-[#F4EFEA]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#6B5E57] mr-1">Quick Select:</span>
            <button
              type="button"
              onClick={() => handleSetQuickDate('today')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                startDate === todayStr && endDate === todayStr
                  ? 'bg-[#2E6349] text-white'
                  : 'bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#E9F3EE]'
              }`}
            >
              Today (Single Day)
            </button>
            <button
              type="button"
              onClick={() => handleSetQuickDate('yesterday')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#E9F3EE] cursor-pointer"
            >
              Yesterday (Single Day)
            </button>
            <button
              type="button"
              onClick={() => handleSetQuickDate('last7')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#E9F3EE] cursor-pointer"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => handleSetQuickDate('thisMonth')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#E9F3EE] cursor-pointer"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => handleSetQuickDate('all')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#E9F3EE] cursor-pointer"
            >
              All Records
            </button>
          </div>

          {/* Single-Day vs Range Banner */}
          {isSingleDay ? (
            <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>⚡ Single Day Record Lookup: {startDate} (Instant 1-day sale view)</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Date Range Period: {startDate || 'Start'} to {endDate || 'End'}</span>
            </div>
          )}
        </div>
      </div>

      {/* FARMER KATHA STATEMENT DOCUMENT */}
      {currentFarmer ? (
        <div
          id="printable-katha-statement"
          className="bg-white rounded-2xl border-2 border-[#2E6349]/30 shadow-md overflow-hidden"
        >
          {/* Statement Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-[#2E6349] to-[#1F4532] text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#DD9F2F] bg-white/10 shrink-0 shadow-md">
                  {currentFarmer.photoUrl ? (
                    <img
                      src={currentFarmer.photoUrl}
                      alt={currentFarmer.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xl text-white">
                      {currentFarmer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#DD9F2F] text-[#2A1F1A] px-2 py-0.5 rounded">
                      FARMER KATHA STATEMENT
                    </span>
                    <span className="text-xs text-white/80 font-mono">
                      Ref #{currentFarmer.id}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mt-0.5">{currentFarmer.name}</h2>
                  <p className="text-xs text-white/80 flex items-center gap-3 mt-0.5 flex-wrap">
                    <span>📍 {currentFarmer.village}</span>
                    <span>📞 +91 {currentFarmer.phone}</span>
                    <span>🌾 Crops: {currentFarmer.primaryCrops.join(', ')}</span>
                  </p>
                </div>
              </div>

              {/* Mandi Merchant Details in Statement */}
              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/20">
                <div className="text-xs font-black text-[#DD9F2F] flex items-center sm:justify-end gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>{merchantProfile.shopName || 'Flower Mandi Shop'}</span>
                </div>
                <p className="text-[11px] text-white/80">
                  {merchantProfile.apmcMarketName || 'APMC Commercial Flower Yard'} • Shop {merchantProfile.shopNumber || '#42'}
                </p>
                <p className="text-[10px] text-white/70 font-mono mt-1">
                  Statement Period: {isSingleDay ? `Date: ${startDate}` : `${startDate || 'Start'} to ${endDate || 'End'}`}
                </p>
                <p className="text-[10px] text-white/60">
                  Generated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Statement Body */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-[#FCFBF9] rounded-xl border border-[#E8E2D9]">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Consignment Lots
                </span>
                <span className="text-lg font-black text-[#2A1F1A]">
                  {statementMetrics.lotsCount} {statementMetrics.lotsCount === 1 ? 'Lot' : 'Lots'}
                </span>
              </div>

              <div className="p-3 bg-[#FCFBF9] rounded-xl border border-[#E8E2D9]">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Total Boxes (బాక్సులు)
                </span>
                <span className="text-lg font-black text-[#2E6349] font-mono">
                  {statementMetrics.totalBoxes ? `${statementMetrics.totalBoxes} Boxes` : '—'}
                </span>
              </div>

              <div className="p-3 bg-[#FCFBF9] rounded-xl border border-[#E8E2D9]">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Total Flower Volume
                </span>
                <span className="text-lg font-black text-[#2A1F1A]">
                  {statementMetrics.totalVolume} units
                </span>
              </div>

              <div className="p-3 bg-[#FCFBF9] rounded-xl border border-[#E8E2D9]">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Current Status
                </span>
                <span
                  className={`text-sm font-black inline-block px-2.5 py-0.5 rounded-full mt-1 ${
                    statementMetrics.balanceDue === 0 && statementMetrics.lotsCount > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : statementMetrics.amountPaid > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {statementMetrics.balanceDue === 0 && statementMetrics.lotsCount > 0
                    ? 'Settled ✓'
                    : statementMetrics.amountPaid > 0
                    ? `Due ₹${statementMetrics.balanceDue.toLocaleString('en-IN')}`
                    : `Unpaid ₹${statementMetrics.balanceDue.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            {/* MANDATED SEQUENTIAL KATHA STATEMENT WATERFALL
                1. Gross sale amount
                2. Less: Merchant commission
                3. Subtotal (after commission)
                4. Less: Hamali charge
                5. Less: Transport charge
                6. Farmer's Final Net Amount
            */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FCFBF9] border-2 border-[#E8E2D9] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-5 bg-[#2E6349] rounded-full" />
                  <h4 className="text-sm font-black text-[#2A1F1A] uppercase tracking-wide">
                    Deduction Order &amp; Net Payable Calculation (లెక్కల క్రమం)
                  </h4>
                </div>
                <span className="text-xs font-bold text-[#6B5E57]">
                  {isSingleDay ? `Single Day: ${startDate}` : `Period Range`}
                </span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                {/* 1. Gross Sale Amount */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8E2D9]">
                  <div>
                    <span className="font-bold text-[#2A1F1A] block">1. Gross Sale Amount</span>
                    <span className="text-[10px] text-[#6B5E57]">మొత్తం వేలం అమ్మకం సొమ్ము (Total turnover before deductions)</span>
                  </div>
                  <span className="text-base font-bold font-mono text-[#2A1F1A]">
                    ₹{statementMetrics.grossTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* 2. Less: Merchant Commission */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div>
                    <span className="font-bold text-amber-900 block">2. Less: Merchant Commission</span>
                    <span className="text-[10px] text-amber-800">మర్చంట్ కమీషన్ మినహాయింపు (Mandi trade commission fee)</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-amber-900">
                    - ₹{statementMetrics.commissionAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* 3. Subtotal (After Commission) */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border-2 border-[#2E6349]/30">
                  <div>
                    <span className="font-black text-[#2E6349] block">3. Subtotal (After Commission)</span>
                    <span className="text-[10px] text-[#6B5E57]">కమీషన్ మినహాయించిన తర్వాత సబ్‌టోటల్ (Amount remaining post-commission)</span>
                  </div>
                  <span className="text-base font-black font-mono text-[#2E6349]">
                    ₹{statementMetrics.subtotalAfterCommission.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* 4. Less: Hamali Charge & 5. Less: Transport Charge placed beside / after commission */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* 4. Hamali Charge */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
                    <div>
                      <span className="font-bold text-rose-900 block">4. Less: Hamali / Ammali Charge</span>
                      <span className="text-[10px] text-rose-800">హమాలీ / కూలీ ఖర్చు (Coolie loading &amp; unloading fee)</span>
                    </div>
                    <span className="text-sm font-bold font-mono text-rose-900">
                      - ₹{statementMetrics.hamaliAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* 5. Transport Charge */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
                    <div>
                      <span className="font-bold text-rose-900 block">5. Less: Transport Charge</span>
                      <span className="text-[10px] text-rose-800">రవాణా ఖర్చు (Freight &amp; crate carriage charges)</span>
                    </div>
                    <span className="text-sm font-bold font-mono text-rose-900">
                      - ₹{statementMetrics.transportAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {statementMetrics.miscAmount > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700">
                    <span className="text-xs font-semibold">Other Misc Deductions</span>
                    <span className="font-mono text-xs font-bold">- ₹{statementMetrics.miscAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* 6. Farmer's Final Net Amount */}
                <div className="mt-2 p-3.5 sm:p-4 rounded-xl bg-emerald-600 text-white shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider block text-[#DD9F2F]">
                      6. FARMER'S FINAL NET AMOUNT (రైతు నికర సొమ్ము)
                    </span>
                    <span className="text-xs text-white/90 font-medium">
                      Final net payable to {currentFarmer.name} after all deductions
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono">
                    ₹{statementMetrics.farmerNetMoney.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Settlement status breakdown */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E8E2D9] flex justify-between items-center">
                    <span className="text-[#6B5E57] font-semibold">Amount Paid / Disbursed:</span>
                    <span className="font-bold text-emerald-700 font-mono text-sm">
                      ₹{statementMetrics.amountPaid.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E8E2D9] flex justify-between items-center">
                    <span className="text-[#6B5E57] font-semibold">Remaining Balance Due:</span>
                    <span
                      className={`font-bold font-mono text-sm ${
                        statementMetrics.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {statementMetrics.balanceDue > 0
                        ? `₹${statementMetrics.balanceDue.toLocaleString('en-IN')}`
                        : 'Cleared ✓'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consignment Lots Particulars Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#2A1F1A] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2E6349]" />
                  <span>
                    Consignment Particulars ({dateFilteredLots.length}{' '}
                    {isSingleDay ? `Lots for ${startDate}` : `Lots in Period`})
                  </span>
                </h4>
                <span className="text-xs text-[#6B5E57]">
                  Showing only lots for {currentFarmer.name}
                </span>
              </div>

              {dateFilteredLots.length === 0 ? (
                <div className="p-8 text-center bg-[#FCFBF9] rounded-xl border border-[#E8E2D9] text-xs text-[#6B5E57] space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                  <p className="font-bold text-[#2A1F1A]">No consignment lots found for the selected date range.</p>
                  <p>Try switching to &quot;Today&quot; or &quot;All Records&quot; above to view past entries.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#E8E2D9] rounded-xl bg-white">
                    <thead className="bg-[#F4EFEA] text-[#2A1F1A] font-bold border-b border-[#E8E2D9]">
                      <tr>
                        <th className="p-2.5">Date / Parchi #</th>
                        <th className="p-2.5">Flower Variety</th>
                        <th className="p-2.5">Quality</th>
                        <th className="p-2.5 text-center">Boxes</th>
                        <th className="p-2.5 text-right">Quantity</th>
                        <th className="p-2.5 text-right">Rate</th>
                        <th className="p-2.5 text-right">Gross Total</th>
                        <th className="p-2.5 text-right">Hamali</th>
                        <th className="p-2.5 text-right">Transport</th>
                        <th className="p-2.5 text-right">Farmer Net</th>
                        <th className="p-2.5 text-center">Parchi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D9]">
                      {dateFilteredLots.map((lot) => {
                        const hamali = lot.ammaliCharges || lot.otherExpenditures?.hamali || 0;
                        const trans = lot.transportCharges || lot.otherExpenditures?.transport || 0;

                        return (
                          <tr key={lot.id} className="hover:bg-[#FCFBF9]">
                            <td className="p-2.5 font-mono">
                              <span className="font-bold text-[#2E6349] block">{lot.parchiNumber}</span>
                              <span className="text-[10px] text-[#6B5E57]">{lot.date} • {lot.time}</span>
                            </td>
                            <td className="p-2.5 font-bold text-[#2A1F1A]">
                              {lot.flowerVariety}
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold border uppercase ${
                                  lot.flowerQuality === 'Bad'
                                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                                    : lot.flowerQuality === 'Average'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                }`}
                              >
                                {lot.flowerQuality || 'Good'}
                              </span>
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold text-gray-800">
                              {lot.boxesCount ? `${lot.boxesCount}` : '—'}
                            </td>
                            <td className="p-2.5 text-right font-bold text-[#2A1F1A]">
                              {lot.quantity} {lot.unit}
                            </td>
                            <td className="p-2.5 text-right font-mono">
                              ₹{lot.rate}/{lot.unit}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold">
                              ₹{lot.grossTotal.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 text-right font-mono text-rose-800">
                              {hamali > 0 ? `-₹${hamali}` : '₹0'}
                            </td>
                            <td className="p-2.5 text-right font-mono text-rose-800">
                              {trans > 0 ? `-₹${trans}` : '₹0'}
                            </td>
                            <td className="p-2.5 text-right font-mono font-black text-emerald-800">
                              ₹{lot.farmerNetPayable.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onSelectParchiLot) onSelectParchiLot(lot);
                                  else setSelectedParchiLot(lot);
                                }}
                                className="p-1 rounded bg-[#FCFBF9] border border-[#E8E2D9] text-[#2E6349] hover:bg-gray-100 cursor-pointer"
                                title="Open Parchi Receipt"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#E8E2D9] text-xs text-[#6B5E57]">
          Please select a farmer above to generate their Katha statement.
        </div>
      )}
    </div>
  );
};
