import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Language,
  PortalMode,
  MerchantTab,
  FarmerTab,
  SaleLot,
  Farmer,
  PaymentRecord,
  MerchantProfile,
  ConnectionRequest,
  RegisteredAccount,
} from '../types';
import { translations } from '../translations';
import {
  initialFarmers,
  initialMerchantProfile,
  initialPayments,
  initialConnectionRequests,
  generateInitialLots,
  getTodayDateString,
  getPastDateString,
} from '../data/initialData';

export interface UniquenessCheckResult {
  valid: boolean;
  field?: 'shopName' | 'shopAddress' | 'phoneNumber';
  message?: string;
}

interface MandiContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  merchantTab: MerchantTab;
  setMerchantTab: (tab: MerchantTab) => void;
  farmerTab: FarmerTab;
  setFarmerTab: (tab: FarmerTab) => void;
  activeFarmerId: string;
  setActiveFarmerId: (id: string) => void;
  
  // User Session & Accounts
  currentUserPhone: string;
  currentUserAccount: RegisteredAccount | null;
  registeredAccounts: RegisteredAccount[];
  switchUserAccount: (phone: string) => void;
  registerNewAccount: (account: Omit<RegisteredAccount, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  checkUniqueness: (params: { shopName?: string; shopAddress?: string; phoneNumber?: string; excludePhone?: string }) => UniquenessCheckResult;
  logoutCurrentUser: () => void;

  // Active Trading Session Date (defaults to real today, can be simulated)
  activeSessionDate: string;
  setActiveSessionDate: (date: string) => void;

  merchantProfile: MerchantProfile;
  updateMerchantProfile: (profile: Partial<MerchantProfile>) => void;

  farmers: Farmer[];
  addFarmer: (farmer: Omit<Farmer, 'id' | 'createdAt'>) => Farmer;
  updateFarmer: (id: string, updated: Partial<Farmer>) => void;

  lots: SaleLot[];
  todayLots: SaleLot[];
  addSaleLot: (lot: Omit<SaleLot, 'id' | 'parchiNumber' | 'time'>) => SaleLot;
  updateSaleLot: (id: string, updated: Partial<SaleLot>) => void;
  deleteSaleLot: (id: string) => void;

  payments: PaymentRecord[];
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'time'>) => void;

  connectionRequests: ConnectionRequest[];
  acceptConnectionRequest: (requestId: string) => void;
  declineConnectionRequest: (requestId: string) => void;
  sendConnectionRequest: (data: { name: string; phone: string; village: string; merchantId: string }) => void;

  // Selected Lot for Parchi Receipt Modal
  selectedParchiLot: SaleLot | null;
  setSelectedParchiLot: (lot: SaleLot | null) => void;

  // QR Modal
  isQRModalOpen: boolean;
  setIsQRModalOpen: (open: boolean) => void;

  // Settings Modal
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Owner Sign Up / Profile Modal
  isOwnerSignUpOpen: boolean;
  setIsOwnerSignUpOpen: (open: boolean) => void;

  // Farmer Sign Up Modal
  isFarmerSignUpOpen: boolean;
  setIsFarmerSignUpOpen: (open: boolean) => void;

  // Date Switcher Modal
  isDateSwitcherOpen: boolean;
  setIsDateSwitcherOpen: (open: boolean) => void;

  // Interactive Morning Mandi Rush Simulator
  isMorningRushOpen: boolean;
  setIsMorningRushOpen: (open: boolean) => void;

  // Interactive Farmer Phone Live Sync
  isFarmerPhoneOpen: boolean;
  setIsFarmerPhoneOpen: (open: boolean) => void;

  // Senior / Simplified View Mode for 50-60 year olds & uneducated users
  isSeniorMode: boolean;
  setIsSeniorMode: (val: boolean) => void;
  toggleSeniorMode: () => void;

  // Translation function
  t: (key: string) => string;

  // Calculated Metrics
  todayTurnover: number;
  todayLotsCount: number;
  todayFarmersServed: number;
  todayTotalVolume: number;
  todayCommissionEarned: number;
  totalOutstandingDues: number;
  totalPaidToDate: number;

  getFarmerStats: (farmerId: string) => {
    totalLots: number;
    totalVolume: number;
    totalTurnover: number;
    totalNetPayable: number;
    totalPaid: number;
    pendingDues: number;
  };

  getLotsForDate: (date: string) => SaleLot[];
  startNewDaySession: (newDate?: string) => void;
  clearDateLots: (date: string) => void;

  // Data Actions
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;
  resetAllData: () => void;
  clearTodayLotsForTesting: () => void;
}

