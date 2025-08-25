import React from 'react'
import ReactDOM from 'react-dom/client'
import Projects from './integrations/projects.jsx'

function tryRender(container) {
  const tiles = Array.from(container.querySelectorAll('.project-tile'))
  const items = tiles.map((tile) => {
    const img = tile.querySelector('img')
    return {
      title: tile.getAttribute('data-title') || '',
      link: tile.getAttribute('data-link') || '',
      siteLink: tile.getAttribute('data-site-link') || '',
      description: tile.getAttribute('data-description') || '',
      overlay: tile.querySelector('.text-overlay')?.textContent?.trim() || '',
      image: img?.getAttribute('src') || '',
      alt: img?.getAttribute('alt') || '',
    }
  })

  if (items.length === 0) return false

  const snapshot = container.innerHTML
  try {
    container.innerHTML = ''
    ReactDOM.createRoot(container).render(<Projects items={items} />)
    console.log('[react] Projects mounted:', items.length)
    return true
  } catch (err) {
    console.error('[react] Projects render failed; restoring DOM:', err)
    container.innerHTML = snapshot
    return false
  }
}

function mountReactProjects() {
  const container = document.querySelector('.projects-container')
  if (!container) return

  if (tryRender(container)) return

  const mo = new MutationObserver(() => {
    if (tryRender(container)) mo.disconnect()
  })
  mo.observe(container, { childList: true, subtree: true })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountReactProjects, { once: true })
} else {
  mountReactProjects()
}
