# Pendientes — Rebrand AISpaceFlow + Theming

> Punch list de lo que quedó por corregir tras el rebranding (OpenFlowKit → AISpaceFlow),
> el cambio de paquetes y el nuevo theming (Light Mint / Dark Ocean).
> Para los riesgos de dominio y del lenguaje "OpenFlow DSL", ver [`REBRANDING.md`](./REBRANDING.md).

Prioridad: 🔴 importante · 🟡 medio · 🟢 cuando haya diseño/decisión · ⚪ proceso

---

## 🔴 1. El logo sigue siendo el de OpenFlowKit

**Qué:** El logo visible (sidebar + favicon) sigue mostrando **el arte original de OpenFlowKit**.
Se renombraron los archivos, pero el dibujo SVG interno no cambió.

**Dónde:**
- `src/components/icons/OpenFlowLogo.tsx` → renderiza `/favicon.svg`
- `public/favicon.svg`, `public/Logo_aispaceflow.svg`, `web/public/Logo_aispaceflow.svg`,
  `docs-site/src/assets/Logo_aispaceflow.svg` → todos contienen el mark viejo

**Impacto:** La identidad visual sigue siendo la del proyecto original aunque el texto diga
"AISpaceFlow". Gap #1 de un rebrand real.

**Acción:** Diseñar un logo nuevo de AISpaceFlow (decisión de diseño, no automatizable) y
reemplazar los `.svg`. El componente `OpenFlowLogo` también podría renombrarse a `AppLogo`/`AISpaceFlowLogo`.

---

## 🔴 2. Bug: dos fuentes distintas para el logo

**Qué:** Inconsistencia de origen del logo.

**Dónde:**
- `src/components/icons/OpenFlowLogo.tsx` → `const LOGO_SRC = '/favicon.svg'`
- `src/lib/brand.ts` → `export const FAVICON_URL = '/Logo_aispaceflow.svg'`

**Impacto:** Si se actualiza el logo en un archivo y no en el otro, sidebar y favicon
divergen. Deben apuntar al mismo asset.

**Acción:** Unificar — que `OpenFlowLogo` use `FAVICON_URL` de `brand.ts` (single source of truth).
Es un fix rápido.

---

## 🟡 3. Jerarquía de color en tema LIGHT

**Qué:** Tras edits manuales, en **light** la pantalla y el módulo activo quedaron blancos.

**Estado actual (light Mint, `src/index.css` `:root`):**
| Token | Valor | Nivel |
|-------|-------|-------|
| `--brand-surface` (cards) | `#f8fbfa` | — |
| `--brand-background` (pantalla) | `#ffffff` | más claro |
| `--brand-sidebar` | `#e5f0ec` | más oscuro |
| `--brand-sidebar-active` (módulo) | `#ffffff` | más claro |

**Impacto:** La jerarquía "pantalla > sidebar > módulo, cada uno más oscuro" **solo se cumple
en dark (Ocean)**. En light el módulo activo es blanco (lo más claro), no lo más oscuro.

**Acción:** Decidir si es intencional (en light suele usarse blanco = "elevado/seleccionado").
Si se quiere replicar la jerarquía descendente del dark, oscurecer `--brand-sidebar-active`
y `--brand-background` en light.

---

## 🟡 4. Theming sin aplicar fuera de la app principal

**Qué:** El nuevo theming (Mint/Ocean) solo se aplicó a la app principal (`src/index.css`).

**Dónde sigue con colores viejos:**
- `web/` (landing) → `web/src/styles/global.css`, `web/public/styles/global.css`
- `docs-site/` (documentación) → `docs-site/src/styles/custom.css`

**Impacto:** Landing y docs no coinciden visualmente con la app.

**Acción:** Portar las paletas Mint/Ocean a esos CSS (tienen otra arquitectura de tokens).

---

## 🟡 5. Paneles del editor Studio sin la jerarquía del sidebar

**Qué:** La jerarquía de oscuridad (sidebar/módulo) se aplicó al home/dashboard, no al editor.

**Dónde:** `src/components/PropertiesPanel.tsx`, `src/components/StudioPanel.tsx`

**Impacto:** Dentro del editor de diagramas los paneles no siguen el mismo apilado de fondos.

**Acción:** Aplicar `--brand-sidebar` / `--brand-sidebar-active` (o equivalente) si se quiere
consistencia con el home.

---

## 🟢 6. Riesgos documentados aparte

Ver [`REBRANDING.md`](./REBRANDING.md):
- **Dominio `aispaceflow.com`** no registrado/desplegado → og-images, schema y links rotos.
- **"OpenFlow DSL"** (el lenguaje) no renombrado → decisión semántica con schema versionado.

---

## ⚪ 7. Todo el trabajo está sin commitear

**Qué:** El rebrand (200+ archivos), el rename de paquetes y el theming están en el working
tree, sin ningún commit en `ISMARZDEV/flow-desing`.

**Impacto:** No hay checkpoint — si algo se rompe, no hay punto de retorno.

**Acción:** Commitear en bloques limpios, ej.:
- `chore: rename packages openflowkit → aispaceflow`
- `chore: rebrand OpenFlowKit → AISpaceFlow (brand, domain, assets)`
- `feat(theme): Light Mint + Dark Ocean palettes + sidebar hierarchy`

---

_Generado tras la sesión de rebrand + theming. Actualizar a medida que se cierren ítems._
