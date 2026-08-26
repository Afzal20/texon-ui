"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { restList } from "@/lib/api/rest"
import type { Order, OrdersListResponse, PurchaseOrder, BuyerPortfolio } from "./orders"

async function getToken(token?: string): Promise<string> {
  return getApiToken(token)
}

export async function getOrders(search?: string, _page = 1, token?: string): Promise<OrdersListResponse> {
  void _page
  const apiToken = await getToken(token)
  const rows = (await restList("orders", "Order", undefined, apiToken)).data as unknown as Order[]
  const filtered = search ? rows.filter((row) => String(row.order_number).includes(search)) : rows
  return {
    count: filtered.length,
    next: null,
    previous: null,
    results: filtered,
  }
}

export async function getPurchaseOrders(search?: string, token?: string): Promise<PurchaseOrder[]> {
  const apiToken = await getToken(token)
  const rows = (await restList("merchandising", "PurchaseOrder", undefined, apiToken)).data as unknown as PurchaseOrder[]
  return search ? rows.filter((row) => String(row.po_number).includes(search)) : rows
}

export async function getBuyerPortfolios(token?: string): Promise<BuyerPortfolio[]> {
  const apiToken = await getToken(token)
  const rows = (await restList("buyers", "BuyerPortfolio", undefined, apiToken)).data as unknown as BuyerPortfolio[]
  return rows
}

export async function getDashboardOrdersSummary(token?: string): Promise<{
  total_ytd: string
  active_buyers: number
  avg_lead_time_days: number
  samples_pending: number
}> {
  const apiToken = await getToken(token)
  const [{ data: orders }, { data: samples }] = await Promise.all([
    restList("orders", "Order", undefined, apiToken),
    restList("merchandising", "SampleOrder", undefined, apiToken),
  ])
  const totalValue = orders.reduce((sum, row) => sum + (Number(row.total_value) || 0), 0)
  const leadTimes = orders
    .map((row) => {
      const start = new Date(String(row.order_date ?? "")).getTime()
      const end = new Date(String(row.delivery_date ?? "")).getTime()
      return Number.isFinite(start) && Number.isFinite(end) ? (end - start) / 86400000 : null
    })
    .filter((days): days is number => days !== null)
  const avgLeadTime =
    leadTimes.length > 0 ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length : 0
  const samplesPending = samples.filter((row) =>
    ["pending", "in_progress", "draft", "requested"].includes(String(row.status ?? "")),
  ).length
  return {
    total_ytd: totalValue.toFixed(2),
    active_buyers: orders.length,
    avg_lead_time_days: Math.round(avgLeadTime),
    samples_pending: samplesPending,
  }
}
