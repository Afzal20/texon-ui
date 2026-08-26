"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { fetchAllData, type AllData } from "@/lib/api/rest"

export async function fetchAllFromRest(token?: string): Promise<AllData> {
  const apiToken = await getApiToken(token)
  return fetchAllData(apiToken)
}
