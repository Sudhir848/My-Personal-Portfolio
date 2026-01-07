document.addEventListener('DOMContentLoaded', async function () {
    displayGreeting();

    await loadProjectsFromJson();

    projectsObserver();
    skillsObserver();
    aboutObserver();
    welcomeObserver();
    rotateObserver('about-title');
    rotateObserver('skills-title');
    rotateObserver('projects-title');
    rotateObserver('contact-title');

    function smoothScrollTo(targetElement) {
        const startPosition = window.scrollY;
        const endPosition = targetElement.offsetTop;
        const distance = endPosition - startPosition;
        const duration = 500;
        const easing = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        let startTime = null;

        function scrollStep(currentTime) {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easingProgress = easing(progress);

            window.scrollTo(0, startPosition + (distance * easingProgress));

            if (timeElapsed < duration) {
                requestAnimationFrame(scrollStep);
            } else {
                const welcomeSection = document.getElementById('welcome-section');
                if (welcomeSection) {
                    welcomeSection.classList.remove('push-up');
                }
            }
        }

        requestAnimationFrame(scrollStep);
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                smoothScrollTo(targetElement);
                window.history.replaceState(null, null, ' ');
                if (targetId === 'welcome-section') {
                    triggerWelcomeAnimation();
                }
            }
        });
    });

    document.getElementById('welcome-link').addEventListener('click', function () {
        smoothScrollTo(document.getElementById('welcome-section'));
        triggerWelcomeAnimation();
    });

    document.getElementById('brand-link').addEventListener('click', function (event) {
        event.preventDefault();
        const welcomeSection = document.getElementById('welcome-section');
        document.documentElement.style.scrollBehavior = 'auto';
        welcomeSection.scrollIntoView({ behavior: 'instant' });
        window.scrollTo(0, 0);
        document.documentElement.style.scrollBehavior = '';
        triggerWelcomeAnimation();
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
            const sectionTop = section.offsetTop - 70;
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

    window.addEventListener('DOMContentLoaded', function () {
        if (window.location.hash === "#contact") {
            document.documentElement.style.scrollBehavior = "auto";
            document.getElementById('contact').scrollIntoView({ behavior: 'instant' });
            document.documentElement.style.scrollBehavior = "";
        }
    });

    const rocketBtn = document.getElementById('rocket-btn');
    rocketBtn.addEventListener('click', function () {
        const welcomeSection = document.getElementById('welcome-section');
        welcomeSection.scrollIntoView({ behavior: 'smooth' });
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

    function validateForm() {
        let valid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                valid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });
        return valid;
    }

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (validateForm()) {
            window.location.href = window.location.pathname + "#contact";
            this.submit();
        } else {
            alert('Please fill in all fields correctly.');
        }
    });

    document.getElementById('contact-form').addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            if (validateForm()) {
                this.submit();
            } else {
                alert('Please fill in all fields correctly.');
            }
        }
    });

    // Modal event listeners
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("img01");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const visitSourceBtn = document.getElementById("visitSourceBtn");
    const visitSiteBtn = document.getElementById("visitSiteBtn");
    const orText = document.querySelector('.or-text');
    const span = document.getElementsByClassName("close-modal")[0];

    const modalScrollPositions = {};

    function bindProjectTileClicks() {
        document.querySelectorAll('.project-tile').forEach(tile => {
            if (tile.dataset.bound === "true") return;
            tile.dataset.bound = "true";

            tile.addEventListener('click', event => {
                event.preventDefault();

                var imgSrc = tile.querySelector('img').src;
                var title = tile.getAttribute('data-title');
                var link = tile.getAttribute('data-link');
                var siteLink = tile.getAttribute('data-site-link');

                var descriptionEncoded = tile.getAttribute('data-description-enc') || "";
                var description = decodeURIComponent(descriptionEncoded);

                modal.classList.add("show");
                modalImg.src = imgSrc;
                modalTitle.innerHTML = title;
                modalDescription.innerHTML = description;

                visitSourceBtn.onclick = function () {
                    if (link) window.open(link, '_blank');
                }

                if (siteLink) {
                    visitSiteBtn.style.display = 'block';
                    visitSiteBtn.onclick = function () {
                        window.open(siteLink, '_blank');
                    };
                } else {
                    visitSiteBtn.style.display = 'none';
                }

                if (siteLink && link) {
                    orText.style.display = 'block';
                } else {
                    orText.style.display = 'none';
                }

                if (modalScrollPositions[title]) {
                    document.querySelector('.modal-scroll-container').scrollTop = modalScrollPositions[title];
                } else {
                    document.querySelector('.modal-scroll-container').scrollTop = 0;
                }

                document.body.style.overflow = 'hidden';
            });
        });
    }

    span.onclick = function () {
        modalScrollPositions[modalTitle.innerHTML] = document.querySelector('.modal-scroll-container').scrollTop;
        modal.classList.remove("show");
        document.body.style.overflow = 'auto';
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modalScrollPositions[modalTitle.innerHTML] = document.querySelector('.modal-scroll-container').scrollTop;
            modal.classList.remove("show");
            document.body.style.overflow = 'auto';
        }
    }

    window.onkeydown = function (event) {
        if (event.key === "Escape") {
            modalScrollPositions[modalTitle.innerHTML] = document.querySelector('.modal-scroll-container').scrollTop;
            modal.classList.remove("show");
            document.body.style.overflow = 'auto';
        }
    }

    document.querySelectorAll('#navbarNav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                document.getElementById('navbar-toggler').click();
            }
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
            const sectionTop = section.offsetTop - 70;
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
        const categories = Array.from(catSet).sort();

        const labelMap = {
            "ai-ml": "AI / ML / Robotics",
            "game-dev": "Game Development",
            "web-dev": "Web Design",
            cybersecurity: "Cybersecurity"
        };

        select.innerHTML =
            `<option value="" selected></option>` +
            categories.map(c => {
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
                    data-title="${escapeAttr(title)}"
                    data-link="${escapeAttr(source)}"
                    data-site-link="${escapeAttr(demo)}"
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
            
            const filtered = projects.filter(p => (p.categories || []).includes(filter));

            container.innerHTML = filtered.map(tileHtml).join('');
            // applyThumbAspectRatios();
            if (countEl) countEl.textContent = `${filtered.length} project${filtered.length === 1 ? '' : 's'}`;

            document.querySelectorAll('.project-tile').forEach(tile => {
                tile.dataset.bound = "false";
            });
            bindProjectTileClicks();
            animateProjectTilesNow();
        }

        function applyThumbAspectRatios() {
            document.querySelectorAll('.project-image img').forEach(img => {
                const setAR = () => {
                    const w = img.naturalWidth || 16;
                    const h = img.naturalHeight || 9;
                    img.closest('.project-image')?.style.setProperty('--ar', `${w} / ${h}`);
                };
                if (img.complete) setAR();
                else img.addEventListener('load', setAR, { once: true });
            });
        }

        select.addEventListener('change', function () {
            render(this.value);
        });

        select.value = "";
        render("");
    }
});
