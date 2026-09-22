import React from 'react';
import { useApp } from '../context/AppContext';
import { Plug, Check, X, ExternalLink, RefreshCw, Shield } from 'lucide-react';

export function Integrations() {
  const { integrations, repositories, toggleIntegration } = useApp();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Integrations</h1>
        <p className="text-surface-500 mt-1">Connect your tools to enable automated documentation</p>
      </div>

      <div className="space-y-6">
        {/* GitHub */}
        <IntegrationCard
          name="GitHub"
          description="Track PRs, commits, and code changes. The GitHub App monitors your repositories for merge events."
          icon={<GitHubIcon />}
          status={integrations.github}
          onToggle={() => toggleIntegration('github')}
          details={
            <div className="mt-4 pt-4 border-t border-surface-100">
              <p className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-2">Connected Repositories</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {repositories.map(repo => (
                  <div key={repo.id} className={`flex items-center gap-2 p-2 rounded-lg ${repo.connected ? 'bg-accent-50' : 'bg-surface-50'}`}>
                    <div className={`w-2 h-2 rounded-full ${repo.connected ? 'bg-accent-500' : 'bg-surface-300'}`} />
                    <span className="text-sm text-surface-700 truncate">{repo.fullName}</span>
                    {repo.connected && <span className="text-xs text-surface-400 ml-auto">{repo.prCount} PRs</span>}
                  </div>
                ))}
              </div>
            </div>
          }
        />

        {/* Jira */}
        <IntegrationCard
          name="Jira Cloud"
          description="Link PRs to Jira epics for context-rich documentation. Automatically pulls ticket descriptions and acceptance criteria."
          icon={<JiraIcon />}
          status={integrations.jira}
          onToggle={() => toggleIntegration('jira')}
          details={
            <div className="mt-4 pt-4 border-t border-surface-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-1">Workspace</p>
                  <p className="text-sm text-surface-900 font-medium">acme-dev.atlassian.net</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-1">Project</p>
                  <p className="text-sm text-surface-900 font-medium">ACME - Product</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-1">Synced Epics</p>
                  <p className="text-sm text-surface-900 font-medium">4 active</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-1">Last Sync</p>
                  <p className="text-sm text-surface-900 font-medium">2 min ago</p>
                </div>
              </div>
            </div>
          }
        />

        {/* Slack */}
        <IntegrationCard
          name="Slack"
          description="Send changelog drafts to your team channels for review. Supports approval workflows and notifications."
          icon={<SlackIcon />}
          status={integrations.slack}
          onToggle={() => toggleIntegration('slack')}
          details={
            <div className="mt-4 pt-4 border-t border-surface-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-1">Workspace</p>
                  <p className="text-sm text-surface-900 font-medium">Acme Dev Studio</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-1">Active Channels</p>
                  <p className="text-sm text-surface-900 font-medium">#releases, #product-updates</p>
                </div>
              </div>
            </div>
          }
        />

        {/* OpenAI */}
        <IntegrationCard
          name="OpenAI"
          description="Power the AI documentation engine with GPT-4 Turbo. Processes code diffs and generates human-readable content."
          icon={<OpenAIIcon />}
          status={'connected' as any}
          onToggle={() => {}}
          isLocked
          details={
            <div className="mt-4 pt-4 border-t border-surface-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-1">Model</p>
                  <p className="text-sm text-surface-900 font-medium">gpt-4-turbo</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-1">Embeddings</p>
                  <p className="text-sm text-surface-900 font-medium">text-embedding-3-small</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-1">Tokens Used (MTD)</p>
                  <p className="text-sm text-surface-900 font-medium">12,430</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 mb-1">Mode</p>
                  <p className="text-sm text-surface-900 font-medium">Mock (Demo)</p>
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

function IntegrationCard({ name, description, icon, status, onToggle, details, isLocked }: {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: string;
  onToggle: () => void;
  details?: React.ReactNode;
  isLocked?: boolean;
}) {
  const isConnected = status === 'connected';

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-surface-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-surface-100">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-900">{name}</h3>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                isConnected ? 'bg-accent-50 text-accent-700' : 'bg-surface-100 text-surface-500'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent-500' : 'bg-surface-400'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="text-sm text-surface-500 mt-1">{description}</p>
          </div>
          {!isLocked && (
            <button
              onClick={onToggle}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                isConnected
                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
              }`}
            >
              {isConnected ? <><X size={14} /> Disconnect</> : <><Plug size={14} /> Connect</>}
            </button>
          )}
          {isLocked && (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-50 rounded-lg text-sm text-surface-500 flex-shrink-0">
              <Shield size={14} /> Configured
            </div>
          )}
        </div>
        {details}
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-surface-800">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function JiraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="text-blue-600">
      <path fill="currentColor" d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84c0-.46-.18-.9-.5-1.22L19.77.5c-.32-.32-.76-.5-1.22-.5h-7.02c0 2.4 1.97 4.35 4.35 4.35H17v1.7h-1.12c-2.4 0-4.35-1.94-4.35-4.35zM2 12.3c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35v-9.56c0-.46-.18-.9-.5-1.22l-1.13-1.12c-.32-.32-.76-.5-1.22-.5H2.84c0 2.4 1.97 4.35 4.35 4.35H8.3v1.7H7.18c-2.4 0-4.35-1.94-4.35-4.35z"/>
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="text-purple-600">
      <path fill="currentColor" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  );
}

function OpenAIIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="text-green-600">
      <path fill="currentColor" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.266 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.753-7.073zM13.266 22.73a4.785 4.785 0 0 1-3.06-1.105c.042-.023.117-.064.167-.1a8.865 8.865 0 0 0 1.57-.958 1.39 1.39 0 0 0 .54-1.104v-6.2c0-.106.023-.182.12-.228l5.286-3.05a.285.285 0 0 1 .272 0l1.62.938c.12.068.156.165.06.272a8.253 8.253 0 0 1-.816 1.008 1.404 1.404 0 0 0-.54 1.104v6.272c0 .106-.023.182-.12.228l-5.286 3.05a.243.243 0 0 1-.135.038zM3.463 17.82a4.796 4.796 0 0 1-.573-3.232c.042.028.117.07.167.1a8.465 8.465 0 0 0 1.632.878 1.373 1.373 0 0 0 1.222 0l5.4-3.118a.262.262 0 0 1 .242 0l1.62.938c.12.068.156.165.06.272a9.185 9.185 0 0 1-.868.992 1.388 1.388 0 0 0-.54 1.104v6.2c0 .106-.023.182-.12.228l-1.62.938a.285.285 0 0 1-.272 0 8.417 8.417 0 0 1-1.57-1.008 1.39 1.39 0 0 0-1.222 0l-5.4 3.118a.243.243 0 0 1-.135.038zm-1.38-8.108a4.796 4.796 0 0 1 2.49-2.128c-.015.05-.05.12-.064.174a8.465 8.465 0 0 0-.24 1.8c0 .47.183.918.54 1.222l5.4 3.118a.262.262 0 0 1 .12.212v1.878a.249.249 0 0 1-.12.212l-1.62.938a.285.285 0 0 1-.272 0 8.417 8.417 0 0 1-1.57-1.008 1.388 1.388 0 0 0-1.222 0l-5.4 3.118a.243.243 0 0 1-.135.038 4.796 4.796 0 0 1-.573-3.232l1.62-.938a.262.262 0 0 1 .242 0zm18.42-3.89a4.796 4.796 0 0 1 .573 3.232c-.042-.028-.117-.07-.167-.1a8.465 8.465 0 0 0-1.632-.878 1.373 1.373 0 0 0-1.222 0l-5.4 3.118a.262.262 0 0 1-.242 0l-1.62-.938c-.12-.068-.156-.165-.06-.272a9.185 9.185 0 0 1 .868-.992 1.388 1.388 0 0 0 .54-1.104V5.82c0-.106.023-.182.12-.228l1.62-.938a.285.285 0 0 1 .272 0 8.417 8.417 0 0 1 1.57 1.008 1.39 1.39 0 0 0 1.222 0l5.4-3.118a.243.243 0 0 1 .135-.038 4.796 4.796 0 0 1 .573 3.232l-1.62.938a.262.262 0 0 1-.242 0zM8.014 5.67a4.796 4.796 0 0 1 3.06 1.105c-.042.023-.117.064-.167.1a8.865 8.865 0 0 0-1.57.958 1.39 1.39 0 0 0-.54 1.104v6.2a.262.262 0 0 1-.12.228l-1.62.938a.285.285 0 0 1-.272 0 8.417 8.417 0 0 1-1.57-1.008 1.388 1.388 0 0 0-1.222 0l-1.62-.938c-.12-.068-.156-.165-.06-.272a8.465 8.465 0 0 0 .816-1.008 1.404 1.404 0 0 0 .54-1.104V5.82c0-.106.023-.182.12-.228l1.62-.938a.285.285 0 0 1 .272 0 8.417 8.417 0 0 1 1.57 1.008 1.39 1.39 0 0 0 1.222 0zm5.4-1.89a.243.243 0 0 1 .135-.038 4.796 4.796 0 0 1 3.06 1.105c-.042.023-.117.064-.167.1a8.865 8.865 0 0 0-1.57.958 1.39 1.39 0 0 0-.54 1.104v6.2a.262.262 0 0 1-.12.228l-1.62.938a.285.285 0 0 1-.272 0 8.417 8.417 0 0 1-1.57-1.008 1.388 1.388 0 0 0-1.222 0l-1.62-.938c-.12-.068-.156-.165-.06-.272a8.465 8.465 0 0 0 .816-1.008 1.404 1.404 0 0 0 .54-1.104V3.85c0-.106.023-.182.12-.228l1.62-.938a.285.285 0 0 1 .272 0 8.417 8.417 0 0 1 1.57 1.008 1.39 1.39 0 0 0 1.222 0z"/>
    </svg>
  );
}
