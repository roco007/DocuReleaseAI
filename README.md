# DocuRelease AI

> Automated technical documentation and changelog generation synced with GitHub PRs, powered by Google Gemini AI.

## Overview

DocuRelease AI automatically hooks into your GitHub repositories, analyzes code changes using Google Gemini 2.5 Pro, and generates pristine documentation and release notes in seconds.

### Key Features

- **Google Gemini 2.5 Pro/Flash** - State-of-the-art AI for code analysis and documentation generation
- **GitHub Integration** - Real-time PR tracking with diff extraction via GitHub REST API
- **Slack/Discord Webhooks** - Approval workflows with interactive Block Kit messages
- **Dual Output** - Customer changelogs AND internal developer docs from a single PR
- **Markdown & HTML Export** - Flexible output formats with one-click download
- **IndexedDB Persistence** - All data stored locally, no backend required
- **Zero Mock Data** - 100% real API integrations

## Architecture

```
Frontend:    React + Vite + Tailwind CSS (SPA)
AI Engine:   Google Gemini API (gemini-2.5-pro, gemini-2.5-flash, gemini-3.8-flash)
Source:      GitHub REST API v3 (PRs, diffs, commits)
Notify:      Slack/Discord Incoming Webhooks (Block Kit)
Storage:     IndexedDB via idb library (client-side persistence)
Auth:        API keys stored in IndexedDB (never leaves browser)
```

### Data Model

- **Credentials** - API keys for Gemini, GitHub (stored in IndexedDB)
- **Organization** - Company settings, brand voice, default audience
- **Repository** - GitHub repos with sync status
- **PullRequest** - Merged PRs with full diffs and labels
- **ChangelogEntry** - Generated customer-facing release notes
- **DocEntry** - Generated internal developer documentation
- **WebhookConfig** - Slack/Discord/custom webhook configurations
- **GenerationJob** - AI processing job tracking

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+
- A Google AI Studio API key ([get one free](https://aistudio.google.com/apikey))
- A GitHub Personal Access Token ([create one](https://github.com/settings/tokens) with `repo` scope)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

### First-Time Setup

1. Open the app in your browser
2. Enter your Google Gemini API key (required)
3. Enter your GitHub Personal Access Token (required)
4. Click "Launch Dashboard"
5. Go to Integrations → Sync Repositories
6. Go to Generate → Select a PR → Generate

## API Integrations

### Google Gemini API

Direct REST API calls to `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

**Supported Models:**
- `gemini-2.5-pro` - Best quality, deep reasoning (default)
- `gemini-2.5-flash` - Fast & cost-efficient
- `gemini-3.8-flash` - Latest stable Flash model

**Features Used:**
- JSON response mode (`responseMimeType: 'application/json'`)
- Multi-turn conversation for structured output
- Temperature 0.3 for consistent documentation

### GitHub REST API

Direct calls to `https://api.github.com` with Bearer token auth.

**Endpoints Used:**
- `GET /user` - Verify token
- `GET /user/repos` - List repositories
- `GET /repos/{owner}/{repo}/pulls` - List merged PRs
- `GET /repos/{owner}/{repo}/pulls/{number}` - Get PR diff
- `GET /repos/{owner}/{repo}/pulls/{number}/files` - Get file stats

### Slack Incoming Webhooks

POST requests to webhook URLs with Block Kit message format.

**Features:**
- Rich message formatting with headers, sections, actions
- Approval workflow buttons (Approve/Edit/Reject)
- Test webhook functionality

## Security

- **All API keys stored in IndexedDB** - Never sent to any server except the target API
- **No backend required** - Pure client-side application
- **Direct API calls** - Your keys go directly to Google/GitHub
- **No telemetry** - No analytics or tracking
- **CORS-safe** - All APIs support browser-based requests

## Project Structure

```
src/
├── App.tsx                    # Main app with auth gating
├── main.tsx                   # Entry point
├── index.css                  # Tailwind + custom styles
├── vite-env.d.ts              # TypeScript env declarations
├── types/
│   └── index.ts               # All TypeScript interfaces
├── db/
│   └── index.ts               # IndexedDB layer (idb)
├── services/
│   ├── gemini.ts              # Google Gemini AI service
│   ├── github.ts              # GitHub REST API service
│   └── slack.ts               # Slack webhook service
├── context/
│   ├── AuthContext.tsx         # API key management
│   └── AppContext.tsx          # Data & business logic
├── components/
│   └── layout/
│       └── Sidebar.tsx         # Navigation
└── pages/
    ├── Setup.tsx               # Onboarding wizard
    ├── Dashboard.tsx           # Overview & stats
    ├── Changelogs.tsx          # Changelog management
    ├── Docs.tsx                # Documentation management
    ├── Generate.tsx            # AI generation interface
    ├── Integrations.tsx        # Service connections
    ├── Webhooks.tsx            # Webhook configuration
    └── Settings.tsx            # Organization settings
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

No environment variables needed - all config is done in-app.

### Static Hosting

```bash
npm run build
# Deploy the dist/ directory to any static host
```

## Pricing

DocuRelease AI is free and open-source. You only pay for the Google Gemini API usage directly to Google.

| Model | Input Cost | Output Cost |
|-------|-----------|-------------|
| Gemini 2.5 Pro | $1.25/1M tokens | $10.00/1M tokens |
| Gemini 2.5 Flash | $0.15/1M tokens | $0.60/1M tokens |
| Gemini 3.8 Flash | $0.20/1M tokens | $0.80/1M tokens |

## Next Steps (Highest-Value Follow-ups)

1. **Real GitHub App with Webhook Server** - Deploy a backend (Cloudflare Workers, Vercel Functions) to receive GitHub webhook events automatically, eliminating the need for manual sync.

2. **RAG Pipeline with Gemini Embeddings** - Use `gemini-embedding-001` to vectorize existing documentation, enabling context-aware generation that maintains brand voice and terminology consistency.

3. **Notion/Confluence Publishing** - Build the final publishing pipeline that pushes approved changelogs directly to Notion pages or Confluence spaces via their APIs.

## License

MIT
