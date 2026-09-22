import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow, format } from 'date-fns';
import { BookOpen, Check, Send, Edit3, Eye, Copy, Download, ChevronDown, FileText } from 'lucide-react';
import { DocEntry } from '../types';

export function Docs() {
  const { docs, updateDoc, publishDoc } = useApp();
  const [filter, setFilter] = useState<'all' | 'draft' | 'approved' | 'published'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'api' | 'guide' | 'reference'>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const filtered = docs.filter(doc => {
    if (filter !== 'all' && doc.status !== filter) return false;
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
    return true;
  });

  const handleEdit = (doc: DocEntry) => {
    setSelectedDoc(doc);
    setEditing(true);
    setEditContent(doc.content);
  };

  const handleSave = () => {
    if (selectedDoc) {
      updateDoc(selectedDoc.id, { content: editContent });
      setEditing(false);
    }
  };

  const handleExport = (doc: DocEntry, format: 'md' | 'html') => {
    const content = format === 'html' ? `<h1>${doc.title}</h1><pre>${doc.content}</pre>` : doc.content;
    const blob = new Blob([content], { type: format === 'html' ? 'text/html' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.${format === 'html' ? 'html' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Documentation</h1>
          <p className="text-surface-500 mt-1">Auto-generated developer docs from code changes</p>
        </div>
        <span className="text-sm text-surface-500">{filtered.length} documents</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
          {(['all', 'draft', 'approved', 'published'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === f ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
              }`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
          {(['all', 'api', 'guide', 'reference'] as const).map(f => (
            <button key={f} onClick={() => setCategoryFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                categoryFilter === f ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
              }`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-200 p-8 text-center">
              <BookOpen size={32} className="mx-auto text-surface-300 mb-2" />
              <p className="text-sm text-surface-500">No documents match your filters.</p>
            </div>
          ) : (
            filtered.map(doc => (
              <button key={doc.id} onClick={() => { setSelectedDoc(doc); setEditing(false); }}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${
                  selectedDoc?.id === doc.id ? 'border-primary-300 ring-2 ring-primary-100' : 'border-surface-200'
                }`}>
                <div className="flex items-start gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    doc.category === 'api' ? 'bg-blue-50' : doc.category === 'guide' ? 'bg-green-50' : 'bg-purple-50'
                  }`}>
                    <FileText size={14} className={
                      doc.category === 'api' ? 'text-blue-600' : doc.category === 'guide' ? 'text-green-600' : 'text-purple-600'
                    } />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-surface-900 truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        doc.status === 'published' ? 'bg-accent-50 text-accent-700' :
                        doc.status === 'approved' ? 'bg-amber-50 text-amber-700' :
                        'bg-surface-100 text-surface-600'
                      }`}>{doc.status}</span>
                      <span className="text-xs text-surface-400">
                        {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: false })} ago
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
              <div className="p-5 border-b border-surface-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    selectedDoc.category === 'api' ? 'bg-blue-50 text-blue-700' :
                    selectedDoc.category === 'guide' ? 'bg-green-50 text-green-700' :
                    'bg-purple-50 text-purple-700'
                  }`}>{selectedDoc.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    selectedDoc.status === 'published' ? 'bg-accent-50 text-accent-700' :
                    selectedDoc.status === 'approved' ? 'bg-amber-50 text-amber-700' :
                    'bg-surface-100 text-surface-600'
                  }`}>{selectedDoc.status}</span>
                </div>
                <h2 className="text-lg font-bold text-surface-900">{selectedDoc.title}</h2>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {selectedDoc.status === 'draft' && (
                    <button onClick={() => updateDoc(selectedDoc.id, { status: 'approved' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors">
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {(selectedDoc.status === 'draft' || selectedDoc.status === 'approved') && (
                    <button onClick={() => publishDoc(selectedDoc.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-700 hover:bg-accent-100 rounded-lg text-xs font-medium transition-colors">
                      <Send size={14} /> Publish
                    </button>
                  )}
                  <button onClick={() => handleEdit(selectedDoc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium transition-colors">
                    <Edit3 size={14} /> Edit
                  </button>
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium transition-colors">
                      <Download size={14} /> Export <ChevronDown size={12} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-surface-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-10 min-w-[120px]">
                      <button onClick={() => handleExport(selectedDoc, 'md')} className="w-full text-left px-3 py-1.5 text-xs text-surface-700 hover:bg-surface-50">Markdown</button>
                      <button onClick={() => handleExport(selectedDoc, 'html')} className="w-full text-left px-3 py-1.5 text-xs text-surface-700 hover:bg-surface-50">HTML</button>
                    </div>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(selectedDoc.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium transition-colors">
                    <Copy size={14} /> Copy
                  </button>
                </div>
              </div>

              <div className="p-5">
                {editing ? (
                  <div>
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-96 p-4 border border-surface-200 rounded-lg text-sm font-mono text-surface-800 focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none resize-none" />
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Save</button>
                      <button onClick={() => setEditing(false)} className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-200 transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {selectedDoc.content.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-surface-900 mb-3">{line.slice(2)}</h1>;
                      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-surface-900 mt-4 mb-2">{line.slice(3)}</h2>;
                      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-surface-800 mt-3 mb-1">{line.slice(4)}</h3>;
                      if (line.startsWith('| ')) return <p key={i} className="text-xs font-mono text-surface-600 bg-surface-50 px-2 py-0.5">{line}</p>;
                      if (line.startsWith('- ')) return <p key={i} className="text-sm text-surface-700 ml-4">• {line.slice(2)}</p>;
                      if (line.startsWith('```')) return <div key={i} className="border-t border-b border-surface-200 bg-surface-50 my-2" />;
                      if (line.trim() === '') return <div key={i} className="h-2" />;
                      return <p key={i} className="text-sm text-surface-700">{line}</p>;
                    })}
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-surface-100 bg-surface-50 rounded-b-xl">
                <div className="flex items-center justify-between text-xs text-surface-400">
                  <span>Created {format(new Date(selectedDoc.createdAt), 'MMM d, yyyy')}</span>
                  <span>Updated {format(new Date(selectedDoc.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-surface-200 p-12 text-center">
              <Eye size={32} className="mx-auto text-surface-300 mb-2" />
              <p className="text-sm text-surface-500">Select a document to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
