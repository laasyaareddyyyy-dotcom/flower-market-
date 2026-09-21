import React, { useState, useMemo } from 'react';
import {
  Users,
  QrCode,
  BookOpen,
  ArrowUpRight,
  Printer,
  Share2,
  Calendar,
  Layers,
  Phone,
  Store,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Sparkles,
  User,
  UserPlus,
  Volume2,
  Search,
  Send,
  ShieldCheck,
  Clock,
  Check,
  X,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { sounds, speakParchiDetails } from '../../utils/audio';
import { FarmerParchiView } from './FarmerParchiView';
import { FarmerSalesReportsView } from '../common/FarmerSalesReportsView';
import { RazorpayPaymentCard } from '../payment/RazorpayPaymentCard';

export const FarmerPortalView: React.FC = () => {
  const {
    farmers,
    lots,
    merchantProfile,
    setSelectedParchiLot,
    setIsQRModalOpen,
    setIsFarmerSignUpOpen,
    connectionRequests,
    acceptConnectionRequest,
    declineConnectionRequest,
    sendConnectionRequest,
    registeredAccounts,
    currentUserPhone,
    currentUserAccount,
    getSharedLotsForFarmer,
    activeFarmerId,
    setActiveFarmerId,
    language,
    t,
  } = useMandi();

  const [activeTab, setActiveTab] = useState<'parchi' | 'sales-reports' | 'khata' | 'search-merchants' | 'requests'>('parchi');
  const [searchMerchantQuery, setSearchMerchantQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Determine the current active farmer identity
  // If user is logged in as a registered farmer, use their profile
  const registeredFarmerAccount = registeredAccounts.find(
    (a) =>
      a.role === 'farmer' &&
      a.phoneNumber.replace(/\D/g, '').slice(-10) === currentUserPhone.replace(/\D/g, '').slice(-10)
  );

  const currentFarmer = useMemo(() => {
    if (registeredFarmerAccount) {
      return {
        id: registeredFarmerAccount.id,
        name: registeredFarmerAccount.fullName,
        phone: registeredFarmerAccount.phoneNumber ? registeredFarmerAccount.phoneNumber.replace(/\D/g, '').slice(-10) : '',
        village: registeredFarmerAccount.shopOrVillage || '',
        primaryCrops: registeredFarmerAccount.licenseOrCrop
          ? [registeredFarmerAccount.licenseOrCrop]
          : [],
        photoUrl: registeredFarmerAccount.photoUrl,
        connectedMerchantIds: merchantProfile.merchantId ? [merchantProfile.merchantId] : [],
        createdAt: registeredFarmerAccount.createdAt,
      };
    }
    const found = farmers.find((f) => f.id === activeFarmerId) || farmers[0];
    if (found) {
      return found;
    }
    return null;
  }, [registeredFarmerAccount, farmers, activeFarmerId, merchantProfile.merchantId]);

  const cleanFarmerPhone = currentFarmer?.phone ? currentFarmer.phone.replace(/\D/g, '').slice(-10) : (currentUserPhone ? currentUserPhone.replace(/\D/g, '').slice(-10) : '');

  // Get shared lots ONLY for this specific farmer (Strict Isolation Guarantee!)
  const farmerLots = useMemo(() => {
    if (!cleanFarmerPhone && !currentFarmer) return [];
    return getSharedLotsForFarmer(cleanFarmerPhone, currentFarmer?.name || '');
  }, [getSharedLotsForFarmer, cleanFarmerPhone, currentFarmer]);

  // Connection requests involving this farmer
  const farmerRequests = useMemo(() => {
    if (!cleanFarmerPhone) return [];
    return connectionRequests.filter(
      (r) => r.farmerPhone.replace(/\D/g, '').slice(-10) === cleanFarmerPhone
    );
  }, [connectionRequests, cleanFarmerPhone]);

  const incomingRequestsFromMerchants = useMemo(() => {
    return farmerRequests.filter((r) => r.senderRole === 'merchant' && r.status === 'pending');
  }, [farmerRequests]);

  const outgoingFarmerRequests = useMemo(() => {
    return farmerRequests.filter((r) => r.senderRole === 'farmer');
  }, [farmerRequests]);

  const acceptedMerchants = useMemo(() => {
    return farmerRequests.filter((r) => r.status === 'accepted');
  }, [farmerRequests]);

  // Searchable Merchants across the APMC network
  const networkMerchants = useMemo(() => {
    const list: {
      merchantId: string;
      shopName: string;
      ownerName: string;
      phoneNumber: string;
      shopNumber: string;
      apmcMarketName: string;
      photoUrl?: string;
      commissionRate: number;
    }[] = [];

    const seenPhones = new Set<string>();

    // 1. Registered accounts with role 'merchant'
    registeredAccounts
      .filter((a) => a.role === 'merchant')
      .forEach((a) => {
        const clean = a.phoneNumber ? a.phoneNumber.replace(/\D/g, '').slice(-10) : '';
        if (clean && !seenPhones.has(clean)) {
          seenPhones.add(clean);
          list.push({
            merchantId: `MANDI-${clean.slice(-4)}`,
            shopName: a.shopOrVillage || 'APMC Merchant',
            ownerName: a.fullName,
            phoneNumber: clean,
            shopNumber: a.shopNumber || '',
            apmcMarketName: a.marketName || 'APMC Yard',
            photoUrl: a.photoUrl,
            commissionRate: 4,
          });
        }
      });

    // 2. Active Merchant Profile
    const cleanActivePhone = merchantProfile.phoneNumber
      ? merchantProfile.phoneNumber.replace(/\D/g, '').slice(-10)
      : '';

    if (cleanActivePhone && !seenPhones.has(cleanActivePhone)) {
      seenPhones.add(cleanActivePhone);
      list.push({
        merchantId: merchantProfile.merchantId,
        shopName: merchantProfile.shopName || 'Mandi Merchant',
        ownerName: merchantProfile.ownerName || 'Commission Merchant',
        phoneNumber: cleanActivePhone,
        shopNumber: merchantProfile.shopNumber || '',
        apmcMarketName: merchantProfile.apmcMarketName || 'APMC Yard',
        photoUrl: merchantProfile.photoUrl,
        commissionRate: merchantProfile.defaultCommissionRate || 4,
      });
    }

    const q = searchMerchantQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.shopName.toLowerCase().includes(q) ||
        m.ownerName.toLowerCase().includes(q) ||
        m.apmcMarketName.toLowerCase().includes(q) ||
        m.phoneNumber.includes(q) ||
        m.shopNumber.toLowerCase().includes(q)
    );
  }, [registeredAccounts, merchantProfile, searchMerchantQuery]);

  // Handle Send Connection Request from Farmer to Merchant
  const handleSendRequestToMerchant = (m: {
    merchantId: string;
    shopName: string;
    ownerName: string;
    phoneNumber: string;
  }) => {
    sendConnectionRequest({
      senderRole: 'farmer',
      farmerId: currentFarmer.id,
      farmerName: currentFarmer.name,
      farmerPhone: cleanFarmerPhone,
      farmerVillage: currentFarmer.village,
      merchantId: m.merchantId,
      merchantName: m.shopName,
      merchantPhone: m.phoneNumber,
      merchantOwnerName: m.ownerName,
    });

    setNotificationMsg(
      `✓ Connection request sent to ${m.shopName}! When the merchant accepts, your consignments and settlements will automatically sync here.`
    );
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleAcceptMerchantRequest = (reqId: string, shopName: string) => {
    acceptConnectionRequest(reqId);
    setNotificationMsg(
      `✓ Connection accepted with ${shopName}! Only your specific flower consignments and settlements are shared.`
    );
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleDeclineRequest = (reqId: string) => {
    declineConnectionRequest(reqId);
    setNotificationMsg('Request declined.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Financial calculations for this specific farmer
  const totalVolume = farmerLots.reduce((acc, l) => acc + l.quantity, 0);
  const totalGross = farmerLots.reduce((acc, l) => acc + l.grossTotal, 0);
  const totalCommissionDeducted = farmerLots.reduce((acc, l) => acc + l.commissionAmount, 0);
  const totalOtherDeducted = farmerLots.reduce((acc, l) => acc + l.totalOtherExpenditures, 0);
  const totalNet = farmerLots.reduce((acc, l) => acc + l.farmerNetPayable, 0);
  const totalPaid = farmerLots.reduce((acc, l) => acc + l.amountPaid, 0);
  const totalDue = farmerLots.reduce((acc, l) => acc + l.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Farmer Profile Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#2E6349] bg-[#FCFBF9] shrink-0 shadow-2xs">
              {currentFarmer?.photoUrl ? (
                <img
                  src={currentFarmer.photoUrl}
                  alt={currentFarmer.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#E9F3EE] text-[#2E6349] font-black text-lg">
                  {currentFarmer?.name.charAt(0) || '🌾'}
                </div>
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#6B5E57] tracking-wider block">
                {language === 'te' ? 'రైతు డిజిటల్ పాస్‌బుక్' : 'Farmer Digital Passbook'}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-[#2A1F1A]">
                  {currentFarmer?.name || (cleanFarmerPhone ? `Farmer (+91 ${cleanFarmerPhone})` : 'Farmer Passbook')}
                </h2>
                {currentFarmer?.village && (
                  <span className="text-xs text-[#6B5E57] font-medium">📍 {currentFarmer.village}</span>
                )}
                {cleanFarmerPhone && (
                  <span className="font-mono text-xs font-semibold text-[#2E6349] bg-[#E9F3EE] px-2 py-0.5 rounded-md">
                    +91 {cleanFarmerPhone}
                  </span>
                )}
              </div>
              <div className="text-xs text-[#2E6349] font-medium mt-0.5">
                Primary Crops: {currentFarmer?.primaryCrops && currentFarmer.primaryCrops.length > 0 ? currentFarmer.primaryCrops.join(', ') : 'None specified'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* If not logged in as a farmer, show switch grower for testing/demo */}
            {!registeredFarmerAccount && farmers.length > 0 && (
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-[#6B5E57] font-medium whitespace-nowrap">
                  Switch Grower:
                </label>
                <select
                  id="switch-farmer-select"
                  value={activeFarmerId || farmers[0]?.id}
                  onChange={(e) => setActiveFarmerId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-[#FCFBF9] text-[#2A1F1A] cursor-pointer"
                >
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.village})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              id="farmer-portal-signup-btn"
              onClick={() => setIsFarmerSignUpOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span>Sign Up New Farmer</span>
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notificationMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
            <button onClick={() => setNotificationMsg(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E2D9] pt-1 overflow-x-auto">
          <button
            type="button"
            id="farmer-tab-parchi"
            onClick={() => setActiveTab('parchi')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'parchi'
                ? 'border-[#2E6349] text-[#2E6349] bg-[#E9F3EE]/50 rounded-t-xl'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{language === 'te' ? 'కన్సైన్‌మెంట్ రసీదులు' : 'Consignment Parchi'}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#2E6349] text-white text-[10px] font-mono font-bold">
              {farmerLots.length}
            </span>
          </button>

          <button
            type="button"
            id="farmer-tab-sales-reports"
            onClick={() => setActiveTab('sales-reports')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'sales-reports'
                ? 'border-[#2E6349] text-[#2E6349] bg-[#E9F3EE]/50 rounded-t-xl'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'te' ? 'అమ్మకాల నివేదికలు & నెలవారీ లెక్కలు' : 'Sales Reports & Monthly Totals'}</span>
          </button>

          <button
            type="button"
            id="farmer-tab-khata"
            onClick={() => setActiveTab('khata')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'khata'
                ? 'border-[#2E6349] text-[#2E6349] bg-[#E9F3EE]/50 rounded-t-xl'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'te' ? 'నా మండి ఖాతా' : 'My Mandi Khata'}</span>
          </button>

          <button
            type="button"
            id="farmer-tab-search-merchants"
            onClick={() => setActiveTab('search-merchants')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'search-merchants'
                ? 'border-[#2E6349] text-[#2E6349] bg-[#E9F3EE]/50 rounded-t-xl'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{language === 'te' ? 'మండి వ్యాపారుల శోధన' : 'Search Mandi Merchants'}</span>
          </button>

          <button
            type="button"
            id="farmer-tab-requests"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'requests'
                ? 'border-[#2E6349] text-[#2E6349] bg-[#E9F3EE]/50 rounded-t-xl'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Requests &amp; Connected Shops</span>
            {incomingRequestsFromMerchants.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold animate-pulse">
                {incomingRequestsFromMerchants.length} new
              </span>
            )}
          </button>
        </div>

        {/* Data Isolation Guarantee Banner */}
        <div className="p-3 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs text-[#6B5E57] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2E6349] shrink-0" />
          <span>
            <strong>Secure Data Privacy:</strong> Only your flower consignment slips, auction rates, and payment settlements with your connected merchants are shared here. No other farmer&apos;s details are accessible to you, and other farmers cannot see your data.
          </span>
        </div>
      </div>

      {/* TAB: Parchi (Daily / Monthly) */}
      {activeTab === 'parchi' && (
        <FarmerParchiView
          farmerId={currentFarmer.id}
          farmerPhone={cleanFarmerPhone}
          farmerName={currentFarmer.name}
          farmerLots={farmerLots}
        />
      )}

      {/* TAB: Sales Reports & Monthly Totals */}
      {activeTab === 'sales-reports' && (
        <FarmerSalesReportsView
          role="farmer"
          defaultFarmerId={currentFarmer.id}
          defaultFarmerPhone={cleanFarmerPhone}
          defaultFarmerName={currentFarmer.name}
        />
      )}

      {/* TAB 1: My Mandi Khata */}
      {activeTab === 'khata' && (
        <div className="space-y-6">
          {/* Connected Merchant Card */}
          <div className="bg-gradient-to-r from-[#2E6349] to-[#1F4532] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#DD9F2F] bg-white/10 shrink-0 shadow-md">
                {merchantProfile.photoUrl ? (
                  <img
                    src={merchantProfile.photoUrl}
                    alt={merchantProfile.ownerName || merchantProfile.shopName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#DD9F2F]">
                    <Store className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#DD9F2F] tracking-wider uppercase mb-0.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Connected Commission Merchant • Data Sharing Active</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black">{merchantProfile.shopName || 'Mandi Commission Merchant'}</h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Owner: <strong className="text-[#DD9F2F]">{merchantProfile.ownerName || 'Merchant'}</strong> {merchantProfile.shopNumber ? `• ${merchantProfile.shopNumber}` : ''} {merchantProfile.apmcMarketName ? `• ${merchantProfile.apmcMarketName}` : ''}
                </p>
                <div className="text-[11px] text-white/70 mt-0.5 font-mono">
                  Phone: {merchantProfile.phoneNumber ? `+91 ${merchantProfile.phoneNumber}` : 'Not configured'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                id="farmer-view-qr-btn"
                onClick={() => setIsQRModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white text-[#2E6349] font-bold text-xs hover:bg-white/90 transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#DD9F2F]" />
                <span>Shop QR Code</span>
              </button>
            </div>
          </div>

          {/* Passbook Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] block">
                Total Flower Volume
              </span>
              <div className="text-2xl font-black text-[#2A1F1A] mt-2">
                {totalVolume.toLocaleString('en-IN')} <span className="text-sm font-semibold text-[#6B5E57]">units/kgs</span>
              </div>
              <span className="text-xs text-[#2E6349] font-medium mt-1 block">
                Across {farmerLots.length} consignments
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] block">
                Gross Auction Earnings
              </span>
              <div className="text-2xl font-black text-[#2A1F1A] mt-2">
                ₹{totalGross.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-[#6B5E57] mt-1 block">
                Comm: ₹{totalCommissionDeducted} • Exp: ₹{totalOtherDeducted}
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] block">
                Total Received (Paid)
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                ₹{totalPaid.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-emerald-800/80 font-medium mt-1 block">
                Cash, PhonePe &amp; UPI settlements
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] block">
                Pending Balance
              </span>
              <div
                className={`text-2xl font-black mt-2 ${
                  totalDue > 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                ₹{totalDue.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-[#6B5E57] mt-1 block font-semibold">
                {totalDue > 0 ? 'Due from Commission Merchant' : 'Settled ✓ (All dues cleared)'}
              </span>
            </div>
          </div>

          {/* Razorpay Online Payment & Due Settlement Gateway */}
          <RazorpayPaymentCard
            farmerId={currentFarmer.id}
            customDueAmount={totalDue}
            title="Settle Due Payment"
            subtitle="Instant collection or payout via Razorpay UPI, Debit/Credit Cards & NetBanking with auto-downloaded PDF receipt."
          />

          {/* Farmer Digital Passbook Lots List */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xs overflow-hidden space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-[#F4EFEA] pb-3">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#2A1F1A] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#2E6349]" />
                  <span>Digital Mandi Parchi Passbook ({farmerLots.length})</span>
                </h3>
                <p className="text-xs text-[#6B5E57]">
                  Transparent realtime record of all flower consignments brought by {currentFarmer.name}.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#E9F3EE] text-[#2E6349] font-mono font-bold text-xs">
                {farmerLots.length} slips
              </span>
            </div>

            {farmerLots.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#6B5E57] space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#E9F3EE] text-[#2E6349] flex items-center justify-center mx-auto text-2xl">
                  🌸
                </div>
                <h4 className="font-bold text-sm text-[#2A1F1A]">No Consignments Logged Yet for {currentFarmer.name}</h4>
                <p className="max-w-md mx-auto">
                  When your connected merchant records an arrival lot in the Mandi, your official slip and payment status will appear here in real-time.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('search-merchants')}
                  className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5 text-[#DD9F2F]" />
                  <span>Search More Mandi Merchants</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {[...farmerLots].reverse().map((lot) => {
                  const isSettled = lot.paymentStatus === 'Paid' || lot.balanceDue === 0;
                  const isPartial = lot.paymentStatus === 'Partial' || (lot.amountPaid > 0 && lot.balanceDue > 0);

                  return (
                    <div
                      key={lot.id}
                      id={`farmer-lot-slip-${lot.id}`}
                      className="p-4 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] hover:border-[#2E6349]/40 transition space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#2E6349] bg-white px-2.5 py-1 rounded border border-[#E8E2D9]">
                            {lot.parchiNumber}
                          </span>
                          <span className="text-[#6B5E57]">
                            {lot.date} • {lot.time}
                          </span>
                          {lot.merchantName && (
                            <span className="text-[11px] text-[#2E6349] font-medium bg-emerald-50 px-2 py-0.5 rounded">
                              🏪 {lot.merchantName}
                            </span>
                          )}
                        </div>

                        {/* Automatic Settled Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                            isSettled
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPartial
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isSettled ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                            </>
                          ) : isPartial ? (
                            <>
                              <Clock className="w-3.5 h-3.5" /> Partially Paid (Due: ₹{lot.balanceDue})
                            </>
                          ) : (
                            `Due ₹${lot.balanceDue}`
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                            Crop Variety
                          </span>
                          <span className="font-bold text-sm text-[#2A1F1A]">
                            🌸 {lot.flowerVariety}
                          </span>
                          <span className="text-[11px] text-[#2E6349] block font-semibold">
                            {lot.quantity} {lot.unit} @ ₹{lot.rate}/{lot.unit}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                            Gross &amp; Deductions
                          </span>
                          <span className="font-mono text-xs text-[#2A1F1A] block">
                            Gross: ₹{lot.grossTotal}
                          </span>
                          <span className="text-[10px] text-[#6B5E57] block">
                            Comm: ₹{lot.commissionAmount} • Other Exp: ₹{lot.totalOtherExpenditures}
                          </span>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                            Farmer Net Amount
                          </span>
                          <span className="font-mono font-black text-base text-[#2A1F1A] block">
                            ₹{lot.farmerNetPayable.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-700 block">
                            Paid: ₹{lot.amountPaid}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E8E2D9]">
                        <button
                          type="button"
                          id={`farmer-slip-speak-btn-${lot.id}`}
                          onClick={() => {
                            sounds.playBidTick();
                            speakParchiDetails(
                              lot.farmerName,
                              lot.flowerVariety,
                              lot.quantity,
                              lot.unit,
                              lot.rate,
                              lot.farmerNetPayable,
                              language
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-white text-[#2A1F1A] text-xs font-semibold hover:bg-[#F4EFEA] transition flex items-center gap-1 cursor-pointer"
                          title="Audio Readout in Native Language"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#2E6349]" />
                          <span>{language === 'te' ? 'వాయిస్ చదవండి' : 'Listen (Audio)'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedParchiLot(lot)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#2E6349] text-white font-bold text-xs hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#DD9F2F]" />
                          <span>{language === 'te' ? 'మండి రసీదు' : 'View Mandi Slip'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Search Mandi Merchants */}
      {activeTab === 'search-merchants' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#2A1F1A] flex items-center gap-2">
                <Store className="w-5 h-5 text-[#2E6349]" />
                <span>
                  {language === 'te'
                    ? 'హోల్‌సేల్ వ్యాపారుల శోధన'
                    : 'Search Mandi Commission Merchants'}
                </span>
              </h3>
              <p className="text-xs text-[#6B5E57]">
                Find licensed flower commission agents in Gudimalkapur, Shamshabad, or regional APMC yards. Send a connection request to link your passbook.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B5E57]" />
              <input
                id="search-merchant-input"
                type="text"
                placeholder="Search by shop name, owner name, mandi yard, phone number..."
                value={searchMerchantQuery}
                onChange={(e) => setSearchMerchantQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-[#FCFBF9]"
              />
            </div>
          </div>

          {/* Merchants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {networkMerchants.map((m) => {
              const cleanPhone = m.phoneNumber.replace(/\D/g, '').slice(-10);

              const isAccepted = acceptedMerchants.some(
                (r) =>
                  r.merchantId === m.merchantId ||
                  (r.merchantPhone && r.merchantPhone.replace(/\D/g, '').slice(-10) === cleanPhone)
              );

              const isPendingSent = outgoingFarmerRequests.some(
                (r) =>
                  r.status === 'pending' &&
                  (r.merchantId === m.merchantId ||
                    (r.merchantPhone && r.merchantPhone.replace(/\D/g, '').slice(-10) === cleanPhone))
              );

              const incomingReq = incomingRequestsFromMerchants.find(
                (r) =>
                  r.merchantId === m.merchantId ||
                  (r.merchantPhone && r.merchantPhone.replace(/\D/g, '').slice(-10) === cleanPhone)
              );

              return (
                <div
                  key={m.merchantId}
                  id={`merchant-card-${m.merchantId}`}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D9] shadow-2xs hover:shadow-xs transition space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2E6349] bg-[#FCFBF9] shrink-0">
                        {m.photoUrl ? (
                          <img
                            src={m.photoUrl}
                            alt={m.shopName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#E9F3EE] text-[#2E6349]">
                            <Store className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-[#2A1F1A]">
                          {m.shopName}
                        </h4>
                        <p className="text-xs text-[#6B5E57]">
                          Owner: <strong>{m.ownerName}</strong>
                        </p>
                        <p className="text-[11px] text-[#6B5E57] mt-0.5">
                          📍 {m.shopNumber}, {m.apmcMarketName}
                        </p>
                        <p className="text-[11px] font-mono text-[#2E6349] font-bold mt-0.5">
                          📞 +91 {cleanPhone}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[11px] flex justify-between text-[#6B5E57]">
                      <span>Standard Commission:</span>
                      <span className="font-bold text-[#2A1F1A]">{m.commissionRate}% APMC Mandi</span>
                    </div>
                  </div>

                  {/* Status / Connect Button */}
                  <div className="pt-2 border-t border-[#F4EFEA]">
                    {isAccepted ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Connected (Data Shared)
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('khata')}
                          className="text-xs font-bold text-[#2E6349] hover:underline"
                        >
                          View Passbook →
                        </button>
                      </div>
                    ) : incomingReq ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-amber-800 block">
                          Merchant invited you to connect!
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptMerchantRequest(incomingReq.id, m.shopName)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532]"
                          >
                            Accept Connection
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineRequest(incomingReq.id)}
                            className="py-1.5 px-2.5 rounded-lg border border-gray-300 text-xs text-[#6B5E57]"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ) : isPendingSent ? (
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 block text-center">
                        ⏳ Request Sent (Awaiting Merchant Approval)
                      </span>
                    ) : (
                      <button
                        type="button"
                        id={`send-farmer-req-btn-${m.merchantId}`}
                        onClick={() => handleSendRequestToMerchant(m)}
                        className="w-full py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-[#DD9F2F]" />
                        <span>{language === 'te' ? 'రిక్వెస్ట్ పంపండి' : 'Send Connection Request'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Requests & Connected Shops */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Incoming Requests from Merchants */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F4EFEA] pb-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2A1F1A] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2E6349]" />
                  <span>Incoming Connection Requests from Merchants ({incomingRequestsFromMerchants.length})</span>
                </h3>
                <p className="text-xs text-[#6B5E57]">
                  Merchants who want to link your passbook. When accepted, only your specific consignments and payments will be shared with them.
                </p>
              </div>
            </div>

            {incomingRequestsFromMerchants.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6B5E57]">
                No pending incoming requests from merchants.
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequestsFromMerchants.map((req) => (
                  <div
                    key={req.id}
                    id={`farmer-incoming-req-${req.id}`}
                    className="p-4 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2A1F1A]">{req.merchantName}</span>
                        {req.merchantOwnerName && (
                          <span className="text-xs text-[#6B5E57]">Owner: {req.merchantOwnerName}</span>
                        )}
                      </div>
                      {req.merchantPhone && (
                        <span className="font-mono text-xs text-[#2E6349] block">
                          Phone: +91 {req.merchantPhone}
                        </span>
                      )}
                      <span className="text-[10px] text-[#6B5E57] block">
                        Received on: {req.requestDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptMerchantRequest(req.id, req.merchantName)}
                        className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5 text-[#DD9F2F]" />
                        <span>Accept &amp; Share Data</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineRequest(req.id)}
                        className="px-3 py-2 rounded-xl bg-white border border-[#E8E2D9] text-[#6B5E57] text-xs font-semibold hover:bg-gray-100"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests Sent by Farmer */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-[#2A1F1A] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#2E6349]" />
              <span>Connection Requests You Sent ({outgoingFarmerRequests.length})</span>
            </h3>

            {outgoingFarmerRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6B5E57]">
                You haven&apos;t sent any connection requests yet. Use &quot;Search Mandi Merchants&quot; to connect with your commission agent.
              </div>
            ) : (
              <div className="space-y-3">
                {outgoingFarmerRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#2A1F1A] block">{req.merchantName}</span>
                      <span className="text-[11px] text-[#6B5E57]">Sent on: {req.requestDate}</span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'declined'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status === 'accepted'
                        ? '✓ Connected & Data Shared'
                        : req.status === 'declined'
                        ? 'Declined'
                        : '⏳ Pending Approval'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
