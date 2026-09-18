import React, { useState } from 'react';
import {
  Store,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  Volume2,
  Check,
  ChevronRight,
  AlertCircle,
  Mail,
  Lock,
  KeyRound,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { Language, CommodityCategory, WeightUnit } from '../../types';
import { sounds, speakText } from '../../utils/audio';
import { COMMODITY_CONFIGS } from '../../data/initialData';

type Role = 'farmer' | 'merchant';
type AuthStep = 'step1-role' | 'step2-auth' | 'step2-otp' | 'step2-profile' | 'step3-commodities';
type AuthMethod = 'phone' | 'email';

interface Props {
  onComplete: () => void;
}

export const OnboardingAuthScreen: React.FC<Props> = ({ onComplete }) => {
  const {
    language,
    setLanguage,
    setPortalMode,
    merchantProfile,
    updateMerchantProfile,
    addFarmer,
    setActiveFarmerId,
    registeredAccounts,
    registerNewAccount,
    switchUserAccount,
    checkUniqueness,
    setUserCommodities,
  } = useMandi();

  // Step state
  const [step, setStep] = useState<AuthStep>('step1-role');
  const [selectedRole, setSelectedRole] = useState<Role>('farmer');

  // Step 2: Phone / Email & Auth state
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(['4', '3', '2', '1']);
  const [isOtpSending, setIsOtpSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Profile setup fields
  const [name, setName] = useState<string>('');
  const [shopOrVillage, setShopOrVillage] = useState<string>('');
  const [shopAddress, setShopAddress] = useState<string>('');
  const [shopNumber, setShopNumber] = useState<string>('');
  const [marketName, setMarketName] = useState<string>('');

  // Step 3: Commodity Selection & Optional Preferred Units (User chooses 1 or more)
  const [selectedCommodities, setSelectedCommodities] = useState<CommodityCategory[]>([
    'flowers',
  ]);

  const [preferredUnits, setPreferredUnits] = useState<Record<CommodityCategory, WeightUnit>>({
    flowers: 'Kgs',
    grains: 'Bags',
    vegetables: 'Crates',
    fruits: 'Boxes',
  });

  // Content per language
  const content = {
    en: {
      appName: 'Agricultural Marketplace Settlement Tracker',
      appSub: 'Multi-Commodity Settlement & Ledger for Farmers & Merchants',
      step1Badge: 'Step 1 of 3: Role Selection',
      step1Title: 'Sign Up / Login to AgriMarket',
      step1Sub: 'Choose your role in the agricultural marketplace:',
      farmerTitle: 'FARMER / GROWER (Kisan)',
      farmerDesc: 'I grow and bring agricultural commodities to the mandi and sell them.',
      farmerBtn: 'Continue as Farmer',
      farmerFeatures: [
        'Track sales for any commodity (Flowers, Grains, Veggies, Fruits)',
        'View net earnings and payment status',
        'Download instant settlement slips (Parchi)',
      ],
      merchantTitle: 'MERCHANT / MANDI SHOP OWNER (Vyapari/Adathiya)',
      merchantDesc: 'I run a shop/auction center in the mandi and handle consignments from farmers.',
      merchantBtn: 'Continue as Merchant',
      merchantFeatures: [
        'Manage multiple farmer consignments & lots',
        'Flexible per-transaction deductions & commission',
        'Print-ready professional settlement ledgers',
      ],
      step2Badge: 'Step 2 of 3: Authentication',
      step2Title: 'Phone Number / Email Verification',
      step2Sub: 'Sign in or create your isolated agricultural ledger account',
      phoneTab: 'Mobile Number',
      emailTab: 'Email Address',
      phoneLabel: 'Mobile Number',
      emailLabel: 'Email Address',
      passwordLabel: 'Create Password / PIN',
      passwordHint: 'Used to secure your transactions and settlements',
      sendOtpBtn: 'Send 4-Digit Verification Code',
      otpTitle: 'Enter Verification Code',
      otpSub: 'Enter the 4-digit code sent to ',
      verifyBtn: 'Verify & Continue',
      profileTitle: 'Complete Your Profile',
      profileSub: 'Setup your identity on the Mandi ledger',
      fullName: 'Full Name *',
      shopName: 'Shop / Firm Name *',
      shopAddress: 'Shop / Yard Address *',
      villageName: 'Village Name *',
      step3Badge: 'Step 3 of 3: Select Commodities',
      step3Title: 'Select Commodities You Work With',
      step3Sub: 'Choose the crops and produce you grow or trade (select multiple):',
      unitOptionTitle: 'Preferred Unit (Optional)',
      completeBtn: 'Complete Setup & Enter Dashboard',
      backBtn: 'Back',
      selectAll: 'Select All 4',
    },
    te: {
      appName: 'వ్యవసాయ మార్కెట్ సెటిల్మెంట్ ట్రాకర్',
      appSub: 'రైతులు మరియు వ్యాపారుల కోసం మల్టీ-కమోడిటీ లెడ్జర్',
      step1Badge: 'దశ 1: పాత్రను ఎంచుకోండి',
      step1Title: 'సైన్ అప్ / లాగిన్',
      step1Sub: 'వ్యవసాయ మార్కెట్లో మీ పాత్రను ఎంచుకోండి:',
      farmerTitle: 'రైతు / సాగుదారుడు (కిసాన్)',
      farmerDesc: 'నేను వ్యవసాయ ఉత్పత్తులను పండించి మండీలో విక్రయిస్తాను.',
      farmerBtn: 'రైతుగా కొనసాగండి',
      farmerFeatures: [
        'అన్ని పంటల అమ్మకాలను ట్రాక్ చేయండి (పూలు, ధాన్యాలు, కూరగాయలు, పండ్లు)',
        'నికర ఆదాయం మరియు చెల్లింపు వివరాలను చూడండి',
        'సెటిల్మెంట్ పట్టీలను డౌన్‌లోడ్ చేసుకోండి',
      ],
      merchantTitle: 'మండి వ్యాపారి / ఆడ్తీ (వ్యాపారి/ఆడత్యా)',
      merchantDesc: 'నాకు మండీలో షాపు/వేలం కేంద్రం ఉంది, రైతుల నుండి సరుకులను నిర్వహిస్తాను.',
      merchantBtn: 'వ్యాపారిగా కొనసాగండి',
      merchantFeatures: [
        'బహుళ రైతుల సరుకులు మరియు లాట్‌లను నిర్వహించండి',
        'ప్రతి అమ్మకానికి సులభమైన తగ్గింపులు మరియు కమీషన్',
        'ప్రింట్-రెడీ సెటిల్మెంట్ లెడ్జర్ నివేదికలు',
      ],
      step2Badge: 'దశ 2: ధృవీకరణ',
      step2Title: 'మొబైల్ లేదా ఈమెయిల్ ధృవీకరణ',
      step2Sub: 'మీ ప్రైవేట్ వ్యవసాయ లెడ్జర్ ఖాతాను సృష్టించండి',
      phoneTab: 'మొబైల్ నంబర్',
      emailTab: 'ఈమెయిల్',
      phoneLabel: 'మొబైల్ నంబర్',
      emailLabel: 'ఈమెయిల్ చిరునామా',
      passwordLabel: 'పాస్‌వర్డ్ / పిన్ సృష్టించండి',
      passwordHint: 'మీ ఖాతా భద్రత కోసం ఉపయోగించబడుతుంది',
      sendOtpBtn: '4 అంకెల OTP కోడ్ పంపండి',
      otpTitle: 'OTP కోడ్ నమోదు చేయండి',
      otpSub: 'ఈ నంబరుకు OTP పంపాము: ',
      verifyBtn: 'ధృవీకరించి కొనసాగించండి',
      profileTitle: 'ప్రొఫైల్ వివరాలు పూర్తి చేయండి',
      profileSub: 'మండీ లెడ్జర్‌లో మీ గుర్తింపును నమోదు చేయండి',
      fullName: 'పూర్తి పేరు *',
      shopName: 'దుకాణం / సంస్థ పేరు *',
      shopAddress: 'దుకాణం చిరునామా *',
      villageName: 'గ్రామం పేరు *',
      step3Badge: 'దశ 3: పంటల ఎంపిక',
      step3Title: 'మీరు పని చేసే పంట రకాలను ఎంచుకోండి',
      step3Sub: 'మీరు పండించే లేదా అమ్మే పంటలను ఎంచుకోండి (ఒకటి కంటే ఎక్కువ ఎంచుకోవచ్చు):',
      unitOptionTitle: 'ఇష్టపడే యూనిట్ (ఐచ్ఛికం)',
      completeBtn: 'సెటప్ పూర్తి చేసి డాష్‌బోర్డ్‌లోకి ప్రవేశించండి',
      backBtn: 'వెనుకకు',
      selectAll: 'అన్నిటినీ ఎంచుకోండి',
    },
    hi: {
      appName: 'कृषि मंडी सेटलमेंट लेजर',
      appSub: 'किसान और आढ़तियों के लिए बहु-फसल मंडी सेटलमेंट ट्रैकर',
      step1Badge: 'चरण 1: भूमिका चुनें',
      step1Title: 'साइन अप / लॉगिन',
      step1Sub: 'कृषि बाजार में अपनी भूमिका चुनें:',
      farmerTitle: 'किसान / उत्पादक',
      farmerDesc: 'मैं कृषि उपज उगाता हूँ और मंडी में बिक्री के लिए लाता हूँ।',
      farmerBtn: 'किसान के रूप में आगे बढ़ें',
      farmerFeatures: [
        'किसी भी फसल के विक्रय को ट्रैक करें (फूल, अनाज, सब्जियां, फल)',
        'कुल शुद्ध आय और भुगतान स्थिति देखें',
        'तुरंत सेटलमेंट पर्ची डाउनलोड करें',
      ],
      merchantTitle: 'मंडी आढ़ती / व्यापारी',
      merchantDesc: 'मंडी में मेरी दुकान/नीलामी केंद्र है और किसानों का माल संभालता हूँ।',
      merchantBtn: 'आढ़ती के रूप में आगे बढ़ें',
      merchantFeatures: [
        'कई किसानों और माल का सुचारू प्रबंधन',
        'प्रति लेन-देन कमीशन और कटौती की सुविधा',
        'प्रिंट-तैयार पेशेवर सेटलमेंट लेजर',
      ],
      step2Badge: 'चरण 2: सत्यापन',
      step2Title: 'मोबाइल या ईमेल सत्यापन',
      step2Sub: 'अपना सुरक्षित कृषि लेजर खाता बनाएं या लॉगिन करें',
      phoneTab: 'मोबाइल नंबर',
      emailTab: 'ईमेल पता',
      phoneLabel: 'मोबाइल नंबर',
      emailLabel: 'ईमेल पता',
      passwordLabel: 'पासवर्ड / पिन बनाएं',
      passwordHint: 'खाते की सुरक्षा के लिए',
      sendOtpBtn: '4 अंकों का कोड भेजें',
      otpTitle: 'सत्यापन कोड दर्ज करें',
      otpSub: 'सत्यापन कोड भेजा गया: ',
      verifyBtn: 'सत्यापित कर आगे बढ़ें',
      profileTitle: 'प्रोफ़ाइल विवरण भरें',
      profileSub: 'मंडी लेजर में अपनी पहचान दर्ज करें',
      fullName: 'पूरा नाम *',
      shopName: 'दुकान / फर्म का नाम *',
      shopAddress: 'दुकान का पूरा पता *',
      villageName: 'गांव का नाम *',
      step3Badge: 'चरण 3: फसल चयन',
      step3Title: 'वे फसलें चुनें जिनमें आप कार्य करते हैं',
      step3Sub: 'सभी फसलें चुनें जो आप उगाते या व्यापार करते हैं (एक से अधिक चुन सकते हैं):',
      unitOptionTitle: 'पसंदीदा इकाई (वैकल्पिक)',
      completeBtn: 'सेटअप पूरा करें और डैशबोर्ड में जाएं',
      backBtn: 'पीछे',
      selectAll: 'सभी चुनें',
    },
  }[language];

  // Voice assistant
  const handleVoiceHelp = () => {
    let msg = '';
    if (step === 'step1-role') {
      msg =
        language === 'te'
          ? 'మీరు రైతు అయితే "రైతుగా కొనసాగండి" నొక్కండి. మీరు మండీ వ్యాపారి అయితే "వ్యాపారిగా కొనసాగండి" నొక్కండి.'
          : 'Choose Continue as Farmer if you grow crops, or Continue as Merchant if you run a shop in the mandi.';
    } else if (step === 'step3-commodities') {
      msg =
        language === 'te'
          ? 'మీరు వ్యాపారం చేసే పంటలను ఎంచుకోండి: పూలు, ధాన్యాలు, కూరగాయలు మరియు పండ్లు.'
          : 'Select the commodities you work with, then click Complete Setup to enter your dashboard.';
    } else {
      msg =
        language === 'te'
          ? 'మీ ఫోన్ నంబర్ నమోదు చేసి OTP ద్వారా లాగిన్ అవ్వండి.'
          : 'Enter your mobile number or email to access your ledger.';
    }
    speakText(msg, language);
  };

  const handleSelectRole = (role: Role) => {
    sounds.playBidTick();
    setSelectedRole(role);
    setStep('step2-auth');
  };

  const handleSendOtp = () => {
    setErrorMsg('');
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (authMethod === 'phone') {
      if (cleanPhone.length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number');
        return;
      }
    } else {
      if (!email.includes('@') || !email.includes('.')) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
    }

    setIsOtpSending(true);
    sounds.playBidTick();

    setTimeout(() => {
      setIsOtpSending(false);
      setOtp(['4', '3', '2', '1']);
      setStep('step2-otp');
      sounds.playCashChime();
    }, 400);
  };

  const handleVerifyOtp = () => {
    const entered = otp.join('');
    if (entered.length < 4) {
      setErrorMsg('Please enter 4 digits');
      return;
    }

    setIsVerifying(true);
    sounds.playCashChime();

    setTimeout(() => {
      setIsVerifying(false);
      const cleanIdentifier =
        authMethod === 'phone'
          ? phone.replace(/\D/g, '').slice(-10)
          : email.trim().toLowerCase();

      // Check existing account
      const existingAccount = registeredAccounts.find(
        (a) =>
          a.phoneNumber.replace(/\D/g, '').slice(-10) === cleanIdentifier ||
          a.phoneNumber === cleanIdentifier
      );

      if (existingAccount) {
        switchUserAccount(cleanIdentifier);
        setPortalMode(existingAccount.role);
        setSelectedRole(existingAccount.role);
        setStep('step3-commodities');
        sounds.playBidTick();
      } else {
        setName('');
        setShopOrVillage('');
        setShopAddress('');
        setShopNumber('');
        setMarketName('Agri APMC Market Yard');
        setValidationError('');
        setStep('step2-profile');
      }
    }, 450);
  };

  const handleSaveProfile = () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10) || '9876543210';

    if (!name.trim()) {
      setValidationError('Please enter your full name');
      return;
    }

    if (/[0-9]/.test(name)) {
      setValidationError('Names cannot contain numbers');
      return;
    }

    if (selectedRole === 'merchant') {
      if (!shopOrVillage.trim()) {
        setValidationError('Please enter your shop or firm name');
        return;
      }
      if (!shopAddress.trim()) {
        setValidationError('Please enter your shop / yard address');
        return;
      }

      const uniqueness = checkUniqueness({
        shopName: shopOrVillage.trim(),
        shopAddress: shopAddress.trim(),
        phoneNumber: cleanPhone,
      });

      if (!uniqueness.valid) {
        setValidationError(uniqueness.message || 'Shop name or address is already taken');
        return;
      }
    } else {
      if (!shopOrVillage.trim()) {
        setValidationError('Please enter your village name');
        return;
      }
    }

    setValidationError('');
    sounds.playCashChime();
    setStep('step3-commodities');
  };

  const toggleCommodity = (cat: CommodityCategory) => {
    sounds.playBidTick();
    setSelectedCommodities((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  const handleCompleteSetup = () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10) || '9876543210';
    const primaryCropsList = selectedCommodities.map((c) => COMMODITY_CONFIGS[c].name);

    if (selectedRole === 'merchant') {
      registerNewAccount({
        role: 'merchant',
        fullName: name.trim() || 'Mandi Merchant',
        phoneNumber: cleanPhone,
        shopOrVillage: shopOrVillage.trim() || 'Mandi Trading Co.',
        shopAddress: shopAddress.trim() || 'APMC Market Yard',
        shopNumber: shopNumber.trim() || 'Shop 1',
        marketName: marketName.trim() || 'Agri APMC Market Yard',
        licenseOrCrop: selectedCommodities.join(', '),
      });

      updateMerchantProfile({
        ownerName: name.trim() || 'Mandi Merchant',
        shopName: shopOrVillage.trim() || 'Mandi Trading Co.',
        shopNumber: shopNumber.trim() || 'Shop 1',
        apmcMarketName: marketName.trim() || 'Agri APMC Market Yard',
        phoneNumber: `+91 ${cleanPhone}`,
        address: shopAddress.trim() || 'APMC Market Yard',
      });

      setPortalMode('merchant');
    } else {
      registerNewAccount({
        role: 'farmer',
        fullName: name.trim() || 'Kisan Grower',
        phoneNumber: cleanPhone,
        shopOrVillage: shopOrVillage.trim() || 'Green Valley Village',
        licenseOrCrop: primaryCropsList.join(', '),
      });

      const newFarmer = addFarmer({
        name: name.trim() || 'Kisan Grower',
        phone: cleanPhone,
        village: shopOrVillage.trim() || 'Green Valley Village',
        primaryCrops: primaryCropsList,
        connectedMerchantIds: [merchantProfile.merchantId],
      });

      setActiveFarmerId(newFarmer.id);
      setPortalMode('farmer');
    }

    try {
      localStorage.setItem('phoolmitra_onboarding_completed', 'true');
      localStorage.setItem('phoolmitra_user_role', selectedRole);
      localStorage.setItem('phoolmitra_active_phone_v1', cleanPhone);
      localStorage.setItem('phoolmitra_user_commodities', JSON.stringify(selectedCommodities));
      localStorage.setItem('phoolmitra_preferred_units', JSON.stringify(preferredUnits));
    } catch {
      // ignore
    }

    setUserCommodities(selectedCommodities);
    sounds.playGavelStrike();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between p-3 sm:p-6 text-[#2A1F1A]">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#2E6349] flex items-center justify-center text-[#DD9F2F] shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg tracking-tight text-[#2E6349] leading-tight">
              {content.appName}
            </h1>
            <p className="text-[10px] text-[#6B5E57] font-semibold">{content.appSub}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceHelp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#2A1F1A] text-xs font-bold transition border border-amber-300 shadow-2xs cursor-pointer"
            title="Voice Guide"
          >
            <Volume2 className="w-4 h-4 text-[#DD9F2F]" />
            <span className="hidden sm:inline">వాయిస్ సహాయం</span>
          </button>

          <div className="flex items-center bg-white rounded-xl border border-[#E8E2D9] p-0.5 shadow-2xs">
            {(['te', 'hi', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  sounds.playBidTick();
                  setLanguage(lang);
                }}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                  language === lang
                    ? 'bg-[#2E6349] text-white shadow-2xs'
                    : 'text-[#6B5E57] hover:text-[#2A1F1A]'
                }`}
              >
                {lang === 'te' ? 'తెలుగు' : lang === 'hi' ? 'हिंदी' : 'EN'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Flow Area */}
      <div className="max-w-2xl w-full mx-auto my-auto py-6 space-y-6">
        {/* ================= STEP 1: ROLE SELECTION LANDING PAGE ================= */}
        {step === 'step1-role' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D9] shadow-md space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#2E6349] bg-[#E9F3EE] px-3 py-1 rounded-full inline-block">
                {content.step1Badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2A1F1A]">
                {content.step1Title}
              </h2>
              <p className="text-sm text-[#6B5E57] font-medium">{content.step1Sub}</p>
            </div>

            {/* Two Distinct Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: FARMER / GROWER */}
              <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#E8E2D9] bg-[#FCFBF9] hover:border-[#2E6349] transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-black flex items-center justify-center shadow-sm">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#2A1F1A]">{content.farmerTitle}</h3>
                    <p className="text-xs text-[#2A1F1A] mt-1.5 italic bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      &ldquo;{content.farmerDesc}&rdquo;
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-xs text-[#6B5E57] font-medium pt-1">
                    {content.farmerFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6349] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  id="btn-continue-farmer"
                  onClick={() => handleSelectRole('farmer')}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-sm transition shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>{content.farmerBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Option 2: MERCHANT / MANDI SHOP OWNER */}
              <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#E8E2D9] bg-[#FCFBF9] hover:border-[#2E6349] transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2E6349] text-[#DD9F2F] flex items-center justify-center shadow-sm">
                    <Store className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#2A1F1A]">{content.merchantTitle}</h3>
                    <p className="text-xs text-[#2A1F1A] mt-1.5 italic bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      &ldquo;{content.merchantDesc}&rdquo;
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-xs text-[#6B5E57] font-medium pt-1">
                    {content.merchantFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6349] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  id="btn-continue-merchant"
                  onClick={() => handleSelectRole('merchant')}
                  className="w-full py-3 px-4 rounded-xl bg-[#2E6349] hover:bg-[#234d39] text-white font-black text-sm transition shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>{content.merchantBtn}</span>
                  <ArrowRight className="w-4 h-4 text-[#DD9F2F]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PHONE / EMAIL AUTHENTICATION ================= */}
        {step === 'step2-auth' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D9] shadow-md space-y-6">
            <div className="text-center space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#2E6349] bg-[#E9F3EE] px-3 py-1 rounded-full">
                  {content.step2Badge}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 capitalize">
                  Role: {selectedRole}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2A1F1A]">
                {content.step2Title}
              </h2>
              <p className="text-sm text-[#6B5E57] font-medium">{content.step2Sub}</p>
            </div>

            {/* Auth Method Switcher (Phone vs Email) */}
            <div className="flex rounded-xl bg-[#F8F6F0] p-1 border border-[#E8E2D9]">
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                  authMethod === 'phone'
                    ? 'bg-[#2E6349] text-white shadow-xs'
                    : 'text-[#6B5E57] hover:text-[#2A1F1A]'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>{content.phoneTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                  authMethod === 'email'
                    ? 'bg-[#2E6349] text-white shadow-xs'
                    : 'text-[#6B5E57] hover:text-[#2A1F1A]'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>{content.emailTab}</span>
              </button>
            </div>

            {/* Input fields */}
            <div className="space-y-4">
              {authMethod === 'phone' ? (
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block mb-1">
                    {content.phoneLabel}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center gap-1 text-base sm:text-lg font-black text-[#6B5E57] border-r border-[#E8E2D9] pr-3">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(clean);
                        setErrorMsg('');
                      }}
                      placeholder="9849012345"
                      className="w-full pl-22 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-xl font-mono font-black text-[#2A1F1A] outline-none"
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block mb-1">
                    {content.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="kisan@mandiledger.com"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-base font-bold text-[#2A1F1A] outline-none"
                    autoFocus
                  />
                </div>
              )}

              {/* Password / PIN setup */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block mb-1">
                  {content.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-base font-bold text-[#2A1F1A] outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#6B5E57] mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2E6349]" />
                  <span>{content.passwordHint}</span>
                </p>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('step1-role')}
                className="py-3.5 px-5 rounded-2xl border border-[#E8E2D9] bg-white hover:bg-[#F4EFEA] text-[#2A1F1A] font-bold text-sm transition cursor-pointer"
              >
                {content.backBtn}
              </button>

              <button
                type="button"
                id="btn-send-otp"
                onClick={handleSendOtp}
                disabled={isOtpSending}
                className="flex-1 py-4 px-6 rounded-2xl bg-[#2E6349] hover:bg-[#234d39] text-white font-black text-base sm:text-lg transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <span>{content.sendOtpBtn}</span>
                <ArrowRight className="w-5 h-5 text-[#DD9F2F]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2-OTP: OTP Verification */}
        {step === 'step2-otp' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D9] shadow-md space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#2E6349] bg-[#E9F3EE] px-3 py-1 rounded-full inline-block">
                Verification Code
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2A1F1A]">
                {content.otpTitle}
              </h2>
              <p className="text-sm text-[#6B5E57] font-medium">
                {content.otpSub} <strong>{authMethod === 'phone' ? `+91 ${phone}` : email}</strong>
              </p>
            </div>

            {/* 4 Digit Boxes */}
            <div className="flex justify-center gap-3 sm:gap-4 my-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newOtp = [...otp];
                    newOtp[idx] = val;
                    setOtp(newOtp);
                    if (val && idx < 3) {
                      document.getElementById(`otp-${idx + 1}`)?.focus();
                    }
                  }}
                  className="w-14 h-16 sm:w-16 sm:h-18 text-center text-3xl font-mono font-black rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] bg-[#FCFBF9] text-[#2A1F1A] outline-none"
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-bold text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('step2-auth')}
                className="py-3.5 px-5 rounded-2xl border border-[#E8E2D9] bg-white hover:bg-[#F4EFEA] text-[#2A1F1A] font-bold text-sm transition cursor-pointer"
              >
                {content.backBtn}
              </button>

              <button
                type="button"
                id="btn-verify-otp"
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="flex-1 py-4 px-6 rounded-2xl bg-[#2E6349] hover:bg-[#234d39] text-white font-black text-base sm:text-lg transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
              >
                <span>{content.verifyBtn}</span>
                <ArrowRight className="w-5 h-5 text-[#DD9F2F]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2-PROFILE: Complete Profile */}
        {step === 'step2-profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D9] shadow-md space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#2E6349] bg-[#E9F3EE] px-3 py-1 rounded-full inline-block">
                Setup Profile
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2A1F1A]">
                {content.profileTitle}
              </h2>
              <p className="text-sm text-[#6B5E57] font-medium">{content.profileSub}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6B5E57] block mb-1">
                  {content.fullName} <span className="text-[10px] text-gray-400 font-normal">(letters only)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onKeyDown={(e) => {
                    if (/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const clean = e.clipboardData.getData('text').replace(/[0-9]/g, '');
                    setName(clean);
                  }}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[0-9]/g, '');
                    setName(cleaned);
                  }}
                  placeholder={selectedRole === 'merchant' ? 'e.g., Ramesh Gupta' : 'e.g., Venkatesh Reddy'}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm font-bold text-[#2A1F1A] focus:outline-none focus:border-[#2E6349]"
                />
              </div>

              {selectedRole === 'merchant' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-[#6B5E57] block mb-1">
                      {content.shopName}
                    </label>
                    <input
                      type="text"
                      value={shopOrVillage}
                      onChange={(e) => setShopOrVillage(e.target.value)}
                      placeholder="e.g., Sri Laxmi Agri Traders"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm font-bold text-[#2A1F1A] focus:outline-none focus:border-[#2E6349]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#6B5E57] block mb-1">
                      {content.shopAddress}
                    </label>
                    <input
                      type="text"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      placeholder="e.g., Stall 12, APMC Wholesale Market"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm font-bold text-[#2A1F1A] focus:outline-none focus:border-[#2E6349]"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-bold text-[#6B5E57] block mb-1">
                    {content.villageName}
                  </label>
                  <input
                    type="text"
                    value={shopOrVillage}
                    onChange={(e) => setShopOrVillage(e.target.value)}
                    placeholder="e.g., Narsapur, Medak District"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm font-bold text-[#2A1F1A] focus:outline-none focus:border-[#2E6349]"
                  />
                </div>
              )}

              {validationError && (
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationError}</span>
                </p>
              )}
            </div>

            <button
              type="button"
              id="btn-save-profile"
              onClick={handleSaveProfile}
              className="w-full py-4 px-6 rounded-2xl bg-[#2E6349] hover:bg-[#234d39] text-white font-black text-base sm:text-lg transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <span>Continue to Commodities</span>
              <ArrowRight className="w-5 h-5 text-[#DD9F2F]" />
            </button>
          </div>
        )}

        {/* ================= STEP 3: SELECT COMMODITIES YOU WORK WITH ================= */}
        {step === 'step3-commodities' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D9] shadow-md space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#2E6349] bg-[#E9F3EE] px-3 py-1 rounded-full inline-block">
                {content.step3Badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2A1F1A]">
                {content.step3Title}
              </h2>
              <p className="text-sm text-[#6B5E57] font-medium">{content.step3Sub}</p>
            </div>

            {/* Quick select all */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  sounds.playBidTick();
                  setSelectedCommodities(['flowers', 'grains', 'vegetables', 'fruits']);
                }}
                className="text-xs font-bold text-[#2E6349] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#2E6349]" />
                <span>{content.selectAll}</span>
              </button>
            </div>

            {/* 4 Commodity Selection Grid (With Optional Unit Selectors) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(['flowers', 'grains', 'vegetables', 'fruits'] as CommodityCategory[]).map((cat) => {
                const config = COMMODITY_CONFIGS[cat];
                const isSelected = selectedCommodities.includes(cat);

                return (
                  <div
                    key={cat}
                    onClick={() => toggleCommodity(cat)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2E6349] bg-[#E9F3EE]/50 shadow-sm ring-2 ring-[#2E6349]/20'
                        : 'border-[#E8E2D9] bg-white hover:border-[#2E6349]/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{config.icon}</span>
                        <div>
                          <h4 className="text-base font-black text-[#2A1F1A]">
                            {config.name}
                          </h4>
                          <p className="text-[11px] text-[#6B5E57] font-medium">
                            {config.allowedUnits.join(', ')}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                          isSelected
                            ? 'bg-[#2E6349] border-[#2E6349] text-white'
                            : 'border-[#E8E2D9] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Optional: Preferred Unit for this commodity */}
                    {isSelected && (
                      <div
                        className="mt-3 pt-2.5 border-t border-[#E8E2D9]/70 flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] font-bold text-[#6B5E57] uppercase">
                          {content.unitOptionTitle}:
                        </span>
                        <select
                          value={preferredUnits[cat]}
                          onChange={(e) => {
                            const val = e.target.value as WeightUnit;
                            setPreferredUnits((prev) => ({ ...prev, [cat]: val }));
                          }}
                          className="px-2 py-1 rounded-lg border border-[#E8E2D9] bg-white text-xs font-bold text-[#2A1F1A] focus:outline-none focus:border-[#2E6349]"
                        >
                          {config.allowedUnits.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Complete Setup Action Button */}
            <div className="pt-3">
              <button
                type="button"
                id="btn-complete-setup"
                onClick={handleCompleteSetup}
                className="w-full py-4 px-6 rounded-2xl bg-[#2E6349] hover:bg-[#234d39] text-white font-black text-lg sm:text-xl transition shadow-md flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer"
              >
                <span>{content.completeBtn}</span>
                <ArrowRight className="w-6 h-6 text-[#DD9F2F]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="max-w-4xl w-full mx-auto text-center py-2 text-xs text-[#6B5E57] font-medium">
        <span>AgriMarket Settlement Ledger • Multi-Commodity Platform</span>
      </div>
    </div>
  );
};
