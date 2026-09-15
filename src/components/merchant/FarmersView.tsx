import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  BookOpen,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Printer,
  ChevronRight,
  Plus,
  User,
  Sparkles,
  Send,
  ShieldCheck,
  Clock,
  Check,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { Farmer } from '../../types';
import { flowerVarietiesData } from '../../translations';
import { PhotoUploadPicker } from '../common/PhotoUploadPicker';
import { FarmerKathaStatementView } from './FarmerKathaStatementView';

export const FarmersView: React.FC = () => {
  const {
    farmers,
    addFarmer,
    updateFarmer,
    lots,
    getFarmerStats,
    setSelectedParchiLot,
    merchantProfile,
    setIsFarmerSignUpOpen,
    connectionRequests,
    acceptConnectionRequest,
    declineConnectionRequest,
    sendConnectionRequest,
    registeredAccounts,
    currentUserPhone,
    language,
    t,
  } = useMandi();

  const [activeTab, setActiveTab] = useState<
    'connected' | 'katha-statement' | 'search-connect' | 'incoming'
  >('connected');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [selectedLedgerFarmer, setSelectedLedgerFarmer] = useState<Farmer | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formCrops, setFormCrops] = useState<string[]>(['Marigold (Banthi)']);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick Direct Request Form in Search Tab
  const [directFarmerName, setDirectFarmerName] = useState('');
  const [directFarmerPhone, setDirectFarmerPhone] = useState('');
  const [directFarmerVillage, setDirectFarmerVillage] = useState('');
  const [directError, setDirectError] = useState<string | null>(null);
  const [directSuccess, setDirectSuccess] = useState<string | null>(null);

  const cleanMerchantPhone = merchantProfile.phoneNumber
    ? merchantProfile.phoneNumber.replace(/\D/g, '').slice(-10)
    : currentUserPhone;

  // Incoming connection requests from farmers
  const incomingFarmerRequests = useMemo(() => {
    return connectionRequests.filter(
      (r) =>
        r.senderRole === 'farmer' &&
        r.status === 'pending' &&
        (r.merchantId === merchantProfile.merchantId ||
          (r.merchantPhone && r.merchantPhone.replace(/\D/g, '').slice(-10) === cleanMerchantPhone))
    );
  }, [connectionRequests, merchantProfile.merchantId, cleanMerchantPhone]);

  // Outgoing requests sent by merchant
  const outgoingMerchantRequests = useMemo(() => {
    return connectionRequests.filter(
      (r) =>
        r.senderRole === 'merchant' &&
        (r.merchantId === merchantProfile.merchantId ||
          (r.merchantPhone && r.merchantPhone.replace(/\D/g, '').slice(-10) === cleanMerchantPhone))
    );
  }, [connectionRequests, merchantProfile.merchantId, cleanMerchantPhone]);

  // Accepted connections
  const acceptedConnections = useMemo(() => {
    return connectionRequests.filter(
      (r) =>
        r.status === 'accepted' &&
        (r.merchantId === merchantProfile.merchantId ||
          (r.merchantPhone && r.merchantPhone.replace(/\D/g, '').slice(-10) === cleanMerchantPhone))
    );
  }, [connectionRequests, merchantProfile.merchantId, cleanMerchantPhone]);

  // Filtered farmers in Connected Tab
  const filteredFarmers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return farmers;
    return farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        f.primaryCrops.some((c) => c.toLowerCase().includes(q))
    );
  }, [farmers, searchQuery]);

  // Searchable Network Farmers (registered accounts who are farmers + existing farmers)
  const networkFarmers = useMemo(() => {
    const list: {
      id: string;
      name: string;
      phone: string;
      village: string;
      crops: string[];
      photoUrl?: string;
    }[] = [];

    const seenPhones = new Set<string>();

    // 1. Registered accounts with role 'farmer'
    registeredAccounts
      .filter((a) => a.role === 'farmer')
      .forEach((a) => {
        const clean = a.phoneNumber.replace(/\D/g, '').slice(-10);
        if (!seenPhones.has(clean)) {
          seenPhones.add(clean);
          list.push({
            id: a.id,
            name: a.fullName,
            phone: clean,
            village: a.shopOrVillage || 'Grower Belt',
            crops: a.licenseOrCrop ? [a.licenseOrCrop] : ['Marigold (Banthi)'],
            photoUrl: a.photoUrl,
          });
        }
      });

    // 2. Existing local farmers
    farmers.forEach((f) => {
      const clean = f.phone.replace(/\D/g, '').slice(-10);
      if (!seenPhones.has(clean)) {
        seenPhones.add(clean);
        list.push({
          id: f.id,
          name: f.name,
          phone: clean,
          village: f.village,
          crops: f.primaryCrops,
          photoUrl: f.photoUrl,
        });
      }
    });

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        f.crops.some((c) => c.toLowerCase().includes(q))
    );
  }, [registeredAccounts, farmers, searchQuery]);

  const openAddModal = () => {
    setEditingFarmer(null);
    setFormName('');
    setFormPhone('');
    setFormVillage('');
    setFormPhotoUrl('');
    setFormCrops(['Marigold (Banthi)']);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFormName(farmer.name);
    setFormPhone(farmer.phone);
    setFormVillage(farmer.village);
    setFormPhotoUrl(farmer.photoUrl || '');
    setFormCrops(farmer.primaryCrops);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formName.trim();
    const cleanPhone = formPhone.replace(/\D/g, '').slice(-10);

    if (!trimmedName) {
      setFormError('Farmer name is required');
      return;
    }

    if (/[0-9]/.test(trimmedName)) {
      setFormError('Farmer name cannot contain numbers (పేరులో అంకెలు ఉండకూడదు)');
      return;
    }

    if (cleanPhone.length !== 10) {
      setFormError('Phone number must contain exactly 10 digits (10 అంకెల మొబైల్ నంబర్)');
      return;
    }

    if (editingFarmer) {
      updateFarmer(editingFarmer.id, {
        name: trimmedName,
        phone: cleanPhone,
        village: formVillage.trim() || 'Local Belt',
        primaryCrops: formCrops,
        photoUrl: formPhotoUrl.trim() || undefined,
      });
    } else {
      addFarmer({
        name: trimmedName,
        phone: cleanPhone,
        village: formVillage.trim() || 'Local Area',
        primaryCrops: formCrops.length > 0 ? formCrops : ['Marigold (Banthi)'],
        connectedMerchantIds: [merchantProfile.merchantId],
        photoUrl: formPhotoUrl.trim() || undefined,
      });
    }

    setIsAddModalOpen(false);
  };

  const toggleCrop = (cropName: string) => {
    if (formCrops.includes(cropName)) {
      setFormCrops(formCrops.filter((c) => c !== cropName));
    } else {
      setFormCrops([...formCrops, cropName]);
    }
  };

  // Send request to searched farmer
  const handleSendRequestToFarmer = (farmer: {
    id: string;
    name: string;
    phone: string;
    village: string;
  }) => {
    sendConnectionRequest({
      senderRole: 'merchant',
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      farmerVillage: farmer.village,
      merchantId: merchantProfile.merchantId || `MANDI-${cleanMerchantPhone.slice(-4)}`,
      merchantName: merchantProfile.shopName || 'Flower Mandi Shop',
      merchantPhone: merchantProfile.phoneNumber || `+91 ${cleanMerchantPhone}`,
      merchantOwnerName: merchantProfile.ownerName,
    });

    setNotificationMsg(
      `Connection request sent to ${farmer.name}! Once they accept, only their specific flower lots and ledger will be shared.`
    );
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Direct Send Request via Phone form
  const handleSendDirectRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setDirectError(null);
    setDirectSuccess(null);

    const name = directFarmerName.trim();
    const cleanPhone = directFarmerPhone.replace(/\D/g, '').slice(-10);

    if (!name) {
      setDirectError('Please enter farmer name');
      return;
    }

    if (/[0-9]/.test(name)) {
      setDirectError('Farmer name cannot contain numbers (పేరులో అంకెలు ఉండకూడదు)');
      return;
    }

    if (cleanPhone.length !== 10) {
      setDirectError('Phone number must contain exactly 10 digits (ఫోన్ నంబర్‌లో 10 అంకెలు మాత్రమే)');
      return;
    }

    sendConnectionRequest({
      senderRole: 'merchant',
      farmerName: name,
      farmerPhone: cleanPhone,
      farmerVillage: directFarmerVillage.trim() || 'Mandi Grower Belt',
      merchantId: merchantProfile.merchantId || `MANDI-${cleanMerchantPhone.slice(-4)}`,
      merchantName: merchantProfile.shopName || 'Flower Mandi Shop',
      merchantPhone: merchantProfile.phoneNumber || `+91 ${cleanMerchantPhone}`,
      merchantOwnerName: merchantProfile.ownerName,
    });

    setDirectSuccess(`Connection request sent to ${name} (${cleanPhone})!`);
    setDirectFarmerName('');
    setDirectFarmerPhone('');
    setDirectFarmerVillage('');
    setTimeout(() => setDirectSuccess(null), 5000);
  };

  const handleAcceptRequest = (reqId: string, farmerName: string) => {
    acceptConnectionRequest(reqId);
    setNotificationMsg(
      `✓ Connection accepted with ${farmerName}! Data sharing activated. Only this specific farmer's consignment lots and ledger are now shared.`
    );
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleDeclineRequest = (reqId: string) => {
    declineConnectionRequest(reqId);
    setNotificationMsg('Request declined.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Farmer Ledger Modal calculations - strictly for this farmer!
  const farmerLots = useMemo(() => {
    if (!selectedLedgerFarmer) return [];
    const cleanFarmerPhone = selectedLedgerFarmer.phone.replace(/\D/g, '').slice(-10);
    return lots.filter((l) => {
      const lotPhone = l.farmerPhone ? l.farmerPhone.replace(/\D/g, '').slice(-10) : '';
      return (
        l.farmerId === selectedLedgerFarmer.id ||
        (cleanFarmerPhone && lotPhone === cleanFarmerPhone) ||
        (l.farmerName && l.farmerName.trim().toLowerCase() === selectedLedgerFarmer.name.trim().toLowerCase())
      );
    });
  }, [lots, selectedLedgerFarmer]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#2A1F1A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2E6349]" />
              <span>{t('farmersDirectoryTitle')}</span>
            </h2>
            <p className="text-xs text-[#6B5E57]">{t('farmersDirectorySubtitle')}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="open-farmer-signup-wizard-btn"
              onClick={() => setIsFarmerSignUpOpen(true)}
              className="px-3 py-2 rounded-xl border border-[#2E6349] text-[#2E6349] text-xs font-bold hover:bg-[#E9F3EE] transition flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#DD9F2F]" />
              <span>Sign Up Farmer (రైతు నమోదు)</span>
            </button>
            <button
              id="open-add-farmer-modal-btn"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs"
            >
              <UserPlus className="w-4 h-4 text-[#DD9F2F]" />
              <span>{t('addFarmerBtn')}</span>
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
        <div className="flex items-center gap-2 border-b border-[#E8E2D9] pt-2 overflow-x-auto">
          <button
            type="button"
            id="tab-connected-farmers"
            onClick={() => setActiveTab('connected')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'connected'
                ? 'border-[#2E6349] text-[#2E6349] bg-[#E9F3EE]/50 rounded-t-xl'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Connected Farmers ({farmers.length})</span>
          </button>

          <button
            type="button"
            id="tab-katha-statement"
            onClick={() => setActiveTab('katha-statement')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'katha-statement'
                ? 'border-[#2E6349] text-[#2E6349] bg-[#E9F3EE]/50 rounded-t-xl'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Farmer Katha Statement (ఖాతా స్టేట్‌మెంట్ &amp; తేదీ శోధన)</span>
          </button>

          <button
            type="button"
            id="tab-search-connect-farmers"
            onClick={() => setActiveTab('search-connect')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'search-connect'
                ? 'border-[#2E6349] text-[#2E6349] bg-[#E9F3EE]/50 rounded-t-xl'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search &amp; Send Requests (శోధించి రిక్వెస్ట్ పంపండి)</span>
          </button>

          <button
            type="button"
            id="tab-incoming-requests"
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'incoming'
                ? 'border-[#2E6349] text-[#2E6349] bg-[#E9F3EE]/50 rounded-t-xl'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Incoming Requests</span>
            {incomingFarmerRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold animate-pulse">
                {incomingFarmerRequests.length} new
              </span>
            )}
          </button>
        </div>

        {/* Data Privacy & Isolation Assurance Banner */}
        <div className="p-3 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs text-[#6B5E57] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2E6349] shrink-0" />
          <span>
            <strong>Secure Mandi Data Isolation:</strong> When connected, only that specific farmer&apos;s flower lots, parchis, and payment khata are shared. No other farmer&apos;s data is accessible.
          </span>
        </div>

        {/* Search Input for Connected or Search tab */}
        {activeTab !== 'incoming' && activeTab !== 'katha-statement' && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B5E57]" />
            <input
              id="farmers-search-input"
              type="text"
              placeholder={
                activeTab === 'connected'
                  ? 'Search connected farmers by name, village, phone, crop...'
                  : 'Search mandi growers across network by name, phone, village...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-[#FCFBF9]"
            />
          </div>
        )}
      </div>

      {/* TAB: Farmer Katha Statement */}
      {activeTab === 'katha-statement' && (
        <FarmerKathaStatementView
          initialFarmer={selectedLedgerFarmer || (farmers.length > 0 ? farmers[0] : null)}
          onSelectParchiLot={setSelectedParchiLot}
        />
      )}

      {/* TAB 1: Connected Farmers */}
      {activeTab === 'connected' && (
        <div>
          {filteredFarmers.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-[#E8E2D9] text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E9F3EE] text-[#2E6349] flex items-center justify-center mx-auto text-2xl">
                🌱
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-black text-base text-[#2A1F1A]">No Farmers in Khata Yet</h4>
                <p className="text-xs text-[#6B5E57]">
                  Register farmers in your yard or use &quot;Search &amp; Send Requests&quot; to connect with flower growers.
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('search-connect')}
                  className="px-4 py-2 rounded-xl border border-[#2E6349] text-[#2E6349] text-xs font-bold hover:bg-[#E9F3EE] transition"
                >
                  Search &amp; Connect Farmers
                </button>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-5 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition inline-flex items-center gap-2 shadow-xs"
                >
                  <UserPlus className="w-4 h-4 text-[#DD9F2F]" />
                  <span>{t('addFarmerBtn')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFarmers.map((farmer) => {
                const stats = getFarmerStats(farmer.id);

                return (
                  <div
                    key={farmer.id}
                    id={`farmer-card-${farmer.id}`}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D9] shadow-2xs hover:shadow-xs transition space-y-3.5 flex flex-col justify-between"
                  >
                    {/* Farmer Info */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2E6349] bg-[#FCFBF9] shrink-0 shadow-2xs">
                            {farmer.photoUrl ? (
                              <img
                                src={farmer.photoUrl}
                                alt={farmer.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#E9F3EE] text-[#2E6349] font-black text-sm">
                                {farmer.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-sm sm:text-base text-[#2A1F1A]">
                                {farmer.name}
                              </h4>
                              <span className="font-mono text-[10px] bg-[#FCFBF9] text-[#6B5E57] px-1.5 py-0.5 rounded border border-[#E8E2D9]">
                                {farmer.id}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B5E57] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#2E6349]" />
                              <span>{farmer.village}</span>
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-[#2A1F1A] font-mono mt-1">
                              <Phone className="w-3 h-3 text-[#6B5E57]" />
                              <span>+91 {farmer.phone}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          id={`edit-farmer-btn-${farmer.id}`}
                          onClick={() => openEditModal(farmer)}
                          className="text-[11px] text-[#2E6349] font-semibold hover:underline shrink-0"
                        >
                          {t('editFarmer')}
                        </button>
                      </div>

                      {/* Connection Badge */}
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Connected &amp; Data Shared (Only this farmer)</span>
                      </div>

                      {/* Primary Crops Chips */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {farmer.primaryCrops.map((crop) => (
                          <span
                            key={crop}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9F3EE] text-[#2E6349] font-medium"
                          >
                            🌸 {crop}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Lifetime Khata Stats */}
                    <div className="pt-2 border-t border-[#F4EFEA] space-y-2">
                      <div className="grid grid-cols-3 gap-1 text-center bg-[#FCFBF9] p-2 rounded-xl border border-[#E8E2D9] text-[11px]">
                        <div>
                          <span className="text-[#6B5E57] block text-[9px] uppercase font-semibold">
                            Total Lots
                          </span>
                          <span className="font-black text-xs text-[#2A1F1A]">{stats.totalLots}</span>
                        </div>

                        <div>
                          <span className="text-[#6B5E57] block text-[9px] uppercase font-semibold">
                            Volume
                          </span>
                          <span className="font-black text-xs text-[#2A1F1A]">
                            {stats.totalVolume.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#6B5E57] block text-[9px] uppercase font-semibold">
                            Turnover
                          </span>
                          <span className="font-black text-xs text-[#2E6349]">
                            ₹{stats.totalTurnover.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Pending Dues Banner */}
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-[#6B5E57]">Outstanding Balance:</span>
                        <span
                          className={`font-mono font-bold ${
                            stats.pendingDues > 0 ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {stats.pendingDues > 0 ? `₹${stats.pendingDues.toLocaleString('en-IN')}` : 'Settled ✓'}
                        </span>
                      </div>

                      {/* View Ledger Action */}
                      <button
                        id={`view-ledger-btn-${farmer.id}`}
                        onClick={() => setSelectedLedgerFarmer(farmer)}
                        className="w-full py-2 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#2E6349]" />
                        <span>View Private Khata (వ్యక్తిగత ఖాతా)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Search & Send Requests */}
      {activeTab === 'search-connect' && (
        <div className="space-y-6">
          {/* Quick Direct Invite / Send Request Form */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[#2E6349]" />
              <div>
                <h3 className="text-sm font-black text-[#2A1F1A]">
                  Send Connection Request by Phone (ఫోన్ ద్వారా రిక్వెస్ట్ పంపండి)
                </h3>
                <p className="text-xs text-[#6B5E57]">
                  Enter farmer&apos;s phone number and name. Upon acceptance, their private consignments will sync automatically.
                </p>
              </div>
            </div>

            {directError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{directError}</span>
              </div>
            )}

            {directSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{directSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSendDirectRequest} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#2A1F1A] mb-1">
                  Farmer Full Name * (No numbers)
                </label>
                <input
                  id="direct-farmer-name"
                  type="text"
                  required
                  placeholder="e.g. Venkat Reddy"
                  value={directFarmerName}
                  onKeyDown={(e) => {
                    if (/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const clean = e.clipboardData.getData('text').replace(/[0-9]/g, '');
                    setDirectFarmerName(clean);
                  }}
                  onChange={(e) => setDirectFarmerName(e.target.value.replace(/[0-9]/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs bg-[#FCFBF9] focus:outline-hidden focus:border-[#2E6349]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2A1F1A] mb-1">
                  Mobile Number * (10 digits)
                </label>
                <input
                  id="direct-farmer-phone"
                  type="tel"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="e.g. 9848012345"
                  value={directFarmerPhone}
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
                    setDirectFarmerPhone(clean);
                  }}
                  onChange={(e) => setDirectFarmerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs bg-[#FCFBF9] font-mono focus:outline-hidden focus:border-[#2E6349]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2A1F1A] mb-1">
                  Village / Belt
                </label>
                <input
                  id="direct-farmer-village"
                  type="text"
                  placeholder="e.g. Shamshabad"
                  value={directFarmerVillage}
                  onChange={(e) => setDirectFarmerVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs bg-[#FCFBF9] focus:outline-hidden focus:border-[#2E6349]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  id="send-direct-request-btn"
                  className="w-full py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center justify-center gap-1.5 shadow-2xs h-[38px]"
                >
                  <Send className="w-3.5 h-3.5 text-[#DD9F2F]" />
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </div>

          {/* Network Farmers Directory */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#2A1F1A]">
              Flower Growers in Mandi Network ({networkFarmers.length})
            </h3>

            {networkFarmers.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E8E2D9] text-xs text-[#6B5E57]">
                No growers found matching your search. Use the direct invite form above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {networkFarmers.map((f) => {
                  const cleanPhone = f.phone.replace(/\D/g, '').slice(-10);

                  const isAccepted =
                    acceptedConnections.some((r) => r.farmerPhone === cleanPhone) ||
                    farmers.some((lf) => lf.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

                  const isPendingSent = outgoingMerchantRequests.some(
                    (r) => r.farmerPhone === cleanPhone && r.status === 'pending'
                  );

                  const incomingReq = incomingFarmerRequests.find((r) => r.farmerPhone === cleanPhone);

                  return (
                    <div
                      key={f.phone}
                      id={`network-farmer-${cleanPhone}`}
                      className="p-4 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#2E6349] bg-[#FCFBF9] shrink-0">
                          {f.photoUrl ? (
                            <img
                              src={f.photoUrl}
                              alt={f.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#E9F3EE] text-[#2E6349] font-black text-xs">
                              {f.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#2A1F1A]">{f.name}</h4>
                          <span className="text-[11px] text-[#6B5E57] block">📍 {f.village}</span>
                          <span className="text-[11px] font-mono text-[#2E6349] block font-semibold">
                            +91 {cleanPhone}
                          </span>
                        </div>
                      </div>

                      {/* Status / Action Button */}
                      <div className="pt-2 border-t border-[#F4EFEA]">
                        {isAccepted ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> Connected (Data Shared)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const matched = farmers.find(
                                  (loc) => loc.phone.replace(/\D/g, '').slice(-10) === cleanPhone
                                );
                                if (matched) setSelectedLedgerFarmer(matched);
                              }}
                              className="text-[10px] font-bold text-[#2E6349] hover:underline"
                            >
                              Open Khata →
                            </button>
                          </div>
                        ) : incomingReq ? (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-amber-800 block">
                              Farmer sent connection request!
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleAcceptRequest(incomingReq.id, incomingReq.farmerName)}
                                className="flex-1 py-1 px-2 rounded-lg bg-[#2E6349] text-white text-[10px] font-bold hover:bg-[#1F4532]"
                              >
                                Accept &amp; Connect
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeclineRequest(incomingReq.id)}
                                className="py-1 px-2 rounded-lg border border-gray-300 text-[10px] text-[#6B5E57]"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ) : isPendingSent ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 block text-center">
                            ⏳ Request Sent (Awaiting Farmer)
                          </span>
                        ) : (
                          <button
                            type="button"
                            id={`send-req-btn-${cleanPhone}`}
                            onClick={() => handleSendRequestToFarmer(f)}
                            className="w-full py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Send className="w-3 h-3 text-[#DD9F2F]" />
                            <span>Send Connection Request</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Incoming Requests */}
      {activeTab === 'incoming' && (
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F4EFEA] pb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#2A1F1A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2E6349]" />
                <span>Pending Incoming Requests from Farmers ({incomingFarmerRequests.length})</span>
              </h3>
              <p className="text-xs text-[#6B5E57]">
                Farmers requesting to link their digital passbook with your shop. When accepted, only their specific consignments and payments will be shared with them.
              </p>
            </div>
          </div>

          {incomingFarmerRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B5E57] space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-[#2A1F1A]">No Pending Incoming Requests</p>
              <p className="max-w-md mx-auto">
                When a farmer searches your shop and clicks &quot;Send Connection Request&quot;, their request will appear here for you to approve with one click.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingFarmerRequests.map((req) => (
                <div
                  key={req.id}
                  id={`incoming-req-${req.id}`}
                  className="p-4 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] hover:border-[#2E6349]/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2A1F1A]">{req.farmerName}</span>
                      <span className="text-xs text-[#6B5E57]">📍 {req.farmerVillage}</span>
                    </div>
                    <span className="font-mono text-xs text-[#2E6349] block font-semibold">
                      Mobile: +91 {req.farmerPhone}
                    </span>
                    <span className="text-[10px] text-[#6B5E57] block">
                      Requested on: {req.requestDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      id={`accept-request-${req.id}`}
                      onClick={() => handleAcceptRequest(req.id, req.farmerName)}
                      className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 text-[#DD9F2F]" />
                      <span>Accept Connection (అంగీకరించండి)</span>
                    </button>
                    <button
                      type="button"
                      id={`decline-request-${req.id}`}
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#E8E2D9] text-[#6B5E57] text-xs font-semibold hover:bg-gray-100 transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Farmer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#E8E2D9] overflow-hidden">
            <div className="p-4 bg-[#2E6349] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#DD9F2F]" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingFarmer ? 'Edit Farmer Profile' : t('addNewFarmerTitle')}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFarmer} className="p-5 space-y-4 bg-[#FCFBF9] max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Photo of Farmer */}
              <PhotoUploadPicker
                label="Photo of Farmer (రైతు ఫోటో)"
                sublabel="Upload, snap with webcam, or choose authentic flower grower avatar"
                currentPhotoUrl={formPhotoUrl}
                onChange={(url) => setFormPhotoUrl(url)}
                presetType="farmer"
                idPrefix="farmers-view-modal"
              />

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('farmerFullName')} * (No numbers)
                </label>
                <input
                  id="farmer-modal-name-input"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Reddy"
                  value={formName}
                  onKeyDown={(e) => {
                    if (/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const clean = e.clipboardData.getData('text').replace(/[0-9]/g, '');
                    setFormName(clean);
                  }}
                  onChange={(e) => setFormName(e.target.value.replace(/[0-9]/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs bg-white focus:outline-hidden focus:border-[#2E6349]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('farmerPhone')} * (10 digits only)
                </label>
                <input
                  id="farmer-modal-phone-input"
                  type="tel"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="e.g. 9848123456"
                  value={formPhone}
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
                    setFormPhone(clean);
                  }}
                  onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs bg-white font-mono focus:outline-hidden focus:border-[#2E6349]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1">
                  {t('farmerVillage')} *
                </label>
                <input
                  id="farmer-modal-village-input"
                  type="text"
                  required
                  placeholder="e.g. Shamshabad / Medchal"
                  value={formVillage}
                  onChange={(e) => setFormVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs bg-white focus:outline-hidden focus:border-[#2E6349]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1F1A] mb-1.5">
                  {t('primaryCropsLabel')}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {flowerVarietiesData.map((v) => {
                    const isChecked = formCrops.includes(v.en);
                    const label = language === 'te' ? v.te : language === 'hi' ? v.hi : v.en;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => toggleCrop(v.en)}
                        className={`p-2 rounded-lg text-left text-xs font-medium border transition ${
                          isChecked
                            ? 'bg-[#E9F3EE] text-[#2E6349] border-[#2E6349] font-bold'
                            : 'bg-white text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#FCFBF9]'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '} {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A]"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  id="submit-farmer-btn"
                  className="px-5 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition shadow-xs"
                >
                  {t('saveFarmer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Farmer Katha Statement Modal */}
      {selectedLedgerFarmer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[94vh]">
            <div className="p-3 bg-[#2E6349] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#DD9F2F]" />
                <span className="text-xs font-bold">
                  Farmer Katha Statement &amp; Date Lookup: {selectedLedgerFarmer.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedLedgerFarmer(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto">
              <FarmerKathaStatementView
                initialFarmer={selectedLedgerFarmer}
                onSelectParchiLot={(lot) => setSelectedParchiLot(lot)}
                onClose={() => setSelectedLedgerFarmer(null)}
                isModal={true}
              />
            </div>

            <div className="p-3 bg-white border-t border-[#E8E2D9] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLedgerFarmer(null)}
                className="px-4 py-1.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-semibold cursor-pointer hover:bg-gray-100 transition"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
