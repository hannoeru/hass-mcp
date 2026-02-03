import { describe, expect, it, vi } from 'vitest'

import { HomeAssistantClient } from '../src/ha'

vi.mock('home-assistant-js-websocket', () => {
  return {
    createLongLivedTokenAuth: vi.fn(() => ({ type: 'auth' })),
    createConnection: vi.fn(async () => ({ sendMessagePromise: vi.fn(async () => ([])) })),
    subscribeEntities: vi.fn((_conn: any, cb: any) => {
      cb({})
      return () => {}
    }),
    getStates: vi.fn(async () => ([])),
    callService: vi.fn(async () => {}),
    getServices: vi.fn(async () => ({})),
  }
})

describe('rEST endpoints', () => {
  it('getLogbook calls /api/logbook', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ([{ name: 'x' }]),
    }))
    vi.stubGlobal('fetch', fetchMock as any)

    const client = new HomeAssistantClient({ url: 'http://homeassistant.local:8123', token: 'tok' })
    const res = await client.getLogbook({ since: '2026-01-01T00:00:00Z', entity_id: 'light.test' })

    expect(res).toEqual([{ name: 'x' }])
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/logbook/2026-01-01T00%3A00%3A00Z?entity=light.test'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
      }),
    )
  })

  it('getHistory calls /api/history/period', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ([[{ s: '1' }]]),
    }))
    vi.stubGlobal('fetch', fetchMock as any)

    const client = new HomeAssistantClient({ url: 'homeassistant.local:8123', token: 'tok' })
    const res = await client.getHistory({ since: '2026-01-01T00:00:00Z', minimal_response: true })

    expect(res).toEqual([[{ s: '1' }]])
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/history/period/2026-01-01T00%3A00%3A00Z?minimal_response=1'),
      expect.anything(),
    )
  })
})
