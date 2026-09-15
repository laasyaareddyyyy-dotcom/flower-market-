export type Language = 'en' | 'te' | 'hi';

export type PortalMode = 'merchant' | 'farmer' | 'flowchart';

export type MerchantTab = 'dashboard' | 'new-sale' | 'farmers' | 'payments' | 'reports';

export type FarmerTab = 'overview' | 'find-merchant' | 'transactions' | 'reports';

export type WeightUnit = 'Kgs' | 'Bags' | 'Bunches' | 'Crates';

export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';

export type PaymentMode = 'Cash' | 'PhonePe' | 'Google Pay' | 'Paytm' | 'UPI' | 'Bank Transfer';

export interface Expenditures {
  transport?: number;
  hamali?: number; // coolie / loading
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
  quantity: number;
  unit: WeightUnit;
  rate: number; // ₹ per unit
  grossTotal: number; // quantity * rate
  commissionPercent: number; // e.g. 10
  commissionAmount: number; // grossTotal * (commissionPercent / 100)
  otherExpenditures: Expenditures;
  totalOtherExpenditures: number;
  farmerNetPayable: number; // grossTotal - (commissionAmount + totalOtherExpenditures)
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
  reportType: 'daily' | 'farmer' | 'dateRange';
  singleDate: string; // for daily
  startDate: string; // for dateRange or farmer
  endDate: string; // for dateRange or farmer
  farmerId: string; // for farmer report
  searchQuery: string;
  statusFilter: 'all' | 'Paid' | 'Partial' | 'Unpaid';
}
