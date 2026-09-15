import React, { useState, useMemo, useEffect } from 'react';
import {
  Receipt,
  Search,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Coins,
  CheckCircle2,
  Printer,
  Sparkles,
  Calculator,
  Plus,
  ArrowRight,
  Info,
  Calendar,
  Trash2,
  Clock,
  RotateCcw,
  Wallet,
  Banknote,
  Smartphone,
  QrCode,
  Building,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { WeightUnit, PaymentStatus, PaymentMode, Expenditures, FlowerQuality } from '../../types';
import { flowerVarietiesData } from '../../translations';
import {
  formatDisplayDate,
  getTodayDateString,
  getPastDateString,
} from '../../data/initialData';
import { PhotoUploadPicker } from '../common/PhotoUploadPicker';
import { User, Scale, Sliders } from 'lucide-react';
import { DigitalWeighingScale } from '../interactive/DigitalWeighingScale';
import { InteractiveRateCalculator } from '../interactive/InteractiveRateCalculator';
import { sounds, speakParchiDetails } from '../../utils/audio';

export const NewSaleView: React.FC = () => {
  const {
    farmers,
    addFarmer,
    addSaleLot,
    deleteSaleLot,
    lots,
    setSelectedParchiLot,
    merchantProfile,
    activeSessionDate,
    setActiveSessionDate,
    setIsDateSwitcherOpen,
    setMerchantTab,
    language,
    t,
  } = useMandi();

  // Trading Date for this consignment entry (defaults to active session date)
  const [saleDate, setSaleDate] = useState<string>(activeSessionDate);

  useEffect(() => {
    setSaleDate(activeSessionDate);
  }, [activeSessionDate]);

  // Form State
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(farmers[0]?.id || '');
  const [farmerSearch, setFarmerSearch] = useState<string>('');
  const [isFarmerDropdownOpen, setIsFarmerDropdownOpen] = useState(false);
  const [showInlineAddFarmer, setShowInlineAddFarmer] = useState(false);

  // New Inline Farmer Form State
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerPhone, setNewFarmerPhone] = useState('');
  const [newFarmerVillage, setNewFarmerVillage] = useState('');
  const [newFarmerPhotoUrl, setNewFarmerPhotoUrl] = useState('');

  // Consignment Details
  const [flowerVariety, setFlowerVariety] = useState<string>('Marigold (Banthi)');
  const [customVarietyInput, setCustomVarietyInput] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>(50);
  const [boxesCount, setBoxesCount] = useState<number | ''>('');
  const [flowerQuality, setFlowerQuality] = useState<FlowerQuality>('Good');
  const [unit, setUnit] = useState<WeightUnit>('Kgs');
  const [rate, setRate] = useState<number | ''>(60);
  const [commissionPercent, setCommissionPercent] = useState<number>(
    merchantProfile.defaultCommissionRate ?? 4
  );

  // Interactive Tools State
  const [showDigitalScale, setShowDigitalScale] = useState<boolean>(false);
  const [showRateNegotiator, setShowRateNegotiator] = useState<boolean>(false);

  // Deductions State: Transport Expense, Other Expenditures (default 6%), Ammali
  const [isExpendituresExpanded, setIsExpendituresExpanded] = useState<boolean>(true);
  const [ammaliCharge, setAmmaliCharge] = useState<number | ''>('');
  const [transportCharge, setTransportCharge] = useState<number | ''>('');
  const [miscPercent, setMiscPercent] = useState<number>(
    merchantProfile.defaultExpenditureRate ?? 6
  );
  const [miscNote, setMiscNote] = useState<string>('');

  // Payment Options & Settlement State
  const [paymentChoice, setPaymentChoice] = useState<'pay_now' | 'pay_later'>('pay_now');
  const [payPortion, setPayPortion] = useState<'full' | 'partial'>('full');
  const [amountPaidNow, setAmountPaidNow] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Selected Farmer details
  const selectedFarmer = farmers.find((f) => f.id === selectedFarmerId);

  // Real-time Calculations
  const numericQuantity = typeof quantity === 'number' ? quantity : 0;
  const numericBoxes = typeof boxesCount === 'number' ? boxesCount : 0;
  const numericRate = typeof rate === 'number' ? rate : 0;
  const numericAmmali = typeof ammaliCharge === 'number' ? ammaliCharge : 0;
  const numericTransport = typeof transportCharge === 'number' ? transportCharge : 0;

  const grossTotal = useMemo(() => {
    return Math.round(numericQuantity * numericRate);
  }, [numericQuantity, numericRate]);

  // 1. Merchant Commission
  const commissionAmount = useMemo(() => {
    return Math.round(grossTotal * (commissionPercent / 100));
  }, [grossTotal, commissionPercent]);

  // Amount after commission
  const amountAfterCommission = useMemo(() => {
    return Math.max(0, grossTotal - commissionAmount);
  }, [grossTotal, commissionAmount]);

  // Miscellaneous Percentage (if applicable)
  const miscAmount = useMemo(() => {
    return Math.round(grossTotal * (miscPercent / 100));
  }, [grossTotal, miscPercent]);

  // Total other expenditures: Ammali + Transport + Misc
  const totalOtherExpenditures = useMemo(() => {
    return numericAmmali + numericTransport + miscAmount;
  }, [numericAmmali, numericTransport, miscAmount]);

  // Total deductions: Commission (default 4%) + Other Expenditures (default 6%) + Transport Expense + Ammali
  const totalDeductions = useMemo(() => {
    return commissionAmount + miscAmount + numericTransport + numericAmmali;
  }, [commissionAmount, miscAmount, numericTransport, numericAmmali]);

  // Net Amount Payable to Farmer:
  // Gross Amount − Transport Expense − Commission − Other Expenditure (− Ammali)
  const farmerNetPayable = useMemo(() => {
    const afterCommission = Math.max(0, grossTotal - commissionAmount);
    const afterOtherExp = Math.max(0, afterCommission - miscAmount);
    const afterTransport = Math.max(0, afterOtherExp - numericTransport);
    return Math.max(0, afterTransport - numericAmmali);
  }, [grossTotal, commissionAmount, miscAmount, numericTransport, numericAmmali]);

  // Derived effective payment amounts and status
  const numericPaid = useMemo(() => {
    if (paymentChoice === 'pay_later') return 0;
    if (typeof amountPaidNow === 'number') return Math.max(0, Math.min(farmerNetPayable, amountPaidNow));
    return 0;
  }, [paymentChoice, amountPaidNow, farmerNetPayable]);

  const paymentStatus = useMemo<PaymentStatus>(() => {
    if (paymentChoice === 'pay_later') return 'Unpaid';
    if (numericPaid >= farmerNetPayable && farmerNetPayable > 0) return 'Paid';
    if (numericPaid > 0 && numericPaid < farmerNetPayable) return 'Partial';
    return 'Unpaid';
  }, [paymentChoice, numericPaid, farmerNetPayable]);

  const balanceDue = useMemo(() => {
    return Math.max(0, farmerNetPayable - numericPaid);
  }, [farmerNetPayable, numericPaid]);

  // Keep amountPaidNow in sync when net payable changes or when pay options switch
  useEffect(() => {
    if (paymentChoice === 'pay_now') {
      if (payPortion === 'full') {
        setAmountPaidNow(farmerNetPayable);
      } else if (amountPaidNow === '') {
        setAmountPaidNow(Math.round(farmerNetPayable / 2));
      }
    } else {
      setAmountPaidNow(0);
    }
  }, [farmerNetPayable, paymentChoice, payPortion]);

  // Filtered farmers for dropdown
  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(farmerSearch.toLowerCase()) ||
      f.village.toLowerCase().includes(farmerSearch.toLowerCase()) ||
      f.phone.includes(farmerSearch)
  );

  // Handle Inline Add Farmer
  const handleSaveInlineFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName.trim()) {
      alert('Please enter farmer name');
      return;
    }

    if (/[0-9]/.test(newFarmerName)) {
      alert('Farmer name cannot contain numbers (పేరులో అంకెలు ఉండకూడదు)');
      return;
    }

    const cleanPhone = newFarmerPhone.replace(/\D/g, '').slice(-10);
    if (newFarmerPhone.trim() && cleanPhone.length !== 10) {
      alert('Phone number must contain only numbers (exactly 10 digits)');
      return;
    }

    const created = addFarmer({
      name: newFarmerName.trim(),
      phone: cleanPhone || '9876543210',
      village: newFarmerVillage.trim() || 'Local Mandi Belt',
      primaryCrops: [flowerVariety],
      connectedMerchantIds: [merchantProfile.merchantId],
      photoUrl: newFarmerPhotoUrl.trim() || undefined,
    });

    setSelectedFarmerId(created.id);
    setNewFarmerName('');
    setNewFarmerPhone('');
    setNewFarmerVillage('');
    setShowInlineAddFarmer(false);
  };

  // Submit Sale Lot & Generate Parchi
  const handleSaveLot = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFarmer) {
      alert('Please select a farmer.');
      return;
    }

    if (numericQuantity <= 0 || numericRate <= 0) {
      alert('Please enter valid quantity and rate.');
      return;
    }

    const finalVariety = customVarietyInput.trim() || flowerVariety;

    const newLot = addSaleLot({
      date: saleDate,
      farmerId: selectedFarmer.id,
      farmerName: selectedFarmer.name,
      farmerVillage: selectedFarmer.village,
      farmerPhone: selectedFarmer.phone,
      flowerVariety: finalVariety,
      quantity: numericQuantity,
      boxesCount: typeof boxesCount === 'number' && boxesCount > 0 ? boxesCount : undefined,
      flowerQuality,
      unit,
      rate: numericRate,
      grossTotal,
      commissionPercent,
      commissionAmount,
      ammaliCharges: numericAmmali,
      transportCharges: numericTransport,
      otherExpenditures: {
        transport: numericTransport,
        hamali: numericAmmali,
        kanta: 0,
        mandiCess: 0,
        packingCharges: 0,
        misc: miscAmount,
        miscPercent,
        miscNote: miscNote.trim() || undefined,
      },
      totalOtherExpenditures,
      farmerNetPayable,
      paymentStatus,
      amountPaid: numericPaid,
      balanceDue,
      paymentMode: numericPaid > 0 ? paymentMode : undefined,
      paymentReference: numericPaid > 0 ? paymentReference.trim() : undefined,
      notes: notes.trim() || undefined,
    });

    // Play cash chime sound effect
    sounds.playCashChime();

    // Open Mandi Parchi Modal immediately for printing / WhatsApp
    setSelectedParchiLot(newLot);

    // Reset Form for next fast lot
    setQuantity(50);
    setBoxesCount('');
    setFlowerQuality('Good');
    setAmmaliCharge('');
    setTransportCharge('');
    setRate(60);
    setCustomVarietyInput('');
    setNotes('');
    setPaymentReference('');
    const defComm = merchantProfile.defaultCommissionRate ?? 4;
    const defExp = merchantProfile.defaultExpenditureRate ?? 6;
    setCommissionPercent(defComm);
    setMiscPercent(defExp);
    setMiscNote('');
    if (paymentChoice === 'pay_now') {
      const resetGross = 50 * 60;
      const resetComm = Math.round(resetGross * (defComm / 100));
      const resetExp = Math.round(resetGross * (defExp / 100));
      const resetNet = Math.max(0, resetGross - resetComm - resetExp);
      if (payPortion === 'full') {
        setAmountPaidNow(resetNet);
      } else {
        setAmountPaidNow(Math.round(resetNet / 2));
      }
    } else {
      setAmountPaidNow(0);
    }
  };

  const todayStr = getTodayDateString();
  const yesterdayStr = getPastDateString(1);

  // Compute consignments recorded specifically for this saleDate
  const dateLots = useMemo(() => {
    return lots.filter((l) => l.date === saleDate);
  }, [lots, saleDate]);

  const dateTurnover = useMemo(() => {
    return dateLots.reduce((sum, l) => sum + l.grossTotal, 0);
  }, [dateLots]);

  const dateNetPayable = useMemo(() => {
    return dateLots.reduce((sum, l) => sum + l.farmerNetPayable, 0);
  }, [dateLots]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#2A1F1A] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#2E6349]" />
              <span>{t('newSaleTitle')}</span>
            </h2>
            <p className="text-xs text-[#6B5E57]">{t('newSaleSubtitle')}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="newsale-open-dateswitcher-btn"
              onClick={() => setIsDateSwitcherOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#E9F3EE] hover:bg-[#d8ece2] border border-[#2E6349]/30 text-[#2E6349] text-xs font-bold transition flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar / New Day Session</span>
            </button>
          </div>
        </div>

        {/* Date Selector & Daily Rollover Controls */}
        <div className="p-3 bg-[#FCFBF9] rounded-xl border border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <label htmlFor="sale-date-input" className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#2E6349]" />
              <span>Mandi Trading Date:</span>
            </label>
            <input
              id="sale-date-input"
              type="date"
              value={saleDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setSaleDate(newDate);
                setActiveSessionDate(newDate);
              }}
              className="px-2.5 py-1 rounded-lg border border-[#E8E2D9] bg-white text-xs font-mono font-bold text-[#2E6349] focus:outline-hidden focus:border-[#2E6349]"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="newsale-quick-today-btn"
                onClick={() => {
                  setSaleDate(todayStr);
                  setActiveSessionDate(todayStr);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  saleDate === todayStr
                    ? 'bg-[#2E6349] text-white shadow-2xs'
                    : 'bg-white border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA]'
                }`}
              >
                Today ({todayStr})
              </button>

              <button
                type="button"
                id="newsale-quick-yesterday-btn"
                onClick={() => {
                  setSaleDate(yesterdayStr);
                  setActiveSessionDate(yesterdayStr);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  saleDate === yesterdayStr
                    ? 'bg-[#2E6349] text-white shadow-2xs'
                    : 'bg-white border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA]'
                }`}
              >
                Yesterday
              </button>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                dateLots.length === 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-[#E9F3EE] text-[#2E6349] border border-[#2E6349]/30'
              }`}
            >
              {dateLots.length === 0 ? '✨ 0 Lots (Fresh Session)' : `${dateLots.length} Lots on Date`}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#6B5E57] flex items-center gap-1.5 pt-0.5">
          <Info className="w-3.5 h-3.5 text-[#2E6349] shrink-0" />
          <span>
            Every day starts refreshed and empty for new morning sales. All registered farmers, lifetime khata balances, and past reports are safely preserved.
          </span>
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSaveLot} className="space-y-6">
        {/* Step 1: Farmer Selection with Search & Inline Add */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5">
              <span>1. {t('selectFarmer')}</span>
            </label>
            <button
              type="button"
              id="inline-add-farmer-btn"
              onClick={() => setShowInlineAddFarmer(!showInlineAddFarmer)}
              className="text-xs font-bold text-[#2E6349] hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showInlineAddFarmer ? 'Cancel Add Farmer' : t('addNewFarmerInline')}</span>
            </button>
          </div>

          {/* Inline Add Farmer Form */}
          {showInlineAddFarmer && (
            <div className="p-4 rounded-xl bg-[#FEF8ED] border border-[#DD9F2F]/40 space-y-4">
              <h4 className="text-xs font-bold text-[#2A1F1A] uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#2E6349]" />
                <span>Instant Farmer Registration with Photo</span>
              </h4>

              <PhotoUploadPicker
                label="Photo of Farmer (రైతు ఫోటో)"
                sublabel="Upload from phone/PC, capture with webcam, or choose a preset"
                currentPhotoUrl={newFarmerPhotoUrl}
                onChange={(url) => setNewFarmerPhotoUrl(url)}
                presetType="farmer"
                idPrefix="newsale-inline-farmer"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  id="inline-farmer-name"
                  type="text"
                  placeholder="Farmer Full Name (no numbers) *"
                  required
                  value={newFarmerName}
                  onKeyDown={(e) => {
                    if (/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const clean = e.clipboardData.getData('text').replace(/[0-9]/g, '');
                    setNewFarmerName(clean);
                  }}
                  onChange={(e) => setNewFarmerName(e.target.value.replace(/[0-9]/g, ''))}
                  className="px-3 py-2 rounded-lg bg-white border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349]"
                />
                <input
                  id="inline-farmer-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="Mobile Number (10 digits)"
                  value={newFarmerPhone}
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
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const clean = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 10);
                    setNewFarmerPhone(clean);
                  }}
                  onChange={(e) => setNewFarmerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="px-3 py-2 rounded-lg bg-white border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349]"
                />
                <input
                  id="inline-farmer-village"
                  type="text"
                  placeholder="Village / Area"
                  value={newFarmerVillage}
                  onChange={(e) => setNewFarmerVillage(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInlineAddFarmer(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E2D9] text-xs text-[#6B5E57]"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  id="save-inline-farmer-btn"
                  onClick={handleSaveInlineFarmer}
                  className="px-4 py-1.5 rounded-lg bg-[#2E6349] text-white font-bold text-xs hover:bg-[#1F4532] shadow-2xs"
                >
                  Save & Select Farmer
                </button>
              </div>
            </div>
          )}

          {/* Farmer Selection Dropdown / Search */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B5E57]" />
                <input
                  id="search-farmer-input"
                  type="text"
                  placeholder={t('searchFarmerPlaceholder')}
                  value={farmerSearch}
                  onFocus={() => setIsFarmerDropdownOpen(true)}
                  onChange={(e) => {
                    setFarmerSearch(e.target.value);
                    setIsFarmerDropdownOpen(true);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-[#FCFBF9]"
                />
              </div>
            </div>

            {/* Dropdown Options */}
            {isFarmerDropdownOpen && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 max-h-56 overflow-y-auto bg-white rounded-xl border border-[#E8E2D9] shadow-lg p-1 space-y-1">
                {filteredFarmers.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#6B5E57]">
                    No farmer found. Use &quot;+ Add New Farmer&quot; above to register instantly.
                  </div>
                ) : (
                  filteredFarmers.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      id={`select-farmer-option-${f.id}`}
                      onClick={() => {
                        setSelectedFarmerId(f.id);
                        setFarmerSearch(f.name);
                        setIsFarmerDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                        selectedFarmerId === f.id
                          ? 'bg-[#E9F3EE] text-[#2E6349] font-bold'
                          : 'hover:bg-[#FCFBF9] text-[#2A1F1A]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2E6349] bg-[#FCFBF9] shrink-0">
                          {f.photoUrl ? (
                            <img
                              src={f.photoUrl}
                              alt={f.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-[#2E6349] text-[10px]">
                              {f.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold block">{f.name}</span>
                          <span className="text-[11px] text-[#6B5E57]">
                            📍 {f.village} • Ph: {f.phone}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-[#6B5E57] bg-white px-2 py-0.5 rounded border border-[#E8E2D9]">
                        {f.id}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Farmer Badge or Empty Prompt */}
          {selectedFarmer ? (
            <div className="p-3 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#2E6349] bg-white shrink-0 shadow-2xs">
                  {selectedFarmer.photoUrl ? (
                    <img
                      src={selectedFarmer.photoUrl}
                      alt={selectedFarmer.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E9F3EE] text-[#2E6349] font-black text-xs">
                      {selectedFarmer.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-[#6B5E57] uppercase font-bold block">
                    Active Consignor
                  </span>
                  <span className="font-black text-sm text-[#2A1F1A]">
                    {selectedFarmer.name}
                  </span>
                  <span className="text-[#6B5E57] ml-2 font-medium">📍 {selectedFarmer.village}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#6B5E57] block">Mobile for Parchi</span>
                <span className="font-mono font-bold text-[#2E6349]">+91 {selectedFarmer.phone}</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium">Please select an existing farmer or register a new one to record this sale lot.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineAddFarmer(true)}
                className="px-3 py-1 rounded-lg bg-[#2E6349] text-white font-bold text-xs hover:bg-[#1F4532] shadow-2xs inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#DD9F2F]" />
                <span>+ Register Farmer</span>
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Flower Variety Selection */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-[#2E6349] block">
            2. {t('flowerVariety')}
          </label>

          {/* Quick Variety Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {flowerVarietiesData.map((v) => {
              const label = language === 'te' ? v.te : language === 'hi' ? v.hi : v.en;
              const isSelected = flowerVariety === v.en && !customVarietyInput;

              return (
                <button
                  key={v.id}
                  type="button"
                  id={`variety-chip-${v.id}`}
                  onClick={() => {
                    setFlowerVariety(v.en);
                    setCustomVarietyInput('');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-[#2E6349] text-white border-[#2E6349] font-bold shadow-xs'
                      : 'bg-[#FCFBF9] text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#F4EFEA]'
                  }`}
                >
                  <span className="text-base">🌸</span>
                  <span className="text-xs leading-tight line-clamp-2">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Variety Input */}
          <div>
            <label className="block text-xs font-semibold text-[#6B5E57] mb-1">
              {t('customVariety')}
            </label>
            <input
              id="custom-flower-variety-input"
              type="text"
              placeholder={t('customVarietyPlaceholder')}
              value={customVarietyInput}
              onChange={(e) => setCustomVarietyInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-[#FCFBF9]"
            />
          </div>
        </div>

        {/* Step 3: Quantity, Unit & Rate Inputs */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2E6349] block">
              3. {t('weightAndRate')}
            </label>

            {/* Interactive Tool Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="toggle-digital-scale-btn"
                onClick={() => setShowDigitalScale(!showDigitalScale)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  showDigitalScale
                    ? 'bg-[#2E6349] text-white shadow-2xs'
                    : 'bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA]'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-[#DD9F2F]" />
                <span>{showDigitalScale ? 'Hide Scale' : '⚖️ Electronic Scale'}</span>
              </button>

              <button
                type="button"
                id="toggle-rate-negotiator-btn"
                onClick={() => setShowRateNegotiator(!showRateNegotiator)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  showRateNegotiator
                    ? 'bg-[#2E6349] text-white shadow-2xs'
                    : 'bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#DD9F2F]" />
                <span>{showRateNegotiator ? 'Hide Calculator' : '🧮 Live Rate Splitter'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Digital Scale Component */}
          {showDigitalScale && (
            <div className="p-3 bg-[#111A15] rounded-2xl border-2 border-[#2E6349] space-y-2 text-white">
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-1.5">
                <span className="font-bold text-emerald-400">Certified Digital Scale</span>
                <span className="text-[10px] text-white/60">Lock weight to auto-fill Quantity</span>
              </div>
              <DigitalWeighingScale
                onLockWeight={(locked) => {
                  setQuantity(locked);
                  setUnit('Kgs');
                }}
              />
            </div>
          )}

          {/* Interactive Rate Negotiator Component */}
          {showRateNegotiator && (
            <InteractiveRateCalculator
              initialQuantity={typeof quantity === 'number' ? quantity : 50}
              initialRate={typeof rate === 'number' ? rate : 60}
              initialCommission={commissionPercent}
              onApply={(vals) => {
                setQuantity(vals.quantity);
                setRate(vals.rate);
                setCommissionPercent(vals.commissionPercent);
              }}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Quantity / Weight (No. of Kgs) */}
            <div>
              <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                {t('quantityLabel')} (No. of Kgs) *
              </label>
              <div className="flex gap-2">
                <input
                  id="lot-quantity-input"
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  placeholder="e.g. 50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D9] text-sm font-bold focus:outline-hidden focus:border-[#2E6349] bg-[#FCFBF9]"
                />
                <select
                  id="lot-unit-select"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as WeightUnit)}
                  className="px-2.5 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-bold focus:outline-hidden focus:border-[#2E6349] bg-[#FCFBF9]"
                >
                  <option value="Kgs">Kgs</option>
                  <option value="Bags">Bags</option>
                  <option value="Bunches">Bunches</option>
                  <option value="Crates">Crates</option>
                </select>
              </div>
            </div>

            {/* No. of Boxes */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#2A1F1A]">
                  {t('boxesCount')}
                </label>
                <span className="text-[10px] text-[#6B5E57] bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                  Boxes / బాక్సులు
                </span>
              </div>
              <input
                id="lot-boxes-input"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 10"
                value={boxesCount}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                  setBoxesCount(val);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D9] text-sm font-bold focus:outline-hidden focus:border-[#2E6349] bg-[#FCFBF9]"
              />
            </div>

            {/* Quality of Flower (Good / Average / Bad) */}
            <div>
              <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                {t('flowerQuality')} *
              </label>
              <div className="grid grid-cols-3 gap-1.5 h-[42px]">
                <button
                  type="button"
                  id="quality-good-btn"
                  onClick={() => setFlowerQuality('Good')}
                  className={`rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                    flowerQuality === 'Good'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                      : 'bg-[#FCFBF9] text-emerald-800 border-[#E8E2D9] hover:bg-emerald-50'
                  }`}
                >
                  <span>✨</span>
                  <span>{t('qualityGood')}</span>
                </button>
                <button
                  type="button"
                  id="quality-average-btn"
                  onClick={() => setFlowerQuality('Average')}
                  className={`rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                    flowerQuality === 'Average'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-[#FCFBF9] text-amber-800 border-[#E8E2D9] hover:bg-amber-50'
                  }`}
                >
                  <span>🌿</span>
                  <span>{t('qualityAverage')}</span>
                </button>
                <button
                  type="button"
                  id="quality-bad-btn"
                  onClick={() => setFlowerQuality('Bad')}
                  className={`rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                    flowerQuality === 'Bad'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                      : 'bg-[#FCFBF9] text-rose-800 border-[#E8E2D9] hover:bg-rose-50'
                  }`}
                >
                  <span>🥀</span>
                  <span>{t('qualityBad')}</span>
                </button>
              </div>
            </div>

            {/* Rate per Unit */}
            <div>
              <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                {t('rateLabel')} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">₹</span>
                <input
                  id="lot-rate-input"
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  placeholder="e.g. 60"
                  value={rate}
                  onChange={(e) => setRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[#E8E2D9] text-sm font-bold focus:outline-hidden focus:border-[#2E6349] bg-[#FCFBF9]"
                />
              </div>
            </div>

            {/* Gross Calculation Box */}
            <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B5E57] block">{t('grossCalculated')}:</span>
                <span className="text-[11px] text-[#6B5E57]">
                  {numericQuantity} {unit} {numericBoxes > 0 ? `(${numericBoxes} boxes)` : ''} × ₹{numericRate}/{unit}
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black text-[#2A1F1A]">
                ₹{grossTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Step 4: Commission & Deductions (Collapsible) */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xs overflow-hidden">
          {/* Header */}
          <div
            id="toggle-expenditures-btn"
            onClick={() => setIsExpendituresExpanded(!isExpendituresExpanded)}
            className="p-4 sm:p-5 bg-[#FCFBF9] border-b border-[#E8E2D9] flex items-center justify-between cursor-pointer select-none"
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2E6349] flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                <span>4. {t('itemizedExpTitle')}</span>
              </h3>
              <p className="text-[11px] text-[#6B5E57]">
                Calculation order: Gross → − Commission → − Ammali → − Transport = Farmer's Net Money
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-rose-700">
                - ₹{totalDeductions.toLocaleString('en-IN')}
              </span>
              {isExpendituresExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#6B5E57]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#6B5E57]" />
              )}
            </div>
          </div>

          {/* Body */}
          {isExpendituresExpanded && (
            <div className="p-4 sm:p-6 space-y-4">
              {/* Deduction Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. Commission Deduction */}
                <div className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A1F1A]">
                      1. Commission
                    </span>
                    <span className="text-[10px] font-semibold text-[#2E6349] bg-[#2E6349]/10 px-2 py-0.5 rounded-full">
                      Mandi Fee
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-[#6B5E57] mb-1">
                      Rate (%)
                    </label>
                    <div className="relative">
                      <input
                        id="commission-percent-input"
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={commissionPercent}
                        onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-white focus:outline-hidden focus:border-[#2E6349]"
                      />
                      <span className="absolute right-3 top-1.5 text-xs font-bold text-gray-500">%</span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D9] text-xs font-mono font-bold text-[#2E6349] flex justify-between items-center">
                    <span className="text-[10px] text-gray-500">Cut:</span>
                    <span>₹{commissionAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* 2. Transport Expense (Freight / Vehicle / Carriage) */}
                <div className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A1F1A]">
                      2. {t('transportCharge')}
                    </span>
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      రవాణా ఖర్చు
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-[#6B5E57] mb-1">
                      Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1.5 text-xs font-bold text-gray-500">₹</span>
                      <input
                        id="lot-transport-input"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={transportCharge}
                        onChange={(e) => setTransportCharge(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-white focus:outline-hidden focus:border-[#2E6349]"
                      />
                    </div>
                  </div>

                  {numericBoxes > 0 ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setTransportCharge(numericBoxes * 20)}
                        className="flex-1 text-[9px] bg-white border border-[#E8E2D9] rounded py-0.5 hover:bg-gray-100 font-medium text-[#2A1F1A]"
                        title="Auto ₹20 per box"
                      >
                        ₹20/box (₹{numericBoxes * 20})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransportCharge(numericBoxes * 30)}
                        className="flex-1 text-[9px] bg-white border border-[#E8E2D9] rounded py-0.5 hover:bg-gray-100 font-medium text-[#2A1F1A]"
                        title="Auto ₹30 per box"
                      >
                        ₹30/box (₹{numericBoxes * 30})
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-500 italic py-0.5">
                      Enter transport expense
                    </div>
                  )}
                </div>

                {/* 3. Other Expenditures Percentage (default 6%) */}
                <div className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A1F1A]">
                      3. {t('miscPercentage')}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      Default 6%
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-[#6B5E57] mb-1">
                      Percent (%)
                    </label>
                    <div className="relative">
                      <input
                        id="exp-misc-percent-input"
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        placeholder="6"
                        value={miscPercent === 0 ? '' : miscPercent}
                        onChange={(e) =>
                          setMiscPercent(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-white focus:outline-hidden focus:border-[#2E6349]"
                      />
                      <span className="absolute right-3 top-1.5 text-xs font-bold text-gray-500">%</span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D9] text-xs font-mono font-bold text-rose-700 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500">Cut:</span>
                    <span>₹{miscAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* 4. Ammali Charge (Hamali / Loading / Coolie) */}
                <div className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A1F1A]">
                      4. {t('ammaliCharge')}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      కూలీ (ఐచ్ఛికం)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-[#6B5E57] mb-1">
                      Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1.5 text-xs font-bold text-gray-500">₹</span>
                      <input
                        id="lot-ammali-input"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={ammaliCharge}
                        onChange={(e) => setAmmaliCharge(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-white focus:outline-hidden focus:border-[#2E6349]"
                      />
                    </div>
                  </div>

                  {numericBoxes > 0 ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setAmmaliCharge(numericBoxes * 5)}
                        className="flex-1 text-[9px] bg-white border border-[#E8E2D9] rounded py-0.5 hover:bg-gray-100 font-medium text-[#2A1F1A]"
                        title="Auto ₹5 per box"
                      >
                        ₹5/box (₹{numericBoxes * 5})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmmaliCharge(numericBoxes * 10)}
                        className="flex-1 text-[9px] bg-white border border-[#E8E2D9] rounded py-0.5 hover:bg-gray-100 font-medium text-[#2A1F1A]"
                        title="Auto ₹10 per box"
                      >
                        ₹10/box (₹{numericBoxes * 10})
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-500 italic py-0.5">
                      Enter coolie (optional)
                    </div>
                  )}
                </div>
              </div>

              {/* Step-by-Step Subtraction Order Indicator */}
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 space-y-2 text-xs text-amber-950">
                <div className="font-bold flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-amber-700" />
                    <span>Deduction Flow to Net Amount Payable to Farmer:</span>
                  </span>
                  <span className="font-mono text-xs">
                    Total Deductions: <strong className="text-rose-700">-₹{totalDeductions.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-100">
                    <span className="text-gray-500 block text-[9px] uppercase font-semibold">1. Gross Amount</span>
                    <span className="font-mono font-bold text-gray-900">₹{grossTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-100">
                    <span className="text-gray-500 block text-[9px] uppercase font-semibold">2. - Commission ({commissionPercent}%)</span>
                    <span className="font-mono font-bold text-rose-700">-₹{commissionAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-100">
                    <span className="text-gray-500 block text-[9px] uppercase font-semibold">3. - Other Exp ({miscPercent}%)</span>
                    <span className="font-mono font-bold text-rose-700">-₹{miscAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-100">
                    <span className="text-gray-500 block text-[9px] uppercase font-semibold">4. - Transport Expense</span>
                    <span className="font-mono font-bold text-rose-700">-₹{numericTransport.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-300 col-span-2 sm:col-span-1">
                    <span className="text-emerald-800 block text-[9px] uppercase font-black">5. = Net to Farmer</span>
                    <span className="font-mono font-black text-emerald-800 text-xs">₹{farmerNetPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 5: Farmer Net Payable Highlight & Payment Details */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-[#2E6349]/40 shadow-xs space-y-4">
          {/* Prominent Farmer Net Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#2E6349] to-[#1F4532] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#DD9F2F] font-bold block">
                {t('farmerNetPayable')}
              </span>
              <span className="text-xs text-white/80">Net money to farmer (Gross Amount − Transport Expense − Commission − Other Expenditure)</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              ₹{farmerNetPayable.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Payment Status & Settlement */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#2E6349] block">
                5. {t('paymentSettlementNow')}
              </label>
              <span className="text-[11px] text-[#6B5E57] font-medium">
                Farmer Net: <strong className="text-[#2A1F1A] font-mono">₹{farmerNetPayable.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            {/* Primary Choice: Pay Now vs Pay Later */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pay Now Option Button */}
              <button
                type="button"
                id="payment-choice-pay-now-btn"
                onClick={() => {
                  setPaymentChoice('pay_now');
                  if (payPortion === 'full') {
                    setAmountPaidNow(farmerNetPayable);
                  } else {
                    setAmountPaidNow(Math.round(farmerNetPayable / 2));
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  paymentChoice === 'pay_now'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-[#FCFBF9] border-[#E8E2D9] hover:bg-[#F4EFEA]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    paymentChoice === 'pay_now'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-[#2A1F1A]">
                      {t('payNow')}
                    </span>
                    {paymentChoice === 'pay_now' && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B5E57] mt-0.5 leading-tight">
                    {t('payNowDesc')}
                  </p>
                </div>
              </button>

              {/* Pay Later Option Button */}
              <button
                type="button"
                id="payment-choice-pay-later-btn"
                onClick={() => {
                  setPaymentChoice('pay_later');
                  setAmountPaidNow(0);
                }}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  paymentChoice === 'pay_later'
                    ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-[#FCFBF9] border-[#E8E2D9] hover:bg-[#F4EFEA]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    paymentChoice === 'pay_later'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-[#2A1F1A]">
                      {t('payLater')}
                    </span>
                    {paymentChoice === 'pay_later' && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        Credit / Unpaid
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B5E57] mt-0.5 leading-tight">
                    {t('payLaterDesc')}
                  </p>
                </div>
              </button>
            </div>

            {/* When Pay Later is selected */}
            {paymentChoice === 'pay_later' && (
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Unpaid Credit Consignment (బాకీ ఖాతా)</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  The net amount of <strong className="font-mono">₹{farmerNetPayable.toLocaleString('en-IN')}</strong> will be recorded as <strong>Unpaid</strong>. When you click <em>Save &amp; Generate Mandi Parchi</em>, it will immediately go directly to the <strong>Payments</strong> tab under <em>{selectedFarmer?.name || 'Farmer'}</em> as an outstanding balance for later settlement.
                </p>
              </div>
            )}

            {/* When Pay Now is selected */}
            {paymentChoice === 'pay_now' && (
              <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#FCFBF9] border border-[#E8E2D9]">
                {/* Full vs Partial Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#2A1F1A] mb-2">
                    Payment Amount Choice:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="pay-portion-full-btn"
                      onClick={() => {
                        setPayPortion('full');
                        setAmountPaidNow(farmerNetPayable);
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        payPortion === 'full' && numericPaid >= farmerNetPayable
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#F4EFEA]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('fullAmount')} (₹{farmerNetPayable.toLocaleString('en-IN')})</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      id="pay-portion-partial-btn"
                      onClick={() => {
                        setPayPortion('partial');
                        if (amountPaidNow === farmerNetPayable || amountPaidNow === 0 || amountPaidNow === '') {
                          setAmountPaidNow(Math.round(farmerNetPayable / 2));
                        }
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        payPortion === 'partial' || (numericPaid > 0 && numericPaid < farmerNetPayable)
                          ? 'bg-[#DD9F2F] text-[#2A1F1A] border-[#DD9F2F] shadow-2xs font-black'
                          : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#F4EFEA]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{t('partialAmount')} (Custom Edit)</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Amount Paid Edit Input & Status Badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="lot-amount-paid-input" className="block text-xs font-semibold text-[#2A1F1A]">
                      {t('amountPaidNow')}
                    </label>
                    <span className="text-[11px] font-bold">
                      {numericPaid >= farmerNetPayable && farmerNetPayable > 0 ? (
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          ✓ {t('statusPaid')} (Full)
                        </span>
                      ) : numericPaid > 0 ? (
                        <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          ⚠ {t('statusPartial')} (Remaining Due: ₹{balanceDue.toLocaleString('en-IN')})
                        </span>
                      ) : (
                        <span className="text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                          {t('statusUnpaid')}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm text-gray-500 font-bold">₹</span>
                    <input
                      id="lot-amount-paid-input"
                      type="number"
                      min="0"
                      max={farmerNetPayable}
                      step="any"
                      placeholder="Enter amount paid"
                      value={amountPaidNow}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setAmountPaidNow(val);
                        if (typeof val === 'number') {
                          if (val >= farmerNetPayable && farmerNetPayable > 0) {
                            setPayPortion('full');
                          } else if (val > 0) {
                            setPayPortion('partial');
                          }
                        }
                      }}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] text-sm font-mono font-bold bg-white focus:outline-hidden focus:border-[#2E6349] focus:ring-1 focus:ring-[#2E6349]"
                    />
                  </div>

                  {/* Quick percentage shortcuts */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-[#6B5E57]">Quick presets:</span>
                    {[
                      { label: '25%', frac: 0.25 },
                      { label: '50%', frac: 0.5 },
                      { label: '75%', frac: 0.75 },
                      { label: 'Full', frac: 1 },
                    ].map(({ label, frac }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const amt = Math.round(farmerNetPayable * frac);
                          setAmountPaidNow(amt);
                          if (frac === 1) {
                            setPayPortion('full');
                          } else {
                            setPayPortion('partial');
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#E8E2D9] bg-white hover:bg-[#F4EFEA] text-[#2A1F1A] transition cursor-pointer"
                      >
                        {label} (₹{Math.round(farmerNetPayable * frac).toLocaleString('en-IN')})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Mode Selection: PhonePe, Google Pay, Paytm/UPI, Cash, Bank Transfer */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
                  <label className="block text-xs font-semibold text-[#2A1F1A]">
                    {t('paymentModeLabel')} <span className="text-gray-500 font-normal">(PhonePe, online or cash)</span>:
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {/* Cash */}
                    <button
                      type="button"
                      id="paymode-btn-cash"
                      onClick={() => setPaymentMode('Cash')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        paymentMode === 'Cash'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs font-bold'
                          : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#F4EFEA]'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <span className="text-xs font-bold leading-tight">Cash</span>
                      <span className="text-[10px] opacity-80">నగదు / Cash</span>
                    </button>

                    {/* PhonePe */}
                    <button
                      type="button"
                      id="paymode-btn-phonepe"
                      onClick={() => setPaymentMode('PhonePe')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        paymentMode === 'PhonePe'
                          ? 'bg-[#5f259f] text-white border-[#5f259f] shadow-2xs font-bold'
                          : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span className="text-xs font-bold leading-tight">PhonePe</span>
                      <span className="text-[10px] opacity-80">ఫోన్‌పే UPI</span>
                    </button>

                    {/* Google Pay */}
                    <button
                      type="button"
                      id="paymode-btn-gpay"
                      onClick={() => setPaymentMode('Google Pay')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        paymentMode === 'Google Pay'
                          ? 'bg-[#1a73e8] text-white border-[#1a73e8] shadow-2xs font-bold'
                          : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span className="text-xs font-bold leading-tight">Google Pay</span>
                      <span className="text-[10px] opacity-80">GPay UPI</span>
                    </button>

                    {/* Paytm / UPI */}
                    <button
                      type="button"
                      id="paymode-btn-upi"
                      onClick={() => setPaymentMode('Paytm')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        paymentMode === 'Paytm' || paymentMode === 'UPI'
                          ? 'bg-[#002e6e] text-white border-[#002e6e] shadow-2xs font-bold'
                          : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-cyan-50 hover:border-cyan-300'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span className="text-xs font-bold leading-tight">Paytm / UPI</span>
                      <span className="text-[10px] opacity-80">QR Code</span>
                    </button>

                    {/* Bank Transfer */}
                    <button
                      type="button"
                      id="paymode-btn-bank"
                      onClick={() => setPaymentMode('Bank Transfer')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        paymentMode === 'Bank Transfer'
                          ? 'bg-[#334155] text-white border-[#334155] shadow-2xs font-bold'
                          : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <Building className="w-5 h-5" />
                      <span className="text-xs font-bold leading-tight">Bank</span>
                      <span className="text-[10px] opacity-80">IMPS/NEFT</span>
                    </button>
                  </div>

                  {/* Reference / UTR Number for online payments */}
                  {paymentMode !== 'Cash' && (
                    <div className="pt-2">
                      <label htmlFor="lot-ref-input" className="block text-[11px] font-semibold text-[#2A1F1A] mb-1">
                        {paymentMode} Reference / UTR Number (Optional):
                      </label>
                      <input
                        id="lot-ref-input"
                        type="text"
                        placeholder={`e.g. ${paymentMode} UTR: 421098412351 or Txn ID`}
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs font-mono bg-white focus:outline-hidden focus:border-[#2E6349]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Remaining Balance Summary Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-[#2A1F1A] block">
                  {t('balanceDue')}:
                </span>
                <span className="text-[11px] text-[#6B5E57]">
                  {balanceDue > 0
                    ? `Remaining ₹${balanceDue.toLocaleString('en-IN')} automatically goes to Payments Khata as pending due`
                    : 'Account fully settled! Zero pending dues remaining.'}
                </span>
              </div>
              <span
                className={`font-mono font-black text-base ${
                  balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                ₹{balanceDue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Submit & Generate Mandi Parchi */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#6B5E57] space-y-0.5">
            <p className="font-medium text-[#2A1F1A]">
              Generates Form C Mandi Parchi with instant thermal printer support and WhatsApp share.
            </p>
            <p className="text-[11px] text-[#2E6349] font-semibold">
              ✓ Unpaid credit dues, partial payouts, and fully paid receipts automatically sync to Payments.
            </p>
          </div>

          <button
            type="submit"
            id="save-and-generate-parchi-btn"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2E6349] text-white font-black text-sm hover:bg-[#1F4532] transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#DD9F2F]" />
            <span>{t('saveAndGenerateParchi')}</span>
          </button>
        </div>
      </form>

      {/* Consignments Recorded for Selected Date Section */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E2D9] pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#2A1F1A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2E6349]" />
              <span>Consignments Recorded on {formatDisplayDate(saleDate)}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E9F3EE] text-[#2E6349] font-mono text-xs font-bold">
                {dateLots.length}
              </span>
            </h3>
            <p className="text-xs text-[#6B5E57]">
              Live consignment records for the active date. Every day starts fresh & empty for new morning sales.
            </p>
          </div>

          {dateLots.length > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <div className="bg-[#FCFBF9] px-2.5 py-1 rounded-lg border border-[#E8E2D9]">
                <span className="text-[#6B5E57]">Turnover: </span>
                <strong className="text-[#2A1F1A] font-mono font-bold">₹{dateTurnover.toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-[#FCFBF9] px-2.5 py-1 rounded-lg border border-[#E8E2D9]">
                <span className="text-[#6B5E57]">Farmer Net: </span>
                <strong className="text-[#2E6349] font-mono font-bold">₹{dateNetPayable.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          )}
        </div>

        {dateLots.length === 0 ? (
          <div className="p-6 text-center space-y-2.5 bg-[#FCFBF9] rounded-xl border border-dashed border-[#E8E2D9]">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 text-[#DD9F2F] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#2A1F1A]">
              No consignments recorded for {formatDisplayDate(saleDate)} yet
            </h4>
            <p className="text-xs text-[#6B5E57] max-w-md mx-auto">
              New sales is refreshed and stays empty at the start of each morning. Use the form above to record your first consignment. All previous dates remain accessible in Reports & PDFs.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMerchantTab('reports')}
                className="text-xs font-bold text-[#2E6349] hover:underline inline-flex items-center gap-1"
              >
                <span>View Historical Records in Reports & PDFs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dateLots.map((lot) => (
              <div
                key={lot.id}
                className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] hover:bg-white hover:border-[#2E6349]/30 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#2E6349] bg-[#E9F3EE] px-2 py-0.5 rounded text-[11px]">
                      {lot.parchiNumber}
                    </span>
                    <span className="text-[#6B5E57]">{lot.time}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lot.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lot.paymentStatus === 'Partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {lot.paymentStatus}
                    </span>
                  </div>
                  <div className="font-bold text-[#2A1F1A] text-sm flex items-center gap-2">
                    <span>{lot.farmerName}</span>
                    <span className="text-xs font-normal text-[#6B5E57]">({lot.farmerVillage})</span>
                  </div>
                  <div className="text-[#6B5E57] flex items-center gap-2 flex-wrap">
                    <span className="text-[#2A1F1A] font-semibold">{lot.flowerVariety}</span>
                    <span>•</span>
                    <span>{lot.quantity} {lot.unit} @ ₹{lot.rate}/{lot.unit}</span>
                    <span>•</span>
                    <span>Gross: <strong className="text-[#2A1F1A]">₹{lot.grossTotal.toLocaleString('en-IN')}</strong></span>
                    <span>•</span>
                    <span>Net to Farmer: <strong className="text-[#2E6349]">₹{lot.farmerNetPayable.toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedParchiLot(lot)}
                    className="px-3 py-1.5 rounded-lg bg-[#2E6349] text-white font-bold text-xs hover:bg-[#1F4532] transition flex items-center gap-1 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#DD9F2F]" />
                    <span>Print Parchi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete consignment ${lot.parchiNumber}?`)) {
                        deleteSaleLot(lot.id);
                      }
                    }}
                    className="p-1.5 rounded-lg border border-[#E8E2D9] text-[#6B5E57] hover:text-rose-700 hover:bg-rose-50 transition"
                    title="Delete lot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
