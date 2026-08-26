"use client"

import { useEffect, useState } from "react"
import { fetchAllFromRest } from "./actions"
import type { AllData } from "@/lib/api/rest"
import DataExplorer from "./_components/data-explorer"
import { Skeleton } from "@/components/ui/skeleton"

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

  useEffect(() => {
    fetchAllFromRest()
      .then(setData)
      .catch(() => setData({} as AllData))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  return <DataExplorer data={data ?? ({} as AllData)} />
}
