import React, { useEffect, useMemo, useRef, useState } from 'react'
import { projects } from './data/projects.js'
import Contact from "./integrations/Contact.jsx";

export default function App() {
  const [greeting, setGreeting] = useState('')
  const [modalProject, setModalProject] = useState(null)
  const navRef = useRef(null)

  useEffect(() => {
    const hours = new Date().getHours()
    setGreeting(hours < 12 ? 'Good Morning!' : hours < 18 ? 'Good Afternoon!' : 'Good Evening!')
  }, [])

  const smoothScrollTo = (el) => {
    if (!el) return
    const start = window.scrollY
    const end = el.offsetTop
    const distance = end - start
    const duration = 500
    const easing = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
    let startTime = null
    function step(ts) {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime
      const p = Math.min(elapsed / duration, 1)
      window.scrollTo(0, start + distance * easing(p))
      if (elapsed < duration) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  useEffect(() => {
    const navbar = navRef.current
    const sections = [...document.querySelectorAll('section')]
    const navLinks = [...document.querySelectorAll('#navbar a')]

    const onScroll = () => {
      const welcome = document.getElementById('welcome-section')
      if (welcome && navbar) {
        const inWelcome =
          window.scrollY >= welcome.offsetTop &&
          window.scrollY < welcome.offsetTop + welcome.offsetHeight
        navbar.classList.toggle('shrink', !inWelcome)
      }
      let current = ''
      sections.forEach((section) => {
        const top = section.offsetTop - 70
        const height = section.offsetHeight
        if (window.scrollY >= top && window.scrollY < top + height) current = section.id
      })
      navLinks.forEach((a) => {
        a.classList.toggle('active', a.getAttribute('href') === `#${current}`)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    ;['about-title', 'skills-title', 'projects-title', 'contact-title'].forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('rotate-animation')
            o.unobserve(e.target)
          }
        })
      }, { threshold: 0.5 })
      obs.observe(el)
    })

    const aboutSection = document.getElementById('about')
    if (aboutSection) {
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            document.querySelectorAll('.about-item').forEach((item, i) => {
              setTimeout(() => {
                item.classList.remove('hidden')
                item.classList.add('animate-fadein')
              }, i * 1000)
            })
            o.unobserve(e.target)
          }
        })
      }, { threshold: 0.1 })
      obs.observe(aboutSection)
    }

    const skillsSection = document.getElementById('skills')
    if (skillsSection) {
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            document.querySelectorAll('.skill-item').forEach((item, i) => {
              setTimeout(() => {
                item.classList.remove('hidden')
                item.classList.add('animate-fadein')
              }, i * 100)
            })
            o.unobserve(e.target)
          }
        })
      }, { threshold: 0.1 })
      obs.observe(skillsSection)
    }

    const projectsSection = document.getElementById('projects')
    if (projectsSection) {
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            document.querySelectorAll('.project-tile').forEach((tile, i) => {
              setTimeout(() => {
                tile.classList.remove('hidden')
                tile.classList.add('animate-fadein')
              }, i * 300)
            })
            o.unobserve(e.target)
          }
        })
      }, { threshold: 0.1 })
      obs.observe(projectsSection)
    }
  }, [])

  useEffect(() => {
    const toggler = document.getElementById('navbar-toggler')
    const menu = document.getElementById('navbarNav')
    if (!toggler || !menu) return
    const onClick = () => menu.classList.toggle('show')
    toggler.addEventListener('click', onClick)
    return () => toggler.removeEventListener('click', onClick)
  }, [])

  // Placeholder hover/focus behavior — exclude Contact form (Contact.jsx manages it)
  useEffect(() => {
    const all = [...document.querySelectorAll('.form-control')];
    const inputs = all.filter((el) => !el.closest('#contact-form'));

    const showPH = (i) => { if (!i.value) i.placeholder = i.dataset.placeholder || ' ' }
    const hidePH = (i) => { if (!i.value) i.placeholder = ' ' }

    const cleanups = [];

    inputs.forEach((input) => {
      const label = input.nextElementSibling

      const onFocus = () => showPH(input);
      const onBlur = () => hidePH(input);
      const onEnter = () => { if (label && !label.classList.contains('label-shifted')) showPH(input) }
      const onLeave = () => hidePH(input);
      const onInput = () => {
        if (input.value && label && !label.classList.contains('label-shifted')) label.classList.add('label-shifted')
        else if (!input.value && label) label.classList.remove('label-shifted')
      }

      input.addEventListener('focus', onFocus)
      input.addEventListener('blur', onBlur)
      input.addEventListener('mouseenter', onEnter)
      input.addEventListener('mouseleave', onLeave)
      input.addEventListener('input', onInput)

      cleanups.push(() => {
        input.removeEventListener('focus', onFocus)
        input.removeEventListener('blur', onBlur)
        input.removeEventListener('mouseenter', onEnter)
        input.removeEventListener('mouseleave', onLeave)
        input.removeEventListener('input', onInput)
      })
    })

    // Do NOT reset the contact form from here (Contact manages its own reset).
    const onPageShow = () => {
      // If you want, you can reset other forms here, but skip contact.
      // Example:
      // document.querySelectorAll('form').forEach(f => { if (!f.id || f.id !== 'contact-form') f.reset() })
    }

    window.addEventListener('pageshow', onPageShow)
    return () => {
      cleanups.forEach((fn) => fn())
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  const ProjectGrid = useMemo(
    () => projects.map((p, idx) => (
      <div
        key={idx}
        className="project-tile hidden"
        role="button"
        tabIndex={0}
        onClick={() => setModalProject(p)}
        onKeyDown={(e) => e.key === 'Enter' && setModalProject(p)}
      >
        <div className="project-image">
          <picture>
            <img src={p.image} alt={p.alt} loading="lazy" />
          </picture>
          <div className="zoom-icon"><i className="fas fa-search-plus" /></div>
        </div>
        <div className="overlay"><div className="text text-overlay">{p.title}</div></div>
      </div>
    )),
    []
  )

  return (
    <div>
      <nav id="navbar" className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" ref={navRef}>
        <div className="container">
          <a className="navbar-brand page-scroll" href="#welcome-section" id="brand-link">
            <img src="images/favicon.ico" id="brand-logo" alt="Brand Logo" className="navbar-logo" loading="lazy" />
            SUDHIR GUNASEELAN
          </a>
          <button className="navbar-toggler" type="button" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" id="navbar-toggler">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item mx-2"><a className="nav-link" href="#welcome-section" id="welcome-link">WELCOME</a></li>
              <li className="nav-item mx-2"><a className="nav-link" href="#about" id="about-link">ABOUT</a></li>
              <li className="nav-item mx-2"><a className="nav-link" href="#skills" id="skills-link">SKILLS</a></li>
              <li className="nav-item mx-2"><a className="nav-link" href="#projects" id="projects-link">PROJECTS</a></li>
              <li className="nav-item mx-2"><a className="nav-link" href="#contact" id="contact-link">CONTACT</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <main>
        {/* Welcome */}
        <section id="welcome-section">
          <div id="greeting-message" className="animate-slidein-top-delay">{greeting}</div>
          <h1 id="welcome-name" className="animate-fadein">Heyy! I'm Sudhir Gunaseelan</h1>
          <p id="welcome-jobtitle" className="jobtitle animate-slidein">Software Engineer</p>
          <div
            id="down-arrow"
            className="down-arrow"
            onClick={() => smoothScrollTo(document.getElementById('about'))}
            role="button"
            tabIndex={0}
          />
        </section>

        {/* About */}
        <section id="about">
          <h2 id="about-title">A LITTLE BIT ABOUT ME</h2>
          <div className="about-content">
            <div className="profile-pic-container" id="profile-pic-container">
              <picture>
                <source srcSet="images/profile-pic.webp" type="image/webp" />
                <img src="images/profile-pic.png" alt="Profile Picture" className="profile-pic bounce" loading="lazy" />
              </picture>
            </div>
            <p id="about-text" className="about-item hidden">
              I'm a passionate software and web developer with a keen interest in creating dynamic and engaging
              <span className="lang"> web</span> & <span className="lang"> software applications</span>. Also interested in
              the field of <span className="lang"> Cybersecurity</span>.
              Completed my <a href="https://drive.google.com/file/d/1_wXv1J-8nU-jFmjhpQ-ECRDB7qGZLaEL/view?usp=sharing" target="_blank" rel="noreferrer"><span className="pop">Bachelor's</span></a> degree in
              <a href="https://drive.google.com/file/d/1_wXv1J-8nU-jFmjhpQ-ECRDB7qGZLaEL/view?usp=sharing" target="_blank" rel="noreferrer"><span className="pop"> Computer Science</span></a> and currently pursuing
              <a href="https://www.uml.edu/sciences/computer-science/programs/masters/" target="_blank" rel="noreferrer"><span className="pop"> Master's</span></a> in <span className="lang"> CS</span> at
              <a href="https://www.uml.edu/" target="_blank" rel="noreferrer"><span className="pop"> University of Massachusetts Lowell</span></a>.
            </p>
          </div>
        </section>

        {/* Skills */}
        <section id="skills">
          <h2 id="skills-title">SKILLS AND TECHNOLOGIES I'VE USED</h2>
          <div className="skills-icons-container">
            <ul className="skills-list">
              <div className="icon-container skill-item hidden">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" height="50" loading="lazy" />
              </div>
              <div className="icon-container skill-item hidden">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" height="50" loading="lazy" />
              </div>
              <div className="icon-container skill-item hidden">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original-wordmark.svg" height="50" loading="lazy" />
              </div>
              {/* Rest of the icons */}
            </ul>
          </div>
        </section>

        {/* Projects */}
        <section id="projects">
          <h2 id="projects-title">PROJECTS I'VE DONE</h2>
          <div className="projects-container">
            {ProjectGrid}
          </div>
        </section>

        {/* Resume */}
        <section id="resume">
          <h2 className="resume-title">CHECK OUT MY RÉSUMÉ!</h2>
          <a href="Resume/My_Resume.pdf" className="resume-button" target="_blank" rel="noreferrer">Grab A Copy</a>
        </section>

        {/* Contact */}
        <section id="contact">
          <h2 id="contact-title" className="font-weight-bold">GET IN TOUCH!</h2>
          <Contact />

          <div id="social-links-container">
            <a href="https://github.com/Sudhir848" target="_blank" rel="noreferrer" className="social-icon">
              <i className="fab fa-github"></i><span className="tooltip-text">GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/sudhirgunaseelan/" target="_blank" rel="noreferrer" className="social-icon">
              <i className="fab fa-linkedin"></i><span className="tooltip-text">LinkedIn</span>
            </a>
          </div>
        </section>
      </main>

      <footer>
        <p>
          &copy; 2024 Sudhir Gunaseelan. All rights reserved.
          <button
            className="rocket-btn"
            id="rocket-btn"
            onClick={() => smoothScrollTo(document.getElementById('welcome-section'))}
          >
            <picture>
              <source srcSet="images/rocket.webp" type="image/webp" />
              <img src="images/rocket.png" alt="Rocket Icon" />
            </picture>
            <span className="hover-text">Beam me up, Scotty!</span>
          </button>
        </p>
      </footer>

      {/* Project Modal */}
      {modalProject && (
        <div
          id="myModal"
          className="modal"
          style={{ display: 'flex' }}
          onClick={(e) => e.target.classList.contains('modal') && setModalProject(null)}
        >
          <div className="modal-content">
            <div id="modalTitle" className="modal-title">{modalProject.title}</div>
            <div className="modal-scroll-container">
              <div className="modal-image">
                <img id="img01" className="modal-image-content" src={modalProject.image} alt={modalProject.alt} />
              </div>
              <div
                id="modalDescription"
                className="modal-description"
                dangerouslySetInnerHTML={{ __html: modalProject.description }}
              />
            </div>
            <div className="button-container">
              {modalProject.siteLink && (
                <button id="visitSiteBtn" onClick={() => window.open(modalProject.siteLink, '_blank')}>Visit Site</button>
              )}
              {modalProject.siteLink && modalProject.link && <div className="or-text">OR</div>}
              {modalProject.link && (
                <button id="visitSourceBtn" onClick={() => window.open(modalProject.link, '_blank')}>Visit Source</button>
              )}
            </div>
            <button type="button" className="close-modal" aria-label="Close" onClick={() => setModalProject(null)}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
