/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77,105,110,111,70,111,114,103,101,45,79,102,102,105,99,105,97,108,32,111,110,32,71,105,116,104,117,98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;

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
