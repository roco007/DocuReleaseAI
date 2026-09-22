import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText, BookOpen, GitPullRequest, Zap, TrendingUp,
  Clock, CheckCircle2, AlertCircle, ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const { pullRequests, changelogs, docs, repositories, integrations, setPage, generateFromPR } = useApp();

  const mergedPRs = pullRequests.filter(pr => pr.status === 'merged');
  const draftChangelogs = changelogs.filter(cl => cl.status === 'draft');
  const publishedChangelogs = changelogs.filter(cl => cl.status === 'published');
  const connectedRepos = repositories.filter(r => r.connected);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="text-surface-500 mt-1">Overview of your documentation pipeline</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<GitPullRequest size={20} className="text-primary-500" />}
          label="Merged PRs"
          value={mergedPRs.length}
          change="+3 this week"
          color="primary"
        />
        <StatCard
          icon={<FileText size={20} className="text-accent-500" />}
          label="Changelogs"
          value={changelogs.length}
          change={`${draftChangelogs.length} drafts`}
          color="accent"
        />
        <StatCard
          icon={<BookOpen size={20} className="text-purple-500" />}
          label="Documents"
          value={docs.length}
          change={`${docs.filter(d => d.status === 'published').length} published`}
          color="purple"
        />
        <StatCard
          icon={<Zap size={20} className="text-amber-500" />}
          label="AI Tokens Used"
          value="12.4K"
          change="This month"
          color="amber"
        />
      </div>

      {/* Integration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <IntegrationCard
          name="GitHub"
          status={integrations.github}
          icon="🔗"
          detail={`${connectedRepos.length} repos connected`}
        />
        <IntegrationCard
          name="Jira"
          status={integrations.jira}
          icon="📋"
          detail="4 epics synced"
        />
        <IntegrationCard
          name="Slack"
          status={integrations.slack}
          icon="💬"
          detail="2 channels active"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent PRs */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-surface-100">
            <h2 className="font-semibold text-surface-900">Recent Merged PRs</h2>
            <button onClick={() => setPage('new-generation')} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              Generate <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-surface-100">
            {mergedPRs.slice(0, 4).map(pr => (
              <div key={pr.id} className="p-4 hover:bg-surface-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">{pr.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-surface-400">{pr.repository}</span>
                      <span className="text-surface-300">•</span>
                      <span className="text-xs text-surface-400">#{pr.number}</span>
                      <span className="text-surface-300">•</span>
                      <span className="text-xs text-surface-400">{pr.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {pr.labels.map(label => (
                        <span key={label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          label === 'feature' ? 'bg-accent-100 text-accent-700' :
                          label === 'bugfix' ? 'bg-red-100 text-red-700' :
                          label === 'release' ? 'bg-primary-100 text-primary-700' :
                          'bg-surface-100 text-surface-600'
                        }`}>{label}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => generateFromPR(pr.id)}
                    className="flex-shrink-0 text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
            ))}
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
                <p className="text-sm text-surface-500">All caught up! No pending reviews.</p>
              </div>
            ) : (
              draftChangelogs.map(cl => (
                <div key={cl.id} className="p-4 hover:bg-surface-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      cl.category === 'feature' ? 'bg-accent-500' :
                      cl.category === 'bugfix' ? 'bg-red-500' :
                      'bg-amber-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900">{cl.title}</p>
                      <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{cl.summary}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          cl.audience === 'external' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>{cl.audience}</span>
                        <span className="text-xs text-surface-400">{cl.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="mt-6 bg-white rounded-xl border border-surface-200 shadow-sm p-5">
        <h2 className="font-semibold text-surface-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { icon: <CheckCircle2 size={14} />, text: 'Changelog "Bulk Analytics Export" published', time: '2 hours ago', color: 'text-accent-500' },
            { icon: <Zap size={14} />, text: 'AI generated docs for PR #142', time: '3 hours ago', color: 'text-primary-500' },
            { icon: <GitPullRequest size={14} />, text: 'PR #287 merged in acme-frontend', time: '5 hours ago', color: 'text-purple-500' },
            { icon: <AlertCircle size={14} />, text: 'Webhook "Engineering Releases" triggered', time: '6 hours ago', color: 'text-amber-500' },
            { icon: <BookOpen size={14} />, text: 'Documentation "OAuth2 PKCE Guide" approved', time: '1 day ago', color: 'text-blue-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`flex-shrink-0 ${item.color}`}>{item.icon}</div>
              <p className="text-sm text-surface-700 flex-1">{item.text}</p>
              <span className="text-xs text-surface-400 flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, color }: { icon: React.ReactNode; label: string; value: string | number; change: string; color: string }) {
  const bgColors: Record<string, string> = {
    primary: 'bg-primary-50',
    accent: 'bg-accent-50',
    purple: 'bg-purple-50',
    amber: 'bg-amber-50',
  };

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-lg ${bgColors[color]} flex items-center justify-center`}>
          {icon}
        </div>
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

function IntegrationCard({ name, status, icon, detail }: { name: string; status: string; icon: string; detail: string }) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4 flex items-center gap-4">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-surface-900">{name}</p>
        <p className="text-xs text-surface-500">{detail}</p>
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        status === 'connected' ? 'bg-accent-50 text-accent-700' :
        status === 'pending' ? 'bg-amber-50 text-amber-700' :
        'bg-surface-100 text-surface-500'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${
          status === 'connected' ? 'bg-accent-500' :
          status === 'pending' ? 'bg-amber-500' :
          'bg-surface-400'
        }`} />
        {status}
      </div>
    </div>
  );
}
