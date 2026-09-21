import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Trash2,
  Volume2,
  Truck,
  Package,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Coins,
  History,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Shipment, SaleLot } from '../../types';
import { useMandi } from '../../context/MandiContext';
import { speakShipmentDetails, speakParchiDetails, sounds } from '../../utils/audio';

interface ConsignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  consignment: {
    type: 'shipment' | 'lot';
    shipment?: Shipment;
    lot?: SaleLot;
  } | null;
  onDelete?: () => void;
}

type DetailTab = 'summary' | 'commodity' | 'charges' | 'history';

export const ConsignmentDetailModal: React.FC<ConsignmentDetailModalProps> = ({
  isOpen,
  onClose,
  consignment,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('summary');
  const {
    openPdfModalForShipment,
    openPdfModalForLot,
    openParchiSlipForShipment,
    setSelectedParchiLot,
    language,
    merchantProfile,
    activeSessionDate,
  } = useMandi();

  if (!isOpen || !consignment) return null;

  const isShipment = consignment.type === 'shipment' && consignment.shipment;
  const shipment = consignment.shipment;
  const lot = consignment.lot;

  const id = isShipment ? shipment!.shipmentNumber : lot!.parchiNumber;
  const farmerName = isShipment ? shipment!.farmerName : lot!.farmerName;
  const farmerVillage = isShipment ? shipment!.farmerVillage : lot!.farmerVillage;
  const farmerPhone = isShipment ? shipment!.farmerPhone : lot!.farmerPhone;
  const date = isShipment ? shipment!.date : lot!.date;
  const time = isShipment ? shipment!.time : lot!.time;
  const grossTotal = isShipment ? shipment!.grossTotal : lot!.grossTotal;
  const transportCharge = isShipment
    ? shipment!.transportCharge
    : lot!.transportCharges || lot!.otherExpenditures?.transport || 0;
  const hamaliCharge = isShipment
    ? shipment!.hamaliCharge
    : lot!.ammaliCharges || lot!.otherExpenditures?.hamali || 0;
  const netAmount = isShipment
    ? shipment!.netAmountAfterDailyCuts || grossTotal - transportCharge - hamaliCharge
    : lot!.farmerNetPayable || grossTotal - transportCharge - hamaliCharge;
  const paymentStatus = isShipment ? shipment!.paymentStatus : lot!.paymentStatus;
  const balanceDue = isShipment ? shipment!.balanceDue : lot!.balanceDue;
  const amountPaid = isShipment ? shipment!.amountPaid : lot!.amountPaid;
  const notes = isShipment ? shipment!.notes : lot!.notes;

  const items = isShipment
    ? shipment!.items
    : [
        {
          id: lot!.id,
          commodityCategory: lot!.commodityCategory || 'flowers',
          flowerVariety: lot!.flowerVariety,
          quantity: lot!.quantity,
          unit: lot!.unit,
          rate: lot!.rate,
          grossTotal: lot!.grossTotal,
          boxesCount: lot!.boxesCount,
          flowerQuality: lot!.flowerQuality,
        },
      ];

  const totalQuantity = items.reduce((acc, it) => acc + it.quantity, 0);
  const totalPackages = items.reduce((acc, it) => acc + (it.boxesCount || 0), 0);

  const handleVoice = () => {
    sounds.playBidTick();
    if (isShipment) {
      const varietySummary = items.map((i) => `${i.flowerVariety} (${i.quantity} ${i.unit})`).join(', ');
      speakShipmentDetails(
        farmerName,
        varietySummary,
        grossTotal,
        transportCharge,
        hamaliCharge,
        netAmount,
        language
      );
    } else if (lot) {
      speakParchiDetails(
        farmerName,
        lot.flowerVariety,
        lot.quantity,
        lot.unit,
        lot.rate,
        lot.grossTotal,
        language
      );
    }
  };

  const handlePrintSlip = () => {
    sounds.playBidTick();
    if (isShipment && shipment) {
      openParchiSlipForShipment(shipment);
    } else if (lot) {
      setSelectedParchiLot(lot);
    }
  };

  const handleFormCPdf = () => {
    sounds.playBidTick();
    if (isShipment && shipment) {
      openPdfModalForShipment(shipment);
    } else if (lot) {
      openPdfModalForLot(lot);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs no-print">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E8E2D9] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consignment-details-title"
      >
        {/* Header */}
        <div className="bg-[#2E6349] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#24533c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-[#DD9F2F] border border-white/20">
              {isShipment ? <Truck className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="consignment-details-title" className="text-base sm:text-lg font-black leading-tight">
                  {id}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#DD9F2F] text-[#2A1F1A] font-black">
                  {isShipment ? 'Shipment Consignment' : 'Single Lot'}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {farmerName} • 📍 {farmerVillage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-black/20 text-white/90 hover:text-white hover:bg-black/30 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#FAF8F5] border-b border-[#E8E2D9] px-4 pt-2 flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {[
            { id: 'summary', label: 'SUMMARY' },
            { id: 'commodity', label: `COMMODITY (${items.length})` },
            { id: 'charges', label: 'CHARGES & DEDUCTIONS' },
            { id: 'history', label: 'HISTORY' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`modal-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as DetailTab)}
                className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#2E6349] text-[#2E6349] bg-white shadow-2xs'
                    : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A] hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* 1. SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#FCFBF9] p-3.5 rounded-xl border border-[#E8E2D9] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                    Consignment Identification
                  </span>
                  <div className="space-y-1 text-[#2A1F1A]">
                    <div className="flex justify-between">
                      <span className="text-[#6B5E57]">ID Number:</span>
                      <strong className="font-mono text-[#2E6349]">{id}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B5E57]">Session Date:</span>
                      <strong className="font-mono">{date}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B5E57]">Time Recorded:</span>
                      <strong>{time}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B5E57]">Session Type:</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                        {date === activeSessionDate ? 'Live Session' : 'Past Archive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FCFBF9] p-3.5 rounded-xl border border-[#E8E2D9] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                    Consignor Farmer Information
                  </span>
                  <div className="space-y-1 text-[#2A1F1A]">
                    <div className="flex justify-between">
                      <span className="text-[#6B5E57]">Farmer Name:</span>
                      <strong>{farmerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B5E57]">Village/Location:</span>
                      <strong>{farmerVillage}</strong>
                    </div>
                    {farmerPhone && (
                      <div className="flex justify-between">
                        <span className="text-[#6B5E57]">Mobile:</span>
                        <span className="font-mono">{farmerPhone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#6B5E57]">APMC Yard:</span>
                      <span>{merchantProfile.apmcMarketName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="p-4 rounded-xl bg-[#F9F6F0] border border-[#E8E2D9] grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">Gross Total</span>
                  <span className="text-base sm:text-lg font-black text-[#2A1F1A]">
                    ₹{grossTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">Vehicle Freight</span>
                  <span className="text-sm font-bold text-blue-700">₹{transportCharge}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">Hamali / Loading</span>
                  <span className="text-sm font-bold text-[#DD9F2F]">₹{hamaliCharge}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#2E6349] block">Net Payable</span>
                  <span className="text-base sm:text-lg font-black text-[#2E6349]">
                    ₹{netAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Status Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#E8E2D9] bg-white">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#2E6349]" />
                  <span className="font-bold text-[#2A1F1A]">Payment Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : paymentStatus === 'Partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6B5E57] block">Balance Due</span>
                  <span className="font-black text-xs sm:text-sm text-rose-700">
                    ₹{balanceDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {notes && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900">
                  <strong className="block text-[10px] uppercase font-bold">Consignment Notes:</strong>
                  <p className="mt-0.5">{notes}</p>
                </div>
              )}
            </div>
          )}

          {/* 2. COMMODITY TAB */}
          {activeTab === 'commodity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#6B5E57] pb-1">
                <span>Varieties &amp; Line Items ({items.length})</span>
                <span>
                  Total Volume: <strong>{totalQuantity} Kgs</strong> • Packages: <strong>{totalPackages} pkgs</strong>
                </span>
              </div>

              <div className="overflow-x-auto border border-[#E8E2D9] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#F4EFEA] text-[#2A1F1A] font-bold">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Commodity &amp; Variety</th>
                      <th className="p-2.5 text-center">Bags / Pkgs</th>
                      <th className="p-2.5 text-center">Grade</th>
                      <th className="p-2.5 text-right">Quantity</th>
                      <th className="p-2.5 text-right">Rate</th>
                      <th className="p-2.5 text-right">Item Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D9] bg-white">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FCFBF9]">
                        <td className="p-2.5 text-[#6B5E57] font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-[#2A1F1A]">
                          <div className="flex items-center gap-1.5">
                            <span>
                              {item.commodityCategory === 'grains'
                                ? '🌾'
                                : item.commodityCategory === 'vegetables'
                                ? '🥦'
                                : item.commodityCategory === 'fruits'
                                ? '🍎'
                                : '🌸'}
                            </span>
                            <span>{item.flowerVariety}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-mono text-[#6B5E57]">
                          {item.boxesCount ? `${item.boxesCount} pkgs` : '—'}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {item.flowerQuality || 'Grade A / Premium'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-2.5 text-right font-mono">₹{item.rate}/{item.unit}</td>
                        <td className="p-2.5 text-right font-mono font-black text-[#2A1F1A]">
                          ₹{Math.round(item.quantity * item.rate).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#FAF8F5] font-bold border-t border-[#E8E2D9]">
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right uppercase text-[10px] text-[#6B5E57]">
                        Total Gross Sum:
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-[#2E6349]">
                        {totalQuantity} Kgs
                      </td>
                      <td></td>
                      <td className="p-2.5 text-right font-mono font-black text-base text-[#2E6349]">
                        ₹{grossTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* 3. CHARGES & DEDUCTIONS TAB */}
          {activeTab === 'charges' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
                <div className="p-3.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-sm text-[#2A1F1A] block">Gross Consignment Sales</span>
                    <span className="text-[#6B5E57] text-[11px]">Total sales proceeds before any Mandi deductions</span>
                  </div>
                  <span className="font-mono font-black text-base text-[#2A1F1A]">
                    ₹{grossTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3.5 flex justify-between items-center bg-[#FCFBF9]">
                  <div>
                    <span className="font-bold text-[#2A1F1A] block">Vehicle Freight Charges</span>
                    <span className="text-[#6B5E57] text-[11px]">Direct truck/tempo freight deducted once</span>
                  </div>
                  <span className="font-mono font-bold text-blue-700">- ₹{transportCharge}</span>
                </div>

                <div className="p-3.5 flex justify-between items-center bg-[#FCFBF9]">
                  <div>
                    <span className="font-bold text-[#2A1F1A] block">Hamali / Loading / Kata</span>
                    <span className="text-[#6B5E57] text-[11px]">Unloading, sorting &amp; weighing fees</span>
                  </div>
                  <span className="font-mono font-bold text-[#DD9F2F]">- ₹{hamaliCharge}</span>
                </div>

                <div className="p-3.5 flex justify-between items-center bg-[#F9F6F0]">
                  <div>
                    <span className="font-black text-sm text-[#2E6349] block">
                      Net Amount After Daily Cuts
                    </span>
                    <span className="text-[#6B5E57] text-[11px]">
                      Credited to farmer account ledger
                    </span>
                  </div>
                  <span className="font-mono font-black text-lg text-[#2E6349]">
                    ₹{netAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Settlement breakdown */}
              <div className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Payment Status Breakdown
                </span>
                <div className="flex justify-between">
                  <span className="text-[#6B5E57]">Already Paid:</span>
                  <span className="font-mono font-bold text-emerald-700">₹{amountPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5E57]">Balance Due / Pending:</span>
                  <span className="font-mono font-bold text-rose-700">₹{balanceDue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="bg-[#FCFBF9] p-4 rounded-xl border border-[#E8E2D9] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2E6349]">
                  <History className="w-4 h-4" />
                  <span>Audit Trail &amp; Life-cycle History</span>
                </div>

                <div className="space-y-2 text-[#2A1F1A]">
                  <div className="flex justify-between border-b border-[#E8E2D9]/70 pb-2">
                    <span className="text-[#6B5E57]">Created At:</span>
                    <span className="font-mono">{date} {time}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8E2D9]/70 pb-2">
                    <span className="text-[#6B5E57]">Last Modified:</span>
                    <span className="font-mono">{date} {time}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8E2D9]/70 pb-2">
                    <span className="text-[#6B5E57]">Last Viewed:</span>
                    <span className="font-mono">Today</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8E2D9]/70 pb-2">
                    <span className="text-[#6B5E57]">Active Session Date:</span>
                    <span className="font-mono">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B5E57]">Archived Status:</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                      {date === activeSessionDate ? 'Active (Live)' : 'Archived Day'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF8F5] p-3 sm:p-4 border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="detail-modal-voice-btn"
              onClick={handleVoice}
              className="px-3 py-2 rounded-xl bg-white border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#2E6349]" />
              <span className="hidden sm:inline">Voice</span>
            </button>

            <button
              type="button"
              id="detail-modal-slip-btn"
              onClick={handlePrintSlip}
              className="px-3 py-2 rounded-xl bg-white border border-[#E8E2D9] text-[#2A1F1A] text-xs font-bold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span>Parchi Slip</span>
            </button>

            <button
              type="button"
              id="detail-modal-form-c-btn"
              onClick={handleFormCPdf}
              className="px-3 py-2 rounded-xl bg-[#FEF8ED] border-2 border-[#DD9F2F] text-[#2A1F1A] text-xs font-black hover:bg-[#faebd1] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#DD9F2F]" />
              <span>Form C PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                id="detail-modal-delete-btn"
                onClick={onDelete}
                className="p-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                title="Delete this record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
