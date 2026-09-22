import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Users, CreditCard, Shield, Save, Check } from 'lucide-react';
import { Organization } from '../types';

export function Settings() {
  const { organization, saveOrganization } = useApp();
  const { credentials, updateCredentials } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'billing'>('general');
  const [saved, setSaved] = useState(false);

  const [orgName, setOrgName] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [defaultAudience, setDefaultAudience] = useState<'internal' | 'external' | 'both'>('external');
  const [model, setModel] = useState(credentials?.geminiModel || 'gemini-2.5-pro');

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
      setBrandVoice(organization.brandVoice);
      setDefaultAudience(organization.defaultAudience);
    }
  }, [organization]);

  const handleSaveOrg = async () => {
    const org: Organization = {
      id: organization?.id || `org-${Date.now()}`,
      name: orgName,
      createdAt: organization?.createdAt || new Date().toISOString(),
      brandVoice,
      defaultAudience,
    };
    await saveOrganization(org);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveModel = async () => {
    await updateCredentials({ geminiModel: model as any });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-surface-500 mt-1">Manage your organization and preferences</p>
      </div>

      <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1 mb-6 w-fit">
        {[
          { id: 'general' as const, label: 'General', icon: <SettingsIcon size={14} /> },
          { id: 'api' as const, label: 'API Keys', icon: <Shield size={14} /> },
          { id: 'billing' as const, label: 'Billing', icon: <CreditCard size={14} /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === tab.id ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <h3 className="font-semibold text-surface-900 mb-4">Organization Settings</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Organization Name</label>
              <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Default Changelog Audience</label>
              <select value={defaultAudience} onChange={e => setDefaultAudience(e.target.value as any)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 outline-none">
                <option value="external">External (Customer-facing)</option>
                <option value="internal">Internal (Developer docs)</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Brand Voice</label>
              <textarea value={brandVoice} onChange={e => setBrandVoice(e.target.value)}
                placeholder="Describe your brand voice for consistent documentation..."
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 outline-none resize-none h-24" />
              <p className="text-xs text-surface-400 mt-1">This is injected into the Gemini prompt for consistent tone.</p>
            </div>
            <button onClick={handleSaveOrg}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
              {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
            <h3 className="font-semibold text-surface-900 mb-4">AI Model Configuration</h3>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Gemini Model</label>
                <select value={model} onChange={e => setModel(e.target.value as any)}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 outline-none">
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Best quality, deep reasoning)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & cost-efficient)</option>
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Latest stable)</option>
                </select>
              </div>
              <button onClick={handleSaveModel}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Update Model</>}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
            <h3 className="font-semibold text-surface-900 mb-4">API Keys</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg border border-surface-200">
                <div>
                  <p className="text-sm font-medium text-surface-900">Google Gemini API Key</p>
                  <p className="text-xs text-surface-400 font-mono mt-0.5">{credentials?.geminiApiKey ? credentials.geminiApiKey.substring(0, 8) + '••••••••' : 'Not set'}</p>
                </div>
                <span className="text-xs text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg border border-surface-200">
                <div>
                  <p className="text-sm font-medium text-surface-900">GitHub Token</p>
                  <p className="text-xs text-surface-400 font-mono mt-0.5">{credentials?.githubToken ? credentials.githubToken.substring(0, 8) + '••••••••' : 'Not set'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${credentials?.githubToken ? 'text-accent-600 bg-accent-50' : 'text-surface-500 bg-surface-100'}`}>
                  {credentials?.githubToken ? 'Active' : 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg border border-surface-200">
                <div>
                  <p className="text-sm font-medium text-surface-900">Jira API Token</p>
                  <p className="text-xs text-surface-400 font-mono mt-0.5">{credentials?.jiraApiToken ? '••••••••••••' : 'Not set'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${credentials?.jiraApiToken ? 'text-accent-600 bg-accent-50' : 'text-surface-500 bg-surface-100'}`}>
                  {credentials?.jiraApiToken ? 'Active' : 'Optional'}
                </span>
              </div>
            </div>
            <p className="text-xs text-surface-400 mt-4">
              All keys are stored locally in your browser's IndexedDB. They are only sent directly to the respective service APIs.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <h3 className="font-semibold text-surface-900 mb-4">Usage & Billing</h3>
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-5 border border-primary-100">
            <p className="text-sm text-surface-600">
              DocuRelease AI uses Google Gemini API directly with your own API key. Billing is handled by Google Cloud based on your usage.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-primary-100">
              <div>
                <p className="text-xs text-surface-500">Total Tokens Used</p>
                <p className="text-sm font-semibold text-surface-900">
                  {organization ? '0' : '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-surface-500">Generations</p>
                <p className="text-sm font-semibold text-surface-900">0</p>
              </div>
              <div>
                <p className="text-xs text-surface-500">Model</p>
                <p className="text-sm font-semibold text-surface-900">{credentials?.geminiModel || 'N/A'}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-surface-400 mt-4">
            View detailed usage at <a href="https://aistudio.google.com" target="_blank" rel="noopener" className="text-primary-600 hover:underline">Google AI Studio</a>
          </p>
        </div>
      )}
    </div>
  );
}
