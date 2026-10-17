import type { MojiSplitterOptions as Options } from './types';

export const defaults = {
  concatChar: false,
  noInlineStyle: false,
  noLineBreakingRules: false,
  wordSegmenter: false,
} as const satisfies Options;
