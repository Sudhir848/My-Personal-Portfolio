import React from 'react'

export default function Projects({ items }) {
  return (
    <>
      {items.map((p, idx) => {
        const siteLink = p.siteLink || ''
        return (
          <div
            key={idx}
            className="project-tile hidden"
            data-title={p.title || ''}
            data-link={p.link || ''}
            data-site-link={siteLink}
            data-description={p.description || ''}
          >
            <div className="project-image">
              {}
              <img
                className="project-image-content"
                src={p.image}
                alt={p.alt || ''}
                loading="lazy"
                decoding="async"
              />
              <div className="zoom-icon"><i className="fas fa-search-plus"></i></div>
            </div>
            <div className="overlay">
              <div className="text text-overlay">{p.overlay || p.title}</div>
            </div>
          </div>
        )
      })}
    </>
  )
}
