import {
  LBR_INSEPARATABLE_RE,
  LBR_PROHIBIT_END_RE,
  LBR_PROHIBIT_START_RE,
  NOBR_RE,
  VISUALLY_HIDDEN_CSS,
} from '@/constants';
import { defaults } from '@/defaults';
import { resolveOptions } from '@/options';
import type { Granularity, MojiSplitterOptions as Options } from '@/types';

export function createMojiSplitter(
  root: HTMLElement,
  options: Partial<Options> = {},
): () => void {
  if (!(root instanceof HTMLElement)) {
    console.warn('Invalid root element');
    return () => {};
  }

  const mojiSplitter = new MojiSplitter(root, options);
  return () => mojiSplitter.destroy();
}

class MojiSplitter {
  #rootElement: HTMLElement;
  #settings: Options;
  #wordElements: HTMLElement[] = [];
  #charElements: HTMLElement[] = [];
  #original: string | null;
  #fragment: DocumentFragment | null = null;
  #segmenter: Intl.Segmenter | null = new Intl.Segmenter();
  #isDestroyed = false;

  constructor(root: HTMLElement, options: Partial<Options> = {}) {
    this.#rootElement = root;
    this.#settings = resolveOptions(defaults, options);
    this.#original = this.#rootElement.innerHTML;
    this.#initialize();
  }

  destroy(): void {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;
    this.#rootElement.removeAttribute('data-moji-splitter-initialized');
    this.#rootElement.innerHTML = this.#original ?? '';
    const style = this.#rootElement.style;
    style.removeProperty('--word-count');
    style.removeProperty('--char-count');
    this.#cleanup();
    this.#original = null;
  }

  #initialize(): void {
    const children = this.#rootElement.childNodes;
    this.#fragment = new DocumentFragment();

    for (const child of children) {
      this.#fragment.appendChild(child.cloneNode(true));
    }

    this.#applyNonBreakingRules();
    this.#split('word');
    const { concatChar, noInlineStyle, noLineBreakingRules } = this.#settings;
    !concatChar && !noLineBreakingRules && this.#applyLineBreakingRules('word');
    this.#split('char');
    concatChar && !noLineBreakingRules && this.#applyLineBreakingRules('char');

