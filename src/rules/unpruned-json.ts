import { TokenWasteFinding } from '../types.js';

export function checkUnprunedJson(filePath: string, content: string): TokenWasteFinding[] {
  const findings: TokenWasteFinding[] = [];
  const lines = content.split('\n');

  // Regex to detect JSON.stringify or json.dumps inside template literals or prompt arguments
  const jsonRegex = /(?:JSON\.stringify|json\.dumps)\s*\(\s*([a-zA-Z0-9_$.]+)\s*\)/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;

    while ((match = jsonRegex.exec(line)) !== null) {
      const varName = match[1];

      // Check if this appears in an AI prompt context
      const isPromptContext = 
        line.includes('prompt') || 
        line.includes('message') || 
        line.includes('content') || 
        line.includes('generate') ||
        line.includes('system') ||
        line.includes('human') ||
        line.includes('`');

      if (isPromptContext) {
        findings.push({
          id: `unpruned-json-${filePath}-${i + 1}`,
          rule: 'unpruned-json-payload',
          file: filePath,
          line: i + 1,
          severity: 'warning',
          message: `Unpruned raw JSON serialization ("${match[0]}") passed into prompt context.`,
          codeSnippet: line.trim(),
          suggestedFix: `Strip null/undefined fields and whitespace before serialization, or use YAML/custom compact formatter to save 35-50% tokens: (key, value) => value ?? undefined`,
          estimatedTokenWastePerCall: 450,
        });
      }
    }
  }

  return findings;
}
