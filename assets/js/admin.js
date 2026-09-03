import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, getDoc, addDoc, doc, setDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const adminContentArea = document.getElementById('admin-content-area');
const itemModal = new bootstrap.Modal(document.getElementById('itemModal'));
const itemForm = document.getElementById('item-form');
const saveBtn = document.getElementById('save-btn');
const searchInput = document.getElementById('adminSearchInput');

let currentCollection = 'majorProject'; // default tab
let currentDocsCache = [];

// Populate Footer Year
const yearEl = document.getElementById('admin-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Password Toggle Button
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const passwordInput = document.getElementById('login-password');
const togglePasswordIcon = document.getElementById('togglePasswordIcon');

if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePasswordIcon.classList.toggle('fa-eye', !isPassword);
        togglePasswordIcon.classList.toggle('fa-eye-slash', isPassword);
    });
}

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('d-none');
        dashboardSection.classList.remove('d-none');
        logoutBtn.classList.remove('d-none');
        loadData(currentCollection);
    } else {
        loginSection.classList.remove('d-none');
        dashboardSection.classList.add('d-none');
        logoutBtn.classList.add('d-none');
    }
});

// Login Submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-submit-btn');

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Authenticating...';
    }
    
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            loginError.classList.add('d-none');
        })
        .catch((error) => {
            loginError.textContent = error.message;
            loginError.classList.remove('d-none');
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Sign In';
            }
        });
});

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// Tab Switching
document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', (event) => {
        const target = event.target.getAttribute('data-bs-target').substring(1);
        currentCollection = target === 'major' ? 'majorProject' : target;
        
        // Reset tab styles
        document.querySelectorAll('#adminTabs .nav-link').forEach(btn => {
            if (btn === event.target) {
                btn.classList.remove('text-secondary');
            } else {
                btn.classList.add('text-secondary');
            }
        });

        if (searchInput) searchInput.value = '';
        loadData(currentCollection);
    });
});

// Live Search Filter
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#sortable-table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

// Load Data
async function loadData(collectionName) {
    adminContentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="skeleton-box skeleton-title" style="width: 160px; height: 26px;"></div>
            <div class="skeleton-box skeleton-btn" style="width: 100px; height: 32px;"></div>
        </div>
        <div class="table-responsive rounded-3 border border-secondary border-opacity-25">
            <table class="table table-dark align-middle mb-0">
                <thead>
                    <tr class="text-secondary small">
                        <th style="width: 40px;"><div class="skeleton-box skeleton-line w-50"></div></th>
                        <th style="width: 90px;"><div class="skeleton-box skeleton-line w-75"></div></th>
                        <th><div class="skeleton-box skeleton-line w-50"></div></th>
                        <th><div class="skeleton-box skeleton-line w-50"></div></th>
                        <th class="text-end"><div class="skeleton-box skeleton-line w-50 ms-auto"></div></th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from({ length: 4 }).map(() => `
                        <tr>
                            <td><div class="skeleton-box" style="width: 20px; height: 20px;"></div></td>
                            <td><div class="skeleton-box rounded-3" style="width: 60px; height: 45px;"></div></td>
                            <td>
                                <div class="skeleton-box skeleton-line mb-1" style="width: 60%; height: 16px;"></div>
                                <div class="skeleton-box skeleton-line" style="width: 40%; height: 12px;"></div>
                            </td>
                            <td><div class="skeleton-box skeleton-pill-sm" style="width: 80px;"></div></td>
                            <td class="text-end"><div class="skeleton-box skeleton-btn ms-auto" style="width: 70px; height: 28px;"></div></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    const displayTitles = {
        majorProject: 'Major Projects',
        projects: 'General Projects',
        activities: 'Subject Activities',
        multimedia: 'Multimedia & Designs',
        certificates: 'Credentials & Certificates'
    };

    const currentTitle = displayTitles[collectionName] || collectionName;

    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const docsArray = [];
        querySnapshot.forEach((docSnap) => docsArray.push({ id: docSnap.id, data: docSnap.data() }));
        docsArray.sort((a, b) => (a.data.order ?? Number.MAX_SAFE_INTEGER) - (b.data.order ?? Number.MAX_SAFE_INTEGER));
        currentDocsCache = docsArray;

        let html = `
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                <div class="d-flex align-items-center gap-2">
                    <h4 class="fw-bold mb-0 text-white">${currentTitle}</h4>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">${docsArray.length} items</span>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-warning rounded-pill px-3 fw-semibold" onclick="saveOrder('${collectionName}')" id="save-order-btn" disabled>
                        <i class="fas fa-save me-1"></i> Save Order
                    </button>
                    <button class="btn btn-sm btn-gradient text-white rounded-pill px-3 fw-semibold shadow-sm" onclick="openModal('${collectionName}')">
                        <i class="fas fa-plus me-1"></i> Add New
                    </button>
                </div>
            </div>
            <div class="table-responsive rounded-4 border border-secondary border-opacity-25">
                <table class="table table-dark table-hover align-middle mb-0" id="sortable-table">
                    <thead class="table-dark text-secondary small text-uppercase" style="letter-spacing: 0.05em; font-size: 0.72rem;">
                        <tr>
                            <th style="width: 40px;" class="ps-3"></th>
                            <th style="width: 90px;">Thumbnail</th>
                            <th>Name & Details</th>
                            <th>Category</th>
                            <th class="text-end pe-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (docsArray.length === 0) {
            html += `
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                        <div class="rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-2 bg-dark border border-secondary border-opacity-50">
                            <i class="fas fa-folder-open fs-4 text-secondary"></i>
                        </div>
                        <div class="fw-semibold text-white">No items found in this section</div>
                        <small class="text-muted d-block mb-3">Click "Add New" above to create your first entry.</small>
                        <button class="btn btn-sm btn-outline-primary rounded-pill px-4" onclick="openModal('${collectionName}')">
                            <i class="fas fa-plus me-1"></i> Create Item
                        </button>
                    </td>
                </tr>
            `;
        } else {
            docsArray.forEach((docObj) => {
                html += generateTableRow(docObj.id, docObj.data, collectionName);
            });
        }
        
        html += `</tbody></table></div>`;
        adminContentArea.innerHTML = html;
        
        // Initialize SortableJS
        const tbody = document.querySelector('#sortable-table tbody');
        if (tbody && docsArray.length > 1) {
            new Sortable(tbody, {
                handle: '.drag-handle',
                animation: 150,
                ghostClass: 'bg-primary',
                onUpdate: function () {
                    const btn = document.getElementById('save-order-btn');
                    if (btn) {
                        btn.disabled = false;
                        btn.classList.remove('btn-outline-warning');
                        btn.classList.add('btn-warning', 'text-dark');
                    }
                }
            });
        }
        
    } catch (error) {
        console.error("Error loading data:", error);
        adminContentArea.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
    }
}

