import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';

export const QRModal: React.FC = () => {
  const {
    isQRModalOpen,
    setIsQRModalOpen,
    merchantProfile,
    connectionRequests,
    acceptConnectionRequest,
    declineConnectionRequest,
    t,
  } = useMandi();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'requests'>('qr');

  if (!isQRModalOpen) return null;

  const copyMerchantId = () => {
    navigator.clipboard.writeText(merchantProfile.merchantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingRequests = connectionRequests.filter((r) => r.status === 'pending');

  return (
    <div
      id="qr-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#2E6349] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#DD9F2F]" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Merchant QR & Farmer Connections
              </h3>
              <p className="text-[11px] text-white/80">Connect growers directly to your digital mandi khata</p>
            </div>
          </div>
          <button
            id="close-qr-modal-btn"
            onClick={() => setIsQRModalOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#E8E2D9] bg-[#FCFBF9]">
          <button
            id="qr-view-tab-btn"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 text-center transition ${
              activeTab === 'qr'
                ? 'border-[#2E6349] text-[#2E6349] bg-white'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            Merchant ID & QR Code
          </button>
          <button
            id="qr-requests-tab-btn"
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'requests'
                ? 'border-[#2E6349] text-[#2E6349] bg-white'
                : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <span>Connection Requests</span>
            {pendingRequests.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#C2255C] text-white text-[10px] font-bold flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeTab === 'qr' ? (
            <div className="flex flex-col items-center text-center">
              {/* Profile Card */}
              <div className="w-full bg-[#FCFBF9] p-4 rounded-xl border border-[#E8E2D9] mb-4">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#2E6349] font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Commission Merchant</span>
                </div>
                <h4 className="text-lg font-black text-[#2A1F1A]">{merchantProfile.shopName}</h4>
                <p className="text-xs text-[#6B5E57] mt-0.5">
                  {merchantProfile.shopNumber} • {merchantProfile.apmcMarketName}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl border-2 border-[#2E6349]/20 shadow-md relative group">
                <svg
                  className="w-48 h-48 sm:w-56 sm:h-56"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Frame */}
                  <rect width="100" height="100" fill="white" />
                  {/* Top Left Finder */}
                  <rect x="5" y="5" width="26" height="26" rx="2" fill="#2E6349" />
                  <rect x="9" y="9" width="18" height="18" rx="1" fill="white" />
                  <rect x="13" y="13" width="10" height="10" fill="#2E6349" />
                  {/* Top Right Finder */}
                  <rect x="69" y="5" width="26" height="26" rx="2" fill="#2E6349" />
                  <rect x="73" y="9" width="18" height="18" rx="1" fill="white" />
                  <rect x="77" y="13" width="10" height="10" fill="#2E6349" />
                  {/* Bottom Left Finder */}
                  <rect x="5" y="69" width="26" height="26" rx="2" fill="#2E6349" />
                  <rect x="9" y="73" width="18" height="18" rx="1" fill="white" />
                  <rect x="13" y="77" width="10" height="10" fill="#2E6349" />
                  {/* Custom QR Matrix Bits for Flower Mandi */}
                  <rect x="36" y="8" width="5" height="5" fill="#2E6349" />
                  <rect x="44" y="8" width="8" height="5" fill="#2A1F1A" />
                  <rect x="55" y="8" width="5" height="5" fill="#2E6349" />
                  <rect x="36" y="16" width="9" height="5" fill="#2A1F1A" />
                  <rect x="48" y="16" width="6" height="5" fill="#DD9F2F" />
                  <rect x="57" y="16" width="6" height="5" fill="#2E6349" />
                  <rect x="8" y="36" width="6" height="6" fill="#2A1F1A" />
                  <rect x="18" y="36" width="6" height="6" fill="#2E6349" />
                  <rect x="27" y="36" width="5" height="5" fill="#2A1F1A" />
                  <rect x="36" y="27" width="6" height="6" fill="#2E6349" />
                  <rect x="45" y="27" width="10" height="5" fill="#2A1F1A" />
                  <rect x="60" y="27" width="5" height="5" fill="#DD9F2F" />
                  <rect x="70" y="36" width="7" height="6" fill="#2A1F1A" />
                  <rect x="82" y="36" width="8" height="6" fill="#2E6349" />
                  {/* Center Flower Badge */}
                  <rect x="40" y="40" width="20" height="20" rx="4" fill="#2E6349" />
                  <circle cx="50" cy="50" r="6" fill="#DD9F2F" />
                  <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
                  {/* Bottom Pattern */}
                  <rect x="36" y="65" width="8" height="6" fill="#2A1F1A" />
                  <rect x="48" y="65" width="6" height="6" fill="#2E6349" />
                  <rect x="58" y="65" width="8" height="6" fill="#2A1F1A" />
                  <rect x="70" y="65" width="6" height="8" fill="#2E6349" />
                  <rect x="80" y="65" width="12" height="6" fill="#2A1F1A" />
                  <rect x="36" y="75" width="12" height="6" fill="#2E6349" />
                  <rect x="52" y="75" width="8" height="6" fill="#DD9F2F" />
                  <rect x="64" y="75" width="6" height="6" fill="#2A1F1A" />
                  <rect x="74" y="75" width="8" height="6" fill="#2E6349" />
                  <rect x="86" y="75" width="6" height="12" fill="#2A1F1A" />
                  <rect x="36" y="85" width="6" height="8" fill="#2A1F1A" />
                  <rect x="46" y="85" width="10" height="8" fill="#2E6349" />
                  <rect x="60" y="85" width="8" height="8" fill="#DD9F2F" />
                  <rect x="72" y="85" width="10" height="8" fill="#2E6349" />
                </svg>
              </div>

              {/* Merchant ID Pill & Copy */}
              <div className="mt-4 flex items-center gap-2 bg-[#FCFBF9] border-2 border-dashed border-[#2E6349]/40 px-3 py-2 rounded-xl">
                <span className="text-xs text-[#6B5E57]">Merchant ID:</span>
                <span className="text-sm font-black font-mono text-[#2E6349] tracking-wider">
                  {merchantProfile.merchantId}
                </span>
                <button
                  id="copy-merchant-id-btn"
                  onClick={copyMerchantId}
                  className="p-1 rounded-md hover:bg-black/5 text-[#2E6349] transition"
                  title="Copy Merchant ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-xs text-[#6B5E57] mt-3">
                Farmers can scan this QR code or enter your 11-digit Merchant ID in their Farmer Portal to connect and sync daily sales.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6B5E57] pb-1 border-b border-[#E8E2D9]">
                <span>Pending Grower Requests</span>
                <span>{pendingRequests.length} pending</span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-[#6B5E57]">
                  <UserCheck className="w-10 h-10 mx-auto text-[#2E6349]/40 mb-2" />
                  <p className="text-sm font-semibold text-[#2A1F1A]">All Connection Requests Handled</p>
                  <p className="text-xs mt-1">
                    When farmers search your Merchant ID ({merchantProfile.merchantId}) and request connection, they appear here.
                  </p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FCFBF9] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <h5 className="font-bold text-sm text-[#2A1F1A]">{req.farmerName}</h5>
                      <p className="text-xs text-[#6B5E57]">
                        📍 {req.farmerVillage} • Ph: {req.farmerPhone}
                      </p>
                      <p className="text-[10px] text-[#6B5E57]/80 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Requested: {req.requestDate}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        id={`accept-req-${req.id}`}
                        onClick={() => acceptConnectionRequest(req.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-semibold hover:bg-[#1F4532] transition flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        id={`decline-req-${req.id}`}
                        onClick={() => declineConnectionRequest(req.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition border border-rose-200"
                        title="Decline"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FCFBF9] border-t border-[#E8E2D9] flex justify-end">
          <button
            id="qr-modal-close-btn"
            onClick={() => setIsQRModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#E8E2D9] text-[#2A1F1A] font-semibold text-xs hover:bg-[#F4EFEA] transition"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
