import React, { useState, useMemo } from 'react';
import {
  Headphones,
  UserPlus,
  QrCode,
  Calendar,
  Settings,
  PhoneCall,
  LogOut,
  Store,
  Users,
  Clock,
  X,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { useFirebase } from '../../context/FirebaseContext';
import { FarmersView } from './FarmersView';

export const SupportView: React.FC = () => {
  const {
    merchantProfile,
    language,
    setLanguage,
    openHelpDesk,
    setIsFarmerSignUpOpen,
    setIsQRModalOpen,
    setIsSettingsOpen,
    setIsDateSwitcherOpen,
    logoutCurrentUser,
    activeSessionDate,
    farmers,
    connectionRequests,
    currentUserPhone,
  } = useMandi();

  const { user: firebaseUser } = useFirebase();
  const [farmersModalTab, setFarmersModalTab] = useState<'connected' | 'incoming' | null>(null);

  const cleanMerchantPhone = merchantProfile?.phoneNumber
    ? merchantProfile.phoneNumber.replace(/\D/g, '').slice(-10)
    : currentUserPhone;

  const incomingRequestsCount = useMemo(() => {
    return connectionRequests.filter(
      (r) =>
        r.senderRole === 'farmer' &&
        r.status === 'pending' &&
        (r.merchantId === merchantProfile?.merchantId ||
          (r.merchantPhone && r.merchantPhone.replace(/\D/g, '').slice(-10) === cleanMerchantPhone))
    ).length;
  }, [connectionRequests, merchantProfile?.merchantId, cleanMerchantPhone]);

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a52] tracking-tight">Support &amp; Services</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Help, mandi tools, and account services</p>
        </div>
        {merchantProfile && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-[#1a3a52] font-semibold shadow-2xs">
              <Store className="w-3.5 h-3.5 text-[#1a3a52]" />
              <span>{merchantProfile.shopName || 'भारत MANDI Wholesale'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-500 font-normal">
                {firebaseUser ? 'Cloud Connected' : 'Offline Storage'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Support Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {/* Register New Farmer */}
        <button
          type="button"
          id="support-add-farmer-btn"
          onClick={() => setIsFarmerSignUpOpen(true)}
          className="support-card group text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="support-title">Register New Farmer</div>
          <div className="support-desc">Add grower profile &amp; passbook</div>
        </button>

        {/* Incoming Requests */}
        <button
          type="button"
          id="support-incoming-requests-btn"
          onClick={() => setFarmersModalTab('incoming')}
          className="support-card group text-left cursor-pointer relative"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between">
            <div className="support-title">Incoming Requests</div>
            {incomingRequestsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold animate-pulse">
                {incomingRequestsCount} New
              </span>
            )}
          </div>
          <div className="support-desc">
            {incomingRequestsCount > 0
              ? `${incomingRequestsCount} farmer connection requests pending`
              : 'Approve incoming grower connection requests'}
          </div>
        </button>

        {/* Connected Farmers */}
        <button
          type="button"
          id="support-connected-farmers-btn"
          onClick={() => setFarmersModalTab('connected')}
          className="support-card group text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <Users className="w-6 h-6" />
          </div>
          <div className="support-title">Connected Farmers</div>
          <div className="support-desc">{farmers.length} connected grower profiles &amp; passbooks</div>
        </button>

        <button
          type="button"
          id="support-open-helpdesk-btn"
          onClick={openHelpDesk}
          className="support-card group text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <Headphones className="w-6 h-6" />
          </div>
          <div className="support-title">AI Support Help Desk</div>
          <div className="support-desc">Instant mandi assistant &amp; tickets</div>
        </button>

        <button
          type="button"
          id="support-qr-btn"
          onClick={() => setIsQRModalOpen(true)}
          className="support-card group text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="support-title">Farmer QR &amp; APMC Pass</div>
          <div className="support-desc">Scan &amp; share digital receipt ID</div>
        </button>

        <button
          type="button"
          id="support-dateswitcher-btn"
          onClick={() => setIsDateSwitcherOpen(true)}
          className="support-card group text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="support-title">Trading Session Date</div>
          <div className="support-desc">Active: {activeSessionDate || '2026-09-22'}</div>
        </button>

        <a
          href="tel:18004251666"
          id="support-helpline-link"
          className="support-card group text-inherit no-underline text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div className="support-title">APMC Market Helpline</div>
          <div className="support-desc">Toll-Free: 1800-425-1666</div>
        </a>
      </div>

      {/* Language Selector */}
      <div className="language-section">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          {language === 'te' ? 'భాష' : language === 'hi' ? 'भाषा' : 'Language'}
        </h2>
        <div className="language-selector">
          <button
            type="button"
            id="lang-select-en"
            onClick={() => setLanguage('en')}
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          >
            English
          </button>
          <button
            type="button"
            id="lang-select-te"
            onClick={() => setLanguage('te')}
            className={`lang-btn ${language === 'te' ? 'active' : ''}`}
          >
            {language === 'en' ? 'Telugu' : 'తెలుగు'}
          </button>
          <button
            type="button"
            id="lang-select-hi"
            onClick={() => setLanguage('hi')}
            className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
          >
            {language === 'en' ? 'Hindi' : 'हिंदी'}
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        id="support-logout-btn"
        onClick={logoutCurrentUser}
        className="btn-logout"
      >
        <LogOut className="w-4 h-4 text-[#1a3a52]" />
        <span>Log Out of Session</span>
      </button>

      {/* Farmer Management Modal (Connected Farmers / Incoming Requests) */}
      {farmersModalTab && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className="bg-[#f8fafc] w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-4 sm:p-6 relative border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 sticky top-0 bg-[#f8fafc] z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {farmersModalTab === 'incoming' ? 'Incoming Connection Requests' : 'Connected Farmers Directory'}
                </h3>
                <p className="text-xs text-slate-500">
                  {farmersModalTab === 'incoming'
                    ? 'Review and accept/decline farmer link requests'
                    : 'Manage connected farmer passbooks, edit details and rates'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFarmersModalTab(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FarmersView
              initialTab={farmersModalTab}
              isModal={true}
              onClose={() => setFarmersModalTab(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default SupportView;

