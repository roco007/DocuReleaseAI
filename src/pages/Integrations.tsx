import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { GitHubService } from '../services/github';
import { Check, X, Loader2, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';

export function Integrations() {
  const { credentials } = useAuth();
  const { repositories, syncRepositories, toggleRepository, loadData } = useApp();
  const [syncing, setSyncing] = useState(false);
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const testGitHub = async () => {
    if (!credentials?.githubToken) return;
    setTesting(true);
    try {
      const gh = new GitHubService(credentials.githubToken);
      const user = await gh.testConnection();
      setGithubUser(user.login);
    } catch {
      setGithubUser(null);
    }
    setTesting(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncRepositories();
    } catch { /* handled in context */ }
    setSyncing(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Integrations</h1>
        <p className="text-surface-500 mt-1">Connect your tools to enable automated documentation</p>
      </div>

      <div className="space-y-6">
        {/* Gemini Status */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" className="text-green-600">
                <path fill="currentColor" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.266 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.753-7.073zM13.266 22.73a4.785 4.785 0 0 1-3.06-1.105c.042-.023.117-.064.167-.1a8.865 8.865 0 0 0 1.57-.958 1.39 1.39 0 0 0 .54-1.104v-6.2c0-.106.023-.182.12-.228l5.286-3.05a.285.285 0 0 1 .272 0l1.62.938c.12.068.156.165.06.272a8.253 8.253 0 0 1-.816 1.008 1.404 1.404 0 0 0-.54 1.104v6.272c0 .106-.023.182-.12.228l-5.286 3.05a.243.243 0 0 1-.135.038z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-900">Google Gemini AI</h3>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-accent-50 text-accent-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500" /> Connected
                </span>
              </div>
              <p className="text-sm text-surface-500 mt-1">Model: {credentials?.geminiModel || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* GitHub */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-surface-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-surface-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-surface-800">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-900">GitHub</h3>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${githubUser ? 'bg-accent-50 text-accent-700' : 'bg-surface-100 text-surface-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${githubUser ? 'bg-accent-500' : 'bg-surface-400'}`} />
                  {githubUser ? `Connected as ${githubUser}` : 'Not verified'}
                </span>
              </div>
              <p className="text-sm text-surface-500 mt-1">Track PRs, commits, and code changes from your repositories.</p>

              <div className="flex items-center gap-2 mt-3">
                <button onClick={testGitHub} disabled={testing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg text-xs font-medium">
                  {testing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Test Connection
                </button>
                <button onClick={handleSync} disabled={syncing || !credentials?.githubToken}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-xs font-medium">
                  {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  {syncing ? 'Syncing...' : 'Sync Repositories'}
                </button>
              </div>

              {repositories.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-100">
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-2">Repositories ({repositories.length})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {repositories.map(repo => (
                      <div key={repo.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-50 border border-surface-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-surface-700 truncate">{repo.fullName}</span>
                        </div>
                        <button onClick={() => toggleRepository(repo.id)} className="flex-shrink-0">
                          {repo.enabled ? <ToggleRight size={20} className="text-accent-500" /> : <ToggleLeft size={20} className="text-surface-400" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Jira */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" className="text-blue-600">
                <path fill="currentColor" d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84c0-.46-.18-.9-.5-1.22L19.77.5c-.32-.32-.76-.5-1.22-.5h-7.02c0 2.4 1.97 4.35 4.35 4.35H17v1.7h-1.12c-2.4 0-4.35-1.94-4.35-4.35zM2 12.3c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35v-9.56c0-.46-.18-.9-.5-1.22l-1.13-1.12c-.32-.32-.76-.5-1.22-.5H2.84c0 2.4 1.97 4.35 4.35 4.35H8.3v1.7H7.18c-2.4 0-4.35-1.94-4.35-4.35z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-900">Jira Cloud</h3>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${credentials?.jiraApiToken ? 'bg-accent-50 text-accent-700' : 'bg-surface-100 text-surface-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${credentials?.jiraApiToken ? 'bg-accent-500' : 'bg-surface-400'}`} />
                  {credentials?.jiraApiToken ? 'Connected' : 'Not configured'}
                </span>
              </div>
              <p className="text-sm text-surface-500 mt-1">Link PRs to Jira issues for context-rich documentation.</p>
              {credentials?.jiraDomain && (
                <p className="text-xs text-surface-400 mt-1">Domain: {credentials.jiraDomain}.atlassian.net</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
