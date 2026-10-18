# Splitter

Flexible text splitting utility for CSS animations. Supports complex [line breaking rules](https://en.wikipedia.org/wiki/Line_breaking_rules_in_East_Asian_languages) (ja: 禁則処理).

## Install

```bash
npm i @y14e/splitter
```

```ts
// npm
import { createSplitter } from '@y14e/moji-splitter';

// CDNs
import { createSplitter } from 'https://esm.sh/@y14e/splitter@<x.x.x>';
// or
import { createSplitter } from 'https://cdn.jsdelivr.net/npm/@y14e/splitter@<x.x.x>/dist/index.js';
// or
import { createSplitter } from 'https://esm.unpkg.com/@y14e/splitter@<x.x.x>';
```

## 📦 APIs

```ts
const cleanup = createSplitter(root, options);
// => () => void
//
// root: HTMLElement
// options (optional): SplitterOptions
```

## 🪄 Options

```ts
interface SplitterOptions {
  concatChar: boolean;          // default: false
  noInlineStyle: boolean;       // default: false
  noLineBreakingRules: boolean; // default: false
  wordSegmenter: boolean;       // default: false
}
```

### `concatChar`

If `true`, enables concatenation at the character level.

### `noLineBreakingRules`

If `true`, disables line breaking rules.

### `wordSegmenter`

If `true`, uses `Intl.Segmenter` with the `{ granularity: 'word' }` option; useful for CJK (Chinese, Japanese, and Korean) text.

## Demo

- https://y14e.github.io/splitter/
- https://y14e.github.io/splitter/test.html
