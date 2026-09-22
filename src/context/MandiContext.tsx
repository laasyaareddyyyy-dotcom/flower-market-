import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  Language,
  PortalMode,
  CommodityCategory,
  MerchantTab,
  FarmerTab,
  SaleLot,
  Farmer,
  PaymentRecord,
  MerchantProfile,
  ConnectionRequest,
  RegisteredAccount,
  ParchiAuditLog,
  Shipment,
  ShipmentItem,
  FifteenDaySettlement,
  PaymentMode,
  HelpTicket,
  HelpTicketCategory,
  HelpTicketPriority,
  HelpTicketStatus,
  TicketAttachment,
  TicketMessage,
  TicketInternalNote,
} from '../types';
import { translations } from '../translations';
import { useFirebase } from './FirebaseContext';
import {
  syncFarmerToCloud,
  deleteFarmerFromCloud,
  syncLotToCloud,
  deleteLotFromCloud,
  syncShipmentToCloud,
  deleteShipmentFromCloud,
  syncPaymentToCloud,
  deletePaymentFromCloud,
  syncSettlementToCloud,
  syncMerchantProfileToCloud,
} from '../services/firebaseSync';
import {
  initialFarmers,
  initialMerchantProfile,
  initialPayments,
  initialConnectionRequests,
  initialHelpTickets,
  generateInitialLots,
  generateInitialShipments,
  getTodayDateString,
  getPastDateString,
} from '../data/initialData';

export const sanitizeLotsCommission = (rawLots: SaleLot[]): SaleLot[] => {
  if (!Array.isArray(rawLots)) return [];
  return rawLots.map((lot) => {
    const hamali = Number(lot.ammaliCharges || lot.otherExpenditures?.hamali) || 0;
    const transport = Number(lot.transportCharges || lot.otherExpenditures?.transport) || 0;
    const misc = Number(lot.otherExpenditures?.misc) || 0;
    const gross = Number(lot.grossTotal) || 0;
    const net = Number(lot.farmerNetPayable) || 0;
    const totalDailyDeductions = hamali + transport + misc;

    // If commissionAmount was auto-assigned without being actually deducted from farmerNetPayable
    if (lot.commissionAmount > 0 && Math.abs((net + totalDailyDeductions) - gross) <= 1) {
      return {
        ...lot,
        commissionPercent: 0,
        commissionAmount: 0,
      };
    }
    return lot;
  });
};

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

  // User Selected Commodities (Only chosen commodities are accessible in app)
  userCommodities: CommodityCategory[];
  setUserCommodities: (commodities: CommodityCategory[]) => void;

  // Multi-Commodity Active Filter & Stats
  activeCommodityFilter: CommodityCategory | 'all';
  setActiveCommodityFilter: (category: CommodityCategory | 'all') => void;
  commodityStats: Record<CommodityCategory | 'all', {
    grossSales: number;
    totalDeductions: number;
    netEarnings: number;
    totalVolume: number;
    count: number;
    transportTotal: number;
    hamaliTotal: number;
    commissionTotal: number;
  }>;

  // Active Trading Session Date (defaults to real today, can be simulated)
  activeSessionDate: string;
  setActiveSessionDate: (date: string) => void;

  merchantProfile: MerchantProfile;
  updateMerchantProfile: (profile: Partial<MerchantProfile>) => void;

  farmers: Farmer[];
  addFarmer: (farmer: Omit<Farmer, 'id' | 'createdAt'>) => Farmer;
  updateFarmer: (id: string, updated: Partial<Farmer>) => void;
  deleteFarmer: (id: string) => void;

  lots: SaleLot[];
  todayLots: SaleLot[];
  addSaleLot: (lot: Omit<SaleLot, 'id' | 'parchiNumber' | 'time'>) => SaleLot;
  updateSaleLot: (id: string, updated: Partial<SaleLot>) => void;
  deleteSaleLot: (id: string) => void;

  // Shipments (Consolidated Multi-variety shipments with one-time Hamali & Transport)
  shipments: Shipment[];
  todayShipments: Shipment[];
  addShipment: (data: Omit<Shipment, 'id' | 'shipmentNumber' | 'time'>) => Shipment;
  updateShipment: (id: string, updated: Partial<Shipment>) => void;
  deleteShipment: (id: string) => void;
  getShipmentsForDate: (date: string) => Shipment[];

  // 15-Day Settlements & Period Settlement Calculation
  settlements: FifteenDaySettlement[];
  calculate15DaySettlement: (
    farmerId: string,
    periodStart: string,
    periodEnd: string,
    commissionPercent?: number,
    miscPercent?: number,
    commodityCategory?: CommodityCategory | 'all'
  ) => FifteenDaySettlement;
  confirmSettlement: (settlement: FifteenDaySettlement, paymentMode?: PaymentMode, paymentReference?: string) => void;
  deleteSettlement: (id: string) => void;

  // Selected Shipment for View / Modal
  selectedShipment: Shipment | null;
  setSelectedShipment: (shipment: Shipment | null) => void;

  payments: PaymentRecord[];
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'time'>) => void;
  deletePayment: (id: string) => void;
  updateLotPaymentStatus: (
    lotId: string,
    paymentStatus: 'Paid' | 'Unpaid' | 'Partial',
    amountPaid?: number,
    paymentMode?: PaymentRecord['paymentMode'],
    paymentReference?: string,
    notes?: string
  ) => void;

  connectionRequests: ConnectionRequest[];
  acceptConnectionRequest: (requestId: string) => void;
  declineConnectionRequest: (requestId: string) => void;
  sendConnectionRequest: (data: {
    senderRole: 'farmer' | 'merchant';
    farmerId?: string;
    farmerName: string;
    farmerPhone: string;
    farmerVillage?: string;
    merchantId: string;
    merchantName: string;
    merchantPhone?: string;
    merchantOwnerName?: string;
  }) => void;
  getSharedLotsForFarmer: (farmerPhone: string, farmerName: string) => SaleLot[];

  // Selected Lot for Parchi Receipt Modal
  selectedParchiLot: SaleLot | null;
  setSelectedParchiLot: (lot: SaleLot | null) => void;

  // Generate PDF Modal & Workflow
  isGeneratePdfOpen: boolean;
  setIsGeneratePdfOpen: (open: boolean) => void;
  activePdfLot: SaleLot | null;
  setActivePdfLot: (lot: SaleLot | null) => void;
  openPdfModalForLot: (lot: SaleLot) => void;
  openPdfModalForShipment: (shipment: Shipment) => void;
  openParchiSlipForShipment: (shipment: Shipment) => void;

  // Auto-remove parchi after printing & Audit Trail
  autoRemoveParchiAfterPrint: boolean;
  setAutoRemoveParchiAfterPrint: (enabled: boolean) => void;
  parchiAuditLogs: ParchiAuditLog[];
  isAuditTrailOpen: boolean;
  setIsAuditTrailOpen: (open: boolean) => void;
  removeParchiWithAudit: (lotId: string, options?: { printedAt?: string; reason?: string }) => ParchiAuditLog | null;
  restoreParchiFromAudit: (auditId: string) => boolean;
  clearParchiAuditLogs: () => void;

  // QR Modal
  isQRModalOpen: boolean;
  setIsQRModalOpen: (open: boolean) => void;

  // Settings Modal
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Portal Selector Modal
  isPortalSelectorOpen: boolean;
  setIsPortalSelectorOpen: (open: boolean) => void;

  // Tools & Services Modal
  isToolsModalOpen: boolean;
  setIsToolsModalOpen: (open: boolean) => void;

  // Owner Sign Up / Profile Modal
  isOwnerSignUpOpen: boolean;
  setIsOwnerSignUpOpen: (open: boolean) => void;

  // Farmer Sign Up Modal
  isFarmerSignUpOpen: boolean;
  setIsFarmerSignUpOpen: (open: boolean) => void;

  // Date Switcher Modal
  isDateSwitcherOpen: boolean;
  setIsDateSwitcherOpen: (open: boolean) => void;

  // Mobile Drawer Navigation
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;

  // Interactive Morning Mandi Rush Simulator
  isMorningRushOpen: boolean;
  setIsMorningRushOpen: (open: boolean) => void;

  // Interactive Farmer Phone Live Sync
  isFarmerPhoneOpen: boolean;
  setIsFarmerPhoneOpen: (open: boolean) => void;

  // Help Desk & Support
  helpTickets: HelpTicket[];
  isHelpDeskOpen: boolean;
  setIsHelpDeskOpen: (open: boolean) => void;
  helpDeskTab: 'raise' | 'my-tickets' | 'admin-dashboard' | 'faq';
  setHelpDeskTab: (tab: 'raise' | 'my-tickets' | 'admin-dashboard' | 'faq') => void;
  selectedHelpTicketId: string | null;
  setSelectedHelpTicketId: (id: string | null) => void;
  openHelpDesk: (tab?: 'raise' | 'my-tickets' | 'admin-dashboard' | 'faq', ticketId?: string) => void;
  createHelpTicket: (ticket: {
    subject: string;
    category: HelpTicketCategory;
    priority: HelpTicketPriority;
    description: string;
    userName?: string;
    userPhone?: string;
    userRole?: 'merchant' | 'farmer';
    shopName?: string;
    village?: string;
    attachments?: TicketAttachment[];
  }) => HelpTicket;
  updateHelpTicketStatus: (ticketId: string, status: HelpTicketStatus, note?: string) => void;
  assignHelpTicket: (ticketId: string, staffName: string) => void;
  addTicketResponse: (ticketId: string, message: string, senderRole?: 'user' | 'support' | 'admin', isInternal?: boolean, attachments?: TicketAttachment[]) => void;
  deleteHelpTicket: (ticketId: string) => void;

  // Translation function
  t: (key: string) => string;

  // Calculated Metrics
  todayTurnover: number;
  todayLotsCount: number;
  todayFarmersServed: number;
  todayTotalVolume: number;
  todayCommissionEarned: number;
  todayTransportTotal: number;
  todayHamaliTotal: number;
  todayFarmerNetTotal: number;
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

  // Dashboard Sections & Global Consignment Search
  dashboardTab: 'summary' | 'ledger' | 'merchant-info' | 'tools-settings';
  setDashboardTab: (tab: 'summary' | 'ledger' | 'merchant-info' | 'tools-settings') => void;
  consignmentSearchQuery: string;
  setConsignmentSearchQuery: (query: string) => void;

  // Cloud Auto-Sync State
  firebaseAutoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  isFirebaseAutoSyncEnabled?: boolean;
}

