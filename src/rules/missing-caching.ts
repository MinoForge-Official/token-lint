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
