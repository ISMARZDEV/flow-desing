# @ismarzdev/aispaceflow-core

[![npm version](https://img.shields.io/npm/v/@ismarzdev/aispaceflow-core?style=flat-square&color=indigo)](https://www.npmjs.com/package/@ismarzdev/aispaceflow-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](https://github.com/ISMARZDEV/flow-desing/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square)](https://www.typescriptlang.org/)

> Core parsers, types, and brand utilities for **[AISpaceFlow](https://aispaceflow.com)** — the open-source, white-label diagramming engine.

This package contains the framework-agnostic logic extracted from AISpaceFlow so you can use it independently in your own apps or build your own canvas on top.

---

## What's included

| Export | Description |
|--------|-------------|
| `parseMermaid(dsl)` | Parse Mermaid.js flowchart / state diagram DSL into React Flow–compatible `nodes` and `edges` |
| `parseOpenFlowDSL(dsl)` | Parse OpenFlow DSL V2 (type-safe, explicit IDs, groups, edge styling) |
| `generatePalette(primaryColor)` | Generate harmonious brand palettes from a single hex color |
| Type exports | `FlowNode`, `FlowEdge`, `NodeData`, `EdgeData`, `DesignSystem`, `NodeType`, and more |

---

## Install

```bash
npm install @ismarzdev/aispaceflow-core
```

> **Peer dependencies:** `react >=18`, `react-dom >=18`, `reactflow >=11`

---

## Usage

### Mermaid Parser

Converts Mermaid.js syntax into React Flow nodes & edges, ready to pass directly to a `<ReactFlow>` component.

```ts
import { parseMermaid } from '@ismarzdev/aispaceflow-core';

const dsl = `
flowchart TD
  A[Start] --> B{Is user logged in?}
  B -- Yes --> C[Dashboard]
  B -- No  --> D[Login Page]
`;

const { nodes, edges, direction, error } = parseMermaid(dsl);

// direction: 'TB' | 'LR' | 'RL' | 'BT'
// nodes & edges: React Flow-compatible arrays
```

**Supported Mermaid features:**
- Flowcharts (`flowchart TD / LR / RL / BT`)
- State diagrams (`stateDiagram-v2`)
- All node shapes: rectangle, rounded, diamond, capsule, circle, hexagon, cylinder, parallelogram
- Subgraphs (rendered as group nodes)
- Edge labels, arrow types (`-->`, `==>`, `-.->`, `---`)
- `linkStyle`, `classDef`, `style` directives

---

### OpenFlow DSL V2 Parser

```ts
import { parseOpenFlowDSL } from '@ismarzdev/aispaceflow-core';

const dsl = `
#id:start shape:capsule color:emerald
  User Request

#id:auth shape:diamond color:amber
  Auth Check

start --> auth | "Is authenticated?" |
`;

const { nodes, edges } = parseOpenFlowDSL(dsl);
```

---

### Brand Palette Generation

```ts
import { generatePalette } from '@ismarzdev/aispaceflow-core';

const palette = generatePalette('#6366f1'); // your primary brand color
// Returns: { primary, secondary, accent, surface, border, text, ... }
```

---

## TypeScript

Full TypeScript support with declaration files included.

```ts
import type { FlowNode, FlowEdge, NodeData, DesignSystem } from '@ismarzdev/aispaceflow-core';
```

---

## Part of AISpaceFlow

This package is the extracted core of **[AISpaceFlow](https://github.com/ISMARZDEV/flow-desing)** — a full-featured, MIT-licensed, white-label diagramming engine built on React Flow.

- 🌐 **Website**: [aispaceflow.com](https://aispaceflow.com)
- 📦 **Full app**: Self-host or fork the repo
- 🐛 **Issues**: [GitHub Issues](https://github.com/ISMARZDEV/flow-desing/issues)

---

## License

MIT © [Varun](https://github.com/ISMARZDEV)
