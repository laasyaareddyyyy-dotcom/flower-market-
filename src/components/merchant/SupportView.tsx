import React from 'react';
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
    currentUserPhone,
  } = useMandi();

  const { user: firebaseUser } = useFirebase();

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1>Support &amp; Services</h1>
          <p>Help, tools, and quick services</p>
        </div>
        {merchantProfile && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#e5e7eb] text-xs text-[#1a3a52] font-semibold shadow-2xs">
              <span>🏪</span>
              <span>{merchantProfile.shopName || 'PhoolMitra Wholesale'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-500 font-normal">
                {firebaseUser ? 'Cloud Connected' : 'Offline Storage'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Support Services Grid */}
      <div className="support-grid">
        <button
          type="button"
          id="support-open-helpdesk-btn"
          onClick={openHelpDesk}
          className="support-card"
        >
          <div className="support-icon">🎧</div>
          <div className="support-title">AI Support Help Desk</div>
          <div className="support-desc">Instant mandi assistant &amp; tickets</div>
        </button>

        <button
          type="button"
          id="support-add-farmer-btn"
          onClick={() => setIsFarmerSignUpOpen(true)}
          className="support-card"
        >
          <div className="support-icon">👤</div>
          <div className="support-title">Register New Farmer</div>
          <div className="support-desc">Add grower profile &amp; passbook</div>
        </button>

        <button
          type="button"
          id="support-qr-btn"
          onClick={() => setIsQRModalOpen(true)}
          className="support-card"
        >
          <div className="support-icon">📋</div>
          <div className="support-title">Farmer QR &amp; APMC Pass</div>
          <div className="support-desc">Scan &amp; share digital receipt ID</div>
        </button>

        <button
          type="button"
          id="support-dateswitcher-btn"
          onClick={() => setIsDateSwitcherOpen(true)}
          className="support-card"
        >
          <div className="support-icon">📅</div>
          <div className="support-title">Trading Session Date</div>
          <div className="support-desc">Active: {activeSessionDate || '2026-09-22'}</div>
        </button>
      </div>

      {/* Rules & Information Section */}
      <div className="info-section">
        <button
          type="button"
          id="support-settings-btn"
          onClick={() => setIsSettingsOpen(true)}
          className="info-card text-left cursor-pointer"
        >
          <div className="info-icon">⚙️</div>
          <div>
            <h3>Commission &amp; Mandi Rules</h3>
            <p>Hamali, APMC cess &amp; deductions</p>
          </div>
        </button>

        <a
          href="tel:18004251666"
          id="support-helpline-link"
          className="info-card text-left"
        >
          <div className="info-icon">📞</div>
          <div>
            <h3>APMC Market Helpline</h3>
            <p>Toll-Free: 1800-425-1666</p>
          </div>
        </a>
      </div>

      {/* Language Selector */}
      <div className="language-section">
        <h3 style={{ fontSize: '12px', color: 'var(--neutral)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700 }}>
          Language / भाषा
        </h3>
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
        <span style={{ fontSize: '18px' }}>🚪</span>
        <span>Log Out of Session</span>
      </button>
    </div>
  );
};
export default SupportView;
