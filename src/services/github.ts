import { Repository, PullRequest } from '../types';

const GITHUB_API = 'https://api.github.com';

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${GITHUB_API}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async testConnection(): Promise<{ login: string; avatar_url: string }> {
    return this.request('/user');
  }

  async getUserRepos(): Promise<Repository[]> {
    const repos = await this.request<Array<{
      id: number;
      name: string;
      full_name: string;
      default_branch: string;
      private: boolean;
      archived: boolean;
      permissions: { admin: boolean; push: boolean };
    }>>('/user/repos?per_page=100&sort=updated&type=all');

    return repos
      .filter(r => !r.archived && (r.permissions.admin || r.permissions.push))
      .map(r => ({
        id: `gh-${r.id}`,
        name: r.name,
        fullName: r.full_name,
        defaultBranch: r.default_branch,
        private: r.private,
        lastSyncedAt: null,
        enabled: false,
      }));
  }

  async getMergedPullRequests(repoFullName: string, since?: string): Promise<PullRequest[]> {
    const params = new URLSearchParams({
      state: 'closed',
      sort: 'updated',
      direction: 'desc',
      per_page: '30',
    });

    interface GHPullRequest {
      number: number;
      title: string;
      body: string;
      user: { login: string; avatar_url: string };
      head: { ref: string };
      merged_at: string | null;
      created_at: string;
      labels: Array<{ name: string }>;
      pull_request: { merged_at: string | null };
    }
    const prs = await this.request<GHPullRequest[]>(`/repos/${repoFullName}/pulls?${params}`);

    const mergedPRs = prs.filter(pr => pr.merged_at || pr.pull_request?.merged_at);

    const results: PullRequest[] = [];
    for (const pr of mergedPRs.slice(0, 15)) {
      try {
        const diff = await this.getPRDiff(repoFullName, pr.number);
        const files = await this.getPRFiles(repoFullName, pr.number);

        results.push({
          id: `pr-${repoFullName}-${pr.number}`,
          number: pr.number,
          title: pr.title,
          body: pr.body || '',
          author: pr.user.login,
          authorAvatar: pr.user.avatar_url,
          repositoryFullName: repoFullName,
          branch: pr.head.ref,
          state: 'merged',
          mergedAt: pr.merged_at || pr.pull_request?.merged_at || new Date().toISOString(),
          createdAt: pr.created_at,
          labels: pr.labels.map(l => l.name),
          diff: diff.substring(0, 15000), // Truncate large diffs
          filesChanged: files.length,
          additions: files.reduce((sum, f) => sum + f.additions, 0),
          deletions: files.reduce((sum, f) => sum + f.deletions, 0),
          processed: false,
        });
      } catch {
        // Skip PRs that fail to fetch
        continue;
      }
    }

    return results;
  }

  private async getPRDiff(repoFullName: string, prNumber: number): Promise<string> {
    const response = await fetch(`${GITHUB_API}/repos/${repoFullName}/pulls/${prNumber}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3.diff',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) return '';
    return response.text();
  }

  private async getPRFiles(repoFullName: string, prNumber: number): Promise<Array<{ additions: number; deletions: number }>> {
    return this.request(`/repos/${repoFullName}/pulls/${prNumber}/files?per_page=100`);
  }

}
