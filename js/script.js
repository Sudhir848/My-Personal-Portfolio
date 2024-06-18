document.addEventListener('DOMContentLoaded', function () {
    displayGreeting();
    setupProjectObserver();
    setupSkillsObserver();
    setupAboutObserver();
});

function setupProjectObserver() {
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
                    }, index * 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(projectsSection);
}

function setupSkillsObserver() {
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
                    }, index * 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(skillsSection);
}

function setupAboutObserver() {
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
                        animateAboutText();
                    }, index * 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(aboutSection);
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

        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
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

document.getElementById('welcome-link').addEventListener('click', triggerWelcomeAnimation);
document.getElementById('brand-link').addEventListener('click', triggerWelcomeAnimation);

function triggerWelcomeAnimation() {
    var nameElement = document.getElementById('welcome-name');
    var jobTitleElement = document.getElementById('welcome-jobtitle');
    var greetingElement = document.getElementById('greeting-message');

    // Remove animation classes
    nameElement.classList.remove('animate-fadein');
    jobTitleElement.classList.remove('animate-slidein');
    greetingElement.classList.remove('animate-slidein-top-delay');

    // Trigger reflow
    void nameElement.offsetWidth;
    void jobTitleElement.offsetWidth;
    void greetingElement.offsetWidth;

    // Re-add animation classes
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

var modal = document.getElementById("myModal");
var modalImg = document.getElementById("img01");
var modalTitle = document.getElementById("modalTitle");
var modalDescription = document.getElementById("modalDescription");
var visitSourceBtn = document.getElementById("visitSourceBtn");
var orText = document.querySelector('.or-text');
var span = document.getElementsByClassName("close")[0];

document.addEventListener('DOMContentLoaded', function () {
    // Modal is hidden on page load
    var modal = document.getElementById("myModal");
    var modalImg = document.getElementById("img01");
    var modalTitle = document.getElementById("modalTitle");
    var modalDescription = document.getElementById("modalDescription");
    var visitSourceBtn = document.getElementById("visitSourceBtn");
    var visitSiteBtn = document.getElementById("visitSiteBtn");
    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "none";

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

            // Disable background scrolling
            document.body.style.overflow = 'hidden';
        });
    });

    span.onclick = function () {
        modal.style.display = "none";
        // Enable background scrolling
        document.body.style.overflow = 'auto';
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            // Enable background scrolling
            document.body.style.overflow = 'auto';
        }
    }

    window.onkeydown = function (event) {
        if (event.key === "Escape") {
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

    // Event listener to handle form submission with Enter key
    document.getElementById('contact-form').addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && event.target.tagName === 'TEXTAREA' && name === 'message') {
            if (!event.shiftKey) {
                event.preventDefault();
                this.submit();
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            this.submit();
        }
    });
});