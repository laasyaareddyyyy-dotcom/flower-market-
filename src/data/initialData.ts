import {
  Farmer,
  MerchantProfile,
  PaymentRecord,
  SaleLot,
  ConnectionRequest,
  Shipment,
  FifteenDaySettlement,
  CommodityCategory,
  WeightUnit,
  QualityGrade,
  HelpTicket,
} from '../types';

export interface CommodityCategoryMeta {
  id: CommodityCategory;
  name: string;
  nameHi: string;
  nameTe: string;
  icon: string;
  color: string;
  bgLight: string;
  borderLight: string;
  badgeBg: string;
  badgeText: string;
  defaultCommissionRate: number;
  defaultHamaliRate: number;
  defaultTransportRate: number;
  defaultStorageRate: number;
  allowedUnits: WeightUnit[];
  packagingLabel: string;
  weightLabel: string;
  varieties: { id: string; en: string; hi: string; te: string; defaultRate: number; unit: WeightUnit }[];
}

export const COMMODITY_CONFIGS: Record<CommodityCategory, CommodityCategoryMeta> = {
  flowers: {
    id: 'flowers',
    name: 'Flowers',
    nameHi: 'फूल (Flowers)',
    nameTe: 'పూలు (Flowers)',
    icon: '🌸',
    color: '#D97706',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-900',
    badgeText: 'text-amber-800',
    defaultCommissionRate: 4,
    defaultHamaliRate: 50,
    defaultTransportRate: 75,
    defaultStorageRate: 20,
    allowedUnits: ['Kgs', 'Boxes', 'Bunches'],
    packagingLabel: 'Boxes',
    weightLabel: 'Kgs / Weight',
    varieties: [
      { id: 'rose', en: 'Rose (Gulab)', hi: 'गुलाब (Rose)', te: 'గులాబీ (Rose)', defaultRate: 50, unit: 'Kgs' },
      { id: 'marigold', en: 'Marigold (Genda)', hi: 'गेंदा (Marigold)', te: 'బంతి పూలు (Marigold)', defaultRate: 40, unit: 'Kgs' },
      { id: 'jasmine', en: 'Jasmine (Mogra / Malli)', hi: 'मोगरा (Jasmine)', te: 'మల్లెపూలు (Jasmine)', defaultRate: 120, unit: 'Kgs' },
      { id: 'chrysanthemum', en: 'Chrysanthemum (Sevanti)', hi: 'गुलदाउदी (Sevanti)', te: 'చామంతి (Sevanti)', defaultRate: 60, unit: 'Kgs' },
      { id: 'dutch-rose', en: 'Dutch Rose (Greenhouse)', hi: 'डच गुलाब (Dutch Rose)', te: 'డచ్ గులాబీ (Dutch Rose)', defaultRate: 90, unit: 'Bunches' },
      { id: 'tuberose', en: 'Tuberose (Sugandharaja)', hi: 'रजनीगंधा (Tuberose)', te: 'సుగంధరాజ (Tuberose)', defaultRate: 80, unit: 'Kgs' },
      { id: 'crossandra', en: 'Crossandra (Kanakambaram)', hi: 'क्रॉसेंड्रा (Kanakambaram)', te: 'కనకాంబరాలు (Crossandra)', defaultRate: 180, unit: 'Kgs' },
    ],
  },
  grains: {
    id: 'grains',
    name: 'Grains & Pulses',
    nameHi: 'अनाज व दालें (Grains)',
    nameTe: 'ధాన్యాలు & పప్పుదినుసులు (Grains)',
    icon: '🌾',
    color: '#059669',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-900',
    badgeText: 'text-emerald-800',
    defaultCommissionRate: 2.5,
    defaultHamaliRate: 40,
    defaultTransportRate: 120,
    defaultStorageRate: 30,
    allowedUnits: ['Quintals', 'Bags', 'Kgs'],
    packagingLabel: 'Bags (Bori)',
    weightLabel: 'Quintals / Kgs',
    varieties: [
      { id: 'wheat', en: 'Wheat (Sharbati / Lokwan)', hi: 'गेहूं (Wheat)', te: 'గోధుమలు (Wheat)', defaultRate: 2400, unit: 'Quintals' },
      { id: 'paddy', en: 'Paddy / Rice (Sona Masoori)', hi: 'धान / चावल (Paddy)', te: 'వరి / వడ్లు (Paddy/Rice)', defaultRate: 2200, unit: 'Quintals' },
      { id: 'maize', en: 'Maize / Corn (Makka)', hi: 'मक्का (Maize)', te: 'మొక్కజొన్న (Maize)', defaultRate: 1950, unit: 'Quintals' },
      { id: 'toor-dal', en: 'Toor Dal / Red Gram (Arhar)', hi: 'अरहर / तूर दाल (Toor Dal)', te: 'కందిపప్పు / కందులు (Toor Dal)', defaultRate: 7200, unit: 'Quintals' },
      { id: 'chana', en: 'Chana / Bengal Gram', hi: 'चना (Chana / Gram)', te: 'శనగలు (Chana)', defaultRate: 5400, unit: 'Quintals' },
      { id: 'soybean', en: 'Soybean (Yellow)', hi: 'सोयाबीन (Soybean)', te: 'సోయాబీన్ (Soybean)', defaultRate: 4600, unit: 'Quintals' },
      { id: 'moong', en: 'Moong Dal / Green Gram', hi: 'मूंग दाल (Moong Dal)', te: 'పెసలు / పెసరపప్పు (Moong)', defaultRate: 6800, unit: 'Quintals' },
    ],
  },
  vegetables: {
    id: 'vegetables',
    name: 'Vegetables',
    nameHi: 'सब्जियां (Vegetables)',
    nameTe: 'కూరగాయలు (Vegetables)',
    icon: '🥦',
    color: '#16A34A',
    bgLight: 'bg-green-50',
    borderLight: 'border-green-200',
    badgeBg: 'bg-green-100 text-green-900',
    badgeText: 'text-green-800',
    defaultCommissionRate: 5,
    defaultHamaliRate: 35,
    defaultTransportRate: 80,
    defaultStorageRate: 15,
    allowedUnits: ['Crates', 'Kgs', 'Bags'],
    packagingLabel: 'Crates',
    weightLabel: 'Kgs / Crates',
    varieties: [
      { id: 'tomato', en: 'Tomato (Hybrid / Local)', hi: 'टमाटर (Tomato)', te: 'టమాటా (Tomato)', defaultRate: 30, unit: 'Kgs' },
      { id: 'onion', en: 'Onion (Nasik / Red)', hi: 'प्याज (Onion)', te: 'ఉల్లిపాయలు (Onion)', defaultRate: 35, unit: 'Kgs' },
      { id: 'potato', en: 'Potato (Jyoti / Chipsona)', hi: 'आलू (Potato)', te: 'బంగాళాదుంపలు (Potato)', defaultRate: 25, unit: 'Kgs' },
      { id: 'green-chilli', en: 'Green Chilli (G4 / Teja)', hi: 'हरी मिर्च (Green Chilli)', te: 'పచ్చిమిర్చి (Green Chilli)', defaultRate: 60, unit: 'Kgs' },
      { id: 'brinjal', en: 'Brinjal / Eggplant', hi: 'बैंगन (Brinjal)', te: 'వంకాయ (Brinjal)', defaultRate: 28, unit: 'Kgs' },
      { id: 'cabbage', en: 'Cabbage (Green)', hi: 'पत्तागोभी (Cabbage)', te: 'క్యాబేజీ (Cabbage)', defaultRate: 18, unit: 'Kgs' },
      { id: 'cauliflower', en: 'Cauliflower', hi: 'फूलगोभी (Cauliflower)', te: 'కాలీఫ్లవర్ (Cauliflower)', defaultRate: 32, unit: 'Kgs' },
      { id: 'ginger', en: 'Ginger (Adrak)', hi: 'अदरक (Ginger)', te: 'అల్లం (Ginger)', defaultRate: 90, unit: 'Kgs' },
    ],
  },
  fruits: {
    id: 'fruits',
    name: 'Fruits',
    nameHi: 'फल (Fruits)',
    nameTe: 'పండ్లు (Fruits)',
    icon: '🍎',
    color: '#EA580C',
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-200',
    badgeBg: 'bg-orange-100 text-orange-900',
    badgeText: 'text-orange-800',
    defaultCommissionRate: 6,
    defaultHamaliRate: 45,
    defaultTransportRate: 90,
    defaultStorageRate: 25,
    allowedUnits: ['Baskets', 'Crates', 'Boxes', 'Kgs'],
    packagingLabel: 'Baskets / Boxes',
    weightLabel: 'Kgs / Baskets',
    varieties: [
      { id: 'mango', en: 'Mango (Banganapalli / Alphonso)', hi: 'आम (Mango)', te: 'మామిడి (Mango)', defaultRate: 85, unit: 'Kgs' },
      { id: 'banana', en: 'Banana (Robusta / Yelakki)', hi: 'केला (Banana)', te: 'అరటిపండ్లు (Banana)', defaultRate: 25, unit: 'Kgs' },
      { id: 'pomegranate', en: 'Pomegranate (Bhagwa Anar)', hi: 'अनार (Pomegranate)', te: 'దానిమ్మ (Pomegranate)', defaultRate: 140, unit: 'Kgs' },
      { id: 'sweet-lime', en: 'Sweet Lime / Mosambi', hi: 'मौसम्बी (Sweet Lime)', te: 'బత్తాయి (Mosambi)', defaultRate: 45, unit: 'Kgs' },
      { id: 'papaya', en: 'Papaya (Taiwan 786)', hi: 'पपीता (Papaya)', te: 'బొప్పాయి (Papaya)', defaultRate: 22, unit: 'Kgs' },
      { id: 'apple', en: 'Apple (Shimla / Kinnaur)', hi: 'सेब (Apple)', te: 'యాపిల్ (Apple)', defaultRate: 120, unit: 'Kgs' },
      { id: 'grapes', en: 'Grapes (Thompson Seedless)', hi: 'अंगूर (Grapes)', te: 'ద్రాక్ష (Grapes)', defaultRate: 80, unit: 'Kgs' },
    ],
  },
};

