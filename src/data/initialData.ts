import { Farmer, MerchantProfile, PaymentRecord, SaleLot, ConnectionRequest } from '../types';

export const initialMerchantProfile: MerchantProfile = {
  shopName: "",
  ownerName: "",
  photoUrl: "",
  shopNumber: "",
  apmcMarketName: "",
  merchantId: "",
  phoneNumber: "",
  licenseNumber: "",
  defaultCommissionRate: 10,
  address: ""
};

export const initialFarmers: Farmer[] = [];

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

export const generateInitialLots = (): SaleLot[] => {
  return [];
};

export const initialPayments: PaymentRecord[] = [];

export const initialConnectionRequests: ConnectionRequest[] = [];