const MandiContext = createContext<MandiContextType | undefined>(undefined);

const GLOBAL_STORAGE_KEYS = {
  LANG: 'phoolmitra_lang_v1',
  ACCOUNTS: 'phoolmitra_registered_accounts_v1',
  ACTIVE_USER_PHONE: 'phoolmitra_active_phone_v1',
  ONBOARDING_DONE: 'phoolmitra_onboarding_completed',
  ACTIVE_ROLE: 'phoolmitra_user_role',
  PORTAL: 'phoolmitra_portal_v1',
  REQUESTS: 'phoolmitra_global_connection_requests_v3',
};

const getUserStorageKeys = (phone: string) => {
  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : 'default';
  return {
    MERCHANT: `phoolmitra_${cleanPhone}_merchant_v2`,
    FARMERS: `phoolmitra_${cleanPhone}_farmers_v2`,
    LOTS: `phoolmitra_${cleanPhone}_lots_v2`,
    PAYMENTS: `phoolmitra_${cleanPhone}_payments_v2`,
    REQUESTS: `phoolmitra_${cleanPhone}_requests_v2`,
    AUTO_REMOVE_PARCHI: `phoolmitra_${cleanPhone}_auto_remove_parchi_v1`,
    AUDIT_LOGS: `phoolmitra_${cleanPhone}_parchi_audit_v1`,
    SHIPMENTS: `phoolmitra_${cleanPhone}_shipments_v2`,
    SETTLEMENTS: `phoolmitra_${cleanPhone}_settlements_v2`,
  };
};

