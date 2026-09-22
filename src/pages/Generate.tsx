import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, GitPullRequest, Loader2, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function Generate() {
  const { pullRequests, repositories, generateDocs, syncPullRequests, generationJobs } = useApp();
  const [selectedPR, setSelectedPR] = useState('');
  const [syncing, setSyncing] = useState(false);

  const mergedPRs = pullRequests.filter(pr => pr.state === 'merged');
  const enabledRepos = repositories.filter(r => r.enabled);

  const handleSync = async () => {
    setSyncing(true);
    for (const repo of enabledRepos) {
      try {
        await syncPullRequests(repo.fullName);
      } catch { /* continue */ }
    }
    setSyncing(false);
  };

  const handleGenerate = async () => {
    if (!selectedPR) return;
    await generateDocs(selectedPR);
    setSelectedPR('');
  };

  const activeJobs = generationJobs.filter(j => j.status === 'processing' || j.status === 'queued');

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Generate Documentation</h1>
        <p className="text-surface-500 mt-1">Select a merged PR to auto-generate changelogs and docs with Gemini AI</p>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 size={16} className="text-primary-600 animate-spin" />
            <span className="text-sm font-medium text-primary-900">Processing {activeJobs.length} job(s)...</span>
          </div>
          {activeJobs.map(job => (
            <div key={job.id} className="text-xs text-primary-700 ml-6">{job.progress}</div>
          ))}
        </div>
      )}

      {/* Sync & Generate Card */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-surface-900">AI-Powered Generation</h2>
            <p className="text-xs text-surface-500">Google Gemini analyzes code diffs from your PRs</p>
          </div>
        </div>

        {/* Sync Button */}
        {enabledRepos.length > 0 && (
          <div className="mb-4 p-3 bg-surface-50 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-900">Sync Latest PRs</p>
                <p className="text-xs text-surface-500">Fetch merged PRs from {enabledRepos.length} enabled repo(s)</p>
              </div>
              <button onClick={handleSync} disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-200 text-surface-700 hover:bg-surface-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        )}

        {/* PR Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-surface-700 mb-2">Select Merged PR</label>
          {mergedPRs.length === 0 ? (
            <div className="p-6 text-center bg-surface-50 rounded-lg border border-surface-200">
              <GitPullRequest size={24} className="mx-auto text-surface-300 mb-2" />
              <p className="text-sm text-surface-500">No merged PRs found. Sync your repositories first.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {mergedPRs.map(pr => (
                <button key={pr.id} onClick={() => setSelectedPR(pr.id)} disabled={activeJobs.length > 0}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${selectedPR === pr.id ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-100' : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'} ${activeJobs.length > 0 ? 'opacity-50 cursor-not-allowed' : ''} ${pr.processed ? 'opacity-70' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <GitPullRequest size={14} className="text-purple-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-surface-900 truncate">{pr.title}</span>
                        {pr.processed && <CheckCircle2 size={14} className="text-accent-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 ml-5">
                        <span className="text-xs text-surface-400">{pr.repositoryFullName}</span>
                        <span className="text-surface-300">•</span>
                        <span className="text-xs text-surface-400">#{pr.number}</span>
                        <span className="text-surface-300">•</span>
                        <span className="text-xs text-surface-400">+{pr.additions}/-{pr.deletions}</span>
                        <span className="text-surface-300">•</span>
                        <span className="text-xs text-surface-400">{pr.filesChanged} files</span>
                      </div>
                    </div>
                    <span className="text-xs text-surface-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(pr.mergedAt || pr.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button onClick={handleGenerate} disabled={!selectedPR || activeJobs.length > 0}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${!selectedPR || activeJobs.length > 0 ? 'bg-surface-100 text-surface-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 shadow-md hover:shadow-lg'}`}>
          {activeJobs.length > 0 ? (
            <><Loader2 size={16} className="animate-spin" /> Processing...</>
          ) : (
            <><Sparkles size={16} /> Generate with Gemini <ArrowRight size={16} /></>
          )}
        </button>
      </div>

      {/* Workflow */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
        <h3 className="font-semibold text-surface-900 mb-4">Generation Pipeline</h3>
        <div className="space-y-3">
          {[
            { icon: '🔗', title: 'Fetch PR Data', desc: 'Code diff, commit messages, labels from GitHub' },
            { icon: '🧠', title: 'Gemini AI Analysis', desc: 'Model processes code changes and context' },
            { icon: '📝', title: 'Dual Output', desc: 'Customer changelog + developer documentation' },
            { icon: '💬', title: 'Slack Notification', desc: 'Draft sent for team review and approval' },
            { icon: '🚀', title: 'Publish', desc: 'Export to Markdown/HTML when approved' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm">{item.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">{item.title}</p>
                <p className="text-xs text-surface-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
