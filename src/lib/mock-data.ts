import { Organization, Repository, PullRequest, JiraEpic, ChangelogEntry, DocEntry, WebhookConfig } from '../types';

export const mockOrganization: Organization = {
  id: 'org-1',
  name: 'Acme Dev Studio',
  plan: 'growth',
  createdAt: '2024-03-15T10:00:00Z',
  members: [
    { id: 'm-1', name: 'Alex Chen', email: 'alex@acmedev.io', role: 'admin', avatar: 'AC' },
    { id: 'm-2', name: 'Sarah Kim', email: 'sarah@acmedev.io', role: 'editor', avatar: 'SK' },
    { id: 'm-3', name: 'Marcus Johnson', email: 'marcus@acmedev.io', role: 'editor', avatar: 'MJ' },
    { id: 'm-4', name: 'Priya Patel', email: 'priya@acmedev.io', role: 'viewer', avatar: 'PP' },
  ],
};

export const mockRepositories: Repository[] = [
  { id: 'repo-1', name: 'acme-api', fullName: 'acme-dev/acme-api', provider: 'github', connected: true, lastSync: '2025-01-15T14:30:00Z', prCount: 47 },
  { id: 'repo-2', name: 'acme-frontend', fullName: 'acme-dev/acme-frontend', provider: 'github', connected: true, lastSync: '2025-01-15T14:28:00Z', prCount: 83 },
  { id: 'repo-3', name: 'acme-sdk', fullName: 'acme-dev/acme-sdk', provider: 'github', connected: true, lastSync: '2025-01-15T12:00:00Z', prCount: 21 },
  { id: 'repo-4', name: 'acme-infra', fullName: 'acme-dev/acme-infra', provider: 'github', connected: false, lastSync: '', prCount: 0 },
];

