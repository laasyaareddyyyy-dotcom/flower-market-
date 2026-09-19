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
  LogOut,
  Headphones,
  HelpCircle,
  Cloud,
  Loader2,
  RefreshCw,
  Smartphone,
  Sprout,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { useFirebase } from '../../context/FirebaseContext';
import { Language } from '../../types';
import { getTodayDateString } from '../../data/initialData';
import { InstallPwaModal } from './InstallPwaModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';

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
    isFirebaseConnected,
    isSyncing,
    autoSaveStatus,
    isAutoSyncEnabled,
    lastSyncedAt,
    signInWithGoogle,
    signOut: signOutGoogle,
    syncDataToCloud,
  } = useFirebase();

  const [syncFeedback, setSyncFeedback] = React.useState<string | null>(null);
  const [isInstallPwaOpen, setIsInstallPwaOpen] = React.useState<boolean>(false);
  const { isInstalled } = usePWAInstall();

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
      setSyncFeedback('✓ Synced to Firebase!');
      setTimeout(() => setSyncFeedback(null), 3000);
    } else {
      setSyncFeedback('Sync error');
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  const pendingRequestsCount = connectionRequests.filter((r) => r.status === 'pending').length;
  const openTicketsCount = helpTickets.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress'
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E8E2D9] shadow-xs no-print">
      {/* Top Notification / Portal Switcher Bar */}
      <div className="bg-[#2E6349] text-white px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="font-semibold uppercase tracking-wider text-[#DD9F2F] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Mandi Ledger
          </span>
          <span className="text-white/40">|</span>
          <span className="text-white/90 truncate max-w-[280px] sm:max-w-none">
            {merchantProfile.shopNumber} • {merchantProfile.apmcMarketName}
          </span>
        </div>

        {/* Portal Switcher & Status */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Firebase Cloud Sync Status */}
          <button
            type="button"
            id="header-firebase-cloud-btn"
            onClick={handleQuickCloudSync}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
              firebaseUser
                ? autoSaveStatus === 'saving'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 animate-pulse'
                  : 'bg-black/30 hover:bg-black/40 text-emerald-300 border border-emerald-500/30'
                : 'bg-[#DD9F2F] hover:bg-[#c48a24] text-[#2A1F1A] font-bold shadow-2xs'
            }`}
            title={
              firebaseUser
                ? `Firebase Firestore Auto-Sync: ${isAutoSyncEnabled ? 'ON' : 'OFF'}. Account: ${firebaseUser.email || 'Anonymous'}. Last sync: ${lastSyncedAt || 'Just now'}. Click to trigger manual sync.`
                : 'Click to Sign In with Google & enable automatic Firebase Cloud Sync (Project: phoolmitra-flower-mandi)'
            }
          >
            {isSyncing || autoSaveStatus === 'saving' ? (
              <Loader2 className="w-3 h-3 animate-spin text-white" />
            ) : (
              <Cloud className={`w-3 h-3 ${firebaseUser ? 'text-emerald-400' : 'text-[#2A1F1A]'}`} />
            )}
            <span>
              {syncFeedback ? (
                syncFeedback
              ) : isSyncing || autoSaveStatus === 'saving' ? (
                'Auto-Syncing...'
              ) : autoSaveStatus === 'saved' ? (
                '✓ Saved to Cloud'
              ) : firebaseUser ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Cloud Synced</span>
                  <RefreshCw className="w-2.5 h-2.5 opacity-60 hover:opacity-100 ml-0.5" />
                </span>
              ) : (
                'Auto-Sync to Cloud'
              )}
            </span>
          </button>

          {/* Offline indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/20 text-white/90 text-[11px]">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>{t('offlineReady')}</span>
          </div>

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

          {/* Portal Mode Indicator & Flowchart (Direct switch between merchant & farmer removed) */}
          <div className="flex items-center bg-black/25 p-0.5 rounded-lg border border-white/10">
            {portalMode === 'merchant' ? (
              <div
                id="active-merchant-portal-badge"
                className="px-2.5 py-1 rounded-md bg-white text-[#2E6349] shadow-xs font-semibold flex items-center gap-1.5 text-xs select-none"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t('merchantPortal')}</span>
              </div>
            ) : portalMode === 'farmer' ? (
              <div
                id="active-farmer-portal-badge"
                className="px-2.5 py-1 rounded-md bg-white text-[#2E6349] shadow-xs font-semibold flex items-center gap-1.5 text-xs select-none"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('farmerPortal')}</span>
              </div>
            ) : (
              <button
                id="switch-back-to-portal-btn"
                onClick={() => setPortalMode(currentUserAccount?.role === 'farmer' ? 'farmer' : 'merchant')}
                className="px-2.5 py-1 rounded-md text-white/80 hover:text-white transition-all font-medium flex items-center gap-1.5 text-xs"
              >
                {currentUserAccount?.role === 'farmer' ? (
                  <Users className="w-3.5 h-3.5" />
                ) : (
                  <Store className="w-3.5 h-3.5" />
                )}
                <span>
                  {currentUserAccount?.role === 'farmer'
                    ? `Back to ${t('farmerPortal')}`
                    : `Back to ${t('merchantPortal')}`}
                </span>
              </button>
            )}

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
            <Sprout className="w-6 h-6 text-[#DD9F2F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#2A1F1A] leading-tight">
                {portalMode === 'merchant'
                  ? merchantProfile.shopName
                  : portalMode === 'farmer'
                  ? t('farmerPortal')
                  : 'Mandi System Architecture Flowchart'}
              </h1>
              {portalMode === 'merchant' && (
                <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-[#FCFBF9] text-[#2E6349] border border-[#2E6349]/30 font-medium">
                  ID: {merchantProfile.merchantId}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B5E57] flex items-center gap-2">
              <span>{t('appSubtitle')}</span>
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
              title={language === 'te' ? 'యజమాని ప్రొఫైల్ & ఫోటో' : 'Shop Owner Profile & Photo'}
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
              title={language === 'te' ? 'రైతు నమోదు' : 'Sign Up as Farmer'}
            >
              <UserPlus className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span className="hidden sm:inline">Farmer Sign Up</span>
              <span className="sm:hidden">Sign Up</span>
            </button>
          )}

          {/* Help Desk & Support Button (Accessible everywhere) */}
          <button
            id="navbar-help-desk-btn"
            type="button"
            onClick={() => openHelpDesk('raise')}
            className="relative px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-[#FCFBF9] hover:bg-[#F4EFEA] hover:border-[#2E6349]/40 text-[#2A1F1A] transition text-xs font-bold flex items-center gap-1.5 shadow-2xs group cursor-pointer"
            title="Open APMC Mandi Help Desk & Support"
          >
            <Headphones className="w-4 h-4 text-[#2E6349] group-hover:scale-110 transition" />
            <span className="hidden sm:inline">{t('helpDesk') ? 'Help Desk' : 'Support'}</span>
            {openTicketsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#2E6349] text-white font-mono text-[10px] font-bold">
                {openTicketsCount}
              </span>
            )}
          </button>

          {/* Install App / APK Mobile Modal Button */}
          <button
            id="navbar-install-apk-btn"
            type="button"
            onClick={() => setIsInstallPwaOpen(true)}
            className={`px-2.5 py-1.5 rounded-lg border transition text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              isInstalled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-[#DD9F2F] bg-[#FFF8EB] hover:bg-[#FDE68A] text-[#854D0E]'
            }`}
            title="Install Mandi App as an Android App / APK or iOS Home Screen App"
          >
            <Smartphone className="w-4 h-4 text-[#DD9F2F]" />
            <span className="hidden sm:inline">{isInstalled ? 'App Installed' : 'Get App / APK'}</span>
            <span className="sm:hidden">App</span>
          </button>

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

      {/* PWA / APK Mobile Installation Guidance Modal */}
      <InstallPwaModal
        isOpen={isInstallPwaOpen}
        onClose={() => setIsInstallPwaOpen(false)}
      />
    </header>
  );
};
