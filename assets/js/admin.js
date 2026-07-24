import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

let currentCollection = 'majorProject'; // default tab

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('d-none');
        dashboardSection.classList.remove('d-none');
        loadData(currentCollection);
    } else {
        loginSection.classList.remove('d-none');
        dashboardSection.classList.add('d-none');
    }
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            loginError.classList.add('d-none');
        })
        .catch((error) => {
            loginError.textContent = error.message;
            loginError.classList.remove('d-none');
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
        loadData(currentCollection);
    });
});

// Load Data
async function loadData(collectionName) {
    adminContentArea.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    let html = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold mb-0 text-capitalize">${collectionName === 'majorProject' ? 'Major Project' : collectionName}</h4>
            ${collectionName !== 'majorProject' ? `
                <div>
                    <button class="btn btn-warning btn-sm rounded-pill px-3 fw-bold me-2" onclick="saveOrder('${collectionName}')" id="save-order-btn" disabled><i class="fas fa-save me-2"></i>Save Order</button>
                    <button class="btn btn-primary btn-sm rounded-pill px-3 fw-bold" onclick="openModal('${collectionName}')"><i class="fas fa-plus me-2"></i>Add New</button>
                </div>
            ` : ''}
        </div>
        <div class="table-responsive">
            <table class="table table-dark table-hover align-middle" id="sortable-table">
                <thead>
                    <tr>
                        <th style="width: 40px;" class="${collectionName === 'majorProject' ? 'd-none' : ''}"></th>
                        <th style="width: 100px;">Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    try {
        if (collectionName === 'majorProject') {
            // Major Project is a single document
            const docRef = doc(db, 'majorProject', 'main');
            const docSnap = await (await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")).getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                html += generateTableRow(docSnap.id, data, collectionName, true);
            } else {
                html += `<tr><td colspan="4" class="text-center py-4">No major project configured yet. <button class="btn btn-sm btn-outline-primary ms-2" onclick="openModal('majorProject')">Add Now</button></td></tr>`;
            }
        } else {
            const querySnapshot = await getDocs(collection(db, collectionName));
            if (querySnapshot.empty) {
                html += `<tr><td colspan="4" class="text-center py-4">No items found.</td></tr>`;
            } else {
                const docsArray = [];
                querySnapshot.forEach((docSnap) => docsArray.push({ id: docSnap.id, data: docSnap.data() }));
                docsArray.sort((a, b) => (a.data.order ?? Number.MAX_SAFE_INTEGER) - (b.data.order ?? Number.MAX_SAFE_INTEGER));
                
                docsArray.forEach((docObj) => {
                    html += generateTableRow(docObj.id, docObj.data, collectionName, false);
                });
            }
        }
        
        html += `</tbody></table></div>`;
        adminContentArea.innerHTML = html;
        
        // Initialize Sortable
        if (collectionName !== 'majorProject') {
            const tbody = document.querySelector('#sortable-table tbody');
            if (tbody) {
                new Sortable(tbody, {
                    handle: '.drag-handle',
                    animation: 150,
                    onUpdate: function (evt) {
                        const btn = document.getElementById('save-order-btn');
                        if (btn) btn.disabled = false;
                    }
                });
            }
        }
        
    } catch (error) {
        console.error("Error loading data:", error);
        adminContentArea.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
    }
}

