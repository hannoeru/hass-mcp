import type { HassEntities, HassEntity } from 'home-assistant-js-websocket'

import {
  callService,
  createConnection,
  createLongLivedTokenAuth,
  getServices,
  getStates,
  subscribeEntities,
} from 'home-assistant-js-websocket'
import { z } from 'zod'

import { joinUrl } from './rest.js'

export const HaConfigSchema = z.object({
  url: z.string().min(1),
  token: z.string().min(1),
})

export type HaConfig = z.infer<typeof HaConfigSchema>

function normalizeBaseUrl(url: string) {
  // Accept `homeassistant.local:8123` too
  if (!/^https?:\/\//.test(url))
    return `http://${url}`
  return url
}

interface EntityRegistryEntry {
  entity_id: string
  area_id?: string | null
}

export class HomeAssistantClient {
  private entities: HassEntities = {}

  constructor(private readonly config: HaConfig) {}

  private connection: Parameters<typeof callService>[0] | null = null
  private connectPromise: Promise<Parameters<typeof callService>[0]> | null = null

  private async ensureConnected() {
    if (this.connection)
      return this.connection

    if (!this.connectPromise)
      this.connectPromise = this._connect()

    this.connection = await this.connectPromise
    return this.connection
  }

  private async _connect() {
    const baseUrl = normalizeBaseUrl(this.config.url)
    const auth = createLongLivedTokenAuth(baseUrl, this.config.token)

    try {
      const connection = await createConnection({ auth })

      // Prime initial state snapshot so the first calls don't return empty.
      const states = await getStates(connection)
      this.entities = Object.fromEntries(states.map(s => [s.entity_id, s]))

      // Keep an in-memory cache of entities, updated in real-time.
      subscribeEntities(connection, (entities) => {
        this.entities = entities
      })

      return connection
    }
    catch (err) {
      // Reset so later calls can retry.
      this.connectPromise = null
      this.connection = null
      throw err
    }
  }

  private async wsCall<T>(type: string, payload: Record<string, unknown> = {}): Promise<T> {
    const connection: any = await this.ensureConnected()
    if (typeof connection.sendMessagePromise !== 'function')
      throw new Error('Home Assistant connection does not support sendMessagePromise')

    return await connection.sendMessagePromise({ type, ...payload }) as T
  }

  async getState(entityId: string): Promise<HassEntity | null> {
    // Ensure we have a state snapshot.
    await this.ensureConnected()
    return this.entities[entityId] ?? null
  }

  async listStates(): Promise<HassEntities> {
    await this.ensureConnected()
    return this.entities
  }

  async callService(domain: string, service: string, data: Record<string, unknown>) {
    const connection = await this.ensureConnected()

    // callService returns void in the library; we return a small acknowledgement
    await callService(connection, domain, service, data)
    return { ok: true }
  }

  async listServices() {
    const connection = await this.ensureConnected()
    return await getServices(connection)
  }

  async listAreas() {
    return await this.wsCall('config/area_registry/list')
  }

  async listDevices() {
    return await this.wsCall('config/device_registry/list')
  }

  async listEntityRegistry(): Promise<EntityRegistryEntry[]> {
    return await this.wsCall('config/entity_registry/list')
  }

  private async restRequest<T>(path: string): Promise<T> {
    const baseUrl = normalizeBaseUrl(this.config.url)
    const url = joinUrl(baseUrl, path)

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.config.token}`,
      },
    })

    if (!res.ok)
      throw new Error(`Home Assistant REST error ${res.status} ${res.statusText}`)

    return await res.json() as T
  }

  async getLogbook(params: {
    since: string
    end?: string
    entity_id?: string
  }) {
    const qs = new URLSearchParams()
    if (params.entity_id)
      qs.set('entity', params.entity_id)
    if (params.end)
      qs.set('end_time', params.end)

    const q = qs.toString()
    return await this.restRequest(`/api/logbook/${encodeURIComponent(params.since)}${q ? `?${q}` : ''}`)
  }

  async getHistory(params: {
    since: string
    end?: string
    entity_id?: string
    minimal_response?: boolean
  }) {
    const qs = new URLSearchParams()
    if (params.entity_id)
      qs.set('filter_entity_id', params.entity_id)
    if (params.end)
      qs.set('end_time', params.end)
    if (params.minimal_response)
      qs.set('minimal_response', '1')

    const q = qs.toString()
    return await this.restRequest(`/api/history/period/${encodeURIComponent(params.since)}${q ? `?${q}` : ''}`)
  }

  async turnOffAreaLights(params: { area_id: string, transition?: number }) {
    const entries = await this.listEntityRegistry()
    const entityIds = entries
      .filter(e => e.area_id === params.area_id)
      .map(e => e.entity_id)
      .filter(eid => eid.startsWith('light.'))

    if (entityIds.length === 0)
      return { ok: true, changed: 0 }

    await this.callService('light', 'turn_off', {
      entity_id: entityIds,
      ...(typeof params.transition === 'number' ? { transition: params.transition } : {}),
    })

    return { ok: true, changed: entityIds.length }
  }

  async turnOnAreaLights(params: { area_id: string, brightness_pct?: number, transition?: number }) {
    const entries = await this.listEntityRegistry()
    const entityIds = entries
      .filter(e => e.area_id === params.area_id)
      .map(e => e.entity_id)
      .filter(eid => eid.startsWith('light.'))

    if (entityIds.length === 0)
      return { ok: true, changed: 0 }

    const data: Record<string, unknown> = {
      entity_id: entityIds,
    }

    if (typeof params.brightness_pct === 'number')
      data.brightness_pct = params.brightness_pct

    if (typeof params.transition === 'number')
      data.transition = params.transition

    await this.callService('light', 'turn_on', data)

    return { ok: true, changed: entityIds.length }
  }
}
