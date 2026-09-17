import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  Search,
  Download,
  Printer,
  FileSpreadsheet,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertCircle,
  Receipt,
  Layers,
  Store,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { ReportFilters, SaleLot } from '../../types';
import { getTodayDateString, getPastDateString } from '../../data/initialData';
import { FarmerSalesReportsView } from '../common/FarmerSalesReportsView';

export const ReportsView: React.FC = () => {
  const {
    lots,
    farmers,
    merchantProfile,
    activeSessionDate,
    setSelectedParchiLot,
    openPdfModalForLot,
    t,
  } = useMandi();

  const todayStr = getTodayDateString();
  const yesterdayStr = getPastDateString(1);

  // Distinct dates in the archive sorted newest first (including today and yesterday)
  const availableDatesWithCounts = useMemo(() => {
    const map: Record<string, number> = {};
    // Ensure today and activeSessionDate are recognized
    map[todayStr] = 0;
    if (activeSessionDate) {
      map[activeSessionDate] = 0;
    }
    lots.forEach((lot) => {
      map[lot.date] = (map[lot.date] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [lots, todayStr, activeSessionDate]);

  // Report Filter State
  const [reportType, setReportType] = useState<'daily' | 'farmer' | 'dateRange' | 'farmer-search'>('daily');
  const [singleDate, setSingleDate] = useState<string>(activeSessionDate);
  const [startDate, setStartDate] = useState<string>(getPastDateString(7));
  const [endDate, setEndDate] = useState<string>(getTodayDateString());
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Partial' | 'Unpaid'>('all');

  // Filtered lots based on chosen report type & search
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      // 1. Date filter
      if (reportType === 'daily') {
        if (lot.date !== singleDate) return false;
      } else if (reportType === 'dateRange') {
        if (lot.date < startDate || lot.date > endDate) return false;
      } else if (reportType === 'farmer') {
        if (selectedFarmerId !== 'all' && lot.farmerId !== selectedFarmerId) return false;
        if (startDate && lot.date < startDate) return false;
        if (endDate && lot.date > endDate) return false;
      }

      // 2. Status filter
      if (statusFilter !== 'all' && lot.paymentStatus !== statusFilter) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          lot.parchiNumber.toLowerCase().includes(q) ||
          lot.farmerName.toLowerCase().includes(q) ||
          lot.farmerVillage.toLowerCase().includes(q) ||
          lot.flowerVariety.toLowerCase().includes(q) ||
          lot.paymentStatus.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [lots, reportType, singleDate, startDate, endDate, selectedFarmerId, statusFilter, searchQuery]);

  // Consolidated Summary Totals (Mandi Form C Ledger)
  const summaryTotals = useMemo(() => {
    return filteredLots.reduce(
      (acc, lot) => {
        const otherExp = lot.otherExpenditures?.misc || 0;
        const hamali = lot.ammaliCharges || lot.otherExpenditures?.hamali || 0;
        const transportExpense = lot.transportCharges || lot.otherExpenditures?.transport || 0;

        acc.boxes += lot.boxesCount || 0;
        acc.volume += lot.quantity;
        acc.gross += lot.grossTotal;
        acc.commission += lot.commissionAmount;
        acc.otherExp += otherExp;
        acc.hamali += hamali;
        acc.transportExpense += transportExpense;
        acc.netPayable += lot.farmerNetPayable;
        acc.paid += lot.amountPaid;
        acc.dues += lot.balanceDue;
        return acc;
      },
      {
        boxes: 0,
        volume: 0,
        gross: 0,
        commission: 0,
        otherExp: 0,
        hamali: 0,
        transportExpense: 0,
        netPayable: 0,
        paid: 0,
        dues: 0,
      }
    );
  }, [filteredLots]);

  // Party Details: Farmer Details & Merchant/Shop Details for Form C Ledger
  const partyFarmerDetails = useMemo(() => {
    if (selectedFarmerId && selectedFarmerId !== 'all') {
      const sf = farmers.find((f) => f.id === selectedFarmerId);
      if (sf) {
        return {
          name: sf.name,
          phone: sf.phone ? `+91 ${sf.phone}` : '—',
          address: sf.village ? `${sf.village}, APMC Catchment Area` : 'APMC Registered Consignor',
        };
      }
    }

    const uniqueIds = Array.from(new Set(filteredLots.map((l) => l.farmerId)));
    if (uniqueIds.length === 1) {
      const match = farmers.find((f) => f.id === uniqueIds[0]);
      return {
        name: match?.name || filteredLots[0]?.farmerName || 'Farmer Consignor',
        phone: match?.phone
          ? `+91 ${match.phone}`
          : filteredLots[0]?.farmerPhone
          ? `+91 ${filteredLots[0].farmerPhone}`
          : '—',
        address: match?.village || filteredLots[0]?.farmerVillage || 'APMC Catchment Village',
      };
    }

    if (uniqueIds.length > 1) {
      return {
        name: `Multiple Consignors (${uniqueIds.length} Farmers Recorded)`,
        phone: 'Refer to individual lot slips',
        address: 'APMC Market Catchment Villages',
      };
    }

    return {
      name: 'All Registered Mandi Consignors',
      phone: '—',
      address: 'APMC Flower Market Catchment Area',
    };
  }, [selectedFarmerId, farmers, filteredLots]);

  const partyMerchantDetails = useMemo(() => {
    const shopName = merchantProfile.shopName || 'Flower Mandi Commission Agency';
    const contact = merchantProfile.phoneNumber ? `+91 ${merchantProfile.phoneNumber}` : '—';
    const address =
      [merchantProfile.shopNumber, merchantProfile.apmcMarketName].filter(Boolean).join(', ') ||
      'APMC Wholesale Flower Market Yard';
    return {
      name: shopName,
      phone: contact,
      address,
    };
  }, [merchantProfile]);

  // Export CRV CSV
  const handleExportCSV = () => {
    if (filteredLots.length === 0) {
      alert('No records to export.');
      return;
    }

    const headers = [
      'Parchi Number',
      'Date',
      'Time',
      'Farmer Name',
      'Farmer Village',
      'Farmer Mobile',
      'Flower Variety',
      'Flower Quality',
      'No. of Boxes',
      'Quantity',
      'Unit',
      'Rate per Unit (INR)',
      'Commission (INR)',
      'Other Expenditure (INR)',
      'Transport Expense (INR)',
      'Farmer Amount (INR)',
      'Amount Paid (INR)',
      'Remaining Balance Due (INR)',
      'Payment Status',
      'Payment Mode',
      'Reference Number',
    ];

    const rows = filteredLots.map((l) => [
      `"${l.parchiNumber}"`,
      `"${l.date}"`,
      `"${l.time}"`,
      `"${l.farmerName}"`,
      `"${l.farmerVillage}"`,
      `"${l.farmerPhone || ''}"`,
      `"${l.flowerVariety}"`,
      `"${l.flowerQuality || 'Good'}"`,
      l.boxesCount || 0,
      l.quantity,
      `"${l.unit}"`,
      l.rate,
      l.commissionAmount,
      l.otherExpenditures?.misc || 0,
      l.transportCharges || l.otherExpenditures?.transport || 0,
      l.farmerNetPayable,
      l.amountPaid,
      l.balanceDue,
      `"${l.paymentStatus}"`,
      `"${l.paymentMode || ''}"`,
      `"${l.paymentReference || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `PhoolMitra-CRV-Ledger-${reportType}-${singleDate || startDate}.csv`
    );
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Archive Information & Quick Date Jump Banner (Hidden in print) */}
      <div className="no-print bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#2A1F1A] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#2E6349]" />
              <span>{t('reportsTitle')}</span>
            </h2>
            <p className="text-xs text-[#6B5E57]">{t('reportsSubtitle')}</p>
          </div>

          <div className="flex items-center gap-2 bg-[#FCFBF9] px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-mono">
            <span className="text-[#6B5E57]">{t('totalArchivedLots')}:</span>
            <span className="font-bold text-[#2E6349]">{lots.length} records</span>
          </div>
        </div>

        {/* Quick Date Jump Pills */}
        <div className="pt-2 border-t border-[#E8E2D9] space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] block">
            {t('quickDatePills')} (Click date to view saved lots):
          </span>
          <div className="flex flex-wrap gap-2">
            {availableDatesWithCounts.map(({ date, count }) => (
              <button
                key={date}
                id={`date-pill-${date}`}
                onClick={() => {
                  setReportType('daily');
                  setSingleDate(date);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs ${
                  reportType === 'daily' && singleDate === date
                    ? 'bg-[#2E6349] text-white border-[#2E6349]'
                    : 'bg-[#FCFBF9] text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#F4EFEA]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{date}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    reportType === 'daily' && singleDate === date
                      ? 'bg-white/20 text-white'
                      : 'bg-[#E8E2D9] text-[#2A1F1A]'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Controls & Filters (Hidden in print) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
        {/* Report Type Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#E8E2D9] pb-3">
          <button
            id="report-tab-daily"
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              reportType === 'daily'
                ? 'bg-[#2E6349] text-white shadow-2xs'
                : 'bg-[#FCFBF9] text-[#2A1F1A] border border-[#E8E2D9] hover:bg-[#F4EFEA]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t('dailyReport')}</span>
          </button>

          <button
            id="report-tab-farmer"
            onClick={() => setReportType('farmer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              reportType === 'farmer'
                ? 'bg-[#2E6349] text-white shadow-2xs'
                : 'bg-[#FCFBF9] text-[#2A1F1A] border border-[#E8E2D9] hover:bg-[#F4EFEA]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('farmerStatement')}</span>
          </button>

          <button
            id="report-tab-date-range"
            onClick={() => setReportType('dateRange')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              reportType === 'dateRange'
                ? 'bg-[#2E6349] text-white shadow-2xs'
                : 'bg-[#FCFBF9] text-[#2A1F1A] border border-[#E8E2D9] hover:bg-[#F4EFEA]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t('dateRangeReport')}</span>
          </button>

          <button
            id="report-tab-farmer-search"
            onClick={() => setReportType('farmer-search')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              reportType === 'farmer-search'
                ? 'bg-[#2E6349] text-white shadow-2xs'
                : 'bg-[#FCFBF9] text-[#2A1F1A] border border-[#E8E2D9] hover:bg-[#F4EFEA]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'te' ? 'రైతు శోధన & అమ్మకాల నివేదికలు' : 'Farmer Search & Sales Reports'}</span>
          </button>

          {/* Action Buttons: Generate PDF & Export CSV */}
          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 flex-wrap sm:flex-nowrap">
            <button
              id="open-pdf-modal-report-btn"
              onClick={() => {
                if (filteredLots.length > 0) {
                  openPdfModalForLot(filteredLots[0]);
                } else {
                  alert('No transactions found in current filter to generate PDF.');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-[#FEF8ED] border border-[#DD9F2F] text-[#2A1F1A] text-xs font-bold hover:bg-[#faebd1] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Configure Commission & Deductions for PDF Export"
            >
              <FileText className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span>PDF Export (Commission / Deductions)</span>
            </button>

            <button
              id="export-crv-csv-btn"
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Download CRV Excel CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-[#2E6349]" />
              <span>{t('exportCRVCSV')}</span>
            </button>

            <button
              id="print-pdf-report-btn"
              onClick={handlePrintReport}
              className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Generate printable official ledger sheet"
            >
              <Printer className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span>{t('generatePDFReport')}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Filters Form */}
        {reportType !== 'farmer-search' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {reportType === 'daily' ? (
              <div>
                <label className="block font-semibold text-[#2A1F1A] mb-1">
                  {t('selectDate')}
                </label>
                <input
                  id="filter-single-date"
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] font-mono font-bold"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block font-semibold text-[#2A1F1A] mb-1">
                    {t('startDate')}
                  </label>
                  <input
                    id="filter-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2A1F1A] mb-1">
                    {t('endDate')}
                  </label>
                  <input
                    id="filter-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] font-mono font-bold"
                  />
                </div>
              </>
            )}

            {reportType === 'farmer' && (
              <div>
                <label className="block font-semibold text-[#2A1F1A] mb-1">
                  {t('selectFarmerForReport')}
                </label>
                <select
                  id="filter-farmer-select"
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] font-semibold"
                >
                  <option value="all">All Registered Farmers</option>
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.village})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Status Filter */}
            <div>
              <label className="block font-semibold text-[#2A1F1A] mb-1">Payment Status</label>
              <select
                id="filter-status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] font-semibold"
              >
                <option value="all">All Payment Statuses</option>
                <option value="Paid">Fully Paid Only</option>
                <option value="Partial">Partially Paid Only</option>
                <option value="Unpaid">Unpaid / Due Only</option>
              </select>
            </div>

            {/* Real-time Ledger Search */}
            <div className={reportType === 'daily' ? 'sm:col-span-2' : ''}>
              <label className="block font-semibold text-[#2A1F1A] mb-1">Search within Ledger</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B5E57]" />
                <input
                  id="report-search-input"
                  type="text"
                  placeholder={t('searchInReport')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {reportType === 'farmer-search' ? (
        <FarmerSalesReportsView role="merchant" />
      ) : (
        /* Main Standardized Table & Print Formal PDF Layout */
        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xs overflow-hidden a4-ledger-print">
        {/* Formal Mandi Letterhead (Shown in print and top of sheet) */}
        <div className="p-4 sm:p-6 border-b-2 border-gray-300 bg-[#FCFBF9]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#2E6349] block">
                WHOLESALE FLOWER MARKET YARD
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#2A1F1A] mt-0.5">
                {merchantProfile.shopName}
              </h1>
              <p className="text-xs text-[#6B5E57] font-medium">
                {merchantProfile.shopNumber} • {merchantProfile.apmcMarketName}
              </p>
              <p className="text-[11px] text-[#6B5E57]">
                Ph: {merchantProfile.phoneNumber}
              </p>
            </div>

            <div className="sm:text-right border sm:border-0 p-2 sm:p-0 rounded-lg bg-white sm:bg-transparent">
              <div className="inline-block bg-[#2E6349] text-white px-2.5 py-1 rounded-md text-xs font-bold uppercase mb-1">
                Formal Auction Ledger Sheet (Form C)
              </div>
              <p className="text-xs font-bold text-[#2A1F1A]">
                Report: {reportType.toUpperCase()}
              </p>
              <p className="text-[11px] font-mono text-[#6B5E57]">
                Period: {reportType === 'daily' ? singleDate : `${startDate} to ${endDate}`}
              </p>
              <p className="text-[10px] text-[#6B5E57]">
                Generated on: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Party Details Section: Placed below header and above table */}
        <div className="p-4 sm:p-5 border-b border-gray-300 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs party-details-grid">
          {/* Farmer Details Column */}
          <div className="p-3.5 rounded-xl border border-gray-300 bg-[#FCFBF9] party-box">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6349] block mb-2 border-b border-gray-200 pb-1">
              Farmer Details
            </span>
            <div className="space-y-1.5 text-xs text-[#2A1F1A]">
              <div className="flex items-start">
                <span className="font-semibold text-[#6B5E57] w-28 shrink-0">Name:</span>
                <span className="font-bold text-[#2A1F1A]">{partyFarmerDetails.name}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-[#6B5E57] w-28 shrink-0">Contact Number:</span>
                <span className="font-mono text-[#2A1F1A]">{partyFarmerDetails.phone}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-[#6B5E57] w-28 shrink-0">Address:</span>
                <span className="text-[#2A1F1A]">{partyFarmerDetails.address}</span>
              </div>
            </div>
          </div>

          {/* Merchant/Shop Details Column */}
          <div className="p-3.5 rounded-xl border border-gray-300 bg-[#FCFBF9] party-box">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6349] block mb-2 border-b border-gray-200 pb-1">
              Merchant/Shop Details
            </span>
            <div className="space-y-1.5 text-xs text-[#2A1F1A]">
              <div className="flex items-start">
                <span className="font-semibold text-[#6B5E57] w-28 shrink-0">Shop Name:</span>
                <span className="font-bold text-[#2A1F1A]">{partyMerchantDetails.name}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-[#6B5E57] w-28 shrink-0">Contact Number:</span>
                <span className="font-mono text-[#2A1F1A]">{partyMerchantDetails.phone}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-[#6B5E57] w-28 shrink-0">Address:</span>
                <span className="text-[#2A1F1A]">{partyMerchantDetails.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Standardized Table */}
        {filteredLots.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-[#DD9F2F] flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#2A1F1A]">
              {reportType === 'daily' && singleDate === todayStr
                ? `Today's session (${todayStr}) is refreshed and empty (0 lots recorded yet).`
                : t('noRecordsMatchDate')}
            </p>
            <p className="text-xs text-[#6B5E57] max-w-md mx-auto">
              Every day starts clean for new sales, while all farmer records, past payment vouchers, and archive reports remain safely preserved.
            </p>
            {(() => {
              const activeDateWithData = availableDatesWithCounts.find((d) => d.count > 0);
              return activeDateWithData ? (
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setReportType('daily');
                      setSingleDate(activeDateWithData.date);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition shadow-2xs"
                  >
                    View Recorded Lots for {activeDateWithData.date} ({activeDateWithData.count} lots)
                  </button>
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse font-c-ledger-table">
              <thead className="bg-[#F4EFEA] text-[#2A1F1A] font-bold border-b border-[#E8E2D9]">
                <tr>
                  <th className="p-2 sm:p-2.5 text-left col-variety">Flower Variety</th>
                  <th className="p-2 sm:p-2.5 text-center whitespace-nowrap">No. of Boxes</th>
                  <th className="p-2 sm:p-2.5 text-right whitespace-nowrap">Quantity (Kgs)</th>
                  <th className="p-2 sm:p-2.5 text-right whitespace-nowrap">Rate/Unit (₹)</th>
                  <th className="p-2 sm:p-2.5 text-right whitespace-nowrap">Commission (₹)</th>
                  <th className="p-2 sm:p-2.5 text-right whitespace-nowrap">Other Expenditure (₹)</th>
                  <th className="p-2 sm:p-2.5 text-right whitespace-nowrap">Transport Expense (₹)</th>
                  <th className="p-2 sm:p-2.5 text-right whitespace-nowrap">Farmer Amount (₹)</th>
                  <th className="p-2 sm:p-2.5 text-center whitespace-nowrap">Status (Paid/Due)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {filteredLots.map((lot) => {
                  const transportExpense = lot.transportCharges || lot.otherExpenditures?.transport || 0;
                  const otherExpenditure = lot.otherExpenditures?.misc || 0;

                  return (
                    <tr key={lot.id} className="hover:bg-[#FCFBF9] transition">
                      <td className="p-2 sm:p-2.5 col-variety">
                        <div className="font-bold text-[#2A1F1A] text-xs sm:text-sm leading-snug break-words hyphens-none">
                          {lot.flowerVariety}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {lot.flowerQuality && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold border uppercase ${
                                lot.flowerQuality === 'Good'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : lot.flowerQuality === 'Average'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              {lot.flowerQuality}
                            </span>
                          )}
                          <span className="text-[10px] text-[#6B5E57] font-mono">
                            {lot.parchiNumber} • {lot.date}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedParchiLot(lot)}
                            className="no-print text-[10px] text-[#2E6349] hover:underline font-semibold cursor-pointer"
                            title="View Mandi Parchi"
                          >
                            [Slip]
                          </button>
                          <button
                            type="button"
                            onClick={() => openPdfModalForLot(lot)}
                            className="no-print text-[10px] text-[#DD9F2F] hover:underline font-bold cursor-pointer"
                            title="Generate PDF with Commission & Deductions"
                          >
                            [PDF]
                          </button>
                        </div>
                      </td>
                      <td className="p-2 sm:p-2.5 text-center font-mono text-xs text-[#2A1F1A]">
                        {lot.boxesCount ?? 0}
                      </td>
                      <td className="p-2 sm:p-2.5 text-right font-mono font-bold text-xs text-[#2A1F1A]">
                        {lot.quantity}
                      </td>
                      <td className="p-2 sm:p-2.5 text-right font-mono text-xs text-[#2A1F1A]">
                        ₹{lot.rate}
                      </td>
                      <td className="p-2 sm:p-2.5 text-right font-mono text-xs text-emerald-800 font-bold">
                        ₹{lot.commissionAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 sm:p-2.5 text-right font-mono text-xs text-amber-800 font-bold">
                        ₹{otherExpenditure.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 sm:p-2.5 text-right font-mono text-xs text-indigo-800">
                        ₹{transportExpense.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 sm:p-2.5 text-right font-mono font-black text-xs sm:text-sm text-[#2A1F1A]">
                        ₹{lot.farmerNetPayable.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 sm:p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block whitespace-nowrap ${
                            lot.paymentStatus === 'Paid' || lot.balanceDue === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : lot.paymentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {lot.paymentStatus === 'Paid' || lot.balanceDue === 0
                            ? 'Paid'
                            : lot.paymentStatus === 'Partial'
                            ? `Due ₹${lot.balanceDue}`
                            : 'Due'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Bold Summary Footer */}
              <tfoot className="bg-[#FCFBF9] font-black border-t-2 border-gray-400 text-xs">
                <tr>
                  <td className="p-2 sm:p-2.5 text-left uppercase tracking-wider text-[#2A1F1A] font-black col-variety">
                    Total ({filteredLots.length} {filteredLots.length === 1 ? 'lot' : 'lots'})
                  </td>
                  <td className="p-2 sm:p-2.5 text-center font-mono text-[#2A1F1A] font-bold">
                    {summaryTotals.boxes}
                  </td>
                  <td className="p-2 sm:p-2.5 text-right font-mono text-[#2A1F1A] font-black">
                    {summaryTotals.volume.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2 sm:p-2.5 text-right text-gray-400 font-normal">—</td>
                  <td className="p-2 sm:p-2.5 text-right font-mono text-emerald-800 font-black">
                    ₹{summaryTotals.commission.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2 sm:p-2.5 text-right font-mono text-amber-800 font-black">
                    ₹{summaryTotals.otherExp.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2 sm:p-2.5 text-right font-mono text-indigo-800 font-bold">
                    ₹{summaryTotals.transportExpense.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2 sm:p-2.5 text-right font-mono text-xs sm:text-sm text-[#2A1F1A] font-black">
                    ₹{summaryTotals.netPayable.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2 sm:p-2.5 text-center text-[10px] whitespace-nowrap">
                    <span className="text-emerald-700 font-bold block">
                      Paid: ₹{summaryTotals.paid.toLocaleString('en-IN')}
                    </span>
                    {summaryTotals.dues > 0 ? (
                      <span className="text-rose-700 font-bold block">
                        Due: ₹{summaryTotals.dues.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-emerald-600 block text-[9px]">Fully Settled</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
