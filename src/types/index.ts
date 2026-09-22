export interface Organization {
  id: string;
  name: string;
  plan: 'starter' | 'growth' | 'enterprise';
  createdAt: string;
  members: Member[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar: string;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  provider: 'github';
  connected: boolean;
  lastSync: string;
  prCount: number;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: string;
  authorAvatar: string;
  repository: string;
  branch: string;
  status: 'merged' | 'open' | 'closed';
  mergedAt: string;
  labels: string[];
  jiraEpicId?: string;
  diff: string;
  commitMessage: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}

export interface JiraEpic {
  id: string;
  key: string;
  title: string;
  description: string;
  status: 'done' | 'in-progress' | 'todo';
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  linkedPRs: string[];
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
  publishedAt?: string;
  prIds: string[];
  version: string;
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
  prIds: string[];
}

export interface WebhookConfig {
  id: string;
  type: 'slack' | 'custom';
  name: string;
  url: string;
  channel?: string;
  enabled: boolean;
  events: string[];
  lastTriggered?: string;
}

export interface IntegrationStatus {
  github: 'connected' | 'disconnected' | 'pending';
  jira: 'connected' | 'disconnected' | 'pending';
  slack: 'connected' | 'disconnected' | 'pending';
}

export interface AIGenerationResult {
  changelog: ChangelogEntry;
  docs: DocEntry;
  processingTime: number;
  tokensUsed: number;
}

export type Page = 'dashboard' | 'changelogs' | 'docs' | 'integrations' | 'settings' | 'webhooks' | 'new-generation';
