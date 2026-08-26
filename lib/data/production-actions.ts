"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { restList } from "@/lib/api/rest"
import type { ProductionLine, ProductionOrder, SewingRecord, PerformanceRecord, ProductionDashboard } from "./production"

async function getToken(token?: string): Promise<string> {
  return getApiToken(token)
}

export async function getProductionLines(token?: string): Promise<ProductionLine[]> {
  const apiToken = await getToken(token)
  return (await restList("production", "ProductionLine", undefined, apiToken)).data as unknown as ProductionLine[]
}

export async function getProductionOrders(search?: string, token?: string): Promise<ProductionOrder[]> {
  const apiToken = await getToken(token)
  const rows = (await restList("production", "ProductionOrder", undefined, apiToken)).data as unknown as ProductionOrder[]
  return search ? rows.filter((row) => String(row.order_number).includes(search)) : rows
}

export async function getSewingRecords(_lineId?: number, token?: string): Promise<SewingRecord[]> {
  void _lineId
  const apiToken = await getToken(token)
  return (await restList("production", "SewingRecord", undefined, apiToken)).data as unknown as SewingRecord[]
}

export async function getPerformanceRecords(token?: string): Promise<PerformanceRecord[]> {
  const apiToken = await getToken(token)
  return (await restList("performance", "PerformanceRecord", undefined, apiToken)).data as unknown as PerformanceRecord[]
}

export async function getDashboardSummary(token?: string): Promise<ProductionDashboard> {
  const apiToken = await getToken(token)
  const [{ data: orders }, { data: sewing }, { data: lines }] = await Promise.all([
    restList("production", "ProductionOrder", undefined, apiToken),
    restList("production", "SewingRecord", undefined, apiToken),
    restList("production", "ProductionLine", undefined, apiToken),
  ])
  const totalOrders = orders.length
  const outputActual = sewing.reduce((sum, row) => sum + (Number(row.output_quantity) || 0), 0)
  const outputTarget = sewing.reduce((sum, row) => sum + (Number(row.input_quantity) || 0), 0)
  const outputPercentage = outputTarget > 0 ? Math.round((outputActual / outputTarget) * 100) : 0
  return {
    total_orders: totalOrders,
    order_trend: "stable",
    output_percentage: outputPercentage,
    output_actual: outputActual,
    output_target: outputTarget,
    delay_risk_percentage: 0,
    delay_risk_note: "No delays detected",
    active_lines: lines.length,
    total_lines: lines.length,
    lines_running: lines.length,
    lines_error: 0,
    lines_idle: 0,
  }
}
