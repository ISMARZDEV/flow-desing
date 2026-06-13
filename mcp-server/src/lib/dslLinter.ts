/**
 * Lightweight structural linter for OpenFlow DSL. Catches the most common
 * mistakes (missing header, undeclared node references, malformed edges)
 * without pulling the full app parser into the MCP server.
 *
 * The authoritative parser lives at src/lib/openFlowDslParserV2.ts and the
 * app uses it for full structural binding. The linter here is a pre-flight
 * check so MCP clients get useful diagnostics before round-tripping through
 * the app.
 */

export interface DslDiagnostic {
  severity: 'error' | 'warning';
  message: string;
  line?: number;
  snippet?: string;
  hint?: string;
}

export interface DslLintResult {
  ok: boolean;
  diagnostics: DslDiagnostic[];
  declaredNodeIds: string[];
  edgeCount: number;
  hasHeader: boolean;
}

const VALID_NODE_TYPES = new Set([
  'start',
  'end',
  'process',
  'decision',
  'system',
  'architecture',
  'browser',
  'mobile',
  'note',
]);

const NODE_TYPE_PATTERN = /^\s*\[([a-zA-Z_][a-zA-Z0-9_]*)\]\s+([a-zA-Z_][a-zA-Z0-9_]*)(?::|\s|$)/;
const SIMPLE_NODE_PATTERN = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*$/;
const SHORT_NODE_PATTERN = /^\s*([a-zA-Z_][a-zA-Z0-9_]*):/;
// Edge arrows MUST match the authoritative parser (flowmindDSLParserV2.ts):
//   ->  default | -->  curved | ..>  dashed | ==>  thick
// Note: the dotted arrow is `..>` (with the trailing `>`), NOT `..`.
const EDGE_PATTERN = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*(==>|-->|\.\.>|->)\s*(?:\|([^|]*)\|\s*)?([a-zA-Z_][a-zA-Z0-9_]*)$/;
const EDGE_ARROW_PROBE = /(?:==>|-->|\.\.>|->)/;
// Valid group/container header: `group "Label" {`  (quotes required, NO id).
const GROUP_START_PATTERN = /^group\s+"[^"]+"\s*\{$/;
const GROUP_KEYWORD_PATTERN = /^group\b/;
// A legacy/dotted arrow without the trailing `>` is a common mistake.
const STALE_DOTTED_EDGE = /^[a-zA-Z_][a-zA-Z0-9_]*\s*\.\.(?!>)/;

function isLikelyNodeDeclarationLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return false;
  if (trimmed.startsWith('flow:') || trimmed.startsWith('direction:')) return false;
  return /^\[/.test(trimmed) || /^[a-zA-Z_][a-zA-Z0-9_]*\s*:/.test(trimmed);
}