export const mockPullRequests: PullRequest[] = [
  {
    id: 'pr-1', number: 142, title: 'feat: Add bulk export endpoint for analytics data',
    author: 'Sarah Kim', authorAvatar: 'SK', repository: 'acme-api', branch: 'feat/bulk-export',
    status: 'merged', mergedAt: '2025-01-15T13:45:00Z', labels: ['feature', 'release', 'api'],
    jiraEpicId: 'jira-1',
    diff: `+ // POST /api/v2/analytics/export\n+ export async function bulkExport(req: Request, res: Response) {\n+   const { format, dateRange, metrics } = req.body;\n+   const data = await analyticsService.aggregate(dateRange, metrics);\n+   const formatted = await formatExport(data, format);\n+   res.setHeader('Content-Type', getMimeType(format));\n+   res.send(formatted);\n+ }`,
    commitMessage: 'feat: implement bulk analytics export with CSV/JSON/PDF support',
    filesChanged: 8, additions: 234, deletions: 12,
  },
  {
    id: 'pr-2', number: 287, title: 'fix: Resolve race condition in WebSocket reconnection',
    author: 'Marcus Johnson', authorAvatar: 'MJ', repository: 'acme-frontend', branch: 'fix/ws-reconnect',
    status: 'merged', mergedAt: '2025-01-15T11:20:00Z', labels: ['bugfix', 'release', 'critical'],
    jiraEpicId: 'jira-2',
    diff: `- const ws = new WebSocket(url);\n+ const wsRef = useRef<WebSocket | null>(null);\n+ const reconnectTimer = useRef<NodeJS.Timeout>();\n+ \n+ useEffect(() => {\n+   if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {\n+     wsRef.current = new WebSocket(url);\n+     wsRef.current.onclose = () => {\n+       reconnectTimer.current = setTimeout(connect, 3000);\n+     };\n+   }\n+   return () => clearTimeout(reconnectTimer.current);\n+ }, [url]);`,
    commitMessage: 'fix: prevent multiple WebSocket connections during rapid reconnects',
    filesChanged: 3, additions: 45, deletions: 28,
  },
  {
    id: 'pr-3', number: 56, title: 'feat: Add OAuth2 PKCE flow for SDK authentication',
    author: 'Alex Chen', authorAvatar: 'AC', repository: 'acme-sdk', branch: 'feat/oauth-pkce',
    status: 'merged', mergedAt: '2025-01-14T16:00:00Z', labels: ['feature', 'release', 'security'],
    jiraEpicId: 'jira-3',
    diff: `+ export class AuthProvider {\n+   private codeVerifier: string;\n+   \n+   async initiatePKCE(): Promise<AuthURL> {\n+     this.codeVerifier = generateCodeVerifier();\n+     const challenge = await generateCodeChallenge(this.codeVerifier);\n+     const params = new URLSearchParams({\n+       response_type: 'code',\n+       code_challenge: challenge,\n+       code_challenge_method: 'S256',\n+     });\n+     return { url: \`\${this.baseUrl}/authorize?\${params}\` };\n+   }\n+ }`,
    commitMessage: 'feat: implement OAuth2 PKCE flow for secure client-side auth',
    filesChanged: 12, additions: 456, deletions: 34,
  },
  {
    id: 'pr-4', number: 143, title: 'refactor: Migrate rate limiter to sliding window algorithm',
    author: 'Sarah Kim', authorAvatar: 'SK', repository: 'acme-api', branch: 'refactor/rate-limiter',
    status: 'merged', mergedAt: '2025-01-14T10:30:00Z', labels: ['improvement', 'performance'],
    diff: `+ class SlidingWindowRateLimiter {\n+   private window: Map<string, number[]> = new Map();\n+   \n+   isAllowed(key: string, limit: number, windowMs: number): boolean {\n+     const now = Date.now();\n+     const timestamps = this.window.get(key) || [];\n+     const valid = timestamps.filter(t => now - t < windowMs);\n+     if (valid.length >= limit) return false;\n+     valid.push(now);\n+     this.window.set(key, valid);\n+     return true;\n+   }\n+ }`,
    commitMessage: 'refactor: replace fixed-window rate limiter with sliding window for accuracy',
    filesChanged: 5, additions: 89, deletions: 67,
  },
  {
    id: 'pr-5', number: 288, title: 'feat: Implement dark mode with system preference detection',
    author: 'Priya Patel', authorAvatar: 'PP', repository: 'acme-frontend', branch: 'feat/dark-mode',
    status: 'merged', mergedAt: '2025-01-13T15:45:00Z', labels: ['feature', 'release', 'ui'],
    jiraEpicId: 'jira-4',
    diff: `+ const ThemeProvider: React.FC = ({ children }) => {\n+   const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');\n+   \n+   useEffect(() => {\n+     const mq = window.matchMedia('(prefers-color-scheme: dark)');\n+     const resolved = theme === 'system' \n+       ? (mq.matches ? 'dark' : 'light') \n+       : theme;\n+     document.documentElement.classList.toggle('dark', resolved === 'dark');\n+   }, [theme]);\n+ }`,
    commitMessage: 'feat: add dark mode support with automatic system preference detection',
    filesChanged: 15, additions: 312, deletions: 45,
  },
];

export const mockJiraEpics: JiraEpic[] = [
  {
    id: 'jira-1', key: 'ACME-234', title: 'Analytics Export Feature',
    description: 'Enable users to export analytics data in multiple formats (CSV, JSON, PDF) with configurable date ranges and metric selections. Must support bulk operations for enterprise customers.',
    status: 'done', assignee: 'Sarah Kim', priority: 'high', linkedPRs: ['pr-1'],
  },
  {
    id: 'jira-2', key: 'ACME-241', title: 'WebSocket Stability Improvements',
    description: 'Fix critical race condition causing duplicate WebSocket connections during network instability. Add exponential backoff and connection state management.',
    status: 'done', assignee: 'Marcus Johnson', priority: 'high', linkedPRs: ['pr-2'],
  },
  {
    id: 'jira-3', key: 'ACME-198', title: 'OAuth2 PKCE Implementation',
    description: 'Implement OAuth2 Authorization Code flow with PKCE extension for the client SDK. Required for secure authentication in SPAs and mobile apps without client secrets.',
    status: 'done', assignee: 'Alex Chen', priority: 'high', linkedPRs: ['pr-3'],
  },
  {
    id: 'jira-4', key: 'ACME-256', title: 'Dark Mode Support',
    description: 'Add comprehensive dark mode support across all UI components with system preference detection and manual toggle option.',
    status: 'in-progress', assignee: 'Priya Patel', priority: 'medium', linkedPRs: ['pr-5'],
  },
];