    this.#charElements.forEach((char, i) => {
      char.setAttribute('aria-hidden', 'true');
      char.style.setProperty('--char-index', String(i));
    });

    if (!noInlineStyle) {
      const spans = this.#fragment.querySelectorAll<HTMLElement>(
        ':is([data-word], [data-char]):not([data-whitespace])',
      );

      for (const span of spans) {
        const { style } = span;
        style.setProperty('display', 'inline-block');
        [...(this.#segmenter ?? new Intl.Segmenter()).segment(span.textContent)]
          .length && style.setProperty('white-space', 'nowrap');
      }
    }

    this.#wordElements.forEach((word, i) => {
      word.translate = false;
      word.style.setProperty('--word-index', String(i));

      if (!word.hasAttribute('data-whitespace')) {
        const alt = document.createElement('span');
        alt.setAttribute('data-alt', '');

        if (!this.#settings.noInlineStyle) {
          alt.style.cssText += VISUALLY_HIDDEN_CSS;
        }

        alt.textContent = word.textContent;
        word.append(alt);
      }
    });

    this.#rootElement.replaceChildren(...this.#fragment.childNodes);
    const { style } = this.#rootElement;
    style.setProperty('--word-count', String(this.#wordElements.length));
    style.setProperty('--char-count', String(this.#charElements.length));
    const whitespaces = this.#rootElement.querySelectorAll<HTMLElement>(
      ':scope > :not([data-word]) [data-char][data-whitespace]',
    );

    for (const whitespace of whitespaces) {
      if (
        window.getComputedStyle(whitespace).getPropertyValue('display') !==
        'inline'
      ) {
        whitespace.innerHTML = '&nbsp;';
      }
    }

    this.#cleanup();
    this.#rootElement.setAttribute('data-moji-splitter-initialized', '');
  }

  #applyNonBreakingRules(
    node: Node = this.#fragment ?? new DocumentFragment(),
  ): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;

      if (!text || !NOBR_RE.test(text)) {
        return;
      }

      NOBR_RE.lastIndex = 0;
      let lastIndex = 0;
      const fragment = document.createDocumentFragment();

      for (const match of text.matchAll(NOBR_RE)) {
        const index = match.index;
        index > lastIndex && fragment.append(text.slice(lastIndex, index));
        const span = document.createElement('span');
        span.setAttribute('data-_nobr', '');
        const matched = match[0];
        span.textContent = matched;
        fragment.append(span);
        lastIndex = index + matched.length;
      }

      lastIndex < text.length && fragment.append(text.slice(lastIndex));

      if (!(node instanceof Text)) {
        return;
      }

      node.replaceWith(fragment);
      return;
    }

    let child = node.firstChild;

    while (child) {
      const next = child.nextSibling;
      this.#applyNonBreakingRules(child);
      child = next;
    }
  }

  #split(
    granularity: Granularity,
    node: Node = this.#fragment ?? new DocumentFragment(),
  ): void {
    let child = node.firstChild;
    const items =
      granularity === 'word' ? this.#wordElements : this.#charElements;

    while (child) {
      const next = child.nextSibling;

      if (child.nodeType === Node.TEXT_NODE) {
        const segmenter = this.#getSegmenter(granularity, child.parentNode);

        if (!segmenter) {
          return;
        }

        const fragment = document.createDocumentFragment();

        for (const segment of segmenter.segment(
          (child.textContent ?? '')
            .replace(/[\r\n\t]/g, '')
            .replace(/\s{2,}/g, ' '),
        )) {
          const span = document.createElement('span');
          const text = segment.segment;
          span.textContent = text;
          text.charCodeAt(0) === 32 && span.setAttribute('data-whitespace', '');
          span.setAttribute(`data-${granularity}`, text);
          items.push(span);
          fragment.append(span);
        }

        child.replaceWith(fragment);
      } else if (
        granularity === 'word' &&
        child instanceof HTMLElement &&
        child.hasAttribute('data-_nobr')
      ) {
        child.removeAttribute('data-_nobr');
        const text = child.textContent ?? '';
        child.setAttribute('data-word', text);
        items.push(child);
      } else if (child.hasChildNodes()) {
        this.#split(granularity, child);
      }

      child = next;
    }
  }

  #applyLineBreakingRules(granularity: Granularity): void {
    let count = 0;
    const items =
      granularity === 'word' ? this.#wordElements : this.#charElements;
    let previous = null;

    while (count < items.length) {
      const item = items[count];

      if (!item) {
        count++;
        continue;
      }

      let text = item.textContent ?? '';

      if (previous?.textContent?.trim() && LBR_PROHIBIT_START_RE.test(text)) {
        text = (previous.textContent ?? '') + text;
        previous.textContent = text;
        previous.setAttribute(`data-${granularity}`, text);
        item.remove();
        items.splice(count, 1);
        continue;
      }

      previous = item;
      count++;
    }

    function concat(index: number, re: RegExp): void {
      const item = items[index];

      if (!item) {
        return;
      }

      const offset = index + 1;
      let text = item.textContent ?? '';

      while (offset < items.length) {
        const next = items[offset];

        if (!next) {
          break;
        }

        const nextText = next.textContent ?? '';

        if (!re.test(nextText)) {
          break;
        }

        text += nextText;
        next.remove();
        items.splice(offset, 1);
      }

      item.textContent = text;
      item.setAttribute(`data-${granularity}`, text);
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const text = item?.textContent ?? '';

      if (LBR_PROHIBIT_END_RE.test(text)) {
        concat(i, LBR_PROHIBIT_END_RE);
        const next = items[i + 1];

        if (next?.textContent?.trim()) {
          const text = (items[i]?.textContent ?? '') + next.textContent;
          next.textContent = text;
          next.setAttribute(`data-${granularity}`, text);
          items[i]?.remove();
          items.splice(i, 1);
          i--;
        }

        continue;
      }

      LBR_INSEPARATABLE_RE.test(text) && concat(i, LBR_INSEPARATABLE_RE);
    }

    if (granularity === 'char') {
      for (const span of (
        this.#fragment ?? new DocumentFragment()
      ).querySelectorAll<HTMLElement>('[data-word]:not([data-whitespace])')) {
        const text = span.textContent;
        text ? span.setAttribute('data-word', text) : span.remove();
      }
    }
  }

  #cleanup(): void {
    this.#wordElements.length = 0;
    this.#charElements.length = 0;
    this.#fragment = null;
    this.#segmenter = null;
  }

  #getSegmenter(
    granularity: Granularity,
    parent: Node | null,
  ): Intl.Segmenter | null {
    if (granularity === 'word' && this.#settings.wordSegmenter) {
      const root =
        parent?.nodeType === Node.ELEMENT_NODE ? parent : this.#rootElement;

      if (!(root instanceof HTMLElement)) {
        return this.#segmenter;
      }

      const closest: HTMLElement | null = root.closest('[lang]');

      return new Intl.Segmenter(
        closest?.lang || document.documentElement.lang || 'en',
        {
          granularity: 'word',
        },
      );
    } else {
      return this.#segmenter;
    }
  }
}

export type { Options as MojiSplitterOptions };