const MandiContext = createContext<MandiContextType | undefined>(undefined);

const GLOBAL_STORAGE_KEYS = {
  LANG: 'phoolmitra_lang_v1',
  ACCOUNTS: 'phoolmitra_registered_accounts_v1',
  ACTIVE_USER_PHONE: 'phoolmitra_active_phone_v1',
  ONBOARDING_DONE: 'phoolmitra_onboarding_completed',
  ACTIVE_ROLE: 'phoolmitra_user_role',
  PORTAL: 'phoolmitra_portal_v1',
  SENIOR_MODE: 'phoolmitra_senior_mode',
};

const getUserStorageKeys = (phone: string) => {
  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : 'default';
  return {
    MERCHANT: `phoolmitra_${cleanPhone}_merchant_v2`,
    FARMERS: `phoolmitra_${cleanPhone}_farmers_v2`,
    LOTS: `phoolmitra_${cleanPhone}_lots_v2`,
    PAYMENTS: `phoolmitra_${cleanPhone}_payments_v2`,
    REQUESTS: `phoolmitra_${cleanPhone}_requests_v2`,
  };
};

export const MandiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(GLOBAL_STORAGE_KEYS.LANG);
    return (saved === 'te' || saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  const [currentUserPhone, setCurrentUserPhone] = useState<string>(() => {
    const saved = localStorage.getItem(GLOBAL_STORAGE_KEYS.ACTIVE_USER_PHONE);
    return saved ? saved.replace(/\D/g, '').slice(-10) : '';
  });

  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    const saved = localStorage.getItem(GLOBAL_STORAGE_KEYS.ACCOUNTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    return [];
  });

  const currentUserAccount = useMemo(() => {
    if (!currentUserPhone) return null;
    return registeredAccounts.find(
      (a) => a.phoneNumber.replace(/\D/g, '').slice(-10) === currentUserPhone
    ) || null;
  }, [registeredAccounts, currentUserPhone]);

  const [portalMode, setPortalModeState] = useState<PortalMode>(() => {
    const saved = localStorage.getItem(GLOBAL_STORAGE_KEYS.PORTAL) as PortalMode;
    return saved || 'merchant';
  });

  const [merchantTab, setMerchantTab] = useState<MerchantTab>('dashboard');
  const [farmerTab, setFarmerTab] = useState<FarmerTab>('overview');
  const [activeFarmerId, setActiveFarmerId] = useState<string>('');

  // Real today date string
  const [activeSessionDate, setActiveSessionDate] = useState<string>(getTodayDateString());

  // Profile - dynamic per user phone
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile>(() => {
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.MERCHANT);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return initialMerchantProfile;
  });

  // Farmers - dynamic per user phone
  const [farmers, setFarmers] = useState<Farmer[]>(() => {
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.FARMERS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return initialFarmers;
  });

  // Lots - dynamic per user phone
  const [lots, setLots] = useState<SaleLot[]>(() => {
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.LOTS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return generateInitialLots();
  });

  // Payments - dynamic per user phone
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.PAYMENTS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return initialPayments;
  });

  // Connection Requests - dynamic per user phone
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>(() => {
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.REQUESTS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return initialConnectionRequests;
  });

  // Modals
  const [selectedParchiLot, setSelectedParchiLot] = useState<SaleLot | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isOwnerSignUpOpen, setIsOwnerSignUpOpen] = useState<boolean>(false);
  const [isFarmerSignUpOpen, setIsFarmerSignUpOpen] = useState<boolean>(false);
  const [isDateSwitcherOpen, setIsDateSwitcherOpen] = useState<boolean>(false);
  const [isMorningRushOpen, setIsMorningRushOpen] = useState<boolean>(false);
  const [isFarmerPhoneOpen, setIsFarmerPhoneOpen] = useState<boolean>(false);
  const [isSeniorMode, setIsSeniorMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(GLOBAL_STORAGE_KEYS.SENIOR_MODE);
    return saved ? saved === 'true' : true;
  });

  const toggleSeniorMode = () => {
    setIsSeniorMode((prev) => {
      const next = !prev;
      localStorage.setItem(GLOBAL_STORAGE_KEYS.SENIOR_MODE, String(next));
      return next;
    });
  };

  // Switch User Account & Load Their Isolated Data
  const switchUserAccount = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    setCurrentUserPhone(cleanPhone);
    localStorage.setItem(GLOBAL_STORAGE_KEYS.ACTIVE_USER_PHONE, cleanPhone);

    const keys = getUserStorageKeys(cleanPhone);

    // Load Merchant Profile
    const savedMerchant = localStorage.getItem(keys.MERCHANT);
    if (savedMerchant) {
      try {
        setMerchantProfile(JSON.parse(savedMerchant));
      } catch {
        setMerchantProfile(initialMerchantProfile);
      }
    } else {
      // Find account if registered
      const acct = registeredAccounts.find(
        (a) => a.phoneNumber.replace(/\D/g, '').slice(-10) === cleanPhone
      );
      if (acct && acct.role === 'merchant') {
        const newProf: MerchantProfile = {
          shopName: acct.shopOrVillage,
          ownerName: acct.fullName,
          photoUrl: acct.photoUrl || '',
          shopNumber: acct.shopNumber || '',
          apmcMarketName: acct.marketName || 'APMC Wholesale Flower Market',
          merchantId: `APMC-${cleanPhone.slice(-4)}`,
          phoneNumber: `+91 ${cleanPhone}`,
          licenseNumber: acct.licenseOrCrop || '',
          defaultCommissionRate: 10,
          address: acct.shopAddress || '',
        };
        setMerchantProfile(newProf);
      } else {
        setMerchantProfile(initialMerchantProfile);
      }
    }

    // Load Farmers
    const savedFarmers = localStorage.getItem(keys.FARMERS);
    if (savedFarmers) {
      try {
        const parsed = JSON.parse(savedFarmers);
        setFarmers(Array.isArray(parsed) ? parsed : []);
      } catch {
        setFarmers([]);
      }
    } else {
      setFarmers([]);
    }

    // Load Lots
    const savedLots = localStorage.getItem(keys.LOTS);
    if (savedLots) {
      try {
        const parsed = JSON.parse(savedLots);
        setLots(Array.isArray(parsed) ? parsed : []);
      } catch {
        setLots([]);
      }
    } else {
      setLots([]);
    }

    // Load Payments
    const savedPayments = localStorage.getItem(keys.PAYMENTS);
    if (savedPayments) {
      try {
        const parsed = JSON.parse(savedPayments);
        setPayments(Array.isArray(parsed) ? parsed : []);
      } catch {
        setPayments([]);
      }
    } else {
      setPayments([]);
    }

    // Load Connection Requests
    const savedRequests = localStorage.getItem(keys.REQUESTS);
    if (savedRequests) {
      try {
        const parsed = JSON.parse(savedRequests);
        setConnectionRequests(Array.isArray(parsed) ? parsed : []);
      } catch {
        setConnectionRequests([]);
      }
    } else {
      setConnectionRequests([]);
    }
  };

  // Check Uniqueness: No one can have the same shop name or shop address
  const checkUniqueness = ({
    shopName,
    shopAddress,
    phoneNumber,
    excludePhone,
  }: {
    shopName?: string;
    shopAddress?: string;
    phoneNumber?: string;
    excludePhone?: string;
  }): UniquenessCheckResult => {
    const cleanExcludePhone = excludePhone ? excludePhone.replace(/\D/g, '').slice(-10) : '';

    const normalize = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');

    for (const acct of registeredAccounts) {
      const acctPhone = acct.phoneNumber.replace(/\D/g, '').slice(-10);
      if (cleanExcludePhone && acctPhone === cleanExcludePhone) {
        continue;
      }

      // Check Mobile uniqueness
      if (phoneNumber) {
        const cleanReqPhone = phoneNumber.replace(/\D/g, '').slice(-10);
        if (cleanReqPhone && acctPhone === cleanReqPhone) {
          return {
            valid: false,
            field: 'phoneNumber',
            message: `An account with mobile number +91 ${cleanReqPhone} already exists. Please log in with this number.`,
          };
        }
      }

      // Check Shop Name uniqueness
      if (shopName && acct.shopOrVillage) {
        const normShop = normalize(shopName);
        const normAcctShop = normalize(acct.shopOrVillage);
        if (normShop && normAcctShop && normShop === normAcctShop) {
          return {
            valid: false,
            field: 'shopName',
            message: `Shop name "${shopName}" is already registered by another merchant. Every shop must have a unique name.`,
          };
        }
      }

      // Check Shop Address uniqueness
      if (shopAddress && acct.shopAddress) {
        const normAddress = normalize(shopAddress);
        const normAcctAddress = normalize(acct.shopAddress);
        if (normAddress && normAcctAddress && normAddress === normAcctAddress) {
          return {
            valid: false,
            field: 'shopAddress',
            message: `Shop address "${shopAddress}" is already registered. Another shop cannot have the exact same address.`,
          };
        }
      }
    }

    return { valid: true };
  };

  // Register a new account
  const registerNewAccount = (
    accountData: Omit<RegisteredAccount, 'id' | 'createdAt'>
  ): { success: boolean; error?: string } => {
    const cleanPhone = accountData.phoneNumber.replace(/\D/g, '').slice(-10);
    
    // Validate uniqueness
    const uniqueness = checkUniqueness({
      shopName: accountData.role === 'merchant' ? accountData.shopOrVillage : undefined,
      shopAddress: accountData.role === 'merchant' ? (accountData.shopAddress || accountData.shopOrVillage) : undefined,
      phoneNumber: cleanPhone,
    });

    if (!uniqueness.valid) {
      return { success: false, error: uniqueness.message };
    }

    const newAccount: RegisteredAccount = {
      ...accountData,
      id: `USR-${Date.now()}-${cleanPhone.slice(-4)}`,
      phoneNumber: cleanPhone,
      createdAt: getTodayDateString(),
    };

    const updatedAccounts = [...registeredAccounts, newAccount];
    setRegisteredAccounts(updatedAccounts);
    localStorage.setItem(GLOBAL_STORAGE_KEYS.ACCOUNTS, JSON.stringify(updatedAccounts));

    // Switch to this user immediately
    switchUserAccount(cleanPhone);
    return { success: true };
  };

  // Logout Current User
  const logoutCurrentUser = () => {
    try {
      localStorage.removeItem(GLOBAL_STORAGE_KEYS.ACTIVE_USER_PHONE);
      localStorage.removeItem(GLOBAL_STORAGE_KEYS.ONBOARDING_DONE);
      localStorage.removeItem(GLOBAL_STORAGE_KEYS.ACTIVE_ROLE);
    } catch {
      // ignore
    }
    setCurrentUserPhone('');
    window.location.reload();
  };

  // Sync to Global LocalStorage
  useEffect(() => {
    localStorage.setItem(GLOBAL_STORAGE_KEYS.LANG, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(GLOBAL_STORAGE_KEYS.PORTAL, portalMode);
  }, [portalMode]);

  useEffect(() => {
    localStorage.setItem(GLOBAL_STORAGE_KEYS.ACCOUNTS, JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  // Sync isolated data to LocalStorage for current logged in user
  useEffect(() => {
    if (!currentUserPhone) return;
    const keys = getUserStorageKeys(currentUserPhone);
    localStorage.setItem(keys.MERCHANT, JSON.stringify(merchantProfile));
  }, [merchantProfile, currentUserPhone]);

  useEffect(() => {
    if (!currentUserPhone) return;
    const keys = getUserStorageKeys(currentUserPhone);
    localStorage.setItem(keys.FARMERS, JSON.stringify(farmers));
  }, [farmers, currentUserPhone]);

  useEffect(() => {
    if (!currentUserPhone) return;
    const keys = getUserStorageKeys(currentUserPhone);
    localStorage.setItem(keys.LOTS, JSON.stringify(lots));
  }, [lots, currentUserPhone]);

  useEffect(() => {
    if (!currentUserPhone) return;
    const keys = getUserStorageKeys(currentUserPhone);
    localStorage.setItem(keys.PAYMENTS, JSON.stringify(payments));
  }, [payments, currentUserPhone]);

  useEffect(() => {
    if (!currentUserPhone) return;
    const keys = getUserStorageKeys(currentUserPhone);
    localStorage.setItem(keys.REQUESTS, JSON.stringify(connectionRequests));
  }, [connectionRequests, currentUserPhone]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setPortalMode = (mode: PortalMode) => {
    setPortalModeState(mode);
  };

  const updateMerchantProfile = (profile: Partial<MerchantProfile>) => {
    setMerchantProfile((prev) => {
      const updated = { ...prev, ...profile };
      // Also sync back to registered account if matching
      if (currentUserPhone) {
        setRegisteredAccounts((allAccts) =>
          allAccts.map((a) => {
            if (a.phoneNumber.replace(/\D/g, '').slice(-10) === currentUserPhone && a.role === 'merchant') {
              return {
                ...a,
                fullName: updated.ownerName || a.fullName,
                shopOrVillage: updated.shopName || a.shopOrVillage,
                shopAddress: updated.address || a.shopAddress,
                shopNumber: updated.shopNumber || a.shopNumber,
                marketName: updated.apmcMarketName || a.marketName,
                licenseOrCrop: updated.licenseNumber || a.licenseOrCrop,
                photoUrl: updated.photoUrl || a.photoUrl,
              };
            }
            return a;
          })
        );
      }
      return updated;
    });
  };

  const addFarmer = (farmerData: Omit<Farmer, 'id' | 'createdAt'>): Farmer => {
    const nextNum = farmers.length + 1;
    const newId = `FM-${String(nextNum).padStart(3, '0')}`;
    const newFarmer: Farmer = {
      ...farmerData,
      id: newId,
      createdAt: getTodayDateString(),
    };
    setFarmers((prev) => [newFarmer, ...prev]);
    return newFarmer;
  };

  const updateFarmer = (id: string, updated: Partial<Farmer>) => {
    setFarmers((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
  };

  // Add Sale Lot
  const addSaleLot = (lotData: Omit<SaleLot, 'id' | 'parchiNumber' | 'time'>): SaleLot => {
    const lotYear = activeSessionDate.split('-')[0] || '2026';
    const nextNum = lots.length + 1;
    const parchiNumber = `PAR-${lotYear}-${String(nextNum).padStart(4, '0')}`;

    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newLot: SaleLot = {
      ...lotData,
      id: `lot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      parchiNumber,
      time,
      merchantId: merchantProfile.merchantId || `APMC-${currentUserPhone.slice(-4)}`,
      merchantName: merchantProfile.shopName || 'Mandi Shop',
    };

    setLots((prev) => [newLot, ...prev]);

    // If payment recorded on lot creation
    if (newLot.amountPaid > 0) {
      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        farmerId: newLot.farmerId,
        farmerName: newLot.farmerName,
        lotId: newLot.id,
        parchiNumber: newLot.parchiNumber,
        amount: newLot.amountPaid,
        paymentMode: newLot.paymentMode || 'Cash',
        date: newLot.date,
        time: newLot.time,
        notes: newLot.notes || 'Direct lot auction payment',
        status: 'Completed',
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    return newLot;
  };

  const updateSaleLot = (id: string, updated: Partial<SaleLot>) => {
    setLots((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
  };

  const deleteSaleLot = (id: string) => {
    setLots((prev) => prev.filter((l) => l.id !== id));
  };

  // Record separate payment
  const recordPayment = (paymentData: Omit<PaymentRecord, 'id' | 'time'>) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update lot status if linked
    if (newPayment.lotId) {
      setLots((prev) =>
        prev.map((l) => {
          if (l.id === newPayment.lotId) {
            const newAmountPaid = l.amountPaid + newPayment.amount;
            const newBalance = Math.max(0, l.farmerNetPayable - newAmountPaid);
            const newStatus: 'Paid' | 'Partial' | 'Unpaid' =
              newBalance <= 0 ? 'Paid' : newAmountPaid > 0 ? 'Partial' : 'Unpaid';
            return {
              ...l,
              amountPaid: newAmountPaid,
              balanceDue: newBalance,
              paymentStatus: newStatus,
            };
          }
          return l;
        })
      );
    }
  };

  // Connection Requests
  const acceptConnectionRequest = (requestId: string) => {
    setConnectionRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' } : r))
    );

    const req = connectionRequests.find((r) => r.id === requestId);
    if (req) {
      const exists = farmers.some((f) => f.phone === req.farmerPhone);
      if (!exists) {
        addFarmer({
          name: req.farmerName,
          phone: req.farmerPhone,
          village: req.farmerVillage,
          primaryCrops: ['Marigold (Banthi)'],
          connectedMerchantIds: [merchantProfile.merchantId],
        });
      }
    }
  };

  const declineConnectionRequest = (requestId: string) => {
    setConnectionRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'declined' } : r))
    );
  };

  const sendConnectionRequest = (data: {
    name: string;
    phone: string;
    village: string;
    merchantId: string;
  }) => {
    const newReq: ConnectionRequest = {
      id: `req-${Date.now()}`,
      farmerId: `FARM-TMP-${Date.now()}`,
      farmerName: data.name,
      farmerPhone: data.phone,
      farmerVillage: data.village,
      merchantId: data.merchantId,
      merchantName: merchantProfile.shopName,
      status: 'pending',
      requestDate: getTodayDateString(),
    };
    setConnectionRequests((prev) => [newReq, ...prev]);
  };

  // Translation helper
  const t = (key: string): string => {
    const langObj = translations[language] || translations.en;
    return langObj[key] || translations.en[key] || key;
  };

  // Active Trading Session Lots
  const todayLots = useMemo(() => {
    return lots.filter((lot) => lot.date === activeSessionDate);
  }, [lots, activeSessionDate]);

  // Today metrics
  const todayTurnover = useMemo(() => {
    return todayLots.reduce((acc, l) => acc + l.grossTotal, 0);
  }, [todayLots]);

  const todayLotsCount = useMemo(() => todayLots.length, [todayLots]);

  const todayFarmersServed = useMemo(() => {
    const unique = new Set(todayLots.map((l) => l.farmerId));
    return unique.size;
  }, [todayLots]);

  const todayTotalVolume = useMemo(() => {
    return todayLots.reduce((acc, l) => acc + l.quantity, 0);
  }, [todayLots]);

  const todayCommissionEarned = useMemo(() => {
    return todayLots.reduce((acc, l) => acc + l.commissionAmount, 0);
  }, [todayLots]);

  const totalOutstandingDues = useMemo(() => {
    return lots.reduce((acc, l) => acc + l.balanceDue, 0);
  }, [lots]);

  const totalPaidToDate = useMemo(() => {
    return payments.reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  // Stats for specific farmer
  const getFarmerStats = (farmerId: string) => {
    const farmerLots = lots.filter((l) => l.farmerId === farmerId);
    const totalLots = farmerLots.length;
    const totalVolume = farmerLots.reduce((acc, l) => acc + l.quantity, 0);
    const totalTurnover = farmerLots.reduce((acc, l) => acc + l.grossTotal, 0);
    const totalNetPayable = farmerLots.reduce((acc, l) => acc + l.farmerNetPayable, 0);
    const totalPaid = farmerLots.reduce((acc, l) => acc + l.amountPaid, 0);
    const pendingDues = farmerLots.reduce((acc, l) => acc + l.balanceDue, 0);

    return {
      totalLots,
      totalVolume,
      totalTurnover,
      totalNetPayable,
      totalPaid,
      pendingDues,
    };
  };

  // Export JSON Backup
  const exportBackupJSON = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      userPhone: currentUserPhone,
      merchantProfile,
      farmers,
      lots,
      payments,
      connectionRequests,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PhoolMitra-Backup-${currentUserPhone || 'User'}-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.merchantProfile) setMerchantProfile(parsed.merchantProfile);
      if (Array.isArray(parsed.farmers)) setFarmers(parsed.farmers);
      if (Array.isArray(parsed.lots)) setLots(parsed.lots);
      if (Array.isArray(parsed.payments)) setPayments(parsed.payments);
      if (Array.isArray(parsed.connectionRequests)) setConnectionRequests(parsed.connectionRequests);
      return true;
    } catch {
      return false;
    }
  };

  // Reset all data for current logged in user
  const resetAllData = () => {
    if (currentUserPhone) {
      const keys = getUserStorageKeys(currentUserPhone);
      localStorage.removeItem(keys.MERCHANT);
      localStorage.removeItem(keys.FARMERS);
      localStorage.removeItem(keys.LOTS);
      localStorage.removeItem(keys.PAYMENTS);
      localStorage.removeItem(keys.REQUESTS);
    }

    setMerchantProfile(initialMerchantProfile);
    setFarmers(initialFarmers);
    setLots(generateInitialLots());
    setPayments(initialPayments);
    setConnectionRequests(initialConnectionRequests);
    setActiveSessionDate(getTodayDateString());
  };

  // Quick helper to test the empty morning state prompt on Dashboard
  const clearTodayLotsForTesting = () => {
    setLots((prev) => prev.filter((l) => l.date !== activeSessionDate));
  };

  const getLotsForDate = (date: string): SaleLot[] => {
    return lots.filter((l) => l.date === date);
  };

  const startNewDaySession = (newDate?: string) => {
    const target = newDate || getTodayDateString();
    setActiveSessionDate(target);
  };

  const clearDateLots = (date: string) => {
    setLots((prev) => prev.filter((l) => l.date !== date));
  };

  return (
    <MandiContext.Provider
      value={{
        language,
        setLanguage,
        portalMode,
        setPortalMode,
        merchantTab,
        setMerchantTab,
        farmerTab,
        setFarmerTab,
        activeFarmerId,
        setActiveFarmerId,
        currentUserPhone,
        currentUserAccount,
        registeredAccounts,
        switchUserAccount,
        registerNewAccount,
        checkUniqueness,
        logoutCurrentUser,
        activeSessionDate,
        setActiveSessionDate,
        merchantProfile,
        updateMerchantProfile,
        farmers,
        addFarmer,
        updateFarmer,
        lots,
        todayLots,
        addSaleLot,
        updateSaleLot,
        deleteSaleLot,
        payments,
        recordPayment,
        connectionRequests,
        acceptConnectionRequest,
        declineConnectionRequest,
        sendConnectionRequest,
        selectedParchiLot,
        setSelectedParchiLot,
        isQRModalOpen,
        setIsQRModalOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isOwnerSignUpOpen,
        setIsOwnerSignUpOpen,
        isFarmerSignUpOpen,
        setIsFarmerSignUpOpen,
        isDateSwitcherOpen,
        setIsDateSwitcherOpen,
        isMorningRushOpen,
        setIsMorningRushOpen,
        isFarmerPhoneOpen,
        setIsFarmerPhoneOpen,
        isSeniorMode,
        setIsSeniorMode,
        toggleSeniorMode,
        t,
        todayTurnover,
        todayLotsCount,
        todayFarmersServed,
        todayTotalVolume,
        todayCommissionEarned,
        totalOutstandingDues,
        totalPaidToDate,
        getFarmerStats,
        getLotsForDate,
        startNewDaySession,
        clearDateLots,
        exportBackupJSON,
        importBackupJSON,
        resetAllData,
        clearTodayLotsForTesting,
      }}
    >
      {children}
    </MandiContext.Provider>
  );
};

export const useMandi = (): MandiContextType => {
  const context = useContext(MandiContext);
  if (!context) {
    throw new Error('useMandi must be used within a MandiProvider');
  }
  return context;
};
