#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { scanCodebase } from './scanner.js';
import { printReport, printBanner } from './reporter.js';
import { LintOptions } from './types.js';
import { c } from './colors.js';

const HELP_TEXT = `
token-lint - Static Code Analyzer for AI Token Waste & LLM Costs

USAGE:
  token-lint [path] [options]

ARGUMENTS:
  [path]                Target directory to scan (default: current working directory)

OPTIONS:
  --strict              Strict mode: exit with code 1 if any high or medium token waste found
  --json                Output scan findings in JSON format
  --ignore <rules>      Comma-separated list of rule names to ignore
  -h, --help            Show this help message
  -v, --version         Show token-lint version

RULES MONITORED:
  • unpruned-json-payload    Flags JSON.stringify(data) in prompts without filtering null/empty fields
  • unbatched-llm-loop       Detects LLM API calls inside iterative for/while/map loops
  • missing-prompt-caching   Flags large static system prompts (>350 chars) without caching
  • unbounded-max-tokens     Warns about completion requests without max_tokens limit

EXAMPLES:
  $ npx token-lint                     # Scan current directory
  $ npx token-lint ./src               # Scan ./src folder
  $ npx token-lint --strict            # Run in CI/CD pipeline
`;

async function run(): Promise<void> {
  try {
    const { values, positionals } = parseArgs({
      options: {
        strict: { type: 'boolean', default: false },
        json: { type: 'boolean', default: false },
        ignore: { type: 'string' },
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'v', default: false },
      },
      allowPositionals: true,
    });

    if (values.help) {
      console.log(HELP_TEXT);
      process.exit(0);
    }

    if (values.version) {
      console.log('token-lint v1.0.0');
      process.exit(0);
    }

    const targetDir = positionals[0] || process.cwd();

    const options: LintOptions = {
      targetDir,
      strict: values.strict,
      json: values.json,
      ignoreRules: values.ignore ? values.ignore.split(',').map(s => s.trim()) : undefined,
    };

    const report = scanCodebase(options);
    printReport(report, options);

    if (options.strict && (report.summary.errors > 0 || report.summary.warnings > 0)) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    console.error(c.red(`\ntoken-lint fatal error: ${msg}\n`));
    process.exit(1);
  }
}

run();
