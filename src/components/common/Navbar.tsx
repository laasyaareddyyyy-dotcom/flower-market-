import React from 'react';
import {
  Store,
  Calendar,
  Languages,
  QrCode,
  Settings,
  Users,
  Wifi,
  FileSpreadsheet,
  ArrowRightLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  User,
  UserPlus,
  Eye,
  LogOut,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { Language } from '../../types';
import { getTodayDateString } from '../../data/initialData';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    portalMode,
    setPortalMode,
    merchantProfile,
    activeSessionDate,
    setMerchantTab,
    connectionRequests,
    setIsQRModalOpen,
    setIsSettingsOpen,
    setIsOwnerSignUpOpen,
    setIsFarmerSignUpOpen,
    setIsDateSwitcherOpen,
    isSeniorMode,
    toggleSeniorMode,
    logoutCurrentUser,
    currentUserAccount,
    currentUserPhone,
    t,
  } = useMandi();

  const pendingRequestsCount = connectionRequests.filter((r) => r.status === 'pending').length;

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E8E2D9] shadow-xs no-print">
      {/* Top Notification / Portal Switcher Bar */}
      <div className="bg-[#2E6349] text-white px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="font-semibold uppercase tracking-wider text-[#DD9F2F] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            APMC Mandi
          </span>
          <span className="text-white/40">|</span>
          <span className="text-white/90 truncate max-w-[280px] sm:max-w-none">
            {merchantProfile.shopNumber} • {merchantProfile.apmcMarketName}
          </span>
        </div>

        {/* Portal Switcher & Status */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Offline indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/20 text-white/90 text-[11px]">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>{t('offlineReady')}</span>
          </div>

          {/* Clean Senior Mode Toggle */}
          <button
            type="button"
            id="toggle-senior-mode-btn"
            onClick={toggleSeniorMode}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1.5 ${
              isSeniorMode
                ? 'bg-[#DD9F2F] text-[#2A1F1A] shadow-xs'
                : 'bg-black/20 text-white/90 hover:bg-black/30'
            }`}
            title="Clean, uncluttered layout with larger fonts and simple cards for elderly users"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSeniorMode ? '👓 Clean View ON' : '👓 Senior View'}
            </span>
            <span className="sm:hidden">👓 Clean</span>
          </button>

          {/* Switch / Re-Verify Role / User Account */}
          <button
            type="button"
            id="header-switch-account-btn"
            onClick={logoutCurrentUser}
            className="flex px-2 py-1 rounded-md bg-black/20 text-white/90 hover:text-white hover:bg-black/30 text-[11px] font-medium items-center gap-1"
            title={`Signed in as ${currentUserAccount?.fullName || currentUserPhone || 'User'}. Click to switch account or log out`}
          >
            <LogOut className="w-3 h-3 text-[#DD9F2F]" />
            <span className="hidden sm:inline">
              {currentUserAccount?.fullName ? `${currentUserAccount.fullName} (${currentUserPhone})` : 'Switch User'}
            </span>
            <span className="sm:hidden">Switch</span>
          </button>

          {/* Role / Portal Switcher */}
          <div className="flex items-center bg-black/25 p-0.5 rounded-lg border border-white/10">
            <button
              id="switch-merchant-portal-btn"
              onClick={() => setPortalMode('merchant')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                portalMode === 'merchant'
                  ? 'bg-white text-[#2E6349] shadow-xs font-semibold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t('merchantPortal')}</span>
            </button>

            <button
              id="switch-farmer-portal-btn"
              onClick={() => setPortalMode('farmer')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                portalMode === 'farmer'
                  ? 'bg-white text-[#2E6349] shadow-xs font-semibold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('farmerPortal')}</span>
            </button>

            <button
              id="switch-flowchart-btn"
              onClick={() => setPortalMode('flowchart')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                portalMode === 'flowchart'
                  ? 'bg-[#DD9F2F] text-[#2A1F1A] shadow-xs font-semibold'
                  : 'text-white/80 hover:text-white'
              }`}
              title="Interactive System Flowchart"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('flowchartMap')}</span>
              <span className="sm:hidden">Flow</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Merchant Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Merchant Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E6349] to-[#1F4532] text-white flex items-center justify-center font-black text-lg shadow-sm border border-[#2E6349]/20">
            🌸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#2A1F1A] leading-tight">
                {portalMode === 'merchant'
                  ? merchantProfile.shopName
                  : portalMode === 'farmer'
                  ? t('farmerPortal')
                  : 'PhoolMitra Architecture Flowchart'}
              </h1>
              {portalMode === 'merchant' && (
                <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-[#FCFBF9] text-[#2E6349] border border-[#2E6349]/30 font-medium">
                  ID: {merchantProfile.merchantId}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B5E57] flex items-center gap-2">
              <span>{t('appSubtitle')}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-[#E8E2D9]"></span>
              <span className="text-[#2E6349] font-medium">APMC Accredited</span>
            </p>
          </div>
        </div>

        {/* Action Controls: Live Date, QR, Language, Settings */}
        <div className="flex items-center flex-wrap gap-2 ml-auto">
          {/* Active Live Session Date Indicator */}
          <div className="flex items-center gap-1">
            <button
              id="header-open-date-switcher-btn"
              type="button"
              onClick={() => setIsDateSwitcherOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E9F3EE] hover:bg-[#d8ece2] border border-[#2E6349]/30 text-[#2E6349] transition cursor-pointer group shadow-2xs"
              title="Click to switch trading date, view past archives, or start new day"
            >
              <Calendar className="w-4 h-4 text-[#2E6349] shrink-0" />
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#2E6349]/70 leading-none">
                    {t('activeDate')}
                  </span>
                  <span className="text-[9px] font-bold px-1 rounded bg-[#2E6349]/15 text-[#2E6349]">
                    {activeSessionDate === getTodayDateString() ? 'Today' : 'Archive'}
                  </span>
                </div>
                <span className="text-xs font-bold font-mono leading-tight block">
                  {activeSessionDate}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#2E6349] opacity-70 group-hover:opacity-100 transition" />
            </button>
            {portalMode === 'merchant' && (
              <button
                id="header-jump-reports-btn"
                onClick={() => setMerchantTab('reports')}
                className="hidden md:flex px-2 py-1.5 rounded-lg border border-[#E8E2D9] text-[11px] text-[#6B5E57] hover:text-[#2E6349] hover:bg-[#F4EFEA] transition items-center gap-1"
                title="Browse past reports & PDFs"
              >
                <span>Reports</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Merchant QR Code Button */}
          {portalMode === 'merchant' && (
            <button
              id="merchant-qr-btn"
              onClick={() => setIsQRModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-[#FCFBF9] text-[#2A1F1A] hover:bg-[#F4EFEA] transition text-xs font-semibold flex items-center gap-1.5"
              title="View Merchant QR & Connection ID"
            >
              <QrCode className="w-4 h-4 text-[#2E6349]" />
              <span className="hidden sm:inline">Merchant ID QR</span>
              {pendingRequestsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#C2255C] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}

          {/* Trilingual Language Selector */}
          <div className="flex items-center border border-[#E8E2D9] rounded-lg overflow-hidden bg-[#FFFFFF] shadow-2xs">
            <span className="px-2 text-[#6B5E57]">
              <Languages className="w-3.5 h-3.5" />
            </span>
            {(['en', 'te', 'hi'] as Language[]).map((lang) => {
              const labels: Record<Language, string> = {
                en: 'EN',
                te: 'తెలుగు',
                hi: 'हिन्दी',
              };
              return (
                <button
                  key={lang}
                  id={`lang-btn-${lang}`}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1.5 text-xs font-medium transition ${
                    language === lang
                      ? 'bg-[#2E6349] text-white font-bold'
                      : 'text-[#2A1F1A] hover:bg-[#FCFBF9]'
                  }`}
                >
                  {labels[lang]}
                </button>
              );
            })}
          </div>

          {/* Owner Profile & Photo Button */}
          {portalMode === 'merchant' && (
            <button
              id="navbar-owner-profile-btn"
              onClick={() => setIsOwnerSignUpOpen(true)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-[#E8E2D9] hover:bg-[#F4EFEA] hover:border-[#2E6349] transition text-xs font-semibold text-[#2A1F1A] bg-white shadow-2xs group"
              title="APMC Shop Owner Profile & Photo (యజమాని ఫోటో)"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-[#2E6349] bg-[#FCFBF9] shrink-0">
                {merchantProfile.photoUrl ? (
                  <img
                    src={merchantProfile.photoUrl}
                    alt={merchantProfile.ownerName || 'Owner'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#2E6349]">
                    {merchantProfile.ownerName?.charAt(0) || 'O'}
                  </div>
                )}
              </div>
              <span className="hidden sm:inline font-bold truncate max-w-[110px] group-hover:text-[#2E6349]">
                {merchantProfile.ownerName || 'Owner'}
              </span>
            </button>
          )}

          {/* Farmer Sign Up Button in Farmer Portal */}
          {portalMode === 'farmer' && (
            <button
              id="navbar-farmer-signup-btn"
              onClick={() => setIsFarmerSignUpOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E6349] text-white hover:bg-[#1F4532] transition text-xs font-bold shadow-2xs"
              title="Sign Up as Farmer (రైతు నమోదు)"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span className="hidden sm:inline">Farmer Sign Up</span>
              <span className="sm:hidden">Sign Up</span>
            </button>
          )}

          {/* Shop Settings */}
          {portalMode === 'merchant' && (
            <button
              id="merchant-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA] transition"
              title={t('tabSettings')}
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
