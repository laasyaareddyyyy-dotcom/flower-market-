import React, { useState } from 'react';
import { MANDI_FAQS } from '../../data/initialData';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Printer,
  FileText,
  Calculator,
  Wifi,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

export const MandiKnowledgeBase: React.FC<{
  onRaiseTicket: () => void;
}> = ({ onRaiseTicket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  const categories = ['All', 'Printing & Parchis', 'Farmer Khata & Ledger', '15-Day Settlements', 'Offline & Backups', 'APMC Mandi Rules'];

  const filteredFaqs = MANDI_FAQS.filter((faq) => {
    if (selectedCategory !== 'All' && faq.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ = faq.question.toLowerCase().includes(q);
      const matchA = faq.answer.toLowerCase().includes(q);
      return matchQ || matchA;
    }
    return true;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Search & Category Pills */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#6B5E57]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, printing rules, settlements, APMC Form C..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-medium bg-white focus:outline-none focus:border-[#2E6349] focus:ring-1 focus:ring-[#2E6349]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2E6349] text-white shadow-2xs'
                  : 'bg-white border border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-2">
        {filteredFaqs.length === 0 ? (
          <div className="py-8 text-center bg-white rounded-xl border border-[#E8E2D9] text-xs text-[#6B5E57]">
            No FAQ entries found for "{searchQuery}".
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;

            return (
              <div
                key={faq.id}
                className="rounded-xl border border-[#E8E2D9] bg-white overflow-hidden shadow-2xs transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 hover:bg-[#FCFBF9] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#E9F3EE] text-[#2E6349] flex items-center justify-center font-bold text-xs shrink-0">
                      ?
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-[#2E6349] uppercase tracking-wider block">
                        {faq.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2A1F1A] leading-snug">
                        {faq.question}
                      </h4>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#2E6349] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B5E57] shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#6B5E57] leading-relaxed border-t border-[#E8E2D9]/50 bg-[#FCFBF9]/60">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still need help callout */}
      <div className="p-4 rounded-xl bg-[#E9F3EE] border border-[#2E6349]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[#2E6349]">
            Didn't find an answer to your query?
          </h4>
          <p className="text-xs text-[#2E6349]/80 mt-0.5">
            Our APMC Mandi Support Desk team is ready to assist you.
          </p>
        </div>

        <button
          type="button"
          onClick={onRaiseTicket}
          className="px-4 py-2 rounded-xl bg-[#2E6349] hover:bg-[#1F4532] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise Support Ticket</span>
        </button>
      </div>
    </div>
  );
};
