import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Phone,
  MapPin,
  Check,
  Flower2,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { PhotoUploadPicker } from '../common/PhotoUploadPicker';
import { flowerVarietiesData } from '../../translations';
import { Farmer } from '../../types';

interface FarmerSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newFarmer: Farmer) => void;
}

export const FarmerSignUpModal: React.FC<FarmerSignUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addFarmer, merchantProfile, language, t } = useMandi();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [crops, setCrops] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const toggleCrop = (cropName: string) => {
    if (crops.includes(cropName)) {
      setCrops(crops.filter((c) => c !== cropName));
    } else {
      setCrops([...crops, cropName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Farmer name is required');
      return;
    }

    if (/[0-9]/.test(name)) {
      setErrorMessage(language === 'te' ? 'రైతు పేరులో అంకెలు ఉండకూడదు' : 'Farmer name cannot contain numbers');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Phone number must contain only numbers (exactly 10 digits)');
      return;
    }

    setErrorMessage('');
    const newFarmer = addFarmer({
      name: name.trim(),
      phone: cleanPhone,
      village: village.trim() || 'Local Flower Belt',
      primaryCrops: crops,
      connectedMerchantIds: [merchantProfile.merchantId],
      photoUrl: photoUrl.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSuccess?.(newFarmer);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="farmer-signup-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[#FFFFFF] rounded-2xl max-w-xl w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-[#2E6349] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#DD9F2F]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  Farmer Sign Up & Mandi Khata Registration
                </h3>
                {language === 'te' && (
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#DD9F2F] text-[#2A1F1A]">
                    రైతు నమోదు
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/80">
                Register grower identity with photo for transparent digital auctions and passbook
              </p>
            </div>
          </div>
          <button
            id="close-farmer-signup-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#FCFBF9]">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Farmer registered successfully with photo and added to Mandi Khata!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
              <span className="text-rose-600 font-bold">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Photo of Farmer */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{language === 'te' ? 'దశ 1: రైతు ఫోటో' : 'Step 1: Photo of Farmer'}</span>
              </span>
            </div>

            <PhotoUploadPicker
              label="Farmer Profile Photo"
              sublabel="Upload photo from phone/PC, snap live with webcam, or choose an authentic portrait"
              currentPhotoUrl={photoUrl}
              onChange={(url) => setPhotoUrl(url)}
              presetType="farmer"
              idPrefix="farmer-signup"
            />
          </div>

          {/* 2. Farmer Personal Details */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5 border-b border-[#E8E2D9] pb-2">
              <UserPlus className="w-4 h-4" />
              <span>Step 2: Farmer Particulars</span>
            </span>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {language === 'te' ? 'రైతు పూర్తి పేరు *' : 'Farmer Full Name *'}
                </label>
                <input
                  id="farmer-signup-name-input"
                  type="text"
                  required
                  placeholder="e.g., Ramesh Reddy (letters only)"
                  value={name}
                  onKeyDown={(e) => {
                    if (/[0-9]/.test(e.key)) {
                      e.preventDefault();
                      setErrorMessage(language === 'te' ? 'రైతు పేరులో అంకెలు ఉండకూడదు' : 'Farmer name cannot contain numbers');
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text').replace(/[0-9]/g, '');
                    if (/[0-9]/.test(e.clipboardData.getData('text'))) {
                      setErrorMessage(language === 'te' ? 'రైతు పేరులో అంకెలు ఉండకూడదు' : 'Farmer name cannot contain numbers');
                    }
                    setName(text);
                  }}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/[0-9]/g, '');
                    setName(filtered);
                    if (/[0-9]/.test(e.target.value)) {
                      setErrorMessage(language === 'te' ? 'రైతు పేరులో అంకెలు ఉండకూడదు' : 'Farmer name cannot contain numbers');
                    } else {
                      setErrorMessage('');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                    Mobile / WhatsApp Number * (Numbers only)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs font-bold text-[#6B5E57] border-r border-[#E8E2D9] pr-2 pointer-events-none">
                      +91
                    </span>
                    <input
                      id="farmer-signup-phone-input"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      required
                      placeholder="9848123456"
                      value={phone}
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
                          setErrorMessage(language === 'te' ? 'ఫోన్ నంబరులో అంకెలు మాత్రమే ఉండాలి' : 'Phone number can only contain numbers');
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const clean = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 10);
                        setPhone(clean);
                        setErrorMessage('');
                      }}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(clean);
                        setErrorMessage('');
                      }}
                      className="w-full pl-12 pr-3 py-2 rounded-lg border border-[#E8E2D9] text-xs font-mono font-bold focus:outline-hidden focus:border-[#2E6349] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                    Village / Mandal / District *
                  </label>
                  <input
                    id="farmer-signup-village-input"
                    type="text"
                    required
                    placeholder="e.g., Shamshabad, R.R. Dist"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Primary Crops Grown */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5">
              <Flower2 className="w-4 h-4" />
              <span>Step 3: Primary Flower Crops Cultivated</span>
            </span>
            <p className="text-[11px] text-[#6B5E57]">
              Select flower varieties brought to the mandi yard:
            </p>

            <div className="flex flex-wrap gap-2">
              {flowerVarietiesData.map((flower) => {
                const label = language === 'te' ? flower.te : language === 'hi' ? flower.hi : flower.en;
                const isSelected = crops.includes(flower.en);
                return (
                  <button
                    key={flower.id}
                    type="button"
                    onClick={() => toggleCrop(flower.en)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#2E6349] text-white shadow-2xs'
                        : 'bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: flower.color }}
                    />
                    <span>{label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 text-[#DD9F2F]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Live Farmer Badge Preview */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2E6349] bg-[#FCFBF9] shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name || 'Farmer'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6B5E57]">
                  <User className="w-5 h-5 text-[#2E6349]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#2A1F1A] truncate">
                  {name || 'Farmer Name'}
                </span>
                <span className="px-1.5 py-0.2 bg-[#E9F3EE] text-[#2E6349] text-[10px] font-bold rounded">
                  New Member
                </span>
              </div>
              <div className="text-[11px] text-[#6B5E57] flex items-center gap-2">
                <span>📍 {village || 'Village Area'}</span>
                <span>•</span>
                <span>📞 {phone || 'Phone'}</span>
              </div>
              <div className="text-[10px] text-[#2E6349] font-medium mt-0.5 truncate">
                Crops: {crops.join(', ')}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E2D9]">
            <button
              type="button"
              id="farmer-signup-cancel-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#6B5E57] hover:bg-[#F4EFEA] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="save-farmer-signup-btn"
              className="px-6 py-2.5 rounded-xl bg-[#2E6349] text-white font-black text-xs hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-md hover:shadow-lg"
            >
              <Check className="w-4 h-4 text-[#DD9F2F]" />
              <span>Complete Farmer Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
