// Create HTML for a single project
function createProjectHTML(project, isVisible) {
    const badges = project.badges.map((badge, index) =>
        `<span class="badge ${project.badgeColors[index] || 'bg-primary text-white'}">${badge}</span>`
    ).join(' ');

    const imageHTML = project.image ?
        `<img src="${project.image}" class="card-img-top" alt="${project.title}" style="height: 250px; object-fit: cover;">` :
        `<div class="bg-light d-flex align-items-center justify-content-center" style="height: 250px;">
                <i class="fa fa-laptop fa-3x text-muted"></i>
            </div>`;

    const demoButton = project.demoUrl ?
        `<a href="${project.demoUrl}" class="btn btn-gradient text-white btn-sm fw-semibold" target="_blank">
                <i class="fas fa-external-link-alt me-1"></i>Live Demo
            </a>` :
        `<button class="btn btn-outline-secondary btn-sm disabled">
                <i class="fas fa-eye me-1"></i>Demo
            </button>`;

    const githubButton = project.githubUrl ?
        `<a href="${project.githubUrl}" class="btn btn-outline-primary btn-sm" target="_blank">
                <i class="fab fa-github me-1"></i>GitHub
            </a>` :
        `<a href="#" class="btn btn-outline-primary btn-sm disabled">
                <i class="fab fa-github me-1"></i>GitHub
            </a>`;

    return `
            <div class="col-lg-6 project-item ${isVisible ? 'visible' : ''}">
                <div class="project-card h-100 bg-white rounded-4 overflow-hidden shadow"
                    style="transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-8px)'"
                    onmouseout="this.style.transform='translateY(0)'">
                    <div class="position-relative overflow-hidden">
                        ${imageHTML}
                        <div class="position-absolute top-0 start-0 p-3">
                            ${badges}
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <h5 class="card-title fw-bold text-primary mb-3">${project.title}</h5>
                        <p class="card-text text-muted mb-4">${project.description}</p>
                        <div class="d-flex gap-2">
                            ${demoButton}
                            ${githubButton}
                        </div>
                    </div>
                </div>
            </div>
        `;
}

// Render projects
function renderProjects() {
    const container = document.getElementById('projectsContainer');
    if (container) {
        container.innerHTML = '';

        projects.forEach((project, index) => {
            const isVisible = index < 4 || isExpanded;
            const projectHTML = createProjectHTML(project, isVisible);
            container.innerHTML += projectHTML;
        });
    }
}

// Wait for DOM to load before rendering
document.addEventListener('DOMContentLoaded', function () {
    renderProjects();
});