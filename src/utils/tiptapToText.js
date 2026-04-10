const BLOCK_TYPES = new Set([
  'paragraph', 'heading', 'bulletList', 'orderedList',
  'listItem', 'blockquote', 'codeBlock', 'taskList', 'taskItem',
]);

function extractText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (!node.content) return '';

  const parts = node.content.map(child => extractText(child));
  return BLOCK_TYPES.has(node.type) ? parts.join('') + '\n' : parts.join('');
}

export function tiptapToText(content) {
  if (!content) return '';
  const doc = typeof content === 'string' ? JSON.parse(content) : content;
  return extractText(doc).trim();
}
