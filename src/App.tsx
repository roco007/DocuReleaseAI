import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Changelogs } from './pages/Changelogs';
import { Docs } from './pages/Docs';
import { Generate } from './pages/Generate';
import { Integrations } from './pages/Integrations';
import { Webhooks } from './pages/Webhooks';
import { Settings } from './pages/Settings';

function AppContent() {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'changelogs': return <Changelogs />;
      case 'docs': return <Docs />;
      case 'new-generation': return <Generate />;
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
