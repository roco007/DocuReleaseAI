import { PullRequest, JiraEpic, ChangelogEntry, DocEntry, AIGenerationResult } from '../types';

interface AIProvider {
  generateFromPR(pr: PullRequest, epic?: JiraEpic): Promise<AIGenerationResult>;
  isMock: boolean;
}

// Mock AI provider - generates realistic output without requiring API keys
class MockAIProvider implements AIProvider {
  isMock = true;

  async generateFromPR(pr: PullRequest, epic?: JiraEpic): Promise<AIGenerationResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const isFeature = pr.labels.includes('feature');
    const isBugfix = pr.labels.includes('bugfix');
    const isImprovement = pr.labels.includes('improvement') || pr.labels.includes('refactor');

    const category = isFeature ? 'feature' : isBugfix ? 'bugfix' : isImprovement ? 'improvement' : 'improvement';

    const changelogTitle = this.generateChangelogTitle(pr, category);
    const changelogContent = this.generateChangelogContent(pr, epic, category);
    const docContent = this.generateDocContent(pr, epic);

    const changelog: ChangelogEntry = {
      id: `cl-${Date.now()}`,
      title: changelogTitle,
      summary: this.generateSummary(pr, category),
      content: changelogContent,
      category,
      audience: isBugfix ? 'external' : 'external',
      status: 'draft',
      createdAt: new Date().toISOString(),
      prIds: [pr.id],
      version: 'v2.8.0',
    };

    const docs: DocEntry = {
      id: `doc-${Date.now()}`,
      title: this.generateDocTitle(pr),
      content: docContent,
      format: 'markdown',
      category: isFeature ? 'api' : 'reference',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prIds: [pr.id],
    };

    return {
      changelog,
      docs,
      processingTime: 1500 + Math.random() * 1000,
      tokensUsed: Math.floor(2000 + Math.random() * 3000),
    };
  }

  private generateChangelogTitle(pr: PullRequest, category: string): string {
    const prefix = category === 'feature' ? 'New: ' : category === 'bugfix' ? 'Fix: ' : 'Improved: ';
    const cleaned = pr.title.replace(/^(feat|fix|refactor|chore|docs):?\s*/i, '');
    return prefix + cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  private generateSummary(pr: PullRequest, category: string): string {
    if (category === 'feature') {
      return `New capability added: ${pr.commitMessage.replace(/^(feat|fix|refactor):?\s*/i, '')}. This change improves the platform's functionality for all users.`;
    }
    if (category === 'bugfix') {
      return `Resolved an issue that could affect real-time functionality. The fix ensures more stable and reliable operation.`;
    }
    return `Performance and reliability improvements to core infrastructure. Users will notice faster response times and better stability.`;
  }

  private generateChangelogContent(pr: PullRequest, epic?: JiraEpic, category?: string): string {
    let content = `## ${category === 'feature' ? "What's New" : category === 'bugfix' ? 'Bug Fix' : 'Improvement'}\n\n`;

    if (epic) {
      content += `${epic.description}\n\n`;
    } else {
      content += `${pr.commitMessage}\n\n`;
    }

    content += `### Technical Details\n\n`;
    content += `- **Files Changed:** ${pr.filesChanged}\n`;
    content += `- **Lines Added:** +${pr.additions}\n`;
    content += `- **Lines Removed:** -${pr.deletions}\n`;
    content += `- **Branch:** \`${pr.branch}\`\n\n`;

    content += `### Code Changes\n\n\`\`\`diff\n${pr.diff}\n\`\`\`\n`;

    return content;
  }

  private generateDocContent(pr: PullRequest, epic?: JiraEpic): string {
    let content = `# ${pr.title.replace(/^(feat|fix|refactor|chore|docs):?\s*/i, '')}\n\n`;

    if (epic) {
      content += `## Overview\n\n${epic.description}\n\n`;
    }

    content += `## Implementation Details\n\n`;
    content += `This change was introduced in PR #${pr.number} on the \`${pr.branch}\` branch.\n\n`;

    content += `### Code Reference\n\n\`\`\`diff\n${pr.diff}\n\`\`\`\n\n`;

    content += `### Related\n\n`;
    content += `- PR: [#${pr.number}](https://github.com/${pr.repository}/pull/${pr.number})\n`;
    if (epic) {
      content += `- Epic: [${epic.key}](${epic.title})\n`;
    }

    return content;
  }

  private generateDocTitle(pr: PullRequest): string {
    const cleaned = pr.title.replace(/^(feat|fix|refactor|chore|docs):?\s*/i, '');
    return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' - Technical Reference';
  }
}

// Real OpenAI provider (used when API key is available)
class OpenAIProvider implements AIProvider {
  isMock = false;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateFromPR(pr: PullRequest, epic?: JiraEpic): Promise<AIGenerationResult> {
    const prompt = this.buildPrompt(pr, epic);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are DocuRelease AI, an expert technical writer that generates changelogs and documentation from code changes. Output in JSON format with "changelog" and "docs" fields.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return {
      changelog: {
        id: `cl-${Date.now()}`,
        title: result.changelog.title,
        summary: result.changelog.summary,
        content: result.changelog.content,
        category: result.changelog.category || 'improvement',
        audience: result.changelog.audience || 'external',
        status: 'draft',
        createdAt: new Date().toISOString(),
        prIds: [pr.id],
        version: 'v2.8.0',
      },
      docs: {
        id: `doc-${Date.now()}`,
        title: result.docs.title,
        content: result.docs.content,
        format: 'markdown',
        category: result.docs.category || 'reference',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prIds: [pr.id],
      },
      processingTime: 0,
      tokensUsed: data.usage?.total_tokens || 0,
    };
  }

  private buildPrompt(pr: PullRequest, epic?: JiraEpic): string {
    let prompt = `Generate a changelog entry and technical documentation from this PR:\n\n`;
    prompt += `PR Title: ${pr.title}\n`;
    prompt += `Commit: ${pr.commitMessage}\n`;
    prompt += `Labels: ${pr.labels.join(', ')}\n`;
    prompt += `Files Changed: ${pr.filesChanged}\n`;
    prompt += `Diff:\n${pr.diff}\n\n`;

    if (epic) {
      prompt += `Linked Jira Epic: ${epic.key} - ${epic.title}\n`;
      prompt += `Epic Description: ${epic.description}\n\n`;
    }

    prompt += `Output JSON with: changelog {title, summary, content, category, audience} and docs {title, content, category}`;
    return prompt;
  }
}

// Factory function
export function createAIProvider(): AIProvider {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey && apiKey !== 'mock') {
    return new OpenAIProvider(apiKey);
  }
  return new MockAIProvider();
}

export const aiProvider = createAIProvider();
