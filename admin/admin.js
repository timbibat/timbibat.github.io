document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const projectForm = document.getElementById('projectForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const addProjectModal = new bootstrap.Modal(document.getElementById('addProjectModal'));

    // --- Authentication ---
    auth.onAuthStateChanged(user => {
        if (user) {
            loginSection.classList.add('d-none');
            dashboardSection.classList.remove('d-none');
            loadAdminProjects();
        } else {
            loginSection.classList.remove('d-none');
            dashboardSection.classList.add('d-none');
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                alert("Login Failed: " + error.message);
            });
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    // --- Project Management ---
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('projectId').value;
        const collection = document.querySelector('input[name="pCollection"]:checked').value;
        
        const projectData = {
            name: document.getElementById('pName').value,
            category: document.getElementById('pCategory').value,
            image: document.getElementById('pImage').value,
            description: document.getElementById('pDescription').value,
            link: document.getElementById('pLink').value || null,
            git: document.getElementById('pGit').value || null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (id) {
                // Update
                await db.collection(collection).doc(id).update(projectData);
            } else {
                // Create
                projectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection(collection).add(projectData);
            }
            
            projectForm.reset();
            document.getElementById('projectId').value = '';
            addProjectModal.hide();
            loadAdminProjects();
        } catch (error) {
            alert("Error saving project: " + error.message);
        }
    });

    async function loadAdminProjects() {
        const activitiesList = document.getElementById('admin-activities-list');
        const projectsList = document.getElementById('admin-projects-list');
        
        activitiesList.innerHTML = '<div class="col-12 text-center p-5"><div class="spinner-border text-primary"></div></div>';
        projectsList.innerHTML = '<div class="col-12 text-center p-5"><div class="spinner-border text-primary"></div></div>';

        try {
            const actSnap = await db.collection('activities').orderBy('createdAt', 'desc').get();
            const projSnap = await db.collection('projects').orderBy('createdAt', 'desc').get();

            renderAdminList(actSnap, activitiesList, 'activities');
            renderAdminList(projSnap, projectsList, 'projects');
        } catch (error) {
            console.error("Error loading projects:", error);
        }
    }

    function renderAdminList(snapshot, container, collection) {
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<div class="col-12 text-center p-4 text-muted">No items found.</div>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const card = `
                <div class="col">
                    <div class="card h-100 glass-effect project-item-card rounded-4 overflow-hidden">
                        <div class="row g-0">
                            <div class="col-4">
                                <img src="${data.image}" class="img-fluid h-100 object-fit-cover" style="min-height: 120px;" onerror="this.src='https://via.placeholder.com/150'">
                            </div>
                            <div class="col-8">
                                <div class="card-body p-3">
                                    <span class="badge badge-category rounded-pill mb-2">${data.category}</span>
                                    <h6 class="fw-bold mb-1">${data.name}</h6>
                                    <p class="small text-muted mb-3 text-truncate-2">${data.description}</p>
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="editProject('${collection}', '${doc.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteProject('${collection}', '${doc.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    }

    // Expose functions to window for onclick handlers
    window.editProject = async (collection, id) => {
        try {
            const doc = await db.collection(collection).doc(id).get();
            const data = doc.data();
            
            document.getElementById('projectId').value = id;
            document.getElementById('pName').value = data.name;
            document.getElementById('pCategory').value = data.category;
            document.getElementById('pImage').value = data.image;
            document.getElementById('pDescription').value = data.description;
            document.getElementById('pLink').value = data.link || '';
            document.getElementById('pGit').value = data.git || '';
            
            document.getElementById(collection === 'activities' ? 'collActivities' : 'collProjects').checked = true;
            
            addProjectModal.show();
        } catch (error) {
            alert("Error fetching project details: " + error.message);
        }
    };

    window.deleteProject = async (collection, id) => {
        if (confirm("Are you sure you want to delete this item?")) {
            try {
                await db.collection(collection).doc(id).delete();
                loadAdminProjects();
            } catch (error) {
                alert("Error deleting project: " + error.message);
            }
        }
    };
});
