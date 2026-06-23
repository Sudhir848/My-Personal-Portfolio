document.addEventListener('DOMContentLoaded', async function () {
    //displayGreeting();

    await loadProjectsFromJson();

    projectsObserver();
    skillsObserver();
    experienceObserver();
    aboutObserver();
    welcomeObserver();
    rotateObserver('about-title');
    rotateObserver('skills-title');
    rotateObserver('experience-title');
    rotateObserver('projects-title');
    rotateObserver('contact-title');

    function getNavbarOffset() {
        const navbar = document.getElementById('navbar');
        const navbarHeight = navbar ? Math.ceil(navbar.getBoundingClientRect().height) : 0;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const extraGap = viewportWidth < 768 ? 12 : 10;

        return navbarHeight + extraGap;
    }

    function getAnchorScrollTarget(targetElement) {
        if (!targetElement || targetElement.id === 'welcome-section') {
            return targetElement;
        }

        const sectionHeading = targetElement.matches('section')
            ? targetElement.querySelector(':scope > h2, h2')
            : null;

        return sectionHeading || targetElement;
    }

    function syncScrollOffsetVariable() {
        document.documentElement.style.setProperty('--fixed-nav-offset', `${getNavbarOffset()}px`);
    }

    function smoothScrollTo(targetElement, options = {}) {
        if (!targetElement) return;

        syncScrollOffsetVariable();

        const scrollTarget = getAnchorScrollTarget(targetElement);
        const targetTop =
            scrollTarget.getBoundingClientRect().top +
            window.pageYOffset -
            getNavbarOffset();

        window.scrollTo({
            top: Math.max(targetTop, 0),
            behavior: options.instant || prefersReducedMotion() ? 'auto' : 'smooth'
        });

        const welcomeSection = document.getElementById('welcome-section');
        if (welcomeSection) {
            window.setTimeout(() => welcomeSection.classList.remove('push-up'), 520);
        }
    }

    function closeResponsiveNavbarIfOpen(callback) {
        const navbarCollapse = document.getElementById('navbarNav');
        const toggler = document.getElementById('navbar-toggler');

        if (!navbarCollapse || !navbarCollapse.classList.contains('show')) {
            callback();
            return;
        }

        let callbackCalled = false;
        const runCallbackOnce = () => {
            if (callbackCalled) return;
            callbackCalled = true;
            syncScrollOffsetVariable();
            callback();
        };

        if (window.jQuery && typeof window.jQuery.fn.collapse === 'function') {
            window.jQuery(navbarCollapse).one('hidden.bs.collapse', runCallbackOnce);
            window.jQuery(navbarCollapse).collapse('hide');
            window.setTimeout(runCallbackOnce, 380);
        } else {
            navbarCollapse.classList.remove('show');
            if (toggler) toggler.setAttribute('aria-expanded', 'false');
            window.setTimeout(runCallbackOnce, 0);
        }
    }

    syncScrollOffsetVariable();
    window.addEventListener('resize', syncScrollOffsetVariable);
    window.addEventListener('orientationchange', () => window.setTimeout(syncScrollOffsetVariable, 250));

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (event) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const targetElement = document.querySelector(href);
            if (!targetElement) return;

            event.preventDefault();

            closeResponsiveNavbarIfOpen(() => {
                smoothScrollTo(targetElement);
                history.replaceState(null, '', window.location.pathname + window.location.search);

                if (href === '#welcome-section') {
                    triggerWelcomeAnimation();
                }
            });
        });
    });

    document.getElementById('welcome-link').addEventListener('click', function () {
        smoothScrollTo(document.getElementById('welcome-section'));
        triggerWelcomeAnimation();
    });

    document.getElementById('brand-link').addEventListener('click', function (event) {
        event.preventDefault();
        const welcomeSection = document.getElementById('welcome-section');
        closeResponsiveNavbarIfOpen(() => {
            smoothScrollTo(welcomeSection, { instant: true });
            window.scrollTo({ top: 0, behavior: 'auto' });
            triggerWelcomeAnimation();
        });
    });

    const downArrow = document.getElementById('down-arrow');
    downArrow.addEventListener('click', function () {
        const aboutSection = document.getElementById('about');

        if (aboutSection) {
            smoothScrollTo(aboutSection);
        }
    });

    window.addEventListener('scroll', function () {
        const navbar = document.getElementById('navbar');
        const sections = document.querySelectorAll('section');

        let inWelcomeSection = false;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - getNavbarOffset();
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                if (section.id === 'welcome-section') {
                    inWelcomeSection = true;
                }
            }
        });

        if (inWelcomeSection) {
            navbar.classList.remove('shrink');
        } else {
            navbar.classList.add('shrink');
        }
    });

    const profilePicContainer = document.getElementById('profile-pic-container');
    const profilePic = profilePicContainer.querySelector('.profile-pic');
    let isZoomed = false;

    profilePicContainer.addEventListener('click', function (event) {
        event.stopPropagation();
        profilePic.classList.toggle('zoomed');
        isZoomed = !isZoomed;
    });

    document.addEventListener('click', function () {
        if (isZoomed) {
            profilePic.classList.remove('zoomed');
            isZoomed = false;
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isZoomed) {
            profilePic.classList.remove('zoomed');
            isZoomed = false;
        }
    });

    const contactForm = document.getElementById('contact-form');
    contactForm.reset();

    window.addEventListener('pageshow', function () {
        contactForm.reset();
    });

    if (window.location.hash) {
        const initialTarget = document.querySelector(window.location.hash);
        if (initialTarget) {
            window.setTimeout(() => smoothScrollTo(initialTarget, { instant: true }), 120);
        }
    }

    const rocketBtn = document.getElementById('rocket-btn');
    rocketBtn.addEventListener('click', function () {
        const welcomeSection = document.getElementById('welcome-section');
        smoothScrollTo(welcomeSection);
    });

    const inputs = document.querySelectorAll('.form-control');

    function showPlaceholder(input) {
        if (!input.value) {
            input.placeholder = input.dataset.placeholder;
        }
    }

    function hidePlaceholder(input) {
        if (!input.value) {
            input.placeholder = ' ';
        }
    }

    inputs.forEach(input => {
        const label = input.nextElementSibling;

        input.addEventListener('focus', function () {
            showPlaceholder(this);
        });

        input.addEventListener('blur', function () {
            hidePlaceholder(this);
        });

        input.addEventListener('mouseenter', function () {
            if (!label.classList.contains('label-shifted')) {
                showPlaceholder(this);
            }
        });

        input.addEventListener('mouseleave', function () {
            hidePlaceholder(this);
        });

        input.addEventListener('input', function () {
            if (this.value && !label.classList.contains('label-shifted')) {
                label.classList.add('label-shifted');
            } else if (!this.value) {
                label.classList.remove('label-shifted');
            }
        });
    });

    // function validateForm() {
    //     let valid = true;
    //     inputs.forEach(input => {
    //         if (!input.value.trim()) {
    //             valid = false;
    //             input.classList.add('is-invalid');
    //         } else {
    //             input.classList.remove('is-invalid');
    //         }
    //     });
    //     return valid;
    // }

    // contactForm.addEventListener('submit', function (event) {
    //     event.preventDefault();

    //     if (validateForm()) {
    //         window.location.href = window.location.pathname + "#contact";
    //         this.submit();
    //     } else {
    //         alert('Please fill in all fields correctly.');
    //     }
    // });

    // document.getElementById('contact-form').addEventListener('keydown', function (event) {
    //     if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
    //         event.preventDefault();
    //         if (validateForm()) {
    //             this.submit();
    //         } else {
    //             alert('Please fill in all fields correctly.');
    //         }
    //     }
    // });

    // Modal event listeners
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("img01");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const visitSourceBtn = document.getElementById("visitSourceBtn");
    const visitSiteBtn = document.getElementById("visitSiteBtn");
    const orText = document.querySelector('.or-text');
    const span = document.getElementsByClassName("close-modal")[0];
    let lastFocusedElement = null;

    const modalScrollPositions = {};

    function closeProjectModal() {
        modalScrollPositions[modalTitle.textContent] = document.querySelector('.modal-scroll-container').scrollTop;
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = 'auto';
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    function bindProjectTileClicks() {
        document.querySelectorAll('.project-tile').forEach(tile => {
            if (tile.dataset.bound === "true") return;
            tile.dataset.bound = "true";

            function openProjectModal(tile, event) {
                if (event) event.preventDefault();

                var imgSrc = tile.querySelector('img').src;
                var title = tile.getAttribute('data-title');
                var link = tile.getAttribute('data-link');
                var siteLink = tile.getAttribute('data-site-link');
                var imageAlt = tile.getAttribute('data-image-alt') || (title ? `${title} project visual` : "Project visual");

                var descriptionEncoded = tile.getAttribute('data-description-enc') || "";
                var description = decodeURIComponent(descriptionEncoded);

                lastFocusedElement = document.activeElement;
                modal.classList.add("show");
                modal.setAttribute("aria-hidden", "false");
                modalImg.src = imgSrc;
                modalImg.alt = imageAlt;
                modalTitle.textContent = title;
                if (window.DOMPurify) {
                    modalDescription.innerHTML = window.DOMPurify.sanitize(description);
                } else {
                    modalDescription.textContent = description.replace(/<[^>]*>/g, ' ');
                }

                if (link) {
                    visitSourceBtn.style.display = 'inline-flex';
                    visitSourceBtn.onclick = function () {
                        window.open(link, '_blank', 'noopener,noreferrer');
                    };
                } else {
                    visitSourceBtn.style.display = 'none';
                    visitSourceBtn.onclick = null;
                }

                if (siteLink) {
                    visitSiteBtn.style.display = 'inline-flex';
                    visitSiteBtn.onclick = function () {
                        window.open(siteLink, '_blank', 'noopener,noreferrer');
                    };
                } else {
                    visitSiteBtn.style.display = 'none';
                    visitSiteBtn.onclick = null;
                }

                if (siteLink && link) {
                    orText.style.display = 'block';
                } else {
                    orText.style.display = 'none';
                }

                const modalActions = document.querySelector('.modal-actions');
                if (modalActions) {
                    modalActions.style.display = (siteLink || link) ? 'flex' : 'none';
                }

                if (modalScrollPositions[title]) {
                    document.querySelector('.modal-scroll-container').scrollTop = modalScrollPositions[title];
                } else {
                    document.querySelector('.modal-scroll-container').scrollTop = 0;
                }

                document.body.style.overflow = 'hidden';
                requestAnimationFrame(() => span.focus({ preventScroll: true }));
            }

                tile.addEventListener('click', event => {
                    openProjectModal(tile, event);
                });

                tile.addEventListener('keydown', event => {
                    if (event.key === "Enter" || event.key === " ") {
                        openProjectModal(tile, event);
                    }
                });
        });
    }

    span.onclick = closeProjectModal;

    window.onclick = function (event) {
        if (event.target == modal) {
            closeProjectModal();
        }
    }

    window.onkeydown = function (event) {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeProjectModal();
        }
    }

    document.querySelectorAll('#navbarNav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const toggler = document.getElementById('navbar-toggler');
            if (toggler) toggler.blur();
        });
    });

    function rotateObserver(elementId) {
        const element = document.getElementById(elementId);
        const observerOptions = { threshold: 0.5 };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    element.classList.add('rotate-animation');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        observer.observe(element);
    }

    function aboutObserver() {
        const aboutItems = document.querySelectorAll('.about-item');
        const aboutSection = document.getElementById('about');

        const observerOptions = { threshold: 0.1 };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    aboutItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.remove('hidden');
                            item.classList.add('animate-fadein');
                        }, index * 1000);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        observer.observe(aboutSection);
    }

    function skillsObserver() {
        const skills = document.querySelectorAll('.skill-item');
        const skillsSection = document.getElementById('skills');

        const observerOptions = { threshold: 0.1 };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skills.forEach((skill, index) => {
                        setTimeout(() => {
                            skill.classList.remove('hidden');
                            skill.classList.add('animate-fadein');
                        }, index * 100);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        observer.observe(skillsSection);
    }

    function experienceObserver() {
        const experienceItems = document.querySelectorAll('.experience-item');

        if (!experienceItems.length) return;

        const observerOptions = {
            threshold: 0.18,
            rootMargin: '0px 0px -80px 0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    const index = Array.from(experienceItems).indexOf(item);

                    setTimeout(() => {
                        item.classList.remove('hidden');
                        item.classList.add('animate-fadein');
                    }, index * 160);

                    observer.unobserve(item);
                }
            });
        }, observerOptions);

        experienceItems.forEach(item => {
            observer.observe(item);
        });
    }

    function animateProjectTilesNow() {
        const tiles = document.querySelectorAll('.project-tile');
        tiles.forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.remove('hidden');
                tile.classList.add('animate-fadein');
            }, index * 180);
        });
    }

    function projectsObserver() {
        const projectsSection = document.getElementById('projects');
        const observerOptions = { threshold: 0.1 };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProjectTilesNow();
                }
            });
        }, observerOptions);

        observer.observe(projectsSection);
    }

    function welcomeObserver() {
        const welcomeSection = document.getElementById('welcome-section');
        const observerOptions = { threshold: 0.5 };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    triggerWelcomeAnimation();
                }
            });
        }, observerOptions);

        observer.observe(welcomeSection);
    }

    window.onscroll = function () { highlightSection() };

    function highlightSection() {
        const sections = document.querySelectorAll("section");
        const navLinks = document.querySelectorAll("#navbar a");

        let currentSectionId = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop - getNavbarOffset();
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    }

    function triggerWelcomeAnimation() {
        const nameElement = document.getElementById('welcome-name');
        const jobTitleElement = document.getElementById('welcome-jobtitle');
        const greetingElement = document.getElementById('greeting-message');

        if (!nameElement || !jobTitleElement || !greetingElement) return;

        greetingElement.classList.remove('animate-slidein-top-delay');
        void greetingElement.offsetWidth;
        setTimeout(displayGreeting, 100);

        runWelcomeTypewriter(nameElement, jobTitleElement);
    }

    let welcomeTypewriterTimeouts = [];

    function clearWelcomeTypewriterTimers() {
        welcomeTypewriterTimeouts.forEach(t => clearTimeout(t));
        welcomeTypewriterTimeouts = [];
    }

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function ensureTypewriterMarkup(el) {
        if (!el.dataset.originalText) el.dataset.originalText = el.textContent;

        if (el.querySelector('.tw-text') && el.querySelector('.tw-cursor')) return;

        el.innerHTML = '';
        const textSpan = document.createElement('span');
        textSpan.className = 'tw-text';

        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'tw-cursor';
        cursorSpan.setAttribute('aria-hidden', 'true');
        cursorSpan.textContent = '|';

        el.appendChild(textSpan);
        el.appendChild(cursorSpan);
    }

    function typeInto(el, text, speedMs, done) {
        ensureTypewriterMarkup(el);
        const textSpan = el.querySelector('.tw-text');
        const cursorSpan = el.querySelector('.tw-cursor');
        textSpan.textContent = '';
        cursorSpan.style.display = 'inline-block';

        if (prefersReducedMotion()) {
            textSpan.textContent = text;
            if (typeof done === 'function') done();
            return;
        }

        for (let i = 0; i <= text.length; i++) {
            const t = setTimeout(() => {
                textSpan.textContent = text.slice(0, i);

                if (i === text.length) {
                    // cursorSpan.style.display = 'none';
                    if (typeof done === 'function') done();
                }
            }, i * speedMs);

            welcomeTypewriterTimeouts.push(t);
        }
    }

    function getOriginalText(el) {
        if (el.dataset.originalText) return el.dataset.originalText;
        const existing = el.querySelector('.tw-text');
        const raw = existing ? existing.textContent : el.textContent;
        el.dataset.originalText = raw;
        return raw;
    }

    function runWelcomeTypewriter(nameEl, jobEl) {
        clearWelcomeTypewriterTimers();
        const jobText = getOriginalText(jobEl);
        jobEl.textContent = jobText;
        jobEl.classList.remove('animate-slidein-bottom-delay');
        jobEl.style.opacity = '0';
        jobEl.style.transform = 'translateY(20px)';
        void jobEl.offsetWidth;

        jobEl.style.opacity = '';
        jobEl.style.transform = '';
        void jobEl.offsetWidth;
        jobEl.classList.add('animate-slidein-bottom-delay');
        nameEl.style.opacity = '1';
        nameEl.style.transform = 'none';
        const nameText = getOriginalText(nameEl);
        const NAME_SPEED = 90;
        typeInto(nameEl, nameText, NAME_SPEED);
    }

    function displayGreeting() {
        const now = new Date();
        const hours = now.getHours();
        let greeting;

        if (hours < 12) {
            greeting = "Good Morning!";
        } else if (hours < 18) {
            greeting = "Good Afternoon!";
        } else {
            greeting = "Good Evening!";
        }
        const greetingElement = document.getElementById('greeting-message');
        greetingElement.innerText = greeting;
        greetingElement.classList.add('animate-slidein-top-delay');
    }

    async function loadProjectsFromJson() {
        const container = document.getElementById('projectsContainer');
        const select = document.getElementById('projectCategory');
        const countEl = document.getElementById('projectsCount');

        if (!container || !select) return;

        let projects = [];
        try {
            const res = await fetch('data/projects.json', { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            projects = await res.json();
        } catch (e) {
            console.error(e);
            container.innerHTML = `<p>Could not load projects. Please check <code>data/projects.json</code>.</p>`;
            return;
        }

        const catSet = new Set();
        projects.forEach(p => (p.categories || []).forEach(c => catSet.add(c)));

        const labelMap = {
            all: "All Projects",
            cybersecurity: "Cybersecurity",
            "network-systems": "Networking / Systems",
            "ai-ml": "AI / ML / Data",
            database: "Databases",
            "web-dev": "Web / Frontend",
            "systems-cpp": "C++ / Systems",
            "game-dev": "Games / UI",
            robotics: "Robotics"
        };

        const categoryOrder = ["cybersecurity", "network-systems", "ai-ml", "database", "web-dev", "systems-cpp", "game-dev", "robotics"];
        const categories = Array.from(catSet).sort((a, b) => {
            const ai = categoryOrder.indexOf(a);
            const bi = categoryOrder.indexOf(b);
            if (ai === -1 && bi === -1) return a.localeCompare(b);
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
        });

        select.innerHTML = `<option value="all">${labelMap.all}</option>` + categories.map(c => {
            const label = labelMap[c] || c;
            return `<option value="${c}">${label}</option>`;
        }).join('');

        function escapeAttr(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        function tileHtml(p) {
            const title = p.title || "";
            const overlay = p.overlay || title;
            const source = p.source || "";
            const demo = p.demo || "";
            const alt = p.image_alt || title;

            const desc = p.description_html || "";
            const descEnc = encodeURIComponent(desc);

            const hasWebp = p.image_webp && p.image_webp.trim() !== "";
            const fallback = p.image_fallback || "";
            const webp = p.image_webp || "";
            const imageBlock = hasWebp
                ? `
                    <picture>
                        <source srcset="${webp}" type="image/webp">
                        <img src="${fallback}" alt="${alt}" loading="lazy">
                    </picture>`
                : `<img src="${fallback}" alt="${alt}" loading="lazy">`;

            return `
                <div class="project-tile hidden"
                    role="button"
                    tabindex="0"
                    aria-label="Open ${escapeAttr(title)} project details"
                    data-title="${escapeAttr(title)}"
                    data-link="${escapeAttr(source)}"
                    data-site-link="${escapeAttr(demo)}"
                    data-image-alt="${escapeAttr(alt)}"
                    data-description-enc="${descEnc}">
                    <div class="project-image">
                        ${imageBlock}
                        <div class="zoom-icon"><i class="fas fa-search-plus"></i></div>
                    </div>
                    <div class="overlay">
                        <div class="text text-overlay">${overlay}</div>
                    </div>
                </div>
            `;
        }

        function render(filter) {
            if (!filter) {
                container.innerHTML = "";
                if (countEl) countEl.textContent = "";
                return;
            }
            
            const filtered = filter === "all"
                ? projects
                : projects.filter(p => (p.categories || []).includes(filter));

            container.innerHTML = filtered.map(tileHtml).join('');
            // applyThumbAspectRatios();
            if (countEl) countEl.textContent = `${filtered.length} project${filtered.length === 1 ? '' : 's'}`;

            document.querySelectorAll('.project-tile').forEach(tile => {
                tile.dataset.bound = "false";
            });
            bindProjectTileClicks();
            animateProjectTilesNow();
        }

        // function applyThumbAspectRatios() {
        //     document.querySelectorAll('.project-image img').forEach(img => {
        //         const setAR = () => {
        //             const w = img.naturalWidth || 16;
        //             const h = img.naturalHeight || 9;
        //             img.closest('.project-image')?.style.setProperty('--ar', `${w} / ${h}`);
        //         };
        //         if (img.complete) setAR();
        //         else img.addEventListener('load', setAR, { once: true });
        //     });
        // }

        select.addEventListener('change', function () {
            render(this.value);
        });
        const defaultCategory = "all";
        select.value = defaultCategory;
        render(defaultCategory);
    }
});
