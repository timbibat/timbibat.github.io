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
    majorProject: null,
    projects: [],
    activities: [],
    multimedia: [],
    certificates: []
};
let isDataLoaded = false;

// Skeleton templates for data fetching states
function getMajorProjectSkeleton() {
    return `
    <div class="major-project-article animate-in">
        <div class="row align-items-center g-4 g-lg-5">
            <div class="col-lg-5">
                <div class="project-window-frame">
                    <div class="window-header-bar">
                        <div class="window-dots">
                            <span class="window-dot dot-red"></span>
                            <span class="window-dot dot-yellow"></span>
                            <span class="window-dot dot-green"></span>
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

window.renderPortfolio = async function() {
    const majorProjectContainer = document.getElementById("major-project-container");
    const activitiesContainer = document.getElementById("activities-container");
    const projectsContainer = document.getElementById("projects-container");
    const multimediaContainer = document.getElementById("multimedia-container");
    const certificatesContainer = document.getElementById("certificates-container");

    if (activitiesContainer && projectsContainer && multimediaContainer && certificatesContainer) {
        // Show skeleton loading state while fetching data
        if (!isDataLoaded) {
            if (majorProjectContainer) majorProjectContainer.innerHTML = getMajorProjectSkeleton();
            activitiesContainer.innerHTML = getCardSkeletons(3);
            projectsContainer.innerHTML = getCardSkeletons(3);
            multimediaContainer.innerHTML = getCardSkeletons(3);
            certificatesContainer.innerHTML = getCardSkeletons(3);
            
            try {
                // Fetch all collections in parallel for maximum speed
                const collections = ['majorProject', 'projects', 'activities', 'multimedia', 'certificates'];
                await Promise.all(collections.map(async (col) => {
                    const snap = await getDocs(collection(db, col));
                    window.portfolioDetails[col] = snap.docs
                        .map(doc => ({ ...doc.data(), id: doc.id }))
                        .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
                }));
                
                isDataLoaded = true;
            } catch (error) {
                console.error("Error fetching portfolio data from Firebase:", error);
                if (majorProjectContainer) majorProjectContainer.innerHTML = `<div class="alert alert-danger">Failed to load data. Please try again later.</div>`;
                return;
            }
        }

        // Clear loading state
        if (majorProjectContainer) majorProjectContainer.innerHTML = '';

        // Helper function to check if images are already cached/loaded
        const checkLoadedImages = (container) => {
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
            // Fallback timeout for WebKit/Safari cached images where load event might not fire
            setTimeout(() => {
                images.forEach(img => img.classList.add('loaded'));
            }, 300);
        };

        // Helper function to render a project card
        const createProjectCard = (proj, index) => {
            const demoStatus = proj.link ? '' : 'disabled';
            const gitStatus = proj.git ? '' : 'disabled';
            
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
            <div class="col animate-in" style="animation-delay: ${index * 0.1}s;">
                <div class="project-card h-100 rounded-4 overflow-hidden">
                    <div class="img-loading-wrapper position-relative overflow-hidden" style="height: 250px;">
                        <img src="${proj.image}" class="card-img-top img-lazy-load" alt="${proj.name}" style="height: 250px; object-fit: cover;" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
                    </div>
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="mb-3 d-flex flex-wrap gap-1">
                            ${badgesHTML}
                        </div>
                        <h5 class="card-title fw-bold text-dark mb-3">${proj.name}</h5>
                        <p class="card-text text-muted mb-4">${proj.description}</p>
                        <div class="mt-auto d-flex gap-2">
                            <a href="${proj.link}" class="btn btn-gradient text-white btn-sm fw-semibold ${demoStatus}" target="_blank">
                                <i class="fas fa-external-link-alt me-1"></i>Live Demo
                            </a>
                            <a href="${proj.git}" class="btn btn-outline-primary btn-sm ${gitStatus}" target="_blank">
                                <i class="fab fa-github me-1"></i>GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
        };

        // Helper function to render a multimedia card
        const createMultimediaCard = (multi, index) => {
            const multiIdStr = multi.id || multi.name;
            
            // Handle multiple badges if present, otherwise use category
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
            <div class="col animate-in" style="animation-delay: ${index * 0.1}s;">
                <div class="project-card h-100 rounded-4 overflow-hidden d-flex flex-column">
                    <div class="img-loading-wrapper position-relative overflow-hidden" style="height: 250px; cursor: pointer;" onclick="showMediaModal('${multiIdStr}')">
                        <img src="${multi.image}" class="card-img-top img-lazy-load" alt="${multi.name}" style="height: 250px; object-fit: cover;" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
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
        };

        // Helper function to render a certificate card
        const createCertificateCard = (cert, index) => {
            const certIdStr = cert.id || cert.name;
            
            // Handle multiple badges if present, otherwise use category
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
            <div class="col animate-in" style="animation-delay: ${index * 0.1}s;">
                <div class="project-card h-100 rounded-4 overflow-hidden d-flex flex-column">
                    <div class="img-loading-wrapper position-relative overflow-hidden" style="height: 230px; cursor: pointer;" onclick="showCertificateModal('${certIdStr}')">
                        <img src="${cert.image}" class="card-img-top img-lazy-load" alt="${cert.name}" style="height: 230px; object-fit: contain; padding: 12px; background: rgba(0,0,0,0.02);" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
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
        };
        
        // Render Major Projects
        const majorProjects = window.portfolioDetails.majorProject || [];
        if (majorProjectContainer) {
            if (majorProjects.length === 0) {
                majorProjectContainer.innerHTML = `<div class="text-center text-muted py-5">No major projects configured yet.</div>`;
            } else {
                let majorHTML = '';
                majorProjects.forEach((majorProj, idx) => {
                    const demoStatus = majorProj.link ? '' : 'disabled';
                    const gitStatus = majorProj.git ? '' : 'disabled';
                    const projIdStr = majorProj.id || majorProj.name;

                    // Dynamically read tech stack badges from Firebase Firestore (badges or tags array)
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
                            ${techStackArray.map(t => `<span class="tech-pill"><i class="fas fa-code me-1" style="font-size: 0.7rem;"></i>${t}</span>`).join('')}
                        </div>`;
                    }

                    // Dynamically read key highlights from Firebase Firestore (highlights or contributions array)
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
                            ${highlightsArray.map(h => `<div class="feature-highlight-item"><i class="fas fa-check-circle"></i><span>${h}</span></div>`).join('')}
                        </div>`;
                    }

                    majorHTML += `
                    <div class="major-project-article animate-in ${idx > 0 ? 'mt-5' : ''}" onclick="showProjectModal('${projIdStr}')" style="cursor: pointer;">
                        <div class="row align-items-center g-4 g-lg-5">
                            <div class="col-lg-5">
                                <div class="project-window-frame">
                                    <div class="window-header-bar">
                                        <div class="window-dots">
                                            <span class="window-dot dot-red"></span>
                                            <span class="window-dot dot-yellow"></span>
                                            <span class="window-dot dot-green"></span>
                                        </div>
                                        <div class="window-title-badge">
                                            <i class="fas fa-star text-warning"></i> Major Project
                                        </div>
                                    </div>
                                    <div class="window-body-container img-loading-wrapper">
                                        <img src="${majorProj.image}" class="img-fluid img-lazy-load" alt="${majorProj.name}" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-7">
                                <div class="major-project-details text-start">
                                    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                                        <span class="badge" style="background: var(--primary-gradient); font-size: 0.78rem; padding: 6px 14px; border-radius: 50px;">
                                            ${majorProj.category}
                                        </span>
                                        <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25" style="font-size: 0.75rem; padding: 5px 12px; border-radius: 50px;">
                                            <i class="fas fa-award me-1"></i> Featured Highlight
                                        </span>
                                    </div>
                                    
                                    <h2 class="display-6 fw-bold mb-3 glow-text">${majorProj.name}</h2>
                                    
                                    <p class="text-muted lead mb-4" style="line-height: 1.7; font-size: 1.05rem;">
                                        ${majorProj.description}
                                    </p>
                                    
                                    <!-- Tech Stack Pills -->
                                    ${techPillsHTML}
                                    
                                    <!-- Highlights Grid -->
                                    ${highlightsHTML}
                                    
                                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-2">
                                        <div class="d-flex flex-wrap gap-2">
                                            <a href="${majorProj.link}" class="btn btn-gradient text-white px-4 py-2 fw-semibold ${demoStatus}" target="_blank" onclick="event.stopPropagation()">
                                                <i class="fas fa-external-link-alt me-2"></i>Live Demo
                                            </a>
                                            <a href="${majorProj.git}" class="btn btn-outline-primary px-4 py-2 fw-semibold ${gitStatus}" target="_blank" onclick="event.stopPropagation()">
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
            }
        }

        // Render Projects
        if (window.portfolioDetails.projects) {
            let projectsHTML = '';
            window.portfolioDetails.projects.forEach((proj, index) => {
                projectsHTML += createProjectCard(proj, index);
            });
            projectsContainer.innerHTML = projectsHTML;
        }

        // Render Activities
        if (window.portfolioDetails.activities) {
            let activitiesHTML = '';
            window.portfolioDetails.activities.forEach((act, index) => {
                activitiesHTML += createProjectCard(act, index);
            });
            activitiesContainer.innerHTML = activitiesHTML;
        }

        // Render Multimedia
        if (window.portfolioDetails.multimedia) {
            if (window.portfolioDetails.multimedia.length === 0) {
                multimediaContainer.innerHTML = `<div class="col-12 text-center text-muted py-5">No multimedia projects available yet.</div>`;
            } else {
                let multimediaHTML = '';
                window.portfolioDetails.multimedia.forEach((multi, index) => {
                    multimediaHTML += createMultimediaCard(multi, index);
                });
                multimediaContainer.innerHTML = multimediaHTML;
            }
        }

        // Render Certificates
        if (window.portfolioDetails.certificates) {
            if (window.portfolioDetails.certificates.length === 0) {
                certificatesContainer.innerHTML = `<div class="col-12 text-center text-muted py-5">No certificates added yet.</div>`;
            } else {
                let certsHTML = '';
                window.portfolioDetails.certificates.forEach((cert, index) => {
                    certsHTML += createCertificateCard(cert, index);
                });
                certificatesContainer.innerHTML = certsHTML;
            }
        }

        // Update tab counter badges
        const setBadge = (id, count) => {
            const el = document.getElementById(id);
            if (el) el.textContent = count;
        };
        setBadge('major-count', window.portfolioDetails.majorProject?.length || 1);
        setBadge('projects-count', window.portfolioDetails.projects?.length || 0);
        setBadge('activities-count', window.portfolioDetails.activities?.length || 0);
        setBadge('multimedia-count', window.portfolioDetails.multimedia?.length || 0);
        setBadge('certificates-count', window.portfolioDetails.certificates?.length || 0);

        // Check already loaded / cached images
        checkLoadedImages(document.getElementById("portfolioTabContent"));
    }
}

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

        // Prepare image list from images array or fallback to main image
        let imagesList = [];
        if (majorProj.images && Array.isArray(majorProj.images) && majorProj.images.length > 0) {
            imagesList = majorProj.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
        }
        if (imagesList.length === 0 && majorProj.image) {
            imagesList = [majorProj.image];
        }

        const hasMultiple = imagesList.length > 1;

        // Prepare Carousel HTML
        let carouselItems = "";
        let carouselIndicators = "";
        
        imagesList.forEach((img, idx) => {
            carouselItems += `
                <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                    <div class="img-loading-wrapper position-relative rounded-4 overflow-hidden" style="height: 400px;">
                        <img src="${img}" class="d-block w-100 rounded-4 shadow-sm img-lazy-load" style="height: 400px; object-fit: contain; background: rgba(0,0,0,0.03);" alt="${majorProj.name} - image ${idx + 1}" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
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
                        <span class="mt-2 mt-md-0 ms-md-3 badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2">${majorProj.category}</span>
                    </div>
                    <p class="lead text-muted mb-5" style="line-height: 1.8;">${majorProj.fullDescription || majorProj.description || ''}</p>
                    
                    ${contributionsHTML ? `
                    <h4 class="fw-bold mb-4">Key Contributions</h4>
                    <ul class="list-unstyled mb-5">
                        ${contributionsHTML}
                    </ul>` : ''}
                    
                    <div class="d-flex gap-3">
                        <a href="${majorProj.link}" class="btn btn-gradient text-white px-4 py-2 fw-semibold ${majorProj.link ? '' : 'disabled'}" target="_blank">
                            <i class="fas fa-external-link-alt me-2"></i>Live Demo
                        </a>
                        <a href="${majorProj.git}" class="btn btn-outline-primary px-4 py-2 ${majorProj.git ? '' : 'disabled'}" target="_blank">
                            <i class="fab fa-github me-2"></i>GitHub
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Check already loaded / cached images in modal
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
                        <img src="${item.image}" class="img-fluid rounded-4 shadow-sm img-lazy-load" style="max-height: 500px; width: 100%; object-fit: contain;" alt="${item.name}" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
                    </div>
                </div>
                <div class="col-12">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <span class="badge" style="background: var(--primary-gradient); font-size: 0.78rem; padding: 6px 14px; border-radius: 50px;">
                            ${item.category}
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
                        <img src="${item.image}" class="img-fluid rounded-4 shadow-sm img-lazy-load" style="max-height: 480px; width: 100%; object-fit: contain;" alt="${item.name}" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
                    </div>
                </div>
                <div class="col-12">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <span class="badge" style="background: var(--primary-gradient); font-size: 0.78rem; padding: 6px 14px; border-radius: 50px;">
                            <i class="fas fa-certificate me-1"></i>${item.category}
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

// If portfolio content container is already in the DOM (e.g. injected before module load completed), trigger render
if (document.getElementById("projects-container")) {
    window.renderPortfolio();
}