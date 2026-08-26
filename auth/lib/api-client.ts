import "server-only"
import { getValidSession } from "@/auth/lib/session"

/**
 * Get the API token. Tries the server-side session cookie first;
 * if that fails (e.g. in CSR/serverless), accepts a fallback token
 * passed from the client's localStorage.
 */
export async function getApiToken(fallbackToken?: string): Promise<string> {
  try {
    const session = await getValidSession()
    if (session?.accessToken) return session.accessToken
  } catch {
    // Session cookie unavailable — fall through to client token
  }
  if (fallbackToken) return fallbackToken
  throw new Error("Not authenticated — no session or token available")
}
