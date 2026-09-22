import React from 'react';
import {
  Headphones,
  UserPlus,
  QrCode,
  Calendar,
  Settings,
  PhoneCall,
  LogOut,
  Store,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { useFirebase } from '../../context/FirebaseContext';

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
  } = useMandi();

  const { user: firebaseUser } = useFirebase();

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
              <span>{merchantProfile.shopName || 'PhoolMitra Wholesale'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-500 font-normal">
                {firebaseUser ? 'Cloud Connected' : 'Offline Storage'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Support Services 6-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <button
          type="button"
          id="support-open-helpdesk-btn"
          onClick={openHelpDesk}
          className="support-card group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <Headphones className="w-6 h-6" />
          </div>
          <div className="support-title">AI Support Help Desk</div>
          <div className="support-desc">Instant mandi assistant &amp; tickets</div>
        </button>

        <button
          type="button"
          id="support-add-farmer-btn"
          onClick={() => setIsFarmerSignUpOpen(true)}
          className="support-card group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="support-title">Register New Farmer</div>
          <div className="support-desc">Add grower profile &amp; passbook</div>
        </button>

        <button
          type="button"
          id="support-qr-btn"
          onClick={() => setIsQRModalOpen(true)}
          className="support-card group"
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
          className="support-card group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="support-title">Trading Session Date</div>
          <div className="support-desc">Active: {activeSessionDate || '2026-09-22'}</div>
        </button>

        <button
          type="button"
          id="support-settings-btn"
          onClick={() => setIsSettingsOpen(true)}
          className="support-card group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a3a52]/5 text-[#1a3a52] group-hover:bg-[#1a3a52] group-hover:text-white transition flex items-center justify-center mb-1">
            <Settings className="w-6 h-6" />
          </div>
          <div className="support-title">Commission &amp; Mandi Rules</div>
          <div className="support-desc">Hamali, APMC cess &amp; deductions</div>
        </button>

        <a
          href="tel:18004251666"
          id="support-helpline-link"
          className="support-card group text-inherit no-underline"
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
          Language / భాష
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
            తెలుగు (Telugu)
          </button>
          <button
            type="button"
            id="lang-select-hi"
            onClick={() => setLanguage('hi')}
            className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
          >
            हिंदी (Hindi)
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
    </div>
  );
};
export default SupportView;
