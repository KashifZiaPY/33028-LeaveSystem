import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusCircle, RefreshCw, Calendar, FileText, CheckCircle2, 
  XCircle, Clock, Ban, Search, Filter, Eye, AlertTriangle 
} from 'lucide-react';
import { SessionUser, DashboardData, LeaveRequest, LeaveType } from '../types';
import { LeaveBalanceCard } from './LeaveBalanceCard';
import { ApplyLeaveModal } from './ApplyLeaveModal';
import { LeaveSlipModal } from './LeaveSlipModal';
import { callApi } from '../services/api';
import { useToast } from '../context/ToastContext';

interface EmployeeDashboardProps {
  user: SessionUser;
  onRefreshProfile?: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user }) => {
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyDefaultType, setApplyDefaultType] = useState<LeaveType>('CL');
  const [selectedSlip, setSelectedSlip] = useState<LeaveRequest | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await callApi<DashboardData>('getMyDashboard', {
        token: user.token,
      });
      setData(res);
    } catch (err: any) {
      showError(err.message || 'Failed to load dashboard balances and requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.token, showError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleCancelRequest = async () => {
    if (!cancelTarget) return;

    setCancelling(true);
    try {
      await callApi('cancelLeaveRequest', {
        token: user.token,
        requestId: cancelTarget.RequestID,
      });
      showSuccess(`Leave request #${cancelTarget.RequestID} cancelled successfully`);
      setCancelTarget(null);
      fetchDashboard(true);
    } catch (err: any) {
      showError(err.message || 'Failed to cancel leave request');
    } finally {
      setCancelling(false);
    }
  };

  const openApplyWithType = (type: LeaveType) => {
    setApplyDefaultType(type);
    setIsApplyOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
          <Ban className="w-3 h-3" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  };

  const rawRequests = data?.requests || [];
  const filteredRequests = rawRequests.filter((req) => {
    const matchesSearch =
      (req.Reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.RequestID || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.FromDate || '').includes(searchQuery) ||
      (req.ToDate || '').includes(searchQuery);

    const matchesStatus =
      statusFilter === 'ALL' || (req.Status || '').toLowerCase() === statusFilter.toLowerCase();

    const matchesType = typeFilter === 'ALL' || req.LeaveType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Info */}
      <div className="bg-gradient-to-r from-[#1a237e] via-indigo-900 to-[#0d164d] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-indigo-100 backdrop-blur-xs">
                Institute Code: 33028
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                Year {data?.year || new Date().getFullYear()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {data?.profile?.name || user.name}
            </h1>
            <p className="text-sm text-indigo-200 font-medium">
              {data?.profile?.designation || user.designation} • {data?.profile?.department || user.department || 'Vocational Training Wing'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing || loading}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
              title="Refresh Quota and Requests"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Updating...' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => openApplyWithType('CL')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md shadow-amber-950/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              Apply for Leave
            </button>
          </div>
        </div>

        {/* Subtle decorative background watermarks */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Leave Balance Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Leave Balance Overview</h2>
            <p className="text-xs text-slate-500">Official annual allocation and utilization quota</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-28 bg-slate-100 rounded-xl" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-12 bg-slate-100 rounded" />
                  <div className="h-12 bg-slate-100 rounded" />
                  <div className="h-12 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <LeaveBalanceCard
              type="CL"
              balanceData={data?.balances?.CL || { allocated: 0, used: 0, pending: 0, balance: 0 }}
              onApplyClick={() => openApplyWithType('CL')}
            />
            <LeaveBalanceCard
              type="ML"
              balanceData={data?.balances?.ML || { allocated: 0, used: 0, pending: 0, balance: 0 }}
              onApplyClick={() => openApplyWithType('ML')}
            />
          </div>
        )}
      </div>

      {/* Leave Requests Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-900" /> My Leave Requests
            </h2>
            <p className="text-xs text-slate-500">History of leave applications and status updates</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reason or ID..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e]"
            >
              <option value="ALL">All Types</option>
              <option value="CL">Casual (CL)</option>
              <option value="ML">Medical (ML)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Req # / Type</th>
                <th className="py-3 px-4">Duration & Dates</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Applied On</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-900/20 border-t-indigo-900 rounded-full animate-spin" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700 text-sm">No leave requests found</p>
                      <p className="text-xs text-slate-400">
                        {rawRequests.length === 0
                          ? 'You have not submitted any leave applications yet.'
                          : 'No applications match your search filter criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, idx) => {
                  const isPending = (req.Status || '').toLowerCase() === 'pending';
                  return (
                    <tr key={req.RequestID || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] font-mono ${
                              req.LeaveType === 'CL'
                                ? 'bg-indigo-100 text-indigo-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {req.LeaveType}
                          </span>
                          <span className="font-mono text-slate-600 font-medium">
                            {req.RequestID || `#${idx + 1}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div>
                          {req.FromDate}{' '}
                          <span className="text-slate-400 font-normal">to</span>{' '}
                          {req.ToDate}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {req.Days} {req.Days === 1 ? 'day' : 'days'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-700" title={req.Reason}>
                        {req.Reason || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {req.AppliedOn || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(req.Status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSlip(req)}
                            className="p-1.5 text-slate-600 hover:text-indigo-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View / Print Leave Voucher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => setCancelTarget(req)}
                              className="px-2 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                              title="Cancel this pending request"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyOpen}
        token={user.token}
        defaultType={applyDefaultType}
        balances={data?.balances}
        onSuccess={() => fetchDashboard(true)}
        onClose={() => setIsApplyOpen(false)}
      />

      {/* Leave Slip / Printable Modal */}
      <LeaveSlipModal
        isOpen={!!selectedSlip}
        request={selectedSlip}
        user={user}
        onClose={() => setSelectedSlip(null)}
      />

      {/* Cancel Confirmation Dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Cancel Leave Application</h3>
                <p className="text-xs text-slate-500">Request #{cancelTarget.RequestID}</p>
              </div>
            </div>

            <p className="text-sm text-slate-700">
              Are you sure you want to cancel your{' '}
              <strong>
                {cancelTarget.LeaveType === 'CL' ? 'Casual Leave' : 'Medical Leave'}
              </strong>{' '}
              application for <strong>{cancelTarget.Days} day(s)</strong> ({cancelTarget.FromDate} to {cancelTarget.ToDate})?
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={cancelling}
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
