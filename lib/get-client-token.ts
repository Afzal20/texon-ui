"use client"

import { TOKEN_KEY } from "@/lib/django-auth"

/**
 * Read the JWT access token from localStorage (client-side).
 * Returns null if not available (e.g. SSR or not logged in).
 */
export function getClientToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}
