/**
 * In-memory mapping from OpenAI request.user (Hermes conversation key) to a
 * persisted Claude CLI session. Lets the proxy --resume an existing CLI
 * session instead of cold-starting a fresh one and replaying the entire
 * message history on every request.
 */

interface SessionEntry {
  claudeSessionId: string;
  messageCount: number;
  lastUsed: number;
}

const SESSION_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours of inactivity

const sessions = new Map<string, SessionEntry>();

export function getSession(key: string): SessionEntry | undefined {
  const entry = sessions.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.lastUsed > SESSION_TTL_MS) {
    sessions.delete(key);
    return undefined;
  }
  return entry;
}

export function setSession(
  key: string,
  claudeSessionId: string,
  messageCount: number
): void {
  sessions.set(key, { claudeSessionId, messageCount, lastUsed: Date.now() });
}

export function clearSession(key: string): void {
  sessions.delete(key);
}
