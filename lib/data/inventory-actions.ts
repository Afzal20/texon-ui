"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { restList } from "@/lib/api/rest"
import type { Fabric, Accessory, StockMovement, InventorySummary } from "./inventory"

async function getToken(token?: string): Promise<string> {
  return getApiToken(token)
}

export async function getFabrics(search?: string, token?: string): Promise<Fabric[]> {
  const apiToken = await getToken(token)
  const rows = (await restList("inventory", "Fabric", undefined, apiToken)).data as unknown as Fabric[]
  return search
    ? rows.filter((row) => `${row.name} ${row.code} ${row.color}`.toLowerCase().includes(search.toLowerCase()))
    : rows
}

export async function getAccessories(token?: string): Promise<Accessory[]> {
  const apiToken = await getToken(token)
  return (await restList("inventory", "Accessory", undefined, apiToken)).data as unknown as Accessory[]
}

export async function getStockMovements(token?: string): Promise<StockMovement[]> {
  const apiToken = await getToken(token)
  return (await restList("inventory", "StockMovement", undefined, apiToken)).data as unknown as StockMovement[]
}

export async function getInventorySummary(token?: string): Promise<InventorySummary> {
  const apiToken = await getToken(token)
  const [{ data: fabrics }, { data: accessories }, { data: trims }] = await Promise.all([
    restList("inventory", "Fabric", undefined, apiToken),
    restList("inventory", "Accessory", undefined, apiToken),
    restList("inventory", "Trim", undefined, apiToken),
  ])
  const deadstockAlerts = [...fabrics, ...accessories, ...trims].filter((row) => Number(row.quantity) <= 0).length
  const lowStockAlerts = [...fabrics, ...accessories, ...trims].filter(
    (row) => Number(row.quantity) > 0 && Number(row.quantity) < Number(row.threshold_quantity),
  ).length
  const totalValue = fabrics.reduce(
    (sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.unit_price) || 0),
    0,
  )
  return {
    total_fabrics: fabrics.length,
    total_accessories: accessories.length,
    total_trims: trims.length,
    deadstock_alerts: deadstockAlerts,
    low_stock_alerts: lowStockAlerts,
    total_value: totalValue.toFixed(2),
  }
}
