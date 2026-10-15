import type { MojiSplitterOptions as Options } from '@/types';

export function resolveOptions(
  defaults: Options,
  source: Partial<Options>,
): Options {
  const merged = { ...defaults, ...source };

  if (typeof merged.concatChar !== 'boolean') {
    const concatChar = defaults.concatChar;
    console.warn(`Invalid concatChar option. Fallback: ${concatChar}.`);
    merged.concatChar = concatChar;
  }

  if (typeof merged.noInlineStyle !== 'boolean') {
    const noInlineStyle = defaults.noInlineStyle;
    console.warn(`Invalid noInlineStyle option. Fallback: ${noInlineStyle}.`);
    merged.noInlineStyle = noInlineStyle;
  }

  if (typeof merged.noLineBreakingRules !== 'boolean') {
    const noLineBreakingRules = defaults.noLineBreakingRules;
    console.warn(
      `Invalid noLineBreakingRules option. Fallback: ${noLineBreakingRules}.`,
    );
    merged.noLineBreakingRules = noLineBreakingRules;
  }

  if (typeof merged.wordSegmenter !== 'boolean') {
    const wordSegmenter = defaults.wordSegmenter;
    console.warn(`Invalid wordSegmenter option. Fallback: ${wordSegmenter}.`);
    merged.wordSegmenter = wordSegmenter;
  }

  return merged;
}
