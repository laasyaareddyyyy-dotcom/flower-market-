import React from 'react';
import { useMandi } from '../../context/MandiContext';
import { RaiseQueryForm } from './RaiseQueryForm';
import { MyTicketsList } from './MyTicketsList';
import { SupportAdminDashboard } from './SupportAdminDashboard';
import { MandiKnowledgeBase } from './MandiKnowledgeBase';
import {
  X,
  HelpCircle,
  PlusCircle,
  Ticket,
  Headphones,
  BookOpen,
  PhoneCall,
  MessageCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const HelpDeskModal: React.FC = () => {
  const {
    isHelpDeskOpen,
    setIsHelpDeskOpen,
    helpDeskTab,
    setHelpDeskTab,
    helpTickets,
    setSelectedHelpTicketId,
    t,
  } = useMandi();

  if (!isHelpDeskOpen) return null;

  const openTicketsCount = helpTickets.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress'
  ).length;

  const handleClose = () => {
    setIsHelpDeskOpen(false);
    setSelectedHelpTicketId(null);
  };

  return (
    <div
      id="help-desk-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        id="help-desk-modal-card"
        className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="bg-[#2E6349] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-lg">
              <Headphones className="w-5 h-5 text-[#DD9F2F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold leading-tight">
                  {t('helpDesk')}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                  2-Hour APMC SLA
                </span>
              </div>
              <p className="text-xs text-white/80">
                {t('helpDeskSubtitle')}
              </p>
            </div>
          </div>

          <button
            id="close-help-desk-modal-btn"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Mandi Helplines Sub-bar */}
        <div className="bg-[#F8F6F2] border-b border-[#E8E2D9] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B5E57] shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-[#2A1F1A]">
              <PhoneCall className="w-3.5 h-3.5 text-[#2E6349]" />
              <span>APMC Yard Helpline: <strong className="font-mono text-[#2E6349]">1800-425-6263</strong></span>
            </span>

            <span className="hidden sm:flex items-center gap-1.5 font-medium text-[#2A1F1A]">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp: <strong className="font-mono text-[#2A1F1A]">+91 94400 12345</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <Clock className="w-3 h-3 text-[#2E6349]" />
            <span>Mandi Hours: <strong>04:00 AM – 10:00 PM</strong></span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-white border-b border-[#E8E2D9] px-4 pt-2 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button
              id="helpdesk-tab-raise"
              type="button"
              onClick={() => {
                setSelectedHelpTicketId(null);
                setHelpDeskTab('raise');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
                helpDeskTab === 'raise'
                  ? 'border-[#2E6349] text-[#2E6349]'
                  : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('raiseQuery')}</span>
            </button>

            <button
              id="helpdesk-tab-my-tickets"
              type="button"
              onClick={() => {
                setSelectedHelpTicketId(null);
                setHelpDeskTab('my-tickets');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
                helpDeskTab === 'my-tickets'
                  ? 'border-[#2E6349] text-[#2E6349]'
                  : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>{t('myTickets')}</span>
              {openTicketsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#2E6349] text-white">
                  {openTicketsCount}
                </span>
              )}
            </button>

            <button
              id="helpdesk-tab-admin"
              type="button"
              onClick={() => {
                setSelectedHelpTicketId(null);
                setHelpDeskTab('admin-dashboard');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
                helpDeskTab === 'admin-dashboard'
                  ? 'border-[#2E6349] text-[#2E6349]'
                  : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>{t('supportAdmin')}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900">
                ADMIN
              </span>
            </button>

            <button
              id="helpdesk-tab-faq"
              type="button"
              onClick={() => {
                setSelectedHelpTicketId(null);
                setHelpDeskTab('faq');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
                helpDeskTab === 'faq'
                  ? 'border-[#2E6349] text-[#2E6349]'
                  : 'border-transparent text-[#6B5E57] hover:text-[#2A1F1A]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('knowledgeBase')}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#FCFBF9]">
          {helpDeskTab === 'raise' && (
            <RaiseQueryForm
              onSuccessNavigate={(ticketId) => {
                setSelectedHelpTicketId(ticketId);
                setHelpDeskTab('my-tickets');
              }}
            />
          )}

          {helpDeskTab === 'my-tickets' && (
            <MyTicketsList
              onRaiseNew={() => {
                setSelectedHelpTicketId(null);
                setHelpDeskTab('raise');
              }}
            />
          )}

          {helpDeskTab === 'admin-dashboard' && <SupportAdminDashboard />}

          {helpDeskTab === 'faq' && (
            <MandiKnowledgeBase
              onRaiseTicket={() => {
                setSelectedHelpTicketId(null);
                setHelpDeskTab('raise');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
