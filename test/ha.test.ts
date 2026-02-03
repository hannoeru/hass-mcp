import { describe, expect, it, vi } from 'vitest'

import { HomeAssistantClient } from '../src/ha'

vi.mock('home-assistant-js-websocket', () => {
  return {
    createLongLivedTokenAuth: vi.fn(() => ({ type: 'auth' })),
    createConnection: vi.fn(async () => ({
      sendMessagePromise: vi.fn(async (msg: any) => {
        if (msg.type === 'config/area_registry/list')
          return [{ area_id: 'living', name: 'Living' }]
        if (msg.type === 'config/device_registry/list')
          return [{ id: 'dev1' }]
        if (msg.type === 'config/entity_registry/list')
          return [{ entity_id: 'light.test' }]
        return []
      }),
    })),
    subscribeEntities: vi.fn((_conn: any, cb: any) => {
      cb({ 'light.test': { entity_id: 'light.test', state: 'on', attributes: {} } })
      return () => {}
    }),
    callService: vi.fn(async () => {}),
    getServices: vi.fn(async () => ({ light: { turn_on: { fields: {} } } })),
  }
})

describe('homeAssistantClient', () => {
  it('subscribes to entities and can read cached state', async () => {
    const client = new HomeAssistantClient({ url: 'http://homeassistant.local:8123', token: 'x' })

    // Trigger connection + subscription
    await client.listServices()

    expect(client.getState('light.test')?.state).toBe('on')
  })

  it('listServices returns services map', async () => {
    const client = new HomeAssistantClient({ url: 'http://homeassistant.local:8123', token: 'x' })
    const services = await client.listServices()
    expect(services).toHaveProperty('light')
  })

  it('registry list calls work via wsCall', async () => {
    const client = new HomeAssistantClient({ url: 'homeassistant.local:8123', token: 'x' })
    const areas = await client.listAreas()
    expect(areas[0].area_id).toBe('living')

    const devices = await client.listDevices()
    expect(devices[0].id).toBe('dev1')

    const entities = await client.listEntityRegistry()
    expect(entities[0].entity_id).toBe('light.test')
  })
})
