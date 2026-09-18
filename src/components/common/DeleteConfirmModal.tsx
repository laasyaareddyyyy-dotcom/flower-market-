import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  itemDetails?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Confirm Deletion',
  itemName,
  itemDetails,
  message,
  onConfirm,
  onCancel,
  confirmText = 'CONFIRM DELETE',
  cancelText = 'CANCEL',
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delete-confirmation-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        id="delete-confirmation-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E8E2D9] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-rose-50 px-6 py-4 flex items-center justify-between border-b border-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-[#9E3A24] flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2A1F1A]">{title}</h3>
              <p className="text-[11px] text-rose-800 font-medium">Permanent record action</p>
            </div>
          </div>
          <button
            type="button"
            id="delete-modal-close-x-btn"
            onClick={onCancel}
            className="text-[#6B5E57] hover:text-[#2A1F1A] p-1.5 rounded-lg hover:bg-rose-100/50 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 bg-white">
          {/* Item details card if provided */}
          {itemName && (
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B5E57]">
                Item to be deleted:
              </div>
              <div className="text-sm font-black text-[#2A1F1A]">{itemName}</div>
              {itemDetails && (
                <div className="text-xs text-[#6B5E57] font-medium">{itemDetails}</div>
              )}
            </div>
          )}

          {/* Prompt Question & Message */}
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-[#2A1F1A]">
              Are you sure you want to delete this?
            </p>
            <p className="text-xs text-[#6B5E57] leading-relaxed">
              {message ||
                'This item will be permanently deleted from the mandi ledger records and cannot be recovered.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#E8E2D9] flex items-center justify-end gap-3">
          <button
            type="button"
            id="delete-modal-cancel-btn"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-[#D9D0C7] text-[#4A3F38] bg-white text-xs font-bold uppercase tracking-wider hover:bg-[#F4EFEA] transition cursor-pointer shadow-2xs"
          >
            {cancelText}
          </button>
          <button
            type="button"
            id="delete-modal-confirm-btn"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-[#9E3A24] hover:bg-[#85301D] text-white text-xs font-black uppercase tracking-wider shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

