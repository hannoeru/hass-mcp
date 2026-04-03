# hass-mcp (Moriarty0909 修复版)

> ⚠️ **此 fork 修复了原版的一个关键 bug**：`ha_call_service` 参数字段名错误导致服务调用失败。
> 
> 原版仓库：[hannoeru/hass-mcp](https://github.com/hannoeru/hass-mcp)  
> 已提交 PR：[#2](https://github.com/hannoeru/hass-mcp/pull/2)

---

## 🔧 修复内容

### 问题描述

调用 `ha_call_service` 工具时，参数字段名使用 `service_data`，但工具 schema 定义的是 `data`，导致参数无法正确传递给 Home Assistant，服务调用失败。

**症状**：
- 工具返回 `[object Object]`
- 服务实际未执行
- 实体状态无变化

### 修复方案

- **修复参数字段名**: `service_data` → `data`（与 schema 定义一致）
- 添加错误处理（try-catch）
- 添加调用日志便于调试

### 测试验证

- [x] light.turn_on / light.turn_off
- [x] switch.turn_on / switch.turn_off
- [x] 服务正常执行，返回正确响应

### 修改文件

- `src/ha.ts`: 添加 try-catch 错误处理
- `src/index.ts`: 修复参数字段名，增强错误处理

---

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

### 方式 1：直接从 GitHub 安装（推荐）✅

```bash
npx -y github:Moriarty0909/hass-mcp#main


      



方式 2：本地源码安装




      

git clone https://github.com/Moriarty0909/hass-mcp.git
cd hass-mcp
pnpm install
pnpm build


      



Run




      

export HASS_URL="http://homeassistant.local:8123"
export HASS_TOKEN="<your long-lived access token>"

npx -y github:Moriarty0909/hass-mcp#main


      



Configure in an MCP client

Example (CoPaw config.json):




      

{
  "mcpServers": {
    "homeassistant": {
      "name": "homeassistant_mcp",
      "command": "npx",
      "args": ["-y", "github:Moriarty0909/hass-mcp#main"],
      "env": {
        "HASS_URL": "http://homeassistant.local:8123",
        "HASS_TOKEN": "你的 long-lived access token"
      }
    }
  }
}


      



Security



Treat tokens as secrets.

Prefer running this server on the same LAN as Home Assistant.

If your HA is behind Cloudflare Access, run this MCP server on the LAN side.



License

MIT
