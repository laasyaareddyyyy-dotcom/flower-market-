export type Language = 'en' | 'te' | 'hi';

export type PortalMode = 'merchant' | 'farmer' | 'flowchart';

export type MerchantTab = 'dashboard' | 'new-sale' | 'farmers' | 'payments' | 'reports';

export type FarmerTab = 'khata' | 'parchi' | 'sales-reports' | 'search-merchants' | 'requests';

export type WeightUnit = 'Kgs' | 'Bags' | 'Bunches' | 'Crates';

export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';

export type PaymentMode = 'Cash' | 'PhonePe' | 'Google Pay' | 'Paytm' | 'UPI' | 'Bank Transfer';

export type FlowerQuality = 'Good' | 'Average' | 'Bad';

export interface Expenditures {
  transport?: number;
  hamali?: number; // coolie / loading / ammali
  kanta?: number; // weighing charges
  mandiCess?: number; // market fee
  packingCharges?: number; // gunny bag / plastic crates
  misc: number; // miscellaneous amount
  miscPercent?: number; // miscellaneous percentage
  miscNote?: string;
}

export interface SaleLot {
  id: string;
  parchiNumber: string; // e.g. PK-20260911-001
  date: string; // YYYY-MM-DD
  time: string; // HH:mm AM/PM
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerPhone?: string;
  flowerVariety: string;
  quantity: number; // No. of Kgs
  unit: WeightUnit;
  boxesCount?: number; // No. of Boxes
  flowerQuality?: FlowerQuality; // Good / Average / Bad
  rate: number; // ₹ per unit
  grossTotal: number; // quantity * rate
  commissionPercent: number; // e.g. 10
  commissionAmount: number; // grossTotal * (commissionPercent / 100)
  ammaliCharges?: number; // Ammali deduction
  transportCharges?: number; // Transport deduction
  otherExpenditures: Expenditures;
  totalOtherExpenditures: number;
  farmerNetPayable: number; // grossTotal - commissionAmount - ammali - transport - misc
  paymentStatus: PaymentStatus;
  amountPaid: number;
  balanceDue: number; // farmerNetPayable - amountPaid
  paymentMode?: PaymentMode;
  paymentReference?: string; // UPI UTR or receipt #
  notes?: string;
  merchantId?: string;
  merchantName?: string;
}

export interface Farmer {
  id: string; // e.g. FM-001
  name: string;
  phone: string;
  village: string;
  primaryCrops: string[];
  connectedMerchantIds: string[];
  createdAt: string;
  photoUrl?: string; // photo of farmer
}

export interface PaymentRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  farmerId: string;
  farmerName: string;
  amount: number;
  paymentMode: PaymentMode;
  referenceNumber?: string;
  notes?: string;
  lotId?: string;
  parchiNumber?: string;
  status?: string;
}

export interface MerchantProfile {
  shopName: string;
  ownerName?: string; // photo and name of owner
  photoUrl?: string; // photo of owner
  shopNumber: string;
  apmcMarketName: string;
  merchantId: string;
  phoneNumber: string;
  licenseNumber: string;
  defaultCommissionRate: number;
  defaultExpenditureRate?: number;
  address: string;
}

export interface ConnectionRequest {
  id: string;
  senderRole: 'farmer' | 'merchant';
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerVillage: string;
  merchantId: string;
  merchantName: string;
  merchantPhone?: string;
  merchantOwnerName?: string;
  status: 'pending' | 'accepted' | 'declined';
  requestDate: string;
}

export interface RegisteredAccount {
  id: string;
  phoneNumber: string;
  role: 'merchant' | 'farmer';
  fullName: string;
  shopOrVillage: string;
  licenseOrCrop: string;
  shopAddress?: string;
  shopNumber?: string;
  marketName?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface ReportFilters {
  reportType: 'daily' | 'farmer' | 'dateRange' | 'farmer-search';
  singleDate: string; // for daily
  startDate: string; // for dateRange or farmer
  endDate: string; // for dateRange or farmer
  farmerId: string; // for farmer report
  searchQuery: string;
  statusFilter: 'all' | 'Paid' | 'Partial' | 'Unpaid';
}

export interface MonthlySalesSummary {
  month: string; // e.g. "2026-09"
  monthLabel: string; // e.g. "Sep 2026"
  merchantId?: string;
  merchantName?: string;
  lotsCount: number;
  totalVolume: number;
  grossTotal: number;
  commissionAmount: number;
  totalOtherExpenditures: number;
  farmerNetPayable: number;
  amountPaid: number;
  balanceDue: number;
  settlementRate: number; // percentage (0-100)
}

export interface FarmerSearchResult {
  farmerId: string;
  name: string;
  phone: string;
  village: string;
  primaryCrops: string[];
  photoUrl?: string;
  connectedMerchantIds?: string[];
  totalLotsCount?: number;
  totalTurnover?: number;
  pendingDues?: number;
}

export interface ParchiAuditLog {
  id: string;
  parchiNumber: string;
  lotId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerVillage?: string;
  flowerVariety: string;
  flowerQuality?: 'Good' | 'Average' | 'Bad';
  boxesCount?: number;
  quantity: number;
  unit: string;
  rate: number;
  grossTotal: number;
  commissionAmount: number;
  totalOtherExpenditures?: number;
  farmerNetPayable: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  amountPaid: number;
  balanceDue: number;
  parchiDate: string;
  parchiTime: string;
  printedAt: string;
  removedAt: string;
  actionBy: string;
  reason: string;
  archivedLot: SaleLot;
}

