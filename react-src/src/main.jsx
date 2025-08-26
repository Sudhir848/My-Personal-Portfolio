import ReactDOM from 'react-dom/client'
import Projects from './integrations/Projects.jsx'
import Contact from './integrations/Contact.jsx'
import SocialLinks from './integrations/SocialLinks.jsx'

const onReady = (fn) =>
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn()

/* ------------ attach modal/click handlers to (re)rendered tiles ------------ */
function attachProjectTileListeners(root = document) {
  const modal = document.getElementById('myModal')
  const modalImg = document.getElementById('img01')
  const modalTitle = document.getElementById('modalTitle')
  const modalDescription = document.getElementById('modalDescription')
  const visitSourceBtn = document.getElementById('visitSourceBtn')
  const visitSiteBtn = document.getElementById('visitSiteBtn')
  const orText = document.querySelector('.or-text')
  const modalScrollPositions = {}

  root.querySelectorAll('.project-tile:not([data-react-bound="1"])').forEach((tile) => {
    tile.setAttribute('data-react-bound', '1')
    tile.addEventListener('click', (event) => {
      event.preventDefault()
      if (!modal) return
      const imgSrc = tile.querySelector('img')?.src || ''
      const title = tile.getAttribute('data-title') || ''
      const description = tile.getAttribute('data-description') || ''
      const link = tile.getAttribute('data-link') || ''
      const siteLink = tile.getAttribute('data-site-link') || ''

      modal.style.display = 'flex'
      if (modalImg) modalImg.src = imgSrc
      if (modalTitle) modalTitle.innerHTML = title
      if (modalDescription) modalDescription.innerHTML = description

      if (visitSourceBtn) visitSourceBtn.onclick = () => window.open(link, '_blank')
      if (visitSiteBtn && orText) {
        if (siteLink) {
          visitSiteBtn.style.display = 'block'
          orText.style.display = 'block'
          visitSiteBtn.onclick = () => window.open(siteLink, '_blank')
        } else {
          visitSiteBtn.style.display = 'none'
          orText.style.display = 'none'
        }
      }

      const scroller = document.querySelector('.modal-scroll-container')
      if (scroller) scroller.scrollTop = modalScrollPositions[title] || 0
      document.body.style.overflow = 'hidden'
    })
  })

  const closeBtn = document.querySelector('.close-modal')
  if (closeBtn && !closeBtn.dataset.reactBound) {
    closeBtn.dataset.reactBound = '1'
    closeBtn.addEventListener('click', () => {
      const scroller = document.querySelector('.modal-scroll-container')
      if (scroller && modalTitle) {
        modalScrollPositions[modalTitle.innerHTML] = scroller.scrollTop
      }
      if (modal) modal.style.display = 'none'
      document.body.style.overflow = 'auto'
    })
  }

  if (!window.__reactModalGlobalBound) {
    window.__reactModalGlobalBound = true
    window.addEventListener('click', (ev) => {
      if (ev.target === modal) {
        const scroller = document.querySelector('.modal-scroll-container')
        if (scroller && modalTitle) {
          modalScrollPositions[modalTitle.innerHTML] = scroller.scrollTop
        }
        if (modal) modal.style.display = 'none'
        document.body.style.overflow = 'auto'
      }
    })
    window.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        const scroller = document.querySelector('.modal-scroll-container')
        if (scroller && modalTitle) {
          modalScrollPositions[modalTitle.innerHTML] = scroller.scrollTop
        }
        if (modal) modal.style.display = 'none'
        document.body.style.overflow = 'auto'
      }
    })
  }
}

function mountProjects() {
  const container = document.querySelector('.projects-container')
  if (!container) return
  const snapshot = container.innerHTML

  const getItems = () => {
    const tiles = Array.from(container.querySelectorAll('.project-tile'))
    return tiles.map((t) => {
      const img = t.querySelector('img')
      return {
        title: t.getAttribute('data-title') || '',
        link: t.getAttribute('data-link') || '',
        siteLink: t.getAttribute('data-site-link') || '',
        description: t.getAttribute('data-description') || '',
        overlay: t.querySelector('.text-overlay')?.textContent?.trim() || '',
        image: img?.getAttribute('src') || '',
        alt: img?.getAttribute('alt') || '',
      }
    })
  }

  const items = getItems()

  // If no items, don't touch DOM; just reveal & wire whatever exists now.
  if (items.length === 0) {
    requestAnimationFrame(() => {
      document.querySelectorAll('.project-tile.hidden').forEach(el => el.classList.add('show'))
      attachProjectTileListeners(document)
    })
    return
  }

  try {
    container.innerHTML = ''
    ReactDOM.createRoot(container).render(<Projects items={items} />)
    requestAnimationFrame(() => {
      container.querySelectorAll('.project-tile.hidden').forEach(el => el.classList.add('show'))
      attachProjectTileListeners(container)
    })
  } catch (e) {
    console.error('[react] Projects render failed; restoring:', e)
    container.innerHTML = snapshot
    requestAnimationFrame(() => {
      container.querySelectorAll('.project-tile.hidden').forEach(el => el.classList.add('show'))
      attachProjectTileListeners(container)
    })
  }
}

function mountContact() {
  const oldForm = document.getElementById('contact-form')
  if (!oldForm) return
  const action = oldForm.getAttribute('action') || 'https://formspree.io/f/xayrzorw'
  const mount = document.createElement('div')
  oldForm.replaceWith(mount)
  ReactDOM.createRoot(mount).render(<Contact action={action} />)
  console.log('[react] Contact mounted')
}

function mountSocialLinks() {
  const mount = document.getElementById('react-social-links')
  if (!mount) return
  ReactDOM.createRoot(mount).render(<SocialLinks />)
}


onReady(() => {
  mountProjects()
  mountContact()
  mountSocialLinks()
})
