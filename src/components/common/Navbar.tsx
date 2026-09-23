import React, { useState } from 'react';
import {
  Search,
  X,
  Calendar,
  Wifi,
  Sprout,
  Loader2,
  Menu,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { useFirebase } from '../../context/FirebaseContext';
import { getTodayDateString, formatDisplayDate } from '../../data/initialData';

/* =========================================================================
   NAVBAR COMPONENT: COMPACT EXECUTIVE NAVY HEADER
   - Streamlined, space-optimized layout
   - Brand logo & search input
   - Full date indicator with complete visibility
   - Executive Navy (#1a3a52) with Classic Gold (#d4af37) accents
   ========================================================================= */

export const Navbar: React.FC = () => {
  const {
    merchantProfile,
    activeSessionDate,
    setMerchantTab,
    setDashboardTab,
    consignmentSearchQuery,
    setConsignmentSearchQuery,
    setIsDateSwitcherOpen,
    setIsMobileDrawerOpen,
    farmers,
    lots,
    shipments,
    payments,
    settlements,
    helpTickets,
  } = useMandi();

  const {
    user: firebaseUser,
    isSyncing,
    lastSyncedAt,
    signInWithGoogle,
    syncDataToCloud,
  } = useFirebase();

  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleQuickCloudSync = async () => {
    if (!firebaseUser) {
      try {
        await signInWithGoogle();
      } catch (e) {
        // handled
      }
      return;
    }
    setSyncFeedback('Syncing...');
    const ok = await syncDataToCloud({
      profile: merchantProfile,
      farmers,
      lots,
      shipments,
      payments,
      settlements,
      helpTickets,
    });
    if (ok) {
      setSyncFeedback('✓ Synced!');
      setTimeout(() => setSyncFeedback(null), 2500);
    } else {
      setSyncFeedback('Sync error');
      setTimeout(() => setSyncFeedback(null), 2500);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConsignmentSearchQuery(val);
    if (val.trim()) {
      setMerchantTab('dashboard');
      setDashboardTab('ledger');
    }
  };

  const handleClearSearch = () => {
    setConsignmentSearchQuery('');
  };

  const shopDisplayTitle = merchantProfile.shopNumber
    ? `${merchantProfile.shopNumber} - ${merchantProfile.apmcMarketName || 'APMC Market Yard'}`
    : 'Shop 1 - Agri APMC Market Yard';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* LEFT SIDE: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => {
              setMerchantTab('dashboard');
              setDashboardTab('summary');
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a3a52] to-[#122839] text-white flex items-center justify-center shadow-xs border border-[#1a3a52]/20 shrink-0">
              <Sprout className="w-4.5 h-4.5 text-[#d4af37]" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-[#1e293b] text-sm sm:text-base tracking-tight">भारत</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#d4af37] text-[#1a3a52] rounded tracking-wide">
                  MANDI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[110px] sm:max-w-[180px] lg:max-w-[240px] leading-tight mt-0.5">
                {shopDisplayTitle}
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: Compact Global Search Bar */}
        <div className="flex-1 min-w-[140px] max-w-xs sm:max-w-sm lg:max-w-md">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              id="global-consignment-search"
              value={consignmentSearchQuery}
              onChange={handleSearchChange}
              placeholder="Search lots, farmers..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1a3a52] focus:outline-none focus:ring-1 focus:ring-[#1a3a52]/20 transition text-[#1e293b] placeholder-slate-400"
            />
            {consignmentSearchQuery && (
              <button
                type="button"
                id="clear-global-search-btn"
                onClick={handleClearSearch}
                className="absolute right-2 p-0.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: [Session Date] [Online/Sync] [User Menu ⋮] */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1. Session Date Indicator - Guaranteed no overflow */}
          <button
            id="navbar-date-badge-btn"
            type="button"
            onClick={() => setIsDateSwitcherOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#1a3a52] transition cursor-pointer shadow-2xs group shrink-0 max-w-[140px]"
            title="Active Trading Date. Click to change session date"
          >
            <Calendar className="w-3.5 h-3.5 text-[#1a3a52] shrink-0" />
            <div className="text-left hidden sm:block truncate">
              <span className="block text-[8px] uppercase font-bold text-slate-500 leading-none">
                {activeSessionDate === getTodayDateString() ? 'Live Session' : 'Archive'}
              </span>
              <span className="text-[11px] font-bold font-mono leading-tight block truncate whitespace-nowrap">
                {formatDisplayDate(activeSessionDate)}
              </span>
            </div>
            <span className="sm:hidden text-xs font-bold font-mono whitespace-nowrap truncate">
              {activeSessionDate}
            </span>
          </button>

          {/* 2. Cloud / Offline Sync Status */}
          <button
            type="button"
            id="navbar-cloud-sync-status-btn"
            onClick={handleQuickCloudSync}
            disabled={isSyncing}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              firebaseUser
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title={
              firebaseUser
                ? `Firebase Online Sync: Active (${lastSyncedAt || 'Live'}). Click to sync.`
                : 'Offline Storage Active. Click to connect Cloud Backup.'
            }
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1a3a52]" />
            ) : firebaseUser ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span className="text-[11px]">
              {syncFeedback ? syncFeedback : firebaseUser ? 'Online' : 'Offline'}
            </span>
          </button>

          {/* 3. Navigation Menu Drawer Button */}
          <button
            type="button"
            id="navbar-mobile-drawer-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#1a3a52] transition cursor-pointer shadow-2xs shrink-0"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

