import process from 'node:process'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { minLength, object, pipe, string } from 'valibot'

import { HaConfigSchema, HomeAssistantClient } from './ha.js'
import { parseWith } from './schema.js'
import { CallServiceInput, GetStateInput } from './tools.js'

const EnvSchema = object({
  HASS_URL: pipe(string(), minLength(1)),
  HASS_TOKEN: pipe(string(), minLength(1)),
})

function getConfig() {
  const env = parseWith(EnvSchema, {
    HASS_URL: process.env.HASS_URL,
    HASS_TOKEN: process.env.HASS_TOKEN,
  })

  return parseWith(HaConfigSchema, {
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
    { title: 'ha_get_state' },
    async (raw) => {
      const input = parseWith(GetStateInput, raw)
      const state = ha.getState(input.entity_id)
      return {
        content: [{ type: 'text', text: JSON.stringify(state, null, 2) }],
      }
    },
  )

  server.tool(
    'ha_list_states',
    'List Home Assistant entity states (can be large).',
    { title: 'ha_list_states' },
    async () => {
      const states = ha.listStates()
      return {
        content: [{ type: 'text', text: JSON.stringify(states, null, 2) }],
      }
    },
  )

  server.tool(
    'ha_call_service',
    'Call a Home Assistant service (domain/service) with data payload.',
    { title: 'ha_call_service' },
    async (raw) => {
      const input = parseWith(CallServiceInput, raw)
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
