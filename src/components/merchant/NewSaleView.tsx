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
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { WeightUnit, PaymentStatus, PaymentMode, Expenditures } from '../../types';
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
  const [unit, setUnit] = useState<WeightUnit>('Kgs');
  const [rate, setRate] = useState<number | ''>(60);
  const [commissionPercent, setCommissionPercent] = useState<number>(
    merchantProfile.defaultCommissionRate || 10
  );

  // Interactive Tools State
  const [showDigitalScale, setShowDigitalScale] = useState<boolean>(false);
  const [showRateNegotiator, setShowRateNegotiator] = useState<boolean>(false);

  // Expenditures
  const [isExpendituresExpanded, setIsExpendituresExpanded] = useState<boolean>(true);
  const [expenditures, setExpenditures] = useState<Expenditures>({
    transport: 100,
    hamali: 40,
    kanta: 20,
    mandiCess: 30,
    packingCharges: 30,
    misc: 0,
    miscNote: '',
  });

  // Payment Details
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [amountPaidNow, setAmountPaidNow] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Selected Farmer details
  const selectedFarmer = farmers.find((f) => f.id === selectedFarmerId);

  // Real-time Calculations
  const numericQuantity = typeof quantity === 'number' ? quantity : 0;
  const numericRate = typeof rate === 'number' ? rate : 0;

  const grossTotal = useMemo(() => {
    return Math.round(numericQuantity * numericRate);
  }, [numericQuantity, numericRate]);

  const commissionAmount = useMemo(() => {
    return Math.round(grossTotal * (commissionPercent / 100));
  }, [grossTotal, commissionPercent]);

  const totalOtherExpenditures = useMemo(() => {
    return (
      (Number(expenditures.transport) || 0) +
      (Number(expenditures.hamali) || 0) +
      (Number(expenditures.kanta) || 0) +
      (Number(expenditures.mandiCess) || 0) +
      (Number(expenditures.packingCharges) || 0) +
      (Number(expenditures.misc) || 0)
    );
  }, [expenditures]);

  const farmerNetPayable = useMemo(() => {
    return Math.max(0, grossTotal - (commissionAmount + totalOtherExpenditures));
  }, [grossTotal, commissionAmount, totalOtherExpenditures]);

  // Sync Amount Paid with Status
  useEffect(() => {
    if (paymentStatus === 'Paid') {
      setAmountPaidNow(farmerNetPayable);
    } else if (paymentStatus === 'Unpaid') {
      setAmountPaidNow(0);
    } else if (paymentStatus === 'Partial' && amountPaidNow === '') {
      setAmountPaidNow(Math.round(farmerNetPayable / 2));
    }
  }, [paymentStatus, farmerNetPayable]);

  const numericPaid = typeof amountPaidNow === 'number' ? amountPaidNow : 0;
  const balanceDue = Math.max(0, farmerNetPayable - numericPaid);

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
    if (!newFarmerName.trim()) return;

    const created = addFarmer({
      name: newFarmerName.trim(),
      phone: newFarmerPhone.trim() || '9876543210',
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
      unit,
      rate: numericRate,
      grossTotal,
      commissionPercent,
      commissionAmount,
      otherExpenditures: expenditures,
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
    setRate(60);
    setCustomVarietyInput('');
    setNotes('');
    setPaymentReference('');
    if (paymentStatus === 'Paid') {
      setAmountPaidNow(50 * 60 - (50 * 60 * 0.1 + totalOtherExpenditures));
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
      {/* Title & APMC Context */}
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
                  placeholder="Farmer Full Name *"
                  required
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349]"
                />
                <input
                  id="inline-farmer-phone"
                  type="tel"
                  placeholder="Mobile Number (WhatsApp)"
                  value={newFarmerPhone}
                  onChange={(e) => setNewFarmerPhone(e.target.value)}
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
                <span className="font-bold text-emerald-400">APMC Certified Digital Scale</span>
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
                setExpenditures((prev) => ({
                  ...prev,
                  transport: vals.transport,
                  hamali: vals.hamali,
                }));
              }}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                {t('quantityLabel')} *
              </label>
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
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                {t('unitLabel')}
              </label>
              <select
                id="lot-unit-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value as WeightUnit)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D9] text-sm font-bold focus:outline-hidden focus:border-[#2E6349] bg-[#FCFBF9]"
              >
                <option value="Kgs">Kgs (కిలోలు / किग्रा)</option>
                <option value="Bags">Bags / మూటలు (बोरी)</option>
                <option value="Bunches">Bunches / కట్టలు (गुच्छे)</option>
                <option value="Crates">Crates / బాక్సులు (क्रेट)</option>
              </select>
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
          </div>

          {/* Gross Calculation Box */}
          <div className="p-3.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B5E57]">{t('grossCalculated')}:</span>
            <span className="text-lg font-black text-[#2A1F1A]">
              ₹{grossTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Step 4: Commission & Itemized Other Expenditures (Collapsible) */}
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
              <p className="text-[11px] text-[#6B5E57]">{t('itemizedExpSubtitle')}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-rose-700">
                - ₹{(commissionAmount + totalOtherExpenditures).toLocaleString('en-IN')}
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
              {/* Commission Rate & Calculated */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#E8E2D9]">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                    {t('commissionRateLabel')}
                  </label>
                  <div className="relative">
                    <input
                      id="commission-percent-input"
                      type="number"
                      min="0"
                      max="25"
                      step="0.5"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-[#FCFBF9]"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-gray-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B5E57] mb-1">
                    {t('commissionCalculated')}
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs font-mono font-bold text-[#2E6349]">
                    ₹{commissionAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Itemized Deductions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#2A1F1A] mb-1">
                    {t('transportFee')}
                  </label>
                  <input
                    id="exp-transport-input"
                    type="number"
                    min="0"
                    value={expenditures.transport}
                    onChange={(e) =>
                      setExpenditures({ ...expenditures, transport: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-mono bg-[#FCFBF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2A1F1A] mb-1">
                    {t('hamaliCoolie')}
                  </label>
                  <input
                    id="exp-hamali-input"
                    type="number"
                    min="0"
                    value={expenditures.hamali}
                    onChange={(e) =>
                      setExpenditures({ ...expenditures, hamali: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-mono bg-[#FCFBF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2A1F1A] mb-1">
                    {t('kantaWeighing')}
                  </label>
                  <input
                    id="exp-kanta-input"
                    type="number"
                    min="0"
                    value={expenditures.kanta}
                    onChange={(e) =>
                      setExpenditures({ ...expenditures, kanta: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-mono bg-[#FCFBF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2A1F1A] mb-1">
                    {t('mandiCess')}
                  </label>
                  <input
                    id="exp-cess-input"
                    type="number"
                    min="0"
                    value={expenditures.mandiCess}
                    onChange={(e) =>
                      setExpenditures({ ...expenditures, mandiCess: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-mono bg-[#FCFBF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2A1F1A] mb-1">
                    {t('packingCharges')}
                  </label>
                  <input
                    id="exp-packing-input"
                    type="number"
                    min="0"
                    value={expenditures.packingCharges}
                    onChange={(e) =>
                      setExpenditures({ ...expenditures, packingCharges: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-mono bg-[#FCFBF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2A1F1A] mb-1">
                    {t('miscExpenses')}
                  </label>
                  <input
                    id="exp-misc-input"
                    type="number"
                    min="0"
                    value={expenditures.misc}
                    onChange={(e) =>
                      setExpenditures({ ...expenditures, misc: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-mono bg-[#FCFBF9]"
                  />
                </div>
              </div>

              {/* Total Deductions Bar */}
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-900">
                  {t('totalOtherDeductions')}:
                </span>
                <span className="font-mono font-bold text-rose-800">
                  ₹{totalOtherExpenditures.toLocaleString('en-IN')}
                </span>
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
              <span className="text-xs text-white/80">Gross minus Commission & Other Charges</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              ₹{farmerNetPayable.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Payment Status & Settlement */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2E6349] block">
              5. {t('paymentSettlementNow')}
            </label>

            {/* Payment Status Toggle (Paid, Partial, Unpaid) */}
            <div className="grid grid-cols-3 gap-2">
              {(['Paid', 'Partial', 'Unpaid'] as PaymentStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  id={`payment-status-btn-${status}`}
                  onClick={() => setPaymentStatus(status)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center ${
                    paymentStatus === status
                      ? status === 'Paid'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : status === 'Partial'
                        ? 'bg-[#DD9F2F] text-[#2A1F1A] border-[#DD9F2F] shadow-2xs'
                        : 'bg-[#C2255C] text-white border-[#C2255C] shadow-2xs'
                      : 'bg-[#FCFBF9] text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#F4EFEA]'
                  }`}
                >
                  {status === 'Paid'
                    ? t('statusPaid')
                    : status === 'Partial'
                    ? t('statusPartial')
                    : t('statusUnpaid')}
                </button>
              ))}
            </div>

            {/* If Paid or Partial: Amount Paid & Mode */}
            {paymentStatus !== 'Unpaid' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                    {t('amountPaidNow')}
                  </label>
                  <input
                    id="lot-amount-paid-input"
                    type="number"
                    min="0"
                    max={farmerNetPayable}
                    value={amountPaidNow}
                    onChange={(e) =>
                      setAmountPaidNow(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs font-mono font-bold bg-[#FCFBF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                    {t('paymentModeLabel')}
                  </label>
                  <select
                    id="lot-payment-mode-select"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-[#FCFBF9]"
                  >
                    <option value="Cash">{t('cash')}</option>
                    <option value="UPI">{t('upi')}</option>
                    <option value="Bank Transfer">{t('bankTransfer')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                    {t('referenceNumber')}
                  </label>
                  <input
                    id="lot-ref-input"
                    type="text"
                    placeholder="e.g. UTR-491028301"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs font-mono bg-[#FCFBF9]"
                  />
                </div>
              </div>
            )}

            {/* Remaining Balance Indicator */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs">
              <span className="text-[#6B5E57]">{t('balanceDue')}:</span>
              <span
                className={`font-mono font-bold text-sm ${
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
          <p className="text-xs text-[#6B5E57]">
            Generates APMC Form C lot bill with instant thermal printer support and WhatsApp share.
          </p>

          <button
            type="submit"
            id="save-and-generate-parchi-btn"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2E6349] text-white font-black text-sm hover:bg-[#1F4532] transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
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
