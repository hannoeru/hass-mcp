import { z } from 'zod';
export declare const GetStateInput: z.ZodObject<{
    entity_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entity_id: string;
}, {
    entity_id: string;
}>;
export declare const CallServiceInput: z.ZodObject<{
    domain: z.ZodString;
    service: z.ZodString;
    data: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    domain: string;
    service: string;
    data: Record<string, unknown>;
}, {
    domain: string;
    service: string;
    data?: Record<string, unknown> | undefined;
}>;
export declare const ListStatesInput: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
export declare const ListAreasInput: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
export declare const ListDevicesInput: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
export declare const ListEntityRegistryInput: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
export declare const ListServicesInput: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
export declare const TurnOnLightInput: z.ZodObject<{
    entity_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entity_id: string;
}, {
    entity_id: string;
}>;
export declare const TurnOffLightInput: z.ZodObject<{
    entity_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entity_id: string;
}, {
    entity_id: string;
}>;
export declare const AreaLightsOffInput: z.ZodObject<{
    area_id: z.ZodString;
    transition: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    area_id: string;
    transition?: number | undefined;
}, {
    area_id: string;
    transition?: number | undefined;
}>;
export declare const AreaLightsOnInput: z.ZodObject<{
    area_id: z.ZodString;
    brightness_pct: z.ZodOptional<z.ZodNumber>;
    transition: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    area_id: string;
    transition?: number | undefined;
    brightness_pct?: number | undefined;
}, {
    area_id: string;
    transition?: number | undefined;
    brightness_pct?: number | undefined;
}>;
export declare const GetLogbookInput: z.ZodObject<{
    since: z.ZodString;
    end: z.ZodOptional<z.ZodString>;
    entity_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    since: string;
    entity_id?: string | undefined;
    end?: string | undefined;
}, {
    since: string;
    entity_id?: string | undefined;
    end?: string | undefined;
}>;
export declare const GetHistoryInput: z.ZodObject<{
    since: z.ZodString;
    end: z.ZodOptional<z.ZodString>;
    entity_id: z.ZodOptional<z.ZodString>;
    minimal_response: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    since: string;
    minimal_response?: boolean | undefined;
    entity_id?: string | undefined;
    end?: string | undefined;
}, {
    since: string;
    minimal_response?: boolean | undefined;
    entity_id?: string | undefined;
    end?: string | undefined;
}>;
export declare const GetEntitiesByAreaInput: z.ZodObject<{
    area_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    area_id: string;
}, {
    area_id: string;
}>;
export declare const GetEntitiesByTypeInput: z.ZodObject<{
    type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
}, {
    type: string;
}>;
//# sourceMappingURL=tools.d.ts.map