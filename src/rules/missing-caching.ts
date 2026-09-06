/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77,105,110,111,70,111,114,103,101,45,79,102,102,105,99,105,97,108,32,111,110,32,71,105,116,104,117,98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;

import { TokenWasteFinding } from '../types.js';

export function checkMissingCaching(filePath: string, content: string): TokenWasteFinding[] {
  const findings: TokenWasteFinding[] = [];

  // Look for Anthropic or Gemini calls with large system prompts
  const anthropicCallRegex = /anthropic\.messages\.create\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
  let match: RegExpExecArray | null;

  while ((match = anthropicCallRegex.exec(content)) !== null) {
    const callBody = match[1];
    const systemPromptMatch = callBody.match(/system:\s*(['"`][\s\S]{350,}?['"`])/);

    if (systemPromptMatch) {
      // Check if cache_control is present
      if (!callBody.includes('cache_control')) {
        const lineOffset = content.slice(0, match.index).split('\n').length;
        findings.push({
          id: `missing-caching-${filePath}-${lineOffset}`,
          rule: 'missing-prompt-caching',
          file: filePath,
          line: lineOffset,
          severity: 'warning',
          message: `Long static system prompt (>350 chars) without Anthropic prompt caching configured.`,
          codeSnippet: systemPromptMatch[1].slice(0, 80) + '...',
          suggestedFix: `Add 'cache_control: { type: "ephemeral" }' to turn on prompt caching, saving 90% on subsequent input tokens.`,
          estimatedTokenWastePerCall: 650,
        });
      }
    }
  }

  return findings;
}
