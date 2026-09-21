import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  X,
  Calendar,
  Cloud,
  Wifi,
  MoreVertical,
  Settings,
  Headphones,
  LogOut,
  Languages,
  Store,
  Users,
  FileSpreadsheet,
  QrCode,
  Sprout,
  ShieldCheck,
  RefreshCw,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { useFirebase } from '../../context/FirebaseContext';
import { Language } from '../../types';
import { getTodayDateString } from '../../data/initialData';
import { MobileDrawer } from '../navigation/MobileDrawer';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    portalMode,
    setPortalMode,
    merchantProfile,
    activeSessionDate,
    setMerchantTab,
    setDashboardTab,
    consignmentSearchQuery,
    setConsignmentSearchQuery,
    connectionRequests,
    setIsQRModalOpen,
    setIsSettingsOpen,
    setIsOwnerSignUpOpen,
    setIsDateSwitcherOpen,
    openHelpDesk,
    helpTickets,
    logoutCurrentUser,
    currentUserAccount,
    currentUserPhone,
    farmers,
    lots,
    shipments,
    payments,
    settlements,
    t,
  } = useMandi();

  const {
    user: firebaseUser,
    isSyncing,
    autoSaveStatus,
    isAutoSyncEnabled,
    lastSyncedAt,
    signInWithGoogle,
    syncDataToCloud,
  } = useFirebase();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close User Menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const pendingRequestsCount = connectionRequests.filter((r) => r.status === 'pending').length;
  const openTicketsCount = helpTickets.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress'
  ).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConsignmentSearchQuery(val);
    if (val.trim() && portalMode === 'merchant') {
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

  const userDisplayName =
    currentUserAccount?.fullName ||
    merchantProfile.ownerName ||
    (currentUserPhone ? `Ireddy (${currentUserPhone})` : 'Ireddy (9440826222)');

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E8E2D9] shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* LEFT SIDE: [☰ Menu] [PhoolMitra Logo] [Shop 1 - Agri APMC Market Yard] */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Menu Button */}
          <button
            type="button"
            id="navbar-hamburger-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-2 rounded-xl bg-[#FCFBF9] hover:bg-[#F4EFEA] border border-[#E8E2D9] text-[#2A1F1A] transition min-touch-target cursor-pointer"
            aria-label="Open Navigation Menu"
            title="Open Mandi Menu & Tools"
          >
            <Menu className="w-5 h-5 text-[#2E6349]" />
          </button>

          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => {
              setMerchantTab('dashboard');
              setDashboardTab('summary');
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E6349] to-[#1F4532] text-white flex items-center justify-center shadow-xs border border-[#2E6349]/20 shrink-0">
              <Sprout className="w-5 h-5 text-[#DD9F2F]" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-[#2A1F1A] text-base tracking-tight">PhoolMitra</span>
                <span className="text-[9px] font-black uppercase px-1 py-0.2 bg-[#DD9F2F] text-[#2A1F1A] rounded">
                  MANDI
                </span>
              </div>
              <p className="text-[11px] text-[#6B5E57] font-medium mt-0.5 truncate max-w-[200px] md:max-w-[260px]">
                {shopDisplayTitle}
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: [Search Consignments...] */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#6B5E57] absolute left-3 pointer-events-none" />
            <input
              type="text"
              id="global-consignment-search"
              value={consignmentSearchQuery}
              onChange={handleSearchChange}
              placeholder="Search Consignments, Farmers, Varieties..."
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-[#F9F6F0] border border-[#E8E2D9] focus:bg-white focus:border-[#2E6349] focus:outline-none focus:ring-2 focus:ring-[#2E6349]/20 transition text-[#2A1F1A] placeholder-[#6B5E57]/70"
            />
            {consignmentSearchQuery && (
              <button
                type="button"
                id="clear-global-search-btn"
                onClick={handleClearSearch}
                className="absolute right-2.5 p-0.5 rounded-full hover:bg-stone-200 text-[#6B5E57] transition cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: [Live Session] [Status: Online] [User Menu ⋮] */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* [Live Session] Date Indicator */}
          <button
            id="navbar-date-badge-btn"
            type="button"
            onClick={() => setIsDateSwitcherOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#E9F3EE] hover:bg-[#d8ece2] border border-[#2E6349]/30 text-[#2E6349] transition cursor-pointer shadow-2xs group"
            title="Active Trading Date. Click to change session date"
          >
            <Calendar className="w-3.5 h-3.5 text-[#2E6349] shrink-0" />
            <div className="text-left hidden sm:block">
              <span className="block text-[9px] uppercase font-bold text-[#2E6349]/70 leading-none">
                {activeSessionDate === getTodayDateString() ? 'Live Session' : 'Archive'}
              </span>
              <span className="text-[11px] font-bold font-mono leading-tight block">
                {activeSessionDate}
              </span>
            </div>
            <span className="sm:hidden text-xs font-bold font-mono">
              {activeSessionDate.slice(5)}
            </span>
          </button>

          {/* [Status: Online] / Cloud Sync */}
          <button
            type="button"
            id="navbar-cloud-sync-status-btn"
            onClick={handleQuickCloudSync}
            disabled={isSyncing}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              firebaseUser
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-[#FCFBF9] text-[#6B5E57] border-[#E8E2D9] hover:bg-[#F4EFEA]'
            }`}
            title={
              firebaseUser
                ? `Firebase Online Sync: Active (${lastSyncedAt || 'Live'}). Click to sync.`
                : 'Offline Storage Active. Click to connect Cloud Backup.'
            }
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2E6349]" />
            ) : firebaseUser ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span className="text-[11px]">
              {syncFeedback ? syncFeedback : firebaseUser ? 'Status: Online' : 'Offline Ready'}
            </span>
          </button>

          {/* [User Menu ⋮] Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              id="navbar-user-menu-trigger"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 cursor-pointer min-touch-target ${
                isUserMenuOpen
                  ? 'bg-[#2E6349] text-white border-[#2E6349]'
                  : 'bg-[#FCFBF9] text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#F4EFEA]'
              }`}
              title="User Menu & Quick Settings"
              aria-label="User Menu"
              aria-expanded={isUserMenuOpen}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-current flex items-center justify-center font-bold text-[10px] bg-white text-[#2E6349] shrink-0">
                {merchantProfile.photoUrl ? (
                  <img
                    src={merchantProfile.photoUrl}
                    alt={merchantProfile.ownerName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userDisplayName.charAt(0)
                )}
              </div>
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Card */}
            {isUserMenuOpen && (
              <div
                id="navbar-user-dropdown-menu"
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#E8E2D9] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Account Card Header */}
                <div className="p-3.5 bg-[#FAF8F5] border-b border-[#E8E2D9]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2E6349] bg-white flex items-center justify-center text-sm font-bold text-[#2E6349] shrink-0">
                      {merchantProfile.photoUrl ? (
                        <img
                          src={merchantProfile.photoUrl}
                          alt={userDisplayName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        userDisplayName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#2A1F1A] truncate">{userDisplayName}</p>
                      <p className="text-[11px] text-[#6B5E57] font-mono">
                        {currentUserPhone || merchantProfile.phoneNumber || '9440826222'}
                      </p>
                      <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Verified Adathiya
                      </span>
                    </div>
                  </div>
                </div>

                {/* Portal Mode Switcher */}
                <div className="p-2 border-b border-[#E8E2D9]">
                  <span className="text-[10px] uppercase font-bold text-[#6B5E57] px-2 block mb-1">
                    Portal Navigation
                  </span>
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      id="dropdown-switch-merchant"
                      onClick={() => {
                        setPortalMode('merchant');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition ${
                        portalMode === 'merchant'
                          ? 'bg-[#2E6349] text-white'
                          : 'text-[#2A1F1A] hover:bg-[#FCFBF9]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        <span>{t('merchantPortal')}</span>
                      </div>
                      {portalMode === 'merchant' && <span className="text-[10px]">Active</span>}
                    </button>

                    <button
                      type="button"
                      id="dropdown-switch-farmer"
                      onClick={() => {
                        setPortalMode('farmer');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition ${
                        portalMode === 'farmer'
                          ? 'bg-[#2E6349] text-white'
                          : 'text-[#2A1F1A] hover:bg-[#FCFBF9]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{t('farmerPortal')}</span>
                      </div>
                      {portalMode === 'farmer' && <span className="text-[10px]">Active</span>}
                    </button>

                    <button
                      type="button"
                      id="dropdown-switch-flowchart"
                      onClick={() => {
                        setPortalMode('flowchart');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition ${
                        portalMode === 'flowchart'
                          ? 'bg-[#2E6349] text-white'
                          : 'text-[#2A1F1A] hover:bg-[#FCFBF9]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#DD9F2F]" />
                        <span>System Architecture</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Trilingual Selector */}
                <div className="p-2 border-b border-[#E8E2D9]">
                  <span className="text-[10px] uppercase font-bold text-[#6B5E57] px-2 block mb-1">
                    Language (భాష / भाषा)
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {(['en', 'te', 'hi'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        id={`dropdown-lang-${lang}`}
                        onClick={() => {
                          setLanguage(lang);
                        }}
                        className={`py-1 px-2 rounded-lg text-xs font-bold border transition text-center ${
                          language === lang
                            ? 'bg-[#2E6349] text-white border-[#2E6349]'
                            : 'bg-[#FCFBF9] text-[#2A1F1A] border-[#E8E2D9] hover:bg-stone-100'
                        }`}
                      >
                        {lang === 'en' ? 'English' : lang === 'te' ? 'తెలుగు' : 'हिन्दी'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Menu Actions: Offline Mode, Settings, Help Desk, QR, Logout */}
                <div className="p-2 space-y-0.5 text-xs">
                  {/* Offline Mode Status Info */}
                  <div className="flex items-center justify-between p-2 rounded-xl text-[#6B5E57] bg-[#FCFBF9]">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium">Offline Storage Mode</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>

                  {/* Merchant QR */}
                  <button
                    type="button"
                    id="dropdown-merchant-qr-btn"
                    onClick={() => {
                      setIsQRModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FCFBF9] text-[#2A1F1A] font-semibold transition"
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#2E6349]" />
                      <span>Merchant QR Code</span>
                    </div>
                    {pendingRequestsCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </button>

                  {/* Settings */}
                  <button
                    type="button"
                    id="dropdown-settings-btn"
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[#FCFBF9] text-[#2A1F1A] font-semibold transition"
                  >
                    <Settings className="w-4 h-4 text-[#2E6349]" />
                    <span>{t('tabSettings')}</span>
                  </button>

                  {/* Help Desk */}
                  <button
                    type="button"
                    id="dropdown-helpdesk-btn"
                    onClick={() => {
                      openHelpDesk('raise');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FCFBF9] text-[#2A1F1A] font-semibold transition"
                  >
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-[#2E6349]" />
                      <span>APMC Mandi Help Desk</span>
                    </div>
                    {openTicketsCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#2E6349] text-white">
                        {openTicketsCount}
                      </span>
                    )}
                  </button>

                  {/* Logout / Switch User */}
                  <button
                    type="button"
                    id="dropdown-logout-btn"
                    onClick={() => {
                      logoutCurrentUser();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-50 text-rose-700 font-bold transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Switch User / Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Hamburger Menu) */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />
    </header>
  );
};
