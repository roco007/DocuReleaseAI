import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Organization, Repository, PullRequest,
  ChangelogEntry, DocEntry, WebhookConfig, GenerationJob, Page
} from '../types';
import * as db from '../db';
import { useAuth } from './AuthContext';
import { GeminiService } from '../services/gemini';
import { GitHubService } from '../services/github';
import { SlackService } from '../services/slack';

interface AppState {
  currentPage: Page;
  organization: Organization | null;
  repositories: Repository[];
  pullRequests: PullRequest[];
  changelogs: ChangelogEntry[];
  docs: DocEntry[];
  webhooks: WebhookConfig[];
  generationJobs: GenerationJob[];
  isLoading: boolean;
  error: string | null;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
}

interface AppContextType extends AppState {
  setPage: (page: Page) => void;
  loadData: () => Promise<void>;
  syncRepositories: () => Promise<void>;
  syncPullRequests: (repoFullName: string) => Promise<void>;
  generateDocs: (prId: string) => Promise<void>;
  updateChangelog: (id: string, updates: Partial<ChangelogEntry>) => Promise<void>;
  updateDoc: (id: string, updates: Partial<DocEntry>) => Promise<void>;
  publishChangelog: (id: string) => Promise<void>;
  publishDoc: (id: string) => Promise<void>;
  addWebhook: (webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'lastTriggeredAt' | 'lastStatus'>) => Promise<void>;
  updateWebhook: (id: string, updates: Partial<WebhookConfig>) => Promise<void>;
  removeWebhook: (id: string) => Promise<void>;
  testWebhook: (url: string) => Promise<boolean>;
  saveOrganization: (org: Organization) => Promise<void>;
  toggleRepository: (id: string) => Promise<void>;
  dismissNotification: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { credentials } = useAuth();
  const [state, setState] = useState<AppState>({
    currentPage: 'dashboard',
    organization: null,
    repositories: [],
    pullRequests: [],
    changelogs: [],
    docs: [],
    webhooks: [],
    generationJobs: [],
    isLoading: true,
    error: null,
    notification: null,
  });

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setState(prev => ({ ...prev, notification: { type, message } }));
    setTimeout(() => setState(prev => ({ ...prev, notification: null })), 5000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [org, repos, prs, cls, docs, whs, jobs] = await Promise.all([
        db.getOrganization(),
        db.getAllRepositories(),
        db.getAllPullRequests(),
        db.getAllChangelogs(),
        db.getAllDocs(),
        db.getAllWebhooks(),
        db.getAllGenerationJobs(),
      ]);

      setState(prev => ({
        ...prev,
        organization: org,
        repositories: repos,
        pullRequests: prs.sort((a, b) => new Date(b.mergedAt || b.createdAt).getTime() - new Date(a.mergedAt || a.createdAt).getTime()),
        changelogs: cls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        docs: docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        webhooks: whs,
        generationJobs: jobs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false, error: (err as Error).message }));
    }
  }, []);

  useEffect(() => {
    if (credentials) {
      loadData();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [credentials, loadData]);

  const setPage = useCallback((page: Page) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const syncRepositories = useCallback(async () => {
    if (!credentials?.githubToken) throw new Error('GitHub token not configured');
    const github = new GitHubService(credentials.githubToken);
    const repos = await github.getUserRepos();
    await db.saveRepositories(repos);
    setState(prev => ({ ...prev, repositories: repos }));
    showNotification('success', `Found ${repos.length} repositories`);
  }, [credentials, showNotification]);

  const syncPullRequests = useCallback(async (repoFullName: string) => {
    if (!credentials?.githubToken) throw new Error('GitHub token not configured');
    const github = new GitHubService(credentials.githubToken);
    const prs = await github.getMergedPullRequests(repoFullName);
    await db.savePullRequests(prs);
    await db.updateRepository(
      `gh-${repoFullName}`,
      { lastSyncedAt: new Date().toISOString() }
    );
    await loadData();
    showNotification('success', `Synced ${prs.length} merged PRs from ${repoFullName}`);
  }, [credentials, loadData, showNotification]);

  const generateDocs = useCallback(async (prId: string) => {
    if (!credentials) throw new Error('Not authenticated');

    const pr = state.pullRequests.find(p => p.id === prId);
    if (!pr) throw new Error('PR not found');

    const jobId = `job-${Date.now()}`;
    const job: GenerationJob = {
      id: jobId,
      prId,
      status: 'queued',
      progress: 'Initializing...',
      startedAt: new Date().toISOString(),
      completedAt: null,
      error: null,
      changelogId: null,
      docId: null,
      tokensUsed: 0,
      model: credentials.geminiModel,
    };

    await db.saveGenerationJob(job);
    setState(prev => ({
      ...prev,
      generationJobs: [job, ...prev.generationJobs],
    }));

    try {
      await db.updateGenerationJob(jobId, { status: 'processing', progress: 'Analyzing code changes...' });

      await db.updateGenerationJob(jobId, { progress: 'Generating with Gemini AI...' });

      // Generate with Gemini
      const gemini = new GeminiService(credentials);
      const { result, tokensUsed } = await gemini.generateFromPR(
        pr,
        undefined,
        state.organization?.brandVoice
      );

      await db.updateGenerationJob(jobId, { progress: 'Saving results...' });

      // Save changelog
      const changelog: ChangelogEntry = {
        id: `cl-${Date.now()}`,
        title: result.changelog.title,
        summary: result.changelog.summary,
        content: result.changelog.content,
        category: result.changelog.category,
        audience: result.changelog.audience,
        status: 'draft',
        createdAt: new Date().toISOString(),
        publishedAt: null,
        prNumbers: [pr.number],
        version: 'v1.0.0',
        model: credentials.geminiModel,
        tokensUsed,
      };
      await db.saveChangelog(changelog);

      // Save doc
      const doc: DocEntry = {
        id: `doc-${Date.now()}`,
        title: result.docs.title,
        content: result.docs.content,
        format: 'markdown',
        category: result.docs.category,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prNumbers: [pr.number],
        model: credentials.geminiModel,
      };
      await db.saveDoc(doc);

      // Mark PR as processed
      await db.updatePullRequest(prId, { processed: true });

      // Complete job
      await db.updateGenerationJob(jobId, {
        status: 'completed',
        progress: 'Done',
        completedAt: new Date().toISOString(),
        changelogId: changelog.id,
        docId: doc.id,
        tokensUsed,
      });

      // Send to Slack if configured
      const activeWebhooks = state.webhooks.filter(w => w.enabled && w.events.includes('pr.merged'));
      if (activeWebhooks.length > 0) {
        const slack = new SlackService();
        for (const webhook of activeWebhooks) {
          await slack.sendChangelogDraft(webhook, changelog, doc);
        }
      }

      await loadData();
      showNotification('success', `Generated docs for PR #${pr.number} (${tokensUsed} tokens)`);
    } catch (err) {
      const errorMsg = (err as Error).message;
      await db.updateGenerationJob(jobId, {
        status: 'failed',
        progress: 'Failed',
        completedAt: new Date().toISOString(),
        error: errorMsg,
      });
      await loadData();
      showNotification('error', `Generation failed: ${errorMsg}`);
    }
  }, [credentials, state.pullRequests, state.organization, state.webhooks, loadData, showNotification]);

  const updateChangelog = useCallback(async (id: string, updates: Partial<ChangelogEntry>) => {
    await db.updateChangelog(id, updates);
    await loadData();
  }, [loadData]);

  const updateDoc = useCallback(async (id: string, updates: Partial<DocEntry>) => {
    await db.updateDoc(id, updates);
    await loadData();
  }, [loadData]);

  const publishChangelog = useCallback(async (id: string) => {
    await db.updateChangelog(id, { status: 'published', publishedAt: new Date().toISOString() });
    const cl = state.changelogs.find(c => c.id === id);
    if (cl) {
      const activeWebhooks = state.webhooks.filter(w => w.enabled && w.events.includes('changelog.published'));
      if (activeWebhooks.length > 0) {
        const slack = new SlackService();
        for (const webhook of activeWebhooks) {
          await slack.sendNotification(webhook, `📢 Changelog published: "${cl.title}" (${cl.version})`);
        }
      }
    }
    await loadData();
    showNotification('success', 'Changelog published!');
  }, [state.changelogs, state.webhooks, loadData, showNotification]);

  const publishDoc = useCallback(async (id: string) => {
    await db.updateDoc(id, { status: 'published', updatedAt: new Date().toISOString() });
    await loadData();
    showNotification('success', 'Documentation published!');
  }, [loadData, showNotification]);

  const addWebhook = useCallback(async (webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'lastTriggeredAt' | 'lastStatus'>) => {
    const full: WebhookConfig = {
      ...webhook,
      id: `wh-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastTriggeredAt: null,
      lastStatus: null,
    };
    await db.saveWebhook(full);
    await loadData();
    showNotification('success', 'Webhook added');
  }, [loadData, showNotification]);

  const updateWebhook = useCallback(async (id: string, updates: Partial<WebhookConfig>) => {
    const current = state.webhooks.find(w => w.id === id);
    if (current) {
      await db.saveWebhook({ ...current, ...updates });
      await loadData();
    }
  }, [state.webhooks, loadData]);

  const removeWebhook = useCallback(async (id: string) => {
    await db.deleteWebhook(id);
    await loadData();
    showNotification('info', 'Webhook removed');
  }, [loadData, showNotification]);

  const testWebhook = useCallback(async (url: string): Promise<boolean> => {
    const slack = new SlackService();
    return slack.testWebhook(url);
  }, []);

  const saveOrganization = useCallback(async (org: Organization) => {
    await db.saveOrganization(org);
    setState(prev => ({ ...prev, organization: org }));
    showNotification('success', 'Organization settings saved');
  }, [showNotification]);

  const toggleRepository = useCallback(async (id: string) => {
    const repo = state.repositories.find(r => r.id === id);
    if (repo) {
      await db.updateRepository(id, { enabled: !repo.enabled });
      await loadData();
    }
  }, [state.repositories, loadData]);

  const dismissNotification = useCallback(() => {
    setState(prev => ({ ...prev, notification: null }));
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      setPage,
      loadData,
      syncRepositories,
      syncPullRequests,
      generateDocs,
      updateChangelog,
      updateDoc,
      publishChangelog,
      publishDoc,
      addWebhook,
      updateWebhook,
      removeWebhook,
      testWebhook,
      saveOrganization,
      toggleRepository,
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
