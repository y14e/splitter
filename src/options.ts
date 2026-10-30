import type { SplitterOptions as Options } from './types';

export function resolveOptions(options: Partial<Options>): Options {
  let {
    concatChar = false,
    noInlineStyle = false,
    noLineBreakingRules = false,
    wordSegmenter = false,
  } = options;

  if (typeof concatChar !== 'boolean') {
    console.warn(`Invalid concatChar option. Fallback: false.`);
    concatChar = false;
  }

  if (typeof noInlineStyle !== 'boolean') {
    console.warn(`Invalid noInlineStyle option. Fallback: false.`);
    noInlineStyle = false;
  }

  if (typeof noLineBreakingRules !== 'boolean') {
    console.warn(`Invalid noLineBreakingRules option. Fallback: false.`);
    noLineBreakingRules = false;
  }

  if (typeof wordSegmenter !== 'boolean') {
    console.warn(`Invalid wordSegmenter option. Fallback: false.`);
    wordSegmenter = false;
  }

  return { concatChar, noInlineStyle, noLineBreakingRules, wordSegmenter };
}
