/**
 * Tiny Markdown -> HTML renderer for article bodies.
 *
 * Intentionally small: supports headings (##/###), paragraphs, bullet lists,
 * ordered lists, blockquotes, horizontal rules, fenced code blocks, inline
 * `code`, **bold**, *italic*, and [links](url).
 *
 * Input is HTML-escaped first, so author-supplied markdown can't inject markup.
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(input: string): string {
  let out = escapeHtml(input);
  // Inline code first so its contents aren't further formatted.
  out = out.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`);
  // Links: [text](url) — only allow http(s) and relative urls.
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, text, url) => {
      const safe = /^(https?:\/\/|\/)/.test(url) ? url : '#';
      return `<a href="${safe}" rel="noopener noreferrer" target="_blank">${text}</a>`;
    }
  );
  // Bold then italic (order matters — ** must run before *).
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return out;
}

export function renderMarkdown(md: string): string {
  if (!md) return '';
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let i = 0;

  const flushList = (type: 'ul' | 'ol', items: string[]) => {
    const tag = type === 'ul' ? 'ul' : 'ol';
    html.push(`<${tag}>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</${tag}>`);
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block ```lang ... ```
    if (/^```/.test(line.trim())) {
      const block: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        block.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // skip closing fence
      html.push(`<pre><code>${block.join('\n')}</code></pre>`);
      continue;
    }

    // Horizontal rule
    if (/^\s*---+\s*$/.test(line)) {
      html.push('<hr />');
      i++;
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      html.push(`<h${level}>${renderInline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote (consecutive lines)
    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      html.push(`<blockquote>${renderInline(quote.join(' '))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      flushList('ul', items);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      flushList('ol', items);
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph — gather consecutive non-blank, non-special lines.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^```/.test(lines[i].trim()) &&
      !/^\s*---+\s*$/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    html.push(`<p>${renderInline(para.join(' '))}</p>`);
  }

  return html.join('\n');
}
