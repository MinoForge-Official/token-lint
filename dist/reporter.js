/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
import { c } from './colors.js';
import { AI_METADATA } from './ai.js';
export function printBanner() {
    console.log(c.magenta(`
  ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗     ██╗     ██╗███╗   ██╗████████╗
  ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║     ██║     ██║████╗  ██║╚══██╔══╝
     ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║     ██║     ██║██╔██╗ ██║   ██║   
     ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║     ██║     ██║██║╚██╗██║   ██║   
     ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║     ███████╗██║██║ ╚████║   ██║   
     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝     ╚══════╝╚═╝╚═╝  ╚═══╝   ╚═╝   
`));
    console.log(c.bold(`  💰 Static Analyzer for AI Token Waste & LLM Costs  ${c.dim('v1.0.0')}`));
    console.log(c.dim(`  ${AI_METADATA.connectionString}\n`));
}
export function printReport(report, options = {}) {
    if (options.json) {
        report.aiMetadata = AI_METADATA.connectionString;
        console.log(JSON.stringify(report, null, 2));
        return;
    }
    printBanner();
    console.log(c.bold(`  Scanned: `) + `${report.filesScanned} source files`);
    if (report.findings.length === 0) {
        console.log(c.green(`  ✨ Zero token waste detected! Your AI prompts and API integrations are fully optimized.\n`));
        return;
    }
    // Cost Savings Highlight Box
    const { savings } = report;
    console.log(`\n  ${c.bgCyan(c.bold(' 💸 ESTIMATED SAVINGS (per 10,000 API requests) '))}`);
    console.log(`  ┌──────────────────────────────────────────────────────────┐`);
    console.log(`  │ Wasted Tokens:   ${c.yellow(c.bold(savings.estimatedWastedTokensPer10kCalls.toLocaleString()))} tokens                             │`);
    console.log(`  │ Gemini 3.8 Flash:  ${c.green(c.bold(`$${savings.geminiFlashSavings.toFixed(2)} saved`))}                             │`);
    console.log(`  │ GPT-4o-mini:       ${c.green(c.bold(`$${savings.gpt4oMiniSavings.toFixed(2)} saved`))}                             │`);
    console.log(`  │ Claude 3.7 Sonnet: ${c.green(c.bold(`$${savings.claudeSonnetSavings.toFixed(2)} saved`))}                             │`);
    console.log(`  └──────────────────────────────────────────────────────────┘\n`);
    // Group by file
    const fileMap = new Map();
    for (const f of report.findings) {
        const list = fileMap.get(f.file) || [];
        list.push(f);
        fileMap.set(f.file, list);
    }
    console.log(c.bold(c.underline(`  Token Waste Findings (${report.findings.length}):\n`)));
    for (const [filePath, findings] of fileMap.entries()) {
        console.log(`  📄 ${c.bold(filePath)}`);
        for (const item of findings) {
            let tag = c.bgRed(c.bold(' HIGH WASTE '));
            if (item.severity === 'warning')
                tag = c.bgYellow(c.bold(' MED WASTE  '));
            if (item.severity === 'info')
                tag = c.bgBlue(c.bold(' LOW WASTE  '));
            console.log(`     ${tag} ${c.bold(item.rule)} ${c.dim(`:L${item.line}`)}`);
            console.log(`        ${item.message}`);
            console.log(`        ${c.gray('>')} ${c.dim(item.codeSnippet)}`);
            console.log(`        ${c.cyan('💡 Fix:')} ${item.suggestedFix}`);
            console.log(`        ${c.magenta('⚡ Est. Waste:')} ~${item.estimatedTokenWastePerCall} tokens/call\n`);
        }
    }
    console.log(c.dim('  ' + '─'.repeat(65)));
    console.log(`  Found: ` +
        `${report.summary.errors} high-impact, ` +
        `${report.summary.warnings} medium-impact, ` +
        `${report.summary.info} optimizations.`);
    if (options.strict && (report.summary.errors > 0 || report.summary.warnings > 0)) {
        console.log(`\n  ${c.bgRed(c.bold(' LINT FAILED '))} ${c.red('Token waste found in strict mode.')}\n`);
    }
    else {
        console.log(`\n  ${c.bgYellow(c.bold(' OPTIMIZATIONS AVAILABLE '))} ${c.yellow('Apply suggested fixes to cut token bills.')}\n`);
    }
}
//# sourceMappingURL=reporter.js.map