import { z } from 'zod'

export const GetStateInput = z.object({
  entity_id: z.string().min(1),
})

export const CallServiceInput = z.object({
  domain: z.string().min(1),
  service: z.string().min(1),
  data: z.record(z.unknown()).default({}),
})

export const ListStatesInput = z.object({}).strict()
export const ListAreasInput = z.object({}).strict()
export const ListDevicesInput = z.object({}).strict()
export const ListEntityRegistryInput = z.object({}).strict()
export const ListServicesInput = z.object({}).strict()

export const TurnOnLightInput = z.object({
  entity_id: z.string().min(1),
})

export const TurnOffLightInput = z.object({
  entity_id: z.string().min(1),
})

export const AreaLightsOffInput = z.object({
  area_id: z.string().min(1),
  transition: z.number().optional(),
})

export const AreaLightsOnInput = z.object({
  area_id: z.string().min(1),
  brightness_pct: z.number().min(0).max(100).optional(),
  transition: z.number().optional(),
})

export const GetLogbookInput = z.object({
  since: z.string().min(1),
  end: z.string().min(1).optional(),
  entity_id: z.string().min(1).optional(),
})

export const GetHistoryInput = z.object({
  since: z.string().min(1),
  end: z.string().min(1).optional(),
  entity_id: z.string().min(1).optional(),
  minimal_response: z.boolean().optional(),
})
