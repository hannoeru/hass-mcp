import type { HassEntities, HassEntity } from 'home-assistant-js-websocket'

import {
  callService,
  createConnection,
  createLongLivedTokenAuth,
  getServices,
  subscribeEntities,
} from 'home-assistant-js-websocket'
import { minLength, object, pipe, string } from 'valibot'

export const HaConfigSchema = object({
  url: pipe(string(), minLength(1)),
  token: pipe(string(), minLength(1)),
})

export interface HaConfig {
  url: string
  token: string
}

function normalizeBaseUrl(url: string) {
  // Accept `homeassistant.local:8123` too
  if (!/^https?:\/\//.test(url))
    return `http://${url}`
  return url
}

export class HomeAssistantClient {
  private entities: HassEntities = {}

  private constructor() {}

  private async wsCall<T>(type: string, payload: Record<string, unknown> = {}): Promise<T> {
    const connAny = this.connection as any
    if (typeof connAny.sendMessagePromise !== 'function')
      throw new Error('Home Assistant connection does not support sendMessagePromise')

    return await connAny.sendMessagePromise({ type, ...payload }) as T
  }

  static async create(config: HaConfig) {
    const client = new HomeAssistantClient()

    const baseUrl = normalizeBaseUrl(config.url)
    const auth = createLongLivedTokenAuth(baseUrl, config.token)
    const connection = await createConnection({ auth })

    // Keep an in-memory cache of entities, updated in real-time.
    subscribeEntities(connection, (entities) => {
      client.entities = entities
    })

    client.connection = connection
    return client
  }

  private connection!: Parameters<typeof callService>[0]

  getState(entityId: string): HassEntity | null {
    return this.entities[entityId] ?? null
  }

  listStates(): HassEntities {
    return this.entities
  }

  async callService(domain: string, service: string, data: Record<string, unknown>) {
    // callService returns void in the library; we return a small acknowledgement
    await callService(this.connection, domain, service, data)
    return { ok: true }
  }

  async listServices() {
    return await getServices(this.connection)
  }

  async listAreas() {
    return await this.wsCall('config/area_registry/list')
  }

  async listDevices() {
    return await this.wsCall('config/device_registry/list')
  }

  async listEntityRegistry() {
    return await this.wsCall('config/entity_registry/list')
  }
}
