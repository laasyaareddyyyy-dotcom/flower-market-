import React, { useState, useEffect } from 'react';
import {
  Store,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  MapPin,
  FileText,
  Volume2,
  Languages,
  Check,
  ChevronRight,
  AlertCircle,
  Clock,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { Language, RegisteredAccount } from '../../types';
import { sounds, speakText } from '../../utils/audio';

type Role = 'merchant' | 'farmer';
type Step = 'role-select' | 'phone-input' | 'otp-verify' | 'profile-setup';

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
    farmers,
    addFarmer,
    setActiveFarmerId,
    registeredAccounts,
    registerNewAccount,
    switchUserAccount,
    checkUniqueness,
  } = useMandi();

  const [step, setStep] = useState<Step>('role-select');
  const [selectedRole, setSelectedRole] = useState<Role>('merchant');

  // Phone & OTP state
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
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
  const [licenseOrCrop, setLicenseOrCrop] = useState<string>('');

  // Helper text per language
  const content = {
    en: {
      welcome: 'APMC Flower Mandi Ledger',
      welcomeSubtitle: 'Simple, trusted flower trading & digital khata ledger',
      chooseRole: 'Who are you entering as?',
      chooseRoleSub: 'Select your role with a single tap:',
      merchantTitle: 'Mandi Commission Agent (Adathiya)',
      merchantSub: 'I run a flower shop in APMC market and auction consignments.',
      merchantBadge: 'Shop Owner / Vyapari',
      farmerTitle: 'Flower Farmer / Grower (Kisan)',
      farmerSub: 'I grow flowers and bring consignments to the mandi.',
      farmerBadge: 'Rythu / Grower',
      seniorHint: 'Designed for effortless use with large buttons, high contrast, and voice assistance.',
      continueBtn: 'Continue with Selected Role',
      phoneStepTitle: 'Mobile Verification',
      phoneStepSub: 'Enter your 10-digit mobile number for instant verification',
      mobileLabel: 'Mobile Number',
      sendOtpBtn: 'Send 4-Digit Verification Code',
      demoPhoneHint: 'Each mobile number gets its own completely isolated data ledger',
      otpTitle: 'Enter Verification Code',
      otpSub: 'We sent an instant 4-digit code to +91 ',
      resendCode: 'Resend Code',
      verifyBtn: 'Verify & Enter Mandi',
      welcomeVerified: 'Verification Successful!',
      setupTitle: 'New Registration & Shop Profile',
      setupSub: 'Every shop name and address must be unique in the mandi',
      fullName: 'Full Name (వ్యక్తి పేరు)',
      shopName: 'Shop / Firm Name (దుకాణం పేరు)',
      shopAddress: 'Shop / Stall Address (దుకాణం చిరునామా)',
      shopNumber: 'Shop / Stall Number',
      marketName: 'APMC Flower Market Yard Name',
      villageName: 'Village Name (గ్రామం)',
      licenseNo: 'APMC License Number (Optional)',
      cropGrown: 'Primary Flower Crop',
      finishBtn: 'Enter Mandi App Now',
      existingUserFound: 'Existing account found! Logging you into your private ledger...',
      addressUniqueHint: 'Each merchant shop must have a distinct unique name & address.',
    },
    te: {
      welcome: 'పూల మండి డిజిటల్ లెడ్జర్ (PhoolMitra)',
      welcomeSubtitle: 'రైతులు మరియు వ్యాపారుల కోసం సులభమైన పూల రికార్డు పుస్తకం',
      chooseRole: 'మీరు ఎవరిగా ప్రవేశిస్తున్నారు?',
      chooseRoleSub: 'కింద ఉన్న బటన్‌ను నొక్కండి:',
      merchantTitle: 'మండి కమిషన్ వ్యాపారి (ఆడత్యా)',
      merchantSub: 'నాకు మార్కెట్లో పూల దుకాణం ఉంది, వేలంపాట నిర్వహిస్తాను.',
      merchantBadge: 'దుకాణ యజమాని / వ్యాపారి',
      farmerTitle: 'పూల రైతు / సాగుదారుడు (కిసాన్)',
      farmerSub: 'నేను పువ్వులు పండించి మండీకి అమ్ముకోవడానికి తీసుకువస్తాను.',
      farmerBadge: 'రైతు / పూల పెంపకందారుడు',
      seniorHint: 'పెద్ద అక్షరాలు, సులభమైన బటన్లు మరియు వాయిస్ సహాయంతో ఎవరైనా సులభంగా వాడవచ్చు.',
      continueBtn: 'ఎంచుకున్న పాత్రతో కొనసాగించండి',
      phoneStepTitle: 'మొబైల్ ధృవీకరణ',
      phoneStepSub: 'మీ 10 అంకెల మొబైల్ నంబరును నమోదు చేయండి',
      mobileLabel: 'మొబైల్ నంబర్',
      sendOtpBtn: 'OTP కోడ్ పంపండి',
      demoPhoneHint: 'ప్రతి మొబైల్ నంబరుకు వేర్వేరు రికార్డులు మరియు డేటా ఉంటాయి',
      otpTitle: 'OTP కోడ్‌ను నమోదు చేయండి',
      otpSub: 'ఈ నంబరుకు 4 అంకెల కోడ్ పంపాము: +91 ',
      resendCode: 'మరలా కోడ్ పంపండి',
      verifyBtn: 'ధృవీకరించి మండీలోకి వెళ్లండి',
      welcomeVerified: 'ధృవీకరణ విజయవంతమైంది!',
      setupTitle: 'నమోదు & దుకాణ వివరాలు',
      setupSub: 'ప్రతి దుకాణానికి ప్రత్యేకమైన పేరు మరియు చిరునామా ఉండాలి',
      fullName: 'పూర్తి పేరు',
      shopName: 'దుకాణం / సంస్థ పేరు',
      shopAddress: 'దుకాణం పూర్తి చిరునామా',
      shopNumber: 'షాపు నంబరు',
      marketName: 'APMC మార్కెట్ పేరు',
      villageName: 'గ్రామం పేరు',
      licenseNo: 'APMC లైసెన్స్ నంబర్ (ఐచ్ఛికం)',
      cropGrown: 'ప్రధాన పూల పంట',
      finishBtn: 'మండీ యాప్‌ను ప్రారంభించండి',
      existingUserFound: 'ఈ మొబైల్ నంబర్ ఖాతా కనుగొనబడింది! మీ డేటాను లోడ్ చేస్తున్నాము...',
      addressUniqueHint: 'ఒకే పేరు లేదా ఒకే చిరునామాతో మరొక దుకాణం ఉండరాదు.',
    },
    hi: {
      welcome: 'फूल मंडी डिजिटल बहीखाता (PhoolMitra)',
      welcomeSubtitle: 'सरल, सुरक्षित एवं पारदर्शी फूल व्यापार लेजर',
      chooseRole: 'आप किस रूप में प्रवेश करना चाहते हैं?',
      chooseRoleSub: 'एक विकल्प चुनें:',
      merchantTitle: 'मंडी आढ़ती / व्यापारी',
      merchantSub: 'मेरी फूल मंडी में दुकान है, मैं नीलामी और पर्ची बनाता हूँ।',
      merchantBadge: 'दुकानदार / आढ़तिया',
      farmerTitle: 'फूल उत्पादक किसान',
      farmerSub: 'मैं फूल उगाता हूँ और मंडी में बिक्री के लिए लाता हूँ।',
      farmerBadge: 'किसान / उत्पादक',
      seniorHint: 'बड़े अक्षर, साफ़ बटन और आवाज की सुविधा से बुजुर्ग और नए लोग आसानी से चलाएं।',
      continueBtn: 'आगे बढ़ें',
      phoneStepTitle: 'मोबाइल सत्यापन',
      phoneStepSub: 'त्वरित ओटीपी के लिए अपना 10 अंकों का मोबाइल नंबर दर्ज करें',
      mobileLabel: 'मोबाइल नंबर',
      sendOtpBtn: 'सत्यापन कोड (OTP) भेजें',
      demoPhoneHint: 'प्रत्येक मोबाइल नंबर का अपना अलग और सुरक्षित डेटा बहीखाता होगा',
      otpTitle: 'सत्यापन कोड दर्ज करें',
      otpSub: 'हमने 4 अंकों का कोड भेजा है: +91 ',
      resendCode: 'पुनः कोड भेजें',
      verifyBtn: 'सत्यापित कर मंडी में प्रवेश करें',
      welcomeVerified: 'सत्यापन सफल!',
      setupTitle: 'नया पंजीकरण व दुकान विवरण',
      setupSub: 'हर दुकान का नाम और पता पूरी तरह विशिष्ट (यूनिक) होना चाहिए',
      fullName: 'पूरा नाम',
      shopName: 'दुकान / फर्म का नाम',
      shopAddress: 'दुकान का पूरा पता',
      shopNumber: 'दुकान संख्या',
      marketName: 'मंडी प्रांगण का नाम',
      villageName: 'गांव का नाम',
      licenseNo: 'APMC लाइसेंस नंबर (वैकल्पिक)',
      cropGrown: 'मुख्य फूल की फसल',
      finishBtn: 'मंडी ऐप शुरू करें',
      existingUserFound: 'यह खाता पहले से पंजीकृत है! आपका निजी बहीखाता लोड हो रहा है...',
      addressUniqueHint: 'एक ही नाम या पते पर दूसरी दुकान पंजीकृत नहीं हो सकती।',
    },
  }[language];

  // Helper for voice announcement
  const handleVoiceHelp = () => {
    sounds.playBidTick();
    let textToSpeak = '';
    if (language === 'te') {
      textToSpeak =
        selectedRole === 'merchant'
          ? 'మీరు మండి కమిషన్ వ్యాపారిగా నమోదు చేసుకుంటున్నారు. మీ మొబైల్ నంబరుతో ధృవీకరించండి. ప్రతి దుకాణానికి ప్రత్యేకమైన పేరు మరియు చిరునామా ఉండాలి.'
          : 'మీరు పూల రైతుగా నమోదు చేసుకుంటున్నారు. మీ ఖాతా పాస్‌బుక్ చూడవచ్చు.';
    } else if (language === 'hi') {
      textToSpeak =
        selectedRole === 'merchant'
          ? 'आप मंडी आढ़ती के रूप में प्रवेश कर रहे हैं। अपना फोन नंबर दर्ज करें। दुकान का नाम और पता अलग होना चाहिए।'
          : 'आप फूल किसान के रूप में प्रवेश कर रहे हैं। अपनी पर्ची और खाता देखें।';
    } else {
      textToSpeak =
        selectedRole === 'merchant'
          ? 'You are registering as a Mandi Commission Merchant. Enter your mobile number. Every shop must have a unique name and address.'
          : 'You are registering as a Flower Farmer. View your digital khata passbook.';
    }
    speakText(textToSpeak, language);
  };

  const handleSendOtp = () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setIsOtpSending(true);
    sounds.playBidTick();

    setTimeout(() => {
      setIsOtpSending(false);
      setOtp(['4', '3', '2', '1']); // Fast auto-fill OTP code for ease of 50-60 year olds
      setStep('otp-verify');
      sounds.playCashChime();
    }, 500);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
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
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);

      // Check if this mobile number is already registered!
      const existingAccount = registeredAccounts.find(
        (a) => a.phoneNumber.replace(/\D/g, '').slice(-10) === cleanPhone
      );

      if (existingAccount) {
        // Automatically log them in to their existing isolated data!
        switchUserAccount(cleanPhone);
        setPortalMode(existingAccount.role);

        try {
          localStorage.setItem('phoolmitra_onboarding_completed', 'true');
          localStorage.setItem('phoolmitra_user_role', existingAccount.role);
          localStorage.setItem('phoolmitra_active_phone_v1', cleanPhone);
        } catch {
          // ignore
        }

        sounds.playGavelStrike();
        onComplete();
      } else {
        // New user! Move to profile registration step with clear empty inputs
        setName('');
        setShopOrVillage('');
        setShopAddress('');
        setShopNumber('');
        setMarketName('APMC Flower Market Yard');
        setLicenseOrCrop('');
        setValidationError('');
        setStep('profile-setup');
      }
    }, 600);
  };

  const handleFinishOnboarding = () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (!name.trim()) {
      setValidationError('Please enter your full name');
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

      // Check uniqueness of shop name and address
      const uniqueness = checkUniqueness({
        shopName: shopOrVillage.trim(),
        shopAddress: shopAddress.trim(),
        phoneNumber: cleanPhone,
      });

      if (!uniqueness.valid) {
        setValidationError(uniqueness.message || 'Shop name or address is already taken');
        return;
      }

      // Register new merchant account
      registerNewAccount({
        role: 'merchant',
        fullName: name.trim(),
        phoneNumber: cleanPhone,
        shopOrVillage: shopOrVillage.trim(),
        shopAddress: shopAddress.trim(),
        shopNumber: shopNumber.trim() || 'Stall 1',
        marketName: marketName.trim() || 'APMC Flower Market',
        licenseOrCrop: licenseOrCrop.trim() || 'APMC-LIC',
      });

      updateMerchantProfile({
        ownerName: name.trim(),
        shopName: shopOrVillage.trim(),
        shopNumber: shopNumber.trim() || 'Stall 1',
        apmcMarketName: marketName.trim() || 'APMC Flower Market',
        licenseNumber: licenseOrCrop.trim() || 'APMC-LIC',
        phoneNumber: `+91 ${cleanPhone}`,
        address: shopAddress.trim(),
      });

      setPortalMode('merchant');
    } else {
      if (!shopOrVillage.trim()) {
        setValidationError('Please enter your village name');
        return;
      }

      // Register new farmer account
      registerNewAccount({
        role: 'farmer',
        fullName: name.trim(),
        phoneNumber: cleanPhone,
        shopOrVillage: shopOrVillage.trim(),
        licenseOrCrop: licenseOrCrop.trim() || 'Marigold (Banthi)',
      });

      const newFarmer = addFarmer({
        name: name.trim(),
        phone: cleanPhone,
        village: shopOrVillage.trim(),
        primaryCrops: [licenseOrCrop.trim() || 'Marigold (Banthi)'],
        connectedMerchantIds: [merchantProfile.merchantId],
      });

      setActiveFarmerId(newFarmer.id);
      setPortalMode('farmer');
    }

    try {
      localStorage.setItem('phoolmitra_onboarding_completed', 'true');
      localStorage.setItem('phoolmitra_user_role', selectedRole);
      localStorage.setItem('phoolmitra_active_phone_v1', cleanPhone);
    } catch {
      // ignore
    }

    sounds.playGavelStrike();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between p-3 sm:p-6 text-[#2A1F1A]">
      {/* Top Bar: Language & Voice Assistant */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#2E6349] flex items-center justify-center text-[#DD9F2F] shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg tracking-tight text-[#2E6349] leading-tight">
              PhoolMitra
            </h1>
            <p className="text-[10px] text-[#6B5E57] font-semibold">పూల మిత్ర • APMC Wholesale</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Voice Guide Button for non-literate users */}
          <button
            type="button"
            id="voice-help-btn"
            onClick={handleVoiceHelp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#2A1F1A] text-xs font-bold transition border border-amber-300 shadow-2xs"
            title="వాయిస్ సహాయం / Voice Guide"
          >
            <Volume2 className="w-4 h-4 text-[#DD9F2F]" />
            <span className="hidden sm:inline">వాయిస్ సహాయం</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-white rounded-xl border border-[#E8E2D9] p-0.5 shadow-2xs">
            {(['te', 'hi', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  sounds.playBidTick();
                  setLanguage(lang);
                }}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition ${
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

      {/* Main Container */}
      <div className="max-w-xl w-full mx-auto my-auto py-6 space-y-6">
        {/* STEP 1: ROLE SELECTION */}
        {step === 'role-select' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D9] shadow-md space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#2E6349] bg-[#E9F3EE] px-3 py-1 rounded-full inline-block">
                Step 1 of 3
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2A1F1A]">
                {content.chooseRole}
              </h2>
              <p className="text-sm text-[#6B5E57] font-medium">{content.chooseRoleSub}</p>
            </div>

            {/* Giant Senior-Friendly Touch Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Merchant Option */}
              <button
                type="button"
                id="role-merchant-btn"
                onClick={() => {
                  sounds.playBidTick();
                  setSelectedRole('merchant');
                }}
                className={`relative p-5 sm:p-6 rounded-2xl text-left border-3 transition-all flex flex-col justify-between group cursor-pointer ${
                  selectedRole === 'merchant'
                    ? 'border-[#2E6349] bg-[#E9F3EE]/60 shadow-md ring-3 ring-[#2E6349]/20'
                    : 'border-[#E8E2D9] bg-white hover:border-[#2E6349]/50 hover:bg-[#FCFBF9]'
                }`}
              >
                {selectedRole === 'merchant' && (
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#2E6349] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#2E6349] text-[#DD9F2F] flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition">
                    <Store className="w-8 h-8" />
                  </div>
                  <span className="inline-block text-[11px] font-black uppercase tracking-wide bg-[#2E6349]/15 text-[#2E6349] px-2.5 py-0.5 rounded-full mb-2">
                    {content.merchantBadge}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2A1F1A]">
                    {content.merchantTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5E57] mt-1.5 leading-relaxed font-medium">
                    {content.merchantSub}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E2D9]/60 flex items-center text-xs font-bold text-[#2E6349]">
                  <span>వేలం & సేల్స్ బుక్</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </div>
              </button>

              {/* Farmer Option */}
              <button
                type="button"
                id="role-farmer-btn"
                onClick={() => {
                  sounds.playBidTick();
                  setSelectedRole('farmer');
                }}
                className={`relative p-5 sm:p-6 rounded-2xl text-left border-3 transition-all flex flex-col justify-between group cursor-pointer ${
                  selectedRole === 'farmer'
                    ? 'border-[#2E6349] bg-[#E9F3EE]/60 shadow-md ring-3 ring-[#2E6349]/20'
                    : 'border-[#E8E2D9] bg-white hover:border-[#2E6349]/50 hover:bg-[#FCFBF9]'
                }`}
              >
                {selectedRole === 'farmer' && (
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#2E6349] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#DD9F2F] text-black flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition">
                    <User className="w-8 h-8" />
                  </div>
                  <span className="inline-block text-[11px] font-black uppercase tracking-wide bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full mb-2">
                    {content.farmerBadge}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2A1F1A]">
                    {content.farmerTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5E57] mt-1.5 leading-relaxed font-medium">
                    {content.farmerSub}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E2D9]/60 flex items-center text-xs font-bold text-[#DD9F2F]">
                  <span>డిజిటల్ పాస్‌బుక్</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </div>
              </button>
            </div>

            {/* Hint for Elderly Users */}
            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E2D9] flex items-center gap-2.5 text-xs text-[#6B5E57]">
              <ShieldCheck className="w-5 h-5 text-[#2E6349] shrink-0" />
              <span>{content.seniorHint}</span>
            </div>

            {/* Next Action Button */}
            <button
              type="button"
              id="continue-role-btn"
              onClick={() => {
                sounds.playCashChime();
                setStep('phone-input');
              }}
              className="w-full py-4 px-6 rounded-2xl bg-[#2E6349] hover:bg-[#234d39] text-white font-black text-lg sm:text-xl transition shadow-md flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer"
            >
              <span>{content.continueBtn}</span>
              <ArrowRight className="w-6 h-6 text-[#DD9F2F]" />
            </button>
          </div>
        )}

        {/* STEP 2: MOBILE NUMBER ENTRY */}
        {step === 'phone-input' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D9] shadow-md space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#2E6349] bg-[#E9F3EE] px-3 py-1 rounded-full inline-block">
                Step 2 of 3
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2A1F1A]">
                {content.phoneStepTitle}
              </h2>
              <p className="text-sm text-[#6B5E57] font-medium">{content.phoneStepSub}</p>
            </div>

            {/* Large Easy-to-read Phone Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block">
                {content.mobileLabel}
              </label>

              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center gap-1 text-base sm:text-lg font-black text-[#6B5E57] border-r border-[#E8E2D9] pr-3">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  id="onboarding-phone-input"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(clean);
                    setErrorMsg('');
                  }}
                  placeholder="9849012345"
                  className="w-full pl-22 pr-4 py-4 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-xl sm:text-2xl font-mono font-black text-[#2A1F1A] outline-none transition tracking-widest placeholder:text-gray-300"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1 pt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </p>
              )}

              <p className="text-xs text-[#6B5E57] pt-1 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#2E6349]" />
                <span>{content.demoPhoneHint}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                id="send-otp-btn"
                onClick={handleSendOtp}
                disabled={isOtpSending}
                className="w-full py-4 px-6 rounded-2xl bg-[#2E6349] hover:bg-[#234d39] text-white font-black text-lg sm:text-xl transition shadow-md flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.99]"
              >
                {isOtpSending ? (
                  <span>కోడ్ పంపుతున్నాము...</span>
                ) : (
                  <>
                    <span>{content.sendOtpBtn}</span>
                    <ArrowRight className="w-6 h-6 text-[#DD9F2F]" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('role-select')}
                className="w-full py-2.5 text-xs font-bold text-[#6B5E57] hover:text-[#2A1F1A] transition"
              >
                ← పాత్ర ఎంపికకు తిరిగి వెళ్లండి
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: OTP CONFIRMATION */}
        {step === 'otp-verify' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D9] shadow-md space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#2E6349] bg-[#E9F3EE] px-3 py-1 rounded-full inline-block">
                Step 3 of 3
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2A1F1A]">
                {content.otpTitle}
              </h2>
              <p className="text-sm text-[#6B5E57] font-medium">
                {content.otpSub}
                <strong className="text-[#2A1F1A] font-mono">{phone}</strong>
              </p>
            </div>

            {/* 4 Large Digit Inputs */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 py-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-input-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-14 h-16 sm:w-16 sm:h-20 text-center text-3xl font-mono font-black rounded-2xl border-3 border-[#2E6349]/40 focus:border-[#2E6349] bg-[#FAFDFC] outline-none transition text-[#2E6349]"
                />
              ))}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  sounds.playBidTick();
                  setOtp(['4', '3', '2', '1']);
                }}
                className="text-xs font-bold text-[#2E6349] hover:underline"
              >
                {content.resendCode} (Auto-Fill 4321)
              </button>
            </div>

            {/* Verify Action */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                id="verify-otp-btn"
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="w-full py-4 px-6 rounded-2xl bg-[#2E6349] hover:bg-[#234d39] text-white font-black text-base sm:text-lg transition shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isVerifying ? (
                  <span>ధృవీకరిస్తున్నాము...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#DD9F2F]" />
                    <span>{content.verifyBtn}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone-input')}
                className="w-full py-2.5 text-xs font-bold text-[#6B5E57] hover:text-[#2A1F1A] transition"
              >
                ← మొబైల్ నంబర్ మార్చండి
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROFILE SETUP (FOR NEW UNREGISTERED USERS) */}
        {step === 'profile-setup' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D9] shadow-md space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#2E6349] mx-auto flex items-center justify-center font-black">
                <UserCheck className="w-8 h-8" />
              </div>
              <span className="inline-block text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                ✓ {content.welcomeVerified} (+91 {phone})
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2A1F1A]">
                {content.setupTitle}
              </h2>
              <p className="text-sm text-[#6B5E57] font-medium">{content.setupSub}</p>
            </div>

            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block mb-1.5">
                  {content.fullName} *
                </label>
                <input
                  id="onboard-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setValidationError('');
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-base font-bold text-[#2A1F1A] outline-none transition"
                  placeholder="Enter your name"
                />
              </div>

              {selectedRole === 'merchant' ? (
                <>
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block mb-1.5">
                      {content.shopName} *
                    </label>
                    <input
                      id="onboard-shop-input"
                      type="text"
                      required
                      value={shopOrVillage}
                      onChange={(e) => {
                        setShopOrVillage(e.target.value);
                        setValidationError('');
                      }}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-base font-bold text-[#2A1F1A] outline-none transition"
                      placeholder="e.g., Venkateshwara Flower Traders"
                    />
                    <span className="text-[11px] text-[#6B5E57] mt-1 block">
                      {content.addressUniqueHint}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block mb-1.5">
                      {content.shopAddress} *
                    </label>
                    <input
                      id="onboard-address-input"
                      type="text"
                      required
                      value={shopAddress}
                      onChange={(e) => {
                        setShopAddress(e.target.value);
                        setValidationError('');
                      }}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-base font-bold text-[#2A1F1A] outline-none transition"
                      placeholder="e.g., Stall #14, Gate #2, Gudimalkapur Flower Market, Hyderabad"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block mb-1.5">
                        {content.shopNumber}
                      </label>
                      <input
                        id="onboard-shop-number-input"
                        type="text"
                        value={shopNumber}
                        onChange={(e) => setShopNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-sm font-bold text-[#2A1F1A] outline-none transition"
                        placeholder="e.g., Shop 14"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block mb-1.5">
                        {content.licenseNo}
                      </label>
                      <input
                        id="onboard-license-input"
                        type="text"
                        value={licenseOrCrop}
                        onChange={(e) => setLicenseOrCrop(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-sm font-bold text-[#2A1F1A] outline-none transition"
                        placeholder="APMC-LIC-2026"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block mb-1.5">
                      {content.villageName} *
                    </label>
                    <input
                      id="onboard-village-input"
                      type="text"
                      required
                      value={shopOrVillage}
                      onChange={(e) => {
                        setShopOrVillage(e.target.value);
                        setValidationError('');
                      }}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-base font-bold text-[#2A1F1A] outline-none transition"
                      placeholder="e.g., Chevella, R.R. Dist"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-[#2E6349] block mb-1.5">
                      {content.cropGrown}
                    </label>
                    <input
                      id="onboard-crop-input"
                      type="text"
                      value={licenseOrCrop}
                      onChange={(e) => setLicenseOrCrop(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E8E2D9] focus:border-[#2E6349] text-base font-bold text-[#2A1F1A] outline-none transition"
                      placeholder="Marigold (Banthi)"
                    />
                  </div>
                </div>
              )}

              {/* Ready to Enter Action */}
              <div className="pt-3">
                <button
                  type="button"
                  id="finish-onboard-btn"
                  onClick={handleFinishOnboarding}
                  className="w-full py-4 px-6 rounded-2xl bg-[#2E6349] hover:bg-[#234d39] text-white font-black text-lg sm:text-xl transition shadow-lg flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-[#DD9F2F]" />
                  <span>{content.finishBtn}</span>
                  <ArrowRight className="w-6 h-6 text-[#DD9F2F]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trust & APMC Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-4 border-t border-[#E8E2D9] text-xs text-[#6B5E57] space-y-1 font-medium">
        <p className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2E6349]" />
          <span>APMC Model Act • Form C Adathiya Parchi Standard • Offline-First</span>
        </p>
        <p className="text-[11px] text-[#6B5E57]/80">
          పూల మిత్ర - సులభమైన తెలుగు మరియు హిందీ డిజిటల్ లెడ్జర్
        </p>
      </footer>
    </div>
  );
};
