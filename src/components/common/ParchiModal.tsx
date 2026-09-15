import React, { useRef, useState } from 'react';
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
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { speakParchiDetails, sounds } from '../../utils/audio';

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
    t,
  } = useMandi();

  const printAreaRef = useRef<HTMLDivElement>(null);
  const [showRemovePrompt, setShowRemovePrompt] = useState<boolean>(false);
  const [printCompletedTime, setPrintCompletedTime] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  if (!selectedParchiLot) return null;

  const lot = selectedParchiLot;
  const matchedFarmer = farmers.find((f) => f.id === lot.farmerId);
  const farmerPhoto = matchedFarmer?.photoUrl;

  const ammaliVal = lot.ammaliCharges ?? lot.otherExpenditures?.hamali ?? 0;
  const transportVal = lot.transportCharges ?? lot.otherExpenditures?.transport ?? 0;
  const miscVal = lot.otherExpenditures?.misc ?? 0;
  const nonCommissionDeductions = ammaliVal + transportVal + miscVal;

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

    window.print();
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
*No. of Boxes:* ${lot.boxesCount ? `${lot.boxesCount} Boxes` : 'N/A'}
*Quality of Flower:* ${lot.flowerQuality || 'Good'}
*Quantity:* ${lot.quantity} ${lot.unit}
*Rate:* ₹${lot.rate} per ${lot.unit}
*Gross Lot Total:* ₹${lot.grossTotal.toLocaleString('en-IN')}
--------------------------------
*Deductions:*
${ammaliVal > 0 ? `- Ammali (Hamali): ₹${ammaliVal.toLocaleString('en-IN')}\n` : ''}${transportVal > 0 ? `- Transport: ₹${transportVal.toLocaleString('en-IN')}\n` : ''}${miscVal > 0 ? `- Other/Misc: ₹${miscVal.toLocaleString('en-IN')}\n` : ''}${nonCommissionDeductions === 0 ? '- None\n' : ''}--------------------------------
*FARMER'S NET MONEY:* ₹${lot.farmerNetPayable.toLocaleString('en-IN')}
*Payment Status:* ${lot.paymentStatus.toUpperCase()}
*Paid Now:* ₹${lot.amountPaid.toLocaleString('en-IN')}
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
              title="Voice narration of Mandi Parchi in current language (వాయిస్ చదవండి)"
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

          <button
            id="print-thermal-parchi-btn"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1F4532] transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('printReceiptBtn')}</span>
          </button>
        </div>

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
                        • {lot.boxesCount} Boxes
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

              {/* Box count and Quality summary strip */}
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-gray-50 p-1.5 rounded mt-1 border border-gray-200">
                <div>
                  <span className="text-gray-500 font-semibold block">No. of Boxes:</span>
                  <span className="font-bold text-gray-900 font-mono">
                    {lot.boxesCount ? `${lot.boxesCount} Boxes` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block">Quality of Flower:</span>
                  <span className="font-bold text-gray-900">
                    {lot.flowerQuality || 'Good'}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Breakdown (Note: Merchant commission is hidden per export rules) */}
            <div className="py-2 border-b border-dashed border-gray-300 text-[11px] space-y-1">
              <span className="text-gray-500 block text-[9px] uppercase font-bold">
                Itemized Deductions (Ammali & Transport)
              </span>

              {ammaliVal > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Ammali / Hamali (కూలీ ఖర్చు)</span>
                  <span className="font-mono">- ₹{ammaliVal.toLocaleString('en-IN')}</span>
                </div>
              )}

              {transportVal > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Transport / Fare (రవాణా ఖర్చు)</span>
                  <span className="font-mono">- ₹{transportVal.toLocaleString('en-IN')}</span>
                </div>
              )}

              {miscVal > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>
                    Misc Deductions
                    {lot.otherExpenditures?.miscPercent ? ` (${lot.otherExpenditures.miscPercent}%)` : ''}
                    {lot.otherExpenditures?.miscNote ? ` - ${lot.otherExpenditures.miscNote}` : ''}
                  </span>
                  <span className="font-mono">- ₹{miscVal.toLocaleString('en-IN')}</span>
                </div>
              )}

              {nonCommissionDeductions === 0 && (
                <div className="flex justify-between text-gray-500 italic">
                  <span>Deductions</span>
                  <span>Nil (₹0)</span>
                </div>
              )}

              {nonCommissionDeductions > 0 && (
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total Deductions</span>
                  <span className="font-mono">- ₹{nonCommissionDeductions.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Final Amount: Farmer's Net Money */}
            <div className="my-3 p-3 rounded-lg bg-emerald-50 border-2 border-emerald-600 flex justify-between items-center text-emerald-950">
              <div>
                <span className="block text-[11px] uppercase font-black tracking-wide text-emerald-900">
                  FARMER'S NET MONEY
                </span>
                <span className="text-[9px] text-emerald-700 font-medium block">
                  రైతు నికర సొమ్ము (Final payable amount)
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black text-emerald-900 font-mono">
                ₹{lot.farmerNetPayable.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Payment Status & Details */}
            <div className="py-2 border-b-2 border-dashed border-gray-400 text-[11px] space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Payment Status:</span>
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
            onClick={() => setShowRemovePrompt(true)}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition"
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
    </div>
  );
};
