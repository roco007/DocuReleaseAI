export interface Credentials {
  geminiApiKey: string;
  githubToken: string;
  jiraDomain: string;
  jiraEmail: string;
  jiraApiToken: string;
  geminiModel: 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-3.8-flash';
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  brandVoice: string;
  defaultAudience: 'internal' | 'external' | 'both';
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  lastSyncedAt: string | null;
  enabled: boolean;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  body: string;
  author: string;
  authorAvatar: string;
  repositoryFullName: string;
  branch: string;
  state: 'open' | 'closed' | 'merged';
  mergedAt: string | null;
  createdAt: string;
  labels: string[];
  jiraKeys: string[];
  diff: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  processed: boolean;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description: string;
  status: string;
  assignee: string;
  priority: string;
  issueType: string;
  url: string;
}

export interface ChangelogEntry {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'feature' | 'improvement' | 'bugfix' | 'breaking';
  audience: 'internal' | 'external';
  status: 'draft' | 'approved' | 'published';
  createdAt: string;
  publishedAt: string | null;
  prNumbers: number[];
  version: string;
  model: string;
  tokensUsed: number;
}

export interface DocEntry {
  id: string;
  title: string;
  content: string;
  format: 'markdown' | 'html';
  category: 'api' | 'guide' | 'reference';
  status: 'draft' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
  prNumbers: number[];
  model: string;
}

export interface WebhookConfig {
  id: string;
  type: 'slack' | 'discord' | 'custom';
  name: string;
  url: string;
  channel?: string;
  enabled: boolean;
  events: string[];
  createdAt: string;
  lastTriggeredAt: string | null;
  lastStatus: 'success' | 'error' | null;
}

export interface GenerationJob {
  id: string;
  prId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: string;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
  changelogId: string | null;
  docId: string | null;
  tokensUsed: number;
  model: string;
}

export type Page = 'dashboard' | 'changelogs' | 'docs' | 'generate' | 'integrations' | 'webhooks' | 'settings' | 'setup';
