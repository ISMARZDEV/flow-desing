import { describe, expect, it } from 'vitest';
import { lintOpenFlowDsl } from '../src/lib/dslLinter.js';

describe('lintOpenFlowDsl', () => {
  it('accepts a minimal valid DSL', () => {
    const result = lintOpenFlowDsl(`flow: Hello\ndirection: TB\n[start] s1\n[end] e1\ns1 -> e1`);
    expect(result.ok).toBe(true);
    expect(result.hasHeader).toBe(true);
    expect(result.declaredNodeIds).toEqual(['s1', 'e1']);
    expect(result.edgeCount).toBe(1);
  });

  it('flags missing header as a warning, not an error', () => {
    const result = lintOpenFlowDsl(`[start] s1\n[end] e1\ns1 -> e1`);
    expect(result.ok).toBe(true);
    expect(result.diagnostics.some((d) => d.severity === 'warning' && /header/i.test(d.message))).toBe(true);
  });

  it('flags undeclared edge endpoints', () => {
    const result = lintOpenFlowDsl(`flow: T\n[start] s1\ns1 -> ghost`);
    expect(result.diagnostics.some((d) => d.message.includes('ghost'))).toBe(true);
  });

  it('flags duplicate node ids', () => {
    const result = lintOpenFlowDsl(`flow: T\n[process] a: A\n[process] a: B`);
    expect(result.diagnostics.some((d) => d.message.toLowerCase().includes('more than once'))).toBe(true);
  });

  it('returns an error when no nodes are declared', () => {
    const result = lintOpenFlowDsl(`flow: T\ndirection: TB`);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.severity === 'error')).toBe(true);
  });

  it('parses labeled decision edges', () => {
    const result = lintOpenFlowDsl(
      `flow: T\n[decision] d: Q?\n[end] yes: Yes\n[end] no: No\nd ->|Yes| yes\nd ->|No| no`
    );
    expect(result.ok).toBe(true);
    expect(result.edgeCount).toBe(2);
  });

  it('flags unsupported directions and node types as errors', () => {
    const result = lintOpenFlowDsl(`flow: T\ndirection: BT\n[unknown] a: A`);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.message.includes('Unsupported direction'))).toBe(true);
    expect(result.diagnostics.some((d) => d.message.includes('Unsupported node type'))).toBe(true);
  });

  it('warns when decision branches are missing or unlabeled', () => {
    const result = lintOpenFlowDsl(`flow: T\n[decision] d: Q?\n[end] e: End\nd -> e`);
    expect(result.ok).toBe(true);
    expect(result.diagnostics.some((d) => d.message.includes('exactly two outgoing'))).toBe(true);
    expect(result.diagnostics.some((d) => d.message.includes('unlabeled outgoing'))).toBe(true);
  });

  // --- Parity with the authoritative viewer parser (flowmindDSLParserV2.ts) ---

  it('accepts all four real edge arrows, including dotted ..>', () => {
    const result = lintOpenFlowDsl(
      `flow: T\n[process] a: A\n[process] b: B\na -> b\na --> b\na ==> b\na ..>|x| b`
    );
    expect(result.ok).toBe(true);
    expect(result.edgeCount).toBe(4);
  });

  it('rejects the stale dotted arrow `..` (must be `..>`) as an error', () => {
    const result = lintOpenFlowDsl(`flow: T\n[process] a: A\n[process] b: B\na ..|x| b`);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.severity === 'error' && /\.\.>/.test(d.hint ?? ''))).toBe(
      true
    );
  });

  it('accepts a valid group container and its nested children', () => {
    const result = lintOpenFlowDsl(
      `flow: T\ngroup "Layer" {\n[architecture] a: API { archProvider: "azure", archResourceType: "web-api-management-services" }\n}`
    );
    expect(result.ok).toBe(true);
    expect(result.declaredNodeIds).toContain('a');
  });

  it('rejects a group header that carries an id (group rg "...")', () => {
    const result = lintOpenFlowDsl(`flow: T\ngroup rg "Layer" {\n[process] a: A\n}`);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => /group header/i.test(d.message))).toBe(true);
  });

  it('flags an unclosed group block', () => {
    const result = lintOpenFlowDsl(`flow: T\ngroup "Layer" {\n[process] a: A`);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => /unclosed group/i.test(d.message))).toBe(true);
  });

  it('flags a stray closing brace', () => {
    const result = lintOpenFlowDsl(`flow: T\n[process] a: A\n}`);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => /unexpected "}"/i.test(d.message))).toBe(true);
  });
});
