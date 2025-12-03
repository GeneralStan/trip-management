'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface CapacityWarningModalProps {
  isOpen: boolean;
  overage: number;
  onCancel: () => void;
  onProceed: () => void;
}

export function CapacityWarningModal({
  isOpen,
  overage,
  onCancel,
  onProceed,
}: CapacityWarningModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (dontShowAgain && typeof window !== 'undefined') {
      localStorage.setItem('hideCapacityWarning', 'true');
      console.log('Capacity warning suppressed for future');
    }
    onProceed();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Vehicle Limit</h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded-md p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <p className="mb-6 text-sm text-gray-700">
          The vehicle will carry {overage} cubes over capacity for this trip. Proceed
          anyways?
        </p>

        {/* Checkbox */}
        <label className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Don&apos;t show this again</span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            ✓ Yes, proceed
          </button>
        </div>
      </div>
    </div>
  );
}
