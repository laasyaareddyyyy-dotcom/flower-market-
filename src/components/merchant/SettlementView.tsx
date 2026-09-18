import React, { useState, useMemo, useRef } from 'react';
import {
  Calculator,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Coins,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Truck,
  Layers,
  User,
  Phone,
  FileText,
  Share2,
  Copy,
  Check,
  FileSpreadsheet,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { FifteenDaySettlement, PaymentMode, Shipment } from '../../types';
import { formatDisplayDate, getTodayDateString, getPastDateString } from '../../data/initialData';
import { sounds } from '../../utils/audio';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { exportElementToPdf, printHtmlViaIframe } from '../../utils/pdfExport';

export const SettlementView: React.FC = () => {
  const {
    shipments,
    farmers,
    merchantProfile,
    settlements,
    calculate15DaySettlement,
    confirmSettlement,
    deleteShipment,
    deleteSettlement,
    activeSessionDate,
  } = useMandi();

  const [actionFeedbackMsg, setActionFeedbackMsg] = useState<string | null>(null);

  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemName?: string;
    itemDetails?: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Period Presets
  const [periodPreset, setPeriodPreset] = useState<'single-day' | 'sep1-15' | 'current-15' | 'month' | 'custom'>('sep1-15');
  const [startDate, setStartDate] = useState<string>('2024-09-01');
  const [endDate, setEndDate] = useState<string>('2024-09-15');
  const [commissionRate, setCommissionRate] = useState<number>(
    merchantProfile.defaultCommissionRate ?? 4
  );
  const [miscRate, setMiscRate] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFarmerId, setExpandedFarmerId] = useState<string | null>('FM-001');

  // Settlement Payment Modal State
  const [activeSettlingItem, setActiveSettlingItem] = useState<FifteenDaySettlement | null>(null);
  const [payMode, setPayMode] = useState<PaymentMode>('Cash');
  const [payRef, setPayRef] = useState<string>('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [lastSettledReceipt, setLastSettledReceipt] = useState<FifteenDaySettlement | null>(null);

  // Printable Statement Modal & Copy State
  const [printStatement, setPrintStatement] = useState<FifteenDaySettlement | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string>('');
  const settlementDocRef = useRef<HTMLDivElement>(null);

  // Quick preset selector
  const handlePresetChange = (preset: 'single-day' | 'sep1-15' | 'current-15' | 'month' | 'custom') => {
    setPeriodPreset(preset);
    if (preset === 'single-day') {
      const today = activeSessionDate || getTodayDateString();
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'sep1-15') {
      setStartDate('2024-09-01');
      setEndDate('2024-09-15');
    } else if (preset === 'current-15') {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      if (today.getDate() <= 15) {
        setStartDate(`${year}-${month}-01`);
        setEndDate(`${year}-${month}-15`);
      } else {
        const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
        setStartDate(`${year}-${month}-16`);
        setEndDate(`${year}-${month}-${lastDay}`);
      }
    } else if (preset === 'month') {
      setStartDate('2024-09-01');
      setEndDate('2024-09-30');
    }
  };

  // Calculate settlements for all farmers in the current period
  const calculatedSettlements = useMemo(() => {
    return farmers
      .map((farmer) => {
        // Check if already settled in this period
        const existingSettled = settlements.find(
          (s) =>
            s.farmerId === farmer.id &&
            s.periodStart === startDate &&
            s.periodEnd === endDate &&
            s.status === 'settled'
        );

        if (existingSettled) {
          return existingSettled;
        }

        return calculate15DaySettlement(farmer.id, startDate, endDate, commissionRate, miscRate);
      })
      .filter((s) => {
        // Filter by search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.farmerName.toLowerCase().includes(q) ||
          s.farmerVillage.toLowerCase().includes(q) ||
          (s.farmerPhone && s.farmerPhone.includes(q))
        );
      });
  }, [farmers, startDate, endDate, commissionRate, miscRate, settlements, calculate15DaySettlement, searchQuery]);

  // High-level Fortnight summary metrics
  const totals = useMemo(() => {
    const totalShipments = calculatedSettlements.reduce((sum, s) => sum + s.totalShipmentsCount, 0);
    const totalGross = calculatedSettlements.reduce((sum, s) => sum + s.totalGross, 0);
    const totalTransport = calculatedSettlements.reduce((sum, s) => sum + s.totalTransport, 0);
    const totalHamali = calculatedSettlements.reduce((sum, s) => sum + s.totalHamali, 0);
    const totalPendingAfterDailyCuts = calculatedSettlements.reduce(
      (sum, s) => sum + s.pendingAmountAfterDailyCuts,
      0
    );
    const totalCommission = calculatedSettlements.reduce((sum, s) => sum + s.commissionAmount, 0);
    const totalMisc = calculatedSettlements.reduce((sum, s) => sum + (s.miscAmount || 0), 0);
    const totalFinalPayment = calculatedSettlements.reduce((sum, s) => sum + s.finalPayment, 0);

    return {
      totalShipments,
      totalGross,
      totalTransport,
      totalHamali,
      totalPendingAfterDailyCuts,
      totalCommission,
      totalMisc,
      totalFinalPayment,
    };
  }, [calculatedSettlements]);

  // Execute Settlement
  const handleConfirmPay = () => {
    if (!activeSettlingItem) return;
    confirmSettlement(activeSettlingItem, payMode, payRef);
    sounds.playCashChime();
    setLastSettledReceipt(activeSettlingItem);
    setActiveSettlingItem(null);
    setIsSuccessModalOpen(true);
    setPayRef('');
  };

  // Format short date (e.g. Sep 1)
  const formatShortDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${monthNames[monthIdx] || 'Sep'} ${day}`;
    }
    return dateStr;
  };

  // Generate CSV matching exact user settlement specification
  const generateSettlementCSV = (statement: FifteenDaySettlement): string => {
    const farmerShipments = shipments
      .filter((s) => s.farmerId === statement.farmerId && s.date >= statement.periodStart && s.date <= statement.periodEnd)
      .sort((a, b) => a.date.localeCompare(b.date));

    const periodLabel = statement.periodStart === '2024-09-01' && statement.periodEnd === '2024-09-15'
      ? 'Sep 1-15, 2024'
      : `${formatShortDate(statement.periodStart)}-${formatShortDate(statement.periodEnd).split(' ')[1] || statement.periodEnd.split('-')[2]}, ${statement.periodStart.split('-')[0]}`;

    const farmerDisplayName = statement.farmerName.split('(')[0].trim().toUpperCase() || statement.farmerName.toUpperCase();

    const transactionsRows = farmerShipments.map((s) => {
      const d = formatShortDate(s.date);
      const varieties = s.items.map((i) => i.flowerVariety.replace(/\s*\([^)]*\)/g, '').trim()).join(' + ');
      const totalQty = s.items.reduce((sum, i) => sum + i.quantity, 0);
      return `${d},${varieties},${totalQty}kg,${s.grossTotal}`;
    }).join('\n');

    const totalSales = statement.totalGross;
    const totalHamali = statement.totalHamali;
    const totalTransport = statement.totalTransport;
    const commPercent = statement.commissionPercent ?? 4;
    const commAmount = statement.commissionAmount ?? Math.round(totalSales * (commPercent / 100));
    const mPercent = statement.miscPercent ?? miscRate;
    const mAmount = statement.miscAmount ?? Math.round(totalSales * (mPercent / 100));
    const farmerNet = statement.finalPayment ?? Math.max(0, totalSales - totalHamali - totalTransport - commAmount - mAmount);
    const totalCut = statement.totalDeductionsCut ?? (totalHamali + totalTransport + commAmount + mAmount);

    const statusLabel = statement.status === 'settled' ? 'FULLY SETTLED' : 'PENDING PAYOUT';

    return `SETTLEMENT REPORT - ${farmerDisplayName}
Period: ${periodLabel}
Status: ${statusLabel}

TRANSACTIONS
Date,Varieties,Qty,Amount
${transactionsRows}

CALCULATION BREAKDOWN
Particulars,Amount
Gross Total Sales,${totalSales}
Less: Hamali Charges,-${totalHamali}
Less: Transport Charges,-${totalTransport}
Less: Commission (${commPercent}%),-${commAmount}
Less: Misc Expenses (${mPercent}%),-${mAmount}
________________________________
NET FARMER AMOUNT,${farmerNet}

MERCHANT DEDUCTIONS SUMMARY
Hamali Charges,${totalHamali}
Transport Charges,${totalTransport}
Commission (${commPercent}%),${commAmount}
Miscellaneous (${mPercent}%),${mAmount}
Total Cut,${totalCut}
Settlement Status,${statusLabel}
`;
  };

  const handleDownloadCSV = (statement: FifteenDaySettlement) => {
    const csvContent = generateSettlementCSV(statement);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = statement.farmerName.split('(')[0].trim().replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('download', `Settlement_Report_${cleanName}_${statement.periodStart}_to_${statement.periodEnd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sounds.playCashChime();
  };

  const handleDownloadSettlementPdf = async (statement: FifteenDaySettlement) => {
    if (!settlementDocRef.current) return;
    setIsGeneratingPdf(true);
    setPdfStatusMessage('Rendering Settlement Ledger PDF...');
    try {
      const cleanName = statement.farmerName.split('(')[0].trim().replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Settlement_Report_${cleanName}_${statement.periodStart}_to_${statement.periodEnd}.pdf`;
      const result = await exportElementToPdf(settlementDocRef.current, {
        filename,
        format: 'a4',
        orientation: 'portrait',
        marginMm: 6,
        scale: 2,
        autoDownload: true,
      });
      if (result.success) {
        sounds.playCashChime();
        setPdfStatusMessage('✓ Settlement PDF downloaded successfully!');
      } else {
        setPdfStatusMessage(`Failed: ${result.error || 'PDF Generation Error'}`);
      }
    } catch (err: any) {
      console.error('[Settlement PDF Error]', err);
      setPdfStatusMessage('Error generating settlement PDF');
    } finally {
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfStatusMessage('');
      }, 3000);
    }
  };

  const handlePrintSettlementReport = (statement: FifteenDaySettlement) => {
    if (settlementDocRef.current) {
      printHtmlViaIframe(settlementDocRef.current, `Settlement Report - ${statement.farmerName}`);
    } else {
      window.print();
    }
  };

  // Generate ASCII / Text Report identical to specified PDF format
  const generateSettlementTextReport = (statement: FifteenDaySettlement): string => {
    const farmerShipments = shipments
      .filter((s) => s.farmerId === statement.farmerId && s.date >= statement.periodStart && s.date <= statement.periodEnd)
      .sort((a, b) => a.date.localeCompare(b.date));

    const periodLabel = statement.periodStart === '2024-09-01' && statement.periodEnd === '2024-09-15'
      ? 'Sep 1-15, 2024'
      : `${formatShortDate(statement.periodStart)}-${formatShortDate(statement.periodEnd).split(' ')[1] || statement.periodEnd.split('-')[2]}, ${statement.periodStart.split('-')[0]}`;

    const farmerDisplayName = statement.farmerName.split('(')[0].trim().toUpperCase() || statement.farmerName.toUpperCase();
    const statusLabel = statement.status === 'settled' ? 'FULLY SETTLED' : 'PENDING PAYOUT';

    const txLines = farmerShipments.map((s) => {
      const d = formatShortDate(s.date).padEnd(8, ' ');
      const varieties = s.items.map((i) => i.flowerVariety.replace(/\s*\([^)]*\)/g, '').trim()).join(' + ').padEnd(18, ' ');
      const qty = (s.items.reduce((sum, i) => sum + i.quantity, 0) + 'kg').padEnd(5, ' ');
      const amt = `₹${s.grossTotal.toLocaleString('en-IN')}`;
      return `${d} | ${varieties} | ${qty} | ${amt}`;
    }).join('\n');

    const hamaliLines = farmerShipments.map((s) => `   ${formatShortDate(s.date)}: ₹${s.hamaliCharge}`).join('\n');
    const transportLines = farmerShipments.map((s) => `   ${formatShortDate(s.date)}: ₹${s.transportCharge}`).join('\n');

    const totalSales = statement.totalGross;
    const totalHamali = statement.totalHamali;
    const totalTransport = statement.totalTransport;
    const commPercent = statement.commissionPercent ?? 4;
    const commAmount = statement.commissionAmount ?? Math.round(totalSales * (commPercent / 100));
    const mPercent = statement.miscPercent ?? miscRate;
    const mAmount = statement.miscAmount ?? Math.round(totalSales * (mPercent / 100));
    const farmerNet = statement.finalPayment ?? Math.max(0, totalSales - totalHamali - totalTransport - commAmount - mAmount);
    const totalCut = statement.totalDeductionsCut ?? (totalHamali + totalTransport + commAmount + mAmount);

    return `═══════════════════════════════════════════════════════════════
SETTLEMENT REPORT - ${farmerDisplayName}
Period: ${periodLabel}
Status: ${statusLabel}
═══════════════════════════════════════════════════════════════

TRANSACTIONS
─────────────────────────────────────────────────────────────
Date     | Varieties          | Qty   | Amount
─────────────────────────────────────────────────────────────
${txLines}

═══════════════════════════════════════════════════════════════

NET AMOUNT CALCULATION BREAKDOWN
─────────────────────────────────────────────────────────────

Gross Total Sales:                           ₹${totalSales.toLocaleString('en-IN')}

Less: Hamali Charges (already recorded):
${hamaliLines}
   ─────────────────────────────────────
   Total Hamali Charges:                    -₹${totalHamali.toLocaleString('en-IN')}

Less: Transport Charges (already recorded):
${transportLines}
   ─────────────────────────────────────
   Total Transport Charges:                 -₹${totalTransport.toLocaleString('en-IN')}

Less: Commission (${commPercent}% of Gross Total):
   ₹${totalSales.toLocaleString('en-IN')} × ${commPercent}%                       -₹${commAmount.toLocaleString('en-IN')}

Less: Misc Expenses (${mPercent}% of Gross Total):
   ₹${totalSales.toLocaleString('en-IN')} × ${mPercent}%                       -₹${mAmount.toLocaleString('en-IN')}

═══════════════════════════════════════════════════════════════

NET FARMER AMOUNT:
   ₹${totalSales.toLocaleString('en-IN')} - ₹${totalHamali.toLocaleString('en-IN')} - ₹${totalTransport.toLocaleString('en-IN')} - ₹${commAmount.toLocaleString('en-IN')} - ₹${mAmount.toLocaleString('en-IN')}
   = ₹${farmerNet.toLocaleString('en-IN')}

═══════════════════════════════════════════════════════════════

MERCHANT'S DEDUCTIONS SUMMARY (from Farmer's Total)
   Hamali Charges:       ₹${totalHamali.toLocaleString('en-IN')}
   Transport Charges:    ₹${totalTransport.toLocaleString('en-IN')}
   Commission (${commPercent}%):      ₹${commAmount.toLocaleString('en-IN')}
   Miscellaneous (${mPercent}%):   ₹${mAmount.toLocaleString('en-IN')}
   ──────────────────────────
   TOTAL CUT:            ₹${totalCut.toLocaleString('en-IN')}

═══════════════════════════════════════════════════════════════`;
  };

  const handleCopyReport = (statement: FifteenDaySettlement) => {
    const text = generateSettlementTextReport(statement);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    sounds.playScaleBeep();
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Get individual shipments for an expanded farmer
  const getFarmerShipmentsForPeriod = (farmerId: string): Shipment[] => {
    return shipments.filter((s) => {
      if (s.farmerId !== farmerId) return false;
      return s.date >= startDate && s.date <= endDate;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: 15-Day Settlement Engine */}
      <div className="bg-gradient-to-r from-[#2E6349] via-[#24533c] to-[#1F4532] text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#2E6349]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#DD9F2F] tracking-wider uppercase">
            <Calculator className="w-4 h-4" />
            <span>Mandi Settlement &amp; Parchi Generation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Farmer Settlement Ledger (Parchi)
          </h2>
          <p className="text-xs text-white/80 max-w-xl">
            Select a date range (Single Day, 15 Days, 1 Month, or Custom). Vehicle/Transport and Hamali charges recorded during sales, plus Commission ({commissionRate}%) &amp; Misc ({miscRate}%) are calculated and deducted across the selected period to give the Net Farmer Amount.
          </p>
        </div>

        {/* Date Presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/20 p-1.5 rounded-xl border border-white/10">
          <button
            type="button"
            id="preset-single-day"
            onClick={() => handlePresetChange('single-day')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              periodPreset === 'single-day'
                ? 'bg-[#DD9F2F] text-black shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Single Day
          </button>
          <button
            type="button"
            id="preset-sep1-15"
            onClick={() => handlePresetChange('sep1-15')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              periodPreset === 'sep1-15'
                ? 'bg-[#DD9F2F] text-black shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Sep 1 - 15 (15 Days)
          </button>
          <button
            type="button"
            id="preset-current-15"
            onClick={() => handlePresetChange('current-15')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              periodPreset === 'current-15'
                ? 'bg-[#DD9F2F] text-black shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Current 15 Days
          </button>
          <button
            type="button"
            id="preset-month"
            onClick={() => handlePresetChange('month')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              periodPreset === 'month'
                ? 'bg-[#DD9F2F] text-black shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Last 1 Month
          </button>
          <button
            type="button"
            id="preset-custom"
            onClick={() => handlePresetChange('custom')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              periodPreset === 'custom'
                ? 'bg-[#DD9F2F] text-black shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Custom Range
          </button>
        </div>
      </div>

      {/* Control Bar: Custom Date Pickers, Commission %, Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6B5E57]">Period:</span>
            <input
              type="date"
              id="settlement-start-date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPeriodPreset('custom');
              }}
              className="px-2.5 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-medium text-[#2A1F1A] focus:ring-2 focus:ring-[#2E6349] focus:outline-none"
            />
            <span className="text-xs text-[#6B5E57]">to</span>
            <input
              type="date"
              id="settlement-end-date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPeriodPreset('custom');
              }}
              className="px-2.5 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-medium text-[#2A1F1A] focus:ring-2 focus:ring-[#2E6349] focus:outline-none"
            />
          </div>

          {/* Commission rate adjustment */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E8E2D9]">
            <span className="text-xs font-bold text-[#6B5E57]">Comm:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                id="settlement-commission-input"
                min="0"
                max="20"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value) || 0)}
                className="w-13 px-1.5 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#2E6349] text-center focus:ring-2 focus:ring-[#2E6349] focus:outline-none"
              />
              <span className="text-xs font-bold text-[#2A1F1A]">%</span>
            </div>
          </div>

          {/* Misc rate adjustment */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E8E2D9]">
            <span className="text-xs font-bold text-[#6B5E57]">Misc:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                id="settlement-misc-input"
                min="0"
                max="10"
                step="0.5"
                value={miscRate}
                onChange={(e) => setMiscRate(Number(e.target.value) || 0)}
                className="w-13 px-1.5 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#2E6349] text-center focus:ring-2 focus:ring-[#2E6349] focus:outline-none"
              />
              <span className="text-xs font-bold text-[#2A1F1A]">%</span>
            </div>
          </div>
        </div>

        {/* Farmer Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#6B5E57] absolute left-3 top-2.5" />
          <input
            type="text"
            id="settlement-farmer-search"
            placeholder="Search farmer name, village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs text-[#2A1F1A] focus:ring-2 focus:ring-[#2E6349] focus:outline-none"
          />
        </div>
      </div>

      {/* Fortnight Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Shipments */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#6B5E57] uppercase tracking-wider block">
            Fortnight Shipments
          </span>
          <div className="text-2xl font-black text-[#2A1F1A]">
            {totals.totalShipments}{' '}
            <span className="text-xs font-normal text-[#6B5E57]">shipments</span>
          </div>
          <span className="text-[11px] text-[#6B5E57] block">
            Across {calculatedSettlements.length} active farmers
          </span>
        </div>

        {/* Total Deductions (Once per shipment) */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#6B5E57] uppercase tracking-wider block">
            Shipment Deductions
          </span>
          <div className="text-2xl font-black text-[#B24C27]">
            ₹{(totals.totalTransport + totals.totalHamali).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#6B5E57] block">
            Transport ₹{totals.totalTransport.toLocaleString('en-IN')} + Hamali ₹{totals.totalHamali.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Total Pending After Daily Cuts */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#6B5E57] uppercase tracking-wider block">
            Net After Daily Cuts
          </span>
          <div className="text-2xl font-black text-[#2E6349]">
            ₹{totals.totalPendingAfterDailyCuts.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#6B5E57] block">
            Before commission deduction
          </span>
        </div>

        {/* Total Final Fortnight Payout */}
        <div className="bg-[#FEF8ED] p-4 rounded-2xl border border-[#DD9F2F]/40 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#8C6218] uppercase tracking-wider block">
            Final Fortnight Payout
          </span>
          <div className="text-2xl font-black text-[#2A1F1A]">
            ₹{totals.totalFinalPayment.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#8C6218] block font-semibold">
            Less Comm ₹{totals.totalCommission.toLocaleString('en-IN')} + Misc ₹{totals.totalMisc.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Farmers 15-Day Settlement Cards / Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#2A1F1A] flex items-center gap-2">
            <User className="w-4 h-4 text-[#2E6349]" />
            <span>Farmer Settlement Accounts ({calculatedSettlements.length})</span>
          </h3>
          <span className="text-xs text-[#6B5E57]">
            Showing Fortnight: <strong className="text-[#2E6349]">{startDate} to {endDate}</strong>
          </span>
        </div>

        {calculatedSettlements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-[#DD9F2F] mx-auto" />
            <h4 className="font-bold text-[#2A1F1A]">No shipments found for this period</h4>
            <p className="text-xs text-[#6B5E57]">
              Try selecting a different date range or select "Sep 1 - 15, 2024" to view example records.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {calculatedSettlements.map((item) => {
              const isExpanded = expandedFarmerId === item.farmerId;
              const farmerShipments = isExpanded ? getFarmerShipmentsForPeriod(item.farmerId) : [];

              return (
                <div
                  key={item.id}
                  id={`settlement-card-${item.farmerId}`}
                  className={`bg-white rounded-2xl border transition shadow-2xs overflow-hidden ${
                    item.status === 'settled'
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-[#E8E2D9] hover:border-[#2E6349]/40'
                  }`}
                >
                  {/* Card Header & High-level calculation row */}
                  <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Farmer Details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-[#2A1F1A]">
                          {item.farmerName}
                        </span>
                        {item.status === 'settled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Settled / Paid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Settlement</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-[#6B5E57]">
                        <span>📍 {item.farmerVillage}</span>
                        <span>•</span>
                        <span>📞 {item.farmerPhone || 'N/A'}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#2E6349]">
                          {item.totalShipmentsCount} Shipments in Fortnight
                        </span>
                      </div>
                    </div>

                    {/* Middle: Exact Calculation Breakdown */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-[#FCFBF9] p-3 rounded-xl border border-[#E8E2D9] text-xs">
                      {/* Gross */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                          Total Gross
                        </span>
                        <span className="font-bold text-[#2A1F1A]">
                          ₹{item.totalGross.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Daily Cuts (Transport + Hamali) */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#B24C27] block">
                          Daily Cuts (T+H)
                        </span>
                        <span className="font-bold text-[#B24C27]">
                          -₹{(item.totalTransport + item.totalHamali).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Pending After Daily Cuts */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#2E6349] block">
                          Pending (After Cuts)
                        </span>
                        <span className="font-extrabold text-[#2E6349]">
                          ₹{item.pendingAmountAfterDailyCuts.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Commission */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8C6218] block">
                          Comm ({item.commissionPercent}%)
                        </span>
                        <span className="font-bold text-[#8C6218]">
                          -₹{item.commissionAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Misc Expenses */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-700 block">
                          Misc ({item.miscPercent}%)
                        </span>
                        <span className="font-bold text-purple-700">
                          -₹{item.miscAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* FINAL PAYMENT */}
                      <div className="pl-3 border-l border-[#E8E2D9]">
                        <span className="text-[10px] uppercase font-black text-[#2E6349] block">
                          Final Payment
                        </span>
                        <span className="text-base font-black text-[#2E6349]">
                          ₹{item.finalPayment.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                      {item.status !== 'settled' && (
                        <button
                          type="button"
                          id={`pay-btn-${item.farmerId}`}
                          onClick={() => setActiveSettlingItem(item)}
                          className="px-3.5 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition shadow-xs flex items-center gap-1.5"
                        >
                          <Coins className="w-3.5 h-3.5 text-[#DD9F2F]" />
                          <span>Settle & Pay</span>
                        </button>
                      )}

                      <button
                        type="button"
                        id={`pdf-btn-${item.farmerId}`}
                        onClick={() => setPrintStatement(item)}
                        className="px-3 py-2 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 shadow-2xs"
                        title="View & Download PDF Settlement Report"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#2E6349]" />
                        <span>PDF Report</span>
                      </button>

                      <button
                        type="button"
                        id={`csv-btn-${item.farmerId}`}
                        onClick={() => handleDownloadCSV(item)}
                        className="px-3 py-2 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 shadow-2xs"
                        title="Download CSV Settlement Report"
                      >
                        <Download className="w-3.5 h-3.5 text-[#DD9F2F]" />
                        <span>CSV</span>
                      </button>

                      <button
                        type="button"
                        id={`toggle-expand-${item.farmerId}`}
                        onClick={() => setExpandedFarmerId(isExpanded ? null : item.farmerId)}
                        className="p-2 rounded-xl border border-[#E8E2D9] hover:bg-[#F4EFEA] text-[#6B5E57] transition"
                        title="View Shipments Breakdown"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Shipment by Shipment Breakdown with Varieties */}
                  {isExpanded && (
                    <div className="bg-[#FCFBF9] border-t border-[#E8E2D9] p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#2E6349]" />
                          <span>Fortnight Shipments Included in this Settlement</span>
                        </span>
                        <span className="text-[11px] text-[#6B5E57]">
                          Hamali & Transport deducted once per shipment
                        </span>
                      </div>

                      {farmerShipments.length === 0 ? (
                        <div className="text-xs text-[#6B5E57] py-2">
                          No shipments found in this date range.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {farmerShipments.map((shp) => (
                            <div
                              key={shp.id}
                              className="bg-white rounded-xl p-3 sm:p-4 border border-[#E8E2D9] shadow-2xs space-y-2.5 text-xs"
                            >
                              {/* Shipment Meta */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4EFEA] pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-[#2E6349] bg-[#E9F3EE] px-2 py-0.5 rounded">
                                    {shp.shipmentNumber}
                                  </span>
                                  <span className="text-[#2A1F1A] font-semibold">
                                    📅 {formatDisplayDate(shp.date)}
                                  </span>
                                  <span className="text-[#6B5E57]">⏰ {shp.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {shp.notes && <span className="text-[#6B5E57]">💬 {shp.notes}</span>}
                                  <button
                                    type="button"
                                    id={`delete-shipment-btn-${shp.id}`}
                                    onClick={() => {
                                      setDeleteModalConfig({
                                        isOpen: true,
                                        title: 'Delete Shipment Record',
                                        itemName: `Shipment: ${shp.shipmentNumber}`,
                                        itemDetails: `Farmer: ${shp.farmerName} • Varieties: ${shp.items?.length || 0} • Gross Amount: ₹${(shp.grossTotal || 0).toLocaleString('en-IN')}`,
                                        message: `Are you sure you want to delete this shipment? This will permanently remove all flower items and deduction charges for this shipment from the settlement calculation.`,
                                        onConfirm: () => {
                                          deleteShipment(shp.id);
                                          sounds.playTrashSound?.();
                                          setActionFeedbackMsg(`✓ Shipment ${shp.shipmentNumber} deleted successfully.`);
                                          setTimeout(() => setActionFeedbackMsg(null), 3500);
                                          setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
                                        },
                                      });
                                    }}
                                    className="p-1 rounded text-[#9E3A24] hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                                    title="Delete this shipment record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Flower Items Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="text-[10px] uppercase font-bold text-[#6B5E57] border-b border-[#F4EFEA]">
                                      <th className="pb-1">Variety</th>
                                      <th className="pb-1 text-center">No. of Boxes</th>
                                      <th className="pb-1 text-right">Quantity</th>
                                      <th className="pb-1 text-right">Rate</th>
                                      <th className="pb-1 text-right">Gross Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#F4EFEA]">
                                    {shp.items.map((item) => (
                                      <tr key={item.id} className="text-xs">
                                        <td className="py-1.5 font-bold text-[#2A1F1A]">
                                          {item.flowerVariety}
                                        </td>
                                        <td className="py-1.5 text-center font-mono font-bold text-[#2A1F1A]">
                                          {item.boxesCount ? `${item.boxesCount} Boxes` : '0 Boxes'}
                                        </td>
                                        <td className="py-1.5 text-right text-[#6B5E57]">
                                          {item.quantity} {item.unit}
                                        </td>
                                        <td className="py-1.5 text-right text-[#6B5E57]">
                                          ₹{item.rate}/{item.unit}
                                        </td>
                                        <td className="py-1.5 text-right font-bold text-[#2A1F1A]">
                                          ₹{item.grossTotal.toLocaleString('en-IN')}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Deductions applied ONCE for this shipment */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F4EFEA] bg-[#FCFBF9] p-2 rounded-lg font-mono text-xs">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span>
                                    Shipment Gross: <strong>₹{shp.grossTotal.toLocaleString('en-IN')}</strong>
                                  </span>
                                  <span>•</span>
                                  <span className="text-[#B24C27]">
                                    Hamali (one worker/trip): <strong>-₹{shp.hamaliCharge}</strong>
                                  </span>
                                  <span>•</span>
                                  <span className="text-[#B24C27]">
                                    Transport (one truck/trip): <strong>-₹{shp.transportCharge}</strong>
                                  </span>
                                </div>
                                <div className="text-[#2E6349] font-bold">
                                  Net After Daily Cuts: ₹{shp.netAmountAfterDailyCuts.toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Settle & Pay */}
      {activeSettlingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E8E2D9] animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#F4EFEA] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E9F3EE] text-[#2E6349] flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#2A1F1A]">
                    Confirm 15-Day Payout
                  </h4>
                  <span className="text-xs text-[#6B5E57]">{activeSettlingItem.periodLabel}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSettlingItem(null)}
                className="text-[#6B5E57] hover:text-black text-sm"
              >
                ✕
              </button>
            </div>

            {/* Farmer summary */}
            <div className="bg-[#FCFBF9] p-3 rounded-xl border border-[#E8E2D9] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Farmer:</span>
                <span className="font-bold text-[#2A1F1A]">{activeSettlingItem.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Village:</span>
                <span>{activeSettlingItem.farmerVillage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Pending Amount (after daily cuts):</span>
                <span className="font-bold">₹{activeSettlingItem.pendingAmountAfterDailyCuts.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#8C6218]">
                <span>Less Commission ({activeSettlingItem.commissionPercent}%):</span>
                <span className="font-bold">-₹{activeSettlingItem.commissionAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span>Less Misc Expenses ({activeSettlingItem.miscPercent}%):</span>
                <span className="font-bold">-₹{(activeSettlingItem.miscAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-[#E8E2D9] pt-1.5 flex justify-between text-sm">
                <span className="font-extrabold text-[#2A1F1A]">Final Payout Amount:</span>
                <span className="font-black text-lg text-[#2E6349]">
                  ₹{activeSettlingItem.finalPayment.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2A1F1A] block">
                Select Payment Mode:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Cash', 'UPI', 'Bank Transfer'] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPayMode(mode)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      payMode === mode
                        ? 'border-[#2E6349] bg-[#E9F3EE] text-[#2E6349]'
                        : 'border-[#E8E2D9] text-[#6B5E57] hover:bg-[#FCFBF9]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference # */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2A1F1A] block">
                Reference / UTR / Voucher # (Optional):
              </label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. UTR-98481234, Cash Receipt #12"
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs focus:ring-2 focus:ring-[#2E6349] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveSettlingItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#6B5E57] hover:bg-[#FCFBF9] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="submit-confirm-payout-btn"
                onClick={handleConfirmPay}
                className="flex-1 py-2.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition shadow-xs"
              >
                Confirm & Mark Settled
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Success Receipt */}
      {isSuccessModalOpen && lastSettledReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-xl border border-[#E8E2D9]">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#2E6349] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-[#2A1F1A]">
                Settlement Completed Successfully!
              </h4>
              <p className="text-xs text-[#6B5E57]">
                Fortnight settlement for <strong>{lastSettledReceipt.farmerName}</strong> has been recorded and marked as Settled.
              </p>
            </div>
            <div className="bg-[#E9F3EE] p-3 rounded-xl text-center">
              <span className="text-xs text-[#2E6349] font-bold block">Paid Amount</span>
              <span className="text-2xl font-black text-[#2E6349]">
                ₹{lastSettledReceipt.finalPayment.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setPrintStatement(lastSettledReceipt);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition"
              >
                Print Voucher / PDF
              </button>
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#6B5E57] hover:bg-[#FCFBF9] transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable 15-Day Settlement Voucher / PDF View */}
      {printStatement && (() => {
        const farmerShipments = shipments
          .filter((s) => s.farmerId === printStatement.farmerId && s.date >= printStatement.periodStart && s.date <= printStatement.periodEnd)
          .sort((a, b) => a.date.localeCompare(b.date));

        const periodLabel = printStatement.periodStart === '2024-09-01' && printStatement.periodEnd === '2024-09-15'
          ? 'Sep 1-15, 2024'
          : `${formatShortDate(printStatement.periodStart)}-${formatShortDate(printStatement.periodEnd).split(' ')[1] || printStatement.periodEnd.split('-')[2]}, ${printStatement.periodStart.split('-')[0]}`;

        const farmerDisplayName = printStatement.farmerName.split('(')[0].trim().toUpperCase() || printStatement.farmerName.toUpperCase();

        const totalSales = printStatement.totalGross;
        const totalHamali = printStatement.totalHamali;
        const totalTransport = printStatement.totalTransport;
        const commPercent = printStatement.commissionPercent ?? 4;
        const commAmount = printStatement.commissionAmount ?? Math.round(totalSales * (commPercent / 100));
        const mPercent = printStatement.miscPercent ?? miscRate;
        const mAmount = printStatement.miscAmount ?? Math.round(totalSales * (mPercent / 100));
        const farmerNet = printStatement.finalPayment ?? Math.max(0, totalSales - totalHamali - totalTransport - commAmount - mAmount);
        const totalCut = printStatement.totalDeductionsCut ?? (totalHamali + totalTransport + commAmount + mAmount);

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 space-y-4 shadow-2xl border border-[#E8E2D9] my-6 max-h-[95vh] flex flex-col">
              {/* Top Action Toolbar */}
              <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E2D9] pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2E6349]/10 flex items-center justify-center text-[#2E6349]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#2A1F1A]">Kisan Mitra - Settlement Report</h3>
                    <p className="text-[11px] text-[#6B5E57]">{farmerDisplayName} • {periodLabel}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Download PDF */}
                  <button
                    type="button"
                    id="download-settlement-pdf-btn"
                    disabled={isGeneratingPdf}
                    onClick={() => handleDownloadSettlementPdf(printStatement)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
                    title="Generate and Download PDF file"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 text-[#DD9F2F] animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-[#DD9F2F]" />
                    )}
                    <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                  </button>

                  {/* Print */}
                  <button
                    type="button"
                    id="print-settlement-btn"
                    onClick={() => handlePrintSettlementReport(printStatement)}
                    className="px-3 py-1.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs font-bold text-[#2A1F1A] hover:bg-[#F4EFEA] flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                    title="Print via Printer / System Dialog"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#6B5E57]" />
                    <span>Print</span>
                  </button>

                  {/* Download CSV */}
                  <button
                    type="button"
                    id="download-settlement-csv-btn"
                    onClick={() => handleDownloadCSV(printStatement)}
                    className="px-3 py-1.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs font-bold text-[#2A1F1A] hover:bg-[#F4EFEA] flex items-center gap-1.5 shadow-2xs transition"
                    title="Download identical CSV Report"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#2E6349]" />
                    <span>CSV</span>
                  </button>

                  {/* Copy Report */}
                  <button
                    type="button"
                    id="copy-settlement-report-btn"
                    onClick={() => handleCopyReport(printStatement)}
                    className="px-3 py-1.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs font-bold text-[#2A1F1A] hover:bg-[#F4EFEA] flex items-center gap-1.5 shadow-2xs transition"
                    title="Copy Formatted Report Text"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#2E6349]" />
                        <span className="text-[#2E6349]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#6B5E57]" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={() => setPrintStatement(null)}
                    className="px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#6B5E57] hover:bg-[#FCFBF9] transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              {pdfStatusMessage && (
                <div className="no-print p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{pdfStatusMessage}</span>
                </div>
              )}

              {/* Printable Area - Formatted with exact specification */}
              <div className="overflow-y-auto flex-1 pr-1 print:overflow-visible">
                <div
                  ref={settlementDocRef}
                  id="settlement-printable-doc-canvas"
                  className="border-2 border-black p-5 sm:p-7 bg-white text-black font-mono text-xs leading-relaxed space-y-5 rounded-lg"
                >
                  {/* Top Double Line Header */}
                  <div className="border-y-4 border-double border-black py-2.5 text-center font-bold tracking-tight">
                    <div className="text-sm font-black uppercase">
                      SETTLEMENT REPORT - {farmerDisplayName}
                    </div>
                    <div className="text-xs text-gray-800 pt-0.5">
                      Period: {periodLabel}
                    </div>
                    <div className="text-[11px] font-bold pt-1">
                      Status:{' '}
                      <span className={printStatement.status === 'settled' ? 'text-emerald-800 uppercase' : 'text-amber-800 uppercase'}>
                        {printStatement.status === 'settled' ? 'FULLY SETTLED' : 'PENDING PAYOUT'}
                      </span>
                    </div>
                  </div>

                  {/* TRANSACTIONS TABLE */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-xs tracking-wider uppercase">
                      TRANSACTIONS
                    </div>
                    <div className="border-t border-black pt-1">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-black">
                            <th className="py-1.5 pr-2 font-bold w-20">Date</th>
                            <th className="py-1.5 px-2 font-bold">Varieties</th>
                            <th className="py-1.5 px-2 font-bold text-center w-20">No. of Boxes</th>
                            <th className="py-1.5 px-2 font-bold text-right w-16">Qty</th>
                            <th className="py-1.5 pl-2 font-bold text-right w-24">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {farmerShipments.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-3 text-center text-gray-500 italic">
                                No transactions recorded for this period.
                              </td>
                            </tr>
                          ) : (
                            farmerShipments.map((s) => {
                              const varieties = s.items
                                .map((i) => i.flowerVariety.replace(/\s*\([^)]*\)/g, '').trim())
                                .join(' + ');
                              const totalBoxes = s.items.reduce((sum, i) => sum + (i.boxesCount || 0), 0);
                              const totalQty = s.items.reduce((sum, i) => sum + i.quantity, 0);
                              return (
                                <tr key={s.id}>
                                  <td className="py-1.5 pr-2 font-semibold">{formatShortDate(s.date)}</td>
                                  <td className="py-1.5 px-2 text-gray-800">{varieties}</td>
                                  <td className="py-1.5 px-2 text-center text-gray-800 font-bold">{totalBoxes} Boxes</td>
                                  <td className="py-1.5 px-2 text-right text-gray-700">{totalQty}kg</td>
                                  <td className="py-1.5 pl-2 text-right font-bold">₹{s.grossTotal.toLocaleString('en-IN')}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* DOUBLE DIVIDER */}
                  <div className="border-b-4 border-double border-black my-3"></div>

                  {/* CALCULATION BREAKDOWN */}
                  <div className="space-y-3">
                    <div className="font-bold text-xs tracking-wider uppercase border-b border-black pb-1">
                      CALCULATION BREAKDOWN
                    </div>

                    {/* 1. TOTAL SALES */}
                    <div className="flex items-center justify-between font-bold py-1">
                      <span>1. TOTAL SALES:</span>
                      <span className="text-sm">₹{totalSales.toLocaleString('en-IN')}</span>
                    </div>

                    {/* 2. HAMALI CHARGES */}
                    <div className="space-y-1 pt-1">
                      <div className="font-semibold text-gray-800">
                        2. HAMALI CHARGES (Merchant's Cost):
                      </div>
                      <div className="pl-4 space-y-0.5 text-gray-700">
                        {farmerShipments.map((s) => (
                          <div key={`h-${s.id}`} className="flex justify-between">
                            <span>{formatShortDate(s.date)}:</span>
                            <span>₹{s.hamaliCharge.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-400 pt-1 flex justify-between font-bold pl-4 text-red-700">
                        <span>TOTAL HAMALI:</span>
                        <span>-₹{totalHamali.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* 3. TRANSPORT/VEHICLE CHARGES */}
                    <div className="space-y-1 pt-1">
                      <div className="font-semibold text-gray-800">
                        3. TRANSPORT/VEHICLE CHARGES (Merchant's Cost):
                      </div>
                      <div className="pl-4 space-y-0.5 text-gray-700">
                        {farmerShipments.map((s) => (
                          <div key={`t-${s.id}`} className="flex justify-between">
                            <span>{formatShortDate(s.date)}:</span>
                            <span>₹{s.transportCharge.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-400 pt-1 flex justify-between font-bold pl-4 text-red-700">
                        <span>TOTAL TRANSPORT:</span>
                        <span>-₹{totalTransport.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* DOUBLE DIVIDER */}
                    <div className="border-b-4 border-double border-black my-2"></div>

                    {/* 4. COMMISSION DEDUCTION */}
                    <div className="space-y-0.5">
                      <div className="font-semibold text-gray-800">
                        4. COMMISSION DEDUCTION
                      </div>
                      <div className="pl-4 text-gray-700">Commission Rate: {commPercent}% (calculated on Gross Total)</div>
                      <div className="pl-4 flex justify-between font-bold text-red-700">
                        <span>Amount: ₹{totalSales.toLocaleString('en-IN')} × {commPercent}%</span>
                        <span>-₹{commAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* 5. MISCELLANEOUS DEDUCTION */}
                    <div className="space-y-0.5">
                      <div className="font-semibold text-gray-800">
                        5. MISCELLANEOUS DEDUCTION
                      </div>
                      <div className="pl-4 text-gray-700">Miscellaneous Rate: {mPercent}% (calculated on Gross Total)</div>
                      <div className="pl-4 flex justify-between font-bold text-red-700">
                        <span>Amount: ₹{totalSales.toLocaleString('en-IN')} × {mPercent}%</span>
                        <span>-₹{mAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* DOUBLE DIVIDER */}
                    <div className="border-b-4 border-double border-black my-2"></div>

                    {/* FARMER'S NET TOTAL */}
                    <div className="space-y-1 py-1">
                      <div className="font-black text-xs sm:text-sm uppercase">
                        NET FARMER AMOUNT:
                      </div>
                      <div className="flex justify-between items-center font-black text-sm sm:text-base pl-4 text-[#2E6349] bg-emerald-50 p-2 rounded">
                        <span className="text-xs text-black font-normal">
                          ₹{totalSales.toLocaleString('en-IN')} - ₹{totalHamali.toLocaleString('en-IN')} - ₹{totalTransport.toLocaleString('en-IN')} - ₹{commAmount.toLocaleString('en-IN')} - ₹{mAmount.toLocaleString('en-IN')}
                        </span>
                        <span>= ₹{farmerNet.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* DOUBLE DIVIDER */}
                    <div className="border-b-4 border-double border-black my-2"></div>

                    {/* MERCHANT'S DEDUCTIONS SUMMARY */}
                    <div className="space-y-1 pt-1">
                      <div className="font-bold text-xs uppercase">
                        MERCHANT'S DEDUCTIONS SUMMARY (from Farmer's Total)
                      </div>
                      <div className="pl-4 space-y-0.5 text-gray-800">
                        <div className="flex justify-between">
                          <span>Hamali Charges:</span>
                          <span>₹{totalHamali.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transport Charges:</span>
                          <span>₹{totalTransport.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Commission ({commPercent}%):</span>
                          <span>₹{commAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Miscellaneous ({mPercent}%):</span>
                          <span>₹{mAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-t border-black pt-1 flex justify-between font-black text-xs">
                          <span>TOTAL CUT:</span>
                          <span>₹{totalCut.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM DOUBLE BORDER */}
                    <div className="border-b-4 border-double border-black my-4"></div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-8 pt-6 text-xs text-center">
                      <div>
                        <div className="border-t border-dashed border-gray-400 w-36 mx-auto mb-1"></div>
                        <span className="font-sans text-[11px] text-gray-700">Farmer Signature / Thumb</span>
                      </div>
                      <div>
                        <div className="border-t border-dashed border-gray-400 w-36 mx-auto mb-1"></div>
                        <span className="font-sans text-[11px] text-gray-700">Adathiya Commission Agent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Action Feedback Notification */}
      {actionFeedbackMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#2A1F1A] text-white px-4 py-2.5 rounded-xl shadow-xl border border-white/20 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-[#DD9F2F]" />
          <span>{actionFeedbackMsg}</span>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title={deleteModalConfig.title}
        itemName={deleteModalConfig.itemName}
        itemDetails={deleteModalConfig.itemDetails}
        message={deleteModalConfig.message}
        confirmText="CONFIRM DELETE"
        cancelText="CANCEL"
        onConfirm={deleteModalConfig.onConfirm}
        onCancel={() => setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
