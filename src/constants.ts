export const NOBR_RE =
  /[[[\P{scx=Han}]&&[\P{scx=Hang}]&&[\P{scx=Hira}]&&[\P{scx=Kana}]&&[\p{L}]]!-,.->@\[-`\{-~\u00A0]+/gv;

export const LBR_PROHIBIT_START_RE =
  /^[[[\p{Pd}]--[―]]\p{Pe}\p{Pf}\p{Po}\u00A0々〵〻ぁぃぅぇぉっゃゅょゎゕゖ゛-ゞァィゥェォッャュョヮヵヶー-ヾㇰ-ㇿ]|\p{Pi}/v;

export const LBR_PROHIBIT_END_RE = /[\p{Pf}\p{Pi}\p{Ps}\p{Sc}\u00A0]$/u;

export const LBR_INSEPARATABLE_RE = /[―‥…]/u;

export const VISUALLY_HIDDEN_CSS =
  'border: 0; clip: rect(0, 0, 0, 0); height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; user-select: none; white-space: nowrap; width: 1px;';
