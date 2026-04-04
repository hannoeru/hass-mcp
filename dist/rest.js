export function joinUrl(base, path) {
    const normalized = base.endsWith('/') ? base : `${base}/`;
    return new URL(path.replace(/^\//, ''), normalized).toString();
}
//# sourceMappingURL=rest.js.map