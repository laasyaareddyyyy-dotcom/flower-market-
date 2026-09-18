import React, { useRef, useState, useEffect } from 'react';
import {
  Printer,
  Share2,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  Copy,
  Receipt,
  Phone,
  Store,
  Volume2,
  Trash2,
  History,
  Check,
  CreditCard,
  Edit3,
  Banknote,
  DollarSign,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Download,
  Loader2,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { speakParchiDetails, sounds } from '../../utils/audio';
import { exportElementToPdf, printHtmlViaIframe } from '../../utils/pdfExport';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const ParchiModal: React.FC = () => {
  const {
    selectedParchiLot,
    setSelectedParchiLot,
    merchantProfile,
    farmers,
    setActiveFarmerId,
    language,
    autoRemoveParchiAfterPrint,
    setAutoRemoveParchiAfterPrint,
    removeParchiWithAudit,
    setIsAuditTrailOpen,
    parchiAuditLogs,
    shipments,
    updateLotPaymentStatus,
    t,
  } = useMandi();

  const printAreaRef = useRef<HTMLDivElement>(null);
  const [showRemovePrompt, setShowRemovePrompt] = useState<boolean>(false);
  const [printCompletedTime, setPrintCompletedTime] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);

  // Payment Status Editing States
  const [isEditingPayment, setIsEditingPayment] = useState<boolean>(false);
  const [editStatus, setEditStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>('Paid');
  const [editAmountPaid, setEditAmountPaid] = useState<number | ''>(0);
  const [editPaymentMode, setEditPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('Cash');
  const [editRefNumber, setEditRefNumber] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Sync internal edit fields when lot changes
  useEffect(() => {
    if (selectedParchiLot) {
      setEditStatus(selectedParchiLot.paymentStatus || 'Unpaid');
      setEditAmountPaid(selectedParchiLot.amountPaid ?? 0);
      setEditPaymentMode(selectedParchiLot.paymentMode || 'Cash');
      setEditRefNumber(selectedParchiLot.paymentReference || '');
      setEditNotes(selectedParchiLot.notes || '');
    }
  }, [selectedParchiLot?.id, selectedParchiLot?.paymentStatus, selectedParchiLot?.amountPaid]);

  if (!selectedParchiLot) return null;

  const lot = selectedParchiLot;
  const matchedFarmer = farmers.find((f) => f.id === lot.farmerId);
  const farmerPhoto = matchedFarmer?.photoUrl;
  const linkedShipment = lot.shipmentId ? shipments.find((s) => s.id === lot.shipmentId) : null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleQuickMarkPaid = () => {
    if (!lot) return;
    updateLotPaymentStatus(lot.id, 'Paid', lot.farmerNetPayable, 'Cash', undefined, 'Marked full paid from Parchi');
    sounds.playCashChime();
    showToast(`Parchi updated to PAID (₹${lot.farmerNetPayable.toLocaleString('en-IN')})`);
  };

  const handleQuickMarkUnpaid = () => {
    if (!lot) return;
    updateLotPaymentStatus(lot.id, 'Unpaid', 0, undefined, undefined, 'Marked unpaid credit from Parchi');
    sounds.playBidTick();
    showToast(`Parchi updated to UNPAID (Due: ₹${lot.farmerNetPayable.toLocaleString('en-IN')})`);
  };

  const handleSavePaymentDetails = () => {
    if (!lot) return;
    const numericAmount = typeof editAmountPaid === 'number' ? editAmountPaid : 0;
    
    let resolvedStatus: 'Paid' | 'Unpaid' | 'Partial' = editStatus;
    if (editStatus === 'Paid') {
      resolvedStatus = 'Paid';
    } else if (editStatus === 'Unpaid') {
      resolvedStatus = 'Unpaid';
    } else {
      resolvedStatus = numericAmount >= lot.farmerNetPayable ? 'Paid' : numericAmount > 0 ? 'Partial' : 'Unpaid';
    }

    const finalAmount = resolvedStatus === 'Paid' ? lot.farmerNetPayable : resolvedStatus === 'Unpaid' ? 0 : numericAmount;

    updateLotPaymentStatus(
      lot.id,
      resolvedStatus,
      finalAmount,
      editPaymentMode,
      editRefNumber.trim() || undefined,
      editNotes.trim() || undefined
    );

    sounds.playCashChime();
    setIsEditingPayment(false);
    showToast(
      resolvedStatus === 'Paid'
        ? `Marked as PAID (₹${finalAmount.toLocaleString('en-IN')})`
        : resolvedStatus === 'Unpaid'
        ? `Marked as UNPAID (Due: ₹${lot.farmerNetPayable.toLocaleString('en-IN')})`
        : `Partial payment of ₹${finalAmount.toLocaleString('en-IN')} recorded`
    );
  };

  const ammaliVal = lot.ammaliCharges ?? lot.otherExpenditures?.hamali ?? 0;
  const transportVal = lot.transportCharges ?? lot.otherExpenditures?.transport ?? 0;
  const miscVal = lot.otherExpenditures?.misc ?? 0;
  const nonCommissionDeductions = ammaliVal + transportVal + miscVal;

  const handleDownloadPdf = async (format: 'a4' | 'thermal-80mm' = 'a4') => {
    if (!printAreaRef.current || !lot) return;
    setIsGeneratingPdf(true);
    showToast('Generating Full Parchi PDF...');
    try {
      const cleanFarmer = lot.farmerName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `PhoolMitra-Parchi-${lot.parchiNumber}-${cleanFarmer}.pdf`;
      const res = await exportElementToPdf(printAreaRef.current, {
        filename,
        format,
        orientation: 'portrait',
        marginMm: format === 'thermal-80mm' ? 4 : 6,
        scale: 2,
        fitToPage: true,
        autoDownload: true,
      });

      if (res.success) {
        showToast('✓ Full Parchi PDF Downloaded!');
      } else {
        showToast(`Failed: ${res.error || 'PDF Generation Error'}`);
      }
    } catch (e: any) {
      console.error('[Parchi PDF Error]', e);
      showToast('Error downloading Parchi PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const timestampStr = `${dateFormatted} • ${timeFormatted}`;
    setPrintCompletedTime(timestampStr);

    // If auto-remove is turned on, set up listener for print completion
    if (autoRemoveParchiAfterPrint) {
      let triggered = false;
      const onPrintDone = () => {
        if (!triggered) {
          triggered = true;
          window.removeEventListener('afterprint', onPrintDone);
          setShowRemovePrompt(true);
        }
      };

      window.addEventListener('afterprint', onPrintDone);
      // Fallback in case window.onafterprint is bypassed by certain preview iframes/browsers
      setTimeout(onPrintDone, 1200);
    }

    if (printAreaRef.current) {
      printHtmlViaIframe(printAreaRef.current, `Mandi Parchi - ${lot.parchiNumber}`);
    } else {
      window.print();
    }
  };

  const handleConfirmRemove = () => {
    if (!lot) return;
    sounds.playCashChime();
    removeParchiWithAudit(lot.id, {
      printedAt: printCompletedTime || undefined,
      reason: 'Printed and removed by merchant',
    });
    setShowRemovePrompt(false);
  };

  const handleKeepParchi = () => {
    setShowRemovePrompt(false);
  };

  const lotPackaging = lot.packagingType || (linkedShipment?.items[0]?.packagingType) || 'Boxes';

  const getWhatsAppMessage = () => {
    const text = `*FLOWER MANDI PARCHI* 🌸
*${merchantProfile.shopName}*
Shop: ${merchantProfile.shopNumber}, ${merchantProfile.apmcMarketName}
Phone: ${merchantProfile.phoneNumber}
--------------------------------
*Parchi No:* ${lot.parchiNumber}
*Date:* ${lot.date} | *Time:* ${lot.time}
*Farmer:* ${lot.farmerName} (${lot.farmerVillage})
*Flower:* ${lot.flowerVariety}
*No. of ${lotPackaging}:* ${lot.boxesCount ? `${lot.boxesCount} ${lotPackaging}` : 'N/A'}
*Quality of Flower:* ${lot.flowerQuality || 'Good'}
*Quantity:* ${lot.quantity} ${lot.unit}
*Rate:* ₹${lot.rate} per ${lot.unit}
*Total Sales Amount:* ₹${lot.grossTotal.toLocaleString('en-IN')}
--------------------------------
*Recorded Mandi Charges:*
- Vehicle / Freight: ₹${transportVal.toLocaleString('en-IN')}
- Hamali / Loading: ₹${ammaliVal.toLocaleString('en-IN')}
--------------------------------
*Payment Status:* ${lot.paymentStatus.toUpperCase()}
*Paid:* ₹${lot.amountPaid.toLocaleString('en-IN')}
*Balance Due:* ₹${lot.balanceDue.toLocaleString('en-IN')}
--------------------------------
_Generated via PhoolMitra Mandi Ledger_`;

    return encodeURIComponent(text);
  };

  const shareWhatsApp = () => {
    const phone = lot.farmerPhone ? lot.farmerPhone.replace(/\D/g, '') : '';
    const phoneParam = phone ? `91${phone.slice(-10)}` : '';
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${getWhatsAppMessage()}`
      : `https://api.whatsapp.com/send?text=${getWhatsAppMessage()}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    const text = decodeURIComponent(getWhatsAppMessage());
    navigator.clipboard.writeText(text);
    alert('Parchi receipt details copied to clipboard!');
  };

  return (
    <div
      id="parchi-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header Controls (Hidden during print) */}
        <div className="no-print p-4 bg-[#2E6349] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#DD9F2F]" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {t('mandiParchiTitle')} - {lot.parchiNumber}
              </h3>
              <p className="text-[11px] text-white/80">{t('parchiSubtitle')}</p>
            </div>
          </div>
          <button
            id="close-parchi-modal-btn"
            onClick={() => setSelectedParchiLot(null)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="no-print bg-[#FCFBF9] border-b border-[#E8E2D9] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="parchi-voice-speak-btn"
              onClick={() => {
                sounds.playBidTick();
                speakParchiDetails(
                  lot.farmerName,
                  lot.flowerVariety,
                  lot.quantity,
                  lot.unit,
                  lot.rate,
                  lot.farmerNetPayable,
                  language
                );
              }}
              className="px-3 py-1.5 rounded-lg bg-[#E9F3EE] hover:bg-[#d5ebe0] text-[#2E6349] text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
              title={language === 'te' ? 'వాయిస్ చదవండి' : 'Voice narration of Mandi Parchi in current language'}
            >
              <Volume2 className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span>🔊 Voice Readout</span>
            </button>

            <button
              id="whatsapp-share-parchi-btn"
              onClick={shareWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#20b858] transition shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              id="copy-parchi-btn"
              onClick={copyToClipboard}
              className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E8E2D9] text-[#2A1F1A] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F4EFEA] transition shadow-xs"
            >
              <Copy className="w-3.5 h-3.5 text-[#6B5E57]" />
              <span className="hidden sm:inline">Copy</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="download-parchi-pdf-btn"
              type="button"
              disabled={isGeneratingPdf}
              onClick={() => handleDownloadPdf('a4')}
              className="px-3 py-1.5 rounded-lg bg-[#FCFBF9] border border-[#2E6349] text-[#2E6349] text-xs font-bold flex items-center gap-1.5 hover:bg-[#E9F3EE] transition shadow-2xs cursor-pointer disabled:opacity-50"
              title="Download full Parchi as PDF file"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 text-[#2E6349] animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#2E6349]" />
              )}
              <span>{isGeneratingPdf ? 'Saving...' : 'Download PDF'}</span>
            </button>

            <button
              id="print-thermal-parchi-btn"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1F4532] transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('printReceiptBtn')}</span>
            </button>
          </div>
        </div>

        {/* Toast Notification for Real-Time Updates */}
        {toastMessage && (
          <div className="no-print bg-[#2E6349] text-white text-xs px-4 py-2 font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#DD9F2F]" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Payment Status Strip & Action Bar */}
        <div className="no-print bg-[#F4EFEA] border-b border-[#E8E2D9] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6B5E57]">
              {language === 'te' ? 'చెల్లింపు స్థితి:' : 'Payment Status:'}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                lot.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : lot.paymentStatus === 'Partial'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {lot.paymentStatus === 'Paid' ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
              ) : lot.paymentStatus === 'Partial' ? (
                <Clock className="w-3.5 h-3.5 text-amber-700" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
              )}
              <span>{lot.paymentStatus.toUpperCase()}</span>
              {lot.paymentStatus === 'Paid' && (
                <span className="font-mono text-[11px] font-bold">₹{lot.amountPaid.toLocaleString('en-IN')}</span>
              )}
              {lot.paymentStatus === 'Partial' && (
                <span className="font-mono text-[11px] font-bold">
                  (Paid ₹{lot.amountPaid.toLocaleString('en-IN')} • Due ₹{lot.balanceDue.toLocaleString('en-IN')})
                </span>
              )}
              {lot.paymentStatus === 'Unpaid' && (
                <span className="font-mono text-[11px] font-bold">(Due ₹{lot.balanceDue.toLocaleString('en-IN')})</span>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {lot.paymentStatus !== 'Paid' && (
              <button
                type="button"
                id="quick-mark-parchi-paid-btn"
                onClick={handleQuickMarkPaid}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                title="Instantly mark this parchi as fully PAID"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'పూర్తి చెల్లించండి' : 'Mark as Paid'} (₹{lot.farmerNetPayable.toLocaleString('en-IN')})</span>
              </button>
            )}

            {lot.paymentStatus !== 'Unpaid' && (
              <button
                type="button"
                id="quick-mark-parchi-unpaid-btn"
                onClick={handleQuickMarkUnpaid}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                title="Change status back to UNPAID credit"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'చెల్లించనిదిగా మార్చండి' : 'Mark as Unpaid'}</span>
              </button>
            )}

            <button
              type="button"
              id="toggle-edit-payment-details-btn"
              onClick={() => setIsEditingPayment((prev) => !prev)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span>{isEditingPayment ? (language === 'te' ? 'మూసివేయి' : 'Close Editor') : (language === 'te' ? 'చెల్లింపు సవరించండి' : 'Edit Payment Details')}</span>
              {isEditingPayment ? <ChevronUp className="w-3 h-3 text-stone-500" /> : <ChevronDown className="w-3 h-3 text-stone-500" />}
            </button>
          </div>
        </div>

        {/* Collapsible Payment Details Editor */}
        {isEditingPayment && (
          <div className="no-print bg-[#FFFFFF] border-b border-[#E8E2D9] p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-1 border-b border-stone-200">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#2E6349]" />
                <span className="font-bold text-xs text-[#2A1F1A]">
                  {language === 'te' ? 'రైతు చెల్లింపు వివరాల సవరణ' : 'Update Farmer Payment & Mode for Parchi Slip'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#6B5E57]">
                Net Farmer Amount: <strong className="text-[#2A1F1A]">₹{lot.farmerNetPayable.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            {/* Status Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setEditStatus('Paid');
                  setEditAmountPaid(lot.farmerNetPayable);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  editStatus === 'Paid'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-white/60'
                }`}
              >
                ✓ Paid (Full ₹{lot.farmerNetPayable.toLocaleString('en-IN')})
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditStatus('Unpaid');
                  setEditAmountPaid(0);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  editStatus === 'Unpaid'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-white/60'
                }`}
              >
                ✕ Unpaid (₹0 Credit)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditStatus('Partial');
                  if (typeof editAmountPaid !== 'number' || editAmountPaid === 0 || editAmountPaid === lot.farmerNetPayable) {
                    setEditAmountPaid(Math.round(lot.farmerNetPayable / 2));
                  }
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  editStatus === 'Partial'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-white/60'
                }`}
              >
                ◷ Partial Amount
              </button>
            </div>

            {/* If Paid or Partial, show amount & payment mode details */}
            {editStatus !== 'Unpaid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2A1F1A] mb-1">
                    Amount Paid to Farmer (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={lot.farmerNetPayable}
                      value={editAmountPaid}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                        setEditAmountPaid(val);
                        if (typeof val === 'number') {
                          if (val >= lot.farmerNetPayable) setEditStatus('Paid');
                          else if (val > 0) setEditStatus('Partial');
                          else setEditStatus('Unpaid');
                        }
                      }}
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-bold focus:outline-hidden focus:border-[#2E6349] bg-stone-50"
                    />
                  </div>
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditAmountPaid(lot.farmerNetPayable);
                        setEditStatus('Paid');
                      }}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-700"
                    >
                      Full (₹{lot.farmerNetPayable})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditAmountPaid(Math.round(lot.farmerNetPayable / 2));
                        setEditStatus('Partial');
                      }}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-700"
                    >
                      50% (₹{Math.round(lot.farmerNetPayable / 2)})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditAmountPaid(500);
                        setEditStatus('Partial');
                      }}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-700"
                    >
                      ₹500
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditAmountPaid(1000);
                        setEditStatus('Partial');
                      }}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-700"
                    >
                      ₹1,000
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#2A1F1A] mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={editPaymentMode}
                    onChange={(e) => setEditPaymentMode(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-bold focus:outline-hidden focus:border-[#2E6349] bg-stone-50"
                  >
                    <option value="Cash">💵 Cash (రొఖ్ఖం)</option>
                    <option value="UPI">📱 UPI (PhonePe / Google Pay / Paytm)</option>
                    <option value="Bank Transfer">🏦 Bank Transfer (IMPS / NEFT)</option>
                    <option value="Cheque">📜 Cheque</option>
                  </select>

                  <div className="mt-2">
                    <label className="block text-[10px] font-semibold text-[#6B5E57] mb-0.5">
                      Ref / UTR No. (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI Ref #48921"
                      value={editRefNumber}
                      onChange={(e) => setEditRefNumber(e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg border border-[#E8E2D9] text-xs focus:outline-hidden focus:border-[#2E6349] bg-stone-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Real-Time Balance Due Summary Strip */}
            <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 flex items-center justify-between text-xs">
              <span className="text-[#6B5E57] font-medium">
                Remaining Balance Due:
              </span>
              <span className={`font-mono font-black ${
                editStatus === 'Paid' || (typeof editAmountPaid === 'number' && editAmountPaid >= lot.farmerNetPayable)
                  ? 'text-emerald-700'
                  : 'text-rose-700'
              }`}>
                ₹{Math.max(0, lot.farmerNetPayable - (editStatus === 'Unpaid' ? 0 : (typeof editAmountPaid === 'number' ? editAmountPaid : 0))).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Save & Cancel Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingPayment(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6B5E57] hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="save-parchi-payment-status-btn"
                onClick={handleSavePaymentDetails}
                className="px-4 py-1.5 rounded-lg bg-[#2E6349] hover:bg-[#1F4532] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Update Parchi</span>
              </button>
            </div>
          </div>
        )}

        {/* User-Controlled Auto-Remove Setting Strip */}
        <div className="no-print bg-[#F9F7F4] border-b border-[#E8E2D9] px-4 py-2 flex items-center justify-between gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="parchi-modal-auto-remove-checkbox"
              type="checkbox"
              checked={autoRemoveParchiAfterPrint}
              onChange={(e) => setAutoRemoveParchiAfterPrint(e.target.checked)}
              className="w-4 h-4 text-[#2E6349] rounded border-[#E8E2D9] focus:ring-[#2E6349] cursor-pointer"
            />
            <span className="font-semibold text-[#2A1F1A] text-xs">
              {t('removeParchiAfterPrint')}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                autoRemoveParchiAfterPrint
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {autoRemoveParchiAfterPrint ? 'ON' : 'OFF'}
            </span>
          </label>

          {parchiAuditLogs.length > 0 && (
            <button
              type="button"
              id="parchi-modal-audit-trail-link"
              onClick={() => {
                setSelectedParchiLot(null);
                setIsAuditTrailOpen(true);
              }}
              className="text-[11px] font-bold text-[#2E6349] hover:underline flex items-center gap-1 shrink-0"
            >
              <History className="w-3.5 h-3.5" />
              <span>{t('viewAuditTrail')} ({parchiAuditLogs.length})</span>
            </button>
          )}
        </div>

        {/* Post-Print Confirmation Prompt (Only displayed after print confirmation or manual remove click) */}
        {showRemovePrompt && (
          <div
            id="post-print-confirmation-banner"
            className="no-print bg-amber-50 border-b border-amber-200 p-3.5 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
                <Printer className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#2A1F1A]">
                  {t('removeParchiPromptTitle')}
                </h4>
                <p className="text-[11px] text-[#6B5E57] leading-relaxed">
                  {t('removeParchiPromptDesc')}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    id="confirm-remove-parchi-btn"
                    onClick={handleConfirmRemove}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('confirmAndRemoveBtn')}</span>
                  </button>
                  <button
                    type="button"
                    id="keep-parchi-btn"
                    onClick={handleKeepParchi}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E8E2D9] text-[#2A1F1A] font-semibold text-xs hover:bg-[#FCFBF9] transition cursor-pointer"
                  >
                    {t('keepParchiBtn')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Receipt Body (Targeted by Thermal Print CSS) */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-[#FCFBF9]">
          <div
            ref={printAreaRef}
            className="thermal-receipt-print bg-white p-4 sm:p-5 rounded-xl border border-[#E8E2D9] shadow-xs text-xs font-mono text-black mx-auto max-w-[400px]"
          >
            {/* Merchant Mandi Letterhead */}
            <div className="border-b-2 border-dashed border-gray-400 pb-3 mb-3">
              <div className="flex items-center justify-center gap-3 mb-1">
                {merchantProfile.photoUrl && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 bg-white shrink-0">
                    <img
                      src={merchantProfile.photoUrl}
                      alt={merchantProfile.ownerName || 'Owner'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-center">
                  <span className="text-[10px] tracking-widest font-bold uppercase text-gray-600 block">
                    WHOLESALE FLOWER MARKET
                  </span>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-black">
                    {merchantProfile.shopName}
                  </h2>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-semibold text-gray-800">
                  {merchantProfile.shopNumber} • {merchantProfile.apmcMarketName}
                </p>
                <p className="text-[10px] text-gray-600">
                  Owner: {merchantProfile.ownerName || 'Merchant'} | Ph: {merchantProfile.phoneNumber}
                </p>
                <div className="mt-1 inline-block bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-gray-300">
                  Mandi Sale Parchi (Form C)
                </div>
              </div>
            </div>

            {/* Slip Meta */}
            <div className="flex justify-between items-center py-1 border-b border-dashed border-gray-300 text-[11px]">
              <div>
                <span className="text-gray-500 block text-[9px]">PARCHI NO.</span>
                <span className="font-bold">{lot.parchiNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block text-[9px]">DATE & TIME</span>
                <span className="font-bold">
                  {lot.date} • {lot.time}
                </span>
              </div>
            </div>

            {/* Farmer Info */}
            <div className="py-2 border-b border-dashed border-gray-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {farmerPhoto ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 bg-gray-100 shrink-0">
                    <img
                      src={farmerPhoto}
                      alt={lot.farmerName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-400 flex items-center justify-center font-bold text-xs">
                    {lot.farmerName.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase font-bold">Farmer / Consignor</span>
                  <div className="text-[12px] font-bold">
                    <span>{lot.farmerName}</span>
                    <span className="font-normal text-[11px] text-gray-700 ml-1">({lot.farmerVillage})</span>
                  </div>
                </div>
              </div>

              {lot.farmerPhone && (
                <div className="text-[10px] text-gray-600 flex items-center gap-1 font-mono">
                  <Phone className="w-2.5 h-2.5" />
                  <span>+91 {lot.farmerPhone}</span>
                </div>
              )}
            </div>

            {/* Consignment / Lot Particulars */}
            <div className="py-2.5 border-b-2 border-dashed border-gray-400">
              <div className="flex justify-between text-[11px] font-bold text-gray-700 pb-1 border-b border-gray-200 mb-1">
                <span>VARIETY & PARTICULARS</span>
                <span className="text-right">QTY × RATE</span>
                <span className="text-right">GROSS</span>
              </div>

              {linkedShipment && linkedShipment.items.length > 0 ? (
                <div className="space-y-2 py-1">
                  {linkedShipment.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[12px] border-b border-gray-100 pb-1 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-black font-black">{it.flowerVariety}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold border uppercase bg-emerald-50 text-emerald-800 border-emerald-300">
                            {it.flowerQuality || 'Good'}
                          </span>
                        </div>
                        <div className="text-[10px] font-normal text-gray-600 mt-0.5">
                          <span>{it.quantity} {it.unit}</span>
                          {it.boxesCount ? (
                            <span className="ml-1.5 font-bold text-gray-800">
                              • {it.boxesCount} {it.packagingType || lotPackaging}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-gray-700 block">
                          @ ₹{it.rate}/{it.unit}
                        </span>
                        <span className="text-black font-bold text-xs font-mono">
                          ₹{Math.round(it.quantity * it.rate).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-between items-start font-bold text-[12px] py-1">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-black font-black">{lot.flowerVariety}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold border uppercase ${
                          lot.flowerQuality === 'Bad'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : lot.flowerQuality === 'Average'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {lot.flowerQuality || 'Good'} Quality
                      </span>
                    </div>
                    <div className="text-[10px] font-normal text-gray-600 mt-0.5">
                      <span>{lot.quantity} {lot.unit}</span>
                      {lot.boxesCount ? (
                        <span className="ml-1.5 font-bold text-gray-800">
                          • {lot.boxesCount} {lotPackaging}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-gray-700 block">
                      @ ₹{lot.rate}/{lot.unit}
                    </span>
                    <span className="text-black font-bold text-xs font-mono">
                      ₹{lot.grossTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {/* Box count and Quality summary strip */}
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-gray-50 p-1.5 rounded mt-1 border border-gray-200">
                <div>
                  <span className="text-gray-500 font-semibold block">Consignment Type:</span>
                  <span className="font-bold text-gray-900 font-mono">
                    {linkedShipment ? `One Truck (${linkedShipment.items.length} varieties)` : (lot.boxesCount ? `${lot.boxesCount} ${lotPackaging}` : 'Direct arrival')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block">Total Volume:</span>
                  <span className="font-bold text-gray-900">
                    {lot.quantity} {lot.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Charges Strip (Vehicle / Freight & Hamali / Loading) */}
            <div className="py-2 border-b border-dashed border-gray-300 text-[11px] space-y-1">
              <span className="text-gray-500 block text-[9px] uppercase font-bold">
                Mandi Recorded Charges
              </span>

              <div className="flex justify-between text-gray-700">
                <span>{language === 'te' ? 'రవాణా / వెహికల్ ఛార్జీలు' : 'Vehicle / Freight Charges'}</span>
                <span className="font-mono font-bold text-gray-900">₹{transportVal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>{language === 'te' ? 'హమాలీ / లోడింగ్ కూలీ' : 'Hamali / Loading Charges'}</span>
                <span className="font-mono font-bold text-gray-900">₹{ammaliVal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Total Sales Amount (Gross Total before deductions) */}
            <div className="my-3 p-3 rounded-lg bg-[#F4EFEA] border-2 border-[#2E6349] flex justify-between items-center text-[#2A1F1A]">
              <div>
                <span className="block text-[11px] uppercase font-black tracking-wide text-[#2E6349]">
                  TOTAL SALES AMOUNT
                </span>
                <span className="text-[9px] text-[#6B5E57] font-medium block">
                  {language === 'te' ? 'మొత్తం అమ్మకం సొమ్ము (స్థూల మొత్తం)' : 'Gross sales amount (before deductions)'}
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black text-[#2E6349] font-mono">
                ₹{(linkedShipment ? linkedShipment.grossTotal : lot.grossTotal).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Payment Status & Details */}
            <div className="py-2 border-b-2 border-dashed border-gray-400 text-[11px] space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Payment Status:</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      lot.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lot.paymentStatus === 'Partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {lot.paymentStatus.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPayment(true)}
                    className="no-print text-[10px] text-[#2E6349] hover:underline font-bold flex items-center gap-0.5 ml-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 cursor-pointer"
                    title="Change payment status or record payment"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-gray-800">
                <span>Amount Paid Now:</span>
                <span className="font-bold">₹{lot.amountPaid.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-gray-800 font-bold">
                <span>Remaining Balance Due:</span>
                <span className={lot.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                  ₹{lot.balanceDue.toLocaleString('en-IN')}
                </span>
              </div>

              {lot.paymentMode && (
                <div className="text-[10px] text-gray-600 pt-1">
                  Mode: <span className="font-semibold">{lot.paymentMode}</span>
                  {lot.paymentReference && ` • Ref: ${lot.paymentReference}`}
                </div>
              )}

              {lot.notes && (
                <div className="text-[10px] text-gray-500 italic mt-0.5">
                  Note: {lot.notes}
                </div>
              )}
            </div>

            {/* Signatures Area */}
            <div className="pt-5 pb-2 grid grid-cols-2 gap-4 text-center text-[9px] font-sans">
              <div className="border-t border-gray-400 pt-1 text-gray-700">
                <span>Farmer Signature / Thumb</span>
              </div>
              <div className="border-t border-gray-400 pt-1 font-bold text-gray-900">
                <span>For {merchantProfile.shopName}</span>
                <span className="block text-[8px] font-normal text-gray-500">(Adathiya Signatory)</span>
              </div>
            </div>

            {/* Thermal Footer */}
            <div className="text-center text-[9px] text-gray-500 pt-2 border-t border-dashed border-gray-300">
              <p>*** Wholesale Flower Market Yard ***</p>
              <p className="text-[8px] mt-0.5">Printed via PhoolMitra Mandi System</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="no-print p-3 bg-[#FFFFFF] border-t border-[#E8E2D9] flex items-center justify-between">
          <button
            type="button"
            id="manual-remove-parchi-trigger"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Discard this parchi and preserve an audit log"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Slip</span>
          </button>

          <button
            id="parchi-modal-close-bottom-btn"
            onClick={() => setSelectedParchiLot(null)}
            className="px-4 py-2 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-[#2A1F1A] font-semibold text-xs hover:bg-[#F4EFEA] transition"
          >
            {t('close')}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal for Parchi Slip Removal */}
      {lot && (
        <DeleteConfirmModal
          isOpen={isDeleteConfirmOpen}
          title="Remove Mandi Parchi Slip"
          itemName={`Parchi Slip: ${lot.parchiNumber}`}
          itemDetails={`Farmer: ${lot.farmerName} • Flower: ${lot.flowerVariety} • Amount: ₹${(lot.grossTotal ?? (lot.quantity * lot.rate)).toLocaleString('en-IN')}`}
          message="Are you sure you want to remove this Mandi slip? It will be archived with an audit log record."
          confirmText="CONFIRM REMOVE"
          cancelText="CANCEL"
          onConfirm={() => {
            setIsDeleteConfirmOpen(false);
            handleConfirmRemove();
          }}
          onCancel={() => setIsDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
};
