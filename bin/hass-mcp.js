#!/usr/bin/env node

// Wrapper so the package works when executed via `npx hass-mcp`.
// dist/ output is ESM and does not include a shebang.

import '../dist/index.js'
