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
