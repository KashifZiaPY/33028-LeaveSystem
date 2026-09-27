import React, { useState, useEffect, useCallback } from 'react';
import { SessionUser, PendingApproval } from './types';
import { ToastProvider, useToast } from './context/ToastContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ApprovalsView } from './components/ApprovalsView';
import { RootConsole } from './components/RootConsole';
import { ChangePinModal } from './components/ChangePinModal';
import { ApplyLeaveModal } from './components/ApplyLeaveModal';
import { callApi, registerAuthErrorHandler, unregisterAuthErrorHandler } from './services/api';

const AppContent: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();

  // In-Memory Session State (Strictly not stored in localStorage per security requirements)
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);

  // Modals state
  const [isMandatoryPinOpen, setIsMandatoryPinOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Register automatic session expiration handler
  useEffect(() => {
    registerAuthErrorHandler(() => {
      showError('Your session has expired or is invalid. Please sign in again.');
      setCurrentUser(null);
      setActiveTab('dashboard');
    });

    return () => {
      unregisterAuthErrorHandler();
    };
  }, [showError]);

  // Handle Login
  const handleLoginSuccess = (user: SessionUser) => {
    setCurrentUser(user);
    setActiveTab('dashboard');

    if (user.mustChangePin) {
      setIsMandatoryPinOpen(true);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    if (!currentUser) return;
    setLoggingOut(true);

    try {
      await callApi('logout', { token: currentUser.token });
      showSuccess('You have safely signed out of the leave portal.');
    } catch {
      // Even if network or API errors on logout, clear state locally
      showInfo('Session ended.');
    } finally {
      setCurrentUser(null);
      setActiveTab('dashboard');
      setLoggingOut(false);
    }
  };

  // Fetch pending count periodically if user is Principal or Root
  const updatePendingCount = useCallback(async () => {
    if (!currentUser || (currentUser.role !== 'Principal' && currentUser.role !== 'Root')) {
      return;
    }
    try {
      const list = await callApi<PendingApproval[]>('getPendingApprovals', {
        token: currentUser.token,
      });
      if (Array.isArray(list)) {
        setPendingApprovalsCount(list.length);
      }
    } catch {
      // Ignore background count failure
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'Principal' || currentUser.role === 'Root')) {
      updatePendingCount();
    }
  }, [currentUser, updatePendingCount]);

  // If not logged in, render official institutional login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-[#1a237e] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        pendingApprovalsCount={pendingApprovalsCount}
        onTabChange={setActiveTab}
        onApplyLeaveClick={() => setIsApplyLeaveOpen(true)}
        onChangePinClick={() => setIsChangePinOpen(true)}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <EmployeeDashboard user={currentUser} />
        )}

        {activeTab === 'approvals' && (currentUser.role === 'Principal' || currentUser.role === 'Root') && (
          <ApprovalsView
            user={currentUser}
            onCountUpdate={(cnt) => setPendingApprovalsCount(cnt)}
          />
        )}

        {activeTab === 'root' && currentUser.role === 'Root' && (
          <RootConsole user={currentUser} />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <div className="font-bold text-slate-700">
            Govt. Vocational Training Institute for Women (GVTIW) Samanabad, Lahore
          </div>
          <div className="text-[11px] text-slate-500">
            Institute Code: <strong className="text-slate-800 font-mono">33028</strong> • TEVTA, Government of the Punjab
          </div>
          <div className="text-[10px] text-slate-400 pt-1">
            Official Employee Leave & Quota Management Portal • Internal Secure Environment
          </div>
        </div>
      </footer>

      {/* Mandatory First-Time PIN Change Modal */}
      <ChangePinModal
        isOpen={isMandatoryPinOpen}
        token={currentUser.token}
        isMandatory={true}
        onSuccess={() => {
          setIsMandatoryPinOpen(false);
          setCurrentUser((prev) => (prev ? { ...prev, mustChangePin: false } : null));
        }}
      />

      {/* Voluntary Self-Service PIN Change Modal */}
      <ChangePinModal
        isOpen={isChangePinOpen}
        token={currentUser.token}
        isMandatory={false}
        onSuccess={() => setIsChangePinOpen(false)}
        onClose={() => setIsChangePinOpen(false)}
      />

      {/* Quick Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        token={currentUser.token}
        onSuccess={() => {
          // If on dashboard, components will refresh automatically or can switch
          setActiveTab('dashboard');
        }}
        onClose={() => setIsApplyLeaveOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
