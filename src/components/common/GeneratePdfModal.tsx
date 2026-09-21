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
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { SaleLot, Expenditures } from '../../types';
import { exportElementToPdf, printHtmlViaIframe } from '../../utils/pdfExport';

interface GeneratePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot?: SaleLot | null;
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
  draftData,
  onFinalize,
}) => {
  const { merchantProfile, updateSaleLot, t, shipments } = useMandi();
  const pdfPrintAreaRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string>('');

  // Check if this lot is part of or synthesized from a multi-variety shipment
  const linkedShipment = lot?.shipmentId ? shipments.find((s) => s.id === lot.shipmentId) : null;

  // Derive source data (either from saved lot or draft transaction)
  const sourceFarmerName = lot?.farmerName || draftData?.farmerName || 'Farmer Consignor';
  const sourceFarmerVillage = lot?.farmerVillage || draftData?.farmerVillage || 'APMC Catchment';
  const sourceFarmerPhone = lot?.farmerPhone || draftData?.farmerPhone || '';
  const sourceVariety = lot?.flowerVariety || draftData?.flowerVariety || 'Mixed Flowers';
  const sourceQuality = lot?.flowerQuality || draftData?.flowerQuality || 'Good';
  const sourceQuantity = lot?.quantity ?? draftData?.quantity ?? 0;
  const sourceUnit = lot?.unit || draftData?.unit || 'Kgs';
  const sourceBoxes = lot?.boxesCount ?? draftData?.boxesCount ?? 0;
  const sourcePackagingType = lot?.packagingType || draftData?.packagingType || (linkedShipment?.items[0]?.packagingType) || 'Boxes';
  const sourceRate = lot?.rate ?? draftData?.rate ?? 0;
  const sourceGross = lot?.grossTotal ?? draftData?.grossTotal ?? Math.round(sourceQuantity * sourceRate);
  const sourceTransport = lot?.transportCharges ?? draftData?.transportCharges ?? (lot?.otherExpenditures?.transport || 0);
  const sourceHamali = lot?.ammaliCharges ?? draftData?.ammaliCharges ?? (lot?.otherExpenditures?.hamali || 0);
  const sourceParchiNumber = lot?.parchiNumber || draftData?.parchiNumber || 'PAR-2026-PREVIEW';
  const sourceDate = lot?.date || draftData?.date || new Date().toISOString().split('T')[0];
  const sourceTime = lot?.time || draftData?.time || 'Morning Auction';

  // Step 3 Configuration States:
  // 1. Commission rate (%)
  const [commissionPercent, setCommissionPercent] = useState<number>(
    lot?.commissionPercent !== undefined ? lot.commissionPercent : (merchantProfile.defaultCommissionRate ?? 0)
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
    lot?.otherExpenditures?.miscPercent ?? 6
  );
  const [otherExpendituresFixed, setOtherExpendituresFixed] = useState<number | ''>(
    lot?.otherExpenditures?.misc && !lot?.otherExpenditures?.miscPercent ? lot.otherExpenditures.misc : ''
  );
  const [otherExpMode, setOtherExpMode] = useState<'percent' | 'fixed'>('percent');
  const [otherExpNote, setOtherExpNote] = useState<string>(
    lot?.otherExpenditures?.miscNote || 'Standard handling & sorting'
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

  // Total deductions breakdown:
  // Transport + Hamali + Commission + Other Exp + Selected Deductions
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
  const [customPaymentStatus, setCustomPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>('Paid');
  const [customAmountPaid, setCustomAmountPaid] = useState<number | ''>('');
  const [customPaymentMode, setCustomPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('Cash');
  const [customPaymentRef, setCustomPaymentRef] = useState<string>('');

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
  const handleDownloadPDF = async () => {
    if (!pdfPrintAreaRef.current) return;
    setIsGeneratingPdf(true);
    setPdfStatusMessage('Rendering high-resolution Form C PDF...');
    try {
      const cleanFarmer = sourceFarmerName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `PhoolMitra-FormC-Invoice-${sourceParchiNumber}-${cleanFarmer}.pdf`;
      const result = await exportElementToPdf(pdfPrintAreaRef.current, {
        filename,
        format: 'a4',
        orientation: 'portrait',
        marginMm: 6,
        scale: 2,
        fitToPage: true,
        autoDownload: true,
      });

      if (result.success) {
        setPdfStatusMessage('✓ PDF downloaded successfully!');
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

  // Safe Print Handler (using dedicated iframe to bypass preview restrictions)
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
    const text = `🌸 *${merchantProfile.shopName || 'Wholesale Flower Mandi'}* 🌸
*Mandi Form C Tax & Consignment Invoice*
━━━━━━━━━━━━━━━━━━━━
📄 *Parchi No:* ${sourceParchiNumber}
📅 *Date:* ${sourceDate} (${sourceTime})
👨‍🌾 *Farmer:* ${sourceFarmerName} (${sourceFarmerVillage})
${sourceFarmerPhone ? `📱 *Phone:* ${sourceFarmerPhone}\n` : ''}
📦 *Consignment:* ${sourceVariety} (${sourceQuality})
⚖️ *Quantity:* ${sourceQuantity} ${sourceUnit} ${sourceBoxes > 0 ? `(${sourceBoxes} ${sourcePackagingType})` : ''}
💰 *Rate:* ₹${sourceRate}/${sourceUnit}
━━━━━━━━━━━━━━━━━━━━
💵 *GROSS AMOUNT:* ₹${sourceGross.toLocaleString('en-IN')}

*Charges & Deductions Breakdown:*
🚚 Transport Expense: -₹${sourceTransport.toLocaleString('en-IN')}
👷 Hamali / Porter Charges: -₹${sourceHamali.toLocaleString('en-IN')}
💼 Commission (${commissionPercent}%): -₹${calculatedCommissionAmount.toLocaleString('en-IN')}
📦 Other Expenditures (${otherExpMode === 'percent' ? `${otherExpendituresPercent}%` : 'Fixed'}): -₹${calculatedOtherExpAmount.toLocaleString('en-IN')}
${selectedDeds.map((d) => `• ${d.name}: -₹${d.amount.toLocaleString('en-IN')}`).join('\n')}${customDeductionActive && customDeductionName ? `\n• ${customDeductionName}: -₹${customDeductionAmount}` : ''}
━━━━━━━━━━━━━━━━━━━━
✨ *FINAL NET AMOUNT TO FARMER:* ₹${finalFarmerNet.toLocaleString('en-IN')}
💳 *Payment Status:* ${paymentStatus} (Paid: ₹${amountPaid.toLocaleString('en-IN')}${balanceDue > 0 ? ` | Due: ₹${balanceDue.toLocaleString('en-IN')}` : ''})
━━━━━━━━━━━━━━━━━━━━
Generated by PhoolMitra Wholesale Mandi System`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopyText = () => {
    const text = `PARCHI ${sourceParchiNumber} | ${sourceFarmerName} | Gross: ₹${sourceGross} | Transport: ₹${sourceTransport} | Hamali: ₹${sourceHamali} | Comm (${commissionPercent}%): ₹${calculatedCommissionAmount} | Net To Farmer: ₹${finalFarmerNet}`;
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
          format: 'a4',
          orientation: 'portrait',
          marginMm: 6,
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
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div
        id="generate-pdf-modal-dialog"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E8E2D9] overflow-hidden my-auto max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="no-print bg-[#2E6349] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#DD9F2F]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#DD9F2F] bg-white/10 px-2 py-0.5 rounded">
                  Form C Official Invoice
                </span>
                <span className="text-xs text-white/70 font-mono">
                  {sourceParchiNumber}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Generate PDF &amp; Commission Calculations
              </h3>
            </div>
          </div>

          <button
            id="close-pdf-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#FCFBF9]">
          {/* Step 3: Commission & Deduction Options Panel */}
          <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#2E6349]" />
                <h4 className="font-black text-xs sm:text-sm text-[#2A1F1A] uppercase tracking-wider">
                  Step 3: Select Commission &amp; Deduction Options
                </h4>
              </div>
              <span className="text-[11px] text-[#6B5E57]">
                Applied only to PDF export &amp; report finalizing
              </span>
            </div>

            {/* 1. Commission Rate (%) Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-[#2E6349]" />
                  <span>1. Commission Rate (%):</span>
                </label>
                <span className="text-xs font-mono font-bold text-[#2E6349]">
                  Cut: ₹{calculatedCommissionAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Commission Preset Chips */}
              <div className="flex flex-wrap gap-2 items-center">
                {[0, 3, 4, 5, 6, 8, 10].map((rateVal) => (
                  <button
                    key={rateVal}
                    type="button"
                    id={`pdf-comm-chip-${rateVal}`}
                    onClick={() => setCommissionPercent(rateVal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border shadow-2xs cursor-pointer ${
                      commissionPercent === rateVal
                        ? 'bg-[#2E6349] text-white border-[#2E6349]'
                        : 'bg-[#FCFBF9] text-[#2A1F1A] border-[#E8E2D9] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    <span>{rateVal}%</span>
                    {rateVal === 4 && <span className="text-[9px] opacity-75">(Std)</span>}
                    {rateVal === 0 && <span className="text-[9px] opacity-75">(None)</span>}
                  </button>
                ))}

                {/* Custom input */}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs text-[#6B5E57]">Custom %:</span>
                  <input
                    id="pdf-custom-comm-input"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
                    className="w-18 px-2 py-1 rounded-lg border border-[#E8E2D9] text-xs font-bold text-center bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Deduction Types & Amounts */}
            <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
              <label className="text-xs font-bold text-[#2A1F1A] block">
                2. Select Deduction Types &amp; Amounts (Optional Mandi Cess):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {deductionsList.map((ded) => (
                  <div
                    key={ded.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-2 ${
                      ded.selected
                        ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-[#FCFBF9] border-[#E8E2D9]'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0">
                      <input
                        id={`pdf-ded-check-${ded.id}`}
                        type="checkbox"
                        checked={ded.selected}
                        onChange={() => toggleDeduction(ded.id)}
                        className="w-4 h-4 text-[#2E6349] rounded border-[#E8E2D9] focus:ring-[#2E6349] cursor-pointer shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-bold text-xs text-[#2A1F1A] block truncate">
                          {ded.name}
                        </span>
                        <span className="text-[10px] text-[#6B5E57]">{ded.nameTe}</span>
                      </div>
                    </label>

                    {ded.selected && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs font-bold text-gray-500">₹</span>
                        <input
                          id={`pdf-ded-amount-${ded.id}`}
                          type="number"
                          min="0"
                          value={ded.amount}
                          onChange={(e) =>
                            updateDeductionAmount(ded.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-16 px-2 py-1 rounded-lg border border-emerald-300 text-xs font-mono font-bold bg-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom Deduction Option */}
              <div className="pt-1">
                {!customDeductionActive ? (
                  <button
                    type="button"
                    id="add-custom-deduction-btn"
                    onClick={() => setCustomDeductionActive(true)}
                    className="text-[11px] text-[#2E6349] font-bold hover:underline cursor-pointer"
                  >
                    + Add Custom Deduction (e.g. Weighbridge fee, Ice storage)
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/60 flex flex-wrap items-center gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Deduction name (e.g. Cold storage)"
                      value={customDeductionName}
                      onChange={(e) => setCustomDeductionName(e.target.value)}
                      className="flex-1 min-w-[140px] px-2.5 py-1 rounded-lg border border-[#E8E2D9] bg-white text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={customDeductionAmount}
                        onChange={(e) =>
                          setCustomDeductionAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                        }
                        className="w-20 px-2.5 py-1 rounded-lg border border-[#E8E2D9] bg-white text-xs font-mono font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomDeductionActive(false);
                        setCustomDeductionName('');
                        setCustomDeductionAmount('');
                      }}
                      className="text-rose-600 font-bold px-1.5 py-0.5 hover:bg-rose-100 rounded"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Other Expenditures Input */}
            <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2A1F1A]">
                  3. Other Expenditures (% or Fixed Amount):
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOtherExpMode('percent')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      otherExpMode === 'percent'
                        ? 'bg-[#2E6349] text-white'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    Percent (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtherExpMode('fixed')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      otherExpMode === 'fixed'
                        ? 'bg-[#2E6349] text-white'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    Fixed (₹)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-[#6B5E57] mb-1">
                    {otherExpMode === 'percent' ? 'Rate (%)' : 'Amount (₹)'}
                  </label>
                  <input
                    id="pdf-other-exp-value-input"
                    type="number"
                    min="0"
                    step="0.5"
                    value={otherExpMode === 'percent' ? otherExpendituresPercent : otherExpendituresFixed}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                      if (otherExpMode === 'percent') {
                        setOtherExpendituresPercent(typeof val === 'number' ? val : 0);
                      } else {
                        setOtherExpendituresFixed(val);
                      }
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-[#6B5E57] mb-1">
                    Description / Note:
                  </label>
                  <input
                    id="pdf-other-exp-note-input"
                    type="text"
                    placeholder="e.g. Sorting, handling and grading"
                    value={otherExpNote}
                    onChange={(e) => setOtherExpNote(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Farmer Payment Settlement & Options */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2A1F1A] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#2E6349]" />
                  <span>Farmer Payment Settlement &amp; Payment Options</span>
                </span>
                <span className="text-[11px] font-mono text-[#6B5E57]">
                  Net Farmer Amount: <strong className="text-[#2A1F1A]">₹{finalFarmerNet.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="pdf-payment-status-paid-btn"
                  onClick={() => {
                    setCustomPaymentStatus('Paid');
                    setCustomAmountPaid(finalFarmerNet);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    customPaymentStatus === 'Paid'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-[#FCFBF9] text-[#6B5E57] border-[#E8E2D9] hover:bg-stone-100'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Paid in Full (₹{finalFarmerNet.toLocaleString('en-IN')})</span>
                </button>

                <button
                  type="button"
                  id="pdf-payment-status-partial-btn"
                  onClick={() => {
                    setCustomPaymentStatus('Partial');
                    if (typeof customAmountPaid !== 'number' || customAmountPaid === 0) {
                      setCustomAmountPaid(Math.round(finalFarmerNet / 2));
                    }
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    customPaymentStatus === 'Partial'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                      : 'bg-[#FCFBF9] text-[#6B5E57] border-[#E8E2D9] hover:bg-stone-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Partial Payment</span>
                </button>

                <button
                  type="button"
                  id="pdf-payment-status-unpaid-btn"
                  onClick={() => {
                    setCustomPaymentStatus('Unpaid');
                    setCustomAmountPaid(0);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    customPaymentStatus === 'Unpaid'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-[#FCFBF9] text-[#6B5E57] border-[#E8E2D9] hover:bg-stone-100'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Unpaid (Credit Due)</span>
                </button>
              </div>

              {/* Payment Mode & Amount Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] text-[#6B5E57] mb-1 font-semibold">
                    Payment Mode:
                  </label>
                  <select
                    id="pdf-payment-mode-select"
                    value={customPaymentMode}
                    onChange={(e) => setCustomPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs bg-[#FCFBF9] font-semibold cursor-pointer"
                  >
                    <option value="Cash">💵 Cash (రొఖ్ఖం)</option>
                    <option value="UPI">📱 UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">🏦 Bank Transfer (NEFT / IMPS)</option>
                    <option value="Cheque">📜 Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#6B5E57] mb-1 font-semibold">
                    Amount Paid to Farmer (₹):
                  </label>
                  <input
                    id="pdf-custom-amount-paid-input"
                    type="number"
                    min="0"
                    max={finalFarmerNet}
                    disabled={customPaymentStatus === 'Unpaid' || customPaymentStatus === 'Paid'}
                    value={customPaymentStatus === 'Paid' ? finalFarmerNet : customPaymentStatus === 'Unpaid' ? 0 : customAmountPaid}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                      setCustomAmountPaid(val);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs bg-[#FCFBF9] font-bold disabled:opacity-60 disabled:bg-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#6B5E57] mb-1 font-semibold">
                    Payment Ref / UTR (Optional):
                  </label>
                  <input
                    id="pdf-payment-ref-input"
                    type="text"
                    placeholder="e.g. UTR-982348"
                    value={customPaymentRef}
                    onChange={(e) => setCustomPaymentRef(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs bg-[#FCFBF9]"
                  />
                </div>
              </div>

              {/* Real-time settlement calculation summary */}
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between text-xs">
                <span className="text-[#6B5E57]">
                  Paid Now: <strong className="text-emerald-700">₹{amountPaid.toLocaleString('en-IN')}</strong>
                </span>
                <span className="text-[#6B5E57]">
                  Remaining Due: <strong className={balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>₹{balanceDue.toLocaleString('en-IN')}</strong>
                </span>
                <span className="text-[#6B5E57]">
                  Status on Form C: <strong className="uppercase font-bold text-[#2A1F1A]">{paymentStatus}</strong>
                </span>
              </div>
            </div>

            {/* Step 3 Live Summary Bar */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-emerald-950">
                Total Calculated Deductions: -₹{totalAllDeductions.toLocaleString('en-IN')}
              </span>
              <span className="font-mono font-black text-sm text-[#2E6349]">
                Final Net To Farmer: ₹{finalFarmerNet.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Step 4: PDF Document Generation Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
                Step 4: Generated PDF Invoice Preview (Mandi Form C)
              </span>
              <span className="text-[11px] text-[#2E6349] font-medium">
                ✓ Ready for high-resolution print &amp; PDF download
              </span>
            </div>

            {/* Printable PDF Canvas */}
            <div
              ref={pdfPrintAreaRef}
              id="mandi-pdf-invoice-canvas"
              className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#E8E2D9] shadow-sm text-black font-sans max-w-2xl mx-auto space-y-5"
            >
              {/* Header Letterhead */}
              <div className="border-b-2 border-dashed border-gray-400 pb-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-3">
                  {merchantProfile.photoUrl && (
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-700 bg-white shrink-0">
                      <img
                        src={merchantProfile.photoUrl}
                        alt="Owner"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] tracking-widest font-black uppercase text-gray-600 block">
                      WHOLESALE FLOWER COMMISSION AGENCY • FORM C
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black">
                      {merchantProfile.shopName || 'Wholesale Flower Mandi'}
                    </h2>
                  </div>
                </div>

                <p className="text-xs font-semibold text-gray-800">
                  {merchantProfile.shopNumber} • {merchantProfile.apmcMarketName}
                </p>
                <p className="text-[11px] text-gray-600">
                  Proprietor: {merchantProfile.ownerName || 'Merchant'} | Ph: {merchantProfile.phoneNumber || '—'}
                </p>
              </div>

              {/* Meta strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-b border-gray-200">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Parchi No.</span>
                  <span className="font-mono font-black text-[#2E6349]">{sourceParchiNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Date &amp; Time</span>
                  <span className="font-bold">{sourceDate} {sourceTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Farmer Consignor</span>
                  <span className="font-bold">{sourceFarmerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Village / Contact</span>
                  <span className="font-medium">{sourceFarmerVillage}</span>
                </div>
              </div>

              {/* Original Transaction Details Table */}
              <div>
                <table className="w-full text-left text-xs border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100 text-black border-b border-gray-300">
                      <th className="p-2 font-bold">Flower Variety</th>
                      <th className="p-2 font-bold text-center">No. of Boxes</th>
                      <th className="p-2 font-bold text-right">Quantity</th>
                      <th className="p-2 font-bold text-right">Rate / Unit</th>
                      <th className="p-2 font-bold text-right">Gross Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedShipment && linkedShipment.items.length > 0 ? (
                      linkedShipment.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="p-2 font-bold">
                            {item.flowerVariety}
                            {item.flowerQuality && (
                              <span className="text-[10px] font-normal text-gray-500 ml-1.5">
                                ({item.flowerQuality})
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-black">
                            {item.boxesCount ? `${item.boxesCount} Boxes` : '0 Boxes'}
                          </td>
                          <td className="p-2 text-right font-mono font-bold">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="p-2 text-right font-mono">₹{item.rate}/{item.unit}</td>
                          <td className="p-2 text-right font-mono font-black text-sm">
                            ₹{Math.round(item.quantity * item.rate).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-gray-200">
                        <td className="p-2 font-bold">
                          {sourceVariety}
                          {sourceQuality && (
                            <span className="text-[10px] font-normal text-gray-500 ml-1.5">
                              ({sourceQuality})
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center font-mono font-bold text-black">
                          {sourceBoxes ? `${sourceBoxes} Boxes` : '0 Boxes'}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {sourceQuantity} {sourceUnit}
                        </td>
                        <td className="p-2 text-right font-mono">₹{sourceRate}/{sourceUnit}</td>
                        <td className="p-2 text-right font-mono font-black text-sm">
                          ₹{sourceGross.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Deductions Breakdown Box */}
              <div className="p-3.5 rounded-xl border border-gray-300 bg-gray-50/70 space-y-2 text-xs">
                <div className="font-bold text-gray-900 border-b border-gray-300 pb-1 flex justify-between">
                  <span>Charges &amp; Deductions Breakdown</span>
                  <span className="font-mono text-gray-700">Detailed Form C Math</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-gray-700">
                    <span>Gross Turnover Amount:</span>
                    <span className="font-mono font-bold text-black">₹{sourceGross.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-rose-800">
                    <span>Less: Transport Expense:</span>
                    <span className="font-mono font-bold">-₹{sourceTransport.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-rose-800">
                    <span>Less: Hamali / Porter Charges:</span>
                    <span className="font-mono font-bold">-₹{sourceHamali.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Less: Commission (@ {commissionPercent}%):</span>
                    <span className="font-mono font-bold">-₹{calculatedCommissionAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-amber-800">
                    <span>Less: Other Expenditures ({otherExpMode === 'percent' ? `${otherExpendituresPercent}%` : 'Fixed'}):</span>
                    <span className="font-mono font-bold">-₹{calculatedOtherExpAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {deductionsList
                    .filter((d) => d.selected)
                    .map((ded) => (
                      <div key={ded.id} className="flex justify-between text-gray-700">
                        <span>Less: {ded.name}:</span>
                        <span className="font-mono font-bold">-₹{ded.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}

                  {customDeductionActive && customDeductionName && (
                    <div className="flex justify-between text-gray-700">
                      <span>Less: {customDeductionName}:</span>
                      <span className="font-mono font-bold">-₹{Number(customDeductionAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Final Net Amount Highlight */}
                <div className="pt-2 border-t-2 border-gray-400 flex items-center justify-between">
                  <span className="text-sm font-black text-black uppercase tracking-wider">
                    Final Net Amount to Farmer:
                  </span>
                  <span className="text-xl font-black font-mono text-[#2E6349]">
                    ₹{finalFarmerNet.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment & Signatures Footer */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-300">
                <div>
                  <span className="font-bold text-gray-700 block mb-1">Settlement Status:</span>
                  <div className="space-y-0.5 text-[11px]">
                    <div>Status: <strong className="text-black uppercase">{paymentStatus}</strong></div>
                    <div>Paid: <strong className="text-emerald-700 font-mono">₹{amountPaid.toLocaleString('en-IN')}</strong></div>
                    {balanceDue > 0 && (
                      <div>Due: <strong className="text-rose-700 font-mono">₹{balanceDue.toLocaleString('en-IN')}</strong></div>
                    )}
                    <div>Mode: <span className="font-medium text-gray-800">{paymentMode}</span></div>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-end">
                  <div className="h-10 border-b border-dashed border-gray-400 mb-1"></div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">
                    Authorized Mandi Adathiya Signature
                  </span>
                  <span className="text-[9px] text-gray-400">Computer Generated Official Form C Slip</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message Notification */}
        {pdfStatusMessage && (
          <div className="no-print mx-4 sm:mx-6 mb-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 text-[#2E6349] animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
              <span>{pdfStatusMessage}</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono">Form C A4</span>
          </div>
        )}

        {/* Action Bar (Footer) */}
        <div className="no-print bg-white border-t border-[#E8E2D9] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              id="pdf-modal-whatsapp-share-btn"
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs hover:bg-[#20b858] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              id="pdf-modal-copy-summary-btn"
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] font-semibold text-xs hover:bg-[#F4EFEA] transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#6B5E57]" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="pdf-modal-print-export-btn"
              type="button"
              onClick={handlePrintPDF}
              className="px-3.5 py-2.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] font-bold text-xs hover:bg-[#F4EFEA] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#6B5E57]" />
              <span>Print</span>
            </button>

            <button
              id="pdf-modal-download-direct-btn"
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPDF}
              className="px-4 py-2.5 rounded-xl bg-[#FCFBF9] border-2 border-[#2E6349] text-[#2E6349] font-black text-xs hover:bg-[#E9F3EE] transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 text-[#2E6349] animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-[#2E6349]" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              id="pdf-modal-finalize-save-btn"
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleSaveAndFinalize}
              className="px-5 py-2.5 rounded-xl bg-[#2E6349] text-white font-black text-xs hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-[#DD9F2F]" />
              <span>Save &amp; Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
