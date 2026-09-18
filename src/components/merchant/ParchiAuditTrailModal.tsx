import React, { useState, useMemo } from 'react';
import {
  History,
  Printer,
  X,
  Search,
  RotateCcw,
  Trash2,
  Download,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Receipt,
  CheckCircle,
} from 'lucide-react';
import { useMandi } from '../../context/MandiContext';
import { ParchiAuditLog } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { sounds } from '../../utils/audio';

export const ParchiAuditTrailModal: React.FC = () => {
  const {
    isAuditTrailOpen,
    setIsAuditTrailOpen,
    parchiAuditLogs,
    restoreParchiFromAudit,
    clearParchiAuditLogs,
    setSelectedParchiLot,
    merchantProfile,
    t,
  } = useMandi();

  const [searchQuery, setSearchQuery] = useState('');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return parchiAuditLogs;
    const q = searchQuery.toLowerCase().trim();
    return parchiAuditLogs.filter(
      (log) =>
        log.parchiNumber.toLowerCase().includes(q) ||
        log.farmerName.toLowerCase().includes(q) ||
        log.farmerPhone.toLowerCase().includes(q) ||
        log.farmerVillage.toLowerCase().includes(q) ||
        log.flowerVariety.toLowerCase().includes(q)
    );
  }, [parchiAuditLogs, searchQuery]);

  const totalValueRemoved = useMemo(() => {
    return parchiAuditLogs.reduce((acc, log) => acc + (log.farmerNetPayable || 0), 0);
  }, [parchiAuditLogs]);

  if (!isAuditTrailOpen) return null;

  const handleRestore = (log: ParchiAuditLog) => {
    const success = restoreParchiFromAudit(log.id);
    if (success) {
      setRestoredId(log.id);
      setTimeout(() => setRestoredId(null), 3000);
    }
  };

  const handlePreviewSlip = (log: ParchiAuditLog) => {
    if (log.archivedLot) {
      setSelectedParchiLot(log.archivedLot);
      setIsAuditTrailOpen(false);
    }
  };

  const exportAuditCSV = () => {
    if (parchiAuditLogs.length === 0) return;
    const headers = [
      'Parchi Number',
      'Original Date',
      'Original Time',
      'Farmer Name',
      'Village',
      'Phone',
      'Flower Variety',
      'Boxes',
      'Quantity',
      'Unit',
      'Rate',
      'Gross Total',
      'Commission',
      'Farmer Net',
      'Payment Status',
      'Printed At',
      'Removed At',
      'Action By',
      'Reason',
    ];

    const rows = parchiAuditLogs.map((l) => [
      l.parchiNumber,
      l.parchiDate,
      l.parchiTime,
      `"${l.farmerName.replace(/"/g, '""')}"`,
      `"${l.farmerVillage.replace(/"/g, '""')}"`,
      l.farmerPhone,
      `"${l.flowerVariety.replace(/"/g, '""')}"`,
      l.boxesCount || '',
      l.quantity,
      l.unit,
      l.rate,
      l.grossTotal,
      l.commissionAmount,
      l.farmerNetPayable,
      l.paymentStatus,
      `"${l.printedAt}"`,
      `"${l.removedAt}"`,
      `"${l.actionBy}"`,
      `"${l.reason}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `PhoolMitra-Parchi-Audit-Trail-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="parchi-audit-trail-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[#FFFFFF] rounded-2xl max-w-4xl w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#2E6349] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#DD9F2F]/20 border border-[#DD9F2F]/40 flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-[#DD9F2F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg leading-tight">
                  {t('auditTrailTitle')}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-bold">
                  {parchiAuditLogs.length}
                </span>
              </div>
              <p className="text-xs text-white/80">{t('auditTrailSubtitle')}</p>
            </div>
          </div>
          <button
            id="close-audit-trail-btn"
            onClick={() => setIsAuditTrailOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter */}
        <div className="bg-[#FCFBF9] border-b border-[#E8E2D9] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#6B5E57] absolute left-3 top-2.5 pointer-events-none" />
            <input
              id="audit-trail-search"
              type="text"
              placeholder="Search by farmer, variety, parchi #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E8E2D9] bg-white text-xs font-medium focus:outline-hidden focus:border-[#2E6349]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {parchiAuditLogs.length > 0 && (
              <>
                <button
                  type="button"
                  id="export-audit-csv-btn"
                  onClick={exportAuditCSV}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E2D9] text-[#2A1F1A] text-xs font-semibold hover:bg-[#F4EFEA] transition flex items-center gap-1.5 shadow-2xs"
                  title="Export audit log to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#2E6349]" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  id="trigger-clear-audit-btn"
                  onClick={() => setIsClearModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Trail</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-3 flex-1 bg-[#F9F7F4]">
          {restoredId && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Parchi restored back to Active Lots successfully!</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          {parchiAuditLogs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-[#E8E2D9] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Total Parchis Discarded
                </span>
                <span className="text-base font-black text-[#2A1F1A] font-mono">
                  {parchiAuditLogs.length} slips
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#E8E2D9] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Total Farmer Value Traced
                </span>
                <span className="text-base font-black text-[#2E6349] font-mono">
                  ₹{totalValueRemoved.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-white p-3 rounded-xl border border-[#E8E2D9] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                  Latest Audit Event
                </span>
                <span className="text-xs font-semibold text-[#2A1F1A] truncate block">
                  {parchiAuditLogs[0]?.removedAt || 'N/A'}
                </span>
              </div>
            </div>
          )}

          {/* Logs List */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-[#E8E2D9] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E9F3EE] mx-auto flex items-center justify-center text-[#2E6349]">
                <History className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#2A1F1A]">No Audit Logs Found</h4>
              <p className="text-xs text-[#6B5E57] max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? 'No archived parchis match your search filter.'
                  : 'When the "Remove Parchi After Printing" toggle is enabled in Settings, any parchi slip confirmed printed will be archived here with full auction and timestamp audit logs.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  id={`audit-card-${log.id}`}
                  className="bg-white rounded-xl border border-[#E8E2D9] p-4 shadow-2xs hover:border-[#2E6349]/40 transition space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4EFEA] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-[#2E6349]/10 text-[#2E6349]">
                        {log.parchiNumber}
                      </span>
                      <span className="text-xs font-bold text-[#2A1F1A]">
                        {log.flowerVariety}
                      </span>
                      {log.flowerQuality && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                          {log.flowerQuality}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Printer className="w-3 h-3" />
                        <span>Printed & Discarded</span>
                      </span>
                      <span className="text-[11px] font-black text-[#2A1F1A]">
                        ₹{log.farmerNetPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Card Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Farmer */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                        Farmer / Consignor
                      </span>
                      <span className="font-bold text-[#2A1F1A] block">
                        {log.farmerName}
                      </span>
                      <span className="text-[11px] text-[#6B5E57]">
                        📍 {log.farmerVillage} • {log.farmerPhone}
                      </span>
                    </div>

                    {/* Auction Data */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B5E57] block">
                        Lot Breakdown
                      </span>
                      <span className="font-semibold text-[#2A1F1A] block">
                        {log.quantity} {log.unit} @ ₹{log.rate}/{log.unit}
                      </span>
                      <span className="text-[11px] text-[#6B5E57]">
                        {log.boxesCount ? `${log.boxesCount} Boxes • ` : ''}
                        Comm: ₹{log.commissionAmount}
                      </span>
                    </div>

                    {/* Audit Metadata */}
                    <div className="bg-[#FCFBF9] p-2 rounded-lg border border-[#E8E2D9] text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-[#6B5E57]">
                        <span>🖨️ Printed:</span>
                        <span className="font-mono font-medium text-[#2A1F1A]">{log.printedAt}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#6B5E57]">
                        <span>🗑️ Removed:</span>
                        <span className="font-mono font-medium text-[#2A1F1A]">{log.removedAt}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#6B5E57]">
                        <span>👤 Operator:</span>
                        <span className="font-medium text-[#2A1F1A] truncate max-w-[120px]">{log.actionBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F4EFEA]">
                    <span className="text-[11px] text-[#6B5E57] italic">
                      {log.reason}
                    </span>

                    <div className="flex items-center gap-2">
                      {log.archivedLot && (
                        <button
                          type="button"
                          id={`preview-archived-slip-${log.id}`}
                          onClick={() => handlePreviewSlip(log)}
                          className="px-2.5 py-1 rounded-lg border border-[#E8E2D9] text-[#2A1F1A] text-xs font-semibold hover:bg-[#F4EFEA] transition flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3 text-[#DD9F2F]" />
                          <span>View Slip</span>
                        </button>
                      )}

                      <button
                        type="button"
                        id={`restore-parchi-btn-${log.id}`}
                        onClick={() => handleRestore(log)}
                        className="px-3 py-1 rounded-lg bg-[#2E6349] text-white text-xs font-bold hover:bg-[#1F4532] transition flex items-center gap-1 shadow-2xs"
                        title="Restore this slip back to active lots"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{t('restoreParchiBtn')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#E8E2D9] flex items-center justify-between">
          <span className="text-xs text-[#6B5E57]">
            Showing {filteredLogs.length} of {parchiAuditLogs.length} audit records
          </span>
          <button
            type="button"
            id="close-audit-trail-footer-btn"
            onClick={() => setIsAuditTrailOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] text-xs font-semibold text-[#2A1F1A] hover:bg-[#F4EFEA] cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isClearModalOpen}
        title="Clear Parchi Audit Trail"
        itemName="All Archived Parchi Audit Logs"
        itemDetails={`${parchiAuditLogs.length} archived print slips and removed parchi records will be deleted.`}
        message="Are you sure you want to permanently clear the parchi audit history log? This action cannot be reversed."
        confirmText="CONFIRM CLEAR"
        cancelText="CANCEL"
        onConfirm={() => {
          clearParchiAuditLogs();
          sounds.playTrashSound?.();
          setIsClearModalOpen(false);
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
