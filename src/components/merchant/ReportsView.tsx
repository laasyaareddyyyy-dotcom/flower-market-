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
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { ReportFilters, SaleLot } from '../../types';
import { getTodayDateString, getPastDateString } from '../../data/initialData';

export const ReportsView: React.FC = () => {
  const {
    lots,
    farmers,
    merchantProfile,
    activeSessionDate,
    setSelectedParchiLot,
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
  const [reportType, setReportType] = useState<'daily' | 'farmer' | 'dateRange'>('daily');
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

  // Consolidated Summary Totals
  const summaryTotals = useMemo(() => {
    return filteredLots.reduce(
      (acc, lot) => {
        acc.volume += lot.quantity;
        acc.gross += lot.grossTotal;
        acc.commission += lot.commissionAmount;
        acc.otherExp += lot.totalOtherExpenditures;
        acc.netPayable += lot.farmerNetPayable;
        acc.paid += lot.amountPaid;
        acc.dues += lot.balanceDue;
        return acc;
      },
      { volume: 0, gross: 0, commission: 0, otherExp: 0, netPayable: 0, paid: 0, dues: 0 }
    );
  }, [filteredLots]);

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
      'Quantity',
      'Unit',
      'Rate per Unit (INR)',
      'Gross Total (INR)',
      'Commission Percent (%)',
      'Commission Amount (INR)',
      'Transport Fee (INR)',
      'Hamali Coolie (INR)',
      'Kanta Weighing (INR)',
      'Mandi Cess (INR)',
      'Packing Charges (INR)',
      'Misc Deductions (INR)',
      'Total Other Expenditures (INR)',
      'Farmer Net Payable (INR)',
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
      l.quantity,
      `"${l.unit}"`,
      l.rate,
      l.grossTotal,
      l.commissionPercent,
      l.commissionAmount,
      l.otherExpenditures?.transport || 0,
      l.otherExpenditures?.hamali || 0,
      l.otherExpenditures?.kanta || 0,
      l.otherExpenditures?.mandiCess || 0,
      l.otherExpenditures?.packingCharges || 0,
      l.otherExpenditures?.misc || 0,
      l.totalOtherExpenditures,
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

          {/* Action Buttons: Generate PDF & Export CSV */}
          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
            <button
              id="export-crv-csv-btn"
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 shadow-2xs"
              title="Download CRV Excel CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-[#2E6349]" />
              <span>{t('exportCRVCSV')}</span>
            </button>

            <button
              id="print-pdf-report-btn"
              onClick={handlePrintReport}
              className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-xs"
              title="Generate printable official ledger sheet"
            >
              <Printer className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span>{t('generatePDFReport')}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Filters Form */}
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
      </div>

      {/* Main Standardized Table & Print Formal PDF Layout */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F4EFEA] text-[#2A1F1A] font-bold border-b border-[#E8E2D9]">
                <tr>
                  <th className="p-2.5 whitespace-nowrap">{t('lotParchiNo')}</th>
                  <th className="p-2.5 whitespace-nowrap">Date</th>
                  <th className="p-2.5 whitespace-nowrap">{t('farmer')}</th>
                  <th className="p-2.5 whitespace-nowrap">{t('variety')}</th>
                  <th className="p-2.5 whitespace-nowrap text-right">{t('quantity')}</th>
                  <th className="p-2.5 whitespace-nowrap text-right">{t('ratePerUnit')}</th>
                  <th className="p-2.5 whitespace-nowrap text-right">{t('commission')}</th>
                  <th className="p-2.5 whitespace-nowrap text-right">{t('otherExp')}</th>
                  <th className="p-2.5 whitespace-nowrap text-right">{t('farmerNet')}</th>
                  <th className="p-2.5 whitespace-nowrap text-center">{t('status')}</th>
                  <th className="p-2.5 whitespace-nowrap text-center no-print">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {filteredLots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-[#FCFBF9] transition">
                    <td className="p-2.5 font-mono font-bold text-[#2E6349] whitespace-nowrap">
                      {lot.parchiNumber}
                    </td>
                    <td className="p-2.5 font-mono text-[#6B5E57] whitespace-nowrap">
                      {lot.date}
                    </td>
                    <td className="p-2.5">
                      <span className="font-bold text-[#2A1F1A] block">{lot.farmerName}</span>
                      <span className="text-[10px] text-[#6B5E57]">📍 {lot.farmerVillage}</span>
                    </td>
                    <td className="p-2.5 font-semibold text-[#2A1F1A]">{lot.flowerVariety}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-[#2A1F1A]">
                      {lot.quantity} {lot.unit}
                    </td>
                    <td className="p-2.5 text-right font-mono">₹{lot.rate}</td>
                    <td className="p-2.5 text-right font-mono text-emerald-800">
                      ₹{lot.commissionAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono text-rose-800">
                      ₹{lot.totalOtherExpenditures.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono font-black text-sm text-[#2A1F1A]">
                      ₹{lot.farmerNetPayable.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lot.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lot.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {lot.paymentStatus}
                      </span>
                    </td>
                    <td className="p-2.5 text-center no-print">
                      <button
                        onClick={() => setSelectedParchiLot(lot)}
                        className="px-2 py-1 rounded bg-[#FCFBF9] border border-[#E8E2D9] text-[#2E6349] hover:bg-gray-100 font-semibold text-[11px] flex items-center gap-1 mx-auto"
                        title="View / Print Parchi"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Slip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Bold Summary Footer */}
              <tfoot className="bg-[#FCFBF9] font-black border-t-2 border-gray-400 text-xs">
                <tr>
                  <td colSpan={4} className="p-3 text-right uppercase tracking-wider text-[#2A1F1A]">
                    {t('summaryTotals')} ({filteredLots.length} lots):
                  </td>
                  <td className="p-3 text-right font-mono text-[#2A1F1A]">
                    {summaryTotals.volume.toLocaleString('en-IN')} units
                  </td>
                  <td className="p-3 text-right text-gray-500">—</td>
                  <td className="p-3 text-right font-mono text-emerald-800">
                    ₹{summaryTotals.commission.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono text-rose-800">
                    ₹{summaryTotals.otherExp.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono text-base text-[#2A1F1A]">
                    ₹{summaryTotals.netPayable.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-center text-[10px]">
                    <span className="text-emerald-700 block">Paid: ₹{summaryTotals.paid.toLocaleString('en-IN')}</span>
                    <span className="text-rose-700 block">Due: ₹{summaryTotals.dues.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="p-3 no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Official Signature Block for Printable PDF */}
        <div className="p-6 pt-10 border-t border-gray-300 bg-white grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="border-t border-gray-500 pt-2 font-bold text-gray-800">
              Commission Merchant / Adathiya
            </div>
            <p className="text-[10px] text-gray-500">Authorized Mandi Agent Sign & Seal</p>
          </div>

          <div>
            <div className="border-t border-gray-500 pt-2 font-bold text-gray-800">
              Market Supervisor / Inspector
            </div>
            <p className="text-[10px] text-gray-500">Weighbridge & Market Yard Verification</p>
          </div>

          <div>
            <div className="border-t border-gray-500 pt-2 font-bold text-gray-800">
              Farmer / Mandi Consignor
            </div>
            <p className="text-[10px] text-gray-500">Ledger Acknowledgment</p>
          </div>
        </div>
      </div>
    </div>
  );
};
