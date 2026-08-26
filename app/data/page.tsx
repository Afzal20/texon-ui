"use client"

import { useEffect, useState } from "react"
import { fetchAllFromRest } from "./actions"
import type { AllData } from "@/lib/api/rest"
import DataExplorer from "./_components/data-explorer"
import { Skeleton } from "@/components/ui/skeleton"
import { getClientToken } from "@/lib/get-client-token"

function Loading() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-96" />
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function DataPage() {
  const [data, setData] = useState<AllData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getClientToken() ?? undefined
    fetchAllFromRest(token)
      .then(setData)
      .catch((err) => {
        const msg = err?.message ?? String(err)
        console.error("Data page fetch failed:", msg, err)
        setError(msg)
        setData({} as AllData)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">Failed to load data</p>
          <p className="font-mono text-xs break-all">{error}</p>
        </div>
        <DataExplorer data={data ?? ({} as AllData)} />
      </div>
    )
  }

  return <DataExplorer data={data ?? ({} as AllData)} />
}
