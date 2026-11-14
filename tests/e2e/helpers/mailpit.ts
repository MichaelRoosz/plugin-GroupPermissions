import { MAILPIT_URL } from './env';

export interface MailSummary {
  ID: string;
  Subject: string;
  To: Array<{ Address: string }>;
}

export async function findMessagesTo(address: string): Promise<MailSummary[]> {
  const res = await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${address}"`)}`);
  const data = await res.json();
  return data.messages || [];
}

export async function getMessage(id: string): Promise<{ Subject: string; HTML: string; Text: string }> {
  const res = await fetch(`${MAILPIT_URL}/api/v1/message/${id}`);
  return res.json();
}

/** Polls Mailpit until a message to the given address arrives. */
export async function waitForMessageTo(address: string, timeoutMs = 15_000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    const messages = await findMessagesTo(address);
    if (messages.length) return getMessage(messages[0].ID);
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No email to ${address} received within ${timeoutMs}ms`);
}
