export function joinUrl(base: string, path: string) {
  const normalized = base.endsWith('/') ? base : `${base}/`
  return new URL(path.replace(/^\//, ''), normalized).toString()
}
