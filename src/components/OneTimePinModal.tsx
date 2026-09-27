import React, { useState } from 'react';
import { ShieldAlert, Copy, Check, Lock, User, KeyRound, X } from 'lucide-react';
import { OneTimeCredentials } from '../types';
import { useToast } from '../context/ToastContext';

interface OneTimePinModalProps {
  isOpen: boolean;
  credentials: OneTimeCredentials | null;
  onClose: () => void;
  title?: string;
}

export const OneTimePinModal: React.FC<OneTimePinModalProps> = ({
  isOpen,
  credentials,
  onClose,
  title = 'One-Time Generated Credentials',
}) => {
  const { showSuccess } = useToast();
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen || !credentials) return null;

  const handleCopyPin = () => {
    navigator.clipboard.writeText(credentials.pin);
    setCopiedPin(true);
    showSuccess('PIN copied to clipboard');
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleCopyAll = () => {
    const text = `GVTIW Leave Portal Credentials:\nUsername: ${credentials.username}\nPIN: ${credentials.pin}${
      credentials.employeeId ? `\nEmployee ID: ${credentials.employeeId}` : ''
    }${credentials.role ? `\nRole: ${credentials.role}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    showSuccess('Credentials copied to clipboard');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
              <Lock className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{title}</h3>
              <p className="text-xs text-amber-100">Confidential Security Notice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Critical Warning Box */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Save This Now — Cannot Be Shown Again
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                For security compliance, this PIN is generated in real-time and will not be stored in client memory or accessible again after closing this window. Provide it securely to the employee.
              </p>
            </div>
          </div>

          {/* Credential Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            {credentials.name && (
              <div className="flex justify-between items-center text-sm pb-2 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Employee Name:</span>
                <span className="font-semibold text-slate-800">{credentials.name}</span>
              </div>
            )}
            
            {credentials.employeeId && (
              <div className="flex justify-between items-center text-sm pb-2 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Employee ID:</span>
                <span className="font-mono font-bold text-indigo-900">{credentials.employeeId}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" /> Username:
              </span>
              <span className="font-mono font-bold text-slate-900 px-2 py-0.5 bg-slate-200/60 rounded">
                {credentials.username}
              </span>
            </div>

            <div className="pt-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-600 font-medium text-xs flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" /> Security PIN:
                </span>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPin ? 'Copied' : 'Copy PIN'}
                </button>
              </div>
              <div className="bg-white border-2 border-dashed border-amber-300 rounded-lg p-3 text-center">
                <span className="font-mono text-2xl font-bold tracking-widest text-slate-900 select-all">
                  {credentials.pin}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-sm transition-colors"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              Copy All Details
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-[#1a237e] hover:bg-indigo-950 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-950/20 transition-all"
            >
              I Have Saved This PIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
