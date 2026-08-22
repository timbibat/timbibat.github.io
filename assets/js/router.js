/**
 * Client-side Hash Router & Page Loader Module
 * Loads HTML fragment content dynamically into #maincontent and synchronizes meta/navigation state.
 */

export const routes = {
    'about': {
        title: 'Timothy Bibat — About Me | Cybersecurity & Web Development',
        desc: "Timothy Bibat's professional portfolio — aspiring cybersecurity professional, web developer, and UI/UX designer based in Calamba, Laguna. Learn more about my approach, skills, and background."
    },
    'tech-stack': {
        title: 'Timothy Bibat — Tech-Stack | Languages, Tools & Security',
        desc: "Browse Timothy Bibat's technical stack including programming languages like Python, C++, JavaScript, frameworks like Next.js, and cybersecurity tools like Kali Linux."
    },
    'portfolio': {
        title: 'Timothy Bibat — Portfolio & Projects | Software Engineering',
        desc: "Explore Timothy Bibat's web development, game design, API integrations, and mobile app projects including Capstone project ByaHero."
    },
    'cv': {
        title: 'Timothy Bibat — CV | Resume',
        desc: 'Timothy Bibat CV — aspiring cybersecurity professional, web developer, and UI/UX designer.'
    },
    'contact': {
        title: 'Timothy Bibat — Contact & Connect | Opportunities',
        desc: 'Get in touch with Timothy Bibat for opportunities in Web Development and Security. Send a direct message or connect via LinkedIn.'
    },
    '404': {
        title: 'Page Not Found | Timothy Bibat',
        desc: "The page you are looking for does not exist on Timothy Bibat's portfolio website."
    }
};

let hasLoadedOnce = false;

export function showLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) loader.classList.remove('hide');
}

export function hideLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) loader.classList.add('hide');
}

export function safeRenderPortfolio() {
    if (typeof window.renderPortfolio === 'function') {
        window.renderPortfolio();
    } else {
        const onModuleReady = () => {
            if (typeof window.renderPortfolio === 'function') {
                window.renderPortfolio();
            }
        };
        window.addEventListener('portfolioModuleReady', onModuleReady, { once: true });

        // Fallback polling in case event was fired before listener attached
        const checkInterval = setInterval(() => {
            if (typeof window.renderPortfolio === 'function') {
                clearInterval(checkInterval);
                window.removeEventListener('portfolioModuleReady', onModuleReady);
                window.renderPortfolio();
            }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 4000);
    }
}

export function handleRouting() {
    // Get current hash, remove '#' and trim
    let hash = window.location.hash.slice(1) || 'about';

    // If the hash is not valid, fallback to '404'
    if (!routes[hash]) {
        hash = '404';
    }

    const isInitialLoad = !hasLoadedOnce;
    hasLoadedOnce = true;

    // Load the corresponding page content
    loadPage(hash, isInitialLoad);

    // Update title and meta description dynamically
    document.title = routes[hash].title;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
        descMeta.setAttribute('content', routes[hash].desc);
    }

    // Update Open Graph and Twitter metadata dynamically for browser/client sharing completeness
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', routes[hash].title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', routes[hash].desc);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', routes[hash].title);
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', routes[hash].desc);

    // Update canonical link to point to this hash-route
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
        canonicalLink.setAttribute('href', `https://timbibat.github.io/#${hash}`);
    }

    // Sync active navigation link highlight
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${hash}`) {
            link.classList.remove('text-muted');
            link.classList.add('bg-primary', 'text-white');
        } else {
            link.classList.remove('bg-primary', 'text-white');
            link.classList.add('text-muted');
        }
    });
}

export function loadPage(content, isInitialLoad = false) {
    const maincontent = document.getElementById('maincontent');
    if (!maincontent) return;

    // Show loader
    showLoader();

    // Page exit animation
    maincontent.classList.add('page-exit');

    setTimeout(() => {
        fetch(`content/${content}.html`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(data => {
                maincontent.innerHTML = data;
                maincontent.classList.remove('page-exit');

                // Animate content children in
                const children = maincontent.querySelectorAll(':scope > div, :scope > section');
                children.forEach((child, i) => {
                    child.classList.add('animate-in');
                    child.style.animationDelay = `${i * 0.12}s`;
                });

                if (content === 'portfolio') {
                    safeRenderPortfolio();
                }

                // Update current year if elements exist
                const currentYear = new Date().getFullYear();
                maincontent.querySelectorAll('.current-year').forEach(el => {
                    el.textContent = currentYear;
                });

                // Scroll behavior on page change
                if (!isInitialLoad) {
                    if (window.innerWidth < 992) {
                        if (content === 'about') {
                            // On mobile, scroll to the very top (Profile Section) for "About Me"
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                            // On mobile, scroll to the top of the content card for other sections
                            maincontent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    } else {
                        // On desktop, scroll to the top of the window
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }

                // Hide loader after content is ready
                setTimeout(hideLoader, 600);
            })
            .catch(error => {
                console.error('Error fetching file:', error);
                maincontent.classList.remove('page-exit');
                hideLoader();
            });
    }, 300);
}

export function initRouter() {
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
}
