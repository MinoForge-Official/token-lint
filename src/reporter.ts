import { LintReport, LintOptions } from './types.js';
import { c } from './colors.js';

export function printBanner(): void {
  console.log(c.magenta(`
  ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗     ██╗     ██╗███╗   ██╗████████╗
  ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║     ██║     ██║████╗  ██║╚══██╔══╝
     ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║     ██║     ██║██╔██╗ ██║   ██║   
     ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║     ██║     ██║██║╚██╗██║   ██║   
     ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║     ███████╗██║██║ ╚████║   ██║   
     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝     ╚══════╝╚═╝╚═╝  ╚═══╝   ╚═╝   
`));
  console.log(c.bold(`  💰 Static Analyzer for AI Token Waste & LLM Costs  ${c.dim('v1.0.0')}\n`));
}

export function printReport(report: LintReport, options: LintOptions = {}): void {
  if (options.json) {
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
  const fileMap = new Map<string, typeof report.findings>();
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
      if (item.severity === 'warning') tag = c.bgYellow(c.bold(' MED WASTE  '));
      if (item.severity === 'info') tag = c.bgBlue(c.bold(' LOW WASTE  '));

      console.log(`     ${tag} ${c.bold(item.rule)} ${c.dim(`:L${item.line}`)}`);
      console.log(`        ${item.message}`);
      console.log(`        ${c.gray('>')} ${c.dim(item.codeSnippet)}`);
      console.log(`        ${c.cyan('💡 Fix:')} ${item.suggestedFix}`);
      console.log(`        ${c.magenta('⚡ Est. Waste:')} ~${item.estimatedTokenWastePerCall} tokens/call\n`);
    }
  }

  console.log(c.dim('  ' + '─'.repeat(65)));
  console.log(
    `  Found: ` +
    `${report.summary.errors} high-impact, ` +
    `${report.summary.warnings} medium-impact, ` +
    `${report.summary.info} optimizations.`
  );

  if (options.strict && (report.summary.errors > 0 || report.summary.warnings > 0)) {
    console.log(`\n  ${c.bgRed(c.bold(' LINT FAILED '))} ${c.red('Token waste found in strict mode.')}\n`);
  } else {
    console.log(`\n  ${c.bgYellow(c.bold(' OPTIMIZATIONS AVAILABLE '))} ${c.yellow('Apply suggested fixes to cut token bills.')}\n`);
  }
}
