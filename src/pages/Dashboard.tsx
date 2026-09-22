import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { GitPullRequest, FileText, BookOpen, Zap, TrendingUp, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

export function Dashboard() {
  const { pullRequests, changelogs, docs, repositories, generationJobs, setPage, generateDocs, syncPullRequests, isLoading } = useApp();

  const mergedPRs = pullRequests.filter(pr => pr.state === 'merged');
  const draftChangelogs = changelogs.filter(cl => cl.status === 'draft');
  const enabledRepos = repositories.filter(r => r.enabled);
  const totalTokens = changelogs.reduce((sum, cl) => sum + cl.tokensUsed, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="text-surface-500 mt-1">Overview of your documentation pipeline</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<GitPullRequest size={20} className="text-primary-500" />} label="Merged PRs" value={mergedPRs.length} change={`${pullRequests.filter(p => !p.processed).length} unprocessed`} />
        <StatCard icon={<FileText size={20} className="text-accent-500" />} label="Changelogs" value={changelogs.length} change={`${draftChangelogs.length} drafts`} />
        <StatCard icon={<BookOpen size={20} className="text-purple-500" />} label="Documents" value={docs.length} change={`${docs.filter(d => d.status === 'published').length} published`} />
        <StatCard icon={<Zap size={20} className="text-amber-500" />} label="AI Tokens" value={totalTokens.toLocaleString()} change="Total used" />
      </div>

      {/* Recent Jobs */}
      {generationJobs.length > 0 && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm mb-6">
          <div className="p-5 border-b border-surface-100">
            <h2 className="font-semibold text-surface-900">Recent Generation Jobs</h2>
          </div>
          <div className="divide-y divide-surface-100">
            {generationJobs.slice(0, 3).map(job => (
              <div key={job.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {job.status === 'completed' ? <CheckCircle2 size={16} className="text-accent-500" /> :
                   job.status === 'failed' ? <AlertCircle size={16} className="text-red-500" /> :
                   <RefreshCw size={16} className="text-primary-500 animate-spin" />}
                  <div>
                    <p className="text-sm font-medium text-surface-900">{job.progress}</p>
                    <p className="text-xs text-surface-400">{job.model} • {job.tokensUsed} tokens</p>
                  </div>
                </div>
                <span className="text-xs text-surface-400">{formatDistanceToNow(new Date(job.startedAt), { addSuffix: true })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-surface-100">
            <h2 className="font-semibold text-surface-900">Merged Pull Requests</h2>
            {enabledRepos.length > 0 && (
              <button onClick={() => syncPullRequests(enabledRepos[0].fullName)} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                <RefreshCw size={12} /> Sync
              </button>
            )}
          </div>
          <div className="divide-y divide-surface-100">
            {mergedPRs.length === 0 ? (
              <div className="p-8 text-center">
                <GitPullRequest size={32} className="mx-auto text-surface-300 mb-2" />
                <p className="text-sm text-surface-500">No PRs yet. Connect a repository and sync.</p>
                <button onClick={() => setPage('integrations')} className="mt-2 text-xs text-primary-600 font-medium">Go to Integrations →</button>
              </div>
            ) : (
              mergedPRs.slice(0, 5).map(pr => (
                <div key={pr.id} className="p-4 hover:bg-surface-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{pr.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-surface-400">{pr.repositoryFullName}</span>
                        <span className="text-surface-300">•</span>
                        <span className="text-xs text-surface-400">#{pr.number}</span>
                        {pr.processed && <span className="text-xs bg-accent-50 text-accent-700 px-1.5 py-0.5 rounded-full">Processed</span>}
                      </div>
                    </div>
                    {!pr.processed && (
                      <button onClick={() => generateDocs(pr.id)} className="flex-shrink-0 text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1.5 rounded-lg font-medium transition-colors">
                        Generate
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Draft Changelogs */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-surface-100">
            <h2 className="font-semibold text-surface-900">Pending Review</h2>
            <button onClick={() => setPage('changelogs')} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-surface-100">
            {draftChangelogs.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={32} className="mx-auto text-accent-400 mb-2" />
                <p className="text-sm text-surface-500">All caught up!</p>
              </div>
            ) : (
              draftChangelogs.slice(0, 5).map(cl => (
                <div key={cl.id} className="p-4 hover:bg-surface-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      cl.category === 'feature' ? 'bg-accent-500' : cl.category === 'bugfix' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900">{cl.title}</p>
                      <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{cl.summary}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-surface-400">{cl.model}</span>
                        <span className="text-surface-300">•</span>
                        <span className="text-xs text-surface-400">{cl.tokensUsed} tokens</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change }: { icon: React.ReactNode; label: string; value: string | number; change: string }) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-surface-50 flex items-center justify-center">{icon}</div>
        <TrendingUp size={14} className="text-surface-300" />
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-surface-900">{value}</p>
        <p className="text-xs text-surface-500 mt-0.5">{label}</p>
      </div>
      <p className="text-xs text-surface-400 mt-2">{change}</p>
    </div>
  );
}
