import React, { useState } from 'react';
import {
  X,
  Store,
  ShieldCheck,
  Check,
  Sparkles,
  Phone,
  MapPin,
  FileBadge,
  Percent,
  User,
  AlertCircle,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { PhotoUploadPicker } from '../common/PhotoUploadPicker';

interface OwnerSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerSignUpModal: React.FC<OwnerSignUpModalProps> = ({ isOpen, onClose }) => {
  const { merchantProfile, updateMerchantProfile, checkUniqueness, currentUserPhone, t } = useMandi();

  const [formData, setFormData] = useState({
    ownerName: merchantProfile.ownerName || 'Ravi Kumar Reddy',
    photoUrl:
      merchantProfile.photoUrl ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    shopName: merchantProfile.shopName || '',
    shopNumber: merchantProfile.shopNumber || '',
    apmcMarketName: merchantProfile.apmcMarketName || '',
    phoneNumber: merchantProfile.phoneNumber || '',
    defaultCommissionRate: merchantProfile.defaultCommissionRate || 10,
    address: merchantProfile.address || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shopName.trim()) {
      setErrorMessage('Shop name is required');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Shop address is required');
      return;
    }

    // Verify uniqueness of shop name & address against other accounts
    const uniqueness = checkUniqueness({
      shopName: formData.shopName.trim(),
      shopAddress: formData.address.trim(),
      excludePhone: currentUserPhone,
    });

    if (!uniqueness.valid) {
      setErrorMessage(uniqueness.message || 'Shop name or address must be unique');
      return;
    }

    setErrorMessage('');
    updateMerchantProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleFillSample = () => {
    setFormData({
      ownerName: 'Ravi Kumar Reddy',
      photoUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      shopName: 'Ravi Flowers (Sri Venkateshwara Florals)',
      shopNumber: 'Shop No. 27, Gate #3',
      apmcMarketName: 'Gudimalkapur Wholesale Flower Market',
      phoneNumber: '+91 98490 12345',
      defaultCommissionRate: 10,
      address: 'APMC Market Yard, Gudimalkapur, Mehdipatnam, Hyderabad, Telangana - 500028',
    });
    setErrorMessage('');
  };

  return (
    <div
      id="owner-signup-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#2E6349] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#DD9F2F]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  APMC Shop Owner Sign Up & Profile
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#DD9F2F] text-[#2A1F1A]">
                  Adathiya
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                Register shop owner identity, photo, shop details & commission rules
              </p>
            </div>
          </div>
          <button
            id="close-owner-signup-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#FCFBF9]">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Owner profile and photo saved successfully!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Photo of Owner */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Step 1: Photo of Owner (యజమాని ఫోటో)</span>
              </span>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-[11px] font-bold text-[#2E6349] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#DD9F2F]" />
                <span>Fill Sample Owner</span>
              </button>
            </div>

            <PhotoUploadPicker
              label="Shop Owner Profile Photo"
              sublabel="Upload from files, capture live with camera, or select a realistic sample avatar"
              currentPhotoUrl={formData.photoUrl}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              presetType="owner"
              idPrefix="owner-signup"
            />
          </div>

          {/* 2. Owner & Shop Identity */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5 border-b border-[#E8E2D9] pb-2">
              <Store className="w-4 h-4" />
              <span>Step 2: Owner & Mandi Firm Details</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  Owner Full Name (యజమాని పేరు) *
                </label>
                <input
                  id="owner-signup-name-input"
                  type="text"
                  required
                  placeholder="e.g., Ravi Kumar Reddy"
                  value={formData.ownerName}
                  onChange={(e) => {
                    setFormData({ ...formData, ownerName: e.target.value });
                    setErrorMessage('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  Owner Mobile / WhatsApp Number *
                </label>
                <input
                  id="owner-signup-phone-input"
                  type="text"
                  required
                  placeholder="+91 98490 12345"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneNumber: e.target.value });
                    setErrorMessage('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  Shop / Firm Name (దుకాణం పేరు) *
                </label>
                <input
                  id="owner-signup-shop-name-input"
                  type="text"
                  required
                  placeholder="e.g., Ravi Flowers"
                  value={formData.shopName}
                  onChange={(e) => {
                    setFormData({ ...formData, shopName: e.target.value });
                    setErrorMessage('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
                <span className="text-[10px] text-[#6B5E57] mt-0.5 block">
                  Must be unique across all mandi shops
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  Shop / Stall Number & Gate *
                </label>
                <input
                  id="owner-signup-shop-number-input"
                  type="text"
                  required
                  placeholder="e.g., Shop No. 27, Gate #3"
                  value={formData.shopNumber}
                  onChange={(e) => setFormData({ ...formData, shopNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  APMC Market Yard Name *
                </label>
                <input
                  id="owner-signup-market-input"
                  type="text"
                  required
                  placeholder="e.g., Gudimalkapur Wholesale Flower Market"
                  value={formData.apmcMarketName}
                  onChange={(e) => setFormData({ ...formData, apmcMarketName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  Default Mandi Commission Rate (%) *
                </label>
                <div className="relative">
                  <input
                    id="owner-signup-commission-input"
                    type="number"
                    min="1"
                    max="25"
                    step="0.5"
                    required
                    value={formData.defaultCommissionRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultCommissionRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-500 font-bold">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                Shop / Yard Physical Address *
              </label>
              <input
                id="owner-signup-address-input"
                type="text"
                required
                placeholder="Full address in APMC Market Yard"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  setErrorMessage('');
                }}
                className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
              />
              <span className="text-[10px] text-[#6B5E57] mt-0.5 block">
                Cannot be identical to any other registered shop address
              </span>
            </div>
          </div>

          {/* 3. Live Owner ID Card Badge Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2E6349] to-[#1F4532] text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-white/15 pb-2">
              <span className="uppercase font-bold tracking-wider text-[#DD9F2F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>APMC Adathiya Merchant ID Card Preview</span>
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                {merchantProfile.merchantId}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#DD9F2F] bg-white/10 shrink-0">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt={formData.ownerName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#DD9F2F]">
                  {formData.shopName || 'Shop Name'}
                </h4>
                <p className="text-xs text-white/90 font-medium">
                  {formData.ownerName || 'Owner Name'}
                </p>
                <div className="text-[11px] text-white/70 font-mono mt-0.5">
                  {formData.shopNumber} • {formData.phoneNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E2D9]">
            <button
              type="button"
              id="cancel-owner-signup-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A] hover:bg-[#FCFBF9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-owner-signup-btn"
              className="px-5 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4 text-[#DD9F2F]" />
              <span>Save & Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
