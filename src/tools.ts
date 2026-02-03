import { minLength, object, optional, pipe, record, string, unknown } from 'valibot'

export const GetStateInput = object({
  entity_id: pipe(string(), minLength(1)),
})

export const CallServiceInput = object({
  domain: pipe(string(), minLength(1)),
  service: pipe(string(), minLength(1)),
  data: optional(record(string(), unknown()), {}),
})

export const ListStatesInput = object({})
