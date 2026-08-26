"use client"

import { Suspense, useEffect, useState } from "react"
import { InfoIcon } from "lucide-react"

interface SessionData {
  userId: number
  email: string
  roles: string[]
}

export default function ProtectedPage() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("django_access_token")
    if (!token) {
      window.location.href = "/auth/login"
      return
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/user/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated")
        return res.json()
      })
      .then((me) => {
        setSession({
          userId: me.pk ?? me.id ?? 0,
          email: me.email ?? "",
          roles: me.roles ?? [],
        })
      })
      .catch(() => {
        window.location.href = "/auth/login"
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        {loading ? (
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">Loading...</pre>
        ) : session ? (
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        ) : null}
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">You are authenticated</h2>
        <p className="text-sm text-muted-foreground">
          Your session is active and secure.
        </p>
      </div>
    </div>
  )
}
