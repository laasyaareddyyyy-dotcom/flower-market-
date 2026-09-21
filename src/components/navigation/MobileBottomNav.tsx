import React from 'react';
import {
  TrendingUp,
  PlusCircle,
  Users,
  Coins,
  FileSpreadsheet,
  Receipt,
  BookOpen,
  Store,
  ArrowRightLeft,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { MerchantTab } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const {
    portalMode,
    setPortalMode,
    merchantTab,
    setMerchantTab,
    language,
    t,
  } = useMandi();

  return (
    <div
      id="mobile-bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E2D9] shadow-lg no-print safe-bottom-padding"
    >
      {portalMode === 'merchant' ? (
        <div className="grid grid-cols-5 items-center justify-around h-14 px-1">
          {/* 1. Dashboard */}
          <button
            type="button"
            id="mobile-tab-dashboard"
            onClick={() => setMerchantTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg ${
              merchantTab === 'dashboard'
                ? 'text-[#2E6349] font-black'
                : 'text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${merchantTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 leading-none">
              {language === 'te' ? 'హోమ్' : 'Home'}
            </span>
          </button>

          {/* 2. Farmers */}
          <button
            type="button"
            id="mobile-tab-farmers"
            onClick={() => setMerchantTab('farmers')}
            className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg ${
              merchantTab === 'farmers'
                ? 'text-[#2E6349] font-black'
                : 'text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <Users className={`w-5 h-5 ${merchantTab === 'farmers' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 leading-none">
              {language === 'te' ? 'రైతులు' : 'Farmers'}
            </span>
          </button>

          {/* 3. New Sale (Prominent Center Button) */}
          <button
            type="button"
            id="mobile-tab-new-sale"
            onClick={() => setMerchantTab('new-sale')}
            className="flex flex-col items-center justify-center -mt-3 min-touch-target group"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition transform group-active:scale-95 ${
                merchantTab === 'new-sale'
                  ? 'bg-[#2E6349] text-white ring-4 ring-[#E9F3EE]'
                  : 'bg-gradient-to-tr from-[#2E6349] to-[#3a7c5b] text-white ring-2 ring-white'
              }`}
            >
              <PlusCircle className="w-6 h-6 text-[#DD9F2F]" />
            </div>
            <span className="text-[10px] font-bold text-[#2E6349] mt-0.5 leading-none">
              {language === 'te' ? 'నూతన పర్చి' : '+ Sale'}
            </span>
          </button>

          {/* 4. Payments */}
          <button
            type="button"
            id="mobile-tab-payments"
            onClick={() => setMerchantTab('payments')}
            className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg ${
              merchantTab === 'payments'
                ? 'text-[#2E6349] font-black'
                : 'text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <Coins className={`w-5 h-5 ${merchantTab === 'payments' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 leading-none">
              {language === 'te' ? 'చెల్లింపులు' : 'Payments'}
            </span>
          </button>

          {/* 5. Reports */}
          <button
            type="button"
            id="mobile-tab-reports"
            onClick={() => setMerchantTab('reports')}
            className={`flex flex-col items-center justify-center py-1 transition min-touch-target rounded-lg ${
              merchantTab === 'reports'
                ? 'text-[#2E6349] font-black'
                : 'text-[#6B5E57] hover:text-[#2A1F1A]'
            }`}
          >
            <FileSpreadsheet className={`w-5 h-5 ${merchantTab === 'reports' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 leading-none">
              {language === 'te' ? 'రిపోర్ట్స్' : 'Reports'}
            </span>
          </button>
        </div>
      ) : portalMode === 'farmer' ? (
        <div className="flex items-center justify-around h-14 px-2">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#2A1F1A]">
              {language === 'te' ? 'రైతు డిజిటల్ పాస్‌బుక్' : 'Farmer Passbook Mode'}
            </span>
          </div>

          <button
            type="button"
            id="farmer-bottom-switch-merchant-btn"
            onClick={() => setPortalMode('merchant')}
            className="px-3 py-1.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs min-touch-target cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#DD9F2F]" />
            <span>{language === 'te' ? 'వ్యాపారి పోర్టల్' : 'Merchant Mode'}</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between h-14 px-4">
          <span className="text-xs font-semibold text-[#2A1F1A]">
            System Architecture Flowchart
          </span>
          <button
            type="button"
            onClick={() => setPortalMode('merchant')}
            className="px-3 py-1.5 rounded-xl bg-[#2E6349] text-white text-xs font-bold transition flex items-center gap-1.5 min-touch-target"
          >
            <span>Back to Ledger</span>
          </button>
        </div>
      )}
    </div>
  );
};
