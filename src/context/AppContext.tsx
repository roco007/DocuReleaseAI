import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Organization, Repository, PullRequest, JiraEpic,
  ChangelogEntry, DocEntry, WebhookConfig, IntegrationStatus, Page
} from '../types';
import {
  mockOrganization, mockRepositories, mockPullRequests,
  mockJiraEpics, mockChangelogEntries, mockDocEntries, mockWebhooks
} from '../lib/mock-data';
import { aiProvider } from '../lib/ai-provider';

interface AppState {
  currentPage: Page;
  organization: Organization;
  repositories: Repository[];
  pullRequests: PullRequest[];
  jiraEpics: JiraEpic[];
  changelogs: ChangelogEntry[];
  docs: DocEntry[];
  webhooks: WebhookConfig[];
  integrations: IntegrationStatus;
  isGenerating: boolean;
  generationProgress: string;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
}

interface AppContextType extends AppState {
  setPage: (page: Page) => void;
  generateFromPR: (prId: string) => Promise<void>;
  updateChangelog: (id: string, updates: Partial<ChangelogEntry>) => void;
  updateDoc: (id: string, updates: Partial<DocEntry>) => void;
  publishChangelog: (id: string) => void;
  publishDoc: (id: string) => void;
  toggleWebhook: (id: string) => void;
  addWebhook: (webhook: Omit<WebhookConfig, 'id'>) => void;
  deleteWebhook: (id: string) => void;
  toggleIntegration: (type: keyof IntegrationStatus) => void;
  dismissNotification: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentPage: 'dashboard',
    organization: mockOrganization,
    repositories: mockRepositories,
    pullRequests: mockPullRequests,
    jiraEpics: mockJiraEpics,
    changelogs: mockChangelogEntries,
    docs: mockDocEntries,
    webhooks: mockWebhooks,
    integrations: { github: 'connected', jira: 'connected', slack: 'connected' },
    isGenerating: false,
    generationProgress: '',
    notification: null,
  });

  const setPage = useCallback((page: Page) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setState(prev => ({ ...prev, notification: { type, message } }));
    setTimeout(() => setState(prev => ({ ...prev, notification: null })), 4000);
  }, []);

  const generateFromPR = useCallback(async (prId: string) => {
    const pr = state.pullRequests.find(p => p.id === prId);
    if (!pr) return;

    const epic = pr.jiraEpicId ? state.jiraEpics.find(e => e.id === pr.jiraEpicId) : undefined;

    setState(prev => ({ ...prev, isGenerating: true, generationProgress: 'Fetching PR diff and context...' }));

    try {
      setState(prev => ({ ...prev, generationProgress: 'Analyzing code changes with AI...' }));
      await new Promise(r => setTimeout(r, 800));

      setState(prev => ({ ...prev, generationProgress: 'Generating changelog and documentation...' }));
      const result = await aiProvider.generateFromPR(pr, epic);

      setState(prev => ({
        ...prev,
        changelogs: [result.changelog, ...prev.changelogs],
        docs: [result.docs, ...prev.docs],
        isGenerating: false,
        generationProgress: '',
      }));

      showNotification('success', `Generated changelog and docs for PR #${pr.number} (${result.processingTime.toFixed(0)}ms, ${result.tokensUsed} tokens)`);
    } catch (error) {
      setState(prev => ({ ...prev, isGenerating: false, generationProgress: '' }));
      showNotification('error', 'Failed to generate documentation. Please try again.');
    }
  }, [state.pullRequests, state.jiraEpics, showNotification]);

  const updateChangelog = useCallback((id: string, updates: Partial<ChangelogEntry>) => {
    setState(prev => ({
      ...prev,
      changelogs: prev.changelogs.map(cl => cl.id === id ? { ...cl, ...updates } : cl),
    }));
  }, []);

  const updateDoc = useCallback((id: string, updates: Partial<DocEntry>) => {
    setState(prev => ({
      ...prev,
      docs: prev.docs.map(doc => doc.id === id ? { ...doc, ...updates } : doc),
    }));
  }, []);

  const publishChangelog = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      changelogs: prev.changelogs.map(cl =>
        cl.id === id ? { ...cl, status: 'published' as const, publishedAt: new Date().toISOString() } : cl
      ),
    }));
    showNotification('success', 'Changelog published successfully!');
  }, [showNotification]);

  const publishDoc = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      docs: prev.docs.map(doc =>
        doc.id === id ? { ...doc, status: 'published' as const, updatedAt: new Date().toISOString() } : doc
      ),
    }));
    showNotification('success', 'Documentation published successfully!');
  }, [showNotification]);

  const toggleWebhook = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      webhooks: prev.webhooks.map(wh => wh.id === id ? { ...wh, enabled: !wh.enabled } : wh),
    }));
  }, []);

  const addWebhook = useCallback((webhook: Omit<WebhookConfig, 'id'>) => {
    setState(prev => ({
      ...prev,
      webhooks: [...prev.webhooks, { ...webhook, id: `wh-${Date.now()}` }],
    }));
    showNotification('success', 'Webhook added successfully!');
  }, [showNotification]);

  const deleteWebhook = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      webhooks: prev.webhooks.filter(wh => wh.id !== id),
    }));
    showNotification('info', 'Webhook removed.');
  }, [showNotification]);

  const toggleIntegration = useCallback((type: keyof IntegrationStatus) => {
    setState(prev => {
      const current = prev.integrations[type];
      const next = current === 'connected' ? 'disconnected' : 'connected';
      return { ...prev, integrations: { ...prev.integrations, [type]: next } };
    });
  }, []);

  const dismissNotification = useCallback(() => {
    setState(prev => ({ ...prev, notification: null }));
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      setPage,
      generateFromPR,
      updateChangelog,
      updateDoc,
      publishChangelog,
      publishDoc,
      toggleWebhook,
      addWebhook,
      deleteWebhook,
      toggleIntegration,
      dismissNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
