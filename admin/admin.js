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
        const fileInput = document.getElementById('pImageFile');
        const submitBtn = document.querySelector('#addProjectModal button[type="submit"]');
        let imageUrl = document.getElementById('pImage').value;

        // Handle Image Upload if a file is selected
        if (fileInput.files.length > 0) {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...';
            }
            
            try {
                const file = fileInput.files[0];
                const storageRef = storage.ref(`projects/${Date.now()}_${file.name}`);
                const progressDiv = document.getElementById('uploadProgress');
                const progressBar = progressDiv.querySelector('.progress-bar');
                
                progressDiv.classList.remove('d-none');
                
                const uploadTask = storageRef.put(file);
                
                imageUrl = await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            progressBar.style.width = progress + '%';
                        }, 
                        (error) => reject(error), 
                        async () => {
                            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                            resolve(downloadURL);
                        }
                    );
                });
                
                progressDiv.classList.add('d-none');
            } catch (error) {
                alert("Upload failed: " + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Project';
                return;
            }
        }

        if (!imageUrl && !id) {
            alert("Please select an image for new projects.");
            return;
        }

        const projectData = {
            name: document.getElementById('pName').value,
            category: document.getElementById('pCategory').value,
            image: imageUrl,
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
            document.getElementById('pImage').value = '';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Project';
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
            // Try fetching with ordering first
            let actSnap, projSnap;
            try {
                actSnap = await db.collection('activities').orderBy('createdAt', 'desc').get();
                projSnap = await db.collection('projects').orderBy('createdAt', 'desc').get();
            } catch (sortError) {
                console.warn("Sorting failed, fetching without order:", sortError);
                actSnap = await db.collection('activities').get();
                projSnap = await db.collection('projects').get();
            }

            renderAdminList(actSnap, activitiesList, 'activities');
            renderAdminList(projSnap, projectsList, 'projects');
        } catch (error) {
            console.error("Error loading projects:", error);
            activitiesList.innerHTML = '<div class="col-12 text-center p-5 text-danger">Error loading data. Check console.</div>';
            projectsList.innerHTML = '<div class="col-12 text-center p-5 text-danger">Error loading data. Check console.</div>';
        }
    }

    function renderAdminList(snapshot, container, collection) {
        container.innerHTML = '';
        const countBadge = document.getElementById(`${collection}-count`);
        if (countBadge) countBadge.textContent = `${snapshot.size} items`;

        if (snapshot.empty) {
            container.innerHTML = '<div class="col-12 text-center p-5 opacity-50"><h5>No items found</h5><p class="small">Click "Add Project" to get started</p></div>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const card = `
                <div class="col">
                    <div class="card h-100 rounded-4 overflow-hidden shadow-sm">
                        <div class="row g-0 h-100">
                            <div class="col-4">
                                <img src="${data.image}" class="img-fluid h-100 object-fit-cover" style="min-height: 140px;" onerror="this.src='https://via.placeholder.com/150'">
                            </div>
                            <div class="col-8">
                                <div class="card-body p-3 d-flex flex-column h-100">
                                    <div class="mb-2">
                                        <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-2" style="font-size: 0.65rem;">${data.category}</span>
                                        <h6 class="fw-bold mb-1 text-truncate">${data.name}</h6>
                                    </div>
                                    <p class="small text-secondary mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${data.description}</p>
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-sm btn-light border rounded-pill px-3" onclick="editProject('${collection}', '${doc.id}')">
                                            <i class="fas fa-edit me-1"></i>Edit
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger border-0 rounded-pill px-3" onclick="deleteProject('${collection}', '${doc.id}')">
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
