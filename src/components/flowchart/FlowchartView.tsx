import React, { useState } from 'react';
import {
  Workflow,
  Truck,
  Scale,
  Calculator,
  Printer,
  Coins,
  FileSpreadsheet,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';

interface FlowStep {
  id: number;
  title: string;
  teluguTitle: string;
  hindiTitle: string;
  stage: string;
  timeWindow: string;
  icon: React.ReactNode;
  shortDesc: string;
  detailedPoints: string[];
  apmcRule: string;
  actionTab?: 'dashboard' | 'new-sale' | 'farmers' | 'payments' | 'reports';
  actionLabel?: string;
}

export const FlowchartView: React.FC = () => {
  const { setPortalMode, setMerchantTab, t } = useMandi();
  const [activeStepId, setActiveStepId] = useState<number>(1);

  const steps: FlowStep[] = [
    {
      id: 1,
      title: 'Farmer Consignment Arrival',
      teluguTitle: 'రైతు సరుకు రాక',
      hindiTitle: 'किसान आवक एवं माल आगमन',
      stage: 'Arrival & Entry Gate',
      timeWindow: '04:00 AM – 07:00 AM',
      icon: <Truck className="w-6 h-6 text-[#2E6349]" />,
      shortDesc:
        'Flower growers from surrounding rural belts arrive at the APMC yard with fresh flower consignments in gunny bags, crates, or bunches.',
      detailedPoints: [
        'Vehicle verification at Mandi Yard check-post gate.',
        'Farmer unloads consignments at designated Adathiya Commission Stall.',
        'Immediate visual inspection of flower bloom freshness, petal damage, and moisture levels.',
      ],
      apmcRule:
        'All wholesale consignments entering the yard must be registered with an authorized APMC licensed commission agent.',
      actionTab: 'farmers',
      actionLabel: 'View Farmer Directory',
    },
    {
      id: 2,
      title: 'Kanta Weighing & Open Auction',
      teluguTitle: 'తూకం మరియు బహిరంగ వేలం',
      hindiTitle: 'कांटा तौल एवं खुली बोली',
      stage: 'Yard Weighbridge',
      timeWindow: '05:30 AM – 08:30 AM',
      icon: <Scale className="w-6 h-6 text-[#DD9F2F]" />,
      shortDesc:
        'Consignments are officially weighed on the electronic weighbridge (Kanta) and buyers (retailers, florists, event decorators) participate in rapid open auctions.',
      detailedPoints: [
        'Gross consignment weight recorded in Kilograms, Bags, Bunches, or Crates.',
        'Highest wholesale bid rate (₹ per unit) finalized by the Adathiya in open transparency.',
        'Weight deduction for tare (bag/crate container weight) recorded as per market guidelines.',
      ],
      apmcRule:
        'Auction rates must be transparently announced without secret underhand cloth negotiations.',
      actionTab: 'new-sale',
      actionLabel: 'Open Fast Lot Entry',
    },
    {
      id: 3,
      title: 'Itemized Expenditure & Commission Deduction',
      teluguTitle: 'కమీషన్ మరియు ఇతర ఖర్చుల మినహాయింపు',
      hindiTitle: 'कमीशन एवं अन्य खर्च कटौती',
      stage: 'Adathiya Accounting',
      timeWindow: 'Real-Time Calculation',
      icon: <Calculator className="w-6 h-6 text-[#2E6349]" />,
      shortDesc:
        'PhoolMitra automatically calculates the gross turnover and itemizes all statutory APMC deductions.',
      detailedPoints: [
        'Commission Fee: Standard rate (e.g. 10%) calculated transparently from Gross Total.',
        'Transport & Freight Charges deducted if merchant pre-paid grower freight.',
        'Hamali / Coolie loading-unloading fees and electronic Kanta weighing charges.',
        'APMC Market Cess and packaging box fees itemized separately with zero hidden math.',
      ],
      apmcRule:
        'Form C must explicitly separate commission charges from physical logistical expenses.',
      actionTab: 'new-sale',
      actionLabel: 'Test Calculations',
    },
    {
      id: 4,
      title: 'Mandi Form C Parchi Generation',
      teluguTitle: 'మండి రసీదు (పర్చే) జారీ',
      hindiTitle: 'मंडी पर्ची एवं डिजिटल बिल',
      stage: 'Thermal Print & WhatsApp',
      timeWindow: 'Instantaneous (Seconds)',
      icon: <Printer className="w-6 h-6 text-[#C2255C]" />,
      shortDesc:
        'High-speed generation of the official bilingual APMC Mandi Parchi with printable thermal slip and one-tap WhatsApp sharing.',
      detailedPoints: [
        'Thermal printer formatted (58mm/80mm) with high-contrast text for outdoor mandi sunlight.',
        'Unique serial lot identification number for every consignment.',
        'WhatsApp direct dispatch pre-filled in English, Telugu, or Hindi so the farmer receives immediate digital proof.',
      ],
      apmcRule:
        'A formal printed or digital purchase slip must be handed to the farmer before consignment leaves the shop.',
      actionTab: 'dashboard',
      actionLabel: 'Check Today\'s Parchis',
    },
    {
      id: 5,
      title: 'Farmer Settlement & Khata Ledger',
      teluguTitle: 'రైతు చెల్లింపు మరియు ఖాతా నిర్వహణ',
      hindiTitle: 'भुगतान निपटान एवं डिजिटल खाता',
      stage: 'Cash / UPI / Ledger',
      timeWindow: 'Morning Disbursement',
      icon: <Coins className="w-6 h-6 text-[#2E6349]" />,
      shortDesc:
        'Farmer Net Amount is either disbursed instantly in cash/UPI or credited to the farmer’s digital running khata ledger.',
      detailedPoints: [
        'Real-time status updates: Paid in Full, Partial Settlement, or Unpaid Balance.',
        'Automatic balance due tracking per farmer khata.',
        'Farmer can view their running ledger through the dedicated Farmer Passbook Portal.',
      ],
      apmcRule:
        'All payment vouchers and reference numbers (UTR) must be audited and accessible for APMC inspection.',
      actionTab: 'payments',
      actionLabel: 'Open Settlement Ledger',
    },
    {
      id: 6,
      title: 'APMC Archive, CRV CSV & Tax Audits',
      teluguTitle: 'మార్కెట్ కమిటీ ఆడిట్ మరియు రిపోర్ట్స్',
      hindiTitle: 'मंडी ऑडिट एवं दैनिक लेजर रिपोर्ट',
      stage: 'End of Day Reconciliation',
      timeWindow: '12:00 PM – 02:00 PM',
      icon: <FileSpreadsheet className="w-6 h-6 text-[#DD9F2F]" />,
      shortDesc:
        'Session closure reconciles daily morning turnover, commission earnings, and exports CRV spreadsheets and A4 formal PDF ledgers.',
      detailedPoints: [
        'The Dashboard isolates today’s session; all past dates are safely archived in Reports.',
        'One-click export of Mandi Commission Return Voucher (CRV) to Excel CSV.',
        'Official A4 APMC formal ledger sheet with signature areas for Merchant, Inspector, and Farmer.',
      ],
      apmcRule:
        'Commission merchants must maintain historical transaction books for APMC annual renewal compliance.',
      actionTab: 'reports',
      actionLabel: 'View Historical Reports',
    },
  ];

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];

  const handleStepAction = (tab?: 'dashboard' | 'new-sale' | 'farmers' | 'payments' | 'reports') => {
    if (tab) {
      setPortalMode('merchant');
      setMerchantTab(tab);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E2D9] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2E6349] uppercase tracking-wider mb-1">
            <Workflow className="w-4 h-4 text-[#DD9F2F]" />
            <span>Interactive Operational Flowchart</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2A1F1A]">
            APMC Wholesale Flower Mandi Lifecycle
          </h2>
          <p className="text-xs text-[#6B5E57] mt-0.5">
            Click any node below to explore the complete regulatory, financial, and logistical journey of a flower lot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPortalMode('merchant');
              setMerchantTab('new-sale');
            }}
            className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#DD9F2F]" />
            <span>Experience Fast Lot Entry</span>
          </button>
        </div>
      </div>

      {/* Horizontal Interactive Step Pipeline */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs overflow-x-auto">
        <div className="flex items-center min-w-[760px] justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute top-6 left-12 right-12 h-1 bg-[#E8E2D9] -z-0" />

          {steps.map((step) => {
            const isCurrent = step.id === activeStepId;
            const isCompleted = step.id < activeStepId;

            return (
              <button
                key={step.id}
                id={`flow-step-node-${step.id}`}
                onClick={() => setActiveStepId(step.id)}
                className={`relative z-10 flex flex-col items-center group transition focus:outline-hidden ${
                  isCurrent ? 'scale-105' : 'hover:scale-102'
                }`}
              >
                {/* Node Circle */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition border-2 shadow-2xs ${
                    isCurrent
                      ? 'bg-[#2E6349] text-white border-[#DD9F2F] ring-4 ring-[#2E6349]/20'
                      : isCompleted
                      ? 'bg-[#E9F3EE] text-[#2E6349] border-[#2E6349]'
                      : 'bg-white text-[#6B5E57] border-[#E8E2D9]'
                  }`}
                >
                  {step.icon}
                </div>

                {/* Step Number & Title */}
                <div className="mt-2 text-center max-w-[110px]">
                  <span
                    className={`text-[10px] font-bold block ${
                      isCurrent ? 'text-[#2E6349]' : 'text-[#6B5E57]'
                    }`}
                  >
                    Step 0{step.id}
                  </span>
                  <span
                    className={`text-xs font-bold leading-tight line-clamp-2 ${
                      isCurrent ? 'text-[#2A1F1A]' : 'text-[#6B5E57]'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Selected Step Interactive Inspection Card */}
      <div className="bg-white rounded-2xl border-2 border-[#2E6349]/40 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-3">
        {/* Left 2 Cols: Detailed Operational & Regulatory Breakdown */}
        <div className="lg:col-span-2 p-5 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4EFEA] pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#DD9F2F] bg-[#FEF8ED] px-2.5 py-1 rounded-md">
                Stage: {activeStep.stage}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#2A1F1A] mt-2">
                0{activeStep.id}. {activeStep.title}
              </h3>
              <p className="text-xs font-bold text-[#2E6349] mt-0.5">
                {activeStep.teluguTitle} • {activeStep.hindiTitle}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                Typical Mandi Window
              </span>
              <span className="font-mono font-bold text-xs text-[#2A1F1A] bg-[#FCFBF9] px-2.5 py-1 rounded border border-[#E8E2D9] inline-block mt-1">
                {activeStep.timeWindow}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#2A1F1A] font-medium leading-relaxed">
            {activeStep.shortDesc}
          </p>

          {/* Operational Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
              Key Mandatory Procedures & Calculations:
            </h4>
            <div className="space-y-2">
              {activeStep.detailedPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#2A1F1A]">
                  <CheckCircle2 className="w-4 h-4 text-[#2E6349] shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* APMC Legal Regulation Box */}
          <div className="p-4 rounded-xl bg-[#FEF8ED] border border-[#DD9F2F]/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#B45309] uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>APMC Act Statutory Mandate</span>
            </div>
            <p className="text-xs text-[#2A1F1A] leading-relaxed">
              {activeStep.apmcRule}
            </p>
          </div>
        </div>

        {/* Right 1 Col: Live Interactive Shortcut & Simulator Navigation */}
        <div className="bg-[#FCFBF9] border-t lg:border-t-0 lg:border-l border-[#E8E2D9] p-5 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[#2A1F1A]">
              Test Step in Live App
            </h4>
            <p className="text-xs text-[#6B5E57]">
              PhoolMitra implements every operational step in real-time. Jump straight into the corresponding functional module to see it in action.
            </p>

            {activeStep.actionTab && (
              <button
                id="flowchart-jump-action-btn"
                onClick={() => handleStepAction(activeStep.actionTab)}
                className="w-full py-3 rounded-xl bg-[#2E6349] text-white font-black text-xs hover:bg-[#1F4532] transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{activeStep.actionLabel}</span>
                <ArrowRight className="w-4 h-4 text-[#DD9F2F]" />
              </button>
            )}

            <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D9] space-y-2 text-xs">
              <span className="font-bold text-[#2A1F1A] block">High-Speed Mandi Shortcut:</span>
              <p className="text-[11px] text-[#6B5E57]">
                During fast 6 AM rush auctions, merchants use <strong>New Sale</strong> for under-10-second slip creation.
              </p>
            </div>
          </div>

          {/* Next / Previous Step Switchers */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#E8E2D9]">
            <button
              disabled={activeStepId === 1}
              onClick={() => setActiveStepId((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A] disabled:opacity-40 hover:bg-white"
            >
              ← Previous Step
            </button>

            <span className="text-xs font-mono text-[#6B5E57]">
              {activeStepId} of {steps.length}
            </span>

            <button
              disabled={activeStepId === steps.length}
              onClick={() => setActiveStepId((prev) => Math.min(steps.length, prev + 1))}
              className="px-3 py-1.5 rounded-lg bg-[#2E6349] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#1F4532]"
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
