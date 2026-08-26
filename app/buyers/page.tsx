"use client"

import { useEffect, useState } from "react"
import { BuyersPageClient } from "./_components/buyers-page-client"
import { getBuyers } from "./actions"
import { Skeleton } from "@/components/ui/skeleton"
import { getClientToken } from "@/lib/get-client-token"

function BuyersLoading() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full max-w-sm rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<
    Awaited<ReturnType<typeof getBuyers>>["results"]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getClientToken() ?? undefined
    getBuyers(undefined, undefined, token)
      .then((res) => setBuyers(res.results))
      .catch((err) => {
        console.error("Failed to fetch buyers:", err)
        setError(err?.message ?? String(err))
        setBuyers([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <BuyersLoading />

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">Failed to fetch buyers</p>
          <p className="font-mono text-xs break-all">{error}</p>
        </div>
        <BuyersPageClient initialBuyers={buyers} />
      </div>
    )
  }

  return <BuyersPageClient initialBuyers={buyers} />
}
