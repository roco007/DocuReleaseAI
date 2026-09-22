import { JiraIssue } from '../types';

export class JiraService {
  private domain: string;
  private email: string;
  private apiToken: string;

  constructor(domain: string, email: string, apiToken: string) {
    this.domain = domain;
    this.email = email;
    this.apiToken = apiToken;
  }

  private get authHeader(): string {
    return 'Basic ' + btoa(`${this.email}:${this.apiToken}`);
  }

  private async request<T>(path: string): Promise<T> {
    const url = `https://${this.domain}.atlassian.net/rest/api/3${path}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.errorMessages?.[0] || `Jira API error: ${response.status}`);
    }

    return response.json();
  }

  async testConnection(): Promise<{ displayName: string }> {
    const result = await this.request<{ displayName: string }>('/myself');
    return { displayName: result.displayName };
  }

  async searchIssues(jql: string, maxResults = 50): Promise<JiraIssue[]> {
    const encodedJql = encodeURIComponent(jql);
    const result = await this.request<{
      issues: Array<{
        id: string;
        key: string;
        fields: {
          summary: string;
          description: {
            content?: Array<{
              content?: Array<{ text?: string }>;
            }>;
          } | null;
          status: { name: string };
          assignee: { displayName: string } | null;
          priority: { name: string };
          issuetype: { name: string };
        };
      }>;
    }>(`/search?jql=${encodedJql}&maxResults=${maxResults}&fields=summary,description,status,assignee,priority,issuetype`);

    return result.issues.map(issue => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      description: this.extractTextFromDescription(issue.fields.description),
      status: issue.fields.status.name,
      assignee: issue.fields.assignee?.displayName || 'Unassigned',
      priority: issue.fields.priority.name,
      issueType: issue.fields.issuetype.name,
      url: `https://${this.domain}.atlassian.net/browse/${issue.key}`,
    }));
  }

  async getIssuesByKeys(keys: string[]): Promise<JiraIssue[]> {
    if (keys.length === 0) return [];
    const jql = `key in (${keys.map(k => `'${k}'`).join(',')})`;
    return this.searchIssues(jql, keys.length);
  }

  private extractTextFromDescription(desc: unknown): string {
    if (!desc) return '';
    if (typeof desc === 'string') return desc;
    if (typeof desc !== 'object') return '';

    const obj = desc as { content?: Array<{ content?: Array<{ text?: string }> }> };
    if (!obj.content) return '';

    return obj.content
      .map((block: { content?: Array<{ text?: string }> }) => {
        if (block.content) {
          return block.content.map((c: { text?: string }) => c.text || '').join('');
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
}
