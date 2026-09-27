import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Send, AlertCircle, Clock, X, Info } from 'lucide-react';
import { LeaveType, LeaveBalance } from '../types';
import { callApi } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  token: string;
  defaultType?: LeaveType;
  balances?: {
    CL: LeaveBalance;
    ML: LeaveBalance;
  };
  onSuccess: () => void;
  onClose: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  token,
  defaultType = 'CL',
  balances,
  onSuccess,
  onClose,
}) => {
  const { showSuccess, showError, showWarning } = useToast();
  const [leaveType, setLeaveType] = useState<LeaveType>(defaultType);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);

  // Set default dates to today
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFromDate(today);
      setToDate(today);
      setLeaveType(defaultType);
      setReason('');
    }
  }, [isOpen, defaultType]);

  // Calculate estimated days count
  useEffect(() => {
    if (!fromDate || !toDate) {
      setCalculatedDays(0);
      return;
    }
    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (end < start) {
      setCalculatedDays(0);
      return;
    }

    // Difference in calendar days + 1 (inclusive)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setCalculatedDays(diffDays);
  }, [fromDate, toDate]);

  if (!isOpen) return null;

  const currentBalance = balances ? balances[leaveType]?.balance : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      showError('Please select both From and To dates');
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      showError('To Date cannot be earlier than From Date');
      return;
    }

    if (!reason.trim()) {
      showError('Please provide a reason for your leave request');
      return;
    }

    if (currentBalance !== null && currentBalance !== undefined && calculatedDays > currentBalance) {
      showWarning(
        `Requested duration (${calculatedDays} days) exceeds current available ${leaveType} balance (${currentBalance} days).`
      );
    }

    setLoading(true);
    try {
      const res = await callApi<{ requestId: string; days: number; status: string }>('applyLeave', {
        token,
        leaveType,
        fromDate,
        toDate,
        reason: reason.trim(),
      });

      const grantedDays = res?.days ?? calculatedDays;
      showSuccess(
        `Leave application submitted successfully for ${grantedDays} day(s). Status: ${res?.status || 'Pending'}`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#1a237e] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <Calendar className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Apply for Leave</h3>
              <p className="text-xs text-indigo-200">GVTIW Samanabad Faculty & Staff Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Leave Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Leave Category *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLeaveType('CL')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                  leaveType === 'CL'
                    ? 'border-[#1a237e] bg-indigo-50/70 text-indigo-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">Casual Leave (CL)</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                    CL
                  </span>
                </div>
                {balances?.CL && (
                  <span className="text-xs text-slate-600">
                    Remaining: <strong className="text-indigo-900 font-bold">{balances.CL.balance}</strong> days
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('ML')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                  leaveType === 'ML'
                    ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">Medical Leave (ML)</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    ML
                  </span>
                </div>
                {balances?.ML && (
                  <span className="text-xs text-slate-600">
                    Remaining: <strong className="text-emerald-900 font-bold">{balances.ML.balance}</strong> days
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                From Date *
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (toDate && new Date(e.target.value) > new Date(toDate)) {
                    setToDate(e.target.value);
                  }
                }}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                To Date *
              </label>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white"
              />
            </div>
          </div>

          {/* Calculated Duration Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 text-xs">
              <Clock className="w-4 h-4 text-indigo-700" />
              <span>Calculated Total Duration:</span>
            </div>
            <span className="text-sm font-extrabold text-slate-900 px-2.5 py-0.5 bg-white border border-slate-200 rounded-md shadow-2xs">
              {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Justification *
            </label>
            <div className="relative">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the official or personal reason for leave (e.g. Urgent domestic work, medical appointment, examination duty)..."
                rows={3}
                required
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-start gap-1.5 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              All applications are logged with a digital timestamp and routed directly to the Principal's desk for official sanction.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || calculatedDays <= 0}
              className="flex-1 inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-[#1a237e] hover:bg-indigo-950 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-950/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
