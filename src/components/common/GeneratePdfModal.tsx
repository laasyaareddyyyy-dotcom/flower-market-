import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Copy,
  CheckCircle,
  Calculator,
  Percent,
  Receipt,
  FileText,
  Sliders,
  ShieldCheck,
  Building,
  User,
  Phone,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  CreditCard,
  Check,
  Clock,
  Package,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { SaleLot, Expenditures, ShipmentItem, WeightUnit, FlowerQuality } from '../../types';
import { exportElementToPdf, printHtmlViaIframe } from '../../utils/pdfExport';

export interface FormCItemRow {
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

interface GeneratePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot?: SaleLot | null;
  lots?: SaleLot[] | null;
  draftData?: {
    farmerName?: string;
    farmerVillage?: string;
    farmerPhone?: string;
    flowerVariety?: string;
    flowerQuality?: string;
    quantity?: number;
    unit?: string;
    boxesCount?: number;
    packagingType?: string;
    rate?: number;
    grossTotal?: number;
    transportCharges?: number;
    ammaliCharges?: number;
    date?: string;
    time?: string;
    parchiNumber?: string;
    amountPaid?: number;
    paymentMode?: string;
    paymentStatus?: string;
    notes?: string;
    items?: FormCItemRow[];
  } | null;
  onFinalize?: (calculatedLot: Partial<SaleLot>) => void;
}

interface StandardDeductionOption {
  id: string;
  name: string;
  nameTe: string;
  defaultAmount: number;
  selected: boolean;
  amount: number;
}

