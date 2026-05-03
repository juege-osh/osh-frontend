import MarkdownIt from 'markdown-it'

export type CourseDocFormat = 'rich' | 'markdown' | 'html'

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

const DOC_PREFIX = {
  markdown: '<!--OSH_DOC_FORMAT:MARKDOWN-->',
  html: '<!--OSH_DOC_FORMAT:HTML-->',
} as const

function stripPrefix(raw = '') {
  if (raw.startsWith(DOC_PREFIX.markdown)) {
    return {
      format: 'markdown' as CourseDocFormat,
      content: raw.slice(DOC_PREFIX.markdown.length).trimStart(),
    }
  }

  if (raw.startsWith(DOC_PREFIX.html)) {
    return {
      format: 'html' as CourseDocFormat,
      content: raw.slice(DOC_PREFIX.html.length).trimStart(),
    }
  }

  return {
    format: detectLegacyFormat(raw),
    content: raw,
  }
}

function detectLegacyFormat(raw = ''): CourseDocFormat {
  const content = raw.trim()
  if (!content) return 'rich'

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content)
  if (looksLikeHtml) return 'rich'

  const looksLikeMarkdown =
    /^#{1,6}\s+/m.test(content) ||
    /```[\s\S]*```/m.test(content) ||
    /^\s*[-*+]\s+/m.test(content) ||
    /^\s*\d+\.\s+/m.test(content) ||
    /^\s*>\s+/m.test(content) ||
    /\[[^\]]+\]\([^)]+\)/.test(content)

  return looksLikeMarkdown ? 'markdown' : 'rich'
}

export function parseCourseDoc(raw = '') {
  return stripPrefix(raw || '')
}

export function renderCourseDoc(raw = '') {
  const parsed = stripPrefix(raw || '')
  if (!parsed.content) return ''

  if (parsed.format === 'markdown') {
    // 展示层统一转成 HTML，后端继续保存原始 Markdown 文本。
    return md.render(parsed.content)
  }

  return parsed.content
}

export function serializeCourseDoc(content = '', format: CourseDocFormat = 'rich') {
  const value = content || ''

  if (!value.trim()) return ''

  if (format === 'markdown') {
    return `${DOC_PREFIX.markdown}\n${value}`
  }

  if (format === 'html') {
    return `${DOC_PREFIX.html}\n${value}`
  }

  return value
}

export function htmlToMarkdown(html = '') {
  const source = (html || '').trim()
  if (!source) return ''

  // 这里保持轻量转换，重点是让富文本和 Markdown 之间切换时尽量不丢结构。
  let text = source
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
    .replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '<u>$1</u>')
    .replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '~~$1~~')
    .replace(/<strike[^>]*>([\s\S]*?)<\/strike>/gi, '~~$1~~')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) =>
      `\n${String(inner).replace(/<br\s*\/?>/gi, '\n').split('\n').map((line: string) => `> ${line.replace(/<[^>]+>/g, '').trim()}`).join('\n')}\n`
    )
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, '![]($1)')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n')
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    .replace(/<\/?(ul|ol|table|thead|tbody|tr|td|th|div|span|section|article)[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

  text = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()

  return text
}
