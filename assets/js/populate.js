function renderPortfolio() {
    const majorProjectContainer = document.getElementById("major-project-container");
    const activitiesContainer = document.getElementById("activities-container");
    const projectsContainer = document.getElementById("projects-container");

    if (activitiesContainer && projectsContainer) {
        if (majorProjectContainer) majorProjectContainer.innerHTML = '';
        activitiesContainer.innerHTML = '';
        projectsContainer.innerHTML = '';
        
        // Render Major Project from data.js
        const majorProj = portfolioDetails.majorProject;
        if (majorProjectContainer && majorProj) {
            const demoStatus = majorProj.link ? '' : 'disabled';
            const gitStatus = majorProj.git ? '' : 'disabled';

            majorProjectContainer.innerHTML = `
            <div class="major-project-card p-4 animate-in text-center" onclick="showProjectModal()" style="cursor: pointer;">
                <div class="major-project-image-container shadow-lg mb-4 mx-auto" style="max-width: 320px;">
                    <img src="${majorProj.image}" class="major-project-image" alt="${majorProj.name}" style="height: auto; max-height: 250px; width: 100%; object-fit: contain; padding: 20px;">
                </div>
                
                <div class="major-project-content">
                    <div class="mb-3">
                        <span class="badge" style="background: var(--primary-gradient); font-size: 0.75rem; letter-spacing: 0.04em;">${majorProj.category}</span>
                    </div>
                    <h3 class="h2 fw-bold mb-2">${majorProj.name}</h3>
                    <p class="text-muted mb-3 mx-auto lead" style="font-size: 1rem; max-width: 600px;">${majorProj.description}</p>
                    
                    <div class="d-flex flex-wrap justify-content-center gap-2 mb-3">
                        <a href="${majorProj.link}" class="btn btn-gradient text-white px-3 py-2 btn-sm fw-semibold ${demoStatus}" target="_blank" onclick="event.stopPropagation()">
                            <i class="fas fa-external-link-alt me-2"></i>Live Demo
                        </a>
                        <a href="${majorProj.git}" class="btn btn-outline-primary px-3 py-2 btn-sm ${gitStatus}" target="_blank" onclick="event.stopPropagation()">
                            <i class="fab fa-github me-2"></i>GitHub
                        </a>
                    </div>

                    <div class="">
                        <button class="btn btn-link text-primary text-decoration-none fw-bold p-0" style="font-size: 0.9rem;">
                            See More Details <i class="fas fa-arrow-right ms-2 transition-transform"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        }

        portfolioDetails.projects.filter(p => p.name !== majorProj.name).forEach((proj, index) => {
            const demoStatus = proj.link ? '' : 'disabled';
            const gitStatus = proj.git ? '' : 'disabled';

            projectsContainer.innerHTML += `
            <div class="col animate-in" style="animation-delay: ${index * 0.1}s;">
                <div class="project-card h-100 rounded-4 overflow-hidden">
                    <img src="${proj.image}" class="card-img-top" alt="${proj.name}" style="height: 250px; object-fit: cover;">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="mb-3">
                            <span class="badge" style="background: var(--primary-gradient); font-size: 0.7rem; letter-spacing: 0.03em;">${proj.category}</span>
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
        });

        portfolioDetails.activities.forEach((act, index) => {
            const demoStatus = act.link ? '' : 'disabled';
            const gitStatus = act.git ? '' : 'disabled';

            activitiesContainer.innerHTML += `
            <div class="col animate-in" style="animation-delay: ${index * 0.1}s;">
                <div class="project-card h-100 rounded-4 overflow-hidden">
                    <img src="${act.image}" class="card-img-top" alt="${act.name}" style="height: 250px; object-fit: cover;">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="mb-3">
                            <span class="badge" style="background: var(--primary-gradient); font-size: 0.7rem; letter-spacing: 0.03em;">${act.category}</span>
                        </div>
                        <h5 class="card-title fw-bold text-dark mb-3">${act.name}</h5>
                        <p class="card-text text-muted mb-4">${act.description}</p>
                        <div class="mt-auto d-flex gap-2">
                            <a href="${act.link}" class="btn btn-gradient text-white btn-sm fw-semibold ${demoStatus}" target="_blank">
                                <i class="fas fa-external-link-alt me-1"></i>Live Demo
                            </a>
                            <a href="${act.git}" class="btn btn-outline-primary btn-sm ${gitStatus}" target="_blank">
                                <i class="fab fa-github me-1"></i>GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
        });

    }
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('section-expanded');
    }
}

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