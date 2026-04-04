import type { HassEntities, HassEntity } from 'home-assistant-js-websocket';
import { z } from 'zod';
export declare const HaConfigSchema: z.ZodObject<{
    url: z.ZodString;
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    token: string;
}, {
    url: string;
    token: string;
}>;
export type HaConfig = z.infer<typeof HaConfigSchema>;
interface EntityRegistryEntry {
    entity_id: string;
    area_id?: string | null;
    device_id?: string | null;
}
interface DeviceRegistryEntry {
    id: string;
    area_id?: string | null;
}
export declare class HomeAssistantClient {
    private readonly config;
    private entities;
    constructor(config: HaConfig);
    private connection;
    private connectPromise;
    private ensureConnected;
    private _connect;
    private wsCall;
    getState(entityId: string): Promise<HassEntity | null>;
    listStates(): Promise<HassEntities>;
    callService(domain: string, service: string, data: Record<string, unknown>): Promise<{
        ok: boolean;
        message: string;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        message?: undefined;
    }>;
    listServices(): Promise<import("home-assistant-js-websocket").HassServices>;
    listAreas(): Promise<unknown>;
    listDevices(): Promise<DeviceRegistryEntry[]>;
    listEntityRegistry(): Promise<EntityRegistryEntry[]>;
    private restRequest;
    getLogbook(params: {
        since: string;
        end?: string;
        entity_id?: string;
    }): Promise<unknown>;
    getHistory(params: {
        since: string;
        end?: string;
        entity_id?: string;
        minimal_response?: boolean;
    }): Promise<unknown>;
    turnOffAreaLights(params: {
        area_id: string;
        transition?: number;
    }): Promise<{
        ok: boolean;
        changed: number;
    }>;
    turnOnAreaLights(params: {
        area_id: string;
        brightness_pct?: number;
        transition?: number;
    }): Promise<{
        ok: boolean;
        changed: number;
    }>;
    getEntitiesByArea(areaId: string): Promise<{
        state: HassEntity;
        entity_id: string;
        area_id?: string | null;
        device_id?: string | null;
    }[]>;
    getEntitiesByType(entityType: string): Promise<{
        state: HassEntity;
        entity_id: string;
        area_id?: string | null;
        device_id?: string | null;
    }[]>;
}
export {};
//# sourceMappingURL=ha.d.ts.map