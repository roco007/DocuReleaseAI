import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { Webhook as WebhookIcon, Plus, Trash2, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { WebhookConfig } from '../types';

export function Webhooks() {
  const { webhooks, addWebhook, updateWebhook, removeWebhook, testWebhook } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'slack' as 'slack' | 'discord' | 'custom',
    name: '',
    url: '',
    channel: '',
    events: ['pr.merged'] as string[],
  });

  const allEvents = [
    { value: 'pr.merged', label: 'PR Merged' },
    { value: 'changelog.published', label: 'Changelog Published' },
    { value: 'changelog.approved', label: 'Changelog Approved' },
    { value: 'doc.published', label: 'Doc Published' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.url) return;
    await addWebhook({
      type: form.type,
      name: form.name,
      url: form.url,
      channel: form.type === 'slack' ? form.channel : undefined,
      enabled: true,
      events: form.events,
    });
    setForm({ type: 'slack', name: '', url: '', channel: '', events: ['pr.merged'] });
    setShowForm(false);
  };

  const handleTest = async (webhook: WebhookConfig) => {
    setTesting(webhook.id);
    const ok = await testWebhook(webhook.url);
    await updateWebhook(webhook.id, {
      lastTriggeredAt: new Date().toISOString(),
      lastStatus: ok ? 'success' : 'error',
    });
    setTesting(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Webhooks</h1>
          <p className="text-surface-500 mt-1">Configure notifications and approval workflows</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
          <Plus size={16} /> Add Webhook
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6 mb-6 animate-fade-in">
          <h3 className="font-semibold text-surface-900 mb-4">New Webhook</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 outline-none">
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                  <option value="custom">Custom HTTP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Engineering Releases"
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Webhook URL</label>
              <input type="url" value={form.url} onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 outline-none font-mono" required />
            </div>
            {form.type === 'slack' && (
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Channel (optional)</label>
                <input type="text" value={form.channel} onChange={e => setForm(prev => ({ ...prev, channel: e.target.value }))}
                  placeholder="#releases"
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 outline-none" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Events</label>
              <div className="flex flex-wrap gap-2">
                {allEvents.map(event => (
                  <button key={event.value} type="button" onClick={() => setForm(prev => ({
                    ...prev,
                    events: prev.events.includes(event.value) ? prev.events.filter(e => e !== event.value) : [...prev.events, event.value]
                  }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.events.includes(event.value) ? 'bg-primary-100 text-primary-700 border border-primary-200' : 'bg-surface-50 text-surface-500 border border-surface-200 hover:bg-surface-100'}`}>
                    {event.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Create Webhook</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="bg-white rounded-xl border border-surface-200 p-12 text-center">
            <WebhookIcon size={32} className="mx-auto text-surface-300 mb-2" />
            <p className="text-sm text-surface-500">No webhooks configured yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-primary-600 font-medium hover:text-primary-700">Add your first webhook →</button>
          </div>
        ) : webhooks.map(webhook => (
          <div key={webhook.id} className={`bg-white rounded-xl border shadow-sm transition-all ${webhook.enabled ? 'border-surface-200' : 'border-surface-200 opacity-60'}`}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${webhook.type === 'slack' ? 'bg-purple-50' : webhook.type === 'discord' ? 'bg-indigo-50' : 'bg-surface-100'}`}>
                    <span className="text-lg">{webhook.type === 'slack' ? '💬' : webhook.type === 'discord' ? '🎮' : '🔗'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-surface-900">{webhook.name}</h3>
                      {webhook.channel && <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full">{webhook.channel}</span>}
                      {webhook.lastStatus === 'success' && <CheckCircle2 size={14} className="text-accent-500" />}
                      {webhook.lastStatus === 'error' && <AlertCircle size={14} className="text-red-500" />}
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5 font-mono truncate max-w-md">{webhook.url}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {webhook.events.map(event => (
                        <span key={event} className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">{event}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleTest(webhook)} disabled={testing === webhook.id}
                    className="px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium">
                    {testing === webhook.id ? 'Testing...' : 'Test'}
                  </button>
                  <button onClick={() => updateWebhook(webhook.id, { enabled: !webhook.enabled })} className="p-1.5 rounded-lg hover:bg-surface-100">
                    {webhook.enabled ? <ToggleRight size={22} className="text-accent-500" /> : <ToggleLeft size={22} className="text-surface-400" />}
                  </button>
                  <button onClick={() => removeWebhook(webhook.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {webhook.lastTriggeredAt && (
                <p className="text-xs text-surface-400 mt-2 ml-13">Last triggered {formatDistanceToNow(new Date(webhook.lastTriggeredAt), { addSuffix: true })}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
