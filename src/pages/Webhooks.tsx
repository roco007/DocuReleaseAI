import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { Webhook as WebhookIcon, Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink, AlertCircle } from 'lucide-react';
import { WebhookConfig } from '../types';

export function Webhooks() {
  const { webhooks, toggleWebhook, addWebhook, deleteWebhook } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'slack' as 'slack' | 'custom',
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
    { value: 'doc.updated', label: 'Doc Updated' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;
    addWebhook({
      type: formData.type,
      name: formData.name,
      url: formData.url,
      channel: formData.type === 'slack' ? formData.channel : undefined,
      enabled: true,
      events: formData.events,
    });
    setFormData({ type: 'slack', name: '', url: '', channel: '', events: ['pr.merged'] });
    setShowForm(false);
  };

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Webhooks</h1>
          <p className="text-surface-500 mt-1">Configure notifications and automated workflows</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Webhook
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6 mb-6 animate-fade-in">
          <h3 className="font-semibold text-surface-900 mb-4">New Webhook</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none"
                >
                  <option value="slack">Slack</option>
                  <option value="custom">Custom HTTP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Engineering Releases"
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Webhook URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none"
                required
              />
            </div>

            {formData.type === 'slack' && (
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Channel</label>
                <input
                  type="text"
                  value={formData.channel}
                  onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value }))}
                  placeholder="#releases"
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Events</label>
              <div className="flex flex-wrap gap-2">
                {allEvents.map(event => (
                  <button
                    key={event.value}
                    type="button"
                    onClick={() => toggleEvent(event.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      formData.events.includes(event.value)
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-surface-50 text-surface-500 border border-surface-200 hover:bg-surface-100'
                    }`}
                  >
                    {event.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                Create Webhook
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-200 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Webhook List */}
      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="bg-white rounded-xl border border-surface-200 p-12 text-center">
            <WebhookIcon size={32} className="mx-auto text-surface-300 mb-2" />
            <p className="text-sm text-surface-500">No webhooks configured yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-primary-600 font-medium hover:text-primary-700">
              Add your first webhook →
            </button>
          </div>
        ) : (
          webhooks.map(webhook => (
            <WebhookCard
              key={webhook.id}
              webhook={webhook}
              onToggle={() => toggleWebhook(webhook.id)}
              onDelete={() => deleteWebhook(webhook.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function WebhookCard({ webhook, onToggle, onDelete }: { webhook: WebhookConfig; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all ${webhook.enabled ? 'border-surface-200' : 'border-surface-200 opacity-60'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              webhook.type === 'slack' ? 'bg-purple-50' : 'bg-surface-100'
            }`}>
              {webhook.type === 'slack' ? (
                <span className="text-lg">💬</span>
              ) : (
                <WebhookIcon size={18} className="text-surface-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-900">{webhook.name}</h3>
                {webhook.channel && (
                  <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full">{webhook.channel}</span>
                )}
              </div>
              <p className="text-xs text-surface-400 mt-0.5 font-mono truncate max-w-md">{webhook.url}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {webhook.events.map(event => (
                  <span key={event} className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                    {event}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {webhook.lastTriggered && (
              <span className="text-xs text-surface-400">
                Last: {formatDistanceToNow(new Date(webhook.lastTriggered), { addSuffix: true })}
              </span>
            )}
            <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
              {webhook.enabled ? (
                <ToggleRight size={22} className="text-accent-500" />
              ) : (
                <ToggleLeft size={22} className="text-surface-400" />
              )}
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
