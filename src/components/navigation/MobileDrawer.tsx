import React from 'react';
import {
  X,
  Store,
  Users,
  FileSpreadsheet,
  TrendingUp,
  PlusCircle,
  Coins,
  Calculator,
  Calendar,
  Languages,
  QrCode,
  Settings,
  Headphones,
  Cloud,
  Loader2,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ChevronRight,
  UserPlus,
  BookOpen,
  Receipt,
  Sprout,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { useFirebase } from '../../context/FirebaseContext';
import { Language, MerchantTab } from '../../types';
import { getTodayDateString } from '../../data/initialData';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    language,
    setLanguage,
    portalMode,
    setPortalMode,
    merchantProfile,
    merchantTab,
    setMerchantTab,
    activeSessionDate,
    setIsDateSwitcherOpen,
    setIsQRModalOpen,
    setIsSettingsOpen,
    setIsOwnerSignUpOpen,
    setIsFarmerSignUpOpen,
    openHelpDesk,
    helpTickets,
    connectionRequests,
    currentUserAccount,
    currentUserPhone,
    logoutCurrentUser,
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
    signInWithGoogle,
    syncDataToCloud,
  } = useFirebase();

  const [syncFeedback, setSyncFeedback] = React.useState<string | null>(null);

  // Close drawer when ESC is pressed
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pendingRequestsCount = connectionRequests.filter((r) => r.status === 'pending').length;
  const openTicketsCount = helpTickets.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress'
  ).length;

  const handleCloudSync = async () => {
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
      setSyncFeedback('Sync failed');
      setTimeout(() => setSyncFeedback(null), 2500);
    }
  };

  const merchantTabsList: { id: MerchantTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t('tabDashboard'), icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'new-sale', label: t('tabNewSale'), icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'farmers', label: t('tabFarmers'), icon: <Users className="w-4 h-4" /> },
    { id: 'payments', label: t('tabPayments'), icon: <Coins className="w-4 h-4" /> },
    { id: 'settlement', label: t('tabSettlement'), icon: <Calculator className="w-4 h-4" /> },
    { id: 'reports', label: t('tabReports'), icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex no-print">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        id="mobile-navigation-drawer"
        className="relative w-full max-w-[320px] sm:max-w-xs bg-white h-full flex flex-col shadow-2xl z-10 overflow-y-auto safe-top-padding safe-bottom-padding"
      >
        {/* Header with App Info */}
        <div className="bg-[#2E6349] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Sprout className="w-5 h-5 text-[#DD9F2F]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm leading-tight text-white">
                <span>PhoolMitra</span>
                <span className="text-[10px] px-1 rounded bg-[#DD9F2F] text-[#2A1F1A] font-black">
                  MANDI
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80">
                {merchantProfile.shopNumber} • {merchantProfile.apmcMarketName}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="mobile-drawer-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 text-white/90 hover:text-white hover:bg-black/40 transition min-touch-target"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Mode Switcher Tabs */}
        <div className="p-3 bg-[#F4EFEA] border-b border-[#E8E2D9]">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#6B5E57] block mb-1.5">
            Select Portal Mode
          </span>
          <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-xl border border-[#E8E2D9]">
            <button
              type="button"
              id="drawer-switch-merchant-btn"
              onClick={() => {
                setPortalMode('merchant');
                onClose();
              }}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 min-touch-target ${
                portalMode === 'merchant'
                  ? 'bg-[#2E6349] text-white shadow-2xs'
                  : 'text-[#2A1F1A] hover:bg-[#FCFBF9]'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{t('merchantPortal')}</span>
            </button>

            <button
              type="button"
              id="drawer-switch-farmer-btn"
              onClick={() => {
                setPortalMode('farmer');
                onClose();
              }}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 min-touch-target ${
                portalMode === 'farmer'
                  ? 'bg-[#2E6349] text-white shadow-2xs'
                  : 'text-[#2A1F1A] hover:bg-[#FCFBF9]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('farmerPortal')}</span>
            </button>
          </div>
        </div>

        {/* User Account / Profile Box */}
        <div className="p-3 border-b border-[#E8E2D9] bg-[#FCFBF9]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#2E6349] bg-white flex items-center justify-center text-xs font-bold text-[#2E6349]">
                {merchantProfile.photoUrl ? (
                  <img
                    src={merchantProfile.photoUrl}
                    alt={merchantProfile.ownerName || 'Owner'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUserAccount?.fullName?.charAt(0) || merchantProfile.ownerName?.charAt(0) || 'U'
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#2A1F1A] leading-tight">
                  {currentUserAccount?.fullName || merchantProfile.ownerName || 'Mandi Trader'}
                </p>
                <p className="text-[10px] text-[#6B5E57] font-mono">
                  {currentUserPhone || merchantProfile.phoneNumber || 'Mobile'}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="drawer-logout-btn"
              onClick={() => {
                logoutCurrentUser();
                onClose();
              }}
              className="p-2 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition min-touch-target"
              title="Switch user account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 p-3 space-y-4 overflow-y-auto">
          {/* If Merchant Portal, show Merchant Navigation items */}
          {portalMode === 'merchant' && (
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#6B5E57] block mb-2 px-1">
                Merchant Operations
              </span>
              <div className="space-y-1">
                {merchantTabsList.map((tab) => {
                  const isActive = merchantTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`drawer-tab-${tab.id}`}
                      onClick={() => {
                        setMerchantTab(tab.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition min-touch-target ${
                        isActive
                          ? 'bg-[#2E6349] text-white shadow-2xs'
                          : 'text-[#2A1F1A] hover:bg-[#FCFBF9]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-[#2E6349]'}>
                          {tab.icon}
                        </span>
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#6B5E57]'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Tools & Modals */}
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#6B5E57] block mb-2 px-1">
              Tools &amp; Services
            </span>
            <div className="space-y-1">
              {/* Date Switcher */}
              <button
                type="button"
                id="drawer-date-switcher-btn"
                onClick={() => {
                  setIsDateSwitcherOpen(true);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FCFBF9] hover:bg-[#F4EFEA] border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A] min-touch-target"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#2E6349]" />
                  <span>{t('activeDate')}: <strong className="font-mono">{activeSessionDate}</strong></span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2E6349]/10 text-[#2E6349] font-bold">
                  {activeSessionDate === getTodayDateString() ? 'Today' : 'Archive'}
                </span>
              </button>

              {/* QR Code */}
              {portalMode === 'merchant' && (
                <button
                  type="button"
                  id="drawer-qr-code-btn"
                  onClick={() => {
                    setIsQRModalOpen(true);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FCFBF9] hover:bg-[#F4EFEA] border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A] min-touch-target"
                >
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-4 h-4 text-[#2E6349]" />
                    <span>Merchant QR &amp; Farmer Links</span>
                  </div>
                  {pendingRequestsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#C2255C] text-white text-[10px] font-bold">
                      {pendingRequestsCount} new
                    </span>
                  )}
                </button>
              )}

              {/* APMC Mandi Help Desk */}
              <button
                type="button"
                id="drawer-help-desk-btn"
                onClick={() => {
                  openHelpDesk('raise');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FCFBF9] hover:bg-[#F4EFEA] border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A] min-touch-target"
              >
                <div className="flex items-center gap-2.5">
                  <Headphones className="w-4 h-4 text-[#2E6349]" />
                  <span>APMC Mandi Help Desk</span>
                </div>
                {openTicketsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#2E6349] text-white text-[10px] font-bold">
                    {openTicketsCount}
                  </span>
                )}
              </button>

              {/* System Flowchart */}
              <button
                type="button"
                id="drawer-flowchart-btn"
                onClick={() => {
                  setPortalMode('flowchart');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FCFBF9] hover:bg-[#F4EFEA] border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A] min-touch-target"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#DD9F2F]" />
                  <span>System Architecture Map</span>
                </div>
              </button>

              {/* Settings */}
              {portalMode === 'merchant' && (
                <button
                  type="button"
                  id="drawer-settings-btn"
                  onClick={() => {
                    setIsSettingsOpen(true);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FCFBF9] hover:bg-[#F4EFEA] border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A] min-touch-target"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-[#2E6349]" />
                    <span>{t('tabSettings')}</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Trilingual Language Selector in Drawer */}
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#6B5E57] block mb-2 px-1">
              Select Language (భాష / भाषा)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['en', 'te', 'hi'] as Language[]).map((lang) => {
                const labels: Record<Language, string> = {
                  en: 'English',
                  te: 'తెలుగు',
                  hi: 'हिन्दी',
                };
                return (
                  <button
                    key={lang}
                    type="button"
                    id={`drawer-lang-${lang}`}
                    onClick={() => setLanguage(lang)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition min-touch-target ${
                      language === lang
                        ? 'bg-[#2E6349] text-white border-[#2E6349] shadow-2xs'
                        : 'bg-[#FCFBF9] text-[#2A1F1A] border-[#E8E2D9] hover:bg-stone-100'
                    }`}
                  >
                    {labels[lang]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Cloud Sync Bar */}
        <div className="p-3 bg-[#F4EFEA] border-t border-[#E8E2D9] space-y-2">
          <button
            type="button"
            id="drawer-cloud-sync-btn"
            onClick={handleCloudSync}
            disabled={isSyncing}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs min-touch-target ${
              firebaseUser
                ? 'bg-white border border-[#2E6349] text-[#2E6349]'
                : 'bg-[#DD9F2F] text-[#2A1F1A] hover:bg-[#c48a24]'
            }`}
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#2E6349]" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
            <span>
              {syncFeedback
                ? syncFeedback
                : isSyncing
                ? 'Syncing to Firebase...'
                : firebaseUser
                ? 'Sync with Cloud Database'
                : 'Sign In for Cloud Backup'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