function generateTableRow(id, data, collectionName, isMajor) {
    // encodeURIComponent does not encode single quotes, which breaks the onclick attribute. 
    // We must manually replace them with %27.
    const encodedData = encodeURIComponent(JSON.stringify({...data, id})).replace(/'/g, "%27");
    return `
        <tr data-id="${id}">
            <td style="width: 40px;" class="${isMajor ? 'd-none' : ''}">
                <i class="fas fa-grip-lines text-muted drag-handle" style="cursor: grab;"></i>
            </td>
            <td><img src="${data.image}" alt="${data.name}" class="rounded" style="width: 60px; height: 40px; object-fit: cover;"></td>
            <td class="fw-semibold">${data.name}</td>
            <td><span class="badge bg-secondary">${data.category}</span></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-light me-2" onclick="editItem('${encodedData}', '${collectionName}')"><i class="fas fa-edit"></i> Edit</button>
                ${!isMajor ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteItem('${id}', '${collectionName}', '${data.image}')"><i class="fas fa-trash"></i></button>` : ''}
            </td>
        </tr>
    `;
}

// Global functions for inline HTML event handlers
window.openModal = (collectionName) => {
    document.getElementById('item-form').reset();
    document.getElementById('item-collection').value = collectionName;
    document.getElementById('item-id').value = '';
    document.getElementById('existing-image').value = '';
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

    document.getElementById('itemModalLabel').textContent = 'Add New Item';
    itemModal.show();
};

window.editItem = (encodedData, collectionName) => {
    const data = JSON.parse(decodeURIComponent(encodedData));
    document.getElementById('item-collection').value = collectionName;
    document.getElementById('item-id').value = data.id;
    document.getElementById('item-name').value = data.name || '';
    document.getElementById('item-category').value = data.category || '';
    document.getElementById('item-description').value = data.description || '';
    document.getElementById('item-link').value = data.link || '';
    document.getElementById('item-git').value = data.git || '';
    document.getElementById('existing-image').value = data.image || '';
    document.getElementById('item-full-description').value = data.fullDescription || '';
    document.getElementById('item-contributions').value = data.contributions ? data.contributions.join('\n') : '';
    
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
                slidePreview.innerHTML += `<div class="position-relative" style="width: 70px; height: 50px; margin-right: 8px;">
                    <img src="${img}" class="img-thumbnail bg-dark w-100 h-100 p-1 border-secondary" style="object-fit: cover;">
                    <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 shadow" 
                        style="width: 18px; height: 18px; line-height: 1; transform: translate(50%, -50%); border-radius: 50%;" 
                        onclick="removeSlideImage('${safeImg}', this)">
                        <i class="fas fa-times" style="font-size: 10px;"></i>
                    </button>
                </div>`;
            });
        }
        document.getElementById('item-slide-images').value = '';
    } else {
        document.getElementById('major-images-container').classList.add('d-none');
    }
    
    document.getElementById('itemModalLabel').textContent = 'Edit Item';
    itemModal.show();
};

window.deleteItem = async (id, collectionName, imageUrl) => {
    if (confirm('Are you sure you want to delete this item?')) {
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
    btnElement.disabled = true;
    
    try {
        await setDoc(doc(db, 'majorProject', 'main'), {
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
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
    
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
        alert('Order saved successfully!');
        loadData(collectionName);
    } catch (error) {
        alert('Error saving order: ' + error.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save me-2"></i>Save Order';
    }
};

// Drag and Drop Logic
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('item-image');
const filePreview = document.getElementById('file-preview');

dropZone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropZone.classList.add('border-primary');
    dropZone.classList.remove('border-secondary');
    document.getElementById('drop-icon').classList.add('text-primary');
    document.getElementById('drop-icon').classList.remove('text-secondary');
}

function unhighlight(e) {
    dropZone.classList.remove('border-primary');
    dropZone.classList.add('border-secondary');
    document.getElementById('drop-icon').classList.remove('text-primary');
    document.getElementById('drop-icon').classList.add('text-secondary');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files && files.length > 0) {
        fileInput.files = files;
        updateFilePreview(files[0]);
    }
}

fileInput.addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        updateFilePreview(this.files[0]);
    }
});

function updateFilePreview(file) {
    filePreview.textContent = `Selected File: ${file.name}`;
    filePreview.classList.remove('d-none');
}

// Handle Form Submit (Add / Edit)
itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';

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
        
        // If no image and it's a new item, we require an image
        if (!imageUrl && !id) {
            alert('Please upload an image for new items.');
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Item';
            return;
        }

        const contributionsText = document.getElementById('item-contributions').value;
        const contributionsArray = contributionsText.split('\n').map(c => c.trim()).filter(c => c.length > 0);

        const itemData = {
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value,
            description: document.getElementById('item-description').value,
            fullDescription: document.getElementById('item-full-description').value || null,
            contributions: contributionsArray.length > 0 ? contributionsArray : null,
            link: document.getElementById('item-link').value || null,
            git: document.getElementById('item-git').value || null,
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
                itemData.images = arrayUnion(...newSlideUrls);
            }
            await setDoc(doc(db, 'majorProject', 'main'), itemData, { merge: true });
        } else {
            if (id) {
                // Update
                await setDoc(doc(db, collectionName, id), itemData, { merge: true });
            } else {
                // Create
                itemData.order = Date.now(); // Place new items at the end
                await addDoc(collection(db, collectionName), itemData);
            }
        }

        itemModal.hide();
        loadData(collectionName);
    } catch (error) {
        alert('Error saving item: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save Item';
    }
});
