import React, { useState } from 'react';
import {
  Users,
  QrCode,
  BookOpen,
  ArrowUpRight,
  Printer,
  Share2,
  Calendar,
  Layers,
  Phone,
  Store,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Sparkles,
  User,
  UserPlus,
  Volume2,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { sounds, speakParchiDetails } from '../../utils/audio';

export const FarmerPortalView: React.FC = () => {
  const {
    farmers,
    lots,
    merchantProfile,
    setSelectedParchiLot,
    setIsQRModalOpen,
    setIsFarmerSignUpOpen,
    isSeniorMode,
    language,
    t,
  } = useMandi();

  // Active simulated farmer in portal
  const [activeFarmerId, setActiveFarmerId] = useState<string>(farmers[0]?.id || 'FARM-001');

  const currentFarmer = farmers.find((f) => f.id === activeFarmerId) || farmers[0];

  // Lots specifically for this farmer
  const farmerLots = lots.filter((l) => l.farmerId === currentFarmer?.id);

  // Financial calculations for farmer
  const totalVolume = farmerLots.reduce((acc, l) => acc + l.quantity, 0);
  const totalGross = farmerLots.reduce((acc, l) => acc + l.grossTotal, 0);
  const totalCommissionDeducted = farmerLots.reduce((acc, l) => acc + l.commissionAmount, 0);
  const totalOtherDeducted = farmerLots.reduce((acc, l) => acc + l.totalOtherExpenditures, 0);
  const totalNet = farmerLots.reduce((acc, l) => acc + l.farmerNetPayable, 0);
  const totalPaid = farmerLots.reduce((acc, l) => acc + l.amountPaid, 0);
  const totalDue = farmerLots.reduce((acc, l) => acc + l.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Farmer Selector / Simulation Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-[#2E6349] bg-[#FCFBF9] shrink-0 shadow-2xs">
            {currentFarmer?.photoUrl ? (
              <img
                src={currentFarmer.photoUrl}
                alt={currentFarmer.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E9F3EE] text-[#2E6349] font-black text-base">
                {currentFarmer?.name.charAt(0) || '🌾'}
              </div>
            )}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B5E57] tracking-wider block">
              {t('portalFarmer')} Mode (Digital Khata Passbook)
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#2A1F1A]">
                {currentFarmer?.name}
              </h2>
              <span className="text-xs text-[#6B5E57] font-medium">📍 {currentFarmer?.village}</span>
            </div>
            <div className="text-[11px] text-[#2E6349] font-medium">
              Primary Crops: {currentFarmer?.primaryCrops?.join(', ') || 'Flowers'}
            </div>
          </div>
        </div>

        {/* Switch Farmer Identity or Register New */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-[#6B5E57] font-medium whitespace-nowrap">
              Switch Grower:
            </label>
            <select
              id="switch-farmer-select"
              value={activeFarmerId}
              onChange={(e) => setActiveFarmerId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs font-bold bg-[#FCFBF9] text-[#2A1F1A]"
            >
              {farmers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.village})
                </option>
              ))}
            </select>
          </div>

          <button
            id="farmer-portal-signup-btn"
            onClick={() => setIsFarmerSignUpOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#DD9F2F]" />
            <span>Sign Up as Farmer</span>
          </button>
        </div>
      </div>

      {/* Connected Mandi Merchants Banner */}
      <div className="bg-gradient-to-r from-[#2E6349] to-[#1F4532] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#DD9F2F] bg-white/10 shrink-0 shadow-md">
            {merchantProfile.photoUrl ? (
              <img
                src={merchantProfile.photoUrl}
                alt={merchantProfile.ownerName || merchantProfile.shopName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#DD9F2F]">
                <Store className="w-6 h-6" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#DD9F2F] tracking-wider uppercase mb-0.5">
              <Store className="w-3.5 h-3.5" />
              <span>Connected APMC Commission Merchant</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black">{merchantProfile.shopName}</h3>
            <p className="text-xs text-white/80 mt-0.5">
              Owner: <strong className="text-[#DD9F2F]">{merchantProfile.ownerName || 'Merchant'}</strong> • {merchantProfile.shopNumber} • {merchantProfile.apmcMarketName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="farmer-view-qr-btn"
            onClick={() => setIsQRModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white text-[#2E6349] font-bold text-xs hover:bg-white/90 transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
          >
            <QrCode className="w-4 h-4 text-[#DD9F2F]" />
            <span>Merchant QR & Connect</span>
          </button>
        </div>
      </div>

      {/* Passbook Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] block">
            Total Flower Volume
          </span>
          <div className="text-2xl font-black text-[#2A1F1A] mt-2">
            {totalVolume.toLocaleString('en-IN')} <span className="text-sm font-semibold text-[#6B5E57]">units/kgs</span>
          </div>
          <span className="text-xs text-[#2E6349] font-medium mt-1 block">
            Across {farmerLots.length} consignments
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] block">
            Gross Auction Earnings
          </span>
          <div className="text-2xl font-black text-[#2A1F1A] mt-2">
            ₹{totalGross.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-[#6B5E57] mt-1 block">
            Comm: ₹{totalCommissionDeducted} • Exp: ₹{totalOtherDeducted}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] block">
            Total Received (Paid)
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-emerald-800/80 font-medium mt-1 block">
            Cash & UPI settlements
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] block">
            Pending Balance to Receive
          </span>
          <div
            className={`text-2xl font-black mt-2 ${
              totalDue > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            ₹{totalDue.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-[#6B5E57] mt-1 block">
            {totalDue > 0 ? 'Due from Commission Merchant' : 'All accounts settled!'}
          </span>
        </div>
      </div>

      {/* Farmer Digital Passbook Lots List */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xs overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between border-b border-[#F4EFEA] pb-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#2A1F1A] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2E6349]" />
              <span>Digital Mandi Parchi Passbook</span>
            </h3>
            <p className="text-xs text-[#6B5E57]">
              Real-time transparent record of all your flower lots brought to the mandi yard.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#E9F3EE] text-[#2E6349] font-mono font-bold text-xs">
            {farmerLots.length} slips
          </span>
        </div>

        {farmerLots.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B5E57]">
            No lots recorded for this farmer yet.
          </div>
        ) : (
          <div className="space-y-3">
            {[...farmerLots].reverse().map((lot) => (
              <div
                key={lot.id}
                className="p-4 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] hover:border-[#2E6349]/40 transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#2E6349] bg-white px-2.5 py-1 rounded border border-[#E8E2D9]">
                      {lot.parchiNumber}
                    </span>
                    <span className="text-[#6B5E57]">
                      {lot.date} • {lot.time}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      lot.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lot.paymentStatus === 'Partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {lot.paymentStatus === 'Paid'
                      ? 'Fully Paid'
                      : lot.paymentStatus === 'Partial'
                      ? `Partial (Due ₹${lot.balanceDue})`
                      : `Due ₹${lot.balanceDue}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                      Crop Variety
                    </span>
                    <span className="font-bold text-sm text-[#2A1F1A]">
                      🌸 {lot.flowerVariety}
                    </span>
                    <span className="text-[11px] text-[#2E6349] block font-semibold">
                      {lot.quantity} {lot.unit} @ ₹{lot.rate}/{lot.unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                      Gross & Deductions
                    </span>
                    <span className="font-mono text-xs text-[#2A1F1A] block">
                      Gross: ₹{lot.grossTotal}
                    </span>
                    <span className="text-[10px] text-[#6B5E57] block">
                      Comm: ₹{lot.commissionAmount} • Other Exp: ₹{lot.totalOtherExpenditures}
                    </span>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                      Farmer Net Amount
                    </span>
                    <span className="font-mono font-black text-base text-[#2A1F1A] block">
                      ₹{lot.farmerNetPayable.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-700 block">
                      Paid: ₹{lot.amountPaid}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E8E2D9]">
                  <button
                    type="button"
                    id={`farmer-slip-speak-btn-${lot.id}`}
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
                    className="px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-white text-[#2A1F1A] text-xs font-semibold hover:bg-[#F4EFEA] transition flex items-center gap-1"
                    title="Audio Readout in Native Language"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#2E6349]" />
                    <span>వాయిస్ చదవండి (Audio)</span>
                  </button>

                  <button
                    onClick={() => setSelectedParchiLot(lot)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#2E6349] text-white font-bold text-xs hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#DD9F2F]" />
                    <span>View Mandi Slip (రశీదు)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