export const ALL_COMMODITIES: CommodityCategory[] = ['flowers', 'grains', 'vegetables', 'fruits'];

export const initialMerchantProfile: MerchantProfile = {
  shopName: "Sri Lakshmi Multi-Commodity Agri Merchants",
  ownerName: "M. Koteswara Rao",
  photoUrl: "",
  shopNumber: "Shop #14, Yard Block C",
  apmcMarketName: "Integrated APMC Agricultural Wholesale Market",
  merchantId: "MANDI-HYD-014",
  phoneNumber: "+91 98480 12345",
  licenseNumber: "APMC-AGRI-2024/098",
  defaultCommissionRate: 4,
  defaultExpenditureRate: 6,
  selectedCommodities: ['flowers', 'grains', 'vegetables', 'fruits'],
  commoditySettings: {
    flowers: { defaultCommissionRate: 4, defaultHamaliRate: 50, defaultTransportRate: 75, defaultStorageRate: 20 },
    grains: { defaultCommissionRate: 2.5, defaultHamaliRate: 40, defaultTransportRate: 120, defaultStorageRate: 30 },
    vegetables: { defaultCommissionRate: 5, defaultHamaliRate: 35, defaultTransportRate: 80, defaultStorageRate: 15 },
    fruits: { defaultCommissionRate: 6, defaultHamaliRate: 45, defaultTransportRate: 90, defaultStorageRate: 25 },
  },
  address: "Gate 2, Main Wholesale Yard, Gudimalkapur, Hyderabad"
};

