import React, { forwardRef } from 'react';
import { useMandi } from '../../context/MandiContext';

export interface FormCItem {
  id?: string;
  flowerVariety: string;
  flowerQuality?: string;
  quantity: number;
  unit: string;
  boxesCount?: number;
  packagingType?: string;
  rate: number;
  grossTotal: number;
}

export interface FormCInvoiceData {
  parchiNumber: string;
  date: string;
  time: string;
  farmerName: string;
  farmerVillage: string;
  farmerPhone?: string;
  farmerPhotoUrl?: string;
  items: FormCItem[];
  grossTotal: number;
  transportCharges: number;
  ammaliCharges: number;
  commissionPercent: number;
  commissionAmount: number;
  miscCommissionMode?: 'percent' | 'fixed';
  miscCommissionPercent?: number;
  miscCommissionAmount?: number;
  otherDeductions?: Array<{ name: string; amount: number }>;
  farmerNetPayable: number;
  amountPaid: number;
  balanceDue?: number;
  paymentMode?: string;
  paymentStatus: string;
  notes?: string;
}

interface FormCInvoiceCanvasProps {
  data: FormCInvoiceData;
  format?: 'a4' | 'thermal-80mm';
  merchantOverride?: {
    shopName?: string;
    shopNumber?: string;
    apmcMarketName?: string;
    ownerName?: string;
    phoneNumber?: string;
  };
}

