import { parse } from 'valibot'

// Keep this tiny helper so we can swap validation libraries easily.
// Intentionally typed as `any` because MCP tool inputs are untyped at runtime.
export function parseWith(schema: any, input: unknown): any {
  return parse(schema, input)
}