export const MandiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    user: firebaseUser,
    autoSaveStatus,
    isAutoSyncEnabled,
    scheduleAutoSync,
    loadDataFromCloud,
  } = useFirebase();

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
  const [dashboardTab, setDashboardTab] = useState<'summary' | 'ledger' | 'merchant-info' | 'tools-settings'>('summary');
  const [consignmentSearchQuery, setConsignmentSearchQuery] = useState<string>('');
  const [farmerTab, setFarmerTab] = useState<FarmerTab>('overview');
  const [activeFarmerId, setActiveFarmerId] = useState<string>('');

  // Selected commodities for this account (defaults to flowers or saved choice)
  const [userCommodities, setUserCommoditiesState] = useState<CommodityCategory[]>(() => {
    try {
      const saved = localStorage.getItem('phoolmitra_user_commodities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return ['flowers'];
  });

  const [activeCommodityFilter, setActiveCommodityFilterState] = useState<CommodityCategory | 'all'>(() => {
    try {
      const saved = localStorage.getItem('phoolmitra_user_commodities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 1) {
          return parsed[0];
        }
      }
    } catch {
      // fallback
    }
    return 'flowers';
  });

  const setUserCommodities = (commodities: CommodityCategory[]) => {
    const validList = commodities.length > 0 ? commodities : (['flowers'] as CommodityCategory[]);
    setUserCommoditiesState(validList);
    try {
      localStorage.setItem('phoolmitra_user_commodities', JSON.stringify(validList));
    } catch {
      // ignore
    }
    // Strict isolation: If only 1 commodity is selected, active filter must be that single commodity
    if (validList.length === 1) {
      setActiveCommodityFilterState(validList[0]);
    } else if (activeCommodityFilter !== 'all' && !validList.includes(activeCommodityFilter)) {
      setActiveCommodityFilterState(validList[0]);
    }
  };

  const setActiveCommodityFilter = (category: CommodityCategory | 'all') => {
    // If only 1 commodity is selected, user cannot switch to any other commodity or 'all'
    if (userCommodities.length === 1) {
      setActiveCommodityFilterState(userCommodities[0]);
      return;
    }
    // If multiple commodities are selected, user can only switch to selected commodities or 'all'
    if (category !== 'all' && !userCommodities.includes(category)) {
      // Unselected commodity is forbidden
      return;
    }
    setActiveCommodityFilterState(category);
  };

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
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed
              .filter((f) => f && typeof f === 'object')
              .map((f, idx) => ({
                ...f,
                id: (f.id && f.id !== 'undefined') ? String(f.id).trim() : `FM-${String(idx + 1).padStart(3, '0')}`,
              }));
          }
        } catch {
          // fallback
        }
      }
    }
    return initialFarmers.map((f, idx) => ({
      ...f,
      id: (f.id && f.id !== 'undefined') ? String(f.id).trim() : `FM-${String(idx + 1).padStart(3, '0')}`,
    }));
  });

  // Lots - dynamic per user phone
  const [lots, setLots] = useState<SaleLot[]>(() => {
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.LOTS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return sanitizeLotsCommission(Array.isArray(parsed) ? parsed : []);
        } catch {
          // fallback
        }
      }
    }
    return sanitizeLotsCommission(generateInitialLots());
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

  // Shipments (Multi-variety grouped shipments with one-time Hamali & Transport)
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.SHIPMENTS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // fallback
        }
      }
    }
    return generateInitialShipments('2024-09-15');
  });

  // 15-Day Settlements
  const [settlements, setSettlements] = useState<FifteenDaySettlement[]>(() => {
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.SETTLEMENTS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Connection Requests - globally synced across Mandi network
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>(() => {
    const savedGlobal = localStorage.getItem(GLOBAL_STORAGE_KEYS.REQUESTS);
    if (savedGlobal) {
      try {
        const parsed = JSON.parse(savedGlobal);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.REQUESTS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
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
  const [isPortalSelectorOpen, setIsPortalSelectorOpen] = useState<boolean>(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);
  const [isOwnerSignUpOpen, setIsOwnerSignUpOpen] = useState<boolean>(false);
  const [isFarmerSignUpOpen, setIsFarmerSignUpOpen] = useState<boolean>(false);
  const [isDateSwitcherOpen, setIsDateSwitcherOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isMorningRushOpen, setIsMorningRushOpen] = useState<boolean>(false);
  const [isFarmerPhoneOpen, setIsFarmerPhoneOpen] = useState<boolean>(false);

  // Auto-remove parchi after printing setting
  const [autoRemoveParchiAfterPrint, setAutoRemoveParchiAfterPrintState] = useState<boolean>(() => {
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.AUTO_REMOVE_PARCHI);
      if (saved !== null) return saved === 'true';
    }
    const defaultSaved = localStorage.getItem('phoolmitra_auto_remove_parchi_v1');
    return defaultSaved === 'true';
  });

  const setAutoRemoveParchiAfterPrint = (enabled: boolean) => {
    setAutoRemoveParchiAfterPrintState(enabled);
    if (currentUserPhone) {
      const keys = getUserStorageKeys(currentUserPhone);
      localStorage.setItem(keys.AUTO_REMOVE_PARCHI, String(enabled));
    }
    localStorage.setItem('phoolmitra_auto_remove_parchi_v1', String(enabled));
  };

  // Parchi Audit Trail logs (persisted per user)
  const [parchiAuditLogs, setParchiAuditLogs] = useState<ParchiAuditLog[]>(() => {
    const phone = currentUserPhone;
    if (phone) {
      const keys = getUserStorageKeys(phone);
      const saved = localStorage.getItem(keys.AUDIT_LOGS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
    }
    return [];
  });

  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState<boolean>(false);

  // Help Desk & Support State
  const [helpTickets, setHelpTickets] = useState<HelpTicket[]>(() => {
    try {
      const saved = localStorage.getItem('phoolmitra_help_tickets_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialHelpTickets;
  });

  const [isHelpDeskOpen, setIsHelpDeskOpen] = useState<boolean>(false);
  const [helpDeskTab, setHelpDeskTab] = useState<'raise' | 'my-tickets' | 'admin-dashboard' | 'faq'>('raise');
  const [selectedHelpTicketId, setSelectedHelpTicketId] = useState<string | null>(null);

  const saveHelpTickets = (updated: HelpTicket[]) => {
    setHelpTickets(updated);
    try {
      localStorage.setItem('phoolmitra_help_tickets_v2', JSON.stringify(updated));
    } catch {}
  };

  const openHelpDesk = (tab: 'raise' | 'my-tickets' | 'admin-dashboard' | 'faq' = 'raise', ticketId?: string) => {
    setHelpDeskTab(tab);
    if (ticketId) {
      setSelectedHelpTicketId(ticketId);
    }
    setIsHelpDeskOpen(true);
  };

  const createHelpTicket = (ticketInput: {
    subject: string;
    category: HelpTicketCategory;
    priority: HelpTicketPriority;
    description: string;
    userName?: string;
    userPhone?: string;
    userRole?: 'merchant' | 'farmer';
    shopName?: string;
    village?: string;
    attachments?: TicketAttachment[];
  }): HelpTicket => {
    const year = new Date().getFullYear();
    const existingNumbers = helpTickets
      .map((t) => {
        const match = t.ticketNumber.match(/TICKET-\d+-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextSeq = (existingNumbers.length > 0 ? Math.max(...existingNumbers) : helpTickets.length) + 1;
    const ticketNumber = `TICKET-${year}-${String(nextSeq).padStart(3, '0')}`;
    const id = `ticket-${Date.now()}`;
    const now = new Date().toISOString();

    const resolvedRole: 'merchant' | 'farmer' = ticketInput.userRole || (portalMode === 'farmer' ? 'farmer' : 'merchant');
    const resolvedName = ticketInput.userName || currentUserAccount?.fullName || (resolvedRole === 'merchant' ? merchantProfile.ownerName || merchantProfile.shopName : 'Kisan User');
    const resolvedPhone = ticketInput.userPhone || currentUserPhone || '9876543210';
    const resolvedShop = resolvedRole === 'merchant' ? (ticketInput.shopName || merchantProfile.shopName) : undefined;
    const resolvedVillage = resolvedRole === 'farmer' ? ticketInput.village : undefined;

    const newTicket: HelpTicket = {
      id,
      ticketNumber,
      userId: currentUserAccount?.id || (resolvedRole === 'farmer' ? `farmer-${resolvedPhone}` : merchantProfile.merchantId),
      userName: resolvedName,
      userPhone: resolvedPhone,
      userRole: resolvedRole,
      shopName: resolvedShop,
      village: resolvedVillage,
      subject: ticketInput.subject,
      category: ticketInput.category,
      priority: ticketInput.priority,
      description: ticketInput.description,
      attachments: ticketInput.attachments || [],
      status: 'Open',
      assignedTo: 'Unassigned',
      createdAt: now,
      updatedAt: now,
      responses: [],
      internalNotes: [],
    };

    const updated = [newTicket, ...helpTickets];
    saveHelpTickets(updated);
    setSelectedHelpTicketId(id);
    return newTicket;
  };

  const updateHelpTicketStatus = (ticketId: string, status: HelpTicketStatus, note?: string) => {
    const now = new Date().toISOString();
    const updated = helpTickets.map((t) => {
      if (t.id !== ticketId && t.ticketNumber !== ticketId) return t;
      const isResolved = status === 'Resolved' || status === 'Closed';
      const updatedNotes = note
        ? [
            ...(t.internalNotes || []),
            {
              id: `note-${Date.now()}`,
              staffName: currentUserAccount?.fullName || 'Support Staff',
              note,
              createdAt: now,
            },
          ]
        : t.internalNotes || [];

      return {
        ...t,
        status,
        updatedAt: now,
        resolvedAt: isResolved ? now : t.resolvedAt,
        internalNotes: updatedNotes,
      };
    });
    saveHelpTickets(updated);
  };

  const assignHelpTicket = (ticketId: string, staffName: string) => {
    const now = new Date().toISOString();
    const updated = helpTickets.map((t) => {
      if (t.id !== ticketId && t.ticketNumber !== ticketId) return t;
      return {
        ...t,
        assignedTo: staffName,
        updatedAt: now,
      };
    });
    saveHelpTickets(updated);
  };

  const addTicketResponse = (
    ticketId: string,
    message: string,
    senderRole: 'user' | 'support' | 'admin' = 'user',
    isInternal: boolean = false,
    attachments?: TicketAttachment[]
  ) => {
    const now = new Date().toISOString();
    const senderName =
      senderRole === 'user'
        ? currentUserAccount?.fullName || (portalMode === 'farmer' ? 'Kisan Bhai' : merchantProfile.ownerName || 'Merchant')
        : currentUserAccount?.fullName || 'PhoolMitra Support';

    const updated = helpTickets.map((t) => {
      if (t.id !== ticketId && t.ticketNumber !== ticketId) return t;

      if (isInternal) {
        return {
          ...t,
          updatedAt: now,
          internalNotes: [
            ...(t.internalNotes || []),
            {
              id: `note-${Date.now()}`,
              staffName: senderName,
              note: message,
              createdAt: now,
            },
          ],
        };
      }

      return {
        ...t,
        updatedAt: now,
        status: senderRole !== 'user' && t.status === 'Open' ? 'In Progress' : t.status,
        responses: [
          ...(t.responses || []),
          {
            id: `resp-${Date.now()}`,
            senderRole,
            senderName,
            message,
            timestamp: now,
            attachments,
            isInternalNote: false,
          },
        ],
      };
    });
    saveHelpTickets(updated);
  };

  const deleteHelpTicket = (ticketId: string) => {
    const updated = helpTickets.filter((t) => t.id !== ticketId && t.ticketNumber !== ticketId);
    saveHelpTickets(updated);
    if (selectedHelpTicketId === ticketId) {
      setSelectedHelpTicketId(null);
    }
  };

  // Generate PDF Modal State
  const [isGeneratePdfOpen, setIsGeneratePdfOpen] = useState<boolean>(false);
  const [activePdfLot, setActivePdfLot] = useState<SaleLot | null>(null);

  const openPdfModalForLot = (lot: SaleLot) => {
    setActivePdfLot(lot);
    setIsGeneratePdfOpen(true);
  };

  const openPdfModalForShipment = (shipment: Shipment) => {
    const varietiesSummary = shipment.items
      .map((i) => `${i.flowerVariety} (${i.quantity} ${i.unit})`)
      .join(', ');
    const totalQty = shipment.items.reduce((sum, i) => sum + i.quantity, 0) || 1;
    const totalBoxes = shipment.items.reduce((sum, i) => sum + (i.boxesCount || 0), 0);
    const primaryPackagingType = shipment.items[0]?.packagingType || 'Boxes';
    const synthesizedLot: SaleLot = {
      id: shipment.id,
      parchiNumber: shipment.shipmentNumber,
      date: shipment.date,
      time: shipment.time,
      farmerId: shipment.farmerId,
      farmerName: shipment.farmerName,
      farmerPhone: shipment.farmerPhone,
      farmerVillage: shipment.farmerVillage,
      flowerVariety: varietiesSummary,
      flowerQuality: shipment.items[0]?.flowerQuality || 'Good',
      boxesCount: totalBoxes,
      packagingType: primaryPackagingType,
      quantity: totalQty,
      unit: shipment.items[0]?.unit || 'Kgs',
      rate: Math.round(shipment.grossTotal / totalQty),
      grossTotal: shipment.grossTotal,
      commissionPercent: shipment.commissionPercent || 0,
      commissionAmount: shipment.commissionAmount || 0,
      transportCharges: shipment.transportCharge,
      ammaliCharges: shipment.hamaliCharge,
      totalOtherExpenditures: shipment.transportCharge + shipment.hamaliCharge,
      otherExpenditures: {
        transport: shipment.transportCharge,
        hamali: shipment.hamaliCharge,
        weighing: 0,
        mandiCess: 0,
        advanceDeduction: 0,
        misc: 0,
      },
      farmerNetPayable: shipment.netAmountAfterDailyCuts,
      paymentStatus: shipment.paymentStatus,
      amountPaid: shipment.amountPaid,
      balanceDue: shipment.balanceDue,
      notes: shipment.notes || 'Consignment with multi-variety flowers',
      shipmentId: shipment.id,
    };
    setActivePdfLot(synthesizedLot);
    setIsGeneratePdfOpen(true);
  };

  const openParchiSlipForShipment = (shipment: Shipment) => {
    const varietiesSummary = shipment.items
      .map((i) => `${i.flowerVariety} (${i.quantity} ${i.unit})`)
      .join(', ');
    const totalQty = shipment.items.reduce((sum, i) => sum + i.quantity, 0) || 1;
    const totalBoxes = shipment.items.reduce((sum, i) => sum + (i.boxesCount || 0), 0);
    const primaryPackagingType = shipment.items[0]?.packagingType || 'Boxes';
    const synthesizedLot: SaleLot = {
      id: shipment.id,
      parchiNumber: shipment.shipmentNumber,
      date: shipment.date,
      time: shipment.time,
      farmerId: shipment.farmerId,
      farmerName: shipment.farmerName,
      farmerPhone: shipment.farmerPhone,
      farmerVillage: shipment.farmerVillage,
      flowerVariety: varietiesSummary,
      flowerQuality: shipment.items[0]?.flowerQuality || 'Good',
      boxesCount: totalBoxes,
      packagingType: primaryPackagingType,
      quantity: totalQty,
      unit: shipment.items[0]?.unit || 'Kgs',
      rate: Math.round(shipment.grossTotal / totalQty),
      grossTotal: shipment.grossTotal,
      commissionPercent: shipment.commissionPercent || 0,
      commissionAmount: shipment.commissionAmount || 0,
      transportCharges: shipment.transportCharge,
      ammaliCharges: shipment.hamaliCharge,
      totalOtherExpenditures: shipment.transportCharge + shipment.hamaliCharge,
      otherExpenditures: {
        transport: shipment.transportCharge,
        hamali: shipment.hamaliCharge,
        weighing: 0,
        mandiCess: 0,
        advanceDeduction: 0,
        misc: 0,
      },
      farmerNetPayable: shipment.netAmountAfterDailyCuts,
      paymentStatus: shipment.paymentStatus,
      amountPaid: shipment.amountPaid,
      balanceDue: shipment.balanceDue,
      notes: shipment.notes || 'Consignment with multi-variety flowers',
      shipmentId: shipment.id,
    };
    setSelectedParchiLot(synthesizedLot);
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
          apmcMarketName: acct.marketName || 'Flower Market Yard',
          merchantId: `MANDI-${cleanPhone.slice(-4)}`,
          phoneNumber: `+91 ${cleanPhone}`,
          licenseNumber: acct.licenseOrCrop || '',
          defaultCommissionRate: 4,
          defaultExpenditureRate: 6,
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
        if (Array.isArray(parsed)) {
          setFarmers(
            parsed
              .filter((f) => f && typeof f === 'object')
              .map((f, idx) => ({
                ...f,
                id: (f.id && f.id !== 'undefined') ? String(f.id).trim() : `FM-${String(idx + 1).padStart(3, '0')}`,
              }))
          );
        } else {
          setFarmers([]);
        }
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
        setLots(sanitizeLotsCommission(Array.isArray(parsed) ? parsed : []));
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

    // Load Connection Requests from global store
    const savedRequests = localStorage.getItem(GLOBAL_STORAGE_KEYS.REQUESTS);
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

    // Load Auto-Remove Parchi setting
    const savedAutoRemove = localStorage.getItem(keys.AUTO_REMOVE_PARCHI);
    setAutoRemoveParchiAfterPrintState(savedAutoRemove === 'true');

    // Load Audit Logs
    const savedAudit = localStorage.getItem(keys.AUDIT_LOGS);
    if (savedAudit) {
      try {
        const parsed = JSON.parse(savedAudit);
        setParchiAuditLogs(Array.isArray(parsed) ? parsed : []);
      } catch {
        setParchiAuditLogs([]);
      }
    } else {
      setParchiAuditLogs([]);
    }

    // Load Shipments
    const savedShipments = localStorage.getItem(keys.SHIPMENTS);
    if (savedShipments) {
      try {
        const parsed = JSON.parse(savedShipments);
        setShipments(Array.isArray(parsed) && parsed.length > 0 ? parsed : generateInitialShipments(activeSessionDate));
      } catch {
        setShipments(generateInitialShipments(activeSessionDate));
      }
    } else {
      setShipments(generateInitialShipments(activeSessionDate));
    }

    // Load Settlements
    const savedSettlements = localStorage.getItem(keys.SETTLEMENTS);
    if (savedSettlements) {
      try {
        const parsed = JSON.parse(savedSettlements);
        setSettlements(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSettlements([]);
      }
    } else {
      setSettlements([]);
    }

    // Restore User Role & Portal Mode & Commodities from account record
    const matchedAccount = registeredAccounts.find(
      (a) => a.phoneNumber.replace(/\D/g, '').slice(-10) === cleanPhone
    );
    if (matchedAccount) {
      setPortalModeState(matchedAccount.role);
      localStorage.setItem(GLOBAL_STORAGE_KEYS.PORTAL, matchedAccount.role);
      localStorage.setItem(GLOBAL_STORAGE_KEYS.ACTIVE_ROLE, matchedAccount.role);
      localStorage.setItem(GLOBAL_STORAGE_KEYS.ONBOARDING_DONE, 'true');

      if (matchedAccount.selectedCommodities && matchedAccount.selectedCommodities.length > 0) {
        setUserCommoditiesState(matchedAccount.selectedCommodities);
        try {
          localStorage.setItem('phoolmitra_user_commodities', JSON.stringify(matchedAccount.selectedCommodities));
        } catch {
          // ignore
        }
      }
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
    
    // Validate Name: cannot contain numbers
    if (/[0-9]/.test(accountData.fullName)) {
      return {
        success: false,
        error: language === 'te' ? 'పేర్లలో అంకెలు ఉండకూడదు' : 'Name cannot contain numbers',
      };
    }

    // Validate Phone: must be exactly 10 digits
    if (!/^\d{10}$/.test(cleanPhone)) {
      return {
        success: false,
        error: language === 'te' ? 'ఫోన్ నంబర్‌లో 10 అంకెలు మాత్రమే ఉండాలి' : 'Phone number must contain exactly 10 digits',
      };
    }

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
      selectedCommodities: (accountData.selectedCommodities && accountData.selectedCommodities.length > 0)
        ? accountData.selectedCommodities
        : (userCommodities.length > 0 ? userCommodities : ['flowers']),
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

  // Sync isolated data to LocalStorage (works seamlessly for logged-in and default guest sessions)
  useEffect(() => {
    const cleanPhone = currentUserPhone ? currentUserPhone.replace(/\D/g, '').slice(-10) : 'default';
    const keys = getUserStorageKeys(cleanPhone);
    localStorage.setItem(keys.MERCHANT, JSON.stringify(merchantProfile));
  }, [merchantProfile, currentUserPhone]);

  useEffect(() => {
    const cleanPhone = currentUserPhone ? currentUserPhone.replace(/\D/g, '').slice(-10) : 'default';
    const keys = getUserStorageKeys(cleanPhone);
    localStorage.setItem(keys.FARMERS, JSON.stringify(farmers));
  }, [farmers, currentUserPhone]);

  useEffect(() => {
    const cleanPhone = currentUserPhone ? currentUserPhone.replace(/\D/g, '').slice(-10) : 'default';
    const keys = getUserStorageKeys(cleanPhone);
    localStorage.setItem(keys.LOTS, JSON.stringify(lots));
  }, [lots, currentUserPhone]);

  useEffect(() => {
    const cleanPhone = currentUserPhone ? currentUserPhone.replace(/\D/g, '').slice(-10) : 'default';
    const keys = getUserStorageKeys(cleanPhone);
    localStorage.setItem(keys.PAYMENTS, JSON.stringify(payments));
  }, [payments, currentUserPhone]);

  useEffect(() => {
    localStorage.setItem(GLOBAL_STORAGE_KEYS.REQUESTS, JSON.stringify(connectionRequests));
  }, [connectionRequests]);

  useEffect(() => {
    const cleanPhone = currentUserPhone ? currentUserPhone.replace(/\D/g, '').slice(-10) : 'default';
    const keys = getUserStorageKeys(cleanPhone);
    localStorage.setItem(keys.AUDIT_LOGS, JSON.stringify(parchiAuditLogs));
  }, [parchiAuditLogs, currentUserPhone]);

  useEffect(() => {
    const cleanPhone = currentUserPhone ? currentUserPhone.replace(/\D/g, '').slice(-10) : 'default';
    const keys = getUserStorageKeys(cleanPhone);
    localStorage.setItem(keys.SHIPMENTS, JSON.stringify(shipments));
  }, [shipments, currentUserPhone]);

  useEffect(() => {
    const cleanPhone = currentUserPhone ? currentUserPhone.replace(/\D/g, '').slice(-10) : 'default';
    const keys = getUserStorageKeys(cleanPhone);
    localStorage.setItem(keys.SETTLEMENTS, JSON.stringify(settlements));
  }, [settlements, currentUserPhone]);

  // 1. Initial Cloud Data Load on Mount or Sign-in
  const isInitialCloudLoadDoneRef = React.useRef(false);

  useEffect(() => {
    let isMounted = true;
    loadDataFromCloud().then((cloudData) => {
      if (!isMounted || !cloudData) {
        isInitialCloudLoadDoneRef.current = true;
        return;
      }

      // If cloud has records, restore them into local state
      if (cloudData.profile && cloudData.profile.shopName) {
        setMerchantProfile((prev) => ({ ...prev, ...cloudData.profile }));
      }
      if (Array.isArray(cloudData.farmers) && cloudData.farmers.length > 0) {
        const cleanFarmers = cloudData.farmers
          .filter((f) => f && typeof f === 'object')
          .map((f, idx) => ({
            ...f,
            id: (f.id && f.id !== 'undefined') ? String(f.id).trim() : `FM-${String(idx + 1).padStart(3, '0')}`,
          }));
        setFarmers(cleanFarmers);
      }
      if (Array.isArray(cloudData.lots) && cloudData.lots.length > 0) {
        const cleanLots = cloudData.lots
          .filter((l) => l && typeof l === 'object')
          .map((l, idx) => ({
            ...l,
            id: (l.id && l.id !== 'undefined') ? String(l.id).trim() : `LOT-${String(idx + 1).padStart(4, '0')}`,
          }));
        setLots(sanitizeLotsCommission(cleanLots));
      }
      if (Array.isArray(cloudData.shipments) && cloudData.shipments.length > 0) {
        const cleanShipments = cloudData.shipments
          .filter((s) => s && typeof s === 'object')
          .map((s, idx) => ({
            ...s,
            id: (s.id && s.id !== 'undefined') ? String(s.id).trim() : `SHIP-${String(idx + 1).padStart(4, '0')}`,
          }));
        setShipments(cleanShipments);
      }
      if (Array.isArray(cloudData.payments) && cloudData.payments.length > 0) {
        const cleanPayments = cloudData.payments
          .filter((p) => p && typeof p === 'object')
          .map((p, idx) => ({
            ...p,
            id: (p.id && p.id !== 'undefined') ? String(p.id).trim() : `PAY-${String(idx + 1).padStart(4, '0')}`,
          }));
        setPayments(cleanPayments);
      }
      if (Array.isArray(cloudData.settlements) && cloudData.settlements.length > 0) {
        const cleanSettlements = cloudData.settlements
          .filter((s) => s && typeof s === 'object')
          .map((s, idx) => ({
            ...s,
            id: (s.id && s.id !== 'undefined') ? String(s.id).trim() : `SETTLE-${String(idx + 1).padStart(4, '0')}`,
          }));
        setSettlements(cleanSettlements);
      }
      if (Array.isArray(cloudData.helpTickets) && cloudData.helpTickets.length > 0) {
        const cleanTickets = cloudData.helpTickets
          .filter((t) => t && typeof t === 'object')
          .map((t, idx) => ({
            ...t,
            id: (t.id && t.id !== 'undefined') ? String(t.id).trim() : `TCK-${String(idx + 1).padStart(4, '0')}`,
          }));
        setHelpTickets(cleanTickets);
      }
      isInitialCloudLoadDoneRef.current = true;
    }).catch(() => {
      isInitialCloudLoadDoneRef.current = true;
    });

    return () => {
      isMounted = false;
    };
  }, [firebaseUser]);

  // 2. Automatic Debounced Sync to Firestore whenever state updates
  useEffect(() => {
    if (!isAutoSyncEnabled) return;
    if (!isInitialCloudLoadDoneRef.current) return;

    scheduleAutoSync({
      profile: merchantProfile,
      farmers,
      lots,
      shipments,
      payments,
      settlements,
      helpTickets,
    });
  }, [
    merchantProfile,
    farmers,
    lots,
    shipments,
    payments,
    settlements,
    helpTickets,
    isAutoSyncEnabled,
  ]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setPortalMode = (mode: PortalMode) => {
    setPortalModeState(mode);
  };

  const updateMerchantProfile = (profile: Partial<MerchantProfile>) => {
    setMerchantProfile((prev) => {
      const updated = { ...prev, ...profile };
      // Granular Cloud Sync
      syncMerchantProfileToCloud(updated).catch(() => {});
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
    let nextNum = farmers.length + 1;
    let newId = `FM-${String(nextNum).padStart(3, '0')}`;
    while (farmers.some((f) => f && f.id === newId)) {
      nextNum++;
      newId = `FM-${String(nextNum).padStart(3, '0')}`;
    }
    const newFarmer: Farmer = {
      ...farmerData,
      id: newId,
      createdAt: getTodayDateString(),
    };
    setFarmers((prev) => [newFarmer, ...prev]);
    // Instant Cloud Sync
    syncFarmerToCloud(newFarmer).catch(() => {});
    return newFarmer;
  };

  const updateFarmer = (id: string, updated: Partial<Farmer>) => {
    if (!id || id === 'undefined') return;
    setFarmers((prev) => {
      const nextList = prev.map((f) => {
        if (f.id === id) {
          const merged = { ...f, ...updated };
          syncFarmerToCloud(merged).catch(() => {});
          return merged;
        }
        return f;
      });
      return nextList;
    });
  };

  const deleteFarmer = (id: string) => {
    if (!id || id === 'undefined') return;
    setFarmers((prev) => prev.filter((f) => f.id !== id));
    if (activeFarmerId === id) {
      setActiveFarmerId('');
    }
    deleteFarmerFromCloud(id).catch(() => {});
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
      merchantId: merchantProfile.merchantId || `MANDI-${currentUserPhone.slice(-4)}`,
      merchantName: merchantProfile.shopName || 'Mandi Shop',
    };

    setLots((prev) => [newLot, ...prev]);
    // Instant Cloud Sync
    syncLotToCloud(newLot).catch(() => {});

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
      syncPaymentToCloud(newPayment).catch(() => {});
    }

    return newLot;
  };

  const updateSaleLot = (id: string, updated: Partial<SaleLot>) => {
    setLots((prev) => {
      const nextList = prev.map((l) => {
        if (l.id === id) {
          const merged = { ...l, ...updated };
          syncLotToCloud(merged).catch(() => {});
          return merged;
        }
        return l;
      });
      return nextList;
    });
  };

  const deleteSaleLot = (id: string) => {
    setLots((prev) => prev.filter((l) => l.id !== id));
    if (selectedParchiLot?.id === id) {
      setSelectedParchiLot(null);
    }
    deleteLotFromCloud(id).catch(() => {});
  };

  // Add Consolidated Multi-Variety Shipment (Hamali and Transport deducted ONCE)
  const addShipment = (shipmentData: Omit<Shipment, 'id' | 'shipmentNumber' | 'time'>): Shipment => {
    const dateCompact = (shipmentData.date || activeSessionDate).replace(/-/g, '');
    const nextNum = shipments.length + 1;
    const shipmentNumber = `SHP-${dateCompact}-${String(nextNum).padStart(3, '0')}`;
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const grossTotal = shipmentData.items.reduce((sum, item) => sum + (Number(item.grossTotal) || 0), 0);
    const transportCharge = Number(shipmentData.transportCharge) || 0;
    const hamaliCharge = Number(shipmentData.hamaliCharge) || 0;
    const commissionPercent = Number(shipmentData.commissionPercent) || 0;
    const commissionAmount = Number(shipmentData.commissionAmount) || (commissionPercent > 0 ? Math.round((grossTotal * commissionPercent) / 100) : 0);
    const netAmountAfterDailyCuts = Math.max(0, grossTotal - transportCharge - hamaliCharge - commissionAmount);

    const newShipment: Shipment = {
      ...shipmentData,
      id: `shp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      shipmentNumber,
      time,
      grossTotal,
      transportCharge,
      hamaliCharge,
      commissionPercent,
      commissionAmount,
      netAmountAfterDailyCuts,
      paymentStatus: shipmentData.paymentStatus || 'Unpaid',
      amountPaid: shipmentData.amountPaid || 0,
      balanceDue: netAmountAfterDailyCuts - (shipmentData.amountPaid || 0),
      merchantId: merchantProfile.merchantId || `MANDI-${currentUserPhone.slice(-4)}`,
      merchantName: merchantProfile.shopName || 'Flower Mandi',
    };

    setShipments((prev) => [newShipment, ...prev]);
    syncShipmentToCloud(newShipment).catch(() => {});

    // Synchronize lots so legacy views and audit trails stay fully functional
    newShipment.items.forEach((item, idx) => {
      const itemTransport = idx === 0 ? transportCharge : 0;
      const itemHamali = idx === 0 ? hamaliCharge : 0;
      const itemComm = commissionPercent > 0 ? Math.round((item.grossTotal * commissionPercent) / 100) : 0;
      const itemNet = Math.max(0, item.grossTotal - itemTransport - itemHamali - itemComm);

      addSaleLot({
        date: newShipment.date,
        farmerId: newShipment.farmerId,
        farmerName: newShipment.farmerName,
        farmerVillage: newShipment.farmerVillage,
        farmerPhone: newShipment.farmerPhone,
        flowerVariety: item.flowerVariety,
        quantity: item.quantity,
        unit: item.unit,
        boxesCount: item.boxesCount,
        packagingType: item.packagingType,
        flowerQuality: item.flowerQuality,
        rate: item.rate,
        grossTotal: item.grossTotal,
        commissionPercent,
        commissionAmount: itemComm,
        transportCharges: itemTransport,
        ammaliCharges: itemHamali,
        otherExpenditures: {
          transport: itemTransport,
          hamali: itemHamali,
          misc: 0,
        },
        totalOtherExpenditures: itemTransport + itemHamali,
        farmerNetPayable: itemNet,
        paymentStatus: newShipment.paymentStatus,
        amountPaid: 0,
        balanceDue: itemNet,
        merchantId: newShipment.merchantId,
        merchantName: newShipment.merchantName,
        notes: newShipment.notes,
        shipmentId: newShipment.id,
      });
    });

    return newShipment;
  };

  const updateShipment = (id: string, updated: Partial<Shipment>) => {
    setShipments((prev) => {
      const nextList = prev.map((s) => {
        if (s.id === id) {
          const merged = { ...s, ...updated };
          syncShipmentToCloud(merged).catch(() => {});
          return merged;
        }
        return s;
      });
      return nextList;
    });
  };

  const deleteShipment = (id: string) => {
    setShipments((prev) => prev.filter((s) => s.id !== id));
    setLots((prev) => prev.filter((l) => l.shipmentId !== id && l.id !== id));
    if (selectedShipment?.id === id) {
      setSelectedShipment(null);
    }
    if (selectedParchiLot?.id === id || selectedParchiLot?.shipmentId === id) {
      setSelectedParchiLot(null);
    }
    deleteShipmentFromCloud(id).catch(() => {});
  };

  const getShipmentsForDate = (date: string): Shipment[] => {
    return shipments.filter((s) => s.date === date);
  };

  // 15-Day Settlement & Period Settlement Calculation (supports Multi-Commodity filtering)
  const calculate15DaySettlement = (
    farmerId: string,
    periodStart: string,
    periodEnd: string,
    commissionPercent: number = 4,
    miscPercent: number = 2,
    commodityCategory: CommodityCategory | 'all' = 'all'
  ): FifteenDaySettlement => {
    const farmer = farmers.find((f) => f.id === farmerId);
    const farmerShipments = shipments.filter((s) => {
      if (s.farmerId !== farmerId) return false;
      if (s.date < periodStart || s.date > periodEnd) return false;
      if (commodityCategory !== 'all') {
        const hasMatchingItem = s.items.some((it) => (it.commodityCategory || s.commodityCategory || 'flowers') === commodityCategory);
        const matchesShipment = (s.commodityCategory || 'flowers') === commodityCategory;
        if (!hasMatchingItem && !matchesShipment) return false;
      }
      return true;
    });

    const totalGross = farmerShipments.reduce((sum, s) => sum + s.grossTotal, 0);
    const totalTransport = farmerShipments.reduce((sum, s) => sum + s.transportCharge, 0);
    const totalHamali = farmerShipments.reduce((sum, s) => sum + s.hamaliCharge, 0);
    const subtotalAfterCharges = Math.max(0, totalGross - totalTransport - totalHamali);
    const pendingAmountAfterDailyCuts = subtotalAfterCharges;
    const commissionAmount = Math.round((totalGross * commissionPercent) / 100);
    const miscAmount = Math.round((totalGross * miscPercent) / 100);
    const totalDeductionsCut = totalTransport + totalHamali + commissionAmount + miscAmount;
    const finalPayment = Math.max(0, totalGross - totalHamali - totalTransport - commissionAmount - miscAmount);

    const startParts = periodStart.split('-');
    const endParts = periodEnd.split('-');
    const periodLabel = `${startParts[0] || '2024'}-${startParts[1] || '09'} (${startParts[2] || '01'} to ${endParts[2] || '15'})`;

    return {
      id: `stl-${farmerId}-${periodStart}-${periodEnd}${commodityCategory !== 'all' ? `-${commodityCategory}` : ''}`,
      settlementNumber: `STL-${periodStart.replace(/-/g, '')}-${farmerId.slice(-3)}`,
      periodStart,
      periodEnd,
      periodLabel,
      farmerId,
      commodityCategory: commodityCategory !== 'all' ? commodityCategory : undefined,
      farmerName: farmer?.name || farmerShipments[0]?.farmerName || 'Farmer',
      farmerVillage: farmer?.village || farmerShipments[0]?.farmerVillage || 'Mandi Belt',
      farmerPhone: farmer?.phone || farmerShipments[0]?.farmerPhone,
      shipmentIds: farmerShipments.map((s) => s.id),
      totalShipmentsCount: farmerShipments.length,
      totalGross,
      totalTransport,
      totalHamali,
      subtotalAfterCharges,
      pendingAmountAfterDailyCuts,
      commissionPercent,
      commissionAmount,
      miscPercent,
      miscAmount,
      totalDeductionsCut,
      finalPayment,
      status: 'pending',
    };
  };

  const confirmSettlement = (
    settlement: FifteenDaySettlement,
    paymentMode: PaymentMode = 'Cash',
    paymentReference: string = ''
  ) => {
    const settledRecord: FifteenDaySettlement = {
      ...settlement,
      status: 'settled',
      settledAt: new Date().toISOString(),
      paymentMode,
      paymentReference,
    };

    setSettlements((prev) => [settledRecord, ...prev.filter((s) => s.id !== settlement.id)]);

    // Mark corresponding shipments as settled / Paid
    setShipments((prev) =>
      prev.map((s) => {
        if (settlement.shipmentIds.includes(s.id)) {
          return {
            ...s,
            isSettled: true,
            settlementId: settlement.id,
            paymentStatus: 'Paid',
            amountPaid: s.netAmountAfterDailyCuts,
            balanceDue: 0,
          };
        }
        return s;
      })
    );

    // Record Payment
    const newPayment: PaymentRecord = {
      id: `pay-stl-${Date.now()}`,
      farmerId: settlement.farmerId,
      farmerName: settlement.farmerName,
      amount: settlement.finalPayment,
      paymentMode,
      referenceNumber: paymentReference || `15-Day Settlement (${settlement.periodLabel})`,
      date: activeSessionDate,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      notes: `15-Day Final Settlement: Net ₹${settlement.pendingAmountAfterDailyCuts} - Comm ₹${settlement.commissionAmount} = ₹${settlement.finalPayment}`,
      status: 'Completed',
    };
    setPayments((prev) => [newPayment, ...prev]);
  };

  const deleteSettlement = (id: string) => {
    const target = settlements.find((s) => s.id === id);
    if (target) {
      setShipments((prev) =>
        prev.map((s) => {
          if (target.shipmentIds.includes(s.id)) {
            return {
              ...s,
              isSettled: false,
              settlementId: undefined,
              paymentStatus: 'Unpaid',
              amountPaid: 0,
              balanceDue: s.netAmountAfterDailyCuts,
            };
          }
          return s;
        })
      );
    }
    setSettlements((prev) => prev.filter((s) => s.id !== id));
  };

  // Remove Parchi after printing with permanent Audit Trail
  const removeParchiWithAudit = (
    lotId: string,
    options?: { printedAt?: string; reason?: string }
  ): ParchiAuditLog | null => {
    const targetLot = lots.find((l) => l.id === lotId) || (selectedParchiLot?.id === lotId ? selectedParchiLot : null);
    if (!targetLot) return null;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const timestampStr = `${dateFormatted} • ${timeFormatted}`;

    const auditEntry: ParchiAuditLog = {
      id: `audit-${Date.now()}-${targetLot.parchiNumber}`,
      parchiNumber: targetLot.parchiNumber,
      lotId: targetLot.id,
      farmerId: targetLot.farmerId,
      farmerName: targetLot.farmerName,
      farmerPhone: targetLot.farmerPhone,
      farmerVillage: targetLot.farmerVillage,
      flowerVariety: targetLot.flowerVariety,
      flowerQuality: targetLot.flowerQuality,
      boxesCount: targetLot.boxesCount,
      quantity: targetLot.quantity,
      unit: targetLot.unit,
      rate: targetLot.rate,
      grossTotal: targetLot.grossTotal,
      commissionAmount: targetLot.commissionAmount,
      totalOtherExpenditures: targetLot.totalOtherExpenditures,
      farmerNetPayable: targetLot.farmerNetPayable,
      paymentStatus: targetLot.paymentStatus,
      amountPaid: targetLot.amountPaid,
      balanceDue: targetLot.balanceDue,
      parchiDate: targetLot.date,
      parchiTime: targetLot.time,
      printedAt: options?.printedAt || timestampStr,
      removedAt: timestampStr,
      actionBy: merchantProfile.shopName || 'Merchant Adathiya',
      reason: options?.reason || 'Printed and removed by merchant',
      archivedLot: { ...targetLot },
    };

    // Discard from active lots and shipments so it no longer appears in pending lists or reports
    if (targetLot.shipmentId) {
      setShipments((prev) => prev.filter((s) => s.id !== targetLot.shipmentId));
      setLots((prev) => prev.filter((l) => l.shipmentId !== targetLot.shipmentId && l.id !== lotId));
    } else {
      setLots((prev) => prev.filter((l) => l.id !== lotId));
    }

    // Archive in audit trail (newest first)
    setParchiAuditLogs((prev) => [auditEntry, ...prev]);

    // If this lot was currently opened in the parchi modal, clear it
    if (selectedParchiLot?.id === lotId || selectedParchiLot?.shipmentId === targetLot.shipmentId) {
      setSelectedParchiLot(null);
    }

    return auditEntry;
  };

  const restoreParchiFromAudit = (auditId: string): boolean => {
    const auditEntry = parchiAuditLogs.find((a) => a.id === auditId);
    if (!auditEntry || !auditEntry.archivedLot) return false;

    // Check if lot already exists in active lots
    setLots((prev) => {
      const exists = prev.some(
        (l) => l.id === auditEntry.archivedLot.id || l.parchiNumber === auditEntry.parchiNumber
      );
      if (exists) return prev;
      return [auditEntry.archivedLot, ...prev];
    });

    // Remove from audit logs
    setParchiAuditLogs((prev) => prev.filter((a) => a.id !== auditId));
    return true;
  };

  const clearParchiAuditLogs = () => {
    setParchiAuditLogs([]);
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
    syncPaymentToCloud(newPayment).catch(() => {});

    // Update lot status if linked directly or settle dues across outstanding lots
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
    } else if (newPayment.farmerId) {
      // Settle outstanding lots of this farmer in order
      setLots((prev) => {
        let remainingToApply = newPayment.amount;
        return prev.map((l) => {
          if (l.farmerId === newPayment.farmerId && l.balanceDue > 0 && remainingToApply > 0) {
            const settleAmount = Math.min(remainingToApply, l.balanceDue);
            remainingToApply -= settleAmount;
            const newAmountPaid = l.amountPaid + settleAmount;
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
        });
      });
    }
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    deletePaymentFromCloud(id).catch(() => {});
  };

  const updateLotPaymentStatus = (
    lotId: string,
    paymentStatus: 'Paid' | 'Unpaid' | 'Partial',
    amountPaid?: number,
    paymentMode: PaymentRecord['paymentMode'] = 'Cash',
    paymentReference?: string,
    notes?: string
  ) => {
    let targetFarmerId = '';
    let targetFarmerName = '';
    let recordedAmount = 0;

    // 1. Update Lots
    setLots((prev) =>
      prev.map((l) => {
        if (l.id === lotId || l.shipmentId === lotId || (l.parchiNumber && l.parchiNumber === lotId)) {
          targetFarmerId = l.farmerId;
          targetFarmerName = l.farmerName;
          let newPaid = 0;
          let newStatus: 'Paid' | 'Unpaid' | 'Partial' = paymentStatus;
          if (paymentStatus === 'Paid') {
            newPaid = l.farmerNetPayable;
            newStatus = 'Paid';
          } else if (paymentStatus === 'Unpaid') {
            newPaid = 0;
            newStatus = 'Unpaid';
          } else {
            newPaid = amountPaid !== undefined ? Math.min(l.farmerNetPayable, Math.max(0, amountPaid)) : l.amountPaid;
            newStatus = newPaid >= l.farmerNetPayable ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
          }
          const newBalance = Math.max(0, l.farmerNetPayable - newPaid);
          recordedAmount = newPaid;

          return {
            ...l,
            paymentStatus: newStatus,
            amountPaid: newPaid,
            balanceDue: newBalance,
            paymentMode: newStatus === 'Unpaid' ? undefined : (paymentMode || l.paymentMode || 'Cash'),
            paymentReference: newStatus === 'Unpaid' ? undefined : (paymentReference !== undefined ? paymentReference : l.paymentReference),
            notes: notes !== undefined ? notes : l.notes,
          };
        }
        return l;
      })
    );

    // 2. Update Shipments
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === lotId || s.shipmentNumber === lotId) {
          targetFarmerId = s.farmerId;
          targetFarmerName = s.farmerName;
          let newPaid = 0;
          let newStatus: 'Paid' | 'Unpaid' | 'Partial' = paymentStatus;
          if (paymentStatus === 'Paid') {
            newPaid = s.netAmountAfterDailyCuts;
            newStatus = 'Paid';
          } else if (paymentStatus === 'Unpaid') {
            newPaid = 0;
            newStatus = 'Unpaid';
          } else {
            newPaid = amountPaid !== undefined ? Math.min(s.netAmountAfterDailyCuts, Math.max(0, amountPaid)) : s.amountPaid;
            newStatus = newPaid >= s.netAmountAfterDailyCuts ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
          }
          const newBalance = Math.max(0, s.netAmountAfterDailyCuts - newPaid);
          recordedAmount = newPaid;

          return {
            ...s,
            paymentStatus: newStatus,
            amountPaid: newPaid,
            balanceDue: newBalance,
          };
        }
        return s;
      })
    );

    // 3. Update active Parchi lot modal in real-time
    setSelectedParchiLot((curr) => {
      if (!curr) return null;
      if (curr.id === lotId || curr.shipmentId === lotId || curr.parchiNumber === lotId) {
        let newPaid = 0;
        let newStatus: 'Paid' | 'Unpaid' | 'Partial' = paymentStatus;
        if (paymentStatus === 'Paid') {
          newPaid = curr.farmerNetPayable;
          newStatus = 'Paid';
        } else if (paymentStatus === 'Unpaid') {
          newPaid = 0;
          newStatus = 'Unpaid';
        } else {
          newPaid = amountPaid !== undefined ? Math.min(curr.farmerNetPayable, Math.max(0, amountPaid)) : curr.amountPaid;
          newStatus = newPaid >= curr.farmerNetPayable ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
        }
        const newBalance = Math.max(0, curr.farmerNetPayable - newPaid);

        return {
          ...curr,
          paymentStatus: newStatus,
          amountPaid: newPaid,
          balanceDue: newBalance,
          paymentMode: newStatus === 'Unpaid' ? undefined : (paymentMode || curr.paymentMode || 'Cash'),
          paymentReference: newStatus === 'Unpaid' ? undefined : (paymentReference !== undefined ? paymentReference : curr.paymentReference),
          notes: notes !== undefined ? notes : curr.notes,
        };
      }
      return curr;
    });

    // 4. Update payments log
    if (paymentStatus !== 'Unpaid' && recordedAmount > 0) {
      const now = new Date();
      const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        farmerId: targetFarmerId,
        farmerName: targetFarmerName,
        date: activeSessionDate,
        time,
        amount: recordedAmount,
        paymentMode: paymentMode || 'Cash',
        referenceNumber: paymentReference,
        notes: notes || `Payment status changed to ${paymentStatus}`,
        lotId,
      };
      setPayments((prev) => [newPayment, ...prev]);
    }
  };

  // Connection Requests
  const acceptConnectionRequest = (requestId: string) => {
    let acceptedReq: ConnectionRequest | undefined;

    setConnectionRequests((prev) => {
      const updated = prev.map((r) => {
        if (r.id === requestId) {
          acceptedReq = { ...r, status: 'accepted' as const };
          return acceptedReq;
        }
        return r;
      });
      return updated;
    });

    // Also link farmer to merchant profile
    const req = connectionRequests.find((r) => r.id === requestId) || acceptedReq;
    if (req) {
      const cleanPhone = req.farmerPhone.replace(/\D/g, '').slice(-10);
      setFarmers((prev) => {
        const existingIdx = prev.findIndex((f) => f.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
        if (existingIdx >= 0) {
          const updated = [...prev];
          const curr = updated[existingIdx];
          const mIds = curr.connectedMerchantIds || [];
          if (!mIds.includes(req.merchantId)) {
            updated[existingIdx] = {
              ...curr,
              connectedMerchantIds: [...mIds, req.merchantId],
            };
          }
          return updated;
        } else {
          let nextNum = prev.length + 1;
          let newId = `FM-${String(nextNum).padStart(3, '0')}`;
          while (prev.some((f) => f && f.id === newId)) {
            nextNum++;
            newId = `FM-${String(nextNum).padStart(3, '0')}`;
          }
          const newFarmer: Farmer = {
            id: newId,
            name: req.farmerName || 'Farmer',
            phone: cleanPhone || '9876543210',
            village: req.farmerVillage || 'Local Mandi Belt',
            primaryCrops: ['Marigold (Banthi)'],
            connectedMerchantIds: [req.merchantId],
            createdAt: getTodayDateString(),
          };
          syncFarmerToCloud(newFarmer).catch(() => {});
          return [newFarmer, ...prev];
        }
      });
    }
  };

  const declineConnectionRequest = (requestId: string) => {
    setConnectionRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'declined' as const } : r))
    );
  };

  const sendConnectionRequest = (data: {
    senderRole: 'farmer' | 'merchant';
    farmerId?: string;
    farmerName: string;
    farmerPhone: string;
    farmerVillage?: string;
    merchantId: string;
    merchantName: string;
    merchantPhone?: string;
    merchantOwnerName?: string;
  }) => {
    const cleanFarmerPhone = data.farmerPhone.replace(/\D/g, '').slice(-10);
    const cleanMerchantPhone = data.merchantPhone ? data.merchantPhone.replace(/\D/g, '').slice(-10) : undefined;

    const newReq: ConnectionRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderRole: data.senderRole,
      farmerId: data.farmerId || `FM-${cleanFarmerPhone.slice(-4)}`,
      farmerName: data.farmerName,
      farmerPhone: cleanFarmerPhone,
      farmerVillage: data.farmerVillage || 'Mandi Grower Belt',
      merchantId: data.merchantId,
      merchantName: data.merchantName,
      merchantPhone: cleanMerchantPhone,
      merchantOwnerName: data.merchantOwnerName,
      status: 'pending',
      requestDate: getTodayDateString(),
    };

    setConnectionRequests((prev) => {
      // Don't add duplicate pending request
      const exists = prev.some(
        (r) =>
          r.farmerPhone.replace(/\D/g, '').slice(-10) === cleanFarmerPhone &&
          r.merchantId === newReq.merchantId &&
          r.status === 'pending'
      );
      if (exists) return prev;
      return [newReq, ...prev];
    });
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

  // Active Trading Session Shipments
  const todayShipments = useMemo(() => {
    return shipments.filter((s) => s.date === activeSessionDate);
  }, [shipments, activeSessionDate]);

  // Today metrics
  const todayTurnover = useMemo(() => {
    if (todayShipments.length > 0) {
      return todayShipments.reduce((acc, s) => acc + s.grossTotal, 0);
    }
    return todayLots.reduce((acc, l) => acc + l.grossTotal, 0);
  }, [todayShipments, todayLots]);

  const todayLotsCount = useMemo(() => {
    if (todayShipments.length > 0) return todayShipments.length;
    return todayLots.length;
  }, [todayShipments, todayLots]);

  const todayFarmersServed = useMemo(() => {
    if (todayShipments.length > 0) {
      const unique = new Set(todayShipments.map((s) => s.farmerId));
      return unique.size;
    }
    const unique = new Set(todayLots.map((l) => l.farmerId));
    return unique.size;
  }, [todayShipments, todayLots]);

  const todayTotalVolume = useMemo(() => {
    if (todayShipments.length > 0) {
      return todayShipments.reduce(
        (acc, s) => acc + s.items.reduce((itemSum, it) => itemSum + it.quantity, 0),
        0
      );
    }
    return todayLots.reduce((acc, l) => acc + l.quantity, 0);
  }, [todayShipments, todayLots]);

  const todayCommissionEarned = useMemo(() => {
    return todayLots.reduce((acc, l) => acc + l.commissionAmount, 0);
  }, [todayLots]);

  const todayTransportTotal = useMemo(() => {
    if (todayShipments.length > 0) {
      return todayShipments.reduce((acc, s) => acc + s.transportCharge, 0);
    }
    return todayLots.reduce((acc, l) => acc + (l.transportCharges || l.otherExpenditures?.transport || 0), 0);
  }, [todayShipments, todayLots]);

  const todayHamaliTotal = useMemo(() => {
    if (todayShipments.length > 0) {
      return todayShipments.reduce((acc, s) => acc + s.hamaliCharge, 0);
    }
    return todayLots.reduce((acc, l) => acc + (l.ammaliCharges || l.otherExpenditures?.hamali || 0), 0);
  }, [todayShipments, todayLots]);

  const todayFarmerNetTotal = useMemo(() => {
    if (todayShipments.length > 0) {
      return todayShipments.reduce((acc, s) => acc + s.netAmountAfterDailyCuts, 0);
    }
    return todayLots.reduce((acc, l) => acc + l.farmerNetPayable, 0);
  }, [todayShipments, todayLots]);

  const totalOutstandingDues = useMemo(() => {
    return lots.reduce((acc, l) => acc + l.balanceDue, 0);
  }, [lots]);

  const totalPaidToDate = useMemo(() => {
    return payments.reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  // Commodity-wise stats breakdown for Dashboard & Reports
  const commodityStats = useMemo(() => {
    const categories: (CommodityCategory | 'all')[] = ['all', 'flowers', 'grains', 'vegetables', 'fruits'];
    const result: Record<CommodityCategory | 'all', {
      grossSales: number;
      totalDeductions: number;
      netEarnings: number;
      totalVolume: number;
      count: number;
      transportTotal: number;
      hamaliTotal: number;
      commissionTotal: number;
    }> = {
      all: { grossSales: 0, totalDeductions: 0, netEarnings: 0, totalVolume: 0, count: 0, transportTotal: 0, hamaliTotal: 0, commissionTotal: 0 },
      flowers: { grossSales: 0, totalDeductions: 0, netEarnings: 0, totalVolume: 0, count: 0, transportTotal: 0, hamaliTotal: 0, commissionTotal: 0 },
      grains: { grossSales: 0, totalDeductions: 0, netEarnings: 0, totalVolume: 0, count: 0, transportTotal: 0, hamaliTotal: 0, commissionTotal: 0 },
      vegetables: { grossSales: 0, totalDeductions: 0, netEarnings: 0, totalVolume: 0, count: 0, transportTotal: 0, hamaliTotal: 0, commissionTotal: 0 },
      fruits: { grossSales: 0, totalDeductions: 0, netEarnings: 0, totalVolume: 0, count: 0, transportTotal: 0, hamaliTotal: 0, commissionTotal: 0 },
    };

    // Calculate from todayShipments (or all shipments for this date)
    todayShipments.forEach((s) => {
      const cat = s.commodityCategory || 'flowers';
      const gross = s.grossTotal;
      const deductions = s.transportCharge + s.hamaliCharge;
      const net = s.netAmountAfterDailyCuts;
      const vol = s.items.reduce((sum, it) => sum + it.quantity, 0);

      // All
      result.all.grossSales += gross;
      result.all.totalDeductions += deductions;
      result.all.netEarnings += net;
      result.all.totalVolume += vol;
      result.all.count += 1;
      result.all.transportTotal += s.transportCharge;
      result.all.hamaliTotal += s.hamaliCharge;

      // Category specific
      if (result[cat]) {
        result[cat].grossSales += gross;
        result[cat].totalDeductions += deductions;
        result[cat].netEarnings += net;
        result[cat].totalVolume += vol;
        result[cat].count += 1;
        result[cat].transportTotal += s.transportCharge;
        result[cat].hamaliTotal += s.hamaliCharge;
      }
    });

    // Commission from lots
    todayLots.forEach((l) => {
      const cat = l.commodityCategory || 'flowers';
      result.all.commissionTotal += l.commissionAmount || 0;
      if (result[cat]) {
        result[cat].commissionTotal += l.commissionAmount || 0;
      }
    });

    return result;
  }, [todayShipments, todayLots]);

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

  // Get shared lots for a specific farmer (strictly isolated: only this farmer's details, not other farmers)
  const getSharedLotsForFarmer = (farmerPhone: string, farmerName: string): SaleLot[] => {
    const cleanPhone = farmerPhone ? farmerPhone.replace(/\D/g, '').slice(-10) : '';
    const normalizedName = (farmerName || '').trim().toLowerCase();

    // 1. Lots in the active session belonging specifically to this farmer
    const matchingLots = lots.filter((l) => {
      const lotPhone = l.farmerPhone ? l.farmerPhone.replace(/\D/g, '').slice(-10) : '';
      const lotName = (l.farmerName || '').trim().toLowerCase();
      if (cleanPhone && lotPhone) {
        return lotPhone === cleanPhone;
      }
      return normalizedName && lotName === normalizedName;
    });

    // 2. Lots from connected merchants who have accepted connection with this farmer
    const acceptedRequests = connectionRequests.filter(
      (r) =>
        r.status === 'accepted' &&
        r.farmerPhone.replace(/\D/g, '').slice(-10) === cleanPhone
    );

    const externalLots: SaleLot[] = [];
    for (const req of acceptedRequests) {
      if (req.merchantPhone) {
        const mKeys = getUserStorageKeys(req.merchantPhone);
        const savedLotsStr = localStorage.getItem(mKeys.LOTS);
        if (savedLotsStr) {
          try {
            const parsedLots: SaleLot[] = JSON.parse(savedLotsStr);
            if (Array.isArray(parsedLots)) {
              // ONLY lots for this specific farmer from this merchant!
              const merchantFarmerLots = parsedLots
                .filter((l) => {
                  const lotPhone = l.farmerPhone ? l.farmerPhone.replace(/\D/g, '').slice(-10) : '';
                  const lotName = (l.farmerName || '').trim().toLowerCase();
                  if (cleanPhone && lotPhone) {
                    return lotPhone === cleanPhone;
                  }
                  return normalizedName && lotName === normalizedName;
                })
                .map((l) => ({
                  ...l,
                  merchantName: l.merchantName || req.merchantName,
                  merchantId: l.merchantId || req.merchantId,
                }));
              externalLots.push(...merchantFarmerLots);
            }
          } catch {
            // ignore
          }
        }
      }
    }

    // Merge and deduplicate by lot id
    const combined = [...matchingLots];
    for (const el of externalLots) {
      if (!combined.some((cl) => cl.id === el.id)) {
        combined.push(el);
      }
    }

    return combined;
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
      shipments,
      payments,
      settlements,
      connectionRequests,
      autoRemoveParchiAfterPrint,
      parchiAuditLogs,
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
      if (Array.isArray(parsed.farmers)) {
        setFarmers(
          parsed.farmers
            .filter((f: any) => f && typeof f === 'object')
            .map((f: any, idx: number) => ({
              ...f,
              id: (f.id && f.id !== 'undefined') ? String(f.id).trim() : `FM-${String(idx + 1).padStart(3, '0')}`,
            }))
        );
      }
      if (Array.isArray(parsed.lots)) setLots(parsed.lots);
      if (Array.isArray(parsed.shipments)) setShipments(parsed.shipments);
      if (Array.isArray(parsed.payments)) setPayments(parsed.payments);
      if (Array.isArray(parsed.settlements)) setSettlements(parsed.settlements);
      if (Array.isArray(parsed.connectionRequests)) setConnectionRequests(parsed.connectionRequests);
      if (typeof parsed.autoRemoveParchiAfterPrint === 'boolean') {
        setAutoRemoveParchiAfterPrintState(parsed.autoRemoveParchiAfterPrint);
      }
      if (Array.isArray(parsed.parchiAuditLogs)) setParchiAuditLogs(parsed.parchiAuditLogs);
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
      localStorage.removeItem(keys.AUTO_REMOVE_PARCHI);
      localStorage.removeItem(keys.AUDIT_LOGS);
    }

    setParchiAuditLogs([]);
    setAutoRemoveParchiAfterPrintState(false);

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
        deleteFarmer,
        lots,
        todayLots,
        addSaleLot,
        updateSaleLot,
        deleteSaleLot,
        shipments,
        todayShipments,
        addShipment,
        updateShipment,
        deleteShipment,
        getShipmentsForDate,
        settlements,
        calculate15DaySettlement,
        confirmSettlement,
        deleteSettlement,
        selectedShipment,
        setSelectedShipment,
        payments,
        recordPayment,
        deletePayment,
        updateLotPaymentStatus,
        connectionRequests,
        acceptConnectionRequest,
        declineConnectionRequest,
        sendConnectionRequest,
        selectedParchiLot,
        setSelectedParchiLot,
        isGeneratePdfOpen,
        setIsGeneratePdfOpen,
        activePdfLot,
        setActivePdfLot,
        openPdfModalForLot,
        openPdfModalForShipment,
        openParchiSlipForShipment,
        autoRemoveParchiAfterPrint,
        setAutoRemoveParchiAfterPrint,
        parchiAuditLogs,
        isAuditTrailOpen,
        setIsAuditTrailOpen,
        removeParchiWithAudit,
        restoreParchiFromAudit,
        clearParchiAuditLogs,
        isQRModalOpen,
        setIsQRModalOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isPortalSelectorOpen,
        setIsPortalSelectorOpen,
        isToolsModalOpen,
        setIsToolsModalOpen,
        isOwnerSignUpOpen,
        setIsOwnerSignUpOpen,
        isFarmerSignUpOpen,
        setIsFarmerSignUpOpen,
        isDateSwitcherOpen,
        setIsDateSwitcherOpen,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        isMorningRushOpen,
        setIsMorningRushOpen,
        isFarmerPhoneOpen,
        setIsFarmerPhoneOpen,
        helpTickets,
        isHelpDeskOpen,
        setIsHelpDeskOpen,
        helpDeskTab,
        setHelpDeskTab,
        selectedHelpTicketId,
        setSelectedHelpTicketId,
        openHelpDesk,
        createHelpTicket,
        updateHelpTicketStatus,
        assignHelpTicket,
        addTicketResponse,
        deleteHelpTicket,
        userCommodities,
        setUserCommodities,
        activeCommodityFilter,
        setActiveCommodityFilter,
        commodityStats,
        t,
        todayTurnover,
        todayLotsCount,
        todayFarmersServed,
        todayTotalVolume,
        todayCommissionEarned,
        todayTransportTotal,
        todayHamaliTotal,
        todayFarmerNetTotal,
        totalOutstandingDues,
        totalPaidToDate,
        getFarmerStats,
        getSharedLotsForFarmer,
        getLotsForDate,
        startNewDaySession,
        clearDateLots,
        exportBackupJSON,
        importBackupJSON,
        resetAllData,
        clearTodayLotsForTesting,
        dashboardTab,
        setDashboardTab,
        consignmentSearchQuery,
        setConsignmentSearchQuery,
        firebaseAutoSaveStatus: autoSaveStatus,
        isFirebaseAutoSyncEnabled: isAutoSyncEnabled,
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
