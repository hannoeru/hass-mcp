import type { HassEntities, HassEntity } from 'home-assistant-js-websocket'

import {
  callService,
  createConnection,
  createLongLivedTokenAuth,
  getServices,
  subscribeEntities,
} from 'home-assistant-js-websocket'
import { z } from 'zod'

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

  getState(entityId: string): HassEntity | null {
    return this.entities[entityId] ?? null
  }

  listStates(): HassEntities {
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

  async listEntityRegistry() {
    return await this.wsCall('config/entity_registry/list')
  }
}
