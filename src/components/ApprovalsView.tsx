import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, XCircle, Clock, RefreshCw, UserCheck, 
  Search, ShieldAlert, FileText, Check, X, MessageSquare 
} from 'lucide-react';
import { SessionUser, PendingApproval } from '../types';
import { callApi } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ApprovalsViewProps {
  user: SessionUser;
  onCountUpdate?: (count: number) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ user, onCountUpdate }) => {
  const { showSuccess, showError } = useToast();
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Action Dialog State
  const [activeItem, setActiveItem] = useState<PendingApproval | null>(null);
  const [actionDecision, setActionDecision] = useState<'Approved' | 'Rejected' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApprovals = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const list = await callApi<PendingApproval[]>('getPendingApprovals', {
        token: user.token,
      });
      const validList = Array.isArray(list) ? list : [];
      setApprovals(validList);
      if (onCountUpdate) {
        onCountUpdate(validList.length);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to fetch pending leave approvals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.token, showError, onCountUpdate]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const openActionModal = (item: PendingApproval, decision: 'Approved' | 'Rejected') => {
    setActiveItem(item);
    setActionDecision(decision);
    setRemarks(decision === 'Approved' ? 'Sanctioned as admissible under rules.' : '');
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !actionDecision) return;

    if (actionDecision === 'Rejected' && !remarks.trim()) {
      showError('Please provide remarks/justification for rejecting this leave request');
      return;
    }

    setSubmitting(true);
    try {
      const res = await callApi('actionOnLeaveRequest', {
        token: user.token,
        requestId: activeItem.RequestID,
        decision: actionDecision,
        remarks: remarks.trim() || undefined,
      });

      showSuccess(
        `Leave request #${activeItem.RequestID} for ${activeItem.employeeName} has been ${actionDecision.toLowerCase()}.`
      );
      setActiveItem(null);
      setActionDecision(null);
      setRemarks('');
      fetchApprovals(true);
    } catch (err: any) {
      showError(err.message || `Failed to process ${actionDecision.toLowerCase()} action`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApprovals = approvals.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.employeeName || '').toLowerCase().includes(query) ||
      (item.designation || '').toLowerCase().includes(query) ||
      (item.EmployeeID || '').toLowerCase().includes(query) ||
      (item.Reason || '').toLowerCase().includes(query) ||
      (item.RequestID || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[#1a237e]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Leave Sanctions & Approvals
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {approvals.length} Pending
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Principal's Review Desk • Sanction casual & medical leave for GVTIW staff
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty name, ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e]"
            />
          </div>

          <button
            onClick={() => fetchApprovals(true)}
            disabled={refreshing || loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Faculty / Employee</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Date Range</th>
                <th className="py-3.5 px-4">Days</th>
                <th className="py-3.5 px-4">Reason / Ground</th>
                <th className="py-3.5 px-4">Applied On</th>
                <th className="py-3.5 px-4 text-right">Decision Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-900/20 border-t-indigo-900 rounded-full animate-spin" />
                      <span>Loading pending approvals...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">All caught up!</p>
                      <p className="text-xs text-slate-400">
                        {approvals.length === 0
                          ? 'There are currently no pending leave requests awaiting approval.'
                          : 'No pending requests matched your search filter.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApprovals.map((item) => (
                  <tr key={item.RequestID} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {item.employeeName || 'Staff Member'}
                        </div>
                        <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5 mt-0.5">
                          <span>{item.designation || 'Faculty'}</span>
                          <span>•</span>
                          <span className="font-mono text-indigo-900 font-semibold">
                            {item.EmployeeID}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] border ${
                          item.LeaveType === 'CL'
                            ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}
                      >
                        {item.LeaveType === 'CL' ? 'Casual (CL)' : 'Medical (ML)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>
                        {item.FromDate} <span className="text-slate-400">to</span> {item.ToDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {item.Days} {item.Days === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700" title={item.Reason}>
                      {item.Reason || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {item.AppliedOn || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openActionModal(item, 'Approved')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => openActionModal(item, 'Rejected')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve / Reject Action Modal */}
      {activeItem && actionDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div
              className={`px-6 py-4 text-white flex items-center justify-between ${
                actionDecision === 'Approved' ? 'bg-emerald-700' : 'bg-rose-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {actionDecision === 'Approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-200" />
                )}
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {actionDecision === 'Approved' ? 'Sanction & Approve Leave' : 'Reject Leave Request'}
                  </h3>
                  <p className="text-xs opacity-90">
                    Application #{activeItem.RequestID} • {activeItem.employeeName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveItem(null);
                  setActionDecision(null);
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmAction} className="p-6 space-y-4">
              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Applicant:</span>
                  <span className="font-bold text-slate-900">
                    {activeItem.employeeName} ({activeItem.designation})
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Type & Duration:</span>
                  <span className="font-bold text-slate-900">
                    {activeItem.LeaveType === 'CL' ? 'Casual Leave' : 'Medical Leave'} •{' '}
                    {activeItem.Days} Day(s) ({activeItem.FromDate} to {activeItem.ToDate})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-0.5">Reason:</span>
                  <p className="text-slate-800 italic bg-white p-2 rounded border border-slate-200 font-medium">
                    "{activeItem.Reason}"
                  </p>
                </div>
              </div>

              {/* Remarks Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>
                    Official Remarks / Feedback{' '}
                    {actionDecision === 'Rejected' && <span className="text-rose-600">* (Required)</span>}
                  </span>
                  {actionDecision === 'Approved' && (
                    <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  )}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    actionDecision === 'Approved'
                      ? 'e.g. Sanctioned as admissible under rules.'
                      : 'Please specify the reason for rejection (e.g. Institutional urgency, exam duty clash, quota limit)...'
                  }
                  rows={3}
                  required={actionDecision === 'Rejected'}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveItem(null);
                    setActionDecision(null);
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 ${
                    actionDecision === 'Approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : actionDecision === 'Approved' ? (
                    'Confirm Approval'
                  ) : (
                    'Confirm Rejection'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
