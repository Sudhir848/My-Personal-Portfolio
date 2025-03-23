document.addEventListener('DOMContentLoaded', function () {
    displayGreeting();
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
        const welcomeSection = document.getElementById('welcome-section');
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
            document.documentElement.style.scrollBehavior = "auto"; // Disable smooth scrolling
            document.getElementById('contact').scrollIntoView({ behavior: 'instant' });
            document.documentElement.style.scrollBehavior = ""; // Re-enable smooth scrolling
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

    document.addEventListener('DOMContentLoaded', function () {
        const contactForm = document.getElementById('contact-form');
        const inputs = document.querySelectorAll('.form-control');
    
        function resetForm() {
            inputs.forEach(input => {
                input.value = '';
                input.placeholder = ' ';
                input.nextElementSibling.classList.remove('label-shifted');
            });
        }
    
        // Ensure form is reset on page load and when navigating back
        window.addEventListener('pageshow', function () {
            contactForm.reset();
        
            // Check if the stored section exists
            const scrollToSection = sessionStorage.getItem('scrollToSection');
            if (scrollToSection) {
                const targetElement = document.getElementById(scrollToSection);
                if (targetElement) {
                    document.documentElement.style.scrollBehavior = 'auto'; // Disable smooth scrolling
                    targetElement.scrollIntoView({ behavior: 'instant' }); // Instantly move to the section
                    document.documentElement.style.scrollBehavior = ''; // Re-enable smooth scrolling
                }
                sessionStorage.removeItem('scrollToSection'); // Clear after use
            }
        });        
    
        // Placeholder and label handling
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
    });    

    // Event listener to handle form submission
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

    // Store the scroll positions of each modal
    const modalScrollPositions = {};

    document.querySelectorAll('.project-tile').forEach(tile => {
        tile.addEventListener('click', event => {
            event.preventDefault();
            var imgSrc = tile.querySelector('img').src;
            var title = tile.getAttribute('data-title');
            var description = tile.getAttribute('data-description');
            var link = tile.getAttribute('data-link');
            var siteLink = tile.getAttribute('data-site-link');

            modal.style.display = "flex";
            modalImg.src = imgSrc;
            modalTitle.innerHTML = title;
            modalDescription.innerHTML = description;
            visitSourceBtn.onclick = function () {
                window.open(link, '_blank');
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

            // Disable background scrolling
            document.body.style.overflow = 'hidden';
        });
    });

    span.onclick = function () {
        modalScrollPositions[modalTitle.innerHTML] = document.querySelector('.modal-scroll-container').scrollTop;
        modal.style.display = "none";
        document.body.style.overflow = 'auto';
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modalScrollPositions[modalTitle.innerHTML] = document.querySelector('.modal-scroll-container').scrollTop;
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    }

    window.onkeydown = function (event) {
        if (event.key === "Escape") {
            // Save the current scroll position of the modal before closing it
            modalScrollPositions[modalTitle.innerHTML] = document.querySelector('.modal-scroll-container').scrollTop;
            modal.style.display = "none";
            // Enable background scrolling
            document.body.style.overflow = 'auto';
        }
    }

    // Event listener to collapse the navbar when a link is clicked on small screens
    document.querySelectorAll('#navbarNav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                document.getElementById('navbar-toggler').click();
            }
        });
    });

    function rotateObserver(elementId) {
        const element = document.getElementById(elementId);
        const observerOptions = {
            threshold: 0.5
        };

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

        const observerOptions = {
            threshold: 0.1
        };

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

        const observerOptions = {
            threshold: 0.1
        };

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

    function projectsObserver() {
        const tiles = document.querySelectorAll('.project-tile');
        const projectsSection = document.getElementById('projects');

        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tiles.forEach((tile, index) => {
                        setTimeout(() => {
                            tile.classList.remove('hidden');
                            tile.classList.add('animate-fadein');
                        }, index * 300);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        observer.observe(projectsSection);
    }

    function welcomeObserver() {
        const welcomeSection = document.getElementById('welcome-section');

        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    triggerWelcomeAnimation();
                }
            });
        }, observerOptions);

        observer.observe(welcomeSection);
    }

    function decodeHTMLEntities(text) {
        var txt = document.createElement("textarea");
        txt.innerHTML = text;
        return txt.value;
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
        var nameElement = document.getElementById('welcome-name');
        var jobTitleElement = document.getElementById('welcome-jobtitle');
        var greetingElement = document.getElementById('greeting-message');

        nameElement.classList.remove('animate-fadein');
        jobTitleElement.classList.remove('animate-slidein');
        greetingElement.classList.remove('animate-slidein-top-delay');

        void nameElement.offsetWidth;
        void jobTitleElement.offsetWidth;
        void greetingElement.offsetWidth;

        nameElement.classList.add('animate-fadein');
        jobTitleElement.classList.add('animate-slidein');
        setTimeout(displayGreeting, 100);
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
});