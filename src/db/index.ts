import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Credentials, Organization, Repository, PullRequest, ChangelogEntry, DocEntry, WebhookConfig, GenerationJob } from '../types';

interface DocuReleaseDB extends DBSchema {
  credentials: {
    key: string;
    value: Credentials;
  };
  organization: {
    key: string;
    value: Organization;
  };
  repositories: {
    key: string;
    value: Repository;
    indexes: { 'by-fullName': string };
  };
  pullRequests: {
    key: string;
    value: PullRequest;
    indexes: { 'by-repo': string; 'by-state': string; 'by-mergedAt': string };
  };
  changelogs: {
    key: string;
    value: ChangelogEntry;
    indexes: { 'by-status': string; 'by-createdAt': string };
  };
  docs: {
    key: string;
    value: DocEntry;
    indexes: { 'by-status': string; 'by-category': string };
  };
  webhooks: {
    key: string;
    value: WebhookConfig;
  };
  generationJobs: {
    key: string;
    value: GenerationJob;
    indexes: { 'by-status': string; 'by-startedAt': string };
  };
}

let dbInstance: IDBPDatabase<DocuReleaseDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<DocuReleaseDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DocuReleaseDB>('docurelease-db', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        // Credentials store
        db.createObjectStore('credentials');

        // Organization store
        db.createObjectStore('organization', { keyPath: 'id' });

        // Repositories
        const repoStore = db.createObjectStore('repositories', { keyPath: 'id' });
        repoStore.createIndex('by-fullName', 'fullName');

        // Pull Requests
        const prStore = db.createObjectStore('pullRequests', { keyPath: 'id' });
        prStore.createIndex('by-repo', 'repositoryFullName');
        prStore.createIndex('by-state', 'state');
        prStore.createIndex('by-mergedAt', 'mergedAt');

        // Changelogs
        const clStore = db.createObjectStore('changelogs', { keyPath: 'id' });
        clStore.createIndex('by-status', 'status');
        clStore.createIndex('by-createdAt', 'createdAt');

        // Docs
        const docStore = db.createObjectStore('docs', { keyPath: 'id' });
        docStore.createIndex('by-status', 'status');
        docStore.createIndex('by-category', 'category');

        // Webhooks
        db.createObjectStore('webhooks', { keyPath: 'id' });

        // Generation Jobs
        const jobStore = db.createObjectStore('generationJobs', { keyPath: 'id' });
        jobStore.createIndex('by-status', 'status');
        jobStore.createIndex('by-startedAt', 'startedAt');
      }

      // v2: Remove legacy jiraIssues store if it exists
      if (oldVersion >= 1 && oldVersion < 2) {
        try {
          if (db.objectStoreNames.contains('jiraIssues' as any)) {
            db.deleteObjectStore('jiraIssues' as any);
          }
        } catch {
          // ignore
        }
      }
    },
  });

  return dbInstance;
}

// Credentials
export async function getCredentials(): Promise<Credentials | null> {
  const db = await getDB();
  const result = await db.get('credentials', 'primary');
  return result || null;
}

export async function saveCredentials(creds: Credentials): Promise<void> {
  const db = await getDB();
  await db.put('credentials', creds, 'primary');
}

export async function clearCredentials(): Promise<void> {
  const db = await getDB();
  await db.clear('credentials');
}

// Organization
export async function getOrganization(): Promise<Organization | null> {
  const db = await getDB();
  const all = await db.getAll('organization');
  return all[0] || null;
}

export async function saveOrganization(org: Organization): Promise<void> {
  const db = await getDB();
  await db.put('organization', org);
}

// Repositories
export async function getAllRepositories(): Promise<Repository[]> {
  const db = await getDB();
  return db.getAll('repositories');
}

export async function saveRepositories(repos: Repository[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('repositories', 'readwrite');
  for (const repo of repos) {
    await tx.store.put(repo);
  }
  await tx.done;
}

export async function updateRepository(id: string, updates: Partial<Repository>): Promise<void> {
  const db = await getDB();
  const repo = await db.get('repositories', id);
  if (repo) {
    await db.put('repositories', { ...repo, ...updates });
  }
}

// Pull Requests
export async function getAllPullRequests(): Promise<PullRequest[]> {
  const db = await getDB();
  return db.getAll('pullRequests');
}

export async function savePullRequests(prs: PullRequest[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('pullRequests', 'readwrite');
  for (const pr of prs) {
    await tx.store.put(pr);
  }
  await tx.done;
}

export async function updatePullRequest(id: string, updates: Partial<PullRequest>): Promise<void> {
  const db = await getDB();
  const pr = await db.get('pullRequests', id);
  if (pr) {
    await db.put('pullRequests', { ...pr, ...updates });
  }
}

// Changelogs
export async function getAllChangelogs(): Promise<ChangelogEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex('changelogs', 'by-createdAt');
}

export async function saveChangelog(entry: ChangelogEntry): Promise<void> {
  const db = await getDB();
  await db.put('changelogs', entry);
}

export async function updateChangelog(id: string, updates: Partial<ChangelogEntry>): Promise<void> {
  const db = await getDB();
  const entry = await db.get('changelogs', id);
  if (entry) {
    await db.put('changelogs', { ...entry, ...updates });
  }
}

// Docs
export async function getAllDocs(): Promise<DocEntry[]> {
  const db = await getDB();
  return db.getAll('docs');
}

export async function saveDoc(entry: DocEntry): Promise<void> {
  const db = await getDB();
  await db.put('docs', entry);
}

export async function updateDoc(id: string, updates: Partial<DocEntry>): Promise<void> {
  const db = await getDB();
  const entry = await db.get('docs', id);
  if (entry) {
    await db.put('docs', { ...entry, ...updates });
  }
}

// Webhooks
export async function getAllWebhooks(): Promise<WebhookConfig[]> {
  const db = await getDB();
  return db.getAll('webhooks');
}

export async function saveWebhook(webhook: WebhookConfig): Promise<void> {
  const db = await getDB();
  await db.put('webhooks', webhook);
}

export async function deleteWebhook(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('webhooks', id);
}

// Generation Jobs
export async function getAllGenerationJobs(): Promise<GenerationJob[]> {
  const db = await getDB();
  return db.getAllFromIndex('generationJobs', 'by-startedAt');
}

export async function saveGenerationJob(job: GenerationJob): Promise<void> {
  const db = await getDB();
  await db.put('generationJobs', job);
}

export async function updateGenerationJob(id: string, updates: Partial<GenerationJob>): Promise<void> {
  const db = await getDB();
  const job = await db.get('generationJobs', id);
  if (job) {
    await db.put('generationJobs', { ...job, ...updates });
  }
}
