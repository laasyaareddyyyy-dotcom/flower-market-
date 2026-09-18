/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MandiProvider, useMandi } from './context/MandiContext';
import { Navbar } from './components/common/Navbar';
import { ParchiModal } from './components/common/ParchiModal';
import { GeneratePdfModal } from './components/common/GeneratePdfModal';
import { QRModal } from './components/common/QRModal';
import { SettingsModal } from './components/merchant/SettingsModal';
import { DateSwitcherModal } from './components/common/DateSwitcherModal';
import { ParchiAuditTrailModal } from './components/merchant/ParchiAuditTrailModal';
import { OwnerSignUpModal } from './components/merchant/OwnerSignUpModal';
import { FarmerSignUpModal } from './components/farmer/FarmerSignUpModal';
import { DashboardView } from './components/merchant/DashboardView';
import { NewSaleView } from './components/merchant/NewSaleView';
import { FarmersView } from './components/merchant/FarmersView';
import { PaymentsView } from './components/merchant/PaymentsView';
import { ReportsView } from './components/merchant/ReportsView';
import { SettlementView } from './components/merchant/SettlementView';
import { FarmerPortalView } from './components/farmer/FarmerPortalView';
import { FlowchartView } from './components/flowchart/FlowchartView';
import { OnboardingAuthScreen } from './components/auth/OnboardingAuthScreen';
import { HelpDeskModal } from './components/helpdesk/HelpDeskModal';
import { FloatingHelpButton } from './components/helpdesk/FloatingHelpButton';
import {
  TrendingUp,
  PlusCircle,
  Users,
  Coins,
  FileSpreadsheet,
  Calculator,
  Wifi,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { MerchantTab } from './types';

const MainLayout: React.FC = () => {
  const {
    portalMode,
    merchantTab,
    setMerchantTab,
    merchantProfile,
    isOwnerSignUpOpen,
    setIsOwnerSignUpOpen,
    isFarmerSignUpOpen,
    setIsFarmerSignUpOpen,
    isGeneratePdfOpen,
    setIsGeneratePdfOpen,
    activePdfLot,
    setActivePdfLot,
    t,
  } = useMandi();

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('phoolmitra_onboarding_completed') === 'true';
    } catch {
      return false;
    }
  });

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingAuthScreen
        onComplete={() => setHasCompletedOnboarding(true)}
      />
    );
  }

  const merchantTabsList: { id: MerchantTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: t('tabDashboard'),
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'new-sale',
      label: t('tabNewSale'),
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      id: 'farmers',
      label: t('tabFarmers'),
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'payments',
      label: t('tabPayments'),
      icon: <Coins className="w-4 h-4" />,
    },
    {
      id: 'settlement',
      label: t('tabSettlement'),
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: t('tabReports'),
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#2A1F1A] flex flex-col font-sans">
      {/* Top Fixed Header Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* If in Merchant Portal, show Merchant Sub-Navigation Tabs */}
        {portalMode === 'merchant' && (
          <div className="no-print bg-white rounded-2xl border border-[#E8E2D9] p-1.5 shadow-2xs overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {merchantTabsList.map((tab) => {
                const isActive = merchantTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`subnav-tab-${tab.id}`}
                    onClick={() => setMerchantTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-[#2E6349] text-white shadow-2xs'
                        : 'text-[#2A1F1A] hover:bg-[#FCFBF9] hover:text-[#2E6349]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* View Switcher based on portal mode and tab */}
        {portalMode === 'farmer' ? (
          <FarmerPortalView />
        ) : portalMode === 'flowchart' ? (
          <FlowchartView />
        ) : (
          <>
            {merchantTab === 'dashboard' && <DashboardView />}
            {merchantTab === 'new-sale' && <NewSaleView />}
            {merchantTab === 'farmers' && <FarmersView />}
            {merchantTab === 'payments' && <PaymentsView />}
            {merchantTab === 'settlement' && <SettlementView />}
            {merchantTab === 'reports' && <ReportsView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-[#E8E2D9] py-4 px-4 sm:px-6 text-xs text-[#6B5E57] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2A1F1A]">PhoolMitra (పూల మిత్ర / फूलमित्र)</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#2E6349] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Wholesale Form C Adathiya Ledger</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-mono text-[11px] text-[#2E6349] bg-[#E9F3EE] px-2 py-0.5 rounded-full">
              <Wifi className="w-3 h-3" />
              <span>Offline-First (Browser Stored)</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ParchiModal />
      <GeneratePdfModal
        isOpen={isGeneratePdfOpen}
        onClose={() => {
          setIsGeneratePdfOpen(false);
          setActivePdfLot(null);
        }}
        lot={activePdfLot}
      />
      <QRModal />
      <SettingsModal />
      <DateSwitcherModal />
      <ParchiAuditTrailModal />
      <OwnerSignUpModal
        isOpen={isOwnerSignUpOpen}
        onClose={() => setIsOwnerSignUpOpen(false)}
        />
      <FarmerSignUpModal
        isOpen={isFarmerSignUpOpen}
        onClose={() => setIsFarmerSignUpOpen(false)}
      />
      <HelpDeskModal />
      <FloatingHelpButton />
    </div>
  );
};

export default function App() {
  return (
    <MandiProvider>
      <MainLayout />
    </MandiProvider>
  );
}
