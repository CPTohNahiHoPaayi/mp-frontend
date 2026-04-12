import katex from 'katex';

/**
 * Render a string that may contain LaTeX math into HTML.
 * Inline: \(...\) or $...$
 * Display: \[...\] or $$...$$
 * Also handles (\displaystyle ...) pattern.
 */
export function renderMathInText(text) {
  if (!text) return text;

  // Normalize delimiters
  let processed = text
    .replace(/\\\((.+?)\\\)/g, (_, m) => `$${m}$`)
    .replace(/\\\[(.+?)\\\]/gs, (_, m) => `$$${m}$$`)
    .replace(/\(\\displaystyle\s+(.+?)\)/g, (_, m) => `$$${m}$$`);

  // Render display math $$...$$
  processed = processed.replace(/\$\$(.+?)\$\$/gs, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return math;
    }
  });

  // Render inline math $...$  (but not $$)
  processed = processed.replace(/\$(.+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  });

  return processed;
}
