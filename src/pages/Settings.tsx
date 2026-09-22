import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Users, CreditCard, Shield, Save, Check } from 'lucide-react';

export function Settings() {
  const { organization } = useApp();
  const [orgName, setOrgName] = useState(organization.name);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'billing' | 'api'>('general');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-surface-500 mt-1">Manage your organization and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1 mb-6 w-fit">
        {[
          { id: 'general' as const, label: 'General', icon: <SettingsIcon size={14} /> },
          { id: 'team' as const, label: 'Team', icon: <Users size={14} /> },
          { id: 'billing' as const, label: 'Billing', icon: <CreditCard size={14} /> },
          { id: 'api' as const, label: 'API Keys', icon: <Shield size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === tab.id ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <h3 className="font-semibold text-surface-900 mb-4">Organization Settings</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Default Changelog Audience</label>
              <select className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none">
                <option value="external">External (Customer-facing)</option>
                <option value="internal">Internal (Developer docs)</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Default Export Format</label>
              <select className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none">
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">AI Model</label>
              <select className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none">
                <option value="gpt-4-turbo">GPT-4 Turbo (Recommended)</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Brand Voice</label>
              <textarea
                placeholder="Describe your brand voice for consistent documentation..."
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none resize-none h-20"
                defaultValue="Professional but approachable. Use clear, concise language. Avoid jargon when writing for external audiences."
              />
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </div>
      )}

      {/* Team */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Team Members</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors">
              <Users size={14} /> Invite Member
            </button>
          </div>
          <div className="divide-y divide-surface-100">
            {organization.members.map(member => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">{member.name}</p>
                    <p className="text-xs text-surface-500">{member.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  member.role === 'admin' ? 'bg-primary-50 text-primary-700' :
                  member.role === 'editor' ? 'bg-accent-50 text-accent-700' :
                  'bg-surface-100 text-surface-600'
                }`}>{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Current Plan</h3>
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-5 border border-primary-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-surface-900">Growth</p>
                  <p className="text-sm text-surface-600 mt-0.5">$99/month • Up to 10 repositories</p>
                </div>
                <span className="text-xs bg-accent-100 text-accent-700 px-3 py-1 rounded-full font-semibold">Active</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-primary-100">
                <div>
                  <p className="text-xs text-surface-500">Repositories</p>
                  <p className="text-sm font-semibold text-surface-900">3 / 10</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500">AI Tokens (MTD)</p>
                  <p className="text-sm font-semibold text-surface-900">12.4K / 100K</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500">Team Members</p>
                  <p className="text-sm font-semibold text-surface-900">4 / 10</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Upgrade Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-surface-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer">
                <p className="text-sm font-semibold text-surface-900">Enterprise</p>
                <p className="text-xs text-surface-500 mt-0.5">Unlimited repos, priority support, SSO</p>
                <p className="text-lg font-bold text-surface-900 mt-2">$299<span className="text-xs text-surface-400 font-normal">/month</span></p>
              </div>
              <div className="border border-surface-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer">
                <p className="text-sm font-semibold text-surface-900">Custom</p>
                <p className="text-xs text-surface-500 mt-0.5">Tailored for large organizations</p>
                <p className="text-lg font-bold text-surface-900 mt-2">Contact Sales</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeTab === 'api' && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">API Keys</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors">
              <Shield size={14} /> Generate Key
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg border border-surface-200">
              <div>
                <p className="text-sm font-medium text-surface-900">Production Key</p>
                <p className="text-xs text-surface-400 font-mono mt-0.5">dr_prod_••••••••••••••••3f8a</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">Active</span>
                <span className="text-xs text-surface-400">Created Jan 15</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg border border-surface-200">
              <div>
                <p className="text-sm font-medium text-surface-900">Development Key</p>
                <p className="text-xs text-surface-400 font-mono mt-0.5">dr_dev_••••••••••••••••7b2c</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">Active</span>
                <span className="text-xs text-surface-400">Created Jan 10</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-surface-400 mt-4">
            API keys are used to authenticate webhook requests and access the DocuRelease API. Keep them secure.
          </p>
        </div>
      )}
    </div>
  );
}
