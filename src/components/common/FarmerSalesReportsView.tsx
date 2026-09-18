import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Users,
  Store,
  Calendar,
  Layers,
  Receipt,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Building,
  Phone,
  MapPin,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  User,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { SaleLot, Farmer, MonthlySalesSummary, FarmerSearchResult } from '../../types';
import { sounds } from '../../utils/audio';
import { exportElementToPdf, printHtmlViaIframe } from '../../utils/pdfExport';
import {
  searchFarmersApi,
  getFarmerSalesSummaryApi,
  getFarmerTransactionsApi,
  filterLotsForFarmer,
} from '../../services/mandiApi';

interface FarmerSalesReportsViewProps {
  role: 'farmer' | 'merchant' | 'admin';
  defaultFarmerId?: string;
  defaultFarmerPhone?: string;
  defaultFarmerName?: string;
  onSelectFarmer?: (farmer: FarmerSearchResult) => void;
}

export const FarmerSalesReportsView: React.FC<FarmerSalesReportsViewProps> = ({
  role,
  defaultFarmerId,
  defaultFarmerPhone,
  defaultFarmerName,
}) => {
  const {
    lots,
    farmers,
    merchantProfile,
    setSelectedParchiLot,
    language,
    t,
  } = useMandi();

  // Search input
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<FarmerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Selected Farmer
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerSearchResult | null>(null);

  // Merchant filter for the selected farmer (All merchants vs specific merchant)
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('all');

  // Transactions filter by payment status
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Partial' | 'Unpaid'>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState('');
  const salesSummaryDocRef = useRef<HTMLDivElement>(null);

  // Initialize selected farmer for farmer portal
  useEffect(() => {
    if (role === 'farmer' && (defaultFarmerPhone || defaultFarmerName || defaultFarmerId)) {
      const cleanPhone = defaultFarmerPhone ? defaultFarmerPhone.replace(/\D/g, '').slice(-10) : '';
      setSelectedFarmer({
        farmerId: defaultFarmerId || `FM-${cleanPhone.slice(-4) || '001'}`,
        name: defaultFarmerName || 'Farmer',
        phone: cleanPhone,
        village: 'Local Belt',
        primaryCrops: ['Marigold (Banthi)', 'Jasmine (Mallepulu)'],
      });
    }
  }, [role, defaultFarmerId, defaultFarmerPhone, defaultFarmerName]);

  // Execute farmer search
  useEffect(() => {
    let isMounted = true;
    setIsSearching(true);

    searchFarmersApi({
      query: searchQuery,
      role,
      farmers,
      lots,
    })
      .then((res) => {
        if (isMounted) {
          setSearchResults(res.farmers);
          setIsSearching(false);
          // If no farmer selected yet in merchant view and search returns results, select the first if query is specific
          if (!selectedFarmer && res.farmers.length > 0 && searchQuery.trim().length >= 3) {
            setSelectedFarmer(res.farmers[0]);
          }
        }
      })
      .catch(() => {
        if (isMounted) setIsSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, farmers, lots, role]);

  // If no farmer selected yet and we have farmers in merchant portal, default to first farmer
  useEffect(() => {
    if (role !== 'farmer' && !selectedFarmer && farmers.length > 0) {
      const f = farmers[0];
      setSelectedFarmer({
        farmerId: f.id,
        name: f.name,
        phone: f.phone,
        village: f.village,
        primaryCrops: f.primaryCrops,
        photoUrl: f.photoUrl,
        connectedMerchantIds: f.connectedMerchantIds,
      });
    }
  }, [farmers, selectedFarmer, role]);

  // All lots for the selected farmer across the system
  const farmerAllLots = useMemo(() => {
    if (!selectedFarmer) return [];
    return filterLotsForFarmer(
      lots,
      selectedFarmer.farmerId,
      selectedFarmer.phone,
      selectedFarmer.name
    );
  }, [lots, selectedFarmer]);

  // List of distinct merchants who have transacted with this farmer
  const merchantsForFarmer = useMemo(() => {
    const map = new Map<string, string>();
    farmerAllLots.forEach((lot) => {
      const id = lot.merchantId || lot.merchantName || 'unknown-merchant';
      const name = lot.merchantName || lot.merchantId || 'APMC Mandi Commission Shop';
      map.set(id, name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [farmerAllLots]);

  // 1. Overall Monthly Sales (across all merchants)
  const overallMonthlySummaries = useMemo(() => {
    if (!selectedFarmer) return [];
    const monthMap: Record<string, SaleLot[]> = {};
    farmerAllLots.forEach((lot) => {
      const month = lot.date ? lot.date.slice(0, 7) : 'Unknown';
      if (!monthMap[month]) monthMap[month] = [];
      monthMap[month].push(lot);
    });

    const months = Object.keys(monthMap).sort((a, b) => b.localeCompare(a));
    return months.map((month) => {
      const gLots = monthMap[month];
      const volume = gLots.reduce((acc, l) => acc + (l.quantity || 0), 0);
      const boxes = gLots.reduce((acc, l) => acc + (l.boxesCount || 0), 0);
      const gross = gLots.reduce((acc, l) => acc + (l.grossTotal || 0), 0);
      const comm = gLots.reduce((acc, l) => acc + (l.commissionAmount || 0), 0);
      const exp = gLots.reduce((acc, l) => acc + (l.totalOtherExpenditures || 0), 0);
      const net = gLots.reduce((acc, l) => acc + (l.farmerNetPayable || 0), 0);
      const paid = gLots.reduce((acc, l) => acc + (l.amountPaid || 0), 0);
      const due = gLots.reduce((acc, l) => acc + (l.balanceDue || 0), 0);
      const settlementRate = net > 0 ? Math.min(100, Math.round((paid / net) * 100)) : 100;

      let monthLabel = month;
      try {
        const [y, m] = month.split('-');
        const d = new Date(Number(y), Number(m) - 1, 1);
        monthLabel = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      } catch {
        // keep fallback
      }

      return {
        month,
        monthLabel,
        merchantName: 'All Merchants (Overall)',
        lotsCount: gLots.length,
        totalBoxes: boxes,
        totalVolume: volume,
        grossTotal: gross,
        commissionAmount: comm,
        totalOtherExpenditures: exp,
        farmerNetPayable: net,
        amountPaid: paid,
        balanceDue: due,
        settlementRate,
      };
    });
  }, [farmerAllLots, selectedFarmer]);

  // 2. Specific Merchant Monthly Sales (filtered by selectedMerchantId)
  const specificMerchantMonthlySummaries = useMemo(() => {
    if (!selectedFarmer || selectedMerchantId === 'all') return [];

    const merchantLots = farmerAllLots.filter(
      (l) => l.merchantId === selectedMerchantId || l.merchantName?.toLowerCase() === selectedMerchantId.toLowerCase()
    );

    const monthMap: Record<string, SaleLot[]> = {};
    merchantLots.forEach((lot) => {
      const month = lot.date ? lot.date.slice(0, 7) : 'Unknown';
      if (!monthMap[month]) monthMap[month] = [];
      monthMap[month].push(lot);
    });

    const months = Object.keys(monthMap).sort((a, b) => b.localeCompare(a));
    const merchantName = merchantsForFarmer.find((m) => m.id === selectedMerchantId)?.name || selectedMerchantId;

    return months.map((month) => {
      const gLots = monthMap[month];
      const volume = gLots.reduce((acc, l) => acc + (l.quantity || 0), 0);
      const boxes = gLots.reduce((acc, l) => acc + (l.boxesCount || 0), 0);
      const gross = gLots.reduce((acc, l) => acc + (l.grossTotal || 0), 0);
      const comm = gLots.reduce((acc, l) => acc + (l.commissionAmount || 0), 0);
      const exp = gLots.reduce((acc, l) => acc + (l.totalOtherExpenditures || 0), 0);
      const net = gLots.reduce((acc, l) => acc + (l.farmerNetPayable || 0), 0);
      const paid = gLots.reduce((acc, l) => acc + (l.amountPaid || 0), 0);
      const due = gLots.reduce((acc, l) => acc + (l.balanceDue || 0), 0);
      const settlementRate = net > 0 ? Math.min(100, Math.round((paid / net) * 100)) : 100;

      let monthLabel = month;
      try {
        const [y, m] = month.split('-');
        const d = new Date(Number(y), Number(m) - 1, 1);
        monthLabel = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      } catch {
        // keep fallback
      }

      return {
        month,
        monthLabel,
        merchantId: selectedMerchantId,
        merchantName,
        lotsCount: gLots.length,
        totalBoxes: boxes,
        totalVolume: volume,
        grossTotal: gross,
        commissionAmount: comm,
        totalOtherExpenditures: exp,
        farmerNetPayable: net,
        amountPaid: paid,
        balanceDue: due,
        settlementRate,
      };
    });
  }, [farmerAllLots, selectedFarmer, selectedMerchantId, merchantsForFarmer]);

  // 3. Transactions List for selected merchant (or all merchants)
  const transactionsList = useMemo(() => {
    let list = farmerAllLots;
    if (selectedMerchantId !== 'all') {
      list = list.filter(
        (l) => l.merchantId === selectedMerchantId || l.merchantName?.toLowerCase() === selectedMerchantId.toLowerCase()
      );
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'Paid') list = list.filter((l) => l.paymentStatus === 'Paid' || l.balanceDue <= 0);
      else if (statusFilter === 'Partial') list = list.filter((l) => l.paymentStatus === 'Partial' || (l.amountPaid > 0 && l.balanceDue > 0));
      else if (statusFilter === 'Unpaid') list = list.filter((l) => l.paymentStatus === 'Unpaid' && l.amountPaid === 0);
    }
    return list;
  }, [farmerAllLots, selectedMerchantId, statusFilter]);

  // Summary KPI calculation for current view (Overall or Specific Merchant)
  const currentViewSummaries = selectedMerchantId === 'all' ? overallMonthlySummaries : specificMerchantMonthlySummaries;

  const currentViewTotals = useMemo(() => {
    return currentViewSummaries.reduce(
      (acc, s) => {
        acc.lotsCount += s.lotsCount;
        acc.boxes += s.totalBoxes || 0;
        acc.volume += s.totalVolume;
        acc.gross += s.grossTotal;
        acc.net += s.farmerNetPayable;
        acc.paid += s.amountPaid;
        acc.due += s.balanceDue;
        return acc;
      },
      { lotsCount: 0, boxes: 0, volume: 0, gross: 0, net: 0, paid: 0, due: 0 }
    );
  }, [currentViewSummaries]);

  // Export Monthly Summary as CSV
  const handleExportMonthlyCSV = () => {
    if (currentViewSummaries.length === 0) {
      alert('No monthly sales records to export.');
      return;
    }

    const headers = [
      'Month',
      'Merchant Scope',
      'Parchi Slips Count',
      'No. of Boxes',
      'Total Flower Volume',
      'Gross Total (INR)',
      'Commission Deducted (INR)',
      'Other Expenses (INR)',
      'Farmer Net Payable (INR)',
      'Amount Received (INR)',
      'Balance Due (INR)',
      'Settlement Rate (%)',
    ];

    const rows = currentViewSummaries.map((s) => [
      `"${s.monthLabel} (${s.month})"`,
      `"${s.merchantName || 'All'}"`,
      s.lotsCount,
      s.totalBoxes || 0,
      s.totalVolume,
      s.grossTotal,
      s.commissionAmount,
      s.totalOtherExpenditures,
      s.farmerNetPayable,
      s.amountPaid,
      s.balanceDue,
      `${s.settlementRate}%`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const linkName = (selectedFarmer?.name || 'Farmer').replace(/\s+/g, '_');
    link.setAttribute(
      'download',
      `Monthly_Sales_Summary_${linkName}_${selectedMerchantId}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSalesSummaryPdf = async () => {
    if (!salesSummaryDocRef.current || !selectedFarmer) return;
    setIsGeneratingPdf(true);
    setPdfStatusMessage('Rendering Farmer Sales Summary PDF...');
    try {
      const cleanName = selectedFarmer.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Sales_Summary_${cleanName}_${selectedMerchantId}.pdf`;
      const result = await exportElementToPdf(salesSummaryDocRef.current, {
        filename,
        format: 'a4',
        orientation: 'landscape',
        marginMm: 6,
        scale: 2,
        autoDownload: true,
      });
      if (result.success) {
        sounds.playCashChime();
        setPdfStatusMessage('✓ Sales Summary PDF downloaded successfully!');
      } else {
        setPdfStatusMessage(`Failed: ${result.error || 'PDF Generation Error'}`);
      }
    } catch (err: any) {
      console.error('[Sales Summary PDF Error]', err);
      setPdfStatusMessage('Error generating sales summary PDF');
    } finally {
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfStatusMessage('');
      }, 3000);
    }
  };

  const handlePrintSalesSummary = () => {
    if (salesSummaryDocRef.current) {
      printHtmlViaIframe(salesSummaryDocRef.current, `Farmer Sales Summary - ${selectedFarmer?.name || 'Report'}`);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[#2A1F1A] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2E6349]" />
              <span>
                {role === 'farmer'
                  ? (language === 'te' ? 'నా అమ్మకాల నివేదికలు & లెడ్జర్' : 'My Sales Reports & Cross-Merchant Ledger')
                  : (language === 'te' ? 'రైతు అమ్మకాల శోధన & నివేదికలు' : 'Farmer Search & Cross-Merchant Sales Reports')}
              </span>
            </h3>
            <p className="text-xs text-[#6B5E57] mt-0.5">
              Comprehensive monthly sales totals, merchant-by-merchant transaction history, and settlement ledger.
            </p>
          </div>

          {/* Role badge */}
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E9F3EE] text-[#2E6349] border border-[#2E6349]/20 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E6349]" />
            <span>{role === 'farmer' ? 'Verified Farmer View' : 'Merchant / Admin Yard Mode'}</span>
          </span>
        </div>

        {/* Farmer Search Bar (Available to Merchant/Admin or for finding growers) */}
        {role !== 'farmer' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#2E6349]" />
              <span>Search Farmer by Name, Mobile Number, or Farmer ID:</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#6B5E57]" />
              <input
                id="farmer-cross-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type name (e.g. Ramesh), phone (e.g. 9876543210), or ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] text-xs font-medium text-[#2A1F1A] focus:outline-hidden focus:border-[#2E6349] focus:bg-white"
              />
            </div>

            {/* Live Search Quick Results Chips */}
            {searchResults.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto">
                {searchResults.slice(0, 8).map((f) => {
                  const isSelected = selectedFarmer?.farmerId === f.farmerId || selectedFarmer?.phone === f.phone;
                  return (
                    <button
                      type="button"
                      key={f.farmerId || f.phone}
                      onClick={() => {
                        setSelectedFarmer(f);
                        setSelectedMerchantId('all');
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#2E6349] text-white shadow-xs'
                          : 'bg-[#FCFBF9] text-[#2A1F1A] border border-[#E8E2D9] hover:bg-[#F4EFEA]'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>{f.name}</span>
                      <span className="text-[10px] opacity-75">({f.phone})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Farmer Info Card */}
      {selectedFarmer ? (
        <div className="bg-[#FCFBF9] p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#2E6349] text-white font-bold flex items-center justify-center text-lg shadow-xs">
                {selectedFarmer.photoUrl ? (
                  <img
                    src={selectedFarmer.photoUrl}
                    alt={selectedFarmer.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  selectedFarmer.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-[#2A1F1A]">{selectedFarmer.name}</h4>
                  <span className="text-[11px] font-mono text-[#2E6349] bg-white px-2 py-0.5 rounded border border-[#E8E2D9]">
                    {selectedFarmer.farmerId}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6B5E57] mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#2E6349]" />
                    {selectedFarmer.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#2E6349]" />
                    {selectedFarmer.village || 'APMC Catchment Belt'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: PDF Download, Print, CSV Export */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="farmer-pdf-monthly-report-btn"
                disabled={isGeneratingPdf}
                onClick={handleDownloadSalesSummaryPdf}
                className="px-3.5 py-1.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#DD9F2F] animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-[#DD9F2F]" />
                )}
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Summary'}</span>
              </button>

              <button
                type="button"
                id="farmer-print-monthly-report-btn"
                onClick={handlePrintSalesSummary}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E2D9] text-xs font-bold text-[#2A1F1A] hover:bg-[#FCFBF9] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#6B5E57]" />
                <span>Print</span>
              </button>

              <button
                type="button"
                id="farmer-export-monthly-report-btn"
                onClick={handleExportMonthlyCSV}
                className="px-3.5 py-1.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs font-bold text-[#2E6349] hover:bg-[#E9F3EE] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#DD9F2F]" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Status Message */}
          {pdfStatusMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{pdfStatusMessage}</span>
            </div>
          )}

          {/* Merchant Filter Dropdown (Requirement 2: All transactions with a specific merchant) */}
          <div className="pt-3 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <label htmlFor="farmer-report-merchant-filter" className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-[#2E6349]" />
                <span>Filter by Mandi Merchant:</span>
              </label>
              <select
                id="farmer-report-merchant-filter"
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E2D9] text-xs font-bold text-[#2A1F1A] focus:outline-hidden focus:border-[#2E6349]"
              >
                <option value="all">🌐 All Merchants (Overall Monthly Summary)</option>
                {merchantsForFarmer.map((m) => (
                  <option key={m.id} value={m.id}>
                    🏪 {m.name} ({m.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-[#6B5E57]">
              Scope:{' '}
              <strong className="text-[#2A1F1A]">
                {selectedMerchantId === 'all'
                  ? 'Consolidated across all Mandi merchants'
                  : `Dedicated with ${
                      merchantsForFarmer.find((m) => m.id === selectedMerchantId)?.name || selectedMerchantId
                    }`}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white rounded-2xl border border-[#E8E2D9] text-center text-xs text-[#6B5E57]">
          Select or search for a farmer above to view their monthly sales summaries and transaction records.
        </div>
      )}

      {/* KPI Cards & Monthly Sales Summary Printable Canvas */}
      {selectedFarmer && (
        <div ref={salesSummaryDocRef} id="farmer-sales-summary-printable-canvas" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-[#6B5E57] tracking-wider block">
                Parchi Lots
              </span>
              <div className="text-xl font-black text-[#2A1F1A] mt-1">
                {currentViewTotals.lotsCount}
              </div>
              <span className="text-[10px] text-[#6B5E57] block mt-0.5">Total transactions</span>
            </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#6B5E57] tracking-wider block">
              Volume
            </span>
            <div className="text-xl font-black text-[#2E6349] mt-1">
              {currentViewTotals.volume.toLocaleString('en-IN')} <span className="text-xs font-normal">units</span>
            </div>
            <span className="text-[10px] text-[#6B5E57] block mt-0.5">Flower harvest</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#6B5E57] tracking-wider block">
              Gross Auction
            </span>
            <div className="text-xl font-black text-[#2A1F1A] mt-1">
              ₹{currentViewTotals.gross.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-[#6B5E57] block mt-0.5">Yard turnover</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#6B5E57] tracking-wider block">
              Net Payable
            </span>
            <div className="text-xl font-black text-[#2A1F1A] mt-1">
              ₹{currentViewTotals.net.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-[#6B5E57] block mt-0.5">After deductions</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
              Amount Received
            </span>
            <div className="text-xl font-black text-emerald-700 mt-1">
              ₹{currentViewTotals.paid.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-800/80 block mt-0.5">Cleared cash/UPI</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider block">
              Balance Due
            </span>
            <div
              className={`text-xl font-black mt-1 ${
                currentViewTotals.due > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              ₹{currentViewTotals.due.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-[#6B5E57] block mt-0.5">
              {currentViewTotals.due > 0 ? 'Pending payment' : 'Fully settled'}
            </span>
          </div>
        </div>

        {/* SECTION 1: Monthly Sales Summary Table (Requirement 2.2 & 2.3) */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#F4EFEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-base text-[#2A1F1A] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2E6349]" />
                <span>
                  {selectedMerchantId === 'all'
                    ? `Monthly Sales Overall (Across All Mandi Merchants)`
                    : `Monthly Sales with ${
                        merchantsForFarmer.find((m) => m.id === selectedMerchantId)?.name || selectedMerchantId
                      }`}
                </span>
              </h4>
              <p className="text-xs text-[#6B5E57] mt-0.5">
                Aggregated month-by-month sales, flower volume, commission deductions, and payment settlement rates.
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-[#2E6349] bg-[#E9F3EE] px-2.5 py-1 rounded-full">
              {currentViewSummaries.length} Months Traded
            </span>
          </div>

          {currentViewSummaries.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#6B5E57]">
              No sales records found for this farmer in the selected merchant scope.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FCFBF9] text-[#6B5E57] border-b border-[#E8E2D9] font-bold">
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4">Merchant Scope</th>
                    <th className="py-3 px-4 text-center">Parchis</th>
                    <th className="py-3 px-4 text-center">No. of Boxes</th>
                    <th className="py-3 px-4 text-right">Volume</th>
                    <th className="py-3 px-4 text-right">Gross Total (₹)</th>
                    <th className="py-3 px-4 text-right">Deductions (₹)</th>
                    <th className="py-3 px-4 text-right">Net Payable (₹)</th>
                    <th className="py-3 px-4 text-right">Received (₹)</th>
                    <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                    <th className="py-3 px-4 text-center">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFEA]">
                  {currentViewSummaries.map((s) => (
                    <tr key={s.month} className="hover:bg-[#FCFBF9] transition">
                      {/* Month */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#2A1F1A] block">{s.monthLabel}</span>
                        <span className="text-[10px] text-[#6B5E57] font-mono block">{s.month}</span>
                      </td>

                      {/* Merchant Scope */}
                      <td className="py-3 px-4">
                        <span className="text-xs text-[#2A1F1A] font-semibold flex items-center gap-1">
                          <Store className="w-3 h-3 text-[#2E6349]" />
                          {s.merchantName || 'All Merchants'}
                        </span>
                      </td>

                      {/* Parchis Count */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold font-mono text-[#2E6349] bg-[#E9F3EE] px-2 py-0.5 rounded-full">
                          {s.lotsCount}
                        </span>
                      </td>

                      {/* No. of Boxes */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#2A1F1A]">
                        {s.totalBoxes || 0}
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-[#2A1F1A] block">
                          {s.totalVolume.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Gross */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#2A1F1A]">
                        ₹{s.grossTotal.toLocaleString('en-IN')}
                      </td>

                      {/* Deductions (Commission + Expenses) */}
                      <td className="py-3 px-4 text-right font-mono text-[#6B5E57]">
                        ₹{(s.commissionAmount + s.totalOtherExpenditures).toLocaleString('en-IN')}
                      </td>

                      {/* Net Payable */}
                      <td className="py-3 px-4 text-right font-mono font-black text-[#2A1F1A]">
                        ₹{s.farmerNetPayable.toLocaleString('en-IN')}
                      </td>

                      {/* Paid */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ₹{s.amountPaid.toLocaleString('en-IN')}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={s.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                          ₹{s.balanceDue.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Settlement Progress */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              s.settlementRate >= 100
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.settlementRate > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.settlementRate}%
                          </span>
                          <div className="w-14 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${s.settlementRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )}

      {/* SECTION 2: All Transactions with Selected Merchant (Requirement 2.1) */}
      {selectedFarmer && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#F4EFEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-base text-[#2A1F1A] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2E6349]" />
                <span>
                  All Transactions &amp; Receipts ({transactionsList.length}){' '}
                  {selectedMerchantId !== 'all' && (
                    <span className="text-xs font-normal text-[#6B5E57]">
                      with {merchantsForFarmer.find((m) => m.id === selectedMerchantId)?.name || selectedMerchantId}
                    </span>
                  )}
                </span>
              </h4>
              <p className="text-xs text-[#6B5E57] mt-0.5">
                Every individual parchi receipt slip, rate, quantity, and payment ledger record.
              </p>
            </div>

            {/* Payment Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#6B5E57]">Status:</label>
              <select
                id="farmer-report-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg bg-[#FCFBF9] border border-[#E8E2D9] text-xs font-medium text-[#2A1F1A] focus:outline-hidden focus:border-[#2E6349]"
              >
                <option value="all">All ({farmerAllLots.length})</option>
                <option value="Paid">Settled</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {transactionsList.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#6B5E57]">
              No individual transactions found matching the selected merchant and status filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FCFBF9] text-[#6B5E57] border-b border-[#E8E2D9] font-bold">
                    <th className="py-3 px-4">Parchi # / Date</th>
                    <th className="py-3 px-4">Merchant Shop</th>
                    <th className="py-3 px-4">Flower Variety</th>
                    <th className="py-3 px-4 text-center">No. of Boxes</th>
                    <th className="py-3 px-4 text-right">Quantity &amp; Rate</th>
                    <th className="py-3 px-4 text-right">Net Amount (₹)</th>
                    <th className="py-3 px-4 text-right">Paid (₹)</th>
                    <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Parchi Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFEA]">
                  {transactionsList.map((lot) => {
                    const isSettled = lot.paymentStatus === 'Paid' || lot.balanceDue <= 0;
                    const isPartial = lot.paymentStatus === 'Partial' || (lot.amountPaid > 0 && lot.balanceDue > 0);

                    return (
                      <tr key={lot.id} className="hover:bg-[#FCFBF9] transition">
                        {/* Parchi # / Date */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-[#2E6349] bg-white px-2 py-0.5 rounded border border-[#E8E2D9] block w-fit">
                            {lot.parchiNumber}
                          </span>
                          <span className="text-[11px] text-[#6B5E57] mt-1 block">
                            {lot.date} • {lot.time}
                          </span>
                        </td>

                        {/* Merchant */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#2A1F1A] flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-[#2E6349]" />
                            {lot.merchantName || 'Mandi Merchant'}
                          </span>
                          {lot.merchantId && (
                            <span className="text-[10px] text-[#6B5E57] font-mono block">
                              ID: {lot.merchantId}
                            </span>
                          )}
                        </td>

                        {/* Variety */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#2A1F1A]">🌸 {lot.flowerVariety}</span>
                        </td>

                        {/* No. of Boxes */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#2A1F1A]">
                          {lot.boxesCount ? `${lot.boxesCount} ${lot.packagingType || 'Boxes'}` : '0 Boxes'}
                        </td>

                        {/* Quantity & Rate */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-[#2A1F1A] block">
                            {lot.quantity} {lot.unit}
                          </span>
                          <span className="text-[10px] text-[#6B5E57] block">
                            @ ₹{lot.rate}/{lot.unit}
                          </span>
                        </td>

                        {/* Net Amount */}
                        <td className="py-3 px-4 text-right font-mono font-black text-[#2A1F1A]">
                          ₹{lot.farmerNetPayable.toLocaleString('en-IN')}
                        </td>

                        {/* Paid */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          ₹{lot.amountPaid.toLocaleString('en-IN')}
                        </td>

                        {/* Balance */}
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span className={lot.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                            ₹{lot.balanceDue.toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSettled
                                ? 'bg-emerald-100 text-emerald-800'
                                : isPartial
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isSettled ? 'Settled' : isPartial ? 'Partial' : 'Unpaid'}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            id={`report-view-parchi-btn-${lot.id}`}
                            onClick={() => {
                              sounds.playParchiPrint();
                              setSelectedParchiLot(lot);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#2E6349] text-white hover:bg-[#1F4532] text-[11px] font-bold transition inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-[#DD9F2F]" />
                            <span>View Parchi</span>
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
      )}
    </div>
  );
};