export const GeneratePdfModal: React.FC<GeneratePdfModalProps> = ({
  isOpen,
  onClose,
  lot,
  lots,
  draftData,
  onFinalize,
}) => {
  const { merchantProfile, updateSaleLot, t, shipments, farmers, language } = useMandi();
  const pdfPrintAreaRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string>('');
  const [pdfLayoutFormat, setPdfLayoutFormat] = useState<'a4' | 'thermal-80mm'>('a4');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Check if this lot is part of or synthesized from a multi-variety sale/shipment
  const linkedShipment = lot?.shipmentId ? shipments.find((s) => s.id === lot.shipmentId) : null;

  // Resolve ALL saved records / items
  const resolvedItems: FormCItemRow[] = useMemo(() => {
    // 1. If draftData contains item rows (e.g. from NewSaleView with multiple varieties)
    if (draftData?.items && draftData.items.length > 0) {
      return draftData.items.map((it) => ({
        id: it.id || `item-${Math.random()}`,
        flowerVariety: it.flowerVariety || 'Standard Variety',
        flowerQuality: it.flowerQuality || 'Good',
        quantity: Number(it.quantity) || 0,
        unit: it.unit || 'Kgs',
        boxesCount: it.boxesCount ? Number(it.boxesCount) : undefined,
        packagingType: it.packagingType || 'Boxes',
        rate: Number(it.rate) || 0,
        grossTotal: Number(it.grossTotal) || Math.round((Number(it.quantity) || 0) * (Number(it.rate) || 0)),
      }));
    }

    // 2. If lot is linked to a multi-variety sale/shipment
    if (linkedShipment && linkedShipment.items && linkedShipment.items.length > 0) {
      return linkedShipment.items.map((it) => ({
        id: it.id,
        flowerVariety: it.flowerVariety,
        flowerQuality: it.flowerQuality || 'Good',
        quantity: Number(it.quantity) || 0,
        unit: it.unit || 'Kgs',
        boxesCount: it.boxesCount ? Number(it.boxesCount) : undefined,
        packagingType: it.packagingType || 'Boxes',
        rate: Number(it.rate) || 0,
        grossTotal: Number(it.grossTotal) || Math.round(Number(it.quantity) * Number(it.rate)),
      }));
    }

    // 3. If an array of lots was passed (e.g., all lots for this farmer/session)
    if (lots && lots.length > 0) {
      return lots.map((l) => ({
        id: l.id,
        flowerVariety: l.flowerVariety,
        flowerQuality: l.flowerQuality || 'Good',
        quantity: Number(l.quantity) || 0,
        unit: l.unit || 'Kgs',
        boxesCount: l.boxesCount ? Number(l.boxesCount) : undefined,
        packagingType: l.packagingType || 'Boxes',
        rate: Number(l.rate) || 0,
        grossTotal: Number(l.grossTotal) || Math.round(Number(l.quantity) * Number(l.rate)),
      }));
    }

    // 4. Fallback to single lot or draftData
    const q = lot?.quantity ?? draftData?.quantity ?? 0;
    const r = lot?.rate ?? draftData?.rate ?? 0;
    const g = lot?.grossTotal ?? draftData?.grossTotal ?? Math.round(q * r);
    return [
      {
        id: lot?.id || 'item-1',
        flowerVariety: lot?.flowerVariety || draftData?.flowerVariety || 'Mixed Flowers',
        flowerQuality: lot?.flowerQuality || draftData?.flowerQuality || 'Good',
        quantity: q,
        unit: lot?.unit || draftData?.unit || 'Kgs',
        boxesCount: lot?.boxesCount ?? draftData?.boxesCount ?? undefined,
        packagingType: lot?.packagingType || draftData?.packagingType || 'Boxes',
        rate: r,
        grossTotal: g,
      },
    ];
  }, [draftData, linkedShipment, lots, lot]);

  // Derive source metadata
  const sourceFarmerName =
    lot?.farmerName ||
    draftData?.farmerName ||
    (lots && lots[0]?.farmerName) ||
    linkedShipment?.farmerName ||
    'Farmer Consignor';
  const sourceFarmerVillage =
    lot?.farmerVillage ||
    draftData?.farmerVillage ||
    (lots && lots[0]?.farmerVillage) ||
    linkedShipment?.farmerVillage ||
    'APMC Catchment';
  const sourceFarmerPhone =
    lot?.farmerPhone ||
    draftData?.farmerPhone ||
    (lots && lots[0]?.farmerPhone) ||
    linkedShipment?.farmerPhone ||
    '';
  const matchedFarmer = farmers.find(
    (f) => f.name.toLowerCase() === sourceFarmerName.toLowerCase() || (sourceFarmerPhone && f.phone === sourceFarmerPhone)
  );
  const farmerPhoto = matchedFarmer?.photoUrl;

  const sourceParchiNumber =
    lot?.parchiNumber ||
    draftData?.parchiNumber ||
    (lots && lots[0]?.parchiNumber) ||
    linkedShipment?.shipmentNumber ||
    'FC-2026-PREVIEW';
  const sourceDate =
    lot?.date ||
    draftData?.date ||
    (lots && lots[0]?.date) ||
    linkedShipment?.date ||
    new Date().toISOString().split('T')[0];
  const sourceTime =
    lot?.time ||
    draftData?.time ||
    (lots && lots[0]?.time) ||
    linkedShipment?.time ||
    'Morning Auction';

  // Aggregate item math across ALL saved records
  const totalQuantity = useMemo(() => {
    return resolvedItems.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  }, [resolvedItems]);

  const totalBoxes = useMemo(() => {
    return resolvedItems.reduce((acc, it) => acc + (Number(it.boxesCount) || 0), 0);
  }, [resolvedItems]);

  const primaryPackaging = resolvedItems[0]?.packagingType || lot?.packagingType || 'Boxes';

  const sourceGross = useMemo(() => {
    if (linkedShipment && linkedShipment.grossTotal > 0) return linkedShipment.grossTotal;
    const computedSum = resolvedItems.reduce((acc, it) => acc + (Number(it.grossTotal) || 0), 0);
    if (computedSum > 0) return computedSum;
    return lot?.grossTotal ?? draftData?.grossTotal ?? 0;
  }, [linkedShipment, resolvedItems, lot, draftData]);

  const sourceTransport = useMemo(() => {
    if (linkedShipment && linkedShipment.transportCharge !== undefined) return linkedShipment.transportCharge;
    if (draftData?.transportCharges !== undefined) return draftData.transportCharges;
    if (lots && lots.length > 0) return lots.reduce((acc, l) => acc + (l.transportCharges || 0), 0);
    return lot?.transportCharges ?? (lot?.otherExpenditures?.transport || 0);
  }, [linkedShipment, draftData, lots, lot]);

  const sourceHamali = useMemo(() => {
    if (linkedShipment && linkedShipment.hamaliCharge !== undefined) return linkedShipment.hamaliCharge;
    if (draftData?.ammaliCharges !== undefined) return draftData.ammaliCharges;
    if (lots && lots.length > 0) return lots.reduce((acc, l) => acc + (l.ammaliCharges || 0), 0);
    return lot?.ammaliCharges ?? (lot?.otherExpenditures?.hamali || 0);
  }, [linkedShipment, draftData, lots, lot]);

  // Step 3 Configuration States:
  // 1. Commission rate (%) - Default 0% or configured merchant profile
  const [commissionPercent, setCommissionPercent] = useState<number>(
    lot?.commissionPercent !== undefined
      ? lot.commissionPercent
      : linkedShipment?.commissionPercent !== undefined
      ? linkedShipment.commissionPercent
      : (merchantProfile.defaultCommissionRate ?? 0)
  );

  // 2. Deduction types and amounts
  const [deductionsList, setDeductionsList] = useState<StandardDeductionOption[]>([
    {
      id: 'mandiCess',
      name: 'APMC Mandi Tax / Cess',
      nameTe: 'మార్కెట్ ఫీజు',
      defaultAmount: 30,
      selected: false,
      amount: 30,
    },
    {
      id: 'kanta',
      name: 'Weighing / Kanta Charge',
      nameTe: 'తూకం ఖర్చు',
      defaultAmount: 40,
      selected: false,
      amount: 40,
    },
    {
      id: 'packing',
      name: 'Packing / Crate Deposit',
      nameTe: 'ప్యాకింగ్ / బాక్స్ డిపాజిట్',
      defaultAmount: 50,
      selected: false,
      amount: 50,
    },
    {
      id: 'association',
      name: 'Market Association Cess',
      nameTe: 'సంఘం రుసుము',
      defaultAmount: 20,
      selected: false,
      amount: 20,
    },
  ]);

  // Custom extra deduction
  const [customDeductionName, setCustomDeductionName] = useState('');
  const [customDeductionAmount, setCustomDeductionAmount] = useState<number | ''>('');
  const [customDeductionActive, setCustomDeductionActive] = useState(false);

  // 3. Other expenditures (Percent % or fixed ₹)
  const [otherExpendituresPercent, setOtherExpendituresPercent] = useState<number>(
    lot?.otherExpenditures?.miscPercent ?? 0
  );
  const [otherExpendituresFixed, setOtherExpendituresFixed] = useState<number | ''>(
    lot?.otherExpenditures?.misc && !lot?.otherExpenditures?.miscPercent ? lot.otherExpenditures.misc : ''
  );
  const [otherExpMode, setOtherExpMode] = useState<'percent' | 'fixed'>('fixed');
  const [otherExpNote, setOtherExpNote] = useState<string>(
    lot?.otherExpenditures?.miscNote || 'Standard Mandi charges'
  );

  // Calculations
  const calculatedCommissionAmount = useMemo(() => {
    return Math.round((sourceGross * commissionPercent) / 100);
  }, [sourceGross, commissionPercent]);

  const calculatedOtherExpAmount = useMemo(() => {
    if (otherExpMode === 'percent') {
      return Math.round((sourceGross * (otherExpendituresPercent || 0)) / 100);
    }
    return typeof otherExpendituresFixed === 'number' ? otherExpendituresFixed : 0;
  }, [sourceGross, otherExpMode, otherExpendituresPercent, otherExpendituresFixed]);

  const selectedDeductionsTotal = useMemo(() => {
    let total = deductionsList
      .filter((d) => d.selected)
      .reduce((acc, d) => acc + (d.amount || 0), 0);

    if (customDeductionActive && typeof customDeductionAmount === 'number' && customDeductionAmount > 0) {
      total += customDeductionAmount;
    }
    return total;
  }, [deductionsList, customDeductionActive, customDeductionAmount]);

  // Total deductions breakdown: Transport + Hamali + Commission + Other Exp + Selected Deductions
  const totalAllDeductions = useMemo(() => {
    return (
      sourceTransport +
      sourceHamali +
      calculatedCommissionAmount +
      calculatedOtherExpAmount +
      selectedDeductionsTotal
    );
  }, [
    sourceTransport,
    sourceHamali,
    calculatedCommissionAmount,
    calculatedOtherExpAmount,
    selectedDeductionsTotal,
  ]);

  // Final Net Amount to Farmer
  const finalFarmerNet = useMemo(() => {
    return Math.max(0, sourceGross - totalAllDeductions);
  }, [sourceGross, totalAllDeductions]);

  // Payment Settlement Options in Form C PDF
  const [customPaymentStatus, setCustomPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>(
    lot?.paymentStatus || linkedShipment?.paymentStatus || 'Paid'
  );
  const [customAmountPaid, setCustomAmountPaid] = useState<number | ''>(
    lot?.amountPaid || linkedShipment?.amountPaid || ''
  );
  const [customPaymentMode, setCustomPaymentMode] = useState<
    'Cash' | 'UPI' | 'Bank Transfer' | 'PhonePe' | 'Google Pay' | 'Paytm' | 'Online'
  >(lot?.paymentMode || 'Cash');
  const [customPaymentRef, setCustomPaymentRef] = useState<string>(lot?.paymentReference || '');

  // Effective payment calculation
  const amountPaid = useMemo(() => {
    if (customPaymentStatus === 'Unpaid') return 0;
    if (customPaymentStatus === 'Paid') return finalFarmerNet;
    if (typeof customAmountPaid === 'number') return Math.min(finalFarmerNet, Math.max(0, customAmountPaid));
    return 0;
  }, [customPaymentStatus, customAmountPaid, finalFarmerNet]);

  const balanceDue = Math.max(0, finalFarmerNet - amountPaid);
  const paymentStatus = balanceDue === 0 && amountPaid > 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Unpaid';
  const paymentMode = customPaymentMode;

  const toggleDeduction = (id: string) => {
    setDeductionsList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    );
  };

  const updateDeductionAmount = (id: string, newAmt: number) => {
    setDeductionsList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, amount: Math.max(0, newAmt) } : d))
    );
  };

  // Direct High-Resolution PDF Download Handler
  const handleDownloadPDF = async (format: 'a4' | 'thermal-80mm' = pdfLayoutFormat) => {
    if (!pdfPrintAreaRef.current) return;
    setIsGeneratingPdf(true);
    setPdfStatusMessage('Rendering high-resolution Form C PDF...');
    try {
      const cleanFarmer = sourceFarmerName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `PhoolMitra-FormC-Invoice-${sourceParchiNumber}-${cleanFarmer}.pdf`;
      const result = await exportElementToPdf(pdfPrintAreaRef.current, {
        filename,
        format,
        orientation: 'portrait',
        marginMm: format === 'thermal-80mm' ? 4 : 6,
        scale: 2,
        fitToPage: true,
        autoDownload: true,
      });

      if (result.success) {
        setPdfStatusMessage('✓ Form C PDF downloaded successfully!');
      } else {
        setPdfStatusMessage(`Failed: ${result.error || 'Could not generate PDF'}`);
      }
    } catch (err: any) {
      console.error('[PDF Download Error in GeneratePdfModal]', err);
      setPdfStatusMessage('Download error. Please check browser permissions.');
    } finally {
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfStatusMessage('');
      }, 3000);
    }
  };

  // Safe Print Handler
  const handlePrintPDF = () => {
    if (pdfPrintAreaRef.current) {
      printHtmlViaIframe(pdfPrintAreaRef.current, `Form C Invoice - ${sourceParchiNumber}`);
    } else {
      window.print();
    }
  };

  // WhatsApp Share with Complete Breakdown
  const handleShareWhatsApp = () => {
    const selectedDeds = deductionsList.filter((d) => d.selected);
    const itemsSummary = resolvedItems
      .map(
        (it) =>
          `• ${it.flowerVariety} (${it.flowerQuality || 'Good'}): ${it.quantity} ${it.unit} @ ₹${it.rate}/${it.unit} = ₹${it.grossTotal.toLocaleString('en-IN')}`
      )
      .join('\n');

    const text = `🌸 *${merchantProfile.shopName || 'Wholesale Flower Mandi'}* 🌸
*Official APMC Form C Lot & Settlement Invoice*
━━━━━━━━━━━━━━━━━━━━
📄 *Invoice No:* ${sourceParchiNumber}
📅 *Date:* ${sourceDate} (${sourceTime})
👨‍🌾 *Farmer:* ${sourceFarmerName} (${sourceFarmerVillage})
${sourceFarmerPhone ? `📱 *Phone:* ${sourceFarmerPhone}\n` : ''}
*Recorded Items (${resolvedItems.length}):*
${itemsSummary}
📦 *Total Volume:* ${totalQuantity} ${resolvedItems[0]?.unit || 'Kgs'} ${totalBoxes > 0 ? `(${totalBoxes} ${primaryPackaging})` : ''}
━━━━━━━━━━━━━━━━━━━━
💵 *TOTAL SALES AMOUNT (GROSS):* ₹${sourceGross.toLocaleString('en-IN')}

*Recorded Mandi Charges & Deductions:*
🚚 Vehicle / Freight Expense: -₹${sourceTransport.toLocaleString('en-IN')}
👷 Hamali / Loading Charges: -₹${sourceHamali.toLocaleString('en-IN')}
💼 Commission (${commissionPercent}%): -₹${calculatedCommissionAmount.toLocaleString('en-IN')}
${calculatedOtherExpAmount > 0 ? `📦 Other Expenses: -₹${calculatedOtherExpAmount.toLocaleString('en-IN')}\n` : ''}${selectedDeds.map((d) => `• ${d.name}: -₹${d.amount.toLocaleString('en-IN')}`).join('\n')}${customDeductionActive && customDeductionName ? `\n• ${customDeductionName}: -₹${customDeductionAmount}` : ''}
━━━━━━━━━━━━━━━━━━━━
✨ *FINAL NET AMOUNT TO FARMER:* ₹${finalFarmerNet.toLocaleString('en-IN')}
💳 *Payment Status:* ${paymentStatus.toUpperCase()} (Paid: ₹${amountPaid.toLocaleString('en-IN')}${balanceDue > 0 ? ` | Due: ₹${balanceDue.toLocaleString('en-IN')}` : ''})
━━━━━━━━━━━━━━━━━━━━
_Generated via PhoolMitra Wholesale Mandi System_`;

    const encoded = encodeURIComponent(text);
    const phone = sourceFarmerPhone ? sourceFarmerPhone.replace(/\D/g, '') : '';
    const phoneParam = phone ? `91${phone.slice(-10)}` : '';
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const text = `FORM C INVOICE ${sourceParchiNumber} | ${sourceFarmerName} | Items: ${resolvedItems.length} | Gross: ₹${sourceGross} | Freight: ₹${sourceTransport} | Hamali: ₹${sourceHamali} | Comm (${commissionPercent}%): ₹${calculatedCommissionAmount} | Net To Farmer: ₹${finalFarmerNet}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAndFinalize = async () => {
    const expendituresData: Expenditures = {
      transport: sourceTransport,
      hamali: sourceHamali,
      mandiCess: deductionsList.find((d) => d.id === 'mandiCess')?.selected
        ? deductionsList.find((d) => d.id === 'mandiCess')?.amount
        : 0,
      kanta: deductionsList.find((d) => d.id === 'kanta')?.selected
        ? deductionsList.find((d) => d.id === 'kanta')?.amount
        : 0,
      packingCharges: deductionsList.find((d) => d.id === 'packing')?.selected
        ? deductionsList.find((d) => d.id === 'packing')?.amount
        : 0,
      misc: calculatedOtherExpAmount,
      miscPercent: otherExpMode === 'percent' ? otherExpendituresPercent : undefined,
      miscNote: otherExpNote,
    };

    const finalPayload: Partial<SaleLot> = {
      commissionPercent,
      commissionAmount: calculatedCommissionAmount,
      ammaliCharges: sourceHamali,
      transportCharges: sourceTransport,
      otherExpenditures: expendituresData,
      totalOtherExpenditures: totalAllDeductions - calculatedCommissionAmount,
      farmerNetPayable: finalFarmerNet,
      amountPaid,
      balanceDue,
      paymentStatus,
      paymentMode,
      paymentReference: customPaymentRef.trim() || undefined,
    };

    if (lot && lot.id) {
      updateSaleLot(lot.id, finalPayload);
    }

    if (onFinalize) {
      onFinalize(finalPayload);
    }

    // Also trigger the PDF download so the user receives the file immediately
    if (pdfPrintAreaRef.current) {
      try {
        const cleanFarmer = sourceFarmerName.replace(/[^a-zA-Z0-9]/g, '_');
        await exportElementToPdf(pdfPrintAreaRef.current, {
          filename: `PhoolMitra-FormC-Invoice-${sourceParchiNumber}-${cleanFarmer}.pdf`,
          format: pdfLayoutFormat,
          orientation: 'portrait',
          marginMm: pdfLayoutFormat === 'thermal-80mm' ? 4 : 6,
          scale: 2,
          autoDownload: true,
        });
      } catch (e) {
        console.error('Auto download on finalize error', e);
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="generate-pdf-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden"
    >
      <div
        id="generate-pdf-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* FIXED HEADER */}
        <div className="no-print flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4 bg-[#1a3a52] text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] bg-white/10 px-2 py-0.5 rounded">
                  Form C Official Invoice
                </span>
                <span className="text-xs text-white/70 font-mono">
                  {sourceParchiNumber} • {resolvedItems.length} Record{resolvedItems.length > 1 ? 's' : ''}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                Generate Form C PDF &amp; Deductions
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="close-pdf-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:bg-white/20 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4 sm:p-6 space-y-6 bg-[#f8fafc]">
          {/* Step 3: Commission & Deduction Options Panel */}
          <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1a3a52]" />
                <h4 className="font-black text-xs sm:text-sm text-[#1e293b] uppercase tracking-wider">
                  Commission &amp; Deduction Settings
                </h4>
              </div>
              <span className="text-[11px] text-[#64748b]">
                {resolvedItems.length} saved record{resolvedItems.length > 1 ? 's' : ''} included
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Commission Percent Setting */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1e293b] flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-[#1a3a52]" />
                    <span>Mandi Commission</span>
                  </span>
                  <span className="font-mono font-bold text-xs text-emerald-700">
                    -₹{calculatedCommissionAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {[0, 2, 4, 5, 6].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCommissionPercent(pct)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        commissionPercent === pct
                          ? 'bg-[#1a3a52] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">Custom:</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(Math.max(0, Number(e.target.value) || 0))}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-center"
                  />
                  <span className="text-xs font-bold text-slate-700">%</span>
                </div>
              </div>

              {/* 2. Recorded Freight & Hamali */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-[#1e293b] block">
                  Recorded Freight &amp; Labor
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Vehicle / Freight:</span>
                    <strong className="font-mono text-slate-900">₹{sourceTransport.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Hamali / Loading:</span>
                    <strong className="font-mono text-slate-900">₹{sourceHamali.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200 font-bold">
                    <span>Total Direct Cuts:</span>
                    <span className="font-mono text-red-700">-₹{(sourceTransport + sourceHamali).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* 3. Additional Deductions */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-[#1e293b] block">
                  Itemized APMC Deductions
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {deductionsList.map((ded) => (
                    <label
                      key={ded.id}
                      className="flex items-center justify-between gap-2 text-xs cursor-pointer p-1 rounded hover:bg-slate-100/80"
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={ded.selected}
                          onChange={() => toggleDeduction(ded.id)}
                          className="w-3.5 h-3.5 rounded text-[#1a3a52] focus:ring-[#1a3a52]"
                        />
                        <span className="text-slate-700">{ded.name}</span>
                      </div>
                      {ded.selected && (
                        <input
                          type="number"
                          value={ded.amount}
                          onChange={(e) => updateDeductionAmount(ded.id, Number(e.target.value) || 0)}
                          className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-right text-xs font-mono font-bold"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Summary Bar */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-600">Total Gross Turnover: </span>
                <strong className="font-mono text-slate-900">₹{sourceGross.toLocaleString('en-IN')}</strong>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-slate-600">Deductions: </span>
                <strong className="font-mono text-red-700">-₹{totalAllDeductions.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                  Final Net To Farmer:
                </span>
                <span className="font-mono font-black text-base text-[#1a3a52]">
                  ₹{finalFarmerNet.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* PDF Invoice Canvas Header Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                Form C Invoice Preview
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                {resolvedItems.length} Saved Records
              </span>
            </div>

            <div className="no-print flex items-center gap-2">
              <span className="text-xs text-[#64748b] font-medium">Layout:</span>
              <button
                type="button"
                onClick={() => setPdfLayoutFormat('a4')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  pdfLayoutFormat === 'a4'
                    ? 'bg-[#1a3a52] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                A4 Official
              </button>
              <button
                type="button"
                onClick={() => setPdfLayoutFormat('thermal-80mm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  pdfLayoutFormat === 'thermal-80mm'
                    ? 'bg-[#1a3a52] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Thermal (80mm)
              </button>
            </div>
          </div>

          {/* Printable PDF Canvas (Consignment PDF Format & Styling) */}
          <div
            ref={pdfPrintAreaRef}
            id="mandi-pdf-invoice-canvas"
            className={`bg-white p-5 sm:p-7 rounded-2xl border-2 border-[#1a3a52]/20 shadow-sm text-black font-sans mx-auto space-y-4 ${
              pdfLayoutFormat === 'thermal-80mm' ? 'max-w-md' : 'max-w-2xl'
            }`}
          >
            {/* Header Letterhead */}
            <div className="border-b-2 border-dashed border-gray-400 pb-3 text-center space-y-1">
              <div className="flex items-center justify-center gap-2.5">
                {merchantProfile.photoUrl && (
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-700 bg-white shrink-0">
                    <img
                      src={merchantProfile.photoUrl}
                      alt="Owner"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="text-[9px] tracking-widest font-black uppercase text-gray-600 block">
                    WHOLESALE FLOWER COMMISSION AGENCY • FORM C
                  </span>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-black leading-tight">
                    {merchantProfile.shopName || 'Wholesale Flower Mandi'}
                  </h2>
                </div>
              </div>

              <p className="text-xs font-semibold text-gray-800">
                {merchantProfile.shopNumber} • {merchantProfile.apmcMarketName}
              </p>
              <p className="text-[10px] text-gray-600">
                Proprietor: {merchantProfile.ownerName || 'Merchant'} | Ph: {merchantProfile.phoneNumber || '—'}
              </p>
            </div>

            {/* Meta Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-b border-gray-300">
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold block">Invoice / Parchi No.</span>
                <span className="font-mono font-black text-[#1a3a52]">{sourceParchiNumber}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold block">Date &amp; Time</span>
                <span className="font-bold">{sourceDate} • {sourceTime}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold block">Farmer Consignor</span>
                <span className="font-bold">{sourceFarmerName}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold block">Village / Contact</span>
                <span className="font-medium">{sourceFarmerVillage}</span>
                {sourceFarmerPhone && (
                  <span className="text-[10px] font-mono block text-gray-600">+91 {sourceFarmerPhone}</span>
                )}
              </div>
            </div>

            {/* Saved Records Particulars Table */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 pb-1 border-b border-gray-300">
                <span>VARIETY &amp; PARTICULARS ({resolvedItems.length})</span>
                <span className="text-right">QTY × RATE</span>
                <span className="text-right">GROSS</span>
              </div>

              <div className="space-y-1.5 py-1 border-b border-dashed border-gray-300">
                {resolvedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start text-xs pb-1.5 last:pb-0 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-black font-black">{item.flowerVariety}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold border uppercase bg-emerald-50 text-emerald-800 border-emerald-300">
                          {item.flowerQuality || 'Good'}
                        </span>
                      </div>
                      <div className="text-[10px] font-normal text-gray-600 mt-0.5">
                        <span>{item.quantity} {item.unit}</span>
                        {item.boxesCount ? (
                          <span className="ml-1.5 font-bold text-gray-800">
                            • {item.boxesCount} {item.packagingType || primaryPackaging}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-gray-700 block">
                        @ ₹{item.rate}/{item.unit}
                      </span>
                      <span className="text-black font-bold text-xs font-mono">
                        ₹{item.grossTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Volume & Box Count Strip */}
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-gray-50 p-2 rounded border border-gray-200">
                <div>
                  <span className="text-gray-500 font-semibold block">Total Volume:</span>
                  <span className="font-bold text-gray-900 font-mono">
                    {totalQuantity} {resolvedItems[0]?.unit || 'Kgs'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block">Total Packaging:</span>
                  <span className="font-bold text-gray-900 font-mono">
                    {totalBoxes > 0 ? `${totalBoxes} ${primaryPackaging}` : 'Direct arrival'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Sales Amount (Gross Total before deductions) */}
            <div className="p-3 rounded-lg bg-[#f1f5f9] border-2 border-[#1a3a52] flex justify-between items-center text-[#1e293b]">
              <div>
                <span className="block text-[11px] uppercase font-black tracking-wide text-[#1a3a52]">
                  TOTAL SALES AMOUNT
                </span>
                <span className="text-[9px] text-[#64748b] font-medium block">
                  {language === 'te' ? 'మొత్తం అమ్మకం సొమ్ము (స్థూల మొత్తం)' : 'Gross sales amount (before deductions)'}
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black text-[#1a3a52] font-mono">
                ₹{sourceGross.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Charges & Deductions Breakdown Box */}
            <div className="p-3 rounded-xl border border-gray-300 bg-gray-50/80 space-y-1.5 text-xs">
              <div className="font-bold text-gray-900 border-b border-gray-300 pb-1 flex justify-between text-[11px]">
                <span>Mandi Charges &amp; Deductions Breakdown</span>
                <span className="font-mono text-gray-700">Official Form C</span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-gray-700">
                  <span>Vehicle / Freight Charges:</span>
                  <span className="font-mono font-bold text-gray-900">₹{sourceTransport.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Hamali / Loading Charges:</span>
                  <span className="font-mono font-bold text-gray-900">₹{sourceHamali.toLocaleString('en-IN')}</span>
                </div>

                {commissionPercent > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Mandi Commission (@ {commissionPercent}%):</span>
                    <span className="font-mono font-bold">-₹{calculatedCommissionAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {calculatedOtherExpAmount > 0 && (
                  <div className="flex justify-between text-amber-800">
                    <span>Other Expenses ({otherExpMode === 'percent' ? `${otherExpendituresPercent}%` : 'Fixed'}):</span>
                    <span className="font-mono font-bold">-₹{calculatedOtherExpAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {deductionsList
                  .filter((d) => d.selected)
                  .map((ded) => (
                    <div key={ded.id} className="flex justify-between text-gray-700">
                      <span>{ded.name}:</span>
                      <span className="font-mono font-bold">-₹{ded.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}

                {customDeductionActive && customDeductionName && (
                  <div className="flex justify-between text-gray-700">
                    <span>{customDeductionName}:</span>
                    <span className="font-mono font-bold">-₹{Number(customDeductionAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Final Net Amount to Farmer */}
              <div className="pt-2 border-t-2 border-gray-400 flex items-center justify-between">
                <span className="text-xs font-black text-black uppercase tracking-wider">
                  Final Net Amount to Farmer:
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-[#1a3a52]">
                  ₹{finalFarmerNet.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Settlement Status */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-gray-300">
              <div>
                <span className="font-bold text-gray-700 block mb-1 text-[11px]">Payment Settlement:</span>
                <div className="space-y-0.5 text-[11px]">
                  <div>Status: <strong className="text-black uppercase">{paymentStatus}</strong></div>
                  <div>Paid: <strong className="text-emerald-700 font-mono">₹{amountPaid.toLocaleString('en-IN')}</strong></div>
                  {balanceDue > 0 && (
                    <div>Due: <strong className="text-red-700 font-mono">₹{balanceDue.toLocaleString('en-IN')}</strong></div>
                  )}
                  <div>Mode: <span className="font-medium text-gray-800">{paymentMode}</span></div>
                </div>
              </div>

              <div className="text-right flex flex-col justify-end">
                <div className="h-9 border-b border-dashed border-gray-400 mb-1"></div>
                <span className="text-[10px] text-gray-700 font-bold block">
                  For {merchantProfile.shopName}
                </span>
                <span className="text-[9px] text-gray-400">(Authorized Signatory)</span>
              </div>
            </div>

            {/* Thermal Footer */}
            <div className="text-center text-[9px] text-gray-500 pt-2 border-t border-dashed border-gray-300">
              <p>*** Wholesale Flower Market Yard (Form C) ***</p>
              <p className="text-[8px] mt-0.5">Printed via PhoolMitra Mandi System</p>
            </div>
          </div>
        </div>

        {/* Status Message Notification */}
        {pdfStatusMessage && (
          <div className="no-print mx-4 sm:mx-6 mb-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 text-[#1a3a52] animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
              <span>{pdfStatusMessage}</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono">{pdfLayoutFormat.toUpperCase()}</span>
          </div>
        )}

        {/* FIXED FOOTER */}
        <div className="no-print flex-shrink-0 bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="pdf-modal-whatsapp-share-btn"
              onClick={handleShareWhatsApp}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              id="pdf-modal-copy-summary-btn"
              onClick={handleCopyText}
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="pdf-modal-print-btn"
              onClick={handlePrintPDF}
              className="px-3.5 py-2 bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#1a3a52]" />
              <span>Print Form C</span>
            </button>

            <button
              type="button"
              id="pdf-modal-download-btn"
              onClick={() => handleDownloadPDF()}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-[#1a3a52] hover:bg-[#122839] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#d4af37]" />
              )}
              <span>{isGeneratingPdf ? 'Rendering PDF...' : 'Download Form C PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
