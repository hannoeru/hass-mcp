import { describe, expect, it, vi } from 'vitest'

import { HomeAssistantClient } from '../src/ha'

vi.mock('home-assistant-js-websocket', () => {
  return {
    createLongLivedTokenAuth: vi.fn(() => ({ type: 'auth' })),
    createConnection: vi.fn(async () => ({
      sendMessagePromise: vi.fn(async (msg: any) => {
        if (msg.type === 'config/entity_registry/list') {
          return [
            { entity_id: 'light.a', area_id: 'living' },
            { entity_id: 'light.b', area_id: 'living' },
            { entity_id: 'switch.x', area_id: 'living' },
            { entity_id: 'light.other', area_id: 'kitchen' },
          ]
        }
        return []
      }),
    })),
    subscribeEntities: vi.fn((_conn: any, cb: any) => {
      cb({})
      return () => {}
    }),
    getStates: vi.fn(async () => ([])),
    callService: vi.fn(async () => {}),
    getServices: vi.fn(async () => ({})),
  }
})

describe('area lights tools', () => {
  it('turnOffAreaLights collects light.* entities in area and calls light.turn_off', async () => {
    const { callService } = await import('home-assistant-js-websocket')
    const client = new HomeAssistantClient({ url: 'http://homeassistant.local:8123', token: 'x' })

    const res = await client.turnOffAreaLights({ area_id: 'living', transition: 5 })
    expect(res).toEqual({ ok: true, changed: 2 })

    expect(callService).toHaveBeenCalledWith(
      expect.anything(),
      'light',
      'turn_off',
      expect.objectContaining({
        entity_id: ['light.a', 'light.b'],
        transition: 5,
      }),
    )
  })
})