export const initialFarmers: Farmer[] = [
  {
    id: "FM-001",
    name: "Farmer A (Ramesh Reddy)",
    phone: "9848011223",
    village: "Chevella",
    commoditiesGrown: ["flowers", "grains"],
    primaryCrops: ["Rose", "Marigold", "Jasmine", "Wheat (Sharbati)"],
    connectedMerchantIds: ["MANDI-HYD-014"],
    createdAt: "2024-09-01",
  },
  {
    id: "FM-002",
    name: "Farmer B (Venkat Rao)",
    phone: "9848022334",
    village: "Shabad",
    commoditiesGrown: ["vegetables", "fruits", "flowers"],
    primaryCrops: ["Tomato (Hybrid)", "Onion", "Mango", "Dutch Rose"],
    connectedMerchantIds: ["MANDI-HYD-014"],
    createdAt: "2024-09-01",
  },
  {
    id: "FM-003",
    name: "Suresh Gowda",
    phone: "9848033445",
    village: "Shadnagar",
    commoditiesGrown: ["grains", "vegetables"],
    primaryCrops: ["Paddy / Rice", "Toor Dal", "Green Chilli"],
    connectedMerchantIds: ["MANDI-HYD-014"],
    createdAt: "2024-09-02",
  },
  {
    id: "FM-004",
    name: "Lakshmamma",
    phone: "9848044556",
    village: "Vikarabad",
    commoditiesGrown: ["fruits", "flowers"],
    primaryCrops: ["Pomegranate (Bhagwa)", "Sweet Lime", "Marigold"],
    connectedMerchantIds: ["MANDI-HYD-014"],
    createdAt: "2024-09-03",
  }
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export const generateInitialShipments = (sessionDate: string = '2024-09-15'): Shipment[] => {
  const dateToUse = sessionDate || '2024-09-15';

  return [
    // Farmer A: Flower Transactions
    // 1. Sep 1: Rose | 50kg | ₹2,000 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240901-01",
      shipmentNumber: "SHP-20240901-001",
      date: "2024-09-01",
      time: "06:30 AM",
      commodityCategory: "flowers",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep01-1",
          commodityCategory: "flowers",
          flowerVariety: "Rose",
          quantity: 50,
          unit: "Kgs",
          rate: 40,
          grossTotal: 2000,
          boxesCount: 2,
          flowerQuality: "Grade A / Premium",
        },
      ],
      grossTotal: 2000,
      transportCharge: 75,
      hamaliCharge: 50,
      netAmountAfterDailyCuts: 1875,
      paymentStatus: "Unpaid",
      amountPaid: 0,
      balanceDue: 1875,
      merchantId: "MANDI-HYD-014",
      merchantName: "Sri Lakshmi Multi-Commodity Agri Merchants",
      notes: "Fresh morning cut roses",
    },
    // 2. Sep 2: Rose + Marigold | 80kg | ₹3,200 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240902-01",
      shipmentNumber: "SHP-20240902-001",
      date: "2024-09-02",
      time: "06:45 AM",
      commodityCategory: "flowers",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep02-1",
          commodityCategory: "flowers",
          flowerVariety: "Rose",
          quantity: 40,
          unit: "Kgs",
          rate: 40,
          grossTotal: 1600,
          boxesCount: 2,
          flowerQuality: "Grade A / Premium",
        },
        {
          id: "item-sep02-2",
          commodityCategory: "flowers",
          flowerVariety: "Marigold",
          quantity: 40,
          unit: "Kgs",
          rate: 40,
          grossTotal: 1600,
          boxesCount: 2,
          flowerQuality: "Grade B / Good",
        },
      ],
      grossTotal: 3200,
      transportCharge: 75,
      hamaliCharge: 50,
      netAmountAfterDailyCuts: 3075,
      paymentStatus: "Unpaid",
      amountPaid: 0,
      balanceDue: 3075,
      merchantId: "MANDI-HYD-014",
      merchantName: "Sri Lakshmi Multi-Commodity Agri Merchants",
      notes: "Mixed flower arrival",
    },
    // 3. Sep 5: Jasmine | 30kg | ₹1,500 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240905-01",
      shipmentNumber: "SHP-20240905-001",
      date: "2024-09-05",
      time: "06:15 AM",
      commodityCategory: "flowers",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep05-1",
          commodityCategory: "flowers",
          flowerVariety: "Jasmine",
          quantity: 30,
          unit: "Kgs",
          rate: 50,
          grossTotal: 1500,
          boxesCount: 1,
          flowerQuality: "Grade A / Premium",
        },
      ],
      grossTotal: 1500,
      transportCharge: 75,
      hamaliCharge: 50,
      netAmountAfterDailyCuts: 1375,
      paymentStatus: "Unpaid",
      amountPaid: 0,
      balanceDue: 1375,
      merchantId: "MANDI-HYD-014",
      merchantName: "Sri Lakshmi Multi-Commodity Agri Merchants",
      notes: "Mogra buds in cool storage",
    },
    // 4. Sep 7: Rose + Jasmine | 60kg | ₹2,800 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240907-01",
      shipmentNumber: "SHP-20240907-001",
      date: "2024-09-07",
      time: "07:00 AM",
      commodityCategory: "flowers",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep07-1",
          commodityCategory: "flowers",
          flowerVariety: "Rose",
          quantity: 40,
          unit: "Kgs",
          rate: 50,
          grossTotal: 2000,
          boxesCount: 2,
          flowerQuality: "Grade A / Premium",
        },
        {
          id: "item-sep07-2",
          commodityCategory: "flowers",
          flowerVariety: "Jasmine",
          quantity: 20,
          unit: "Kgs",
          rate: 40,
          grossTotal: 800,
          boxesCount: 1,
          flowerQuality: "Grade B / Good",
        },
      ],
      grossTotal: 2800,
      transportCharge: 75,
      hamaliCharge: 50,
      netAmountAfterDailyCuts: 2675,
      paymentStatus: "Unpaid",
      amountPaid: 0,
      balanceDue: 2675,
      merchantId: "MANDI-HYD-014",
      merchantName: "Sri Lakshmi Multi-Commodity Agri Merchants",
      notes: "Morning auction consignment",
    },
    // 5. Sep 10: Marigold | 40kg | ₹1,600 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240910-01",
      shipmentNumber: "SHP-20240910-001",
      date: "2024-09-10",
      time: "06:40 AM",
      commodityCategory: "flowers",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep10-1",
          commodityCategory: "flowers",
          flowerVariety: "Marigold",
          quantity: 40,
          unit: "Kgs",
          rate: 40,
          grossTotal: 1600,
          boxesCount: 2,
          flowerQuality: "Grade A / Premium",
        },
      ],
      grossTotal: 1600,
      transportCharge: 75,
      hamaliCharge: 50,
      netAmountAfterDailyCuts: 1475,
      paymentStatus: "Unpaid",
      amountPaid: 0,
      balanceDue: 1475,
      merchantId: "MANDI-HYD-014",
      merchantName: "Sri Lakshmi Multi-Commodity Agri Merchants",
      notes: "Yellow Marigold crates",
    },
    // 6. Sep 12: Rose | 70kg | ₹3,500 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240912-01",
      shipmentNumber: "SHP-20240912-001",
      date: "2024-09-12",
      time: "06:30 AM",
      commodityCategory: "flowers",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep12-1",
          commodityCategory: "flowers",
          flowerVariety: "Rose",
          quantity: 70,
          unit: "Kgs",
          rate: 50,
          grossTotal: 3500,
          boxesCount: 3,
          flowerQuality: "Grade A / Premium",
        },
      ],
      grossTotal: 3500,
      transportCharge: 75,
      hamaliCharge: 50,
      netAmountAfterDailyCuts: 3375,
      paymentStatus: "Unpaid",
      amountPaid: 0,
      balanceDue: 3375,
      merchantId: "MANDI-HYD-014",
      merchantName: "Sri Lakshmi Multi-Commodity Agri Merchants",
      notes: "Red Rose harvest",
    },

    // 7. Grains: Farmer A (Ramesh Reddy) Grains Consignment (Wheat 20 Quintals / 20 Bags)
    {
      id: "shp-20240914-grain01",
      shipmentNumber: "SHP-20240914-GR01",
      date: "2024-09-14",
      time: "08:15 AM",
      commodityCategory: "grains",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-grain-1",
          commodityCategory: "grains",
          flowerVariety: "Wheat (Sharbati)",
          quantity: 20,
          unit: "Quintals",
          rate: 2400,
          grossTotal: 48000,
          boxesCount: 20,
          flowerQuality: "Grade A / Premium",
        },
      ],
      grossTotal: 48000,
      transportCharge: 450,
      hamaliCharge: 200,
      netAmountAfterDailyCuts: 47350,
      paymentStatus: "Unpaid",
      amountPaid: 0,
      balanceDue: 47350,
      merchantId: "MANDI-HYD-014",
      merchantName: "Sri Lakshmi Multi-Commodity Agri Merchants",
      notes: "Moisture tested 11% Sharbati Grain Bags",
    },

    // 8. Vegetables: Farmer B (Venkat Rao) Tomato & Onion (50 Crates / 1200 Kgs)
    {
      id: "shp-20240915-veg01",
      shipmentNumber: "SHP-20240915-VG01",
      date: dateToUse,
      time: "07:30 AM",
      commodityCategory: "vegetables",
      farmerId: "FM-002",
      farmerName: "Farmer B (Venkat Rao)",
      farmerVillage: "Shabad",
      farmerPhone: "9848022334",
      items: [
        {
          id: "item-veg-1",
          commodityCategory: "vegetables",
          flowerVariety: "Tomato (Hybrid)",
          quantity: 600,
          unit: "Kgs",
          rate: 30,
          grossTotal: 18000,
          boxesCount: 25,
          flowerQuality: "Grade A / Premium",
        },
        {
          id: "item-veg-2",
          commodityCategory: "vegetables",
          flowerVariety: "Onion (Nasik Red)",
          quantity: 600,
          unit: "Kgs",
          rate: 35,
          grossTotal: 21000,
          boxesCount: 25,
          flowerQuality: "Grade B / Good",
        },
      ],
      grossTotal: 39000,
      transportCharge: 250,
      hamaliCharge: 180,
      netAmountAfterDailyCuts: 38570,
      paymentStatus: "Unpaid",
      amountPaid: 0,
      balanceDue: 38570,
      merchantId: "MANDI-HYD-014",
      merchantName: "Sri Lakshmi Multi-Commodity Agri Merchants",
      notes: "50 crates sorted fresh vegetables",
    },

    // 9. Fruits: Farmer D Fruit Lots (Pomegranate & Mango)
    {
      id: "shp-20240915-fruit01",
      shipmentNumber: "SHP-20240915-FR01",
      date: dateToUse,
      time: "08:00 AM",
      commodityCategory: "fruits",
      farmerId: "FM-004",
      farmerName: "Lakshmamma",
      farmerVillage: "Vikarabad",
      farmerPhone: "9848044556",
      items: [
        {
          id: "item-fruit-1",
          commodityCategory: "fruits",
          flowerVariety: "Pomegranate (Bhagwa Anar)",
          quantity: 400,
          unit: "Kgs",
          rate: 130,
          grossTotal: 52000,
          boxesCount: 40,
          flowerQuality: "Grade A / Premium",
        },
      ],
      grossTotal: 52000,
      transportCharge: 350,
      hamaliCharge: 220,
      netAmountAfterDailyCuts: 51430,
      paymentStatus: "Unpaid",
      amountPaid: 0,
      balanceDue: 51430,
      merchantId: "MANDI-HYD-014",
      merchantName: "Sri Lakshmi Multi-Commodity Agri Merchants",
      notes: "Export grade export quality Bhagwa",
    },

    // 10. Farmer B: Flower Shipment on Sep 15
    {
      id: "shp-20240915-02",
      shipmentNumber: "SHP-20240915-002",
      date: dateToUse,
      time: "07:15 AM",
      commodityCategory: "flowers",
      farmerId: "FM-002",
      farmerName: "Farmer B (Venkat Rao)",
      farmerVillage: "Shabad",
      farmerPhone: "9848022334",
      items: [
        {
          id: "item-02-1",
          commodityCategory: "flowers",
          flowerVariety: "Rose",
          quantity: 60,
          unit: "Kgs",
          rate: 50,
          grossTotal: 3000,
          boxesCount: 3,
          flowerQuality: "Grade A / Premium",
        },
      ],
      grossTotal: 3000,
      transportCharge: 75,
      hamaliCharge: 50,
      netAmountAfterDailyCuts: 2875,
      paymentStatus: "Unpaid",
      amountPaid: 0,
      balanceDue: 2875,
      merchantId: "MANDI-HYD-014",
      merchantName: "Sri Lakshmi Multi-Commodity Agri Merchants",
      notes: "One vehicle, one trip",
    },
  ];
};

export const generateInitialLots = (): SaleLot[] => {
  const shipments = generateInitialShipments('2024-09-15');
  const lots: SaleLot[] = [];

  shipments.forEach((shp) => {
    shp.items.forEach((item, idx) => {
      const transportCharge = idx === 0 ? shp.transportCharge : 0;
      const hamaliCharge = idx === 0 ? shp.hamaliCharge : 0;
      const itemNet = Math.max(0, item.grossTotal - transportCharge - hamaliCharge);
      const cat = item.commodityCategory || shp.commodityCategory || 'flowers';
      const commRate = COMMODITY_CONFIGS[cat]?.defaultCommissionRate || 4;

      lots.push({
        id: `lot-${shp.id}-${item.id}`,
        parchiNumber: `PK-${shp.shipmentNumber.slice(-7)}-${idx + 1}`,
        date: shp.date,
        time: shp.time,
        commodityCategory: cat,
        farmerId: shp.farmerId,
        farmerName: shp.farmerName,
        farmerVillage: shp.farmerVillage,
        farmerPhone: shp.farmerPhone,
        flowerVariety: item.flowerVariety,
        quantity: item.quantity,
        unit: item.unit,
        boxesCount: item.boxesCount,
        packagingCount: item.boxesCount,
        flowerQuality: item.flowerQuality,
        qualityGrade: item.flowerQuality,
        rate: item.rate,
        grossTotal: item.grossTotal,
        commissionPercent: commRate,
        commissionAmount: Math.round(item.grossTotal * (commRate / 100)),
        transportCharges: transportCharge,
        ammaliCharges: hamaliCharge,
        otherExpenditures: {
          transport: transportCharge,
          hamali: hamaliCharge,
          misc: 0,
        },
        totalOtherExpenditures: transportCharge + hamaliCharge,
        farmerNetPayable: itemNet,
        paymentStatus: shp.paymentStatus,
        amountPaid: 0,
        balanceDue: itemNet,
        merchantId: shp.merchantId,
        merchantName: shp.merchantName,
        notes: shp.notes,
        shipmentId: shp.id,
      });
    });
  });

  return lots;
};

