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

    // Initialize Floating Back to Top Button
    initBackToTop();
}

/**
 * Floating Back to Top Button Controller
 * Monitors scroll offset with a 60fps passive requestAnimationFrame throttle
 * and triggers smooth jump back to page top.
 */
export function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    let ticking = false;
    const toggleBackToTop = () => {
        const scrolled = window.scrollY > 300;
        if (scrolled) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                toggleBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        btn.blur();
    });

    // Sync state on hash change / page swaps
    toggleBackToTop();
    window.addEventListener('hashchange', () => {
        setTimeout(toggleBackToTop, 150);
    });

    // Handle modal show/hidden to prevent double scrollbars and hide floating button
    document.addEventListener('show.bs.modal', () => {
        document.documentElement.classList.add('modal-open');
        btn.classList.remove('show');
    });
    document.addEventListener('hidden.bs.modal', () => {
        document.documentElement.classList.remove('modal-open');
        toggleBackToTop();
    });
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
