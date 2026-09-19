import React, { useState } from 'react';
import {
  X,
  Store,
  Calendar,
  Save,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw,
  Check,
  Languages,
  User,
  ShieldCheck,
  AlertCircle,
  Printer,
  History,
  Cloud,
  Database,
  RefreshCw,
  CheckCircle2,
  Loader2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { useFirebase } from '../../context/FirebaseContext';
import { Language, CommodityCategory } from '../../types';
import { getTodayDateString, COMMODITY_CONFIGS } from '../../data/initialData';
import { PhotoUploadPicker } from '../common/PhotoUploadPicker';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { sounds } from '../../utils/audio';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    setIsOwnerSignUpOpen,
    merchantProfile,
    updateMerchantProfile,
    currentUserPhone,
    checkUniqueness,
    language,
    setLanguage,
    userCommodities,
    setUserCommodities,
    activeSessionDate,
    setActiveSessionDate,
    autoRemoveParchiAfterPrint,
    setAutoRemoveParchiAfterPrint,
    parchiAuditLogs,
    setIsAuditTrailOpen,
    exportBackupJSON,
    importBackupJSON,
    farmers,
    lots,
    shipments,
    payments,
    settlements,
    helpTickets,
    resetAllData,
    clearTodayLotsForTesting,
    t,
  } = useMandi();

  const {
    user: firebaseUser,
    isFirebaseConnected,
    isSyncing,
    autoSaveStatus,
    isAutoSyncEnabled,
    setIsAutoSyncEnabled,
    lastSyncedAt,
    syncError,
    signInWithGoogle,
    signOut: signOutGoogle,
    syncDataToCloud,
    loadDataFromCloud,
  } = useFirebase();

  const [cloudMsg, setCloudMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCloudBackup = async () => {
    if (!firebaseUser) {
      setCloudMsg({ type: 'error', text: 'Please sign in with Google first' });
      return;
    }
    setCloudMsg(null);
    const success = await syncDataToCloud({
      profile: merchantProfile,
      farmers,
      lots,
      shipments,
      payments,
      settlements,
      helpTickets,
    });
    if (success) {
      setCloudMsg({ type: 'success', text: 'Successfully backed up all records to Firestore!' });
      setTimeout(() => setCloudMsg(null), 4000);
    } else {
      setCloudMsg({ type: 'error', text: syncError || 'Failed to sync to Firebase Firestore' });
    }
  };

  const handleCloudRestore = async () => {
    if (!firebaseUser) {
      setCloudMsg({ type: 'error', text: 'Please sign in with Google first' });
      return;
    }
    if (!window.confirm('Restore records from Cloud Firestore? This will merge and update your local ledger.')) {
      return;
    }
    setCloudMsg(null);
    const cloudData = await loadDataFromCloud();
    if (!cloudData) {
      setCloudMsg({ type: 'error', text: 'No cloud records found or error reading Firestore' });
      return;
    }

    importBackupJSON(JSON.stringify(cloudData));
    setCloudMsg({ type: 'success', text: 'Successfully restored and updated data from Firestore!' });
    setTimeout(() => setCloudMsg(null), 4000);
  };

  const [formData, setFormData] = useState({
    ...merchantProfile,
    ownerName: merchantProfile.ownerName || '',
    photoUrl: merchantProfile.photoUrl || '',
  });
  const [selectedComms, setSelectedComms] = useState<CommodityCategory[]>(userCommodities);
  const [tempDate, setTempDate] = useState(activeSessionDate);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importError, setImportError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedComms.length === 0) {
      setValidationError('Please select at least one commodity category');
      return;
    }

    if (!formData.shopName.trim()) {
      setValidationError('Shop name is required');
      return;
    }

    if (formData.ownerName && /[0-9]/.test(formData.ownerName)) {
      setValidationError(language === 'te' ? 'యజమాని పేరులో అంకెలు ఉండకూడదు' : 'Owner name cannot contain numbers');
      return;
    }

    const cleanPhone = formData.phoneNumber.replace(/\D/g, '').slice(-10);
    if (formData.phoneNumber && cleanPhone.length !== 10) {
      setValidationError('Phone number must contain only numbers (exactly 10 digits)');
      return;
    }
    if (!formData.address.trim()) {
      setValidationError('Shop address is required');
      return;
    }

    // Verify uniqueness of shop name & address
    const uniqueness = checkUniqueness({
      shopName: formData.shopName.trim(),
      shopAddress: formData.address.trim(),
      excludePhone: currentUserPhone,
    });

    if (!uniqueness.valid) {
      setValidationError(uniqueness.message || 'Shop name and address must be unique');
      return;
    }

    setValidationError('');
    updateMerchantProfile(formData);
    setUserCommodities(selectedComms);
    setActiveSessionDate(tempDate);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          alert('Backup restored successfully!');
          setIsSettingsOpen(false);
        } else {
          setImportError('Invalid JSON format or corrupted backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    resetAllData();
    sounds.playTrashSound?.();
    setIsResetConfirmOpen(false);
    setIsSettingsOpen(false);
  };

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[#FFFFFF] rounded-2xl max-w-xl w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-[#2E6349] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#DD9F2F]" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {t('settingsTitle')}
              </h3>
              <p className="text-[11px] text-white/80">{t('settingsSubtitle')}</p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#FCFBF9]">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Merchant profile and session settings saved!</span>
            </div>
          )}

          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Merchant Profile */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5">
                <Store className="w-4 h-4" />
                <span>Adathiya Shop & Owner Profile</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsOwnerSignUpOpen(true);
                }}
                className="text-[11px] font-bold text-[#2E6349] hover:underline flex items-center gap-1"
              >
                <span>Full Owner Sign-Up</span>
              </button>
            </div>

            {/* Photo of Owner */}
            <PhotoUploadPicker
              label={language === 'te' ? 'యజమాని ఫోటో' : 'Photo of Owner'}
              sublabel="Official photo for merchant registry, parchi prints, and farmer passbooks"
              currentPhotoUrl={formData.photoUrl}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              presetType="owner"
              idPrefix="settings-owner"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {language === 'te' ? 'యజమాని పూర్తి పేరు' : 'Owner Full Name'}
                </label>
                <input
                  id="setting-owner-name-input"
                  type="text"
                  required
                  placeholder="e.g. Ravi Kumar Reddy"
                  value={formData.ownerName}
                  onKeyDown={(e) => {
                    if (/[0-9]/.test(e.key)) {
                      e.preventDefault();
                      setValidationError(language === 'te' ? 'యజమాని పేరులో అంకెలు ఉండకూడదు' : 'Owner name cannot contain numbers');
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const clean = e.clipboardData.getData('text').replace(/[0-9]/g, '');
                    setFormData({ ...formData, ownerName: clean });
                    setValidationError('');
                  }}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[0-9]/g, '');
                    setFormData({ ...formData, ownerName: clean });
                    setValidationError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('shopName')} *
                </label>
                <input
                  id="setting-shop-name-input"
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => {
                    setFormData({ ...formData, shopName: e.target.value });
                    setValidationError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
                <span className="text-[10px] text-[#6B5E57] mt-0.5 block">
                  Must be unique across all shops
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('shopNumber')}
                </label>
                <input
                  id="setting-shop-number-input"
                  type="text"
                  required
                  value={formData.shopNumber}
                  onChange={(e) => setFormData({ ...formData, shopNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('apmcMarketName')}
                </label>
                <input
                  id="setting-market-name-input"
                  type="text"
                  required
                  value={formData.apmcMarketName}
                  onChange={(e) => setFormData({ ...formData, apmcMarketName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('merchantPhone')} (10 digits, numbers only)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs font-bold text-[#6B5E57] border-r border-[#E8E2D9] pr-2 pointer-events-none">
                    +91
                  </span>
                  <input
                    id="setting-phone-input"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    value={formData.phoneNumber.replace(/\D/g, '').slice(-10)}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        e.key !== 'Backspace' &&
                        e.key !== 'Delete' &&
                        e.key !== 'ArrowLeft' &&
                        e.key !== 'ArrowRight' &&
                        e.key !== 'Tab' &&
                        e.key !== 'Enter'
                      ) {
                        e.preventDefault();
                        setValidationError(language === 'te' ? 'ఫోన్ నంబరులో అంకెలు మాత్రమే ఉండాలి' : 'Phone number can only contain numbers');
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const clean = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phoneNumber: clean });
                      setValidationError('');
                    }}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phoneNumber: clean });
                      setValidationError('');
                    }}
                    className="w-full pl-12 pr-3 py-2 rounded-lg border border-[#E8E2D9] text-xs font-mono font-bold focus:outline-hidden focus:border-[#2E6349] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('defaultCommissionRate')}
                </label>
                <div className="relative">
                  <input
                    id="setting-commission-input"
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    required
                    value={formData.defaultCommissionRate ?? 4}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultCommissionRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-500 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('defaultExpenditureRate')}
                </label>
                <div className="relative">
                  <input
                    id="setting-expenditure-input"
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    required
                    value={formData.defaultExpenditureRate ?? 6}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultExpenditureRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-500 font-bold">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                {t('shopAddress')} *
              </label>
              <input
                id="setting-address-input"
                type="text"
                required
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  setValidationError('');
                }}
                className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white"
              />
              <span className="text-[10px] text-[#6B5E57] mt-0.5 block">
                Cannot match another shop address
              </span>
            </div>
          </div>

          {/* Section 2: Selected Commodities You Work With */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8E2D9] shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5">
                <span>🌾</span>
                <span>Commodities Handled ({selectedComms.length} selected)</span>
              </h4>
              <span className="text-[10px] text-[#6B5E57]">
                Controls commodity options across tracker & sales
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['flowers', 'grains', 'vegetables', 'fruits'] as CommodityCategory[]).map((cat) => {
                const cfg = COMMODITY_CONFIGS[cat];
                const isChecked = selectedComms.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      if (isChecked) {
                        if (selectedComms.length === 1) return; // Keep at least one
                        setSelectedComms((prev) => prev.filter((c) => c !== cat));
                      } else {
                        setSelectedComms((prev) => [...prev, cat]);
                      }
                    }}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      isChecked
                        ? 'bg-[#2E6349] text-white border-[#2E6349] shadow-sm'
                        : 'bg-[#FCFBF9] hover:bg-[#F4EFEA] text-[#2A1F1A] border-[#E8E2D9]'
                    }`}
                  >
                    <span className="text-xl">{cfg.icon}</span>
                    <span className="font-bold">{cfg.name}</span>
                    <span className="text-[10px] opacity-80">
                      {isChecked ? '✓ Selected' : '+ Add'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#6B5E57]">
              Tip: If you only select one commodity (e.g., Flowers), the Multi-Commodity Tracker and Consignment entries will be strictly locked to that commodity without any switching options.
            </p>
          </div>

          {/* Section 3: Language & Active Session Date */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5 border-b border-[#E8E2D9] pb-2">
              <Languages className="w-4 h-4" />
              <span>Language & Mandi Trading Session Date</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {language === 'te' ? 'ఇంటర్‌ఫేస్ భాష' : 'Interface Language'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('te')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      language === 'te'
                        ? 'bg-[#2E6349] text-white border-[#2E6349]'
                        : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#FCFBF9]'
                    }`}
                  >
                    తెలుగు
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      language === 'hi'
                        ? 'bg-[#2E6349] text-white border-[#2E6349]'
                        : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#FCFBF9]'
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      language === 'en'
                        ? 'bg-[#2E6349] text-white border-[#2E6349]'
                        : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#FCFBF9]'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('activeDate')} (Live Session)
                </label>
                <input
                  id="setting-date-input"
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
                <button
                  type="button"
                  onClick={() => setTempDate(getTodayDateString())}
                  className="mt-1 text-[11px] text-[#2E6349] font-medium hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to today ({getTodayDateString()})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Printing & Parchi Workflow */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                <span>{t('removeParchiAfterPrint')}</span>
              </h4>
              {parchiAuditLogs.length > 0 && (
                <button
                  type="button"
                  id="view-audit-trail-settings-btn"
                  onClick={() => setIsAuditTrailOpen(true)}
                  className="text-[11px] font-bold text-[#2E6349] hover:underline flex items-center gap-1 bg-[#2E6349]/10 px-2.5 py-1 rounded-md transition"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{t('viewAuditTrail')} ({parchiAuditLogs.length})</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2A1F1A]">
                    {t('autoRemoveToggleLabel')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      autoRemoveParchiAfterPrint
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {autoRemoveParchiAfterPrint ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B5E57] max-w-xl leading-relaxed">
                  {t('removeParchiAfterPrintDesc')}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  id="auto-remove-parchi-toggle"
                  type="checkbox"
                  checked={autoRemoveParchiAfterPrint}
                  onChange={(e) => setAutoRemoveParchiAfterPrint(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E6349]"></div>
              </label>
            </div>
          </div>

          {/* Section: Firebase Cloud Storage & Database */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-[#2E6349]" />
                <span>Firebase Cloud Database & Sync (Firestore)</span>
              </h4>
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#E9F3EE] text-[#2E6349] font-semibold">
                <Database className="w-3 h-3" />
                <span>phoolmitra-flower-mandi</span>
              </span>
            </div>

            {/* Cloud Status Info */}
            <div className="p-3.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2A1F1A]">
                      Cloud Status:
                    </span>
                    {isFirebaseConnected ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected (asia-southeast1)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        Connecting...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B5E57]">
                    {firebaseUser ? (
                      <span>
                        Authenticated with Google as <strong className="text-[#2A1F1A]">{firebaseUser.displayName || firebaseUser.email}</strong>
                      </span>
                    ) : (
                      <span>Sign in with Google to securely backup your Mandi lots and farmer accounts to Google Cloud Firestore.</span>
                    )}
                  </p>
                  {lastSyncedAt && (
                    <p className="text-[10px] text-[#2E6349] font-medium">
                      Last cloud sync: {lastSyncedAt}
                    </p>
                  )}
                </div>

                {/* Google Sign In / Sign Out Button */}
                <div>
                  {firebaseUser ? (
                    <button
                      type="button"
                      id="firebase-signout-btn"
                      onClick={() => signOutGoogle()}
                      className="px-3 py-1.5 rounded-lg border border-[#E8E2D9] bg-white text-stone-700 hover:bg-stone-50 text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="firebase-signin-btn"
                      onClick={() => signInWithGoogle()}
                      className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#DD9F2F]" />
                      <span>Sign In with Google</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Automatic Cloud Sync Toggle & Real-time Indicator */}
              <div className="p-3 rounded-lg bg-white border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2A1F1A]">
                      Automatic Real-Time Cloud Sync
                    </span>
                    {autoSaveStatus === 'saving' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Syncing to Firestore...
                      </span>
                    ) : autoSaveStatus === 'saved' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Saved to Cloud
                      </span>
                    ) : isAutoSyncEnabled && firebaseUser ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active & Always Synced
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        Manual Backup Only
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B5E57]">
                    Instantly synchronizes all farmers, auction lots, payments, and settlements to Firebase Firestore whenever you make changes.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    id="toggle-auto-cloud-sync"
                    checked={isAutoSyncEnabled}
                    onChange={(e) => setIsAutoSyncEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E6349]"></div>
                </label>
              </div>

              {cloudMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    cloudMsg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {cloudMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{cloudMsg.text}</span>
                </div>
              )}

              {/* Sync Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E8E2D9]/60">
                <button
                  type="button"
                  id="backup-to-cloud-btn"
                  onClick={handleCloudBackup}
                  disabled={isSyncing || !firebaseUser}
                  className="px-3.5 py-2 rounded-lg bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] disabled:opacity-50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {isSyncing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Cloud className="w-3.5 h-3.5 text-[#DD9F2F]" />
                  )}
                  <span>{isSyncing ? 'Syncing...' : 'Backup All Data to Cloud'}</span>
                </button>

                <button
                  type="button"
                  id="restore-from-cloud-btn"
                  onClick={handleCloudRestore}
                  disabled={isSyncing || !firebaseUser}
                  className="px-3.5 py-2 rounded-lg bg-white border border-[#E8E2D9] text-[#2A1F1A] text-xs font-semibold hover:bg-[#F4EFEA] disabled:opacity-50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#2E6349] ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Restore from Cloud</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Backup, Export & Reset */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5 border-b border-[#E8E2D9] pb-2">
              <Download className="w-4 h-4" />
              <span>{t('backupExportSection')}</span>
            </h4>

            {importError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                id="export-backup-btn"
                onClick={exportBackupJSON}
                className="px-3.5 py-2 rounded-lg bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-semibold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#2E6349]" />
                <span>{t('exportJSON')}</span>
              </button>

              <label
                htmlFor="import-backup-file"
                className="px-3.5 py-2 rounded-lg bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-semibold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-[#DD9F2F]" />
                <span>{t('importJSON')}</span>
                <input
                  id="import-backup-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                id="reset-ledger-btn"
                onClick={handleReset}
                className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition flex items-center gap-1.5 ml-auto"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('resetLedger')}</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              id="cancel-settings-btn"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A] hover:bg-[#FCFBF9]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              id="save-settings-btn"
              className="px-5 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('saveSettings')}</span>
            </button>
          </div>
        </form>
      </div>

      <DeleteConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All Mandi Ledger Data"
        itemName="All Merchant Data, Farmers & Transactions"
        itemDetails="This will reset all current session lots, custom farmer additions, payments, and generated reports back to default state."
        message="Are you sure you want to delete all current ledger data? This action is permanent."
        confirmText="CONFIRM DELETE & RESET"
        cancelText="CANCEL"
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
