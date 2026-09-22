# DocuRelease AI

> Automated technical documentation and changelog generation synced with GitHub PRs and Jira epics for tech startups.

## Overview

DocuRelease AI automatically hooks into your version control, analyzes code changes and discussions using GPT-4, and generates pristine documentation and release notes in seconds.

### Key Features

- **GitHub App Integration** - Track PR merges via webhooks
- **AI-Powered Generation** - GPT-4 Turbo analyzes diffs + Jira context
- **Dual Output** - Customer changelogs AND internal developer docs from one PR
- **Slack Approval Workflow** - Draft review before publishing
- **Markdown & HTML Export** - Flexible output formats
- **Organization Settings** - Team management, billing, API keys

## Architecture

```
Frontend:    React + Vite + Tailwind CSS
State:       React Context + localStorage persistence
AI Provider: Interface pattern (Mock mode by default, OpenAI when key present)
Data:        Realistic seeded data for immediate demo
Routing:     Client-side navigation via state
```

### Data Model

- **Organization** - Company settings, plan, members
- **Repository** - GitHub repos with connection status
- **PullRequest** - Merged PRs with diffs, labels, commit messages
- **JiraEpic** - Linked issues with descriptions
- **ChangelogEntry** - Generated customer-facing release notes
- **DocEntry** - Generated internal developer documentation
- **WebhookConfig** - Slack/custom webhook configurations

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+

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

### Environment Variables

Create a `.env` file in the project root:

```env
# OpenAI API Key (optional - app runs in mock mode without it)
VITE_OPENAI_API_KEY=sk-your-key-here

# Set to "mock" to force mock mode even with a key present
# VITE_OPENAI_API_KEY=mock
```

**Mock Mode:** When `VITE_OPENAI_API_KEY` is not set or set to `"mock"`, the app uses a built-in mock AI provider that generates realistic documentation without requiring API access. This is perfect for demos and development.

## AI Provider Interface

The AI layer uses a provider pattern for flexibility:

```typescript
interface AIProvider {
  generateFromPR(pr: PullRequest, epic?: JiraEpic): Promise<AIGenerationResult>;
  isMock: boolean;
}
```

- **MockAIProvider** - Generates realistic output using templates (no API calls)
- **OpenAIProvider** - Uses GPT-4 Turbo via REST API (requires `VITE_OPENAI_API_KEY`)

### AI Workflow

1. Webhook triggers on PR merge
2. Fetch diff and commit message
3. Retrieve repository context via vector DB (simulated in mock)
4. GPT-4 summarizes impact
5. Generates categorized changelog entry
6. Sends draft to Slack for review

## Project Structure

```
src/
├── App.tsx                    # Main app component with routing
├── main.tsx                   # Entry point
├── index.css                  # Tailwind + custom styles
├── vite-env.d.ts              # TypeScript env declarations
├── types/
│   └── index.ts               # All TypeScript interfaces
├── lib/
│   ├── mock-data.ts           # Realistic seeded data
│   └── ai-provider.ts         # AI provider interface + implementations
├── context/
│   └── AppContext.tsx          # Global state management
├── components/
│   └── layout/
│       └── Sidebar.tsx         # Navigation sidebar
└── pages/
    ├── Dashboard.tsx           # Overview with stats and activity
    ├── Changelogs.tsx          # Changelog management with export
    ├── Docs.tsx                # Documentation management
    ├── Generate.tsx            # AI generation interface
    ├── Integrations.tsx        # GitHub/Jira/Slack/OpenAI setup
    ├── Webhooks.tsx            # Webhook configuration
    └── Settings.tsx            # Organization settings
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `VITE_OPENAI_API_KEY` (optional)

### Other Platforms

```bash
npm run build
# Serve the dist/ directory with any static file server
```

## Testing

```bash
# Type checking
npm run typecheck

# Build validation
npm run build
```

## Pricing Model

| Plan | Price | Repos | AI Tokens | Members |
|------|-------|-------|-----------|---------|
| Starter | $49/mo | 3 | 50K/mo | 3 |
| Growth | $99/mo | 10 | 100K/mo | 10 |
| Enterprise | $299/mo | Unlimited | Unlimited | Unlimited |

## Next Steps (Highest-Value Follow-ups)

1. **Real GitHub App + Webhook Server** - Deploy a backend service (Express/Next.js API routes) to receive GitHub webhook events, fetch PR diffs via the GitHub API, and trigger the AI pipeline automatically.

2. **RAG Pipeline with pgvector** - Implement vector embeddings of existing documentation using `text-embedding-3-small` stored in PostgreSQL/pgvector. Use RAG to maintain brand voice and technical terminology consistency across generated content.

3. **Notion/Confluence Auto-Sync** - Build the publishing pipeline that pushes approved changelogs and docs to Notion pages or Confluence spaces via their respective APIs, completing the "zero-effort" workflow promise.

## License

MIT