export const mockChangelogEntries: ChangelogEntry[] = [
  {
    id: 'cl-1', title: 'Bulk Analytics Export Now Available',
    summary: 'Export your analytics data in CSV, JSON, or PDF format with flexible date ranges and metric selections.',
    content: `## What's New\n\nWe're excited to announce the bulk analytics export feature! You can now export your analytics data in multiple formats:\n\n- **CSV** - Perfect for spreadsheet analysis\n- **JSON** - Ideal for programmatic access\n- **PDF** - Great for sharing with stakeholders\n\n### How to Use\n\nNavigate to Analytics → Export, select your date range and desired metrics, then choose your format. Exports are processed asynchronously for large datasets.\n\n### API Endpoint\n\n\`\`\`http\nPOST /api/v2/analytics/export\nContent-Type: application/json\n\n{\n  "format": "csv",\n  "dateRange": { "start": "2025-01-01", "end": "2025-01-15" },\n  "metrics": ["pageviews", "conversions", "revenue"]\n}\n\`\`\``,
    category: 'feature', audience: 'external', status: 'published',
    createdAt: '2025-01-15T14:00:00Z', publishedAt: '2025-01-15T15:30:00Z',
    prIds: ['pr-1'], version: 'v2.8.0',
  },
  {
    id: 'cl-2', title: 'Improved Connection Stability',
    summary: 'Fixed a critical issue causing intermittent disconnections in real-time features.',
    content: `## Bug Fix\n\nWe resolved a race condition that could cause multiple WebSocket connections during network instability. This improves the reliability of real-time features including live dashboards and notifications.\n\n### Technical Details\n\n- Implemented proper connection state management\n- Added exponential backoff for reconnection attempts\n- Prevented duplicate connection creation during rapid network changes`,
    category: 'bugfix', audience: 'external', status: 'published',
    createdAt: '2025-01-15T12:00:00Z', publishedAt: '2025-01-15T13:00:00Z',
    prIds: ['pr-2'], version: 'v2.7.1',
  },
  {
    id: 'cl-3', title: 'OAuth2 PKCE Authentication for SDK',
    summary: 'The SDK now supports secure OAuth2 authentication with PKCE for SPAs and mobile apps.',
    content: `## New Feature\n\nThe Acme SDK now supports OAuth2 Authorization Code flow with PKCE (Proof Key for Code Exchange). This enables secure authentication for client-side applications without requiring client secrets.\n\n### Usage\n\n\`\`\`typescript\nimport { AuthProvider } from '@acme/sdk';\n\nconst auth = new AuthProvider({ clientId: 'your-client-id' });\nconst { url } = await auth.initiatePKCE();\n// Redirect user to url\n\`\`\`\n\n### Security Benefits\n\n- No client secrets needed in frontend code\n- Protection against authorization code interception\n- Industry-standard PKCE (RFC 7636) implementation`,
    category: 'feature', audience: 'internal', status: 'approved',
    createdAt: '2025-01-14T17:00:00Z', prIds: ['pr-3'], version: 'v2.8.0',
  },
  {
    id: 'cl-4', title: 'Dark Mode Support',
    summary: 'Full dark mode support with automatic system preference detection.',
    content: `## What's New\n\nYour Acme dashboard now supports dark mode! The theme automatically adapts to your system preferences, or you can manually toggle between light and dark modes.\n\n### Features\n\n- Automatic system preference detection\n- Manual theme toggle in settings\n- Consistent design across all components\n- Reduced eye strain in low-light environments`,
    category: 'feature', audience: 'external', status: 'draft',
    createdAt: '2025-01-13T16:00:00Z', prIds: ['pr-5'], version: 'v2.8.0',
  },
];

