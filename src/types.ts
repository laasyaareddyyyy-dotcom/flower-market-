export type Language = 'en' | 'te' | 'hi';

export type PortalMode = 'merchant' | 'farmer' | 'flowchart';

export type CommodityCategory = 'flowers' | 'grains' | 'vegetables' | 'fruits';

export type MerchantTab =
  | 'dashboard'
  | 'new-sale'
  | 'farmers'
  | 'payments'
  | 'settlement'
  | 'reports';

export type FarmerTab =
  | 'parchi'
  | 'sales-reports'
  | 'khata'
  | 'search-merchants'
  | 'requests';

export type WeightUnit = 'Kgs' | 'Bags' | 'Bunches' | 'Crates' | 'Quintals' | 'Boxes' | 'Baskets';

export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';

export type PaymentMode = 'Cash' | 'PhonePe' | 'Google Pay' | 'Paytm' | 'UPI' | 'Bank Transfer';

export type QualityGrade = 'Grade A / Premium' | 'Grade B / Good' | 'Grade C / Fair' | 'Good' | 'Average' | 'Bad';

export type FlowerQuality = QualityGrade;

export interface CommodityChargeSettings {
  defaultCommissionRate: number;
  defaultHamaliRate: number;
  defaultTransportRate: number;
  defaultStorageRate?: number;
  packingCost?: number;
}

export interface Expenditures {
  transport?: number;
  hamali?: number; // coolie / loading / ammali
  kanta?: number; // weighing charges
  weighing?: number;
  mandiCess?: number; // market fee
  packingCharges?: number; // gunny bag / plastic crates / storage
  storageCharges?: number;
  advanceDeduction?: number;
  misc: number; // miscellaneous amount
  miscPercent?: number; // miscellaneous percentage
  miscNote?: string;
}

export interface SaleLot {
  id: string;
  parchiNumber: string; // e.g. PK-20260911-001
  date: string; // YYYY-MM-DD
  time: string; // HH:mm AM/PM
  commodityCategory?: CommodityCategory;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerPhone?: string;
  flowerVariety: string; // Crop variety name
  quantity: number; // No. of Kgs or primary units
  unit: WeightUnit;
  boxesCount?: number; // No. of Boxes/Bags/Crates/Baskets
  packagingCount?: number;
  flowerQuality?: QualityGrade; // Quality grade
  qualityGrade?: QualityGrade;
  rate: number; // ₹ per unit
  grossTotal: number; // quantity * rate
  commissionPercent: number; // e.g. 4%
  commissionAmount: number; // grossTotal * (commissionPercent / 100)
  ammaliCharges?: number; // Ammali / Hamali deduction
  transportCharges?: number; // Transport deduction
  storageCharges?: number;
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
  shipmentId?: string;
}

export interface ShipmentItem {
  id: string;
  commodityCategory?: CommodityCategory;
  flowerVariety: string;
  quantity: number; // e.g. 50 kg or 2 quintals
  unit: WeightUnit; // Kgs / Bags / Bunches / Crates / Quintals
  rate: number; // ₹ per unit
  grossTotal: number; // quantity * rate
  boxesCount?: number;
  packagingCount?: number;
  flowerQuality?: QualityGrade;
  qualityGrade?: QualityGrade;
}

export interface Shipment {
  id: string;
  shipmentNumber: string; // e.g. SHP-20240915-001
  date: string; // YYYY-MM-DD
  time: string; // HH:mm AM/PM
  commodityCategory?: CommodityCategory;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerPhone?: string;
  items: ShipmentItem[];
  grossTotal: number; // sum of item grossTotals (e.g. ₹4,000)
  transportCharge: number; // deducted ONCE per shipment (e.g. ₹75)
  hamaliCharge: number; // deducted ONCE per shipment (e.g. ₹50)
  storageCharge?: number;
  netAmountAfterDailyCuts: number; // grossTotal - transportCharge - hamaliCharge (e.g. ₹3,875)
  paymentStatus: PaymentStatus;
  amountPaid: number;
  balanceDue: number;
  isSettled?: boolean;
  settlementId?: string;
  notes?: string;
  merchantId?: string;
  merchantName?: string;
}

export interface FifteenDaySettlement {
  id: string;
  settlementNumber: string; // e.g. STL-202409-01
  periodStart: string; // e.g. "2024-09-01"
  periodEnd: string; // e.g. "2024-09-15"
  periodLabel: string; // e.g. "Sep 1-15, 2024"
  commodityCategory?: CommodityCategory | 'all';
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerPhone?: string;
  shipmentIds: string[];
  totalShipmentsCount: number;
  totalGross: number;
  totalTransport: number;
  totalHamali: number;
  totalStorage?: number;
  subtotalAfterCharges: number; // totalGross - totalHamali - totalTransport
  pendingAmountAfterDailyCuts: number; // e.g. ₹13,850
  commissionPercent: number; // e.g. 4%
  commissionAmount: number; // e.g. ₹554
  miscPercent?: number; // e.g. 2%
  miscAmount?: number; // e.g. ₹277
  totalDeductionsCut?: number; // totalHamali + totalTransport + commissionAmount + miscAmount
  finalPayment: number; // e.g. ₹13,019
  status: 'pending' | 'settled';
  settledAt?: string;
  paymentMode?: PaymentMode;
  paymentReference?: string;
  notes?: string;
}

export interface Farmer {
  id: string; // e.g. FM-001
  name: string;
  phone: string;
  village: string;
  primaryCrops: string[];
  commoditiesGrown?: CommodityCategory[];
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
  commodityCategory?: CommodityCategory;
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
  selectedCommodities?: CommodityCategory[];
  commoditySettings?: Partial<Record<CommodityCategory, CommodityChargeSettings>>;
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
  selectedCommodities?: CommodityCategory[];
  commoditySettings?: Partial<Record<CommodityCategory, CommodityChargeSettings>>;
  shopAddress?: string;
  shopNumber?: string;
  marketName?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface ReportFilters {
  reportType: 'daily' | 'farmer' | 'dateRange' | 'farmer-search';
  commodityCategory?: CommodityCategory | 'all';
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
  commodityCategory?: CommodityCategory | 'all';
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
  commoditiesGrown?: CommodityCategory[];
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
  commodityCategory?: CommodityCategory;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerVillage?: string;
  flowerVariety: string;
  flowerQuality?: QualityGrade;
  qualityGrade?: QualityGrade;
  boxesCount?: number;
  packagingCount?: number;
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

