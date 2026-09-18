import React, { useState } from 'react';
import {
  Calendar,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { getTodayDateString, getPastDateString, formatDisplayDate } from '../../data/initialData';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { sounds } from '../../utils/audio';

export const DateSwitcherModal: React.FC = () => {
  const {
    isDateSwitcherOpen,
    setIsDateSwitcherOpen,
    activeSessionDate,
    setActiveSessionDate,
    lots,
    startNewDaySession,
    clearDateLots,
    setMerchantTab,
    t,
  } = useMandi();

  const [customDate, setCustomDate] = useState<string>(activeSessionDate);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);

  if (!isDateSwitcherOpen) return null;

  const todayStr = getTodayDateString();
  const yesterdayStr = getPastDateString(1);
  const twoDaysAgoStr = getPastDateString(2);

  const getCountForDate = (d: string) => lots.filter((l) => l.date === d).length;

  const handleSelectDate = (date: string) => {
    setActiveSessionDate(date);
    setCustomDate(date);
    setShowSuccessToast(`Active trading date set to ${formatDisplayDate(date)}`);
    setTimeout(() => {
      setShowSuccessToast(null);
      setIsDateSwitcherOpen(false);
    }, 900);
  };

  const handleStartFreshDay = () => {
    startNewDaySession(todayStr);
    setCustomDate(todayStr);
    setShowSuccessToast(`Fresh morning session activated for today! New sales is clean & ready.`);
    setTimeout(() => {
      setShowSuccessToast(null);
      setIsDateSwitcherOpen(false);
    }, 1200);
  };

  const handleClearCurrentSessionLots = () => {
    setIsClearConfirmOpen(true);
  };

  const handleConfirmClearLots = () => {
    clearDateLots(activeSessionDate);
    sounds.playTrashSound?.();
    setIsClearConfirmOpen(false);
    setShowSuccessToast(`Session refreshed. New sales for ${formatDisplayDate(activeSessionDate)} is now empty.`);
    setTimeout(() => {
      setShowSuccessToast(null);
    }, 1500);
  };

  const activeDateLotCount = getCountForDate(activeSessionDate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#2E6349] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#DD9F2F]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Mandi Trading Session Date
              </h3>
              <p className="text-xs text-white/80">
                Manage daily auction dates & morning session rollover
              </p>
            </div>
          </div>
          <button
            id="close-date-switcher-btn"
            onClick={() => setIsDateSwitcherOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 bg-[#FCFBF9]">
          {/* Toast feedback */}
          {showSuccessToast && (
            <div className="p-3 rounded-xl bg-[#E9F3EE] border border-[#2E6349]/30 text-[#2E6349] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{showSuccessToast}</span>
            </div>
          )}

          {/* Current Active Status Card */}
          <div className="p-4 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B5E57] block">
              Current Active Trading Session
            </span>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-lg font-black text-[#2A1F1A]">
                  {formatDisplayDate(activeSessionDate)}
                </span>
                <span className="block font-mono text-xs text-[#6B5E57]">
                  {activeSessionDate} {activeSessionDate === todayStr ? '(Today)' : ''}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    activeDateLotCount === 0
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-[#E9F3EE] text-[#2E6349] border border-[#2E6349]/30'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {activeDateLotCount === 0 ? '0 Lots (Fresh Session)' : `${activeDateLotCount} Lots Recorded`}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57] block">
              Quick Switch Dates
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Today */}
              <button
                type="button"
                id="select-today-btn"
                onClick={() => handleSelectDate(todayStr)}
                className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                  activeSessionDate === todayStr
                    ? 'bg-[#E9F3EE] border-[#2E6349] text-[#2E6349] shadow-2xs'
                    : 'bg-white border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs">Today</span>
                  {activeSessionDate === todayStr && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6349]" />}
                </div>
                <span className="text-[11px] font-mono text-[#6B5E57] mt-1">{todayStr}</span>
                <span className="text-[10px] font-bold mt-2 text-[#2E6349]">
                  {getCountForDate(todayStr) === 0 ? '✨ 0 lots (Empty)' : `${getCountForDate(todayStr)} lots`}
                </span>
              </button>

              {/* Yesterday */}
              <button
                type="button"
                id="select-yesterday-btn"
                onClick={() => handleSelectDate(yesterdayStr)}
                className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                  activeSessionDate === yesterdayStr
                    ? 'bg-[#E9F3EE] border-[#2E6349] text-[#2E6349] shadow-2xs'
                    : 'bg-white border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs">Yesterday</span>
                  {activeSessionDate === yesterdayStr && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6349]" />}
                </div>
                <span className="text-[11px] font-mono text-[#6B5E57] mt-1">{yesterdayStr}</span>
                <span className="text-[10px] font-bold mt-2 text-[#6B5E57]">
                  {getCountForDate(yesterdayStr)} lots archived
                </span>
              </button>

              {/* 2 Days Ago */}
              <button
                type="button"
                id="select-twodaysago-btn"
                onClick={() => handleSelectDate(twoDaysAgoStr)}
                className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                  activeSessionDate === twoDaysAgoStr
                    ? 'bg-[#E9F3EE] border-[#2E6349] text-[#2E6349] shadow-2xs'
                    : 'bg-white border-[#E8E2D9] text-[#2A1F1A] hover:bg-[#F4EFEA]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs">2 Days Ago</span>
                  {activeSessionDate === twoDaysAgoStr && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6349]" />}
                </div>
                <span className="text-[11px] font-mono text-[#6B5E57] mt-1">{twoDaysAgoStr}</span>
                <span className="text-[10px] font-bold mt-2 text-[#6B5E57]">
                  {getCountForDate(twoDaysAgoStr)} lots archived
                </span>
              </button>
            </div>
          </div>

          {/* Pick Custom Calendar Date */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D9] space-y-2">
            <label className="text-xs font-bold text-[#2A1F1A] block">
              Or Choose Any Specific Trading Date
            </label>
            <div className="flex items-center gap-2">
              <input
                id="custom-session-date-input"
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#E8E2D9] text-xs font-mono bg-[#FCFBF9] focus:outline-hidden focus:border-[#2E6349]"
              />
              <button
                type="button"
                id="apply-custom-date-btn"
                onClick={() => handleSelectDate(customDate)}
                className="px-4 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition whitespace-nowrap"
              >
                Set Date
              </button>
            </div>
          </div>

          {/* Every Day Refresh Assurance Section */}
          <div className="p-4 rounded-xl bg-[#FEF8ED] border border-[#DD9F2F]/40 space-y-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-[#DD9F2F] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#2A1F1A]">
                  Everyday Mandi Trading Cycle
                </h4>
                <p className="text-[11px] text-[#6B5E57] leading-relaxed mt-0.5">
                  Every new morning opens with a <strong>refreshed & empty</strong> New Sales entry screen, ready for the day&apos;s flower auctions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#2A1F1A]">
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-[#E8E2D9]">
                <Users className="w-3.5 h-3.5 text-[#2E6349]" />
                <span>Farmers data & dues remain safe</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-[#E8E2D9]">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#DD9F2F]" />
                <span>Past reports & PDFs preserved</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                id="start-fresh-day-btn"
                onClick={handleStartFreshDay}
                className="flex-1 px-3 py-2 rounded-xl bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#DD9F2F]" />
                <span>Start Fresh Day for Today</span>
              </button>

              {activeDateLotCount > 0 && (
                <button
                  type="button"
                  id="clear-session-lots-btn"
                  onClick={handleClearCurrentSessionLots}
                  className="px-3 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition flex items-center gap-1"
                  title="Clear today's test lots to see empty morning state"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Refresh {activeSessionDate === todayStr ? 'Today' : 'Date'} (Empty)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#F4EFEA] border-t border-[#E8E2D9] flex items-center justify-between text-xs text-[#6B5E57]">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E6349]" />
            <span>Single-Day Session Isolation</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setIsDateSwitcherOpen(false);
              setMerchantTab('reports');
            }}
            className="text-[#2E6349] font-bold hover:underline flex items-center gap-1 text-xs"
          >
            <span>Open All Historical Reports</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isClearConfirmOpen}
        title="Clear Trading Session Consignments"
        itemName={`Session Date: ${formatDisplayDate(activeSessionDate)}`}
        itemDetails={`${activeDateLotCount} consignment lots currently recorded for this day will be cleared.`}
        message={`Are you sure you want to clear all ${activeDateLotCount} recorded lots for ${formatDisplayDate(activeSessionDate)}? All farmer accounts, previous reports, and payment logs remain safe.`}
        confirmText="CONFIRM CLEAR"
        cancelText="CANCEL"
        onConfirm={handleConfirmClearLots}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
};
