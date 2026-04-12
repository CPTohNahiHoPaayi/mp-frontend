const BLOCK_TYPES = new Set([
  'paragraph', 'heading', 'bulletList', 'orderedList',
  'listItem', 'blockquote', 'codeBlock', 'taskList', 'taskItem',
  'table', 'tableRow', 'tableCell', 'tableHeader',
]);

function extractText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (node.type === 'hardBreak') return '\n';
  if (!node.content) return '';

  const parts = node.content.map(child => extractText(child));
  if (node.type === 'tableCell' || node.type === 'tableHeader') {
    return parts.join('') + '\t';
  }
  return BLOCK_TYPES.has(node.type) ? parts.join('') + '\n' : parts.join('');
}

export function tiptapToText(content) {
  if (!content) return '';
  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    return extractText(doc).trim();
  } catch {
    return typeof content === 'string' ? content.trim() : '';
  }
}
