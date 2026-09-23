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
    language,
  } = useMandi();

  const isFarmerMode = portalMode === 'farmer';

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg no-print safe-bottom-padding"
    >
      <div className={`grid ${isFarmerMode ? 'grid-cols-3' : 'grid-cols-5'} items-center justify-around h-16 px-1`}>
        {/* 1. Dashboard */}
        <button
          type="button"
          id="mobile-tab-dashboard"
          onClick={() => setMerchantTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg ${
            merchantTab === 'dashboard'
              ? 'text-[#1a3a52] font-black'
              : 'text-slate-500 hover:text-[#1e293b]'
          }`}
        >
          <TrendingUp className={`w-5 h-5 ${merchantTab === 'dashboard' ? 'stroke-[2.5] text-[#1a3a52]' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-none">
            {language === 'te' ? 'డాష్‌బోర్డ్' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
          </span>
        </button>

        {/* 2. New Sale (Merchant Only) */}
        {!isFarmerMode && (
          <button
            type="button"
            id="mobile-tab-new-sale"
            onClick={() => setMerchantTab('new-sale')}
            className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg ${
              merchantTab === 'new-sale'
                ? 'text-[#1a3a52] font-black'
                : 'text-slate-500 hover:text-[#1e293b]'
            }`}
          >
            <PlusCircle className={`w-5 h-5 ${merchantTab === 'new-sale' ? 'stroke-[2.5] text-[#1a3a52]' : ''}`} />
            <span className="text-[10px] mt-0.5 leading-none">
              {language === 'te' ? 'కొత్త లావాదేవీ' : language === 'hi' ? 'नई बिक्री' : 'New Sale'}
            </span>
          </button>
        )}

        {/* 3. Farmer Khata */}
        <button
          type="button"
          id="mobile-tab-farmers"
          onClick={() => setMerchantTab('farmers')}
          className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg ${
            merchantTab === 'farmers'
              ? 'text-[#1a3a52] font-black'
              : 'text-slate-500 hover:text-[#1e293b]'
          }`}
        >
          <Users className={`w-5 h-5 ${merchantTab === 'farmers' ? 'stroke-[2.5] text-[#1a3a52]' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-none">
            {language === 'te' ? 'రైతు ఖాతా' : language === 'hi' ? 'खाता विवरण' : 'Farmer Khata'}
          </span>
        </button>

        {/* 4. Payments (Merchant Only) */}
        {!isFarmerMode && (
          <button
            type="button"
            id="mobile-tab-payments"
            onClick={() => setMerchantTab('payments')}
            className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg ${
              merchantTab === 'payments'
                ? 'text-[#1a3a52] font-black'
                : 'text-slate-500 hover:text-[#1e293b]'
            }`}
          >
            <Coins className={`w-5 h-5 ${merchantTab === 'payments' ? 'stroke-[2.5] text-[#1a3a52]' : ''}`} />
            <span className="text-[10px] mt-0.5 leading-none">
              {language === 'te' ? 'చెల్లింపులు' : language === 'hi' ? 'भुगतान' : 'Payments'}
            </span>
          </button>
        )}

        {/* 5. Support */}
        <button
          type="button"
          id="mobile-tab-support"
          onClick={() => setMerchantTab('support')}
          className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg ${
            merchantTab === 'support'
              ? 'text-[#1a3a52] font-black'
              : 'text-slate-500 hover:text-[#1e293b]'
          }`}
        >
          <Headphones className={`w-5 h-5 ${merchantTab === 'support' ? 'stroke-[2.5] text-[#1a3a52]' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-none">
            {language === 'te' ? 'సపోర్ట్' : language === 'hi' ? 'सपोर्ट' : 'Support'}
          </span>
        </button>
      </div>
    </nav>
  );
};
