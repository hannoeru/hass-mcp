# hass-mcp

An open-source **MCP server** for controlling and querying **Home Assistant**.

- Transport: stdio
- Auth: Home Assistant long-lived token
- API: Home Assistant REST API

## Features

Tools exposed:

- `ha_get_state` — get state for an entity
- `ha_list_states` — list all states (can be large)
- `ha_call_service` — call any service

## Install

```bash
pnpm install
pnpm build
```

## Run

```bash
export HASS_URL="http://homeassistant.local:8123"
export HASS_TOKEN="<your long-lived access token>"

pnpm start
```

## Configure in an MCP client

Example (conceptual):

```json
{
  "mcpServers": {
    "homeassistant": {
      "command": "hass-mcp",
      "args": [],
      "env": {
        "HASS_URL": "http://homeassistant.local:8123",
        "HASS_TOKEN": "..."
      }
    }
  }
}
```

## Security

- Treat tokens as secrets.
- Prefer running this server on the same LAN as Home Assistant.
- If your HA is behind Cloudflare Access, run this MCP server on the LAN side.

## License

MIT
