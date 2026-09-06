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