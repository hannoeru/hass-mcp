import { callService, createConnection, createLongLivedTokenAuth, getServices, getStates, subscribeEntities, } from 'home-assistant-js-websocket';
import { z } from 'zod';
import { joinUrl } from './rest.js';
export const HaConfigSchema = z.object({
    url: z.string().min(1),
    token: z.string().min(1),
});
function normalizeBaseUrl(url) {
    // Accept `homeassistant.local:8123` too
    if (!/^https?:\/\//.test(url))
        return `http://${url}`;
    return url;
}
export class HomeAssistantClient {
    config;
    entities = {};
    constructor(config) {
        this.config = config;
    }
    connection = null;
    connectPromise = null;
    async ensureConnected() {
        if (this.connection)
            return this.connection;
        if (!this.connectPromise)
            this.connectPromise = this._connect();
        this.connection = await this.connectPromise;
        return this.connection;
    }
    async _connect() {
        const baseUrl = normalizeBaseUrl(this.config.url);
        const auth = createLongLivedTokenAuth(baseUrl, this.config.token);
        try {
            const connection = await createConnection({ auth });
            // Prime initial state snapshot so the first calls don't return empty.
            const states = await getStates(connection);
            this.entities = Object.fromEntries(states.map(s => [s.entity_id, s]));
            // Keep an in-memory cache of entities, updated in real-time.
            subscribeEntities(connection, (entities) => {
                this.entities = entities;
            });
            return connection;
        }
        catch (err) {
            // Reset so later calls can retry.
            this.connectPromise = null;
            this.connection = null;
            throw err;
        }
    }
    async wsCall(type, payload = {}) {
        const connection = await this.ensureConnected();
        if (typeof connection.sendMessagePromise !== 'function')
            throw new Error('Home Assistant connection does not support sendMessagePromise');
        return await connection.sendMessagePromise({ type, ...payload });
    }
    async getState(entityId) {
        // Ensure we have a state snapshot.
        await this.ensureConnected();
        return this.entities[entityId] ?? null;
    }
    async listStates() {
        await this.ensureConnected();
        return this.entities;
    }
    async callService(domain, service, data) {
        const connection = await this.ensureConnected();
        try {
            // callService returns void in the library; we return a small acknowledgement
            await callService(connection, domain, service, data);
            return { ok: true, message: `Service ${domain}.${service} called successfully` };
        }
        catch (error) {
            console.error(`Failed to call service ${domain}.${service}:`, error);
            return {
                ok: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    async listServices() {
        const connection = await this.ensureConnected();
        return await getServices(connection);
    }
    async listAreas() {
        return await this.wsCall('config/area_registry/list');
    }
    async listDevices() {
        return await this.wsCall('config/device_registry/list');
    }
    async listEntityRegistry() {
        return await this.wsCall('config/entity_registry/list');
    }
    async restRequest(path) {
        const baseUrl = normalizeBaseUrl(this.config.url);
        const url = joinUrl(baseUrl, path);
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.config.token}`,
            },
        });
        if (!res.ok)
            throw new Error(`Home Assistant REST error ${res.status} ${res.statusText}`);
        return await res.json();
    }
    async getLogbook(params) {
        const qs = new URLSearchParams();
        if (params.entity_id)
            qs.set('entity', params.entity_id);
        if (params.end)
            qs.set('end_time', params.end);
        const q = qs.toString();
        return await this.restRequest(`/api/logbook/${encodeURIComponent(params.since)}${q ? `?${q}` : ''}`);
    }
    async getHistory(params) {
        const qs = new URLSearchParams();
        if (params.entity_id)
            qs.set('filter_entity_id', params.entity_id);
        if (params.end)
            qs.set('end_time', params.end);
        if (params.minimal_response)
            qs.set('minimal_response', '1');
        const q = qs.toString();
        return await this.restRequest(`/api/history/period/${encodeURIComponent(params.since)}${q ? `?${q}` : ''}`);
    }
    async turnOffAreaLights(params) {
        const entries = await this.listEntityRegistry();
        const entityIds = entries
            .filter(e => e.area_id === params.area_id)
            .map(e => e.entity_id)
            .filter(eid => eid.startsWith('light.'));
        if (entityIds.length === 0)
            return { ok: true, changed: 0 };
        await this.callService('light', 'turn_off', {
            entity_id: entityIds,
            ...(typeof params.transition === 'number' ? { transition: params.transition } : {}),
        });
        return { ok: true, changed: entityIds.length };
    }
    async turnOnAreaLights(params) {
        const entries = await this.listEntityRegistry();
        const entityIds = entries
            .filter(e => e.area_id === params.area_id)
            .map(e => e.entity_id)
            .filter(eid => eid.startsWith('light.'));
        if (entityIds.length === 0)
            return { ok: true, changed: 0 };
        const data = {
            entity_id: entityIds,
        };
        if (typeof params.brightness_pct === 'number')
            data.brightness_pct = params.brightness_pct;
        if (typeof params.transition === 'number')
            data.transition = params.transition;
        await this.callService('light', 'turn_on', data);
        return { ok: true, changed: entityIds.length };
    }
    async getEntitiesByArea(areaId) {
        const [entries, devices] = await Promise.all([
            this.listEntityRegistry(),
            this.listDevices()
        ]);
        // 创建设备ID到区域的映射
        const deviceAreaMap = new Map();
        devices.forEach(device => {
            if (device.area_id) {
                deviceAreaMap.set(device.id, device.area_id);
            }
        });
        // 过滤实体：实体本身有区域，或者通过设备继承区域
        const entities = entries.filter(entity => {
            // 实体直接有区域
            if (entity.area_id === areaId)
                return true;
            // 实体通过设备继承区域
            if (entity.device_id && deviceAreaMap.has(entity.device_id)) {
                return deviceAreaMap.get(entity.device_id) === areaId;
            }
            return false;
        });
        // 获取实体的当前状态
        await this.ensureConnected();
        const entitiesWithState = entities.map(entity => ({
            ...entity,
            state: this.entities[entity.entity_id] || null
        }));
        return entitiesWithState;
    }
    async getEntitiesByType(entityType) {
        const entries = await this.listEntityRegistry();
        const entities = entries.filter(e => e.entity_id.startsWith(`${entityType}.`));
        // 获取实体的当前状态
        await this.ensureConnected();
        const entitiesWithState = entities.map(entity => ({
            ...entity,
            state: this.entities[entity.entity_id] || null
        }));
        return entitiesWithState;
    }
}
//# sourceMappingURL=ha.js.map