function generateTableRow(id, data, collectionName) {
    const encodedData = encodeURIComponent(JSON.stringify({...data, id})).replace(/'/g, "%27");
    
    // Tech badges preview
    let badgesHTML = '';
    const badgeList = data.badges || data.tags || [];
    if (badgeList.length > 0) {
        badgesHTML = badgeList.slice(0, 3).map(b => `<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill me-1" style="font-size: 0.65rem;">${b}</span>`).join('');
        if (badgeList.length > 3) {
            badgesHTML += `<span class="badge bg-dark text-muted border border-secondary border-opacity-50 rounded-pill" style="font-size: 0.65rem;">+${badgeList.length - 3}</span>`;
        }
    }

    const isLive = Boolean(data.isLive === true || (data.link && data.link.trim() !== '' && data.isLive !== false));
    const liveBadge = isLive ? `<span class="badge rounded-pill live-status-badge d-inline-flex align-items-center ms-2" style="font-size: 0.62rem; padding: 2px 7px;"><span class="live-pulse-dot me-1" style="width: 5px; height: 5px;"></span>Live</span>` : '';

    return `
        <tr data-id="${id}">
            <td style="width: 40px;" class="ps-3">
                <i class="fas fa-grip-lines text-secondary drag-handle" style="cursor: grab;" title="Drag to reorder"></i>
            </td>
            <td>
                <img src="${data.image || 'assets/img/Timothy.jpg'}" alt="${data.name}" class="rounded-3 border border-secondary border-opacity-50" style="width: 65px; height: 48px; object-fit: cover;">
            </td>
            <td>
                <div class="fw-bold text-white mb-1 d-flex align-items-center">${data.name} ${liveBadge}</div>
                <div class="small text-muted text-truncate mb-1" style="max-width: 320px;">${data.description || 'No description provided.'}</div>
                <div>${badgesHTML}</div>
            </td>
            <td>
                <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1">${data.category || 'General'}</span>
            </td>
            <td class="text-end pe-3">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-light rounded-pill px-3 me-1" onclick="editItem('${encodedData}', '${collectionName}')" title="Edit Item">
                        <i class="fas fa-edit me-1"></i> Edit
                    </button>
                    <button class="btn btn-outline-danger rounded-pill px-3" onclick="deleteItem('${id}', '${collectionName}', '${data.image || ''}')" title="Delete Item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Modal Save Trigger from footer button
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        if (itemForm) {
            if (itemForm.checkValidity()) {
                itemForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            } else {
                itemForm.reportValidity();
            }
        }
    });
}

// Global functions for inline HTML event handlers
window.openModal = (collectionName) => {
    itemForm.reset();
    document.getElementById('item-collection').value = collectionName;
    document.getElementById('item-id').value = '';
    document.getElementById('existing-image').value = '';
    document.getElementById('item-badges').value = '';
    document.getElementById('item-full-description').value = '';
    document.getElementById('item-contributions').value = '';
    
    document.getElementById('file-preview').classList.add('d-none');
    document.getElementById('file-preview').textContent = '';
    document.getElementById('item-image').value = '';
    
    document.getElementById('current-image-container').classList.add('d-none');
    document.getElementById('current-image-preview').src = '';
    
    if (collectionName === 'majorProject') {
        document.getElementById('major-images-container').classList.remove('d-none');
        document.getElementById('slide-images-preview').innerHTML = '';
        document.getElementById('item-slide-images').value = '';
    } else {
        document.getElementById('major-images-container').classList.add('d-none');
    }

    const liveInput = document.getElementById('item-islive');
    if (liveInput) liveInput.checked = true;

    document.getElementById('itemModalLabel').textContent = collectionName === 'majorProject' ? 'Add Major Project' : 'Add New Item';
    itemModal.show();
};

window.editItem = (encodedData, collectionName) => {
    const data = JSON.parse(decodeURIComponent(encodedData));
    document.getElementById('item-collection').value = collectionName;
    document.getElementById('item-id').value = data.id;
    document.getElementById('item-name').value = data.name || '';
    document.getElementById('item-category').value = data.category || '';
    document.getElementById('item-badges').value = data.badges && data.badges.length > 0 ? data.badges.join(', ') : (data.tags && data.tags.length > 0 ? data.tags.join(', ') : '');
    document.getElementById('item-description').value = data.description || '';
    document.getElementById('item-link').value = data.link || '';
    document.getElementById('item-git').value = data.git || '';
    document.getElementById('existing-image').value = data.image || '';
    document.getElementById('item-full-description').value = data.fullDescription || '';
    document.getElementById('item-contributions').value = data.contributions ? data.contributions.join('\n') : '';
    
    const liveInput = document.getElementById('item-islive');
    if (liveInput) liveInput.checked = data.isLive !== false;
    
    document.getElementById('file-preview').classList.add('d-none');
    document.getElementById('file-preview').textContent = '';
    document.getElementById('item-image').value = '';
    
    if (data.image) {
        document.getElementById('current-image-container').classList.remove('d-none');
        document.getElementById('current-image-preview').src = data.image;
    } else {
        document.getElementById('current-image-container').classList.add('d-none');
    }

    if (collectionName === 'majorProject') {
        document.getElementById('major-images-container').classList.remove('d-none');
        const slidePreview = document.getElementById('slide-images-preview');
        slidePreview.innerHTML = '';
        if (data.images && data.images.length > 0) {
            data.images.forEach(img => {
                const safeImg = encodeURIComponent(img).replace(/'/g, "%27");
                slidePreview.innerHTML += `
                    <div class="position-relative" style="width: 75px; height: 55px; margin-right: 8px;">
                        <img src="${img}" class="rounded-3 w-100 h-100 border border-secondary border-opacity-50" style="object-fit: cover;">
                        <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 shadow" 
                            style="width: 20px; height: 20px; line-height: 1; transform: translate(35%, -35%); border-radius: 50%; font-size: 10px;" 
                            onclick="removeSlideImage('${safeImg}', this)" title="Remove slide">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>`;
            });
        }
        document.getElementById('item-slide-images').value = '';
    } else {
        document.getElementById('major-images-container').classList.add('d-none');
    }
    
    document.getElementById('itemModalLabel').textContent = collectionName === 'majorProject' ? 'Edit Major Project' : 'Edit Item';
    itemModal.show();
};

window.deleteItem = async (id, collectionName, imageUrl) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        try {
            await deleteDoc(doc(db, collectionName, id));
            // Try deleting image if it's stored in Firebase Storage
            if (imageUrl && imageUrl.includes('firebasestorage')) {
                try {
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef);
                } catch(e) { console.warn('Could not delete image from storage', e); }
            }
            loadData(collectionName);
        } catch (error) {
            alert('Error deleting item: ' + error.message);
        }
    }
};

window.removeSlideImage = async (encodedImgUrl, btnElement) => {
    if (!confirm('Are you sure you want to permanently delete this slide picture?')) return;
    
    const imgUrl = decodeURIComponent(encodedImgUrl);
    const id = document.getElementById('item-id').value;
    if (!id) {
        btnElement.parentElement.remove();
        return;
    }
    btnElement.disabled = true;
    
    try {
        await setDoc(doc(db, 'majorProject', id), {
            images: arrayRemove(imgUrl)
        }, { merge: true });
        
        btnElement.parentElement.remove();
        
        if (imgUrl.includes('firebasestorage')) {
            try {
                const imageRef = ref(storage, imgUrl);
                await deleteObject(imageRef);
            } catch(e) { console.warn('Could not delete image from storage', e); }
        }
        
        loadData('majorProject');
    } catch (error) {
        alert('Error removing image: ' + error.message);
        btnElement.disabled = false;
    }
};

window.saveOrder = async (collectionName) => {
    const btn = document.getElementById('save-order-btn');
    if (!btn) return;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Saving...';
    
    try {
        const rows = document.querySelectorAll('#sortable-table tbody tr');
        let order = 0;
        const promises = [];
        
        for (const row of rows) {
            const id = row.getAttribute('data-id');
            if (id) {
                promises.push(setDoc(doc(db, collectionName, id), { order: order++ }, { merge: true }));
            }
        }
        
        await Promise.all(promises);
        alert('Order updated successfully!');
        loadData(collectionName);
    } catch (error) {
        alert('Error saving order: ' + error.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save me-1"></i> Save Order';
    }
};

// Drag and Drop Logic
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('item-image');
const filePreview = document.getElementById('file-preview');

if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('border-primary');
            dropZone.classList.remove('border-secondary');
            const icon = document.getElementById('drop-icon');
            if (icon) {
                icon.classList.add('text-primary');
                icon.classList.remove('text-secondary');
            }
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('border-primary');
            dropZone.classList.add('border-secondary');
            const icon = document.getElementById('drop-icon');
            if (icon) {
                icon.classList.remove('text-primary');
                icon.classList.add('text-secondary');
            }
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            fileInput.files = files;
            updateFilePreview(files[0]);
        }
    }, false);

    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            updateFilePreview(this.files[0]);
        }
    });
}

function updateFilePreview(file) {
    if (filePreview) {
        filePreview.innerHTML = `<i class="fas fa-file-image me-1"></i> Selected: ${file.name}`;
        filePreview.classList.remove('d-none');
    }
}

// Handle Form Submit (Add / Edit)
itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading & Saving...';
    }

    const collectionName = document.getElementById('item-collection').value;
    const id = document.getElementById('item-id').value;
    const imageFile = document.getElementById('item-image').files[0];
    let imageUrl = document.getElementById('existing-image').value;

    try {
        // Upload new image if selected
        if (imageFile) {
            const imageRef = ref(storage, `portfolio/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }
        
        if (!imageUrl && !id) {
            alert('Please upload an image for new items.');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save me-1"></i> Save Item';
            }
            return;
        }

        const contributionsText = document.getElementById('item-contributions').value;
        const contributionsArray = contributionsText.split('\n').map(c => c.trim()).filter(c => c.length > 0);

        const badgesText = document.getElementById('item-badges').value || '';
        const badgesArray = badgesText.split(',').map(b => b.trim()).filter(b => b.length > 0);

        const itemData = {
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value,
            badges: badgesArray.length > 0 ? badgesArray : null,
            description: document.getElementById('item-description').value,
            fullDescription: document.getElementById('item-full-description').value || null,
            contributions: contributionsArray.length > 0 ? contributionsArray : null,
            link: document.getElementById('item-link').value || null,
            git: document.getElementById('item-git').value || null,
            isLive: document.getElementById('item-islive') ? document.getElementById('item-islive').checked : true,
            image: imageUrl
        };
        
        // Handle slide images for Major Project
        let newSlideUrls = [];
        if (collectionName === 'majorProject') {
            const slideFiles = document.getElementById('item-slide-images').files;
            if (slideFiles && slideFiles.length > 0) {
                for (let i = 0; i < slideFiles.length; i++) {
                    const sFile = slideFiles[i];
                    const sRef = ref(storage, `portfolio/${Date.now()}_slide_${sFile.name}`);
                    const sSnap = await uploadBytes(sRef, sFile);
                    newSlideUrls.push(await getDownloadURL(sSnap.ref));
                }
            }
        }

        if (collectionName === 'majorProject') {
            if (newSlideUrls.length > 0) {
                itemData.images = id ? arrayUnion(...newSlideUrls) : newSlideUrls;
            } else if (!id && imageUrl) {
                itemData.images = [imageUrl];
            }
        }

        if (id) {
            // Update document
            await setDoc(doc(db, collectionName, id), itemData, { merge: true });
        } else {
            // Create document
            itemData.order = Date.now();
            await addDoc(collection(db, collectionName), itemData);
        }

        itemModal.hide();
        loadData(collectionName);
    } catch (error) {
        alert('Error saving item: ' + error.message);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save me-1"></i> Save Item';
        }
    }
});