export const mockDocEntries: DocEntry[] = [
  {
    id: 'doc-1', title: 'Analytics Export API Reference',
    content: `# Analytics Export API\n\n## POST /api/v2/analytics/export\n\nExports analytics data in the specified format.\n\n### Request Body\n\n| Field | Type | Required | Description |\n|-------|------|----------|-------------|\n| format | string | Yes | Export format: \`csv\`, \`json\`, or \`pdf\` |\n| dateRange | object | Yes | Date range with \`start\` and \`end\` (ISO 8601) |\n| metrics | string[] | Yes | Array of metric names to include |\n\n### Response\n\n**Success (200)**\n\nReturns the exported file with appropriate Content-Type header.\n\n**Error (400)**\n\n\`\`\`json\n{\n  "error": "INVALID_FORMAT",\n  "message": "Format must be one of: csv, json, pdf"\n}\n\`\`\`\n\n### Rate Limits\n\n- 10 export requests per minute per API key\n- Maximum 1M rows per export\n- Exports exceeding 100K rows are processed asynchronously`,
    format: 'markdown', category: 'api', status: 'published',
    createdAt: '2025-01-15T14:00:00Z', updatedAt: '2025-01-15T14:00:00Z', prIds: ['pr-1'],
  },
  {
    id: 'doc-2', title: 'SDK Authentication Guide - OAuth2 PKCE',
    content: `# OAuth2 PKCE Authentication\n\n## Overview\n\nThe Acme SDK supports OAuth2 Authorization Code flow with PKCE for secure client-side authentication.\n\n## Setup\n\n\`\`\`typescript\nimport { AuthProvider } from '@acme/sdk';\n\nconst auth = new AuthProvider({\n  clientId: process.env.ACME_CLIENT_ID,\n  redirectUri: window.location.origin + '/callback',\n  scopes: ['read:data', 'write:data'],\n});\n\`\`\`\n\n## Authentication Flow\n\n1. **Initiate**: Call \`initiatePKCE()\` to get the authorization URL\n2. **Redirect**: Send the user to the authorization URL\n3. **Callback**: Handle the redirect with the authorization code\n4. **Exchange**: Exchange the code for tokens\n\n\`\`\`typescript\n// Step 1: Initiate\nconst { url, state } = await auth.initiatePKCE();\nwindow.location.href = url;\n\n// Step 3-4: Handle callback\nconst code = new URLSearchParams(window.location.search).get('code');\nconst tokens = await auth.exchangeCode(code);\n\`\`\`\n\n## Token Management\n\nTokens are automatically refreshed. Access the current token via:\n\n\`\`\`typescript\nconst token = await auth.getAccessToken();\n\`\`\``,
    format: 'markdown', category: 'guide', status: 'approved',
    createdAt: '2025-01-14T17:00:00Z', updatedAt: '2025-01-14T18:00:00Z', prIds: ['pr-3'],
  },
  {
    id: 'doc-3', title: 'Rate Limiting - Technical Reference',
    content: `# Rate Limiting Architecture\n\n## Overview\n\nAcme API uses a sliding window rate limiting algorithm for accurate request tracking.\n\n## Algorithm Details\n\nThe sliding window approach tracks individual request timestamps within the configured window, providing more accurate rate limiting compared to fixed-window approaches.\n\n### Configuration\n\n| Tier | Requests/Min | Burst Limit |\n|------|-------------|-------------|\n| Free | 60 | 10 |\n| Pro | 600 | 50 |\n| Enterprise | 6000 | 200 |\n\n## Response Headers\n\nAll API responses include rate limit headers:\n\n\`\`\`\nX-RateLimit-Limit: 600\nX-RateLimit-Remaining: 594\nX-RateLimit-Reset: 1705334400\n\`\`\``,
    format: 'markdown', category: 'reference', status: 'draft',
    createdAt: '2025-01-14T11:00:00Z', updatedAt: '2025-01-14T11:00:00Z', prIds: ['pr-4'],
  },
];

export const mockWebhooks: WebhookConfig[] = [
  {
    id: 'wh-1', type: 'slack', name: 'Engineering Releases',
    url: 'https://hooks.slack.com/services/T00/B00/xxxx',
    channel: '#releases', enabled: true,
    events: ['pr.merged', 'changelog.published', 'doc.updated'],
    lastTriggered: '2025-01-15T14:00:00Z',
  },
  {
    id: 'wh-2', type: 'slack', name: 'Product Updates',
    url: 'https://hooks.slack.com/services/T00/B01/yyyy',
    channel: '#product-updates', enabled: true,
    events: ['changelog.published'],
    lastTriggered: '2025-01-15T13:00:00Z',
  },
  {
    id: 'wh-3', type: 'custom', name: 'Internal Wiki Sync',
    url: 'https://wiki.acmedev.io/api/webhook/docs',
    enabled: false,
    events: ['doc.published'],
    lastTriggered: '2025-01-10T09:00:00Z',
  },
];
