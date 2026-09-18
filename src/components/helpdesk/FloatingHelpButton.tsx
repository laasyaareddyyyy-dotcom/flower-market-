import React, { useState } from 'react';
import { useMandi } from '../../context/MandiContext';
import {
  HelpCircle,
  Headphones,
  PlusCircle,
  Ticket,
  BookOpen,
  PhoneCall,
  X,
  Sparkles,
} from 'lucide-react';

export const FloatingHelpButton: React.FC = () => {
  const { openHelpDesk, helpTickets, isHelpDeskOpen } = useMandi();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isHelpDeskOpen) return null;

  const openCount = helpTickets.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress'
  ).length;

  return (
    <div
      id="floating-help-desk-container"
      className="no-print fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2"
    >
      {/* Quick Menu Popover */}
      {isMenuOpen && (
        <div
          id="floating-help-menu"
          className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xl p-2 w-60 space-y-1 animate-in fade-in slide-in-from-bottom-3 duration-150 mb-1 text-xs"
        >
          <div className="p-2 border-b border-[#E8E2D9] flex items-center justify-between">
            <span className="font-bold text-[#2A1F1A] flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-[#2E6349]" />
              <span>PhoolMitra Support</span>
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-[#6B5E57] hover:text-[#2A1F1A] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="floating-raise-ticket-btn"
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              openHelpDesk('raise');
            }}
            className="w-full p-2 rounded-xl text-left hover:bg-[#E9F3EE] hover:text-[#2E6349] font-semibold text-[#2A1F1A] flex items-center gap-2 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#2E6349]" />
            <div>
              <span className="block font-bold">Raise Support Ticket</span>
              <span className="text-[10px] text-[#6B5E57] font-normal">Fast 2-hour APMC resolution</span>
            </div>
          </button>

          <button
            id="floating-my-tickets-btn"
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              openHelpDesk('my-tickets');
            }}
            className="w-full p-2 rounded-xl text-left hover:bg-[#E9F3EE] hover:text-[#2E6349] font-semibold text-[#2A1F1A] flex items-center justify-between gap-2 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#2E6349]" />
              <div>
                <span className="block font-bold">Track My Tickets</span>
                <span className="text-[10px] text-[#6B5E57] font-normal">Check status & reply</span>
              </div>
            </div>
            {openCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#2E6349] text-white text-[10px] font-bold">
                {openCount}
              </span>
            )}
          </button>

          <button
            id="floating-admin-btn"
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              openHelpDesk('admin-dashboard');
            }}
            className="w-full p-2 rounded-xl text-left hover:bg-[#E9F3EE] hover:text-[#2E6349] font-semibold text-[#2A1F1A] flex items-center gap-2 transition cursor-pointer"
          >
            <Headphones className="w-4 h-4 text-amber-700" />
            <div>
              <span className="block font-bold">Support Admin Desk</span>
              <span className="text-[10px] text-[#6B5E57] font-normal">Staff & ticket dashboard</span>
            </div>
          </button>

          <button
            id="floating-faq-btn"
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              openHelpDesk('faq');
            }}
            className="w-full p-2 rounded-xl text-left hover:bg-[#E9F3EE] hover:text-[#2E6349] font-semibold text-[#2A1F1A] flex items-center gap-2 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#2E6349]" />
            <div>
              <span className="block font-bold">Mandi FAQs & Guides</span>
              <span className="text-[10px] text-[#6B5E57] font-normal">Thermal printer, Form C</span>
            </div>
          </button>
        </div>
      )}

      {/* Main Floating Action Button */}
      <button
        id="floating-help-desk-trigger-btn"
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="group relative flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-[#2E6349] hover:bg-[#1F4532] text-white shadow-xl hover:shadow-2xl border-2 border-white transition-all transform hover:scale-105 cursor-pointer"
        title="Need Help? APMC Mandi Support Desk"
      >
        <Headphones className="w-5 h-5 text-[#DD9F2F]" />
        <span className="font-bold text-xs tracking-wide">Help Desk</span>

        {openCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white font-mono font-black text-[10px] flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
            {openCount}
          </span>
        )}
      </button>
    </div>
  );
};
