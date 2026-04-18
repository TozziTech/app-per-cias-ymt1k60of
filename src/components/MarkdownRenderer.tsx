import React from 'react'
import { cn } from '@/lib/utils'

export function MarkdownRenderer({ content, className }: { content: string; className?: string }) {
  const createMarkup = (text: string) => {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-zinc-800 dark:text-zinc-200">$1</code>',
      )

    const lines = html.split('\n')
    let inTable = false
    let inList = false
    const out = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith('|') && line.endsWith('|')) {
        if (line.includes('---')) continue

        if (!inTable) {
          inTable = true
          out.push(
            '<div class="w-full overflow-x-auto my-3"><table class="w-full border-collapse text-sm">',
          )
        }
        const cells = line.split('|').filter((c) => c.trim() !== '')
        const isHeader = lines[i + 1] && lines[i + 1].includes('---')

        out.push('<tr class="border-b border-zinc-200 dark:border-zinc-700">')
        cells.forEach((cell) => {
          if (isHeader) {
            out.push(
              `<th class="p-2 text-left font-semibold bg-zinc-100 dark:bg-zinc-800/50">${cell.trim()}</th>`,
            )
          } else {
            out.push(`<td class="p-2">${cell.trim()}</td>`)
          }
        })
        out.push('</tr>')
        continue
      } else if (inTable) {
        inTable = false
        out.push('</table></div>')
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) {
          inList = true
          out.push('<ul class="list-disc pl-5 my-2 space-y-1">')
        }
        out.push(`<li>${line.substring(2).trim()}</li>`)
        continue
      } else if (inList) {
        inList = false
        out.push('</ul>')
      }

      if (line === '') {
        out.push('<div class="h-2"></div>')
      } else {
        out.push(`<p class="mb-1.5 leading-relaxed">${line}</p>`)
      }
    }

    if (inTable) out.push('</table></div>')
    if (inList) out.push('</ul>')

    return { __html: out.join('') }
  }

  return (
    <div
      className={cn('markdown-body break-words', className)}
      dangerouslySetInnerHTML={createMarkup(content)}
    />
  )
}
