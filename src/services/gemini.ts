import { Credentials } from '../types';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface GenerationResult {
  changelog: {
    title: string;
    summary: string;
    content: string;
    category: 'feature' | 'improvement' | 'bugfix' | 'breaking';
    audience: 'internal' | 'external';
  };
  docs: {
    title: string;
    content: string;
    category: 'api' | 'guide' | 'reference';
  };
}

export class GeminiService {
  private apiKey: string;
  private model: string;

  constructor(credentials: Credentials) {
    this.apiKey = credentials.geminiApiKey;
    this.model = credentials.geminiModel;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${GEMINI_BASE_URL}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with "ok"' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateFromPR(
    pr: { title: string; body: string; diff: string; labels: string[]; branch: string; number: number; additions: number; deletions: number; filesChanged: number; author: string; repositoryFullName: string },
    _unused?: unknown,
    brandVoice?: string
  ): Promise<{ result: GenerationResult; tokensUsed: number }> {
    const systemPrompt = this.buildSystemPrompt(brandVoice);
    const userPrompt = this.buildUserPrompt(pr);

    const response = await fetch(
      `${GEMINI_BASE_URL}/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Understood. I will analyze the PR and generate both a changelog entry and technical documentation in the specified JSON format.' }] },
            { role: 'user', parts: [{ text: userPrompt }] },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error?.message || `Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    const result = JSON.parse(text) as GenerationResult;
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    return { result, tokensUsed };
  }

  private buildSystemPrompt(brandVoice?: string): string {
    return `You are DocuRelease AI, an expert technical writer that generates documentation from code changes.

Your task: Analyze a GitHub Pull Request and produce TWO outputs in a single JSON response:

1. **changelog**: A customer/user-facing changelog entry
2. **docs**: Internal developer documentation

## Changelog Guidelines:
- Write for a non-technical audience (product managers, customers)
- Focus on WHAT changed and WHY it matters to users
- Use clear, benefit-oriented language
- Categorize as: "feature", "improvement", "bugfix", or "breaking"
- Set audience to "external" for user-facing changes, "internal" for infra-only changes
- Include a concise summary (1-2 sentences) and detailed markdown content

## Documentation Guidelines:
- Write for developers
- Include code references, API details, implementation notes
- Categorize as: "api", "guide", or "reference"
- Use proper markdown formatting with code blocks

## Output Format:
Return ONLY valid JSON with this exact structure:
{
  "changelog": {
    "title": "string - concise, descriptive title",
    "summary": "string - 1-2 sentence summary",
    "content": "string - full markdown content",
    "category": "feature | improvement | bugfix | breaking",
    "audience": "internal | external"
  },
  "docs": {
    "title": "string - technical reference title",
    "content": "string - full markdown documentation",
    "category": "api | guide | reference"
  }
}
${brandVoice ? `\n## Brand Voice:\n${brandVoice}\n` : ''}`;
  }

  private buildUserPrompt(
    pr: { title: string; body: string; diff: string; labels: string[]; number: number; additions: number; deletions: number; filesChanged: number; author: string; repositoryFullName: string }
  ): string {
    return `## Pull Request #${pr.number}

**Repository:** ${pr.repositoryFullName}
**Author:** ${pr.author}
**Title:** ${pr.title}
**Labels:** ${pr.labels.join(', ')}
**Files Changed:** ${pr.filesChanged}
**Additions:** +${pr.additions} | **Deletions:** -${pr.deletions}

**Description:**
${pr.body || 'No description provided.'}

**Code Diff:**
\`\`\`diff
${pr.diff}
\`\`\`

Generate the changelog and documentation now. Return ONLY valid JSON.`;
  }
}
