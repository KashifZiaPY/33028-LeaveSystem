import React from 'react';
import { LeaveRequest, SessionUser } from '../types';
import { Printer, X, Building2, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';

interface LeaveSlipModalProps {
  isOpen: boolean;
  request: LeaveRequest | null;
  user: SessionUser | null;
  onClose: () => void;
}

export const LeaveSlipModal: React.FC<LeaveSlipModalProps> = ({
  isOpen,
  request,
  user,
  onClose,
}) => {
  if (!isOpen || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full border border-rose-300">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-300">
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-300">
        <Clock className="w-3.5 h-3.5" /> Pending Sanction
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#1a237e] px-6 py-4 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-indigo-200" />
            <span className="font-bold text-base">Official Leave Voucher</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print Voucher
            </button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Leave Slip Sheet */}
        <div className="p-8 overflow-y-auto print:p-0 space-y-6">
          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4">
            <div className="text-xs uppercase font-extrabold tracking-widest text-slate-600">
              Government of the Punjab • TEVTA
            </div>
            <h2 className="text-xl font-black text-[#1a237e] mt-1 tracking-tight">
              Govt. Vocational Training Institute for Women (GVTIW)
            </h2>
            <p className="text-xs font-medium text-slate-600">
              Samanabad, Lahore | Institute Code: <strong className="font-mono text-slate-900">33028</strong>
            </p>
            <div className="mt-3 inline-block px-4 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-bold uppercase tracking-wider text-slate-800">
              Official Leave Application / Sanction Order
            </div>
          </div>

          {/* Reference Info */}
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Request Reference</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{request.RequestID || '—'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Application Status</span>
              {getStatusBadge(request.Status)}
            </div>
          </div>

          {/* Employee & Leave Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 border border-slate-200 p-3.5 rounded-lg bg-slate-50/50">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                Applicant Information
              </h4>
              <div>
                <span className="text-slate-400 block">Name:</span>
                <span className="font-bold text-slate-900 text-sm">{user?.name || 'Faculty Member'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Designation:</span>
                <span className="font-medium text-slate-800">{user?.designation || 'Instructor'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Employee ID:</span>
                <span className="font-mono font-bold text-slate-800">{user?.employeeId || '—'}</span>
              </div>
            </div>

            <div className="space-y-2 border border-slate-200 p-3.5 rounded-lg bg-slate-50/50">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                Leave Particulars
              </h4>
              <div>
                <span className="text-slate-400 block">Nature of Leave:</span>
                <span className="font-bold text-indigo-900 text-sm">
                  {request.LeaveType === 'CL' ? 'Casual Leave (CL)' : 'Medical Leave (ML)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Period of Leave:</span>
                <span className="font-bold text-slate-900">
                  {request.FromDate} <span className="font-normal text-slate-500">to</span> {request.ToDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Duration:</span>
                <span className="font-extrabold text-slate-900">{request.Days} Day(s)</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="border border-slate-200 p-3.5 rounded-lg">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-1">
              Reason / Ground for Leave
            </span>
            <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-100">
              {request.Reason || 'Not stated'}
            </p>
          </div>

          {/* Official Sanction Section */}
          <div className="border border-slate-200 p-3.5 rounded-lg bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-800" />
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Competent Authority Review & Remarks
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block">Sanctioned / Reviewed By:</span>
                <span className="font-bold text-slate-800">{request.ActionBy || 'Principal / Authorized Officer'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Date of Action:</span>
                <span className="font-medium text-slate-800">{request.ActionOn || 'Pending Decision'}</span>
              </div>
            </div>
            {request.ActionRemarks && (
              <div className="pt-1">
                <span className="text-slate-400 block text-xs">Authority Remarks:</span>
                <p className="text-xs italic text-slate-700 font-medium">"{request.ActionRemarks}"</p>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-semibold text-slate-700">
            <div>
              <div className="border-t border-slate-400 pt-1.5 mx-4">
                Signature of Applicant
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 mx-4">
                Principal / Sanctioning Authority<br />
                <span className="text-[10px] text-slate-500 font-normal">GVTIW Samanabad (Code 33028)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs transition-colors"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </div>
  );
};
