export interface SplitterOptions {
  concatChar: boolean;
  noInlineStyle: boolean;
  noLineBreakingRules: boolean;
  wordSegmenter: boolean;
}

export type Granularity = 'word' | 'char';
