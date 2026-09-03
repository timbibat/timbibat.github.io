import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB8HS55P_6EMvYMPDiVR9oRT8KbgYrAfYg",
    authDomain: "portfolio-28018.firebaseapp.com",
    projectId: "portfolio-28018",
    storageBucket: "portfolio-28018.firebasestorage.app",
    messagingSenderId: "45925777575",
    appId: "1:45925777575:web:54062ce2b211d47cd99b82",
    measurementId: "G-8FES10Q3WZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global portfolio Details cache to avoid refetching on every tab switch
window.portfolioDetails = {
    majorProject: [],
    projects: [],
    activities: [],
    multimedia: [],
    certificates: []
};

// Tracking state for on-demand lazy rendering & pagination
const renderedTabs = new Set();
const renderedCounts = {
    projects: 0,
    activities: 0,
    multimedia: 0,
    certificates: 0
};
const BATCH_SIZE = 6;
const CACHE_PREFIX = 'portfolio_cache_';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes session TTL

/**
 * Read collection data from sessionStorage
 */
function getCachedData(colName) {
    try {
        const cached = sessionStorage.getItem(CACHE_PREFIX + colName);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_TTL_MS)) {
                return parsed.data;
            }
        }
    } catch (e) {
        console.warn('Session cache read error:', e);
    }
    return null;
}

/**
 * Save collection data to sessionStorage
 */
function setCachedData(colName, data) {
    try {
        sessionStorage.setItem(CACHE_PREFIX + colName, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));
    } catch (e) {
        console.warn('Session cache write error:', e);
    }
}

/**
 * Update tab count badges in UI
 */
function updateBadgeForCollection(colName) {
    const badgeMap = {
        majorProject: 'major-count',
        projects: 'projects-count',
        activities: 'activities-count',
        multimedia: 'multimedia-count',
        certificates: 'certificates-count'
    };
    const badgeId = badgeMap[colName];
    if (badgeId) {
        const count = window.portfolioDetails[colName]?.length || 0;
        const el = document.getElementById(badgeId);
        if (el) el.textContent = count;
    }
}

/**
 * Fetch a single Firestore collection on-demand with caching
 */
async function fetchCollectionData(colName) {
    if (window.portfolioDetails[colName] && window.portfolioDetails[colName].length > 0) {
        return window.portfolioDetails[colName];
    }

    const cached = getCachedData(colName);
    if (cached) {
        window.portfolioDetails[colName] = cached;
        updateBadgeForCollection(colName);
        return cached;
    }

    try {
        const snap = await getDocs(collection(db, colName));
        const data = snap.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))
            .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));

        window.portfolioDetails[colName] = data;
        setCachedData(colName, data);
        updateBadgeForCollection(colName);
        return data;
    } catch (error) {
        console.error(`Error fetching collection ${colName} from Firebase:`, error);
        return [];
    }
}

/**
 * Background idle prefetch for remaining collections (skips on data saver / slow networks)
 */
function scheduleBackgroundPrefetch() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')) {
        return; // Respect data saver & slow network constraints
    }

    const otherCols = ['projects', 'activities', 'multimedia', 'certificates'];
    const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));

    scheduleIdle(() => {
        otherCols.forEach(col => {
            if (!window.portfolioDetails[col] || window.portfolioDetails[col].length === 0) {
                fetchCollectionData(col);
            }
        });
    });
}

// Skeleton templates for data fetching states
function getMajorProjectSkeleton() {
    return `
    <div class="major-project-article animate-in">
        <div class="row align-items-center g-4 g-lg-5">
            <div class="col-lg-5">
                <div class="project-window-frame">
                    <div class="window-header-bar">
                        <div class="window-dots d-flex align-items-center gap-1">
                            <span class="window-dot rounded-circle d-inline-block dot-red"></span>
                            <span class="window-dot rounded-circle d-inline-block dot-yellow"></span>
                            <span class="window-dot rounded-circle d-inline-block dot-green"></span>
                        </div>
                        <div class="skeleton-box skeleton-pill-sm" style="width: 90px; height: 18px;"></div>
                    </div>
                    <div class="window-body-container skeleton-box skeleton-img-box w-100" style="height: 260px;"></div>
                </div>
            </div>
            <div class="col-lg-7">
                <div class="major-project-details text-start">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <div class="skeleton-box skeleton-pill" style="width: 100px; height: 26px;"></div>
                        <div class="skeleton-box skeleton-pill" style="width: 130px; height: 26px;"></div>
                    </div>
                    
                    <div class="skeleton-box skeleton-title mb-3" style="width: 65%; height: 32px;"></div>
                    
                    <div class="skeleton-box skeleton-line w-100 mb-2"></div>
                    <div class="skeleton-box skeleton-line w-100 mb-2"></div>
                    <div class="skeleton-box skeleton-line w-75 mb-4"></div>
                    
                    <div class="d-flex flex-wrap gap-2 mb-4">
                        <div class="skeleton-box skeleton-pill-sm" style="width: 75px;"></div>
                        <div class="skeleton-box skeleton-pill-sm" style="width: 85px;"></div>
                        <div class="skeleton-box skeleton-pill-sm" style="width: 70px;"></div>
                        <div class="skeleton-box skeleton-pill-sm" style="width: 90px;"></div>
                    </div>
                    
                    <div class="d-flex flex-wrap gap-2 pt-2">
                        <div class="skeleton-box skeleton-btn" style="width: 120px; height: 38px;"></div>
                        <div class="skeleton-box skeleton-btn" style="width: 100px; height: 38px;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function getCardSkeletons(count = 3) {
    return Array.from({ length: count }, (_, i) => `
    <div class="col animate-in" style="animation-delay: ${i * 0.08}s;">
        <div class="project-card h-100 rounded-4 overflow-hidden d-flex flex-column">
            <div class="skeleton-box skeleton-img-box w-100" style="height: 250px;"></div>
            <div class="card-body p-4 d-flex flex-column flex-grow-1">
                <div class="mb-3 d-flex flex-wrap gap-1">
                    <div class="skeleton-box skeleton-pill-sm" style="width: 70px;"></div>
                    <div class="skeleton-box skeleton-pill-sm" style="width: 55px;"></div>
                </div>
                <div class="skeleton-box skeleton-line mb-3" style="width: 75%; height: 20px;"></div>
                <div class="skeleton-box skeleton-line w-100 mb-2"></div>
                <div class="skeleton-box skeleton-line w-60 mb-4"></div>
                <div class="mt-auto d-flex gap-2">
                    <div class="skeleton-box skeleton-btn" style="width: 100px; height: 32px;"></div>
                    <div class="skeleton-box skeleton-btn" style="width: 80px; height: 32px;"></div>
                </div>
            </div>
        </div>
    </div>`).join('');
}

// Helper function to check if images are already cached/loaded
function checkLoadedImages(container) {
    if (!container) return;
    const images = container.querySelectorAll('img.img-lazy-load');
    images.forEach(img => {
        if (img.complete && img.naturalWidth !== 0) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
            img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
        }
    });
    // Fallback timeout for cached images where load event might not fire
    setTimeout(() => {
        images.forEach(img => {
            if (img.complete) img.classList.add('loaded');
        });
    }, 250);
}

// Helper function to render a project card with lazy image loading
function createProjectCard(proj, index) {
    const isLive = Boolean(proj.isLive === true || (proj.link && proj.link.trim() !== '' && proj.link !== '#' && proj.isLive !== false) || proj.status === 'live');
    const demoStatus = proj.link ? '' : 'disabled';
    const gitStatus = proj.git ? '' : 'disabled';
    
    // Live demo status indicator badge in card header
    const liveBadgeHTML = isLive ? `
        <div class="position-absolute top-0 end-0 m-3 z-2">
            <span class="badge rounded-pill live-status-badge d-inline-flex align-items-center" aria-label="Active Deployment: Live">
                <span class="live-pulse-dot me-1" aria-hidden="true"></span>Live
            </span>
        </div>` : '';

    // Handle multiple badges if present, otherwise use category
    let badgesHTML = '';
    if (proj.badges && proj.badges.length > 0) {
        badgesHTML = proj.badges.map((b, i) => {
            const colorClass = (proj.badgeColors && proj.badgeColors[i]) || 'bg-primary';
            return `<span class="badge ${colorClass}" style="font-size: 0.7rem; letter-spacing: 0.03em; margin-right: 4px;">${b}</span>`;
        }).join('');
    } else {
        badgesHTML = `<span class="badge" style="background: var(--primary-gradient); font-size: 0.7rem; letter-spacing: 0.03em;">${proj.category}</span>`;
    }

    return `
    <div class="col animate-in" style="animation-delay: ${(index % BATCH_SIZE) * 0.08}s;">
        <div class="project-card h-100 rounded-4 overflow-hidden position-relative">
            <div class="img-loading-wrapper position-relative overflow-hidden" style="height: 250px;">
                <img src="${proj.image}" loading="lazy" decoding="async" class="card-img-top img-lazy-load" alt="${proj.name}" style="height: 250px; object-fit: cover;" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
                ${liveBadgeHTML}
            </div>
            <div class="card-body p-4 d-flex flex-column">
                <div class="mb-3 d-flex flex-wrap gap-1">
                    ${badgesHTML}
                </div>
                <h5 class="card-title fw-bold text-dark mb-3">${proj.name}</h5>
                <p class="card-text text-muted mb-4">${proj.description}</p>
                <div class="mt-auto d-flex gap-2">
                    <a href="${proj.link || '#'}" class="btn btn-gradient text-white btn-sm fw-semibold ${demoStatus}" target="_blank">
                        <i class="fas fa-external-link-alt me-1"></i>Live Demo
                    </a>
                    <a href="${proj.git || '#'}" class="btn btn-outline-primary btn-sm ${gitStatus}" target="_blank">
                        <i class="fab fa-github me-1"></i>GitHub
                    </a>
                </div>
            </div>
        </div>
    </div>`;
}

// Helper function to render a multimedia card with lazy image loading
function createMultimediaCard(multi, index) {
    const multiIdStr = multi.id || multi.name;
    
    let badgesHTML = '';
    if (multi.badges && multi.badges.length > 0) {
        badgesHTML = multi.badges.map((b, i) => {
            const colorClass = (multi.badgeColors && multi.badgeColors[i]) || 'bg-primary';
            return `<span class="badge ${colorClass}" style="font-size: 0.7rem; letter-spacing: 0.03em; margin-right: 4px;">${b}</span>`;
        }).join('');
    } else {
        badgesHTML = `<span class="badge" style="background: var(--primary-gradient); font-size: 0.7rem; letter-spacing: 0.03em;">${multi.category}</span>`;
    }

    return `
    <div class="col animate-in" style="animation-delay: ${(index % BATCH_SIZE) * 0.08}s;">
        <div class="project-card h-100 rounded-4 overflow-hidden d-flex flex-column">
            <div class="img-loading-wrapper position-relative overflow-hidden" style="height: 250px; cursor: pointer;" onclick="showMediaModal('${multiIdStr}')">
                <img src="${multi.image}" loading="lazy" decoding="async" class="card-img-top img-lazy-load" alt="${multi.name}" style="height: 250px; object-fit: cover;" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
            </div>
            <div class="card-body p-4 d-flex flex-column flex-grow-1">
                <div class="mb-3 d-flex flex-wrap gap-1">
                    ${badgesHTML}
                </div>
                <h5 class="card-title fw-bold text-dark mb-3">${multi.name}</h5>
                <p class="card-text text-muted mb-4">${multi.description}</p>
                <div class="mt-auto d-flex gap-2">
                    <button type="button" class="btn btn-gradient text-white btn-sm fw-semibold w-100" onclick="showMediaModal('${multiIdStr}')">
                        <i class="fas fa-eye me-1"></i>Preview
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

// Helper function to render a certificate card with lazy image loading
function createCertificateCard(cert, index) {
    const certIdStr = cert.id || cert.name;
    
    let badgesHTML = '';
    if (cert.badges && cert.badges.length > 0) {
        badgesHTML = cert.badges.map((b, i) => {
            const colorClass = (cert.badgeColors && cert.badgeColors[i]) || 'bg-primary';
            return `<span class="badge ${colorClass}" style="font-size: 0.7rem; letter-spacing: 0.03em; margin-right: 4px;">${b}</span>`;
        }).join('');
    } else {
        badgesHTML = `<span class="badge" style="background: var(--primary-gradient); font-size: 0.7rem; letter-spacing: 0.03em;"><i class="fas fa-certificate me-1"></i>${cert.category}</span>`;
    }

    return `
    <div class="col animate-in" style="animation-delay: ${(index % BATCH_SIZE) * 0.08}s;">
        <div class="project-card h-100 rounded-4 overflow-hidden d-flex flex-column">
            <div class="img-loading-wrapper position-relative overflow-hidden" style="height: 230px; cursor: pointer;" onclick="showCertificateModal('${certIdStr}')">
                <img src="${cert.image}" loading="lazy" decoding="async" class="card-img-top img-lazy-load" alt="${cert.name}" style="height: 230px; object-fit: contain; padding: 12px; background: rgba(0,0,0,0.02);" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
            </div>
            <div class="card-body p-4 d-flex flex-column flex-grow-1">
                <div class="mb-3 d-flex flex-wrap gap-1">
                    ${badgesHTML}
                </div>
                <h5 class="card-title fw-bold text-dark mb-3">${cert.name}</h5>
                <p class="card-text text-muted mb-4">${cert.description}</p>
                <div class="mt-auto d-flex gap-2">
                    <button type="button" class="btn btn-gradient text-white btn-sm fw-semibold flex-grow-1" onclick="showCertificateModal('${certIdStr}')">
                        <i class="fas fa-eye me-1"></i>View Credential
                    </button>
                    ${cert.link ? `
                    <a href="${cert.link}" target="_blank" class="btn btn-outline-primary btn-sm fw-semibold" title="Verify Credential Online">
                        <i class="fas fa-check-circle me-1"></i>Verify
                    </a>` : ''}
                </div>
            </div>
        </div>
    </div>`;
}

/**
 * Render Major Projects Section
 */
function renderMajorProjectsTab() {
    const majorProjectContainer = document.getElementById("major-project-container");
    if (!majorProjectContainer) return;

    const majorProjects = window.portfolioDetails.majorProject || [];
    if (majorProjects.length === 0) {
        majorProjectContainer.innerHTML = `<div class="text-center text-muted py-5">No major projects configured yet.</div>`;
        return;
    }

    let majorHTML = '';
    majorProjects.forEach((majorProj, idx) => {
        const isMajorLive = Boolean(majorProj.isLive === true || (majorProj.link && majorProj.link.trim() !== '' && majorProj.link !== '#' && majorProj.isLive !== false) || majorProj.status === 'live');
        const demoStatus = majorProj.link ? '' : 'disabled';
        const gitStatus = majorProj.git ? '' : 'disabled';
        const projIdStr = majorProj.id || majorProj.name;

        let techStackArray = [];
        if (majorProj.badges && Array.isArray(majorProj.badges) && majorProj.badges.length > 0) {
            techStackArray = majorProj.badges;
        } else if (majorProj.tags && Array.isArray(majorProj.tags) && majorProj.tags.length > 0) {
            techStackArray = majorProj.tags;
        }

        let techPillsHTML = '';
        if (techStackArray.length > 0) {
            techPillsHTML = `
            <div class="d-flex flex-wrap gap-2 mb-4">
                ${techStackArray.map(t => `<span class="tech-pill d-inline-flex align-items-center gap-1 rounded-pill"><i class="fas fa-code me-1" style="font-size: 0.7rem;"></i>${t}</span>`).join('')}
            </div>`;
        }

        let highlightsArray = [];
        if (majorProj.highlights && Array.isArray(majorProj.highlights) && majorProj.highlights.length > 0) {
            highlightsArray = majorProj.highlights;
        } else if (majorProj.contributions && Array.isArray(majorProj.contributions) && majorProj.contributions.length > 0) {
            highlightsArray = majorProj.contributions.slice(0, 3);
        }

        let highlightsHTML = '';
        if (highlightsArray.length > 0) {
            highlightsHTML = `
            <div class="d-flex flex-wrap gap-2 mb-4">
                ${highlightsArray.map(h => `<div class="feature-highlight-item d-flex align-items-center gap-2 rounded-3"><i class="fas fa-check-circle"></i><span>${h}</span></div>`).join('')}
            </div>`;
        }

        majorHTML += `
        <div class="major-project-article animate-in ${idx > 0 ? 'mt-5' : ''}" onclick="showProjectModal('${projIdStr}')" style="cursor: pointer;">
            <div class="row align-items-center g-4 g-lg-5">
                <div class="col-lg-5">
                    <div class="project-window-frame">
                        <div class="window-header-bar">
                            <div class="window-dots d-flex align-items-center gap-1">
                                <span class="window-dot rounded-circle d-inline-block dot-red"></span>
                                <span class="window-dot rounded-circle d-inline-block dot-yellow"></span>
                                <span class="window-dot rounded-circle d-inline-block dot-green"></span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                ${isMajorLive ? `
                                <span class="badge rounded-pill live-status-badge d-inline-flex align-items-center" aria-label="Active Deployment: Live">
                                    <span class="live-pulse-dot me-1" aria-hidden="true"></span>Live
                                </span>` : ''}
                                <div class="window-title-badge text-uppercase d-flex align-items-center gap-1">
                                    <i class="fas fa-star text-warning"></i> Major Project
                                </div>
                            </div>
                        </div>
                        <div class="window-body-container img-loading-wrapper">
                            <img src="${majorProj.image}" loading="lazy" decoding="async" class="img-fluid img-lazy-load" alt="${majorProj.name}" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
                        </div>
                    </div>
                </div>
                <div class="col-lg-7">
                    <div class="major-project-details text-start">
                        <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                            <span class="badge" style="background: var(--primary-gradient); font-size: 0.78rem; padding: 6px 14px; border-radius: 50px;">
                                ${majorProj.category || 'Capstone'}
                            </span>
                            ${isMajorLive ? `
                            <span class="badge rounded-pill live-status-badge d-inline-flex align-items-center" aria-label="Active Deployment: Live">
                                <span class="live-pulse-dot me-1" aria-hidden="true"></span>Live
                            </span>` : ''}
                            <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25" style="font-size: 0.75rem; padding: 5px 12px; border-radius: 50px;">
                                <i class="fas fa-award me-1"></i> Featured Highlight
                            </span>
                        </div>
                        
                        <h2 class="display-6 fw-bold mb-3 glow-text">${majorProj.name}</h2>
                        
                        <p class="text-muted lead mb-4" style="line-height: 1.7; font-size: 1.05rem;">
                            ${majorProj.description || ''}
                        </p>
                        
                        ${techPillsHTML}
                        ${highlightsHTML}
                        
                        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-2">
                            <div class="d-flex flex-wrap gap-2">
                                <a href="${majorProj.link || '#'}" class="btn btn-gradient text-white px-4 py-2 fw-semibold ${demoStatus}" target="_blank" onclick="event.stopPropagation()">
                                    <i class="fas fa-external-link-alt me-2"></i>Live Demo
                                </a>
                                <a href="${majorProj.git || '#'}" class="btn btn-outline-primary px-4 py-2 fw-semibold ${gitStatus}" target="_blank" onclick="event.stopPropagation()">
                                    <i class="fab fa-github me-2"></i>GitHub
                                </a>
                            </div>
                            
                            <div class="read-more-trigger">
                                <span class="text-primary fw-bold" style="font-size: 0.95rem; cursor: pointer;">
                                    View Case Study <i class="fas fa-arrow-right ms-1"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    });

    majorProjectContainer.innerHTML = majorHTML;
    checkLoadedImages(majorProjectContainer);
}

/**
 * Render collection items in batches with Load More pagination
 */
function renderBatchForCollection(colName, containerId, createCardFn, emptyMessage, labelSingular) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = window.portfolioDetails[colName] || [];
    if (items.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-5">${emptyMessage}</div>`;
        return;
    }

    const currentCount = renderedCounts[colName] || 0;
    const isInitial = currentCount === 0;

    if (isInitial) {
        container.innerHTML = '';
    }

    const nextBatch = items.slice(currentCount, currentCount + BATCH_SIZE);
    let batchHTML = '';
    nextBatch.forEach((item, idx) => {
        batchHTML += createCardFn(item, currentCount + idx);
    });

    container.insertAdjacentHTML('beforeend', batchHTML);
    renderedCounts[colName] = currentCount + nextBatch.length;

    // Manage "Load More" button container
    const parentPane = container.closest('.tab-pane');
    if (parentPane) {
        let loadMoreWrapper = parentPane.querySelector('.load-more-wrapper');
        const remaining = items.length - renderedCounts[colName];

        if (remaining > 0) {
            if (!loadMoreWrapper) {
                loadMoreWrapper = document.createElement('div');
                loadMoreWrapper.className = 'd-flex flex-column align-items-center justify-content-center gap-2 py-4 animate-in load-more-wrapper';
                container.after(loadMoreWrapper);
            }
            loadMoreWrapper.innerHTML = `
                <button type="button" class="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-2 load-more-btn">
                    <i class="fas fa-plus load-more-icon"></i>
                    <span>Load More ${labelSingular}</span>
                </button>
                <span class="small text-muted fw-medium">Showing ${renderedCounts[colName]} of ${items.length} ${labelSingular.toLowerCase()}</span>
            `;
            const btn = loadMoreWrapper.querySelector('.load-more-btn');
            btn.onclick = () => {
                renderBatchForCollection(colName, containerId, createCardFn, emptyMessage, labelSingular);
            };
        } else {
            if (loadMoreWrapper) {
                if (items.length > BATCH_SIZE) {
                    loadMoreWrapper.innerHTML = `
                        <div class="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-3 py-2 fw-normal d-inline-flex align-items-center gap-2">
                            <i class="fas fa-check-circle text-success"></i>
                            <span>All ${items.length} ${labelSingular.toLowerCase()} loaded</span>
                        </div>
                    `;
                } else {
                    loadMoreWrapper.remove();
                }
            }
        }
    }

    checkLoadedImages(container);
}

/**
 * Render a specific tab pane on demand
 */
async function renderTabByTarget(targetId) {
    if (!targetId) return;
    const tabName = targetId.replace('#', '').replace('-pane', '');

    if (renderedTabs.has(tabName)) return; // Already loaded & rendered

    if (tabName === 'major-project' || tabName === 'major') {
        const container = document.getElementById('major-project-container');
        if (container && (!window.portfolioDetails.majorProject || window.portfolioDetails.majorProject.length === 0)) {
            container.innerHTML = getMajorProjectSkeleton();
        }
        await fetchCollectionData('majorProject');
        renderMajorProjectsTab();
        renderedTabs.add('major-project');
    } else if (tabName === 'projects') {
        const container = document.getElementById('projects-container');
        if (container && (!window.portfolioDetails.projects || window.portfolioDetails.projects.length === 0)) {
            container.innerHTML = getCardSkeletons(3);
        }
        await fetchCollectionData('projects');
        renderBatchForCollection('projects', 'projects-container', createProjectCard, 'No projects found.', 'Projects');
        renderedTabs.add('projects');
    } else if (tabName === 'activities') {
        const container = document.getElementById('activities-container');
        if (container && (!window.portfolioDetails.activities || window.portfolioDetails.activities.length === 0)) {
            container.innerHTML = getCardSkeletons(3);
        }
        await fetchCollectionData('activities');
        renderBatchForCollection('activities', 'activities-container', createProjectCard, 'No activities found.', 'Activities');
        renderedTabs.add('activities');
    } else if (tabName === 'multimedia') {
        const container = document.getElementById('multimedia-container');
        if (container && (!window.portfolioDetails.multimedia || window.portfolioDetails.multimedia.length === 0)) {
            container.innerHTML = getCardSkeletons(3);
        }
        await fetchCollectionData('multimedia');
        renderBatchForCollection('multimedia', 'multimedia-container', createMultimediaCard, 'No multimedia projects available yet.', 'Media');
        renderedTabs.add('multimedia');
    } else if (tabName === 'certificates') {
        const container = document.getElementById('certificates-container');
        if (container && (!window.portfolioDetails.certificates || window.portfolioDetails.certificates.length === 0)) {
            container.innerHTML = getCardSkeletons(3);
        }
        await fetchCollectionData('certificates');
        renderBatchForCollection('certificates', 'certificates-container', createCertificateCard, 'No certificates added yet.', 'Certificates');
        renderedTabs.add('certificates');
    }
}

/**
 * Attach Bootstrap tab change event listeners
 */
function setupTabListeners() {
    const tabButtons = document.querySelectorAll('#portfolioTabs button[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
        if (!button.dataset.listenerAttached) {
            button.dataset.listenerAttached = 'true';
            button.addEventListener('shown.bs.tab', (event) => {
                const target = event.target.getAttribute('data-bs-target');
                renderTabByTarget(target);
            });
        }
    });
}

/**
 * Update tab counts from cache or initial fetch
 */
function updateAllTabCounts() {
    const cols = ['majorProject', 'projects', 'activities', 'multimedia', 'certificates'];
    cols.forEach(col => {
        if (window.portfolioDetails[col] && window.portfolioDetails[col].length > 0) {
            updateBadgeForCollection(col);
        } else {
            const cached = getCachedData(col);
            if (cached) {
                window.portfolioDetails[col] = cached;
                updateBadgeForCollection(col);
            }
        }
    });
}

/**
 * Main Portfolio Entry Point (Called by Router when #portfolio route loads)
 */
window.renderPortfolio = async function() {
    const portfolioTabs = document.getElementById("portfolioTabs");
    const majorProjectContainer = document.getElementById("major-project-container");
    if (!portfolioTabs || !majorProjectContainer) return;

    // Reset tracking state for current page instance
    renderedTabs.clear();
    renderedCounts.projects = 0;
    renderedCounts.activities = 0;
    renderedCounts.multimedia = 0;
    renderedCounts.certificates = 0;

    // Clean up existing load more wrappers if any
    document.querySelectorAll('#portfolioTabContent .load-more-wrapper').forEach(el => el.remove());

    // Setup Tab Change Listeners
    setupTabListeners();

    // 1. Determine currently active tab (default: #major-project-pane)
    const activeTabBtn = portfolioTabs.querySelector('.nav-link.active');
    const activeTabTarget = activeTabBtn ? activeTabBtn.getAttribute('data-bs-target') : '#major-project-pane';

    // 2. Fetch and render active tab immediately
    renderTabByTarget(activeTabTarget);

    // 3. Update tab counts and schedule idle background prefetch
    updateAllTabCounts();
    scheduleBackgroundPrefetch();
};

window.showProjectModal = function(projIdentifier) {
    const majorProjects = window.portfolioDetails.majorProject || [];
    let majorProj = null;

    if (projIdentifier) {
        majorProj = majorProjects.find(p => p.id === projIdentifier || p.name === projIdentifier);
    }
    if (!majorProj && majorProjects.length > 0) {
        majorProj = majorProjects[0];
    }
    const modalContent = document.getElementById('modal-content-area');
    
    if (modalContent && majorProj) {
        let contributionsHTML = (majorProj.contributions || []).map(c => 
            `<li class="mb-3 d-flex align-items-start">
                <i class="fas fa-check-circle text-primary mt-1 me-3"></i>
                <span>${c}</span>
            </li>`
        ).join('');

        let imagesList = [];
        if (majorProj.images && Array.isArray(majorProj.images) && majorProj.images.length > 0) {
            imagesList = majorProj.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
        }
        if (imagesList.length === 0 && majorProj.image) {
            imagesList = [majorProj.image];
        }

        const hasMultiple = imagesList.length > 1;

        let carouselItems = "";
        let carouselIndicators = "";
        
        imagesList.forEach((img, idx) => {
            carouselItems += `
                <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                    <div class="img-loading-wrapper position-relative rounded-4 overflow-hidden" style="height: 400px;">
                        <img src="${img}" loading="lazy" decoding="async" class="d-block w-100 rounded-4 shadow-sm img-lazy-load" style="height: 400px; object-fit: contain; background: rgba(0,0,0,0.03);" alt="${majorProj.name} - image ${idx + 1}" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
                    </div>
                </div>
            `;
            if (hasMultiple) {
                carouselIndicators += `
                    <button type="button" data-bs-target="#projectCarousel" data-bs-slide-to="${idx}" class="${idx === 0 ? 'active' : ''}" aria-current="${idx === 0 ? 'true' : 'false'}" aria-label="Slide ${idx + 1}"></button>
                `;
            }
        });

        modalContent.innerHTML = `
            <div class="row g-4">
                <div class="col-12 mb-4">
                    <div id="projectCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="3500">
                        ${hasMultiple ? `
                        <div class="carousel-indicators">
                            ${carouselIndicators}
                        </div>` : ''}
                        <div class="carousel-inner">
                            ${carouselItems}
                        </div>
                        ${hasMultiple ? `
                        <button class="carousel-control-prev" type="button" data-bs-target="#projectCarousel" data-bs-slide="prev" aria-label="Previous">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#projectCarousel" data-bs-slide="next" aria-label="Next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>` : ''}
                    </div>
                </div>
                <div class="col-12">
                    <div class="d-flex flex-column flex-md-row align-items-md-center align-items-start mb-3">
                        <h2 class="display-5 fw-bold mb-0">${majorProj.name}</h2>
                        <div class="mt-2 mt-md-0 ms-md-3 d-flex flex-wrap align-items-center gap-2">
                            <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2">${majorProj.category || 'Major Project'}</span>
                            ${(Boolean(majorProj.isLive === true || (majorProj.link && majorProj.link.trim() !== '' && majorProj.link !== '#' && majorProj.isLive !== false) || majorProj.status === 'live')) ? `
                            <span class="badge rounded-pill live-status-badge d-inline-flex align-items-center px-3 py-2" aria-label="Active Deployment: Live">
                                <span class="live-pulse-dot me-1" aria-hidden="true"></span>Live
                            </span>` : ''}
                        </div>
                    </div>
                    <p class="lead text-muted mb-5" style="line-height: 1.8;">${majorProj.fullDescription || majorProj.description || ''}</p>
                    
                    ${contributionsHTML ? `
                    <h4 class="fw-bold mb-4">Key Contributions</h4>
                    <ul class="list-unstyled mb-5">
                        ${contributionsHTML}
                    </ul>` : ''}
                    
                    <div class="d-flex gap-3">
                        <a href="${majorProj.link || '#'}" class="btn btn-gradient text-white px-4 py-2 fw-semibold ${majorProj.link ? '' : 'disabled'}" target="_blank">
                            <i class="fas fa-external-link-alt me-2"></i>Live Demo
                        </a>
                        <a href="${majorProj.git || '#'}" class="btn btn-outline-primary px-4 py-2 ${majorProj.git ? '' : 'disabled'}" target="_blank">
                            <i class="fab fa-github me-2"></i>GitHub
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        modalContent.querySelectorAll('img.img-lazy-load').forEach(img => {
            if (img.complete && img.naturalWidth !== 0) {
                img.classList.add('loaded');
            }
        });

        const modalEl = document.getElementById('projectModal');
        if (modalEl) {
            const myModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            myModal.show();
        }

        const carouselEl = document.getElementById('projectCarousel');
        if (carouselEl && hasMultiple) {
            const carouselInstance = bootstrap.Carousel.getOrCreateInstance(carouselEl, {
                interval: 3500,
                ride: 'carousel',
                wrap: true,
                touch: true
            });
            carouselInstance.cycle();
        }
    }
};

window.showMediaModal = function(mediaIdentifier) {
    const multimediaList = window.portfolioDetails.multimedia || [];
    let item = null;

    if (mediaIdentifier) {
        item = multimediaList.find(p => p.id === mediaIdentifier || p.name === mediaIdentifier);
    }
    if (!item && multimediaList.length > 0) {
        item = multimediaList[0];
    }
    const modalContent = document.getElementById('media-modal-content-area');
    
    if (modalContent && item) {
        let badgesHTML = '';
        if (item.badges && item.badges.length > 0) {
            badgesHTML = item.badges.map((b, i) => {
                const colorClass = (item.badgeColors && item.badgeColors[i]) || 'bg-primary';
                return `<span class="badge ${colorClass}" style="font-size: 0.75rem; letter-spacing: 0.03em; margin-right: 4px;">${b}</span>`;
            }).join('');
        }

        modalContent.innerHTML = `
            <div class="row g-4">
                <div class="col-12">
                    <div class="img-loading-wrapper position-relative rounded-4 overflow-hidden text-center" style="max-height: 500px;">
                        <img src="${item.image}" loading="lazy" decoding="async" class="img-fluid rounded-4 shadow-sm img-lazy-load" style="max-height: 500px; width: 100%; object-fit: contain;" alt="${item.name}" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
                    </div>
                </div>
                <div class="col-12">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <span class="badge" style="background: var(--primary-gradient); font-size: 0.78rem; padding: 6px 14px; border-radius: 50px;">
                            ${item.category || 'Multimedia'}
                        </span>
                        ${badgesHTML}
                    </div>
                    
                    <h2 class="display-6 fw-bold mb-3 glow-text">${item.name}</h2>
                    
                    <p class="text-muted lead mb-4" style="line-height: 1.8; font-size: 1.05rem;">
                        ${item.fullDescription || item.description || ''}
                    </p>
                    
                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-2">
                        <div class="d-flex flex-wrap gap-2">
                            ${item.link ? `
                            <a href="${item.link}" target="_blank" class="btn btn-gradient text-white btn-sm px-4 py-2 fw-semibold">
                                <i class="fas fa-external-link-alt me-2"></i>External Link
                            </a>` : ''}
                        </div>
                        <button type="button" class="btn btn-secondary btn-sm px-4 py-2 rounded-pill" data-bs-dismiss="modal">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modalContent.querySelectorAll('img.img-lazy-load').forEach(img => {
            if (img.complete && img.naturalWidth !== 0) {
                img.classList.add('loaded');
            }
        });

        const modalEl = document.getElementById('mediaModal');
        if (modalEl) {
            const myModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            myModal.show();
        }
    }
};

window.showCertificateModal = function(certIdentifier) {
    const certsList = window.portfolioDetails.certificates || [];
    let item = null;

    if (certIdentifier) {
        item = certsList.find(p => p.id === certIdentifier || p.name === certIdentifier);
    }
    if (!item && certsList.length > 0) {
        item = certsList[0];
    }
    const modalContent = document.getElementById('certificate-modal-content-area');
    
    if (modalContent && item) {
        let badgesHTML = '';
        if (item.badges && item.badges.length > 0) {
            badgesHTML = item.badges.map((b, i) => {
                const colorClass = (item.badgeColors && item.badgeColors[i]) || 'bg-primary';
                return `<span class="badge ${colorClass}" style="font-size: 0.75rem; letter-spacing: 0.03em; margin-right: 4px;">${b}</span>`;
            }).join('');
        }

        modalContent.innerHTML = `
            <div class="row g-4">
                <div class="col-12">
                    <div class="img-loading-wrapper position-relative rounded-4 overflow-hidden text-center p-3" style="max-height: 520px; background: rgba(0,0,0,0.03);">
                        <img src="${item.image}" loading="lazy" decoding="async" class="img-fluid rounded-4 shadow-sm img-lazy-load" style="max-height: 480px; width: 100%; object-fit: contain;" alt="${item.name}" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
                    </div>
                </div>
                <div class="col-12">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <span class="badge" style="background: var(--primary-gradient); font-size: 0.78rem; padding: 6px 14px; border-radius: 50px;">
                            <i class="fas fa-certificate me-1"></i>${item.category || 'Certificate'}
                        </span>
                        ${badgesHTML}
                    </div>
                    
                    <h2 class="display-6 fw-bold mb-3 glow-text">${item.name}</h2>
                    
                    <p class="text-muted lead mb-4" style="line-height: 1.8; font-size: 1.05rem;">
                        ${item.fullDescription || item.description || ''}
                    </p>
                    
                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-2">
                        <div class="d-flex flex-wrap gap-2">
                            ${item.link ? `
                            <a href="${item.link}" target="_blank" class="btn btn-gradient text-white btn-sm px-4 py-2 fw-semibold">
                                <i class="fas fa-external-link-alt me-2"></i>Verify Credential
                            </a>` : ''}
                        </div>
                        <button type="button" class="btn btn-secondary btn-sm px-4 py-2 rounded-pill" data-bs-dismiss="modal">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modalContent.querySelectorAll('img.img-lazy-load').forEach(img => {
            if (img.complete && img.naturalWidth !== 0) {
                img.classList.add('loaded');
            }
        });

        const modalEl = document.getElementById('certificateModal');
        if (modalEl) {
            const myModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            myModal.show();
        }
    }
};

// Notify system that module is ready
window.dispatchEvent(new CustomEvent('portfolioModuleReady'));

// If portfolio content container is already in the DOM, trigger render
if (document.getElementById("projects-container") || document.getElementById("major-project-container")) {
    window.renderPortfolio();
}