export const initialPayments: PaymentRecord[] = [];

export const initialConnectionRequests: ConnectionRequest[] = [];

export const SUPPORT_STAFF_MEMBERS = [
  'Unassigned',
  'Ramesh Kumar (Mandi Tech Lead)',
  'Priya Sharma (Settlement & Billing)',
  'Vikram Varma (Farmer Care & Liaison)',
  'Anand Patil (Print & Hardware Support)',
];

export interface MandiFAQ {
  id: string;
  category: string;
  question: string;
  questionTe: string;
  questionHi: string;
  answer: string;
  answerTe: string;
  answerHi: string;
  tag: string;
}

export const MANDI_FAQS: MandiFAQ[] = [
  {
    id: 'faq-1',
    category: 'Settlement & Billing',
    question: 'How is the 4% Form C Mandi Commission calculated?',
    questionTe: '4% ఫారమ్ సి మండి కమీషన్ ఎలా లెక్కించబడుతుంది?',
    questionHi: '4% फॉर्म सी मंडी कमीशन की गणना कैसे की जाती है?',
    answer: 'Commission is statutory under APMC Act. It is calculated as Gross Sales Value × 4%. For example, if a farmer brings 100 kg marigold sold at ₹40/kg = ₹4,000 gross, the 4% commission is ₹160. Hamali and Transport are deducted from gross before arriving at Net Payable.',
    answerTe: 'కమీషన్ APMC చట్టం ప్రకారం చట్టబద్ధమైనది. ఇది మొత్తం విక్రయ విలువ × 4%గా లెక్కించబడుతుంది. ఉదాహరణకు, 100 కిలోల బంతి పూలు ₹40/కిలో చొప్పున అమ్ముడైతే = ₹4,000 స్థూల విక్రయం, 4% కమీషన్ ₹160 అవుతుంది.',
    answerHi: 'कमीशन एपीएमसी अधिनियम के तहत वैधानिक है। इसकी गणना कुल बिक्री मूल्य × 4% के रूप में की जाती है। उदाहरण के लिए, यदि 100 किलो गेंदा ₹40/किलो पर बेचा जाता है = ₹4,000, तो 4% कमीशन ₹160 होगा।',
    tag: 'Commission',
  },
  {
    id: 'faq-2',
    category: '15-Day Settlement',
    question: 'How does the 15-Day Settlement Cycle work for registered farmers?',
    questionTe: 'నమోదిత రైతులకు 15 రోజుల సెటిల్‌మెంట్ సైకిల్ ఎలా పనిచేస్తుంది?',
    questionHi: 'पंजीकृत किसानों के लिए 15-दिवसीय निपटान चक्र कैसे काम करता है?',
    answer: 'PhoolMitra aggregates all arrival lots between the 1st-15th and 16th-end of every month. Merchants can generate consolidated Form C Settlement Statements, apply deductions, review advance adjustments, and issue instant payouts via Cash, UPI, or Bank NEFT with automated PDF receipts.',
    answerTe: 'ప్రతి నెల 1-15 మరియు 16-ఆఖరు తేదీల మధ్య వచ్చిన అన్ని లాట్లను పూలమిత్ర సమగ్రపరుస్తుంది. వ్యాపారులు 15 రోజుల సెటిల్‌మెంట్ స్టేట్‌మెంట్‌ను రూపొందించి UPI/నగదు/బ్యాంక్ ద్వారా చెల్లించవచ్చు.',
    answerHi: 'फूलमित्र हर महीने की 1-15 और 16-अंतिम तारीख के बीच सभी लॉट को जोड़ता है। व्यापारी समेकित फॉर्म सी निपटान विवरण बना सकते हैं और नकद/यूपीआई/बैंक के माध्यम से भुगतान कर सकते हैं।',
    tag: 'Settlement',
  },
  {
    id: 'faq-3',
    category: 'Hardware & Printing',
    question: 'How to connect and print receipts on 80mm Bluetooth Thermal Printers?',
    questionTe: '80mm బ్లూటూత్ థర్మల్ ప్రింటర్లలో రసీదులను ఎలా ప్రింట్ చేయాలి?',
    questionHi: '80 मिमी ब्लूटूथ थर्मल प्रिंटर पर रसीदें कैसे प्रिंट करें?',
    answer: 'Connect your ESC/POS thermal printer via Bluetooth or USB. When clicking "Print Parchi" or "Download PDF", select the "Thermal (80mm)" format option. The output is pre-formatted to 72mm printable width with clear Devanagari & Telugu font rendering.',
    answerTe: 'బ్లూటూత్ లేదా USB ద్వారా మీ థర్మల్ ప్రింటర్‌ను కనెక్ట్ చేయండి. "ప్రింట్ పర్చి" లేదా "PDF డౌన్‌లోడ్" క్లిక్ చేసినప్పుడు "థర్మల్ (80mm)" ఆప్షన్‌ను ఎంచుకోండి.',
    answerHi: 'ब्लूटूथ या यूएसबी के जरिए अपने थर्मल प्रिंटर को कनेक्ट करें। "प्रिंट पर्ची" या "डाउनलोड पीडीएफ" पर क्लिक करते समय "थर्मल (80 मिमी)" प्रारूप चुनें।',
    tag: 'Printer',
  },
  {
    id: 'faq-4',
    category: 'Offline Storage',
    question: 'Will my Mandi data be safe if the internet goes down at the morning auction?',
    questionTe: 'ఉదయం వేలంలో ఇంటర్నెట్ పోయినా నా డేటా సురక్షితంగా ఉంటుందా?',
    questionHi: 'क्या सुबह की नीलामी में इंटरनेट बंद होने पर मेरा डेटा सुरक्षित रहेगा?',
    answer: 'Yes, 100%! PhoolMitra uses local browser persistence and IndexedDB caches. You can record lots, calculate rates, issue parchis, and view farmer khatas without an active internet connection. All records sync automatically once reconnected.',
    answerTe: 'అవును, ఖచ్చితంగా! పూలమిత్ర ఆఫ్‌లైన్-ఫస్ట్ టెక్నాలజీని ఉపయోగిస్తుంది. ఇంటర్నెట్ లేకపోయినా మీరు లాట్లను నమోదు చేయవచ్చు, రశీదులు ముద్రించవచ్చు మరియు ఖాతాలను చూడవచ్చు.',
    answerHi: 'हाँ, बिल्कुल! फूलमित्र ऑफ़लाइन-प्रथम तकनीक का उपयोग करता है। आप इंटरनेट के बिना भी लॉट दर्ज कर सकते हैं, पर्चियां निकाल सकते हैं और खाता देख सकते हैं।',
    tag: 'Offline',
  },
  {
    id: 'faq-5',
    category: 'Accounts & Khata',
    question: 'How do farmers track their daily sales and pending balance from home?',
    questionTe: 'రైతులు ఇంటి నుండి తమ రోజువారీ విక్రయాలు మరియు బ్యాలెన్స్‌ను ఎలా ట్రాక్ చేయవచ్చు?',
    questionHi: 'किसान घर बैठे अपनी दैनिक बिक्री और बकाया राशि कैसे ट्रैक कर सकते हैं?',
    answer: 'Farmers can switch to the "Farmer Portal", enter their registered mobile number, and instantly see live auction prices, today\'s parchi slips with QR codes, 15-day settlement histories, and download PDF statements.',
    answerTe: 'రైతులు "రైతు పోర్టల్" కు మారి తమ ఫోన్ నంబర్‌తో లాగిన్ అయి రోజువారీ అమ్మకాలు, డిజిటల్ పర్చీలు మరియు ఖాతా వివరాలను నేరుగా మొబైల్‌లో చూడవచ్చు.',
    answerHi: 'किसान "किसान पोर्टल" पर स्विच करके अपने मोबाइल नंबर के साथ लॉग इन कर सकते हैं और वास्तविक समय की बिक्री, डिजिटल पर्चियां और खाता विवरण देख सकते हैं।',
    tag: 'Farmer Portal',
  },
];

