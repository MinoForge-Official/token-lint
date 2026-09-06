export type Severity = 'error' | 'warning' | 'info';

export interface TokenWasteFinding {
  id: string;
  rule: string;
  file: string;
  line: number;
  column?: number;
  severity: Severity;
  message: string;
  codeSnippet: string;
  suggestedFix: string;
  estimatedTokenWastePerCall: number;
}

export interface CostSavingsEstimate {
  estimatedWastedTokensPer10kCalls: number;
  geminiFlashSavings: number; // in USD
  gpt4oMiniSavings: number;
  claudeSonnetSavings: number;
}

export interface LintOptions {
  cwd?: string;
  targetDir?: string;
  strict?: boolean;
  json?: boolean;
  provider?: 'gemini' | 'openai' | 'anthropic' | 'all';
  ignoreRules?: string[];
}

export interface LintReport {
  timestamp: string;
  filesScanned: number;
  findings: TokenWasteFinding[];
  savings: CostSavingsEstimate;
  status: 'clean' | 'waste-detected';
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}
