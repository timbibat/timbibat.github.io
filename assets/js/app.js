/**
 * Main Application Entry Point
 * Orchestrates Theme, Router, and Contact Form modules.
 */

import { initTheme } from './theme.js';
import { initRouter, hideLoader } from './router.js';
import { initContactForm } from './contact.js';

function bootstrap() {
    // Apply saved theme instantly before fade-in
    initTheme();

    // Reveal page and initialize router immediately
    document.body.style.opacity = '1';
    hideLoader();

    // Initialize SPA Hash Router
    initRouter();

    // Initialize AJAX Contact Form Submission
    initContactForm();
}

// Initialize on DOM ready (with fallback if DOM already loaded)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

// Safari Back/Forward cache & tab wake-up restoration
window.addEventListener('pageshow', () => {
    document.body.style.opacity = '1';
    hideLoader();
});
