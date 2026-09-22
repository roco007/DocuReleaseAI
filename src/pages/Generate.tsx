import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, GitPullRequest, Zap, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function Generate() {
  const { pullRequests, jiraEpics, isGenerating, generationProgress, generateFromPR, changelogs } = useApp();
  const [selectedPR, setSelectedPR] = useState<string>('');

  const mergedPRs = pullRequests.filter(pr => pr.status === 'merged');
  const alreadyGenerated = new Set(changelogs.flatMap(cl => cl.prIds));

  const handleGenerate = async () => {
    if (!selectedPR) return;
    await generateFromPR(selectedPR);
    setSelectedPR('');
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Generate Documentation</h1>
        <p className="text-surface-500 mt-1">Select a merged PR to auto-generate changelogs and developer docs</p>
      </div>

      {/* Generation Card */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-surface-900">AI-Powered Generation</h2>
            <p className="text-xs text-surface-500">GPT-4 Turbo analyzes code diffs + Jira context</p>
          </div>
        </div>

        {/* PR Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-surface-700 mb-2">Select Merged PR</label>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {mergedPRs.map(pr => {
              const epic = pr.jiraEpicId ? jiraEpics.find(e => e.id === pr.jiraEpicId) : null;
              const generated = alreadyGenerated.has(pr.id);
              return (
                <button
                  key={pr.id}
                  onClick={() => setSelectedPR(pr.id)}
                  disabled={isGenerating}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedPR === pr.id
                      ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-100'
                      : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                  } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <GitPullRequest size={14} className="text-purple-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-surface-900 truncate">{pr.title}</span>
                        {generated && <CheckCircle2 size={14} className="text-accent-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 ml-5">
                        <span className="text-xs text-surface-400">{pr.repository}</span>
                        <span className="text-surface-300">•</span>
                        <span className="text-xs text-surface-400">#{pr.number}</span>
                        <span className="text-surface-300">•</span>
                        <span className="text-xs text-surface-400">+{pr.additions}/-{pr.deletions}</span>
                        {epic && (
                          <>
                            <span className="text-surface-300">•</span>
                            <span className="text-xs text-blue-500 font-medium">{epic.key}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-surface-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(pr.mergedAt), { addSuffix: true })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!selectedPR || isGenerating}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
            !selectedPR || isGenerating
              ? 'bg-surface-100 text-surface-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {generationProgress}
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Changelog & Docs
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Processing indicator */}
        {isGenerating && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary-600 animate-pulse-soft" />
              <span className="text-xs text-primary-700 font-medium">{generationProgress}</span>
            </div>
            <div className="mt-2 h-1.5 bg-primary-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full animate-pulse-soft" style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </div>

      {/* Workflow Steps */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
        <h3 className="font-semibold text-surface-900 mb-4">How It Works</h3>
        <div className="space-y-4">
          {[
            { step: 1, title: 'Webhook Trigger', desc: 'PR merge event detected via GitHub App webhook', icon: '🔗' },
            { step: 2, title: 'Context Fetching', desc: 'Diff, commit history, and linked Jira epic retrieved', icon: '📥' },
            { step: 3, title: 'AI Analysis', desc: 'GPT-4 Turbo processes code changes with repository context', icon: '🧠' },
            { step: 4, title: 'Dual Output', desc: 'Customer changelog + internal developer docs generated', icon: '📝' },
            { step: 5, title: 'Slack Review', desc: 'Draft sent to Slack channel for team approval', icon: '💬' },
            { step: 6, title: 'Publish', desc: 'Approved content pushed to changelog page and wiki', icon: '🚀' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
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
