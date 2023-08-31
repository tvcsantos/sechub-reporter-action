export function noBreak(s: string): string {
  return s.replace(/-/g, '&#8209;').replace(/ /g, '&nbsp;')
}

export function pre(text: string): string {
  return `<pre>${text}</pre>`
}
