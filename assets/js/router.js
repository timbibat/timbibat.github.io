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

// In-memory HTML fragment cache to eliminate redundant network requests
const fragmentCache = new Map();
let hasLoadedOnce = false;

/**
 * Fetch HTML fragment with caching
 */
export async function fetchFragment(content) {
    if (fragmentCache.has(content)) {
        return fragmentCache.get(content);
    }
    const response = await fetch(`content/${content}.html?v=8`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    fragmentCache.set(content, html);
    return html;
}

/**
 * Background prefetch all remaining page fragments during idle browser time
 */
export function prefetchFragments() {
    // Respect mobile data saver mode and avoid aggressive prefetching on slow networks
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')) {
        return;
    }

    const routeKeys = Object.keys(routes).filter(k => k !== '404');
    const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));

    scheduleIdle(() => {
        routeKeys.forEach(route => {
            if (!fragmentCache.has(route)) {
                fetchFragment(route).catch(() => {});
            }
        });
    });
}

export function showLoader() {
    const loader = document.getElementById('pageLoader');
    const maincontent = document.getElementById('maincontent');
    if (loader) {
        loader.classList.remove('d-none');
        loader.classList.remove('hide');
    }
    if (maincontent) {
        maincontent.classList.add('d-none');
    }
}

export function hideLoader() {
    const loader = document.getElementById('pageLoader');
    const maincontent = document.getElementById('maincontent');
    if (loader) {
        loader.classList.add('d-none');
        loader.classList.add('hide');
    }
    if (maincontent) {
        maincontent.classList.remove('d-none');
    }
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

    // Ensure canonical link points to root canonical URL without hash fragments (RFC & Search Engine Standard)
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
        canonicalLink.setAttribute('href', 'https://timbibat.me/');
    }

    // Sync active navigation link highlight and accessibility attribute
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${hash}`) {
            link.classList.remove('text-muted');
            link.classList.add('bg-primary', 'text-white');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('bg-primary', 'text-white');
            link.classList.add('text-muted');
            link.removeAttribute('aria-current');
        }
    });
}

export async function loadPage(content, isInitialLoad = false) {
    const maincontent = document.getElementById('maincontent');
    if (!maincontent) return;

    const isCached = fragmentCache.has(content);

    // Only show skeleton loader if content is not already cached
    if (!isCached) {
        showLoader();
    }

    try {
        const data = await fetchFragment(content);
        maincontent.innerHTML = data;

        // Hide skeleton loader and reveal content
        hideLoader();

        // Animate content children in
        const children = maincontent.querySelectorAll(':scope > div, :scope > section');
        children.forEach((child, i) => {
            child.classList.add('animate-in');
            child.style.animationDelay = `${i * 0.06}s`;
        });

        if (content === 'portfolio') {
            safeRenderPortfolio();
        } else if (content === 'tech-stack') {
            initTechStackFilter();
        }

        // Update current year if elements exist
        const currentYear = new Date().getFullYear();
        maincontent.querySelectorAll('.current-year').forEach(el => {
            el.textContent = currentYear;
        });

        // Trigger background prefetching after initial load
        if (isInitialLoad) {
            prefetchFragments();
        }

        // Scroll behavior on page change
        if (!isInitialLoad) {
            if (window.innerWidth < 992) {
                if (content === 'about') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    maincontent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error('Error fetching file:', error);
        hideLoader();
    }
}

export function initTechStackFilter() {
    const filterBtns = document.querySelectorAll('.tech-filter-btn');
    const searchInput = document.getElementById('techSearchInput');
    const clearBtn = document.getElementById('techSearchClear');
    const resetBtn = document.getElementById('resetTechFilterBtn');
    const emptyState = document.getElementById('techEmptyState');
    const categories = document.querySelectorAll('.tech-category-col');
    const items = document.querySelectorAll('.tech-item');

    if (!filterBtns.length || !items.length) return;

    let activeFilter = 'all';
    let searchQuery = '';

    function applyFilter() {
        let totalVisible = 0;

        categories.forEach(catCol => {
            const catType = catCol.getAttribute('data-category');
            const isCatActive = (activeFilter === 'all' || activeFilter === catType);
            const catItems = catCol.querySelectorAll('.tech-item');
            let catVisibleCount = 0;

            catItems.forEach(item => {
                const itemName = (item.getAttribute('data-name') || '').toLowerCase();
                const matchesSearch = !searchQuery || itemName.includes(searchQuery);

                if (isCatActive && matchesSearch) {
                    item.style.display = '';
                    catVisibleCount++;
                    totalVisible++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (catVisibleCount > 0) {
                catCol.style.display = '';
            } else {
                catCol.style.display = 'none';
            }
        });

        if (emptyState) {
            if (totalVisible === 0) {
                emptyState.classList.remove('d-none');
            } else {
                emptyState.classList.add('d-none');
            }
        }
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter') || 'all';
            applyFilter();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            if (clearBtn) {
                if (searchQuery.length > 0) {
                    clearBtn.classList.remove('d-none');
                } else {
                    clearBtn.classList.add('d-none');
                }
            }
            applyFilter();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchQuery = '';
                clearBtn.classList.add('d-none');
                applyFilter();
                searchInput.focus();
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            activeFilter = 'all';
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            if (clearBtn) clearBtn.classList.add('d-none');
            filterBtns.forEach(b => {
                if (b.getAttribute('data-filter') === 'all') {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
            applyFilter();
        });
    }
}

export function initRouter() {
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
}
