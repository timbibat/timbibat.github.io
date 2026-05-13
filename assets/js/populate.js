function renderPortfolio() {
    const majorProjectContainer = document.getElementById("major-project-container");
    const activitiesContainer = document.getElementById("activities-container");
    const projectsContainer = document.getElementById("projects-container");
    const multimediaContainer = document.getElementById("multimedia-container");
    const certificatesContainer = document.getElementById("certificates-container");

    if (activitiesContainer && projectsContainer && multimediaContainer && certificatesContainer) {
        if (majorProjectContainer) majorProjectContainer.innerHTML = '';
        activitiesContainer.innerHTML = '';
        projectsContainer.innerHTML = '';
        multimediaContainer.innerHTML = '';
        certificatesContainer.innerHTML = '';
        
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
                    <img src="${proj.image}" class="card-img-top" alt="${proj.name}" style="height: 250px; object-fit: cover;">
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
        
        // Render Major Project from data.js
        const majorProj = portfolioDetails.majorProject;
        if (majorProjectContainer && majorProj) {
            const demoStatus = majorProj.link ? '' : 'disabled';
            const gitStatus = majorProj.git ? '' : 'disabled';

            majorProjectContainer.innerHTML = `
            <div class="major-project-article animate-in" onclick="showProjectModal()" style="cursor: pointer;">
                <div class="row align-items-center g-4 g-lg-5">
                    <div class="col-lg-5">
                        <div class="major-project-image-wrapper p-4 rounded-4 shadow-lg">
                            <img src="${majorProj.image}" class="img-fluid" alt="${majorProj.name}">
                        </div>
                    </div>
                    <div class="col-lg-7">
                        <div class="major-project-details text-start">
                            <div class="mb-3">
                                <span class="badge" style="background: var(--primary-gradient); font-size: 0.8rem; padding: 8px 16px; border-radius: 50px;">
                                    ${majorProj.category}
                                </span>
                            </div>
                            <h2 class="display-5 fw-bold mb-3 glow-text">${majorProj.name}</h2>
                            <p class="text-muted lead mb-4" style="line-height: 1.8;">
                                ${majorProj.description}
                            </p>
                            
                            <div class="d-flex flex-wrap gap-3 mb-4">
                                <a href="${majorProj.link}" class="btn btn-gradient text-white px-4 py-2 fw-semibold ${demoStatus}" target="_blank" onclick="event.stopPropagation()">
                                    <i class="fas fa-external-link-alt me-2"></i>Live Demo
                                </a>
                                <a href="${majorProj.git}" class="btn btn-outline-primary px-4 py-2 fw-semibold ${gitStatus}" target="_blank" onclick="event.stopPropagation()">
                                    <i class="fab fa-github me-2"></i>GitHub
                                </a>
                            </div>
                            
                            <div class="read-more-trigger">
                                <span class="text-primary fw-bold" style="font-size: 0.95rem; cursor: pointer;">
                                    See More Details <i class="fas fa-arrow-right ms-2"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        // Filter out major project from projects list safely
        const projectsToRender = (majorProj && portfolioDetails.projects) 
            ? portfolioDetails.projects.filter(p => p.name !== majorProj.name) 
            : (portfolioDetails.projects || []);

        projectsToRender.forEach((proj, index) => {
            projectsContainer.innerHTML += createProjectCard(proj, index);
        });

        if (portfolioDetails.activities) {
            portfolioDetails.activities.forEach((act, index) => {
                activitiesContainer.innerHTML += createProjectCard(act, index);
            });
        }

        if (portfolioDetails.multimedia) {
            portfolioDetails.multimedia.forEach((multi, index) => {
                multimediaContainer.innerHTML += createProjectCard(multi, index);
            });
        }

        if (portfolioDetails.certificates) {
            portfolioDetails.certificates.forEach((cert, index) => {
                certificatesContainer.innerHTML += createProjectCard(cert, index);
            });
        }
    }
}

// Tab functionality handled by Bootstrap 5 native data-bs attributes in portfolio.html

function showProjectModal() {
    const majorProj = portfolioDetails.majorProject;
    const modalContent = document.getElementById('modal-content-area');
    
    if (modalContent && majorProj) {
        let contributionsHTML = majorProj.contributions.map(c => 
            `<li class="mb-3 d-flex align-items-start">
                <i class="fas fa-check-circle text-primary mt-1 me-3"></i>
                <span>${c}</span>
            </li>`
        ).join('');

        // Prepare Carousel HTML
        let carouselItems = "";
        let carouselIndicators = "";
        
        if (majorProj.images && majorProj.images.length > 0) {
            majorProj.images.forEach((img, idx) => {
                carouselItems += `
                    <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                        <img src="${img}" class="d-block w-100 rounded-4 shadow-sm" style="height: 400px; object-fit: contain; background: rgba(0,0,0,0.03);" alt="${majorProj.name} - image ${idx + 1}">
                    </div>
                `;
                carouselIndicators += `
                    <button type="button" data-bs-target="#projectCarousel" data-bs-slide-to="${idx}" class="${idx === 0 ? 'active' : ''}" aria-current="${idx === 0 ? 'true' : 'false'}" aria-label="Slide ${idx + 1}"></button>
                `;
            });
        } else {
            carouselItems = `
                <div class="carousel-item active">
                    <img src="${majorProj.image}" class="d-block w-100 rounded-4 shadow-sm" style="height: 400px; object-fit: contain; background: rgba(0,0,0,0.03);" alt="${majorProj.name}">
                </div>
            `;
        }

        modalContent.innerHTML = `
            <div class="row g-4">
                <div class="col-12 mb-4">
                    <div id="projectCarousel" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-indicators">
                            ${carouselIndicators}
                        </div>
                        <div class="carousel-inner">
                            ${carouselItems}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#projectCarousel" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#projectCarousel" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
                <div class="col-12">
                    <div class="d-flex flex-column flex-md-row align-items-md-center align-items-start mb-3">
                        <h2 class="display-5 fw-bold mb-0">${majorProj.name}</h2>
                        <span class="mt-2 mt-md-0 ms-md-3 badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2">${majorProj.category}</span>
                    </div>
                    <p class="lead text-muted mb-5" style="line-height: 1.8;">${majorProj.fullDescription}</p>
                    
                    <h4 class="fw-bold mb-4">Key Contributions</h4>
                    <ul class="list-unstyled mb-5">
                        ${contributionsHTML}
                    </ul>
                    
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
        
        const myModal = new bootstrap.Modal(document.getElementById('projectModal'));
        myModal.show();

        // Initialize carousel for auto-swiping
        const carouselEl = document.getElementById('projectCarousel');
        if (carouselEl) {
            new bootstrap.Carousel(carouselEl, {
                interval: 3000,
                ride: 'carousel'
            });
        }
    }
}