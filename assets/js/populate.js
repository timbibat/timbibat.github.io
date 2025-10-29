// Constants & Configuration
const CATEGORY_LABELS = {
    'all': 'All Projects',
    'web': 'Web Development',
    'multimedia': 'Multimedia',
    'design': 'Design',
    'certificates': 'Certificates'
};

const INITIAL_VISIBLE_COUNT = 4;

// HTML Generators

function createProjectHTML(project, isVisible = true) {
    const badges = project.badges
        .map((badge, index) => 
            `<span class="badge ${project.badgeColors[index] || 'bg-primary text-white'}">${badge}</span>`
        )
        .join(' ');

    const imageHTML = project.image 
        ? `<img src="${project.image}" class="card-img-top" alt="${project.title}" style="height: 250px; object-fit: cover;">`
        : `<div class="bg-light d-flex align-items-center justify-content-center" style="height: 250px;">
               <i class="fa fa-laptop fa-3x text-muted"></i>
           </div>`;

    const demoButton = createButton(
        project.demoUrl,
        'btn-gradient text-white',
        'fas fa-external-link-alt',
        'View',
        'Demo',
        'fas fa-eye'
    );

    const githubButton = createButton(
        project.githubUrl,
        'btn-outline-primary',
        'fab fa-github',
        'GitHub'
    );

    return `
        <div class="col-lg-6 project-item" style="display: ${isVisible ? 'block' : 'none'};">
            <div class="project-card h-100 bg-white rounded-4 overflow-hidden shadow"
                style="transition: all 0.3s ease;" 
                onmouseover="this.style.transform='translateY(-8px)'"
                onmouseout="this.style.transform='translateY(0)'">
                <div class="position-relative overflow-hidden">
                    ${imageHTML}
                    <div class="position-absolute top-0 start-0 p-3">${badges}</div>
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

function createButton(url, btnClass, icon, label, disabledLabel = label, disabledIcon = icon) {
    if (url) {
        return `<a href="${url}" class="btn ${btnClass} btn-sm" target="_blank">
                    <i class="${icon} me-1"></i>${label}
                </a>`;
    }
    return `<button class="btn btn-outline-secondary btn-sm disabled">
                <i class="${disabledIcon} me-1"></i>${disabledLabel}
            </button>`;
}

function createEmptyStateHTML(category) {
    const categoryName = category === 'all' ? 'project' : category;
    return `
        <div class="col-12">
            <div class="text-center py-5">
                <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No ${categoryName} projects yet</h5>
                <p class="text-muted">Check back later for updates!</p>
            </div>
        </div>
    `;
}

function createToggleButtonHTML(containerId, category, isExpanded = false) {
    const icon = isExpanded ? 'chevron-up' : 'chevron-down';
    const text = isExpanded ? 'Show Less' : 'Show More';
    const label = CATEGORY_LABELS[category] || category;
    
    return `
        <div class="text-center mt-4 toggle-container" id="${containerId}ToggleContainer">
            <button class="btn btn-gradient text-white btn-lg px-4 fw-semibold toggle-btn" 
                data-container="${containerId}" 
                data-category="${category}">
                <i class="fas fa-${icon} me-2"></i>${text} ${label}
            </button>
        </div>
    `;
}

// Data Filtering & Rendering

function filterProjectsByCategory(category) {
    return category === 'all' 
        ? projects 
        : projects.filter(project => project.category === category);
}

function renderProjectsInContainer(containerId, projectList) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (projectList.length === 0) {
        const category = containerId.replace('ProjectsContainer', '').replace('all', 'all');
        container.innerHTML = createEmptyStateHTML(category);
        return;
    }

    projectList.forEach((project, index) => {
        const isVisible = index < INITIAL_VISIBLE_COUNT;
        container.innerHTML += createProjectHTML(project, isVisible);
    });
}

function renderAllProjectTabs() {
    const tabs = [
        { category: 'all', containerId: 'allProjectsContainer' },
        { category: 'web', containerId: 'webProjectsContainer' },
        { category: 'multimedia', containerId: 'multimediaProjectsContainer' },
        { category: 'design', containerId: 'designProjectsContainer' },
        { category: 'certificates', containerId: 'certificateProjectsContainer' }
    ];

    tabs.forEach(({ category, containerId }) => {
        const categoryProjects = filterProjectsByCategory(category);
        renderProjectsInContainer(containerId, categoryProjects);
        
        if (categoryProjects.length > INITIAL_VISIBLE_COUNT) {
            addToggleButton(containerId, category);
        }
    });
}

function addToggleButton(containerId, category) {
    const container = document.getElementById(containerId);
    const tabPane = container?.closest('.tab-pane');
    if (!tabPane) return;

    // Remove existing toggle if present
    const existingToggle = tabPane.querySelector(`#${containerId}ToggleContainer`);
    existingToggle?.remove();

    // Add new toggle button
    tabPane.insertAdjacentHTML('beforeend', createToggleButtonHTML(containerId, category));
}

// Event Handlers

function initializeTabs() {
    const tabButtons = document.querySelectorAll('#projectTabs button[data-bs-toggle="tab"]');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Deactivate all tabs
            tabButtons.forEach(tab => {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            });
            
            // Activate clicked tab
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            
            // Switch tab panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            const targetPane = document.querySelector(this.getAttribute('data-bs-target'));
            targetPane?.classList.add('show', 'active');
        });
    });
}

function setupToggleButtons() {
    window.tabExpandedStates = {};
    
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.toggle-btn');
        if (!button) return;
        
        const containerId = button.getAttribute('data-container');
        const category = button.getAttribute('data-category');
        
        // Toggle state
        window.tabExpandedStates[containerId] = !window.tabExpandedStates[containerId];
        const isExpanded = window.tabExpandedStates[containerId];
        
        toggleProjectVisibility(containerId, isExpanded);
        updateToggleButton(button, category, isExpanded);
    });
}

function toggleProjectVisibility(containerId, isExpanded) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const projectItems = container.querySelectorAll('.project-item');
    projectItems.forEach((item, index) => {
        if (index >= INITIAL_VISIBLE_COUNT) {
            item.style.display = isExpanded ? 'block' : 'none';
        }
    });
}

function updateToggleButton(button, category, isExpanded) {
    const icon = isExpanded ? 'chevron-up' : 'chevron-down';
    const text = isExpanded ? 'Show Less' : 'Show More';
    const label = CATEGORY_LABELS[category] || category;
    
    button.innerHTML = `<i class="fas fa-${icon} me-2"></i>${text} ${label}`;
}

// Styles

function addTabStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #projectTabs .nav-link {
            background-color: #f8f9fa;
            color: #6c757d;
            border: 1px solid transparent;
            transition: all 0.3s ease;
        }
        
        #projectTabs .nav-link:hover {
            background-color: #e9ecef;
            color: #495057;
            transform: translateY(-2px);
        }
        
        #projectTabs .nav-link.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border-color: transparent !important;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .tab-content {
            min-height: 400px;
        }
        
        .tab-pane {
            animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

// Initialization

function initializePortfolio() {
    addTabStyles();
    renderAllProjectTabs();
    initializeTabs();
    setupToggleButtons();
}

// Legacy function for backward compatibility  
function renderProjects() {
    renderAllProjectTabs();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initializePortfolio);