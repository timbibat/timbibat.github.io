function renderPortfolio() {
    const activitiesContainer = document.getElementById("activities-container");
    const projectsContainer = document.getElementById("projects-container");

    if (activitiesContainer && projectsContainer) {

        portfolioDetails.activities.forEach(act => {
            const demoStatus = act.link ? '' : 'disabled';
            const gitStatus = act.git ? '' : 'disabled';

            activitiesContainer.innerHTML += `
            <div class="col">
                <div class="project-card h-100 bg-white rounded-4 overflow-hidden shadow" 
                    style="transition: all 0.3s ease;"
                    onmouseover="this.style.transform='translateY(-8px)'" 
                    onmouseout="this.style.transform='translateY(0)'">
                    <div class="position-relative overflow-hidden">
                        <img src="${act.image}" class="card-img-top" alt="${act.name}" style="height: 250px; object-fit: cover;">
                        <div class="position-absolute top-0 start-0 p-3">
                            <span class="badge bg-info text-dark">${act.category}</span>
                        </div>
                    </div>
                    <div class="card-body p-4 d-flex flex-column">
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

        portfolioDetails.projects.forEach(proj => {
            const demoStatus = proj.link ? '' : 'disabled';
            const gitStatus = proj.git ? '' : 'disabled';

            projectsContainer.innerHTML += `
            <div class="col">
                <div class="project-card h-100 bg-white rounded-4 overflow-hidden shadow" 
                    style="transition: all 0.3s ease;"
                    onmouseover="this.style.transform='translateY(-8px)'" 
                    onmouseout="this.style.transform='translateY(0)'">
                    <div class="position-relative overflow-hidden">
                        <img src="${proj.image}" class="card-img-top" alt="${proj.name}" style="height: 250px; object-fit: cover;">
                        <div class="position-absolute top-0 start-0 p-3">
                            <span class="badge bg-info text-dark">${proj.category}</span>
                        </div>
                    </div>
                    <div class="card-body p-4 d-flex flex-column">
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
    }
}