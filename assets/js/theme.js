/**
 * Theme Management Module
 * Handles dark/light theme persistence, switching, and icon synchronization.
 */

export function initTheme() {
    const saved = localStorage.getItem('theme');
    const theme = saved || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    updateToggleIcons(theme);
}

export function toggleTheme() {
    const html = document.documentElement;
    html.classList.add('theme-transitioning');
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', next);
    html.setAttribute('data-bs-theme', next);
    localStorage.setItem('theme', next);
    updateToggleIcons(next);
    setTimeout(() => html.classList.remove('theme-transitioning'), 450);
}

export function updateToggleIcons(theme) {
    const icon = theme === 'dark' ? 'fa-moon' : 'fa-sun';
    const icons = document.querySelectorAll('#themeToggleFloat i, #themeToggleMobile i, .theme-toggle-btn i, .theme-toggle-float i');
    icons.forEach(el => {
        el.className = `fas ${icon}`;
    });
}

// Expose globally for HTML onclick attributes and external scripts
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;

// Immediately apply saved theme on module evaluation
initTheme();
