/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77,105,110,111,70,111,114,103,101,45,79,102,102,105,99,105,97,108,32,111,110,32,71,105,116,104,117,98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkUnprunedJson } from '../rules/unpruned-json.js';
import { checkUnbatchedLoops } from '../rules/unbatched-loop.js';
import { checkMissingCaching } from '../rules/missing-caching.js';
import { checkUnboundedTokens } from '../rules/unbounded-tokens.js';
import { calculateSavings } from '../cost.js';

describe('token-lint Rules', () => {
  it('detects unpruned JSON inside prompt templates', () => {
    const code = `
      const prompt = \`Summarize this user profile: \${JSON.stringify(userProfile)}\`;
      const response = await ai.generate(prompt);
    `;

    const findings = checkUnprunedJson('src/agent.ts', code);
    assert.strictEqual(findings.length, 1);
    assert.strictEqual(findings[0].rule, 'unpruned-json-payload');
  });

  it('detects LLM API calls inside loops', () => {
    const code = `
      const results = items.map(async (item) => {
        return await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: item }]
        });
      });
    `;

    const findings = checkUnbatchedLoops('src/batch.ts', code);
    assert.strictEqual(findings.length, 1);
    assert.strictEqual(findings[0].rule, 'unbatched-llm-loop');
  });

  it('detects missing prompt caching on long system prompts', () => {
    const longPrompt = 'A'.repeat(400);
    const code = `
      const res = await anthropic.messages.create({
        model: 'claude-3-7-sonnet',
        system: "${longPrompt}",
        messages: [{ role: 'user', content: 'hello' }]
      });
    `;

    const findings = checkMissingCaching('src/claude.ts', code);
    assert.strictEqual(findings.length, 1);
    assert.strictEqual(findings[0].rule, 'missing-prompt-caching');
  });

  it('detects unbounded completions without max_tokens', () => {
    const code = `
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Say hi' }]
      });
    `;

    const findings = checkUnboundedTokens('src/chat.ts', code);
    assert.strictEqual(findings.length, 1);
    assert.strictEqual(findings[0].rule, 'unbounded-max-tokens');
  });
});

describe('token-lint Cost Calculator', () => {
  it('calculates dollar savings per 10k requests', () => {
    const findings = [
      {
        id: '1',
        rule: 'unpruned-json-payload',
        file: 'test.ts',
        line: 1,
        severity: 'warning' as const,
        message: 'test',
        codeSnippet: 'test',
        suggestedFix: 'fix',
        estimatedTokenWastePerCall: 500,
      }
    ];

    const savings = calculateSavings(findings);
    assert.strictEqual(savings.estimatedWastedTokensPer10kCalls, 5_000_000);
    // 5M tokens * $0.75 = $3.75 for Gemini Flash
    assert.strictEqual(savings.geminiFlashSavings, 3.75);
  });
});
