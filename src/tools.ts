import { z } from 'zod'

export const GetStateInput = z.object({
  entity_id: z.string().min(1),
})

export const CallServiceInput = z.object({
  domain: z.string().min(1),
  service: z.string().min(1),
  data: z.record(z.string(), z.unknown()).default({}),
})

export const ListStatesInput = z.object({}).strict()