export const initialHelpTickets: HelpTicket[] = [
  {
    id: 'ticket-2026-001',
    ticketNumber: 'TICKET-2026-001',
    userId: 'farmer-f1',
    userName: 'Ramesh Kumar',
    userPhone: '9876543210',
    userRole: 'farmer',
    village: 'Shamshabad, Ranga Reddy',
    subject: 'Settlement statement Hamali deduction counted twice on Sep 12',
    category: 'Payment/Settlement Issue',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Priya Sharma (Settlement & Billing)',
    description: 'I checked my 15-day settlement statement for Sep 1-15. The gross total shows ₹48,600, but Hamali deduction of ₹150 was counted twice on the Sep 12 Rose shipment lot. Please verify the consignment register and credit back the ₹150 to my Khata.',
    attachments: [
      {
        id: 'att-1',
        name: 'Mandi_Arrival_Slip_Sep12.jpg',
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60',
        size: '1.2 MB',
        type: 'image/jpeg',
      },
    ],
    createdAt: '2026-09-17T09:30:00.000Z',
    updatedAt: '2026-09-17T14:15:00.000Z',
    responses: [
      {
        id: 'resp-1-1',
        senderRole: 'user',
        senderName: 'Ramesh Kumar',
        message: 'Namaste, attached the photo of my handwritten arrival slip from Sep 12 for cross-checking with Adathiya lot register.',
        timestamp: '2026-09-17T09:32:00.000Z',
      },
      {
        id: 'resp-1-2',
        senderRole: 'support',
        senderName: 'Priya Sharma (Settlement & Billing)',
        message: 'Namaste Ramesh Ji. We verified consignment PK-20260912-001 with Sri Venkateshwara Traders. The duplicate Hamali was logged during scale sync. We have added a ₹150 credit note to your active settlement ledger.',
        timestamp: '2026-09-17T14:15:00.000Z',
      },
    ],
    internalNotes: [
      {
        id: 'note-1-1',
        staffName: 'Priya Sharma',
        note: 'Cross-checked with terminal #1 logs. Duplicate entry confirmed. Credit adjustment scheduled in Sep 15 payout cycle.',
        createdAt: '2026-09-17T14:10:00.000Z',
      },
    ],
  },
  {
    id: 'ticket-2026-002',
    ticketNumber: 'TICKET-2026-002',
    userId: 'merchant-m1',
    userName: 'Ramesh Flower Traders (Shop #42)',
    userPhone: '9848012345',
    userRole: 'merchant',
    shopName: 'Sri Venkateshwara Flower Traders',
    subject: 'Bluetooth thermal printer (80mm) Telugu text rendering',
    category: 'Technical Issue',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Anand Patil (Print & Hardware Support)',
    description: 'When printing 80mm Form C Mandi Parchi slips via mobile Bluetooth ESC/POS printer, the Telugu farmer names and flower variety fonts were overlapping slightly. How to configure the 72mm printable width properly?',
    createdAt: '2026-09-16T11:00:00.000Z',
    updatedAt: '2026-09-16T16:45:00.000Z',
    resolvedAt: '2026-09-16T16:45:00.000Z',
    responses: [
      {
        id: 'resp-2-1',
        senderRole: 'support',
        senderName: 'Anand Patil (Print & Hardware Support)',
        message: 'Hello sir, we updated the PDF engine to use native Noto Sans Telugu with vector kerning for 80mm thermal rolls. Please select "Thermal (80mm)" format and test print.',
        timestamp: '2026-09-16T15:20:00.000Z',
      },
      {
        id: 'resp-2-2',
        senderRole: 'user',
        senderName: 'Ramesh Flower Traders',
        message: 'Tested during this morning 6 AM auction with 10 parchis. The Telugu print is razor sharp and perfectly centered now. Issue resolved!',
        timestamp: '2026-09-16T16:45:00.000Z',
      },
    ],
    internalNotes: [
      {
        id: 'note-2-1',
        staffName: 'Anand Patil',
        note: 'Resolved by updating pdfExport renderer canvas width for 72mm thermal printable bounds.',
        createdAt: '2026-09-16T16:40:00.000Z',
      },
    ],
  },
  {
    id: 'ticket-2026-003',
    ticketNumber: 'TICKET-2026-003',
    userId: 'farmer-f2',
    userName: 'Krishna Rao',
    userPhone: '9876543211',
    userRole: 'farmer',
    village: 'Chevella',
    subject: 'Request for WhatsApp daily lot summary notifications',
    category: 'Feature Request',
    priority: 'Low',
    status: 'Open',
    assignedTo: 'Vikram Varma (Farmer Care & Liaison)',
    description: 'Can we get an automated WhatsApp SMS/message alert whenever our Marigold or Jasmine boxes are sold in the morning auction, with rate per kg and net payable amount?',
    createdAt: '2026-09-18T06:15:00.000Z',
    updatedAt: '2026-09-18T06:15:00.000Z',
    responses: [],
    internalNotes: [],
  },
  {
    id: 'ticket-2026-004',
    ticketNumber: 'TICKET-2026-004',
    userId: 'merchant-m1',
    userName: 'Ramesh Flower Traders',
    userPhone: '9848012345',
    userRole: 'merchant',
    shopName: 'Sri Venkateshwara Flower Traders',
    subject: 'Request to add Gladiolus and Orchid flower varieties',
    category: 'Feature Request',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'Unassigned',
    description: 'With festive season starting next week, growers from Bangalore and Ooty are bringing exotic flowers (Gladiolus, Orchids, Carnations). Please add these to the quick rate keypad dropdown with Bunches unit.',
    createdAt: '2026-09-18T07:45:00.000Z',
    updatedAt: '2026-09-18T07:45:00.000Z',
    responses: [],
    internalNotes: [],
  },
];
