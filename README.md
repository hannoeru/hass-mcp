# @morairty0909/hass-mcp (Moriarty0909 修复增强版)

> ⚠️ **此 fork 修复了原版的关键 bug 并新增功能**：
> - 修复 `ha_call_service` 参数字段名错误
> - 新增 `ha_get_entities_by_area` 和 `ha_get_entities_by_type` 工具
> - 修复 `ha_get_entities_by_area` 区域继承逻辑（v0.1.10）
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

## 🔄 版本更新日志

### v0.1.10 (最新)
- **修复**: `ha_get_entities_by_area` 现在支持实体通过设备继承区域
  - 之前只检查实体本身的 `area_id`
  - 现在同时检查设备所属区域，解决餐厅灯等实体无法正确识别的问题

### v0.1.9
- **发布**: 首次发布到 npm (@morairty0909/hass-mcp)
- **修复**: 解决 npm 发布权限问题

### v0.1.8
- **新增**: `ha_get_entities_by_area` 和 `ha_get_entities_by_type` 工具

---

An open-source **MCP server** for controlling and querying **Home Assistant**.

- Transport: stdio
- Auth: Home Assistant long-lived token
- API: Home Assistant REST API

## Features

Tools exposed:

**状态查询**:
- `ha_get_state` — get state for an entity
- `ha_list_states` — list all states (can be large)
- `ha_get_entities_by_area` — get entities in specific area with states (支持设备区域继承)
- `ha_get_entities_by_type` — get entities of specific type with states

**控制操作**:
- `ha_call_service` — call any service
- `ha_light_turn_on/off` — light control
- `ha_area_lights_on/off` — area lights batch control

**配置查询**:
- `ha_list_services` — list available services
- `ha_list_areas` — list areas
- `ha_list_devices` — list devices
- `ha_list_entity_registry` — list entity registry

**历史数据**:
- `ha_get_logbook` — get logbook entries
- `ha_get_history` — get history data

## Install

### 方式 1：从 npm 安装（最新版本）✅

**注意**: 包已发布到 npm，包含最新功能。

```bash
npx @morairty0909/hass-mcp
```

### 方式 2：从 GitHub 安装

```bash
npx -y github:Moriarty0909/hass-mcp#main
```

### 方式 3：本地源码安装

```bash
git clone https://github.com/Moriarty0909/hass-mcp.git
cd hass-mcp
pnpm install
pnpm build
```

## Run

```bash
export HASS_URL="http://homeassistant.local:8123"
export HASS_TOKEN="<your long-lived access token>"

# 使用 npm 包（推荐）
npx @morairty0909/hass-mcp

# 或使用 GitHub
npx -y github:Moriarty0909/hass-mcp#main
```
## Configure in an MCP client

Example (CoPaw config.json):

      

{
  "mcpServers": {
    "homeassistant": {
      "name": "homeassistant_mcp",
      "command": "npx",
      "args": ["@morairty0909/hass-mcp"],
      "env": {
        "HASS_URL": "http://homeassistant.local:8123",
        "HASS_TOKEN": "你的 long-lived access token"
      }
    }
  }
}

## Security

- Treat tokens as secrets.
- Prefer running this server on the same LAN as Home Assistant.
- If your HA is behind Cloudflare Access, run this MCP server on the LAN side.

## License

MIT
