// Firebase Configuration
// Replace the placeholders below with your Firebase Project settings
// You can find these in Firebase Console > Project Settings > General > Your apps

const firebaseConfig = {
    apiKey: "AIzaSyBz1TlwSIHBPIq9x8LZi5RSxSZ1E1QAdoA",
    authDomain: "portfolio-d0fa8.firebaseapp.com",
    projectId: "portfolio-d0fa8",
    storageBucket: "portfolio-d0fa8.firebasestorage.app",
    messagingSenderId: "471474570590",
    appId: "1:471474570590:web:8f595eaf0f3b2afaed3bcf"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
