export function checkUnboundedTokens(filePath, content) {
    const findings = [];
    // Match openai.chat.completions.create calls
    const openaiRegex = /openai\.(?:chat\.completions|completions)\.create\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
    let match;
    while ((match = openaiRegex.exec(content)) !== null) {
        const callBody = match[1];
        if (!callBody.includes('max_tokens') && !callBody.includes('max_completion_tokens')) {
            const lineOffset = content.slice(0, match.index).split('\n').length;
            findings.push({
                id: `unbounded-tokens-${filePath}-${lineOffset}`,
                rule: 'unbounded-max-tokens',
                file: filePath,
                line: lineOffset,
                severity: 'info',
                message: `OpenAI completion call lacks 'max_tokens' or 'max_completion_tokens'. Unbounded output generation risks token exhaustion.`,
                codeSnippet: `openai.chat.completions.create({ ... })`,
                suggestedFix: `Specify a reasonable 'max_tokens' limit suited for your expected response length (e.g. 500-2000).`,
                estimatedTokenWastePerCall: 300,
            });
        }
    }
    return findings;
}
//# sourceMappingURL=unbounded-tokens.js.map