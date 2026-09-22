import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow, format } from 'date-fns';
import {
  FileText, Check, Send, Edit3, Eye, Filter,
  ExternalLink, Copy, Download, ChevronDown
} from 'lucide-react';
import { ChangelogEntry } from '../types';

export function Changelogs() {
  const { changelogs, updateChangelog, publishChangelog } = useApp();
  const [filter, setFilter] = useState<'all' | 'draft' | 'approved' | 'published'>('all');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'internal' | 'external'>('all');
  const [selectedEntry, setSelectedEntry] = useState<ChangelogEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const filtered = changelogs.filter(cl => {
    if (filter !== 'all' && cl.status !== filter) return false;
    if (audienceFilter !== 'all' && cl.audience !== audienceFilter) return false;
    return true;
  });

  const handleEdit = (entry: ChangelogEntry) => {
    setSelectedEntry(entry);
    setEditing(true);
    setEditContent(entry.content);
  };

  const handleSave = () => {
    if (selectedEntry) {
      updateChangelog(selectedEntry.id, { content: editContent });
      setEditing(false);
    }
  };

  const handleExport = (entry: ChangelogEntry, format: 'md' | 'html') => {
    const content = format === 'html' ? markdownToHtml(entry.content) : entry.content;
    const blob = new Blob([content], { type: format === 'html' ? 'text/html' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changelog-${entry.id}.${format === 'html' ? 'html' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Changelogs</h1>
          <p className="text-surface-500 mt-1">AI-generated release notes for your users</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-surface-500">{filtered.length} entries</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
          {(['all', 'draft', 'approved', 'published'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === f ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
          {(['all', 'external', 'internal'] as const).map(f => (
            <button
              key={f}
              onClick={() => setAudienceFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                audienceFilter === f ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-200 p-8 text-center">
              <FileText size={32} className="mx-auto text-surface-300 mb-2" />
              <p className="text-sm text-surface-500">No changelogs match your filters.</p>
            </div>
          ) : (
            filtered.map(entry => (
              <button
                key={entry.id}
                onClick={() => { setSelectedEntry(entry); setEditing(false); }}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${
                  selectedEntry?.id === entry.id ? 'border-primary-300 ring-2 ring-primary-100' : 'border-surface-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    entry.category === 'feature' ? 'bg-accent-500' :
                    entry.category === 'bugfix' ? 'bg-red-500' :
                    entry.category === 'breaking' ? 'bg-orange-500' :
                    'bg-amber-500'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-surface-900 truncate">{entry.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{entry.summary}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={entry.status} />
                      <span className="text-xs text-surface-400">{entry.version}</span>
                      <span className="text-xs text-surface-400">
                        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: false })} ago
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedEntry ? (
            <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
              {/* Header */}
              <div className="p-5 border-b border-surface-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={selectedEntry.status} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        selectedEntry.audience === 'external' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                      }`}>{selectedEntry.audience}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        selectedEntry.category === 'feature' ? 'bg-accent-50 text-accent-700' :
                        selectedEntry.category === 'bugfix' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>{selectedEntry.category}</span>
                    </div>
                    <h2 className="text-lg font-bold text-surface-900">{selectedEntry.title}</h2>
                    <p className="text-sm text-surface-500 mt-1">{selectedEntry.summary}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {selectedEntry.status === 'draft' && (
                    <button
                      onClick={() => updateChangelog(selectedEntry.id, { status: 'approved' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {(selectedEntry.status === 'draft' || selectedEntry.status === 'approved') && (
                    <button
                      onClick={() => publishChangelog(selectedEntry.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-700 hover:bg-accent-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Send size={14} /> Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(selectedEntry)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium transition-colors">
                      <Download size={14} /> Export <ChevronDown size={12} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-surface-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-10 min-w-[120px]">
                      <button onClick={() => handleExport(selectedEntry, 'md')} className="w-full text-left px-3 py-1.5 text-xs text-surface-700 hover:bg-surface-50">Markdown</button>
                      <button onClick={() => handleExport(selectedEntry, 'html')} className="w-full text-left px-3 py-1.5 text-xs text-surface-700 hover:bg-surface-50">HTML</button>
                    </div>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(selectedEntry.content); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {editing ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-96 p-4 border border-surface-200 rounded-lg text-sm font-mono text-surface-800 focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none resize-none"
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                        Save Changes
                      </button>
                      <button onClick={() => setEditing(false)} className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-200 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <MarkdownRenderer content={selectedEntry.content} />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-surface-100 bg-surface-50 rounded-b-xl">
                <div className="flex items-center justify-between text-xs text-surface-400">
                  <span>Created {format(new Date(selectedEntry.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  {selectedEntry.publishedAt && (
                    <span>Published {format(new Date(selectedEntry.publishedAt), 'MMM d, yyyy h:mm a')}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-surface-200 p-12 text-center">
              <Eye size={32} className="mx-auto text-surface-300 mb-2" />
              <p className="text-sm text-surface-500">Select a changelog entry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    draft: { bg: 'bg-surface-100', text: 'text-surface-600', icon: <Edit3 size={10} /> },
    approved: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Check size={10} /> },
    published: { bg: 'bg-accent-50', text: 'text-accent-700', icon: <Send size={10} /> },
  };
  const c = config[status] || config.draft;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
      {c.icon} {status}
    </span>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-surface-900 mt-4 mb-2">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-surface-800 mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith('- **')) {
          const match = line.match(/- \*\*(.+?)\*\*\s*[-–]?\s*(.*)/);
          if (match) return <p key={i} className="text-sm text-surface-700 ml-4">• <strong>{match[1]}</strong> {match[2] && `- ${match[2]}`}</p>;
        }
        if (line.startsWith('- ')) return <p key={i} className="text-sm text-surface-700 ml-4">• {line.slice(2)}</p>;
        if (line.startsWith('```')) return null;
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return <p key={i} className="text-sm text-surface-700">{line}</p>;
      })}
    </div>
  );
}

function markdownToHtml(md: string): string {
  return `<!DOCTYPE html><html><head><style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}code{background:#f1f5f9;padding:2px 6px;border-radius:4px}pre{background:#f1f5f9;padding:16px;border-radius:8px;overflow-x:auto}</style></head><body><pre>${md.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`;
}
