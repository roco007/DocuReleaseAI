import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { FileText, Check, Send, Edit3, Eye, Copy, Download, ChevronDown } from 'lucide-react';
import { ChangelogEntry } from '../types';

export function Changelogs() {
  const { changelogs, updateChangelog, publishChangelog } = useApp();
  const [filter, setFilter] = useState<'all' | 'draft' | 'approved' | 'published'>('all');
  const [selected, setSelected] = useState<ChangelogEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const filtered = filter === 'all' ? changelogs : changelogs.filter(cl => cl.status === filter);

  const handleExport = (entry: ChangelogEntry, fmt: 'md' | 'html') => {
    const content = fmt === 'html' ? `<!DOCTYPE html><html><body><h1>${entry.title}</h1><pre>${entry.content}</pre></body></html>` : entry.content;
    const blob = new Blob([content], { type: fmt === 'html' ? 'text/html' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changelog-${entry.id}.${fmt === 'html' ? 'html' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Changelogs</h1>
        <p className="text-surface-500 mt-1">AI-generated release notes</p>
      </div>

      <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1 mb-6 w-fit">
        {(['all', 'draft', 'approved', 'published'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === f ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-200 p-8 text-center">
              <FileText size={32} className="mx-auto text-surface-300 mb-2" />
              <p className="text-sm text-surface-500">No changelogs yet.</p>
            </div>
          ) : filtered.map(entry => (
            <button key={entry.id} onClick={() => { setSelected(entry); setEditing(false); }}
              className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${selected?.id === entry.id ? 'border-primary-300 ring-2 ring-primary-100' : 'border-surface-200'}`}>
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${entry.category === 'feature' ? 'bg-accent-500' : entry.category === 'bugfix' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-surface-900 truncate">{entry.title}</p>
                  <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{entry.summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.status === 'published' ? 'bg-accent-50 text-accent-700' : entry.status === 'approved' ? 'bg-amber-50 text-amber-700' : 'bg-surface-100 text-surface-600'}`}>{entry.status}</span>
                    <span className="text-xs text-surface-400">{entry.model}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
              <div className="p-5 border-b border-surface-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.status === 'published' ? 'bg-accent-50 text-accent-700' : selected.status === 'approved' ? 'bg-amber-50 text-amber-700' : 'bg-surface-100 text-surface-600'}`}>{selected.status}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.audience === 'external' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{selected.audience}</span>
                  <span className="text-xs text-surface-400">{selected.tokensUsed} tokens</span>
                </div>
                <h2 className="text-lg font-bold text-surface-900">{selected.title}</h2>
                <p className="text-sm text-surface-500 mt-1">{selected.summary}</p>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {selected.status === 'draft' && (
                    <button onClick={() => updateChangelog(selected.id, { status: 'approved' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium"><Check size={14} /> Approve</button>
                  )}
                  {selected.status !== 'published' && (
                    <button onClick={() => publishChangelog(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-700 hover:bg-accent-100 rounded-lg text-xs font-medium"><Send size={14} /> Publish</button>
                  )}
                  <button onClick={() => { setEditing(true); setEditContent(selected.content); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium"><Edit3 size={14} /> Edit</button>
                  <button onClick={() => handleExport(selected, 'md')} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium"><Download size={14} /> Export MD</button>
                  <button onClick={() => handleExport(selected, 'html')} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium"><Download size={14} /> Export HTML</button>
                  <button onClick={() => navigator.clipboard.writeText(selected.content)} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium"><Copy size={14} /> Copy</button>
                </div>
              </div>
              <div className="p-5">
                {editing ? (
                  <div>
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full h-96 p-4 border border-surface-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-200 outline-none resize-none" />
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { updateChangelog(selected.id, { content: editContent }); setEditing(false); }} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Save</button>
                      <button onClick={() => setEditing(false)} className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-200">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {selected.content.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-surface-900 mt-4 mb-2">{line.slice(3)}</h2>;
                      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-surface-800 mt-3 mb-1">{line.slice(4)}</h3>;
                      if (line.startsWith('- ')) return <p key={i} className="text-sm text-surface-700 ml-4">• {line.slice(2)}</p>;
                      if (line.startsWith('```')) return <div key={i} className="bg-surface-50 border border-surface-200 rounded px-3 py-1 my-1 text-xs font-mono text-surface-600">{line}</div>;
                      if (line.trim() === '') return <div key={i} className="h-2" />;
                      return <p key={i} className="text-sm text-surface-700">{line}</p>;
                    })}
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-surface-100 bg-surface-50 rounded-b-xl text-xs text-surface-400">
                Created {format(new Date(selected.createdAt), 'MMM d, yyyy h:mm a')} • Model: {selected.model}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-surface-200 p-12 text-center">
              <Eye size={32} className="mx-auto text-surface-300 mb-2" />
              <p className="text-sm text-surface-500">Select a changelog to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
