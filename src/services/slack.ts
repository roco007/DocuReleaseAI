import { WebhookConfig, ChangelogEntry, DocEntry } from '../types';

export class SlackService {
  async testWebhook(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '✅ DocuRelease AI webhook test successful! Your integration is working.',
        }),
      });
      return response.ok || response.status === 200;
    } catch {
      return false;
    }
  }

  async sendChangelogDraft(webhook: WebhookConfig, changelog: ChangelogEntry, doc: DocEntry): Promise<boolean> {
    const blocks = this.buildChangelogBlocks(changelog, doc);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async sendNotification(webhook: WebhookConfig, message: string): Promise<boolean> {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private buildChangelogBlocks(changelog: ChangelogEntry, doc: DocEntry): unknown[] {
    const categoryEmoji = {
      feature: '🚀',
      improvement: '⚡',
      bugfix: '🐛',
      breaking: '⚠️',
    };

    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${categoryEmoji[changelog.category]} New ${changelog.category}: ${changelog.title}`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Audience:* ${changelog.audience}` },
          { type: 'mrkdwn', text: `*Version:* ${changelog.version}` },
          { type: 'mrkdwn', text: `*Status:* ${changelog.status}` },
          { type: 'mrkdwn', text: `*PRs:* ${changelog.prNumbers.map(n => `#${n}`).join(', ')}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:*\n${changelog.summary}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*📝 Changelog Content:*\n\`\`\`\n${changelog.content.substring(0, 2000)}${changelog.content.length > 2000 ? '\n... (truncated)' : ''}\n\`\`\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*📖 Developer Docs:*\n\`\`\`\n${doc.content.substring(0, 1500)}${doc.content.length > 1500 ? '\n... (truncated)' : ''}\n\`\`\``,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Approve & Publish' },
            style: 'primary',
            action_id: `approve_${changelog.id}`,
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '✏️ Edit Draft' },
            action_id: `edit_${changelog.id}`,
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ Reject' },
            style: 'danger',
            action_id: `reject_${changelog.id}`,
          },
        ],
      },
    ];
  }
}
