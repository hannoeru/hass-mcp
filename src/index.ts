import process from 'node:process'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

import { HaConfigSchema, HomeAssistantClient } from './ha.js'
import {
  CallServiceInput,
  GetStateInput,
  ListAreasInput,
  ListDevicesInput,
  ListEntityRegistryInput,
  ListServicesInput,
  ListStatesInput,
  TurnOffLightInput,
  TurnOnLightInput,
} from './tools.js'

const EnvSchema = z.object({
  HASS_URL: z.string().min(1),
  HASS_TOKEN: z.string().min(1),
})

function getConfig() {
  const env = EnvSchema.parse({
    HASS_URL: process.env.HASS_URL,
    HASS_TOKEN: process.env.HASS_TOKEN,
  })

  return HaConfigSchema.parse({
    url: env.HASS_URL,
    token: env.HASS_TOKEN,
  })
}

async function main() {
  const config = getConfig()
  const ha = await HomeAssistantClient.create(config)

  const server = new McpServer({
    name: 'hass-mcp',
    version: '0.1.0',
  })

  server.tool(
    'ha_get_state',
    'Get Home Assistant entity state by entity_id.',
    GetStateInput.shape,
    async (input) => {
      const state = ha.getState(input.entity_id)
      return {
        content: [{ type: 'text', text: JSON.stringify(state, null, 2) }],
      }
    },
  )

  server.tool(
    'ha_list_states',
    'List Home Assistant entity states (can be large).',
    ListStatesInput.shape,
    async () => {
      const states = ha.listStates()
      return {
        content: [{ type: 'text', text: JSON.stringify(states, null, 2) }],
      }
    },
  )

  server.tool(
    'ha_list_services',
    'List Home Assistant services and their fields.',
    ListServicesInput.shape,
    async () => {
      const services = await ha.listServices()
      return {
        content: [{ type: 'text', text: JSON.stringify(services, null, 2) }],
      }
    },
  )

  server.tool(
    'ha_list_areas',
    'List Home Assistant areas from the area registry.',
    ListAreasInput.shape,
    async () => {
      const areas = await ha.listAreas()
      return {
        content: [{ type: 'text', text: JSON.stringify(areas, null, 2) }],
      }
    },
  )

  server.tool(
    'ha_list_devices',
    'List Home Assistant devices from the device registry.',
    ListDevicesInput.shape,
    async () => {
      const devices = await ha.listDevices()
      return {
        content: [{ type: 'text', text: JSON.stringify(devices, null, 2) }],
      }
    },
  )

  server.tool(
    'ha_list_entity_registry',
    'List Home Assistant entity registry entries.',
    ListEntityRegistryInput.shape,
    async () => {
      const entities = await ha.listEntityRegistry()
      return {
        content: [{ type: 'text', text: JSON.stringify(entities, null, 2) }],
      }
    },
  )

  server.tool(
    'ha_light_turn_on',
    'Turn on a light by entity_id.',
    TurnOnLightInput.shape,
    async (input) => {
      const res = await ha.callService('light', 'turn_on', { entity_id: input.entity_id })
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      }
    },
  )

  server.tool(
    'ha_light_turn_off',
    'Turn off a light by entity_id.',
    TurnOffLightInput.shape,
    async (input) => {
      const res = await ha.callService('light', 'turn_off', { entity_id: input.entity_id })
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      }
    },
  )

  server.tool(
    'ha_call_service',
    'Call a Home Assistant service (domain/service) with data payload.',
    CallServiceInput.shape,
    async (input) => {
      const res = await ha.callService(input.domain, input.service, input.data)
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      }
    },
  )

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