function isLikelyEdgeLine(line: string): boolean {
  const trimmed = line.trim();
  if (/^\s*\[/.test(trimmed) || GROUP_KEYWORD_PATTERN.test(trimmed)) return false;
  return EDGE_ARROW_PROBE.test(trimmed) || STALE_DOTTED_EDGE.test(trimmed);
}

export function lintOpenFlowDsl(source: string): DslLintResult {
  const diagnostics: DslDiagnostic[] = [];
  const declaredNodeIds = new Set<string>();
  const nodeTypes = new Map<string, string>();
  const outgoingEdges = new Map<string, Array<{ label?: string; line: number }>>();
  const lines = source.split('\n');
  let edgeCount = 0;
  let groupDepth = 0;

  const hasHeader = /^\s*flow\s*:/m.test(source);
  if (!hasHeader) {
    diagnostics.push({
      severity: 'warning',
      message: 'Missing "flow: …" header.',
      hint: 'Start with `flow: <Title>` so downstream tools can name the diagram.',
    });
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return;

    if (trimmed.startsWith('direction:')) {
      const direction = trimmed.slice('direction:'.length).trim();
      if (direction !== 'TB' && direction !== 'LR') {
        diagnostics.push({
          severity: 'error',
          message: `Unsupported direction "${direction}".`,
          line: lineNumber,
          snippet: trimmed,
          hint: 'Use `direction: TB` or `direction: LR`.',
        });
      }
      return;
    }

    // Group / container blocks: `group "Label" {` ... `}` (nestable).
    if (trimmed === '}') {
      if (groupDepth > 0) {
        groupDepth -= 1;
      } else {
        diagnostics.push({
          severity: 'error',
          message: 'Unexpected "}" with no open group.',
          line: lineNumber,
          snippet: trimmed,
          hint: 'Remove the extra "}" or open a group with `group "Label" {`.',
        });
      }
      return;
    }
    if (GROUP_KEYWORD_PATTERN.test(trimmed)) {
      if (GROUP_START_PATTERN.test(trimmed)) {
        groupDepth += 1;
      } else {
        diagnostics.push({
          severity: 'error',
          message: 'Malformed group header.',
          line: lineNumber,
          snippet: trimmed,
          hint:
            'Use `group "Label" { ` — quotes are required and there is NO id ' +
            'before the label (e.g. `group rg "..." {` is invalid).',
        });
      }
      return;
    }

    if (isLikelyNodeDeclarationLine(line)) {
      const typed = trimmed.match(NODE_TYPE_PATTERN);
      const shortColon = trimmed.match(SHORT_NODE_PATTERN);
      const bare = trimmed.match(SIMPLE_NODE_PATTERN);
      const id = typed?.[2] ?? shortColon?.[1] ?? bare?.[1];
      if (id) {
        const type = typed?.[1];
        if (type) {
          if (!VALID_NODE_TYPES.has(type)) {
            diagnostics.push({
              severity: 'error',
              message: `Unsupported node type "${type}".`,
              line: lineNumber,
              snippet: trimmed,
              hint: `Use one of: ${[...VALID_NODE_TYPES].join(', ')}.`,
            });
          }
          nodeTypes.set(id, type);
        }
        if (declaredNodeIds.has(id)) {
          diagnostics.push({
            severity: 'warning',
            message: `Node id "${id}" declared more than once.`,
            line: lineNumber,
            snippet: trimmed,
            hint: 'Use a unique id per node; only one declaration carries attributes.',
          });
        }
        declaredNodeIds.add(id);
      } else if (trimmed.startsWith('[')) {
        diagnostics.push({
          severity: 'error',
          message: `Could not parse node declaration.`,
          line: lineNumber,
          snippet: trimmed,
          hint: 'Format: `[type] id: Label { attrs }`.',
        });
      }
    }
  });

  if (groupDepth > 0) {
    diagnostics.push({
      severity: 'error',
      message: `Unclosed group block (${groupDepth} missing "}").`,
      hint: 'Every `group "Label" {` needs a matching `}` on its own line.',
    });
  }

  // Second pass for edges — we need declared nodes set complete.
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return;
    if (!isLikelyEdgeLine(line)) return;

    const match = trimmed.match(EDGE_PATTERN);
    if (!match) {
      const usesStaleDotted = STALE_DOTTED_EDGE.test(trimmed);
      diagnostics.push({
        severity: usesStaleDotted ? 'error' : 'warning',
        message: usesStaleDotted
          ? 'Dotted edge must use `..>` (with the trailing ">"), not `..`.'
          : 'Edge line did not match expected pattern.',
        line: lineNumber,
        snippet: trimmed,
        hint: usesStaleDotted
          ? 'Write `source ..>|label| target`. Valid arrows: -> --> ..> ==>'
          : 'Use `source -> target` or `source ->|label| target` (arrows: -> --> ..> ==>).',
      });
      return;
    }
    edgeCount += 1;
    const [, source, , label, target] = match;
    if (source) {
      const edges = outgoingEdges.get(source) ?? [];
      edges.push({ label: label?.trim(), line: lineNumber });
      outgoingEdges.set(source, edges);
    }
    for (const id of [source, target]) {
      if (id && !declaredNodeIds.has(id)) {
        diagnostics.push({
          severity: 'warning',
          message: `Edge references undeclared node "${id}".`,
          line: lineNumber,
          snippet: trimmed,
          hint: `Declare it with \`[process] ${id}: <Label>\` (or another node type) before the edges block.`,
        });
      }
    }
  });

  for (const [id, type] of nodeTypes) {
    if (type !== 'decision') continue;
    const edges = outgoingEdges.get(id) ?? [];
    if (edges.length !== 2) {
      diagnostics.push({
        severity: 'warning',
        message: `Decision node "${id}" should have exactly two outgoing edges.`,
        hint: 'Use two labeled branches, e.g. `decision ->|Yes| next` and `decision ->|No| other`.',
      });
    }
    for (const edge of edges) {
      if (!edge.label) {
        diagnostics.push({
          severity: 'warning',
          message: `Decision node "${id}" has an unlabeled outgoing edge.`,
          line: edge.line,
          hint: 'Decision branches should use labels such as `Yes`, `No`, `Pass`, or `Fail`.',
        });
      }
    }
  }

  if (declaredNodeIds.size === 0) {
    diagnostics.push({
      severity: 'error',
      message: 'No nodes were declared.',
      hint: 'Add at least one node, e.g. `[process] start: Begin`.',
    });
  }

  const ok = !diagnostics.some((d) => d.severity === 'error');
  return {
    ok,
    diagnostics,
    declaredNodeIds: [...declaredNodeIds],
    edgeCount,
    hasHeader,
  };
}