export const FormCInvoiceCanvas = forwardRef<HTMLDivElement, FormCInvoiceCanvasProps>(
  ({ data, format = 'a4', merchantOverride }, ref) => {
    const { merchantProfile } = useMandi();

    const isThermal = format === 'thermal-80mm';

    const shopName = merchantOverride?.shopName || merchantProfile?.shopName || 'APMC Commission Agent';
    const shopNumber = merchantOverride?.shopNumber || merchantProfile?.shopNumber || 'Shop 1';
    const apmcMarketName = merchantOverride?.apmcMarketName || merchantProfile?.apmcMarketName || 'Agri APMC Market Yard';
    const ownerName = merchantOverride?.ownerName || merchantProfile?.ownerName || 'Commission Merchant';
    const phoneNumber = merchantOverride?.phoneNumber || merchantProfile?.phoneNumber || '+91 9999999999';

    return (
      <div
        ref={ref}
        id="form-c-official-invoice-canvas"
        className={`bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm mx-auto ${
          isThermal ? 'p-3 sm:p-4 max-w-md space-y-3 text-xs' : 'p-3.5 sm:p-6 md:p-8 max-w-3xl space-y-4 sm:space-y-5'
        }`}
        style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {/* 1. Top Header Pill & Letterhead */}
        <div className="text-center space-y-1 sm:space-y-1.5 pb-1 sm:pb-2">
          <div className="inline-block px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-slate-100 text-[9px] sm:text-[11px] font-bold tracking-widest text-slate-700 uppercase border border-slate-200">
            APMC MANDI SALE PARCHI • FORM C
          </div>
          
          <div className="text-[9px] sm:text-[11px] tracking-wider font-semibold text-slate-500 uppercase pt-0.5">
            APMC WHOLESALE COMMISSION AGENT
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
            {shopName}
          </h1>

          <p className="text-xs font-semibold text-slate-700">
            Shop No. {shopNumber} • {apmcMarketName}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500">
            Proprietor: <span className="font-semibold text-slate-800">{ownerName}</span> | Contact: <span className="font-semibold text-slate-800">{phoneNumber}</span>
          </p>
        </div>

        {/* Subtle Divider */}
        <div className="border-t border-slate-200" />

        {/* 2. 4-Column Metadata Box */}
        <div className="p-3 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
              PARCHI / INV NO.
            </span>
            <span className="font-mono font-black text-slate-900 text-xs sm:text-sm block">
              {data.parchiNumber || 'FC-2026-PREVIEW'}
            </span>
          </div>

          <div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
              DATE &amp; TIME
            </span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm block">
              {data.date} • {data.time || 'Morning Auction'}
            </span>
          </div>

          <div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
              FARMER
            </span>
            <span className="font-black text-slate-900 text-xs sm:text-sm block">
              {data.farmerName || 'Ramesh Patel'}
            </span>
          </div>

          <div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
              VILLAGE &amp; CONTACT
            </span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm block">
              {data.farmerVillage || 'Kadi'}
            </span>
            {data.farmerPhone && (
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-600 block">
                +91 {data.farmerPhone}
              </span>
            )}
          </div>
        </div>

        {/* 3. Items Table with Horizontal Scroll Support for Mobile */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <div className="min-w-[480px] sm:min-w-0">
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-200 py-2 sm:py-2.5 px-3 text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <div className="grid grid-cols-12 items-center">
                <div className="col-span-4">VARIETY &amp; COMMODITY</div>
                <div className="col-span-2 text-center">1. PACKAGING</div>
                <div className="col-span-2 text-center">2. QTY / WT</div>
                <div className="col-span-2 text-center">3. RATE (₹/KG)</div>
                <div className="col-span-1 text-center">4. QUALITY</div>
                <div className="col-span-1 text-right">GROSS (₹)</div>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100 bg-white">
              {data.items.map((item, idx) => {
                const quality = item.flowerQuality || 'Good';
                const packagingText =
                  item.boxesCount && item.boxesCount > 0
                    ? `${item.boxesCount} ${item.packagingType || 'Boxes'}`
                    : item.packagingType || 'Boxes';

                return (
                  <div key={idx} className="py-2.5 sm:py-3 px-3 text-xs grid grid-cols-12 items-center hover:bg-slate-50/50">
                    {/* Variety */}
                    <div className="col-span-4 font-bold text-slate-900">
                      <span className="font-mono text-slate-400 mr-1">{idx + 1}.</span>
                      <span>{item.flowerVariety}</span>
                    </div>

                    {/* 1. Packaging */}
                    <div className="col-span-2 text-center text-slate-700 font-semibold text-[11px] sm:text-xs">
                      {packagingText}
                    </div>

                    {/* 2. Quantity / Weight */}
                    <div className="col-span-2 text-center font-bold text-slate-900 font-mono text-[11px] sm:text-xs">
                      {item.quantity} {item.unit}
                    </div>

                    {/* 3. Rate */}
                    <div className="col-span-2 text-center font-bold text-slate-800 font-mono text-[11px] sm:text-xs">
                      ₹{item.rate}/{item.unit}
                    </div>

                    {/* 4. Quality Badge */}
                    <div className="col-span-1 text-center">
                      <span
                        className={`text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded font-black border uppercase inline-block ${
                          quality.toLowerCase() === 'bad'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : quality.toLowerCase() === 'average'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {quality.toUpperCase()}
                      </span>
                    </div>

                    {/* Gross Total */}
                    <div className="col-span-1 text-right font-black font-mono text-slate-900 text-xs sm:text-sm">
                      ₹{item.grossTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. TOTAL SALES AMOUNT (Card) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-slate-900">
          <div>
            <span className="block text-xs uppercase font-black tracking-wider text-slate-900">
              TOTAL SALES AMOUNT
            </span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              Gross turnover before APMC mandi charges and commission
            </span>
          </div>
          <span className="text-2xl font-black font-mono text-slate-900">
            ₹{data.grossTotal.toLocaleString('en-IN')}
          </span>
        </div>

        {/* 5. MANDI CHARGES & COMMISSION DEDUCTIONS (Card) */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              MANDI CHARGES &amp; COMMISSION DEDUCTIONS
            </span>
            <span className="text-xs font-semibold text-slate-400">
              FORM C
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span>Vehicle / Freight Charges:</span>
              <span className="font-mono font-bold text-slate-900">
                ₹{data.transportCharges.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-700">
              <span>Hamali / Loading &amp; Unloading:</span>
              <span className="font-mono font-bold text-slate-900">
                ₹{data.ammaliCharges.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Mandi Commission & Miscellaneous Charges Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5 border-t border-slate-100">
              <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-amber-50/60 border border-amber-200/80 text-slate-900 font-bold text-xs">
                <span className="text-[11px]">Mandi Commission (@ {data.commissionPercent}%):</span>
                <span className="font-mono font-black text-slate-900">
                  -₹{data.commissionAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-amber-50/60 border border-amber-200/80 text-slate-900 font-bold text-xs">
                <span className="text-[11px]">
                  Miscellaneous Charges ({data.miscCommissionMode === 'percent' ? `@ ${data.miscCommissionPercent}%` : 'Fixed'}):
                </span>
                <span className="font-mono font-black text-slate-900">
                  -₹{(data.miscCommissionAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {data.otherDeductions && data.otherDeductions.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-100">
                {data.otherDeductions.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-slate-700">
                    <span>{d.name}:</span>
                    <span className="font-mono font-bold text-slate-900">-₹{d.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. FARMER NET PAYABLE Banner (Deep Green) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0d7048] text-white flex justify-between items-center shadow-xs">
            <div>
              <span className="block text-xs font-black uppercase tracking-wider text-white">
                FARMER NET PAYABLE:
              </span>
              <span className="text-[10px] text-emerald-100 font-medium block">
                Net settlement amount payable to farmer
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              ₹{data.farmerNetPayable.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 7. Bottom Settlement & Authorization Box */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
              PAYMENT SETTLEMENT STATUS:
            </span>
            <div className="text-xs text-slate-700 space-y-1">
              <div className="flex gap-2">
                <span className="text-slate-500">Status:</span>
                <strong className="text-slate-900 uppercase font-bold">{data.paymentStatus || 'PAID'}</strong>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500">Amount Paid:</span>
                <strong className="text-slate-900 font-mono">₹{data.amountPaid.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500">Settlement Mode:</span>
                <strong className="text-slate-900">{data.paymentMode || 'Cash'}</strong>
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              AUTHORIZATION &amp; SEAL
            </span>
            <div className="border-b border-dotted border-slate-400 w-48 ml-auto my-3" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                For {shopName}
              </span>
              <span className="text-[10px] text-slate-500">
                (Authorized Signatory / Mandi Licensee)
              </span>
            </div>
          </div>
        </div>

        {/* 8. Footer */}
        <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200 space-y-0.5">
          <p className="font-bold tracking-wider text-slate-600 uppercase">
            OFFICIAL APMC MANDI SALE PARCHI • FORM C • GOVT REGULATED
          </p>
          <p className="text-[9px] text-slate-400">
            Generated via भारत MANDI Software • Valid Settlement Bill
          </p>
        </div>
      </div>
    );
  }
);

FormCInvoiceCanvas.displayName = 'FormCInvoiceCanvas';

