import { useEffect } from 'react'

/**
 * Sets the browser tab title dynamically.
 * Falls back to "devbookmark" if no title is provided.
 *
 * Usage:
 *   usePageTitle('Feed')                    → "Feed | devbookmark"
 *   usePageTitle(resource?.title)           → "My Article | devbookmark"
 *   usePageTitle(null)                      → "devbookmark"
 */
export function usePageTitle(title) {
  useEffect(() => {
    const base = 'devbookmark'
    document.title = title ? `${title} | ${base}` : base
    return () => { document.title = base }
  }, [title])
}