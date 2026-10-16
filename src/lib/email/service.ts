export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  sentAt: string;
  category: 'request_received' | 'change_order_sent' | 'change_order_approved' | 'change_order_rejected';
  metadata?: Record<string, any>;
}

// In-app log of outgoing transactional emails (for preview and auditing)
const sentEmailsLog: EmailNotification[] = [];

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  category: EmailNotification['category'];
  metadata?: Record<string, any>;
}): Promise<EmailNotification> {
  const notification: EmailNotification = {
    id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    to: params.to,
    subject: params.subject,
    bodyText: params.bodyText,
    bodyHtml: params.bodyHtml,
    sentAt: new Date().toISOString(),
    category: params.category,
    metadata: params.metadata,
  };

  sentEmailsLog.unshift(notification);
  if (sentEmailsLog.length > 50) sentEmailsLog.pop();

  console.log(`[Email Sent] To: ${params.to} | Subject: ${params.subject}`);
  return notification;
}

export function getSentEmails(): EmailNotification[] {
  return [...sentEmailsLog];
}
