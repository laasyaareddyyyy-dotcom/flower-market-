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
