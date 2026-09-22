import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, BookOpen, Plug, Settings,
  Webhook, Sparkles, Bell, ChevronRight, Menu, X, LogOut
} from 'lucide-react';
import { Page } from '../../types';

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { page: 'changelogs', label: 'Changelogs', icon: <FileText size={18} /> },
  { page: 'docs', label: 'Documentation', icon: <BookOpen size={18} /> },
  { page: 'generate', label: 'Generate', icon: <Sparkles size={18} /> },
  { page: 'integrations', label: 'Integrations', icon: <Plug size={18} /> },
  { page: 'webhooks', label: 'Webhooks', icon: <Webhook size={18} /> },
  { page: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export function Sidebar() {
  const { currentPage, setPage, notification, dismissNotification } = useApp();
  const { clearCredentials } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-surface-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="font-semibold text-surface-900 text-sm">DocuRelease AI</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-surface-600">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-200 flex flex-col transform transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-5 border-b border-surface-100">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <div className="ml-3">
            <h1 className="font-bold text-surface-900 text-sm">DocuRelease AI</h1>
            <p className="text-xs text-surface-400">Powered by Gemini</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => { setPage(item.page); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentPage === item.page
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
              }`}
            >
              {item.icon}
              {item.label}
              {currentPage === item.page && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-100">
          <button
            onClick={() => clearCredentials()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-surface-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} /> Sign Out & Reset
          </button>
        </div>
      </aside>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] animate-fade-in max-w-sm ${
          notification.type === 'success' ? 'bg-accent-50 border-accent-200 text-accent-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-primary-50 border-primary-200 text-primary-800'
        } border rounded-lg p-4 shadow-lg`}>
          <div className="flex items-start gap-3">
            <Bell size={16} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{notification.message}</p>
            <button onClick={dismissNotification} className="ml-auto flex-shrink-0 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
