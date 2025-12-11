'use client';

import { useEffect, useState } from 'react';
import CheckCircleOutlined from '@mui/icons-material/CheckCircle';
import CloseOutlined from '@mui/icons-material/Close';
import Undo from '@mui/icons-material/Undo';

export type ToastStatus = 'success' | 'error';

interface ToastProps {
  message: string;
  description?: string;
  isVisible: boolean;
  onClose: () => void;
  onUndo?: () => void;
  autoHideDuration?: number;
  status?: ToastStatus
}

export function Toast({
  message,
  description,
  isVisible,
  onClose,
  onUndo,
  autoHideDuration = 3500,
  status = 'success'
}: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          onClose();
          setIsClosing(false);
        }, 300); // Match animation duration
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, autoHideDuration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleUndo = () => {
    if (onUndo) {
      onUndo();
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 z-50"
      style={{
        right: '16px',
        animation: isClosing ? 'slideOutRight 0.3s ease-in-out forwards' : 'slideInRight 0.3s ease-in-out'
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(calc(100% + 32px));
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(calc(100% + 32px));
            opacity: 0;
          }
        }
      `}</style>
      <div
        className="flex items-center justify-between bg-white rounded-[10px] shadow-lg px-4 py-4"
        style={{
          border: '1.422px solid #E3E3E3',
          width: '512px'
        }}
      >
        {/* Content */}
        <div className="flex items-center" style={{ gap: '8px' }}>
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {status === 'error' ? (
              <CloseOutlined sx={{ fontSize: 32, color: '#DC2626' }} />
            ) : (
              <CheckCircleOutlined sx={{ fontSize: 32, color: '#50A20F' }} />
            )}
          </div>

          {/* Message */}
          <div className="flex flex-col">
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#0D0D0D',
                textAlign: 'left'
              }}
            >
              {message}
            </p>
            {description && (
              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '16px',
                  color: '#4F4F4F',
                  textAlign: 'left'
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="flex items-center gap-2">
          {onUndo && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold bg-white border border-gray-300 rounded-[10px] hover:bg-gray-50 transition-colors"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '16px',
                color: '#101010',
                borderColor: '#E3E3E3'
              }}
            >
              <Undo sx={{ fontSize: 16 }} />
              Undo
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center"
            style={{ width: '36px', height: '36px' }}
            aria-label="Close"
          >
            <CloseOutlined sx={{ fontSize: 24, color: '#4F4F4F' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
