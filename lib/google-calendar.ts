import { createServiceClient } from '@/lib/supabase/server'

interface CreateEventParams {
  summary: string        // e.g. "Banho - Rex (Golden Retriever)"
  description?: string
  startIso: string       // ISO 8601 with timezone: "2026-05-12T10:00:00-03:00"
  endIso: string
  attendeeEmail?: string
  accessToken: string
  refreshToken: string
  petshopId: string      // Used to persist the refreshed token back to DB
}

export interface GCalEvent {
  id: string
  htmlLink: string
}

// Exchanges the refresh token for a new access token and persists it.
async function refreshAccessToken(refreshToken: string, petshopId: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  })

  const data = await res.json()
  if (!data.access_token) {
    throw new Error(`GCal token refresh failed: ${JSON.stringify(data)}`)
  }

  // Persist the new access token so the next call doesn't need to refresh again
  const supabase = createServiceClient()
  await supabase
    .from('petshops')
    .update({ gcal_access_token: data.access_token })
    .eq('id', petshopId)

  return data.access_token
}

// Creates a Google Calendar event on the petshop's primary calendar.
// Automatically retries once after refreshing an expired access token.
export async function createCalendarEvent(params: CreateEventParams): Promise<GCalEvent> {
  const body = {
    summary: params.summary,
    description: params.description,
    start: { dateTime: params.startIso, timeZone: 'America/Sao_Paulo' },
    end: { dateTime: params.endIso, timeZone: 'America/Sao_Paulo' },
    ...(params.attendeeEmail
      ? { attendees: [{ email: params.attendeeEmail }] }
      : {}),
  }

  async function callApi(token: string): Promise<Response> {
    return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  let res = await callApi(params.accessToken)

  // 401 means the access token expired — refresh once and retry
  if (res.status === 401) {
    const newToken = await refreshAccessToken(params.refreshToken, params.petshopId)
    res = await callApi(newToken)
  }

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`GCal create event failed: ${JSON.stringify(err)}`)
  }

  const event = await res.json()
  return { id: event.id, htmlLink: event.htmlLink }
}

interface DeleteEventParams {
  eventId: string
  accessToken: string
  refreshToken: string
  petshopId: string
}

// Deletes a Google Calendar event. Handles expired access tokens automatically.
export async function deleteCalendarEvent(params: DeleteEventParams): Promise<void> {
  async function callApi(token: string): Promise<Response> {
    return fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${params.eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  let res = await callApi(params.accessToken)

  // 401 means the access token expired — refresh once and retry
  if (res.status === 401) {
    const newToken = await refreshAccessToken(params.refreshToken, params.petshopId)
    res = await callApi(newToken)
  }

  // 404 is acceptable (event already deleted manually or doesn't exist)
  if (res.status === 404) {
    console.warn(`⚠️ [GCal Delete] Evento ${params.eventId} não encontrado no Google Calendar, ignorando...`)
    return
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GCal delete event failed: ${JSON.stringify(err)}`)
  }

  console.log(`✅ [GCal Delete] Evento ${params.eventId} excluído do Google Calendar com sucesso.`)
}

