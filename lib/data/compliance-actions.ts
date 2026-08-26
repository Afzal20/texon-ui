"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { restList } from "@/lib/api/rest"
import type { ComplianceRecord, ComplianceDocument, ComplianceSummary } from "./compliance"

async function getToken(token?: string): Promise<string> {
  return getApiToken(token)
}

export async function getComplianceRecords(token?: string): Promise<ComplianceRecord[]> {
  const apiToken = await getToken(token)
  return (await restList("compliance", "ComplianceRecord", undefined, apiToken)).data as unknown as ComplianceRecord[]
}

export async function getComplianceSummary(token?: string): Promise<ComplianceSummary> {
  const apiToken = await getToken(token)
  const { data: records } = await restList("compliance", "ComplianceRecord", undefined, apiToken)
  const scores = records.map((row) => Number(row.score) || 0)
  const overall =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const byType = (needle: string) => {
    const matches = records.filter((row) => String(row.compliance_type ?? "").toLowerCase().includes(needle))
    if (matches.length === 0) return overall
    const values = matches.map((row) => Number(row.score) || 0)
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  }
  return {
    overall_score: overall,
    social_score: byType("social"),
    environmental_score: byType("environment"),
    safety_score: byType("safety"),
    carbon_footprint: 0,
    water_recycled_percentage: 0,
    renewable_energy_percentage: 0,
  }
}

export async function getDocuments(): Promise<ComplianceDocument[]> {
  return []
}
