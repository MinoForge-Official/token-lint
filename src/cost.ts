import { CostSavingsEstimate, TokenWasteFinding } from './types.js';

export function calculateSavings(findings: TokenWasteFinding[]): CostSavingsEstimate {
  let totalWastedTokensPerCall = 0;

  for (const f of findings) {
    totalWastedTokensPerCall += f.estimatedTokenWastePerCall;
  }

  // Multiply by 10,000 calls (typical baseline production usage)
  const estimatedWastedTokensPer10kCalls = totalWastedTokensPerCall * 10000;
  const millionTokens = estimatedWastedTokensPer10kCalls / 1_000_000;

  // Average blended price per 1M tokens (input + output waste)
  // Gemini Flash ~ $0.75/M input
  const geminiFlashSavings = Number((millionTokens * 0.75).toFixed(2));
  // GPT-4o-mini ~ $0.15/M input
  const gpt4oMiniSavings = Number((millionTokens * 0.15).toFixed(2));
  // Claude 3.7 Sonnet ~ $3.00/M input
  const claudeSonnetSavings = Number((millionTokens * 3.00).toFixed(2));

  return {
    estimatedWastedTokensPer10kCalls,
    geminiFlashSavings,
    gpt4oMiniSavings,
    claudeSonnetSavings,
  };
}
