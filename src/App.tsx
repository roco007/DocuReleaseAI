import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Setup } from './pages/Setup';
import { Dashboard } from './pages/Dashboard';
import { Changelogs } from './pages/Changelogs';
import { Docs } from './pages/Docs';
import { Generate } from './pages/Generate';
import { Integrations } from './pages/Integrations';
import { Webhooks } from './pages/Webhooks';
import { Settings } from './pages/Settings';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentPage } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <p className="text-sm text-surface-500">Loading DocuRelease AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Setup />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'changelogs': return <Changelogs />;
      case 'docs': return <Docs />;
      case 'generate': return <Generate />;
      case 'integrations': return <Integrations />;
      case 'webhooks': return <Webhooks />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
