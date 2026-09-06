/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
export function checkUnbatchedLoops(filePath, content) {
    const findings = [];
    const lines = content.split('\n');
    // Common LLM invocation patterns
    const llmCallPatterns = [
        /openai\.(?:chat\.completions|completions)\.create/,
        /anthropic\.messages\.create/,
        /(?:ai|gemini|model)\.(?:generateContent|generate_content)/,
        /generateContentStream/,
        /chatSession\.sendMessage/,
    ];
    let inLoopScope = false;
    let loopStartLine = 0;
    let loopType = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Detect start of loops
        if (/\b(?:for\s*\(|for\s+\w+\s+in\s+|while\s*\(|\.map\s*\(\s*async|\.forEach\s*\(\s*async)/.test(line)) {
            inLoopScope = true;
            loopStartLine = i + 1;
            loopType = line.trim().slice(0, 30);
        }
        if (inLoopScope) {
            for (const pattern of llmCallPatterns) {
                if (pattern.test(line)) {
                    findings.push({
                        id: `unbatched-loop-${filePath}-${i + 1}`,
                        rule: 'unbatched-llm-loop',
                        file: filePath,
                        line: i + 1,
                        severity: 'error',
                        message: `LLM API call detected inside an iterative loop (started at line ${loopStartLine}: "${loopType}...").`,
                        codeSnippet: line.trim(),
                        suggestedFix: `Batch multiple items into a single array prompt with JSON schema output, or use official Batch API to reduce system prompt redundancy by 80%.`,
                        estimatedTokenWastePerCall: 1200,
                    });
                    break;
                }
            }
        }
        // Rough loop closing heuristic (when indent returns or closing bracket)
        if (line.trim() === '}' || line.trim() === '});') {
            // Allow exiting loop after a few lines
            if (i - loopStartLine > 15) {
                inLoopScope = false;
            }
        }
    }
    return findings;
}
//# sourceMappingURL=unbatched-loop.js.map