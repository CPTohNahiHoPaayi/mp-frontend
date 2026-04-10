/**
 * Post-process AI "enhance" HTML so TipTap can render it without raw LaTeX/markdown artifacts.
 * TipTap StarterKit does not parse $...$ or $$...$$; those show as ugly plain text.
 */

const DISPLAY_MATH = /\$\$[\s\S]*?\$\$/g;
const INLINE_MATH_DOLLAR = /\$([^$\n]+)\$/g;
const LATEX_BEGIN_END = /\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\}/g;
const CODE_FENCE = /^```(?:html)?\s*/i;
const CODE_FENCE_END = /\s*```$/;

/**
 * @param {string} raw
 * @returns {string}
 */
export function sanitizeEnhancedNoteHtml(raw) {
  if (raw == null || typeof raw !== 'string') return '';
  let s = raw.trim();

  s = s.replace(CODE_FENCE, '').replace(CODE_FENCE_END, '').trim();

  // Large LaTeX blocks (arrays, align, etc.)
  s = s.replace(LATEX_BEGIN_END, () => {
    return '<p class="note-enhance-fallback"><em>Complex formula block omitted — use plain text or Unicode (e.g. φ(n)) in notes.</em></p>';
  });

  s = s.replace(DISPLAY_MATH, () => {
    return '<blockquote class="note-enhance-fallback"><p><em>Display math was simplified for the editor. Describe the idea in words or Unicode symbols.</em></p></blockquote>';
  });

  s = s.replace(INLINE_MATH_DOLLAR, (_, inner) => {
    const text = String(inner).trim().replace(/\\/g, '').slice(0, 120);
    return `<code class="note-inline-math-fallback">${escapeHtml(text)}</code>`;
  });

  return s;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
