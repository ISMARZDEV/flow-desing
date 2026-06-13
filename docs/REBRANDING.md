# Rebranding OpenFlowKit → AISpaceFlow — Notas y riesgos abiertos

> Contexto: este repo es un fork independiente de OpenFlowKit (MIT, © Varun), desvinculado
> del repo original y publicado en `ISMARZDEV/flow-desing`. Se renombró el producto, los
> paquetes (`openflowkit*` → `aispaceflow*`), el dominio y la marca visible (`OpenFlowKit`
> → `AISpaceFlow`).
>
> Quedan **dos riesgos abiertos** documentados aquí porque impactan en runtime/despliegue.

---

## 1. El dominio `aispaceflow.com` todavía no existe ni está desplegado

**Estado:** ⚠️ Decisión consciente. Se reemplazaron las 54 referencias de `openflowkit.com`
por `aispaceflow.com`, pero **ese dominio aún no está registrado ni el sitio desplegado**.
Hasta entonces, todo lo que apunte a ese host devuelve 404 / falla.

### Qué cambió y qué impacta

| Referencia | Archivo | Impacto si el dominio no está vivo |
|------------|---------|-------------------------------------|
| **Dominio custom GH Pages** | `public/CNAME` (`aispaceflow.com`) | GitHub Pages servirá el sitio en ese dominio **solo** si configurás DNS (registro `A`/`CNAME`) + lo activás en *Settings → Pages*. Sin eso, el deploy no resuelve. |
| **og:image / twitter:image** | `index.html` (`https://aispaceflow.com/readme/1.png`) | Las **social cards** (preview al compartir en X, Slack, etc.) salen rotas — la imagen 404ea. |
| **Links del MCP a la app** | `mcp-server/src/lib/viewerUrl.ts` → `DEFAULT_APP_URL = https://app.aispaceflow.com` | Los **"viewer links"** que genera el servidor MCP abren `app.aispaceflow.com/...` → 404 hasta desplegar. **Mitigable** con la env var `AISPACEFLOW_APP_URL` (ej. `http://localhost:5173` en dev). |
| **JSON Schema `$id`** | `public/schema/openflow-dsl-v2.json` (`$id: https://aispaceflow.com/schema/...`) | El `$id` es identificador, no se fetchea normalmente; bajo riesgo. Pero si algún validador resuelve el `$id` por red, 404ea. |
| **CSP — signaling WebRTC** | `nginx/nginx.conf`, `_headers` (`connect-src ... wss://*.aispaceflow.com`) | La **colaboración en tiempo real** (Yjs + y-webrtc) solo puede abrir el socket de signaling si su host matchea el `connect-src`. Si el signaling server corre en un dominio que **no** es `*.aispaceflow.com`, el navegador **bloquea la conexión por CSP** y la colaboración no levanta. (Sigue habiendo `wss://signaling.yjs.dev` como fallback público.) |
| **Subdominios `app.` / `docs.`** | README, docs, landing | Botones "Launch App" / "Docs" rotos hasta desplegar `app.aispaceflow.com` y `docs.aispaceflow.com`. |

### Cómo resolverlo (checklist de despliegue)

1. **Registrar** `aispaceflow.com` y configurar DNS hacia tu hosting (GitHub Pages / Cloudflare).
2. **GitHub Pages**: *Settings → Pages → Custom domain* = `aispaceflow.com` (el `CNAME` ya está).
3. **Subdominios**: apuntar `app.` (la SPA) y `docs.` (Astro/Starlight) a sus deploys.
4. **MCP en dev**: exportar `AISPACEFLOW_APP_URL=http://localhost:5173` para no depender del dominio.
5. **Signaling**: desplegar el `signaling-server/` bajo `*.aispaceflow.com`, **o** ajustar el
   `connect-src` de la CSP (`nginx/nginx.conf` + `_headers`) al host real del signaling.
6. **Assets**: confirmar que `/readme/1.png`, `/og-diagram.png`, `/schema/*` se sirven en el dominio.

**Severidad:** Media. No rompe el build ni los tests (son URLs de runtime/despliegue), pero
degrada social cards, links del MCP y colaboración hasta completar el deploy.

---

## 2. "OpenFlow DSL" NO se renombró (sigue siendo "OpenFlow", sin "kit")

**Estado:** 🟡 Decisión deliberada — pendiente de definir. El rebranding tocó el token
`openflowkit`. El **lenguaje diagram-as-code** del producto se llama **"OpenFlow DSL"**
(token `openflow`, sin `kit`), así que quedó **intacto** a propósito.

### Por qué se dejó fuera

"OpenFlow DSL" no es texto de marca: es el **nombre de un formato/serialización con contrato
versionado** (`openflow-dsl-v2`). Renombrarlo es un cambio **breaking de identidad de formato**
(rompe el `$id` del schema, la etiqueta del export, rutas y los identificadores de código),
distinto de cambiar la marca del producto. Debe ser una migración aparte y consciente.

### Superficie de código si se decide renombrar (ej. → "AISpaceFlow DSL")

| Tipo | Ubicación |
|------|-----------|
| **Schema versionado** | `public/schema/openflow-dsl-v2.json` (archivo + `$id`) |
| **Parsers / exporters** | `src/lib/openFlowDslParserV2.ts`, `src/lib/openFlowDSLParser.ts`, `src/services/openFlowDSLExporter.ts`, `src/services/openFlowDSLParser.ts` (+ sus `*.test.ts`) |
| **Identificadores de ruta** | `src/app/routeState.ts`: `initialOpenFlowDsl`, `createFlowEditorOpenFlowDslRouteState`, `getInitialFlowEditorOpenFlowDsl` |
| **Menú de export** | `src/components/useExportMenu.ts`: `onExportOpenFlowDSL`, `onDownloadOpenFlowDSL`, key `openflow:` |
| **Docs + ruta pública** | `docs-site/src/content/docs/openflow-dsl.md` (+ `tr/`), ruta `/openflow-dsl/` |

### Inconsistencia actual (consciente)

El producto es **AISpaceFlow** pero su formato nativo sigue exportándose/documentándose como
**"OpenFlow DSL"**. Es aceptable a corto plazo (muchos productos tienen un formato con nombre
propio), pero hay que **decidir explícitamente**:

- **(a) Dejarlo** como "OpenFlow DSL" — sin trabajo, formato estable, leve inconsistencia de marca.
- **(b) Renombrarlo** → bumpear schema (`v2` → `v3` o nuevo `$id`), migrar identificadores y
  mantener **retrocompatibilidad de parseo** para no romper diagramas guardados con el formato viejo.

**Severidad:** Baja (cosmética/semántica). No afecta build ni runtime; es deuda de naming a resolver.

---

_Última actualización: rebranding inicial. Ambos puntos quedan abiertos para una decisión/deploy posterior._
