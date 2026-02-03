import { z } from 'zod'

export const HaConfigSchema = z.object({
  url: z.string().url().or(z.string().startsWith('http://')).or(z.string().startsWith('https://')),
  token: z.string().min(1),
})

export type HaConfig = z.infer<typeof HaConfigSchema>

export class HomeAssistantClient {
  constructor(private readonly config: HaConfig) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = new URL(path.replace(/^\//, ''), this.config.url.endsWith('/') ? this.config.url : `${this.config.url}/`)

    const res = await fetch(url, {
      ...init,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Home Assistant API error ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`)
    }

    // Some HA endpoints return 200 with empty body
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json'))
      return (await res.text()) as unknown as T

    return await res.json() as T
  }

  async getState(entityId: string) {
    return await this.request(`/api/states/${entityId}`)
  }

  async listStates() {
    return await this.request('/api/states')
  }

  async callService(domain: string, service: string, data: Record<string, unknown>) {
    return await this.request(`/api/services/${domain}/${service}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}
