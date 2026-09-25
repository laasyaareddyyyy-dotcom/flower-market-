import React from 'react';
import {
  TrendingUp,
  PlusCircle,
  Users,
  Coins,
  Headphones,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';

export const MobileBottomNav: React.FC = () => {
  const {
    portalMode,
    merchantTab,
    setMerchantTab,
    t,
  } = useMandi();

  const isFarmerMode = portalMode === 'farmer';

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg no-print safe-bottom-padding"
    >
      <div className={`grid ${isFarmerMode ? 'grid-cols-3' : 'grid-cols-5'} max-w-4xl mx-auto items-center justify-around h-16 px-1`}>
        {/* 1. Dashboard */}
        <button
          type="button"
          id="mobile-tab-dashboard"
          onClick={() => setMerchantTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg cursor-pointer ${
            merchantTab === 'dashboard'
              ? 'text-[#1a3a52] font-black'
              : 'text-slate-500 hover:text-[#1e293b]'
          }`}
        >
          <TrendingUp className={`w-5 h-5 ${merchantTab === 'dashboard' ? 'stroke-[2.5] text-[#1a3a52]' : ''}`} />
          <span className="text-[10px] sm:text-xs mt-0.5 leading-none font-semibold">
            {t('tabDashboard')}
          </span>
        </button>

        {/* 2. New Sale (Merchant Only) */}
        {!isFarmerMode && (
          <button
            type="button"
            id="mobile-tab-new-sale"
            onClick={() => setMerchantTab('new-sale')}
            className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg cursor-pointer ${
              merchantTab === 'new-sale'
                ? 'text-[#1a3a52] font-black'
                : 'text-slate-500 hover:text-[#1e293b]'
            }`}
          >
            <PlusCircle className={`w-5 h-5 ${merchantTab === 'new-sale' ? 'stroke-[2.5] text-[#1a3a52]' : ''}`} />
            <span className="text-[10px] sm:text-xs mt-0.5 leading-none font-semibold">
              {t('tabNewSale')}
            </span>
          </button>
        )}

        {/* 3. Farmer Khata */}
        <button
          type="button"
          id="mobile-tab-farmers"
          onClick={() => setMerchantTab('farmers')}
          className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg cursor-pointer ${
            merchantTab === 'farmers'
              ? 'text-[#1a3a52] font-black'
              : 'text-slate-500 hover:text-[#1e293b]'
          }`}
        >
          <Users className={`w-5 h-5 ${merchantTab === 'farmers' ? 'stroke-[2.5] text-[#1a3a52]' : ''}`} />
          <span className="text-[10px] sm:text-xs mt-0.5 leading-none font-semibold">
            {t('tabFarmers')}
          </span>
        </button>

        {/* 4. Payments (Merchant Only) */}
        {!isFarmerMode && (
          <button
            type="button"
            id="mobile-tab-payments"
            onClick={() => setMerchantTab('payments')}
            className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg cursor-pointer ${
              merchantTab === 'payments'
                ? 'text-[#1a3a52] font-black'
                : 'text-slate-500 hover:text-[#1e293b]'
            }`}
          >
            <Coins className={`w-5 h-5 ${merchantTab === 'payments' ? 'stroke-[2.5] text-[#1a3a52]' : ''}`} />
            <span className="text-[10px] sm:text-xs mt-0.5 leading-none font-semibold">
              {t('tabPayments')}
            </span>
          </button>
        )}

        {/* 5. Support */}
        <button
          type="button"
          id="mobile-tab-support"
          onClick={() => setMerchantTab('support')}
          className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg cursor-pointer ${
            merchantTab === 'support'
              ? 'text-[#1a3a52] font-black'
              : 'text-slate-500 hover:text-[#1e293b]'
          }`}
        >
          <Headphones className={`w-5 h-5 ${merchantTab === 'support' ? 'stroke-[2.5] text-[#1a3a52]' : ''}`} />
          <span className="text-[10px] sm:text-xs mt-0.5 leading-none font-semibold">
            {t('helpDesk')}
          </span>
        </button>
      </div>
    </nav>
  );
};
