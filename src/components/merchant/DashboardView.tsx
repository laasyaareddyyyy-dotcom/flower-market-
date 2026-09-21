import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BookOpen,
  Store,
  Wrench,
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
  Volume2,
  History,
  Truck,
  FileText,
  Trash2,
  CheckCircle,
  Search,
  Filter,
  X,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  MapPin,
  QrCode,
  Settings,
  Headphones,
  FileSpreadsheet,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { SaleLot, Shipment, CommodityCategory, PaymentStatus } from '../../types';
import { COMMODITY_CONFIGS, getTodayDateString, formatDisplayDate } from '../../data/initialData';
import { speakParchiDetails, speakShipmentDetails, sounds } from '../../utils/audio';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { ConsignmentDetailModal } from './ConsignmentDetailModal';

export const DashboardView: React.FC = () => {
  const [actionFeedbackMsg, setActionFeedbackMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  // Consignment Details Modal state
  const [selectedConsignmentForModal, setSelectedConsignmentForModal] = useState<{
    type: 'shipment' | 'lot';
    shipment?: Shipment;
    lot?: SaleLot;
  } | null>(null);

  // Filters State
  const [filterCommodity, setFilterCommodity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');

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

  const {
    merchantProfile,
    activeSessionDate,
    todayLots,
    todayShipments,
    shipments,
    deleteShipment,
    deleteSaleLot,
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
    dashboardTab,
    setDashboardTab,
    consignmentSearchQuery,
    setConsignmentSearchQuery,
    setSelectedParchiLot,
    openPdfModalForLot,
    openPdfModalForShipment,
    openParchiSlipForShipment,
    setIsDateSwitcherOpen,
    setIsOwnerSignUpOpen,
    setIsFarmerSignUpOpen,
    setIsQRModalOpen,
    setIsSettingsOpen,
    setIsAuditTrailOpen,
    openHelpDesk,
    currentUserPhone,
    currentUserAccount,
    language,
    lots,
    farmers,
    userCommodities,
    activeCommodityFilter,
    setActiveCommodityFilter,
    commodityStats,
    t,
  } = useMandi();

  // Toggle card expansion (Level 3 info)
  const toggleCardExpansion = (id: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter shipments based on search and filters
  const filteredShipments = useMemo(() => {
    return todayShipments.filter((shipment) => {
      // Search query filter
      if (consignmentSearchQuery.trim()) {
        const q = consignmentSearchQuery.toLowerCase().trim();
        const matchesId = shipment.shipmentNumber.toLowerCase().includes(q);
        const matchesFarmer = shipment.farmerName.toLowerCase().includes(q);
        const matchesVillage = shipment.farmerVillage?.toLowerCase().includes(q) || false;
        const matchesCommodity = shipment.items.some(
          (i) =>
            i.flowerVariety.toLowerCase().includes(q) ||
            (i.commodityCategory && i.commodityCategory.toLowerCase().includes(q))
        );
        if (!matchesId && !matchesFarmer && !matchesVillage && !matchesCommodity) return false;
      }

      // Commodity Category filter
      if (filterCommodity !== 'all') {
        const matches = shipment.items.some(
          (i) => (i.commodityCategory || 'flowers') === filterCommodity
        );
        if (!matches) return false;
      }

      // Status filter
      if (filterStatus !== 'all') {
        if (shipment.paymentStatus !== filterStatus) return false;
      }

      // Location filter
      if (filterLocation !== 'all') {
        if (shipment.farmerVillage !== filterLocation) return false;
      }

      // Amount Range
      if (filterMinAmount) {
        const min = Number(filterMinAmount);
        if (!isNaN(min) && shipment.grossTotal < min) return false;
      }
      if (filterMaxAmount) {
        const max = Number(filterMaxAmount);
        if (!isNaN(max) && shipment.grossTotal > max) return false;
      }

      return true;
    });
  }, [
    todayShipments,
    consignmentSearchQuery,
    filterCommodity,
    filterStatus,
    filterLocation,
    filterMinAmount,
    filterMaxAmount,
  ]);

  // Standalone Lots (lots not attached to a shipment)
  const filteredStandaloneLots = useMemo(() => {
    return todayLots
      .filter((lot) => !lot.shipmentId || todayShipments.length === 0)
      .filter((lot) => {
        if (consignmentSearchQuery.trim()) {
          const q = consignmentSearchQuery.toLowerCase().trim();
          const matchesId = lot.parchiNumber.toLowerCase().includes(q);
          const matchesFarmer = lot.farmerName.toLowerCase().includes(q);
          const matchesVillage = lot.farmerVillage?.toLowerCase().includes(q) || false;
          const matchesVariety = lot.flowerVariety.toLowerCase().includes(q);
          if (!matchesId && !matchesFarmer && !matchesVillage && !matchesVariety) return false;
        }
        if (filterCommodity !== 'all') {
          if ((lot.commodityCategory || 'flowers') !== filterCommodity) return false;
        }
        if (filterStatus !== 'all') {
          if (lot.paymentStatus !== filterStatus) return false;
        }
        if (filterLocation !== 'all') {
          if (lot.farmerVillage !== filterLocation) return false;
        }
        if (filterMinAmount) {
          const min = Number(filterMinAmount);
          if (!isNaN(min) && lot.grossTotal < min) return false;
        }
        if (filterMaxAmount) {
          const max = Number(filterMaxAmount);
          if (!isNaN(max) && lot.grossTotal > max) return false;
        }
        return true;
      });
  }, [
    todayLots,
    todayShipments.length,
    consignmentSearchQuery,
    filterCommodity,
    filterStatus,
    filterLocation,
    filterMinAmount,
    filterMaxAmount,
  ]);

  const sortedShipments = useMemo(() => [...filteredShipments].reverse(), [filteredShipments]);
  const sortedLots = useMemo(() => [...filteredStandaloneLots].reverse(), [filteredStandaloneLots]);

  const totalEntriesCount = sortedShipments.length + sortedLots.length;

  // Extract unique locations for filter dropdown
  const uniqueVillages = useMemo(() => {
    const villages = new Set<string>();
    todayShipments.forEach((s) => {
      if (s.farmerVillage) villages.add(s.farmerVillage);
    });
    todayLots.forEach((l) => {
      if (l.farmerVillage) villages.add(l.farmerVillage);
    });
    return Array.from(villages);
  }, [todayShipments, todayLots]);

  const clearAllFilters = () => {
    setFilterCommodity('all');
    setFilterStatus('all');
    setFilterLocation('all');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setConsignmentSearchQuery('');
  };

  const hasActiveFilters =
    filterCommodity !== 'all' ||
    filterStatus !== 'all' ||
    filterLocation !== 'all' ||
    filterMinAmount !== '' ||
    filterMaxAmount !== '' ||
    consignmentSearchQuery.trim() !== '';

  const userDisplayName =
    currentUserAccount?.fullName ||
    merchantProfile.ownerName ||
    (currentUserPhone ? `Ireddy (${currentUserPhone})` : 'Ireddy (9440826222)');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          TOP DASHBOARD TAB BAR:
          TAB 1: TODAY'S SUMMARY
          TAB 2: CONSIGNMENT LEDGER
          TAB 3: MERCHANT INFO
          TAB 4: TOOLS & SETTINGS
          ───────────────────────────────────────────────────────────── */}
      <div
        id="dashboard-tabs-container"
        className="bg-white rounded-2xl border border-[#E8E2D9] p-1.5 shadow-2xs no-print"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            id="dash-tab-summary"
            onClick={() => setDashboardTab('summary')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer min-touch-target ${
              dashboardTab === 'summary'
                ? 'bg-[#2E6349] text-white shadow-2xs'
                : 'text-[#2A1F1A] hover:bg-[#FCFBF9] hover:text-[#2E6349]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Today&apos;s Summary</span>
          </button>

          <button
            type="button"
            id="dash-tab-ledger"
            onClick={() => setDashboardTab('ledger')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer min-touch-target relative ${
              dashboardTab === 'ledger'
                ? 'bg-[#2E6349] text-white shadow-2xs'
                : 'text-[#2A1F1A] hover:bg-[#FCFBF9] hover:text-[#2E6349]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Consignment Ledger</span>
            {todayShipments.length + todayLots.length > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  dashboardTab === 'ledger'
                    ? 'bg-[#DD9F2F] text-[#2A1F1A]'
                    : 'bg-[#2E6349]/10 text-[#2E6349]'
                }`}
              >
                {todayShipments.length + todayLots.length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="dash-tab-merchant-info"
            onClick={() => setDashboardTab('merchant-info')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer min-touch-target ${
              dashboardTab === 'merchant-info'
                ? 'bg-[#2E6349] text-white shadow-2xs'
                : 'text-[#2A1F1A] hover:bg-[#FCFBF9] hover:text-[#2E6349]'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Merchant Info</span>
          </button>

          <button
            type="button"
            id="dash-tab-tools-settings"
            onClick={() => setDashboardTab('tools-settings')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer min-touch-target ${
              dashboardTab === 'tools-settings'
                ? 'bg-[#2E6349] text-white shadow-2xs'
                : 'text-[#2A1F1A] hover:bg-[#FCFBF9] hover:text-[#2E6349]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Tools &amp; Settings</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: TODAY'S SUMMARY
          ───────────────────────────────────────────────────────────── */}
      {dashboardTab === 'summary' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          {/* Main 5-Metric Summary Strip as specified */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8E2D9] shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E2D9] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block tracking-wider">
                  Live Trading Session Overview
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#2A1F1A]">
                  Today&apos;s Mandi Financial Summary
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#E9F3EE] text-[#2E6349] border border-[#2E6349]/20">
                  {formatDisplayDate(activeSessionDate)}
                </span>
              </div>
            </div>

            {/* Structured Financial Strip (Gross, Freight, Hamali, Total Lots, Net Total) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Gross Sales */}
              <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E8E2D9]">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Gross Sales
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#2A1F1A] font-mono block mt-0.5">
                  ₹{todayTurnover.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#6B5E57] block mt-1">Before deductions</span>
              </div>

              {/* Vehicle Freight */}
              <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E8E2D9]">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Vehicle Freight
                </span>
                <span className="text-lg sm:text-2xl font-black text-blue-700 font-mono block mt-0.5">
                  ₹{todayTransportTotal.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#6B5E57] block mt-1">Direct transport cuts</span>
              </div>

              {/* Hamali / Loading */}
              <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E8E2D9]">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Hamali / Loading
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#DD9F2F] font-mono block mt-0.5">
                  ₹{todayHamaliTotal.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#6B5E57] block mt-1">Coolie &amp; loading fees</span>
              </div>

              {/* Total Lots */}
              <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E8E2D9]">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Total Lots Traded
                </span>
                <span className="text-lg sm:text-2xl font-black text-emerald-800 font-mono block mt-0.5">
                  {todayLotsCount} lots
                </span>
                <span className="text-[11px] text-[#6B5E57] block mt-1">
                  {todayShipments.length} consignments
                </span>
              </div>

              {/* Net Total */}
              <div className="bg-[#E9F3EE] p-3.5 sm:p-4 rounded-xl border border-[#2E6349]/30 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[#2E6349] block">
                  Net Farmer Total
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#2E6349] font-mono block mt-0.5">
                  ₹{todayFarmerNetTotal.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#2E6349]/80 block mt-1">After daily Mandi cuts</span>
              </div>
            </div>

            {/* Secondary KPI Strip: Volume, Farmers, Outstanding Dues */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#FCFBF9] rounded-xl border border-[#E8E2D9] flex items-center justify-between">
                <span className="text-[#6B5E57] font-medium">Total Volume Traded:</span>
                <strong className="font-mono text-sm text-[#2A1F1A]">{todayTotalVolume} Kgs</strong>
              </div>
              <div className="p-3 bg-[#FCFBF9] rounded-xl border border-[#E8E2D9] flex items-center justify-between">
                <span className="text-[#6B5E57] font-medium">Farmers / Growers Served:</span>
                <strong className="font-mono text-sm text-[#2A1F1A]">{todayFarmersServed} Farmers</strong>
              </div>
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-center justify-between">
                <span className="text-rose-800 font-medium">Outstanding Farmer Dues:</span>
                <strong className="font-mono text-sm text-rose-700">₹{totalOutstandingDues.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Quick Action Item Hub */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D9] shadow-2xs space-y-3">
            <span className="text-[10px] uppercase font-bold text-[#6B5E57] block tracking-wider">
              Quick Transaction &amp; Ledger Actions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <button
                type="button"
                id="quick-action-new-sale"
                onClick={() => setMerchantTab('new-sale')}
                className="p-3 rounded-xl bg-[#2E6349] text-white hover:bg-[#1F4532] transition flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs cursor-pointer min-touch-target"
              >
                <PlusCircle className="w-5 h-5 text-[#DD9F2F]" />
                <span className="text-xs font-bold">+ New Consignment</span>
              </button>

              <button
                type="button"
                id="quick-action-view-ledger"
                onClick={() => setDashboardTab('ledger')}
                className="p-3 rounded-xl bg-[#FCFBF9] hover:bg-[#F4EFEA] border border-[#E8E2D9] text-[#2A1F1A] transition flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs cursor-pointer min-touch-target"
              >
                <BookOpen className="w-5 h-5 text-[#2E6349]" />
                <span className="text-xs font-bold">Consignment Ledger</span>
              </button>

              <button
                type="button"
                id="quick-action-farmers"
                onClick={() => setMerchantTab('farmers')}
                className="p-3 rounded-xl bg-[#FCFBF9] hover:bg-[#F4EFEA] border border-[#E8E2D9] text-[#2A1F1A] transition flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs cursor-pointer min-touch-target"
              >
                <Users className="w-5 h-5 text-[#2E6349]" />
                <span className="text-xs font-bold">Farmer Directory</span>
              </button>

              <button
                type="button"
                id="quick-action-payments"
                onClick={() => setMerchantTab('payments')}
                className="p-3 rounded-xl bg-[#FCFBF9] hover:bg-[#F4EFEA] border border-[#E8E2D9] text-[#2A1F1A] transition flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs cursor-pointer min-touch-target"
              >
                <Coins className="w-5 h-5 text-[#2E6349]" />
                <span className="text-xs font-bold">Record Payments</span>
              </button>

              <button
                type="button"
                id="quick-action-form-c"
                onClick={() => setMerchantTab('reports')}
                className="p-3 rounded-xl bg-[#FEF8ED] hover:bg-[#faebd1] border-2 border-[#DD9F2F] text-[#2A1F1A] transition flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs cursor-pointer min-touch-target"
              >
                <Receipt className="w-5 h-5 text-[#DD9F2F]" />
                <span className="text-xs font-black">Generate Form C</span>
              </button>

              <button
                type="button"
                id="quick-action-audit"
                onClick={() => setIsAuditTrailOpen(true)}
                className="p-3 rounded-xl bg-[#FCFBF9] hover:bg-[#F4EFEA] border border-[#E8E2D9] text-[#2A1F1A] transition flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs cursor-pointer min-touch-target"
              >
                <Printer className="w-5 h-5 text-[#2E6349]" />
                <span className="text-xs font-bold">Parchi Slips</span>
              </button>
            </div>
          </div>

          {/* Recent Consignment Activity Preview */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D9] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block tracking-wider">
                  Recent Consignment Entries
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#2A1F1A]">
                  Latest Today&apos;s Mandi Arrivals ({todayShipments.length + todayLots.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDashboardTab('ledger')}
                className="px-3 py-1.5 rounded-xl bg-[#E9F3EE] hover:bg-[#d8ece2] text-[#2E6349] font-bold text-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayShipments.length === 0 && todayLots.length === 0 ? (
              <div className="py-8 text-center text-[#6B5E57] space-y-2">
                <Package className="w-8 h-8 mx-auto text-[#6B5E57]/40" />
                <p className="text-xs">No consignments recorded yet for today&apos;s session.</p>
                <button
                  type="button"
                  onClick={() => setMerchantTab('new-sale')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition"
                >
                  + Record First Consignment
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E8E2D9] border border-[#E8E2D9] rounded-xl overflow-hidden text-xs">
                {todayShipments.slice(0, 3).map((shipment) => (
                  <div
                    key={shipment.id}
                    className="p-3 bg-[#FCFBF9] hover:bg-[#F4EFEA] transition flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#2E6349] bg-white border border-[#E8E2D9] px-2 py-0.5 rounded">
                        {shipment.shipmentNumber}
                      </span>
                      <div>
                        <span className="font-bold text-[#2A1F1A] block">{shipment.farmerName}</span>
                        <span className="text-[11px] text-[#6B5E57]">
                          📍 {shipment.farmerVillage || 'APMC Yard'} • {shipment.items.length} varieties
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-[#2E6349] block">
                          ₹{shipment.grossTotal.toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            shipment.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : shipment.paymentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {shipment.paymentStatus}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedConsignmentForModal({ type: 'shipment', shipment })
                        }
                        className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white hover:bg-[#F4EFEA] text-[#2A1F1A] transition cursor-pointer"
                        title="View Consignment Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#2E6349]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: CONSIGNMENT LEDGER
          ───────────────────────────────────────────────────────────── */}
      {dashboardTab === 'ledger' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls Bar: Search, Filters Toggle, View Toggle (Cards vs Table) */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E2D9] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#6B5E57] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="ledger-search-input"
                  value={consignmentSearchQuery}
                  onChange={(e) => setConsignmentSearchQuery(e.target.value)}
                  placeholder="Find consignments, farmer name, village, variety, ID..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] focus:bg-white focus:border-[#2E6349] focus:outline-none focus:ring-2 focus:ring-[#2E6349]/20 transition"
                />
                {consignmentSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setConsignmentSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-stone-200 text-[#6B5E57]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons: Filter Toggle & View Mode Toggle */}
              <div className="flex items-center gap-2">
                {/* Collapsible Filter Toggle */}
                <button
                  type="button"
                  id="ledger-filter-toggle-btn"
                  onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    hasActiveFilters || isFilterDrawerOpen
                      ? 'bg-[#2E6349] text-white border-[#2E6349]'
                      : 'bg-[#FAF8F5] text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#F4EFEA]'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-[#DD9F2F]" />
                  )}
                </button>

                {/* View Mode Toggle: Cards vs Table */}
                <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E2D9]">
                  <button
                    type="button"
                    id="view-mode-cards-btn"
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-[#2E6349] text-white shadow-2xs'
                        : 'text-[#6B5E57] hover:text-[#2A1F1A]'
                    }`}
                    title="Card-Based View (Responsive)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden md:inline">Cards</span>
                  </button>

                  <button
                    type="button"
                    id="view-mode-table-btn"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-[#2E6349] text-white shadow-2xs'
                        : 'text-[#6B5E57] hover:text-[#2A1F1A]'
                    }`}
                    title="Table View (Responsive Columns)"
                  >
                    <TableIcon className="w-4 h-4" />
                    <span className="hidden md:inline">Table</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Collapsible Filter Panel */}
            {isFilterDrawerOpen && (
              <div
                id="collapsible-filters-panel"
                className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9] space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-xs"
              >
                <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
                  <span className="font-bold text-[#2A1F1A] flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#2E6349]" />
                    Filter Consignment Records
                  </span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-[#9E3A24] hover:underline font-bold text-[11px]"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Commodity */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#6B5E57] block mb-1">
                      Commodity Category
                    </label>
                    <select
                      id="filter-commodity-select"
                      value={filterCommodity}
                      onChange={(e) => setFilterCommodity(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-[#E8E2D9] text-xs font-medium focus:outline-none focus:border-[#2E6349]"
                    >
                      <option value="all">All Commodities</option>
                      <option value="flowers">🌸 Flowers</option>
                      <option value="grains">🌾 Grains</option>
                      <option value="vegetables">🥦 Vegetables</option>
                      <option value="fruits">🍎 Fruits</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#6B5E57] block mb-1">
                      Payment Status
                    </label>
                    <select
                      id="filter-status-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-[#E8E2D9] text-xs font-medium focus:outline-none focus:border-[#2E6349]"
                    >
                      <option value="all">All Payment Statuses</option>
                      <option value="Unpaid">Unpaid / Dues Pending</option>
                      <option value="Partial">Partial Payment</option>
                      <option value="Paid">Fully Paid</option>
                    </select>
                  </div>

                  {/* Location / Village */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#6B5E57] block mb-1">
                      Location / Village
                    </label>
                    <select
                      id="filter-location-select"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-[#E8E2D9] text-xs font-medium focus:outline-none focus:border-[#2E6349]"
                    >
                      <option value="all">All Locations</option>
                      {uniqueVillages.map((v) => (
                        <option key={v} value={v}>
                          📍 {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount Range */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#6B5E57] block mb-1">
                      Amount Range (₹)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filterMinAmount}
                        onChange={(e) => setFilterMinAmount(e.target.value)}
                        className="w-1/2 p-2 rounded-lg bg-white border border-[#E8E2D9] text-xs font-mono"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filterMaxAmount}
                        onChange={(e) => setFilterMaxAmount(e.target.value)}
                        className="w-1/2 p-2 rounded-lg bg-white border border-[#E8E2D9] text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Faceted Quick Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
              <span className="text-[10px] font-bold uppercase text-[#6B5E57] mr-1">Quick Filter:</span>
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                  filterStatus === 'all'
                    ? 'bg-[#2E6349] text-white'
                    : 'bg-[#FAF8F5] text-[#2A1F1A] border border-[#E8E2D9] hover:bg-[#F4EFEA]'
                }`}
              >
                All ({todayShipments.length + todayLots.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('Unpaid')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                  filterStatus === 'Unpaid'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Unpaid Dues
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('Paid')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                  filterStatus === 'Paid'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="flex items-center justify-between text-xs text-[#6B5E57] px-1">
            <span>
              Showing <strong>{totalEntriesCount}</strong> consignment entries for{' '}
              <strong>{formatDisplayDate(activeSessionDate)}</strong>
            </span>
            {hasActiveFilters && (
              <span className="text-[#DD9F2F] font-semibold">Filtered results</span>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              VIEW 1: CARD-BASED STRUCTURE (Strict Level 1 to 4 Hierarchy)
              Mobile: 1 card per screen | Tablet: 2 per row | Desktop: 3 per row
              ───────────────────────────────────────────────────────────── */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Shipments as Cards */}
              {sortedShipments.map((shipment) => {
                const isExpanded = !!expandedCardIds[shipment.id];
                const firstItem = shipment.items[0];
                const otherItemsCount = shipment.items.length - 1;
                const totalPackages = shipment.items.reduce((acc, it) => acc + (it.boxesCount || 0), 0);
                const totalQuantity = shipment.items.reduce((acc, it) => acc + it.quantity, 0);

                return (
                  <div
                    key={shipment.id}
                    id={`consignment-card-${shipment.id}`}
                    className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xs hover:shadow-xs transition flex flex-col justify-between overflow-hidden"
                  >
                    {/* CARD SECTION 1: TRANSACTION DETAILS */}
                    <div className="p-4 border-b border-[#F4EFEA] bg-[#FAF8F5]/60 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-[#2E6349] bg-white border border-[#E8E2D9] px-2.5 py-0.5 rounded-lg text-xs shadow-2xs">
                          {shipment.shipmentNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            shipment.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : shipment.paymentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {shipment.paymentStatus}
                          {shipment.balanceDue > 0 && ` (₹${shipment.balanceDue.toLocaleString('en-IN')})`}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                          Consignor Farmer
                        </span>
                        <span className="text-sm font-black text-[#2A1F1A] block">
                          {shipment.farmerName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B5E57] mt-0.5">
                          <span>📍 {shipment.farmerVillage || 'APMC Yard'}</span>
                          <span>•</span>
                          <span>{shipment.date} {shipment.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* CARD SECTION 2: COMMODITY INFORMATION */}
                    <div className="p-4 space-y-2.5 text-xs flex-1">
                      <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                        Commodity Details ({shipment.items.length} Varieties)
                      </span>

                      {/* Primary Commodity Highlight */}
                      {firstItem && (
                        <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E2D9] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#2A1F1A] text-xs">
                              {firstItem.flowerVariety}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                              {firstItem.flowerQuality || 'Grade A'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-[#6B5E57]">
                            <span>
                              {firstItem.quantity} {firstItem.unit} @ ₹{firstItem.rate}/{firstItem.unit}
                            </span>
                            <strong className="text-[#2A1F1A] font-mono">
                              ₹{Math.round(firstItem.quantity * firstItem.rate).toLocaleString('en-IN')}
                            </strong>
                          </div>
                        </div>
                      )}

                      {otherItemsCount > 0 && (
                        <p className="text-[11px] text-[#2E6349] font-medium">
                          + {otherItemsCount} more {otherItemsCount === 1 ? 'variety' : 'varieties'} (Total {totalQuantity} Kgs, {totalPackages} pkgs)
                        </p>
                      )}

                      {/* CARD SECTION 3: CHARGES & DEDUCTIONS */}
                      <div className="p-3 bg-[#F9F6F0] rounded-xl border border-[#E8E2D9] space-y-1.5 text-xs mt-3">
                        <div className="flex justify-between items-center text-[#6B5E57]">
                          <span>Gross Consignment:</span>
                          <strong className="font-mono text-[#2A1F1A]">
                            ₹{shipment.grossTotal.toLocaleString('en-IN')}
                          </strong>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-[#6B5E57]">
                          <span>Freight / Hamali Deductions:</span>
                          <span className="font-mono">
                            ₹{shipment.transportCharge} + ₹{shipment.hamaliCharge}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-[#E8E2D9] font-bold">
                          <span className="text-[#2E6349]">Net Farmer Payable:</span>
                          <span className="font-mono text-sm text-[#2E6349]">
                            ₹{(shipment.netAmountAfterDailyCuts || shipment.grossTotal - shipment.transportCharge - shipment.hamaliCharge).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* LEVEL 3 EXPANDABLE: Notes, Timestamps & Full breakdown */}
                      {isExpanded && (
                        <div className="p-3 bg-[#FCFBF9] rounded-xl border border-[#E8E2D9] space-y-1.5 text-[11px] animate-in fade-in duration-150">
                          <div className="flex justify-between">
                            <span className="text-[#6B5E57]">Total Packages:</span>
                            <strong className="font-mono">{totalPackages} pkgs</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6B5E57]">Time Recorded:</span>
                            <span className="font-mono">{shipment.time}</span>
                          </div>
                          {shipment.notes && (
                            <div className="text-amber-800 bg-amber-50 p-1.5 rounded">
                              <em>Note: {shipment.notes}</em>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleCardExpansion(shipment.id)}
                        className="text-[11px] text-[#2E6349] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Hide Details</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Show Notes &amp; Extra Info</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* CARD SECTION 4: ACTIONS (View Details, Form C, Slip, Voice, Delete) */}
                    <div className="p-3 bg-[#FAF8F5] border-t border-[#E8E2D9] flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        id={`card-view-details-btn-${shipment.id}`}
                        onClick={() =>
                          setSelectedConsignmentForModal({ type: 'shipment', shipment })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Form C PDF */}
                        <button
                          type="button"
                          id={`card-form-c-btn-${shipment.id}`}
                          onClick={() => {
                            sounds.playBidTick();
                            openPdfModalForShipment(shipment);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-white border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA] text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Generate Form C PDF"
                        >
                          <FileText className="w-3 h-3 text-[#DD9F2F]" />
                          <span className="hidden sm:inline">Form C</span>
                        </button>

                        {/* Parchi Slip */}
                        <button
                          type="button"
                          id={`card-slip-btn-${shipment.id}`}
                          onClick={() => {
                            sounds.playBidTick();
                            openParchiSlipForShipment(shipment);
                          }}
                          className="p-1.5 rounded-lg bg-white border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA] transition cursor-pointer"
                          title="Print Thermal Parchi Slip"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#2E6349]" />
                        </button>

                        {/* Voice */}
                        <button
                          type="button"
                          id={`card-voice-btn-${shipment.id}`}
                          onClick={() => {
                            sounds.playBidTick();
                            const varietySummary = shipment.items
                              .map((i) => `${i.flowerVariety} (${i.quantity} ${i.unit})`)
                              .join(', ');
                            speakShipmentDetails(
                              shipment.farmerName,
                              varietySummary,
                              shipment.grossTotal,
                              shipment.transportCharge,
                              shipment.hamaliCharge,
                              shipment.grossTotal,
                              language
                            );
                          }}
                          className="p-1.5 rounded-lg bg-white border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA] transition cursor-pointer"
                          title="Voice Readout"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#2E6349]" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          id={`card-delete-btn-${shipment.id}`}
                          onClick={() => {
                            setDeleteModalConfig({
                              isOpen: true,
                              title: 'Delete Consignment Record',
                              itemName: `Shipment: ${shipment.shipmentNumber}`,
                              itemDetails: `Farmer: ${shipment.farmerName} • Gross: ₹${shipment.grossTotal.toLocaleString('en-IN')}`,
                              message: `Are you sure you want to delete shipment ${shipment.shipmentNumber}?`,
                              onConfirm: () => {
                                deleteShipment(shipment.id);
                                setActionFeedbackMsg(`✓ Shipment ${shipment.shipmentNumber} deleted.`);
                                setTimeout(() => setActionFeedbackMsg(null), 3000);
                                setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
                              },
                            });
                          }}
                          className="p-1.5 rounded-lg border border-[#E8E2D9] text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Standalone Lots as Cards (if any) */}
              {sortedLots.map((lot) => (
                <div
                  key={lot.id}
                  id={`consignment-lot-card-${lot.id}`}
                  className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xs hover:shadow-xs transition flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-4 border-b border-[#F4EFEA] bg-[#FAF8F5]/60 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-[#2E6349] bg-white border border-[#E8E2D9] px-2.5 py-0.5 rounded-lg text-xs shadow-2xs">
                        {lot.parchiNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          lot.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lot.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {lot.paymentStatus}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                        Consignor Farmer
                      </span>
                      <span className="text-sm font-black text-[#2A1F1A] block">
                        {lot.farmerName}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-[#6B5E57] mt-0.5">
                        <span>📍 {lot.farmerVillage || 'APMC Yard'}</span>
                        <span>•</span>
                        <span>{lot.date} {lot.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5 text-xs flex-1">
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E2D9] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2A1F1A] text-xs">
                          {lot.flowerVariety}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                          {lot.flowerQuality || 'Good'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#6B5E57]">
                        <span>
                          {lot.quantity} {lot.unit} @ ₹{lot.rate}/{lot.unit}
                        </span>
                        <strong className="text-[#2A1F1A] font-mono">
                          ₹{lot.grossTotal.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F9F6F0] rounded-xl border border-[#E8E2D9] space-y-1 text-xs">
                      <div className="flex justify-between items-center text-[#6B5E57]">
                        <span>Gross Sales:</span>
                        <strong className="font-mono text-[#2A1F1A]">
                          ₹{lot.grossTotal.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center font-bold pt-1 border-t border-[#E8E2D9]">
                        <span className="text-[#2E6349]">Net Amount:</span>
                        <span className="font-mono text-sm text-[#2E6349]">
                          ₹{(lot.farmerNetPayable || lot.grossTotal).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border-t border-[#E8E2D9] flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      id={`lot-card-view-details-btn-${lot.id}`}
                      onClick={() =>
                        setSelectedConsignmentForModal({ type: 'lot', lot })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openPdfModalForLot(lot)}
                        className="px-2 py-1.5 rounded-lg bg-white border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA] text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Generate Form C PDF"
                      >
                        <FileText className="w-3 h-3 text-[#DD9F2F]" />
                        <span className="hidden sm:inline">Form C</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedParchiLot(lot)}
                        className="p-1.5 rounded-lg bg-white border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA] transition cursor-pointer"
                        title="Print Slip"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#2E6349]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteModalConfig({
                            isOpen: true,
                            title: 'Delete Consignment Lot',
                            itemName: `Lot: ${lot.parchiNumber}`,
                            message: `Delete consignment lot ${lot.parchiNumber}?`,
                            onConfirm: () => {
                              deleteSaleLot(lot.id);
                              setActionFeedbackMsg(`✓ Lot ${lot.parchiNumber} deleted.`);
                              setTimeout(() => setActionFeedbackMsg(null), 3000);
                              setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
                            },
                          });
                        }}
                        className="p-1.5 rounded-lg border border-[#E8E2D9] text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 2: TABLE VIEW (Responsive Columns)
              Mobile (3 cols): Commodity | Quantity | Total
              Tablet (6 cols): Commodity | Qty | Bags | Grade | Rate | Total
              Desktop (Full cols): ID | Farmer | Commodity | Qty | Bags | Grade | Rate | Total | Freight | Loading | Net | Status | Actions
              ───────────────────────────────────────────────────────────── */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#F4EFEA] text-[#2A1F1A] font-bold border-b border-[#E8E2D9]">
                    <tr>
                      {/* Desktop Only */}
                      <th className="p-3 hidden lg:table-cell">Consignment ID</th>
                      <th className="p-3 hidden sm:table-cell">Farmer</th>

                      {/* Mobile + Tablet + Desktop */}
                      <th className="p-3">Commodity</th>
                      <th className="p-3 text-right">Quantity</th>

                      {/* Tablet + Desktop */}
                      <th className="p-3 text-center hidden md:table-cell">Bags/Pkgs</th>
                      <th className="p-3 text-center hidden md:table-cell">Grade</th>
                      <th className="p-3 text-right hidden md:table-cell">Rate</th>

                      {/* Mobile + Tablet + Desktop */}
                      <th className="p-3 text-right">Gross Total</th>

                      {/* Desktop Only */}
                      <th className="p-3 text-right hidden lg:table-cell">Freight</th>
                      <th className="p-3 text-right hidden lg:table-cell">Hamali</th>
                      <th className="p-3 text-right hidden lg:table-cell">Net Amount</th>
                      <th className="p-3 text-center hidden sm:table-cell">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D9] bg-white">
                    {sortedShipments.map((shipment) => {
                      const firstItem = shipment.items[0];
                      const totalPackages = shipment.items.reduce((acc, it) => acc + (it.boxesCount || 0), 0);
                      const totalQuantity = shipment.items.reduce((acc, it) => acc + it.quantity, 0);

                      return (
                        <tr key={shipment.id} className="hover:bg-[#FCFBF9] transition">
                          {/* Consignment ID (Desktop) */}
                          <td className="p-3 font-mono font-bold text-[#2E6349] hidden lg:table-cell">
                            {shipment.shipmentNumber}
                          </td>

                          {/* Farmer (Tablet + Desktop) */}
                          <td className="p-3 hidden sm:table-cell">
                            <span className="font-bold text-[#2A1F1A] block">{shipment.farmerName}</span>
                            <span className="text-[10px] text-[#6B5E57]">📍 {shipment.farmerVillage || 'APMC Yard'}</span>
                          </td>

                          {/* Commodity */}
                          <td className="p-3 font-bold text-[#2A1F1A]">
                            <div className="flex items-center gap-1">
                              <span>{firstItem?.flowerVariety || 'Consignment'}</span>
                              {shipment.items.length > 1 && (
                                <span className="text-[10px] px-1 py-0.2 rounded bg-stone-100 text-stone-700">
                                  +{shipment.items.length - 1}
                                </span>
                              )}
                            </div>
                            <span className="sm:hidden text-[10px] text-[#6B5E57] block font-normal">
                              {shipment.farmerName}
                            </span>
                          </td>

                          {/* Quantity */}
                          <td className="p-3 text-right font-mono font-bold">
                            {totalQuantity} {firstItem?.unit || 'Kgs'}
                          </td>

                          {/* Bags/Pkgs (Tablet + Desktop) */}
                          <td className="p-3 text-center font-mono hidden md:table-cell">
                            {totalPackages > 0 ? `${totalPackages} pkgs` : '—'}
                          </td>

                          {/* Grade (Tablet + Desktop) */}
                          <td className="p-3 text-center hidden md:table-cell">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              {firstItem?.flowerQuality || 'Grade A'}
                            </span>
                          </td>

                          {/* Rate (Tablet + Desktop) */}
                          <td className="p-3 text-right font-mono hidden md:table-cell">
                            ₹{firstItem?.rate || 0}/{firstItem?.unit || 'Kg'}
                          </td>

                          {/* Gross Total */}
                          <td className="p-3 text-right font-mono font-black text-[#2A1F1A]">
                            ₹{shipment.grossTotal.toLocaleString('en-IN')}
                          </td>

                          {/* Freight (Desktop) */}
                          <td className="p-3 text-right font-mono text-blue-700 hidden lg:table-cell">
                            ₹{shipment.transportCharge}
                          </td>

                          {/* Hamali (Desktop) */}
                          <td className="p-3 text-right font-mono text-[#DD9F2F] hidden lg:table-cell">
                            ₹{shipment.hamaliCharge}
                          </td>

                          {/* Net Amount (Desktop) */}
                          <td className="p-3 text-right font-mono font-black text-[#2E6349] hidden lg:table-cell">
                            ₹{(shipment.netAmountAfterDailyCuts || shipment.grossTotal - shipment.transportCharge - shipment.hamaliCharge).toLocaleString('en-IN')}
                          </td>

                          {/* Status (Tablet + Desktop) */}
                          <td className="p-3 text-center hidden sm:table-cell">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                shipment.paymentStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : shipment.paymentStatus === 'Partial'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {shipment.paymentStatus}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                id={`table-view-btn-${shipment.id}`}
                                onClick={() =>
                                  setSelectedConsignmentForModal({ type: 'shipment', shipment })
                                }
                                className="p-1.5 rounded-lg bg-[#2E6349] text-white hover:bg-[#1F4532] transition cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => openPdfModalForShipment(shipment)}
                                className="p-1.5 rounded-lg border border-[#E8E2D9] hover:bg-[#F4EFEA] text-[#DD9F2F] transition cursor-pointer hidden sm:inline-flex"
                                title="Form C PDF"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => openParchiSlipForShipment(shipment)}
                                className="p-1.5 rounded-lg border border-[#E8E2D9] hover:bg-[#F4EFEA] text-[#2E6349] transition cursor-pointer"
                                title="Print Slip"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Standalone lots in table */}
                    {sortedLots.map((lot) => (
                      <tr key={lot.id} className="hover:bg-[#FCFBF9] transition">
                        <td className="p-3 font-mono font-bold text-[#2E6349] hidden lg:table-cell">
                          {lot.parchiNumber}
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <span className="font-bold text-[#2A1F1A] block">{lot.farmerName}</span>
                          <span className="text-[10px] text-[#6B5E57]">📍 {lot.farmerVillage || 'APMC Yard'}</span>
                        </td>
                        <td className="p-3 font-bold text-[#2A1F1A]">{lot.flowerVariety}</td>
                        <td className="p-3 text-right font-mono font-bold">{lot.quantity} {lot.unit}</td>
                        <td className="p-3 text-center font-mono hidden md:table-cell">{lot.boxesCount || '—'}</td>
                        <td className="p-3 text-center hidden md:table-cell">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {lot.flowerQuality || 'Good'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono hidden md:table-cell">₹{lot.rate}/{lot.unit}</td>
                        <td className="p-3 text-right font-mono font-black text-[#2A1F1A]">
                          ₹{lot.grossTotal.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-mono text-blue-700 hidden lg:table-cell">
                          ₹{lot.transportCharges || 0}
                        </td>
                        <td className="p-3 text-right font-mono text-[#DD9F2F] hidden lg:table-cell">
                          ₹{lot.ammaliCharges || 0}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-[#2E6349] hidden lg:table-cell">
                          ₹{(lot.farmerNetPayable || lot.grossTotal).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-center hidden sm:table-cell">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lot.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {lot.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedConsignmentForModal({ type: 'lot', lot })}
                            className="p-1.5 rounded-lg bg-[#2E6349] text-white hover:bg-[#1F4532] transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {totalEntriesCount === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#E8E2D9] space-y-3">
              <Package className="w-10 h-10 mx-auto text-[#6B5E57]/40" />
              <h3 className="text-sm font-bold text-[#2A1F1A]">No Consignments Found</h3>
              <p className="text-xs text-[#6B5E57]">
                {hasActiveFilters
                  ? 'No consignment matches the active filters. Try clearing your search or filters.'
                  : 'No consignment records have been added for today yet.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: MERCHANT INFO
          ───────────────────────────────────────────────────────────── */}
      {dashboardTab === 'merchant-info' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Merchant Portal Status & Links */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E9F3EE] flex items-center justify-center text-[#2E6349]">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#2A1F1A]">Merchant Portal</h3>
                    <span className="text-[11px] text-[#6B5E57]">APMC Commission Agency</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Active Portal
                </span>
              </div>

              <div className="space-y-2 text-xs text-[#2A1F1A]">
                <div className="flex justify-between p-2 rounded-lg bg-[#FAF8F5]">
                  <span className="text-[#6B5E57]">Trading Shop:</span>
                  <strong>{merchantProfile.shopName || 'Wholesale Mandi Commission Agent'}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#FAF8F5]">
                  <span className="text-[#6B5E57]">Shop / Stall Number:</span>
                  <strong className="font-mono">{merchantProfile.shopNumber || 'Shop 1'}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#FAF8F5]">
                  <span className="text-[#6B5E57]">APMC Market Yard:</span>
                  <strong>{merchantProfile.apmcMarketName || 'Agri APMC Market Yard'}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#FAF8F5]">
                  <span className="text-[#6B5E57]">APMC License No:</span>
                  <strong className="font-mono">{merchantProfile.licenseNumber || 'APMC-TS-2024-8841'}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#FAF8F5]">
                  <span className="text-[#6B5E57]">Merchant ID:</span>
                  <strong className="font-mono text-[#2E6349]">{merchantProfile.merchantId || 'MID-802'}</strong>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA] text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-[#2E6349]" />
                  <span>Configure Shop Settings</span>
                </button>
              </div>
            </div>

            {/* Merchant QR Code */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FEF8ED] flex items-center justify-center text-[#DD9F2F]">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#2A1F1A]">Merchant QR Code</h3>
                    <span className="text-[11px] text-[#6B5E57]">Grower / Farmer Passbook Link</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQRModalOpen(true)}
                  className="text-xs font-bold text-[#2E6349] hover:underline"
                >
                  Expand QR
                </button>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E2D9] flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-32 h-32 bg-white p-2 rounded-xl border border-[#E8E2D9] shadow-2xs flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-[#2A1F1A]" />
                </div>
                <p className="text-xs font-bold text-[#2A1F1A]">Scan to Connect with Mandi Shop</p>
                <p className="text-[11px] text-[#6B5E57] max-w-xs">
                  Growers can scan this QR in their Farmer Passbook to auto-receive Form C slips and daily sales statements.
                </p>
                <button
                  type="button"
                  onClick={() => setIsQRModalOpen(true)}
                  className="px-4 py-1.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition"
                >
                  Open Full QR &amp; Farmer Links
                </button>
              </div>
            </div>

            {/* Ireddy Account (9440826222) */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-2xs space-y-4 md:col-span-2">
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E9F3EE] flex items-center justify-center text-[#2E6349]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#2A1F1A]">Ireddy Account (9440826222)</h3>
                    <span className="text-[11px] text-[#6B5E57]">Registered Mandi Adathiya Profile</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#DD9F2F]/20 text-[#2A1F1A]">
                  Verified Account
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E2D9] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">Owner / Trader Name</span>
                  <span className="font-black text-sm text-[#2A1F1A] block">{merchantProfile.ownerName || 'Ireddy (Mandi Adathiya)'}</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Authorized Signatory</span>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E2D9] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">Registered Mobile Phone</span>
                  <span className="font-mono font-black text-sm text-[#2A1F1A] block">
                    {currentUserPhone || merchantProfile.phoneNumber || '9440826222'}
                  </span>
                  <span className="text-[11px] text-[#6B5E57]">Direct SMS &amp; WhatsApp Receipt line</span>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E2D9] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">Cloud Backup Status</span>
                  <span className="font-bold text-sm text-[#2E6349] block">Offline-First + Cloud Synced</span>
                  <span className="text-[11px] text-[#6B5E57]">Zero Data Loss Architecture</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOwnerSignUpOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition"
                >
                  Edit Profile &amp; Photo
                </button>
                <button
                  type="button"
                  onClick={() => setMerchantTab('farmers')}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#FAF8F5] transition"
                >
                  Manage Connected Farmers ({farmers.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: TOOLS & SETTINGS
          ───────────────────────────────────────────────────────────── */}
      {dashboardTab === 'tools-settings' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Generate PDF & Form C */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FEF8ED] flex items-center justify-center text-[#DD9F2F]">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#2A1F1A]">Generate Form C PDF</h3>
                <p className="text-xs text-[#6B5E57]">
                  Generate and download standard Telangana/AP APMC Form C ledgers and 15-day settlement slips for any consignment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMerchantTab('reports')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-[#DD9F2F]" />
                <span>Open Form C Reports &amp; PDFs</span>
              </button>
            </div>

            {/* Parchi Slip & Audit Trail */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#E9F3EE] flex items-center justify-center text-[#2E6349]">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#2A1F1A]">Parchi Slips &amp; Audit Trail</h3>
                <p className="text-xs text-[#6B5E57]">
                  View printed receipt audit logs, reprint thermal slips, or recover archived slips for today&apos;s lots.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditTrailOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center justify-center gap-1.5"
              >
                <History className="w-4 h-4 text-[#2E6349]" />
                <span>Open Parchi Slip Audit Trail</span>
              </button>
            </div>

            {/* Architecture & Flowchart */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#2A1F1A]">System Architecture Map</h3>
                <p className="text-xs text-[#6B5E57]">
                  Interactive flowchart displaying the entire mandi ledger pipeline from arrival to Form C clearance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDashboardTab('tools-settings')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4 text-purple-700" />
                <span>View Architecture Diagram</span>
              </button>
            </div>

            {/* APMC Mandi Help Desk */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#2A1F1A]">APMC Mandi Help Desk</h3>
                <p className="text-xs text-[#6B5E57]">
                  Raise tickets, resolve rate discrepancies, or request official APMC Mandi secretary support.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openHelpDesk('raise')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center justify-center gap-1.5"
              >
                <Headphones className="w-4 h-4 text-blue-700" />
                <span>Open APMC Help Desk</span>
              </button>
            </div>

            {/* Shop Settings & Rates */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#2A1F1A]">Mandi Charges &amp; Settings</h3>
                <p className="text-xs text-[#6B5E57]">
                  Set default commission rates (4%), hamali/loading fees (₹50), freight deductions, and commodity varieties.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center justify-center gap-1.5"
              >
                <Settings className="w-4 h-4 text-[#2E6349]" />
                <span>Open Settings Modal</span>
              </button>
            </div>

            {/* Calendar & Session Switcher */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#2A1F1A]">Trading Date &amp; Archive Switcher</h3>
                <p className="text-xs text-[#6B5E57]">
                  Active trading date: <strong className="font-mono">{activeSessionDate}</strong>. Switch to any date to view past consignments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDateSwitcherOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-emerald-800" />
                <span>Switch Trading Session Date</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STICKY FOOTER ACTION STRIP
          ───────────────────────────────────────────────────────────── */}
      <div
        id="dashboard-footer-action-bar"
        className="sticky bottom-2 z-20 bg-[#2A1F1A] text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 no-print"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <div>
            <span className="text-white/60 block text-[10px] uppercase font-bold">Today Gross Sales</span>
            <span className="font-bold font-mono text-[#DD9F2F] text-sm sm:text-base">
              ₹{todayTurnover.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="border-l border-white/20 pl-3">
            <span className="text-white/60 block text-[10px] uppercase font-bold">Vehicle Freight</span>
            <span className="font-bold font-mono text-blue-300">
              ₹{todayTransportTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="border-l border-white/20 pl-3">
            <span className="text-white/60 block text-[10px] uppercase font-bold">Hamali Loading</span>
            <span className="font-bold font-mono text-amber-300">
              ₹{todayHamaliTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="border-l border-white/20 pl-3">
            <span className="text-emerald-400 block text-[10px] uppercase font-bold">Total Lots</span>
            <span className="font-black font-mono text-emerald-300">
              {todayLotsCount} lots
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            id="dash-footer-view-report-btn"
            onClick={() => setMerchantTab('reports')}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#DD9F2F] hover:bg-[#c68c22] text-[#2A1F1A] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Receipt className="w-4 h-4 text-[#2A1F1A]" />
            <span>Generate Form C &amp; Reports</span>
          </button>
        </div>
      </div>

      {/* Floating Action Feedback Notification */}
      {actionFeedbackMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#2A1F1A] text-white px-4 py-2.5 rounded-xl shadow-xl border border-white/20 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-[#DD9F2F]" />
          <span>{actionFeedbackMsg}</span>
        </div>
      )}

      {/* Consignment Detail Modal (Tabs: Summary, Commodity, Charges, History) */}
      <ConsignmentDetailModal
        isOpen={!!selectedConsignmentForModal}
        onClose={() => setSelectedConsignmentForModal(null)}
        consignment={selectedConsignmentForModal}
        onDelete={() => {
          if (!selectedConsignmentForModal) return;
          if (selectedConsignmentForModal.type === 'shipment' && selectedConsignmentForModal.shipment) {
            deleteShipment(selectedConsignmentForModal.shipment.id);
            setActionFeedbackMsg(`✓ Shipment deleted successfully.`);
          } else if (selectedConsignmentForModal.lot) {
            deleteSaleLot(selectedConsignmentForModal.lot.id);
            setActionFeedbackMsg(`✓ Lot deleted successfully.`);
          }
          setSelectedConsignmentForModal(null);
          setTimeout(() => setActionFeedbackMsg(null), 3000);
        }}
      />

      {/* Confirmation Modal for Deletions */}
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
