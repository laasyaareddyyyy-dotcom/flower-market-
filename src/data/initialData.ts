import { Farmer, MerchantProfile, PaymentRecord, SaleLot, ConnectionRequest, Shipment, FifteenDaySettlement } from '../types';

export const initialMerchantProfile: MerchantProfile = {
  shopName: "Sri Lakshmi Flower Merchants",
  ownerName: "M. Koteswara Rao",
  photoUrl: "",
  shopNumber: "Shop #14",
  apmcMarketName: "Gudimalkapur Flower APMC Market",
  merchantId: "MANDI-HYD-014",
  phoneNumber: "+91 98480 12345",
  licenseNumber: "APMC-FL-2024/098",
  defaultCommissionRate: 4,
  defaultExpenditureRate: 6,
  address: "Gate 2, Wholesale Yard, Gudimalkapur, Hyderabad"
};

export const initialFarmers: Farmer[] = [
  {
    id: "FM-001",
    name: "Farmer A (Ramesh Reddy)",
    phone: "9848011223",
    village: "Chevella",
    primaryCrops: ["Rose", "Marigold", "Jasmine"],
    connectedMerchantIds: ["MANDI-HYD-014"],
    createdAt: "2024-09-01",
  },
  {
    id: "FM-002",
    name: "Farmer B (Venkat Rao)",
    phone: "9848022334",
    village: "Shabad",
    primaryCrops: ["Dutch Rose", "Marigold"],
    connectedMerchantIds: ["MANDI-HYD-014"],
    createdAt: "2024-09-01",
  },
  {
    id: "FM-003",
    name: "Suresh Gowda",
    phone: "9848033445",
    village: "Shadnagar",
    primaryCrops: ["Chrysanthemum", "Jasmine"],
    connectedMerchantIds: ["MANDI-HYD-014"],
    createdAt: "2024-09-02",
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
    // Farmer A: Exact Sep 1-15 Transactions as per Settlement Report Specification
    // 1. Sep 1: Rose | 50kg | ₹2,000 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240901-01",
      shipmentNumber: "SHP-20240901-001",
      date: "2024-09-01",
      time: "06:30 AM",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep01-1",
          flowerVariety: "Rose",
          quantity: 50,
          unit: "Kgs",
          rate: 40,
          grossTotal: 2000,
          boxesCount: 2,
          flowerQuality: "Good",
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
      merchantName: "Sri Lakshmi Flower Merchants",
      notes: "Single shipment delivery - 1 Truck, 1 Hamali",
    },
    // 2. Sep 2: Rose + Marigold | 80kg | ₹3,200 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240902-01",
      shipmentNumber: "SHP-20240902-001",
      date: "2024-09-02",
      time: "06:45 AM",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep02-1",
          flowerVariety: "Rose",
          quantity: 40,
          unit: "Kgs",
          rate: 40,
          grossTotal: 1600,
          boxesCount: 2,
          flowerQuality: "Good",
        },
        {
          id: "item-sep02-2",
          flowerVariety: "Marigold",
          quantity: 40,
          unit: "Kgs",
          rate: 40,
          grossTotal: 1600,
          boxesCount: 2,
          flowerQuality: "Good",
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
      merchantName: "Sri Lakshmi Flower Merchants",
      notes: "Multi-variety consignment",
    },
    // 3. Sep 5: Jasmine | 30kg | ₹1,500 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240905-01",
      shipmentNumber: "SHP-20240905-001",
      date: "2024-09-05",
      time: "07:00 AM",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep05-1",
          flowerVariety: "Jasmine",
          quantity: 30,
          unit: "Kgs",
          rate: 50,
          grossTotal: 1500,
          boxesCount: 1,
          flowerQuality: "Good",
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
      merchantName: "Sri Lakshmi Flower Merchants",
      notes: "Fresh Jasmine arrival",
    },
    // 4. Sep 7: Rose + Jasmine | 60kg | ₹2,800 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240907-01",
      shipmentNumber: "SHP-20240907-001",
      date: "2024-09-07",
      time: "06:30 AM",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep07-1",
          flowerVariety: "Rose",
          quantity: 40,
          unit: "Kgs",
          rate: 50,
          grossTotal: 2000,
          boxesCount: 2,
          flowerQuality: "Good",
        },
        {
          id: "item-sep07-2",
          flowerVariety: "Jasmine",
          quantity: 20,
          unit: "Kgs",
          rate: 40,
          grossTotal: 800,
          boxesCount: 1,
          flowerQuality: "Good",
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
      merchantName: "Sri Lakshmi Flower Merchants",
      notes: "Mixed floral lot",
    },
    // 5. Sep 10: Marigold | 40kg | ₹1,600 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240910-01",
      shipmentNumber: "SHP-20240910-001",
      date: "2024-09-10",
      time: "06:45 AM",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep10-1",
          flowerVariety: "Marigold",
          quantity: 40,
          unit: "Kgs",
          rate: 40,
          grossTotal: 1600,
          boxesCount: 2,
          flowerQuality: "Good",
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
      merchantName: "Sri Lakshmi Flower Merchants",
      notes: "Yellow Marigold crates",
    },
    // 6. Sep 12: Rose | 70kg | ₹3,500 | Hamali: ₹50 | Transport: ₹75
    {
      id: "shp-20240912-01",
      shipmentNumber: "SHP-20240912-001",
      date: "2024-09-12",
      time: "06:30 AM",
      farmerId: "FM-001",
      farmerName: "Farmer A (Ramesh Reddy)",
      farmerVillage: "Chevella",
      farmerPhone: "9848011223",
      items: [
        {
          id: "item-sep12-1",
          flowerVariety: "Rose",
          quantity: 70,
          unit: "Kgs",
          rate: 50,
          grossTotal: 3500,
          boxesCount: 3,
          flowerQuality: "Good",
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
      merchantName: "Sri Lakshmi Flower Merchants",
      notes: "Red Rose harvest",
    },
    // Farmer B: Shipment on Sep 15
    {
      id: "shp-20240915-02",
      shipmentNumber: "SHP-20240915-002",
      date: dateToUse,
      time: "07:15 AM",
      farmerId: "FM-002",
      farmerName: "Farmer B (Venkat Rao)",
      farmerVillage: "Shabad",
      farmerPhone: "9848022334",
      items: [
        {
          id: "item-02-1",
          flowerVariety: "Rose",
          quantity: 60,
          unit: "Kgs",
          rate: 50,
          grossTotal: 3000,
          boxesCount: 3,
          flowerQuality: "Good",
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
      merchantName: "Sri Lakshmi Flower Merchants",
      notes: "One vehicle, one trip",
    },
  ];
};

export const generateInitialLots = (): SaleLot[] => {
  // Convert initial shipments into SaleLots for backward compatibility with older components
  const shipments = generateInitialShipments('2024-09-15');
  const lots: SaleLot[] = [];

  shipments.forEach((shp) => {
    shp.items.forEach((item, idx) => {
      // First item carries the single shipment transport & hamali
      const transportCharge = idx === 0 ? shp.transportCharge : 0;
      const hamaliCharge = idx === 0 ? shp.hamaliCharge : 0;
      const itemNet = Math.max(0, item.grossTotal - transportCharge - hamaliCharge);

      lots.push({
        id: `lot-${shp.id}-${item.id}`,
        parchiNumber: `PK-${shp.shipmentNumber.slice(-7)}-${idx + 1}`,
        date: shp.date,
        time: shp.time,
        farmerId: shp.farmerId,
        farmerName: shp.farmerName,
        farmerVillage: shp.farmerVillage,
        farmerPhone: shp.farmerPhone,
        flowerVariety: item.flowerVariety,
        quantity: item.quantity,
        unit: item.unit,
        boxesCount: item.boxesCount,
        flowerQuality: item.flowerQuality,
        rate: item.rate,
        grossTotal: item.grossTotal,
        commissionPercent: 4,
        commissionAmount: Math.round(item.grossTotal * 0.04),
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

