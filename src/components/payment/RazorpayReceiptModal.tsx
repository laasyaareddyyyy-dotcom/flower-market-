import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  Download,
  Share2,
  Mail,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Receipt,
  X,
  Send,
  Loader2,
  ExternalLink,
  Phone,
  User,
  Clock,
  Coins,
} from 'lucide-react';
import { PaymentReceiptData, sendReceiptViaEmail } from '../../services/razorpayClient';
import { exportElementToPdf, printHtmlViaIframe } from '../../utils/pdfExport';
import { sounds } from '../../utils/audio';

interface RazorpayReceiptModalProps {
  receipt: PaymentReceiptData;
  onClose: () => void;
  autoDownloadPdf?: boolean;
}

export const RazorpayReceiptModal: React.FC<RazorpayReceiptModalProps> = ({
  receipt,
  onClose,
  autoDownloadPdf = true,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState<string>(receipt.customer.email || '');
  const [emailSending, setEmailSending] = useState<boolean>(false);
  const [emailSentStatus, setEmailSentStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  // Auto-download PDF on first mount if requested
  useEffect(() => {
    sounds.cashSuccess();
    if (autoDownloadPdf && receiptRef.current) {
      const timer = setTimeout(() => {
        handleDownloadPdf(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoDownloadPdf]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    sounds.tap();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadPdf = async (isAuto = false) => {
    if (!receiptRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const filename = `Receipt_${receipt.receiptId}_${receipt.customer.name.replace(/\s+/g, '_')}.pdf`;
      const result = await exportElementToPdf(receiptRef.current, {
        filename,
        title: `Payment Receipt ${receipt.receiptId}`,
        format: 'a4',
        orientation: 'portrait',
        autoDownload: true,
        scale: 2,
      });

      if (result.success) {
        setPdfSuccess(true);
        if (!isAuto) sounds.success();
        setTimeout(() => setPdfSuccess(false), 3000);
      }
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    sounds.tap();
    printHtmlViaIframe(receiptRef.current.innerHTML, `Payment Receipt - ${receipt.receiptId}`);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setEmailSentStatus({ success: false, message: 'Please enter a valid email address.' });
      return;
    }
    setEmailSending(true);
    setEmailSentStatus(null);
    sounds.tap();

    const res = await sendReceiptViaEmail(emailInput, receipt);
    setEmailSending(false);
    setEmailSentStatus(res);
    if (res.success) {
      sounds.success();
    }
  };

  const shareOnWhatsApp = () => {
    sounds.tap();
    const text = `🧾 *PhoolMitra APMC Payment Receipt*\n\n` +
      `*Receipt ID:* ${receipt.receiptId}\n` +
      `*Transaction ID:* ${receipt.transactionId}\n` +
      `*Customer:* ${receipt.customer.name} (${receipt.customer.phone || 'N/A'})\n` +
      `*Amount Settled:* ₹${receipt.amountPaid.toLocaleString('en-IN')}\n` +
      `*Date:* ${receipt.formattedDate}\n` +
      `*Status:* ✅ CAPTURED (Verified via Razorpay)\n\n` +
      `_Thank you for your business!_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-[#1B4D3E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Payment Verified & Settled</h2>
              <p className="text-xs text-emerald-100/80">Official Razorpay Tax & Settlement Voucher</p>
            </div>
          </div>
          <button
            id="close-receipt-modal-btn"
            type="button"
            onClick={() => {
              sounds.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#FCFBF9]">
          {/* Success Banner */}
          <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-900 truncate">
                  Payment of ₹{receipt.amountPaid.toLocaleString('en-IN')} Received
                </div>
                <div className="text-[11px] text-emerald-700">
                  Signature verified & ledger updated successfully.
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <Check className="w-3 h-3" /> CAPTURED
              </span>
            </div>
          </div>

          {/* PRINTABLE RECEIPT CONTAINER (Target of PDF Export) */}
          <div
            ref={receiptRef}
            id="printable-payment-receipt"
            className="p-6 bg-white rounded-xl border border-[#E8E2D9] shadow-xs space-y-5 relative text-[#2A1F1A]"
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none font-black text-6xl tracking-widest text-[#1B4D3E] rotate-[-15deg]">
              PAID &bull; VERIFIED
            </div>

            {/* Receipt Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#E8E2D9] gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#1B4D3E]" />
                  <span className="text-base font-black tracking-tight text-[#1B4D3E]">
                    PHOOLMITRA FLOWER MANDI
                  </span>
                </div>
                <div className="text-[11px] text-[#6B5E57]">
                  APMC Licensed Commission Agent & Agricultural Settlement Hub
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  OFFICIAL RECEIPT
                </span>
                <div className="text-xs font-mono font-bold text-gray-700 mt-1">
                  #{receipt.receiptId}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 p-3 rounded-lg bg-[#FCFBF9] border border-[#E8E2D9]">
                <div className="text-[10px] font-bold uppercase text-[#6B5E57] tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-[#1B4D3E]" /> Customer Details
                </div>
                <div className="font-bold text-sm text-[#2A1F1A]">{receipt.customer.name}</div>
                {receipt.customer.phone && (
                  <div className="text-[11px] text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" /> {receipt.customer.phone}
                  </div>
                )}
                {receipt.customer.farmerId && (
                  <div className="text-[11px] text-gray-600">Farmer ID: {receipt.customer.farmerId}</div>
                )}
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-[#FCFBF9] border border-[#E8E2D9]">
                <div className="text-[10px] font-bold uppercase text-[#6B5E57] tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#1B4D3E]" /> Transaction Info
                </div>
                <div className="text-[11px] text-[#2A1F1A] flex justify-between">
                  <span className="text-gray-500">Date & Time:</span>
                  <span className="font-semibold">{receipt.formattedDate}</span>
                </div>
                <div className="text-[11px] text-[#2A1F1A] flex justify-between">
                  <span className="text-gray-500">Gateway:</span>
                  <span className="font-semibold text-blue-700">Razorpay (Secured)</span>
                </div>
                <div className="text-[11px] text-[#2A1F1A] flex justify-between">
                  <span className="text-gray-500">Payment ID:</span>
                  <span className="font-mono font-semibold text-[10px]">{receipt.transactionId}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#1B4D3E]/5 to-[#DD9F2F]/10 border border-[#1B4D3E]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#6B5E57]">
                  {receipt.settlementPeriod || 'Outstanding Due Settlement'}
                </div>
                <div className="text-[11px] text-gray-500">
                  Mode: {receipt.paymentMethod} &bull; Currency: {receipt.currency}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[10px] uppercase font-bold text-gray-500">Amount Paid</div>
                <div className="text-2xl font-black text-[#1B4D3E]">
                  ₹{receipt.amountPaid.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* IDs Table & Security Footer */}
            <div className="space-y-2 pt-2 border-t border-dashed border-[#E8E2D9]">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <span className="font-mono">
                  <strong className="text-gray-800">TXN ID:</strong> {receipt.transactionId}
                </span>
                <span className="font-mono">
                  <strong className="text-gray-800">ORDER:</strong> {receipt.orderId}
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Verified
                </span>
              </div>
            </div>

            <div className="text-[10px] text-center text-gray-400">
              This is a computer-generated receipt issued by PhoolMitra Flower Mandi Platform and requires no physical signature.
            </div>
          </div>

          {/* Quick Copy Action Bar */}
          <div className="flex flex-wrap items-center gap-2 justify-between p-3 bg-white rounded-xl border border-[#E8E2D9]">
            <div className="text-xs text-[#6B5E57] font-medium">
              Transaction ID: <span className="font-mono font-bold text-[#2A1F1A]">{receipt.transactionId}</span>
            </div>
            <button
              id="copy-transaction-id-btn"
              type="button"
              onClick={() => handleCopy(receipt.transactionId, 'txn')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A] bg-[#FCFBF9] hover:bg-gray-100 transition cursor-pointer"
            >
              {copiedId === 'txn' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>Copy TXN ID</span>
                </>
              )}
            </button>
          </div>

          {/* Email Receipt Section */}
          <div className="p-4 rounded-xl bg-white border border-[#E8E2D9] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2A1F1A]">
              <Mail className="w-4 h-4 text-[#1B4D3E]" />
              <span>Send Receipt via Email</span>
            </div>
            <form onSubmit={handleSendEmail} className="flex flex-col sm:flex-row gap-2">
              <input
                id="receipt-email-input"
                type="email"
                placeholder="customer@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs bg-[#FCFBF9] focus:outline-hidden focus:border-[#1B4D3E]"
              />
              <button
                id="send-receipt-email-btn"
                type="submit"
                disabled={emailSending}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B4D3E] hover:bg-[#143B30] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {emailSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </form>

            {emailSentStatus && (
              <div
                className={`text-xs p-2.5 rounded-lg flex items-center gap-2 ${
                  emailSentStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {emailSentStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{emailSentStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-white border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="share-receipt-whatsapp-btn"
              type="button"
              onClick={shareOnWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>WhatsApp</span>
            </button>
            <button
              id="print-receipt-btn"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E8E2D9] bg-[#FCFBF9] text-[#2A1F1A] hover:bg-gray-100 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span>Print</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="download-receipt-pdf-btn"
              type="button"
              onClick={() => handleDownloadPdf(false)}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DD9F2F] hover:bg-[#c78d26] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </>
              )}
            </button>

            <button
              id="dismiss-receipt-btn"
              type="button"
              onClick={() => {
                sounds.tap();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-[#1B4D3E] hover:bg-[#143B30] text-white text-xs font-bold transition cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
