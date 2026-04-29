async function renderPortfolio() {
    const activitiesContainer = document.getElementById("activities-container");
    const projectsContainer = document.getElementById("projects-container");

    if (!activitiesContainer || !projectsContainer) return;

    // Show loading state
    activitiesContainer.innerHTML = '<div class="col-12 text-center p-5"><div class="spinner-border text-primary"></div></div>';
    projectsContainer.innerHTML = '<div class="col-12 text-center p-5"><div class="spinner-border text-primary"></div></div>';

    let activities = [];
    let projects = [];

    // Attempt to fetch from Firebase
    try {
        if (typeof db !== 'undefined') {
            const actSnap = await db.collection('activities').orderBy('createdAt', 'asc').get();
            const projSnap = await db.collection('projects').orderBy('createdAt', 'asc').get();

            if (!actSnap.empty) {
                actSnap.forEach(doc => activities.push({ id: doc.id, ...doc.data() }));
            }
            if (!projSnap.empty) {
                projSnap.forEach(doc => projects.push({ id: doc.id, ...doc.data() }));
            }
        }
    } catch (error) {
        console.warn("Firebase fetch failed, falling back to static data:", error);
    }

    // Fallback to static data if Firebase is empty or failed
    if (activities.length === 0) activities = portfolioDetails.activities;
    if (projects.length === 0) projects = portfolioDetails.projects;

    // Clear containers
    activitiesContainer.innerHTML = "";
    projectsContainer.innerHTML = "";

    // Render Activities
    activities.forEach((act, index) => {
        const demoStatus = act.link ? '' : 'disabled';
        const gitStatus = act.git ? '' : 'disabled';

        activitiesContainer.innerHTML += `
        <div class="col animate-in" style="animation-delay: ${index * 0.1}s;">
            <div class="project-card h-100 rounded-4 overflow-hidden" 
                style="transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);">
                <div class="position-relative overflow-hidden">
                    <img src="${act.image}" class="card-img-top" alt="${act.name}" style="height: 250px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/400x250'">
                    <div class="position-absolute top-0 start-0 p-3">
                        <span class="badge" style="background: var(--primary-gradient); font-size: 0.7rem; letter-spacing: 0.03em;">${act.category}</span>
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

    // Render Projects
    projects.forEach((proj, index) => {
        const demoStatus = proj.link ? '' : 'disabled';
        const gitStatus = proj.git ? '' : 'disabled';

        projectsContainer.innerHTML += `
        <div class="col animate-in" style="animation-delay: ${index * 0.1}s;">
            <div class="project-card h-100 rounded-4 overflow-hidden" 
                style="transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);">
                <div class="position-relative overflow-hidden">
                    <img src="${proj.image}" class="card-img-top" alt="${proj.name}" style="height: 250px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/400x250'">
                    <div class="position-absolute top-0 start-0 p-3">
                        <span class="badge" style="background: var(--primary-gradient); font-size: 0.7rem; letter-spacing: 0.03em;">${proj.category}</span>
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