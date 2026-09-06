/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
export function checkUnprunedJson(filePath, content) {
    const findings = [];
    const lines = content.split('\n');
    // Regex to detect JSON.stringify or json.dumps inside template literals or prompt arguments
    const jsonRegex = /(?:JSON\.stringify|json\.dumps)\s*\(\s*([a-zA-Z0-9_$.]+)\s*\)/g;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let match;
        while ((match = jsonRegex.exec(line)) !== null) {
            const varName = match[1];
            // Check if this appears in an AI prompt context
            const isPromptContext = line.includes('prompt') ||
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
//# sourceMappingURL=unpruned-json.js.map