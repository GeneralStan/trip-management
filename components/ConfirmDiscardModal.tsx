'use client';

import { useEffect, useRef } from 'react';
import WarningRounded from '@mui/icons-material/WarningRounded';

interface ConfirmDiscardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDiscardModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmDiscardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl"
        style={{ width: '400px' }}
      >
        {/* Header Frame */}
        <div className="p-4 flex items-start gap-3" style={{ borderBottom: '1px solid #E3E3E3' }}>
          <WarningRounded sx={{ fontSize: 24, color: '#F59E0B' }} />
          <div className="flex-1">
            <h2
              id="confirm-dialog-title"
              className="text-lg font-semibold"
              style={{ color: '#0D0D0D' }}
            >
              Hold On...
            </h2>
          </div>
        </div>

        {/* Content Frame */}
        <div className="px-6 py-4">
          <p className="text-sm" style={{ color: '#4D4D4D' }}>
            Leaving this page will discard the generated trips. Do you want to proceed?
          </p>
        </div>

        {/* Footer Frame */}
        <div
          className="p-4 flex items-center justify-end gap-3"
          style={{ borderTop: '1px solid #E3E3E3' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            Discard and go back
          </button>
        </div>
      </div>
    </div>
  );
}
