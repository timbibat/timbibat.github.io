let toastTimeout = null;

/**
 * Copies text to clipboard with modern API and reliable fallback
 */
export async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (_) {
            return fallbackCopy(text);
        }
    }
    return fallbackCopy(text);
}

function fallbackCopy(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    } catch (err) {
        console.error('Fallback copy failed:', err);
        return false;
    }
}

/**
 * Displays transient floating toast notification using Bootstrap 5 Toast
 */
export function showCopyToast(message = 'Copied to clipboard!', subtext = '') {
    let container = document.getElementById('copy-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'copy-toast-container';
        container.className = 'toast-container position-fixed bottom-0 start-50 translate-middle-x p-3';
        container.style.zIndex = '1090';
        document.body.appendChild(container);
    }

    let toastEl = document.getElementById('copyToast');
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'copyToast';
        toastEl.className = 'toast align-items-center border-0 shadow-lg';
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        container.appendChild(toastEl);
    }

    toastEl.innerHTML = `
        <div class="d-flex align-items-center p-2">
            <div class="toast-body d-flex align-items-center gap-2 flex-grow-1 py-1">
                <div class="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center flex-shrink-0" style="width: 28px; height: 28px; font-size: 0.75rem;">
                    <i class="fas fa-check"></i>
                </div>
                <div>
                    <div class="fw-bold small text-dark-emphasis">${message}</div>
                    ${subtext ? `<div class="text-secondary small" style="font-size: 0.75rem;">${subtext}</div>` : ''}
                </div>
            </div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    if (window.bootstrap && window.bootstrap.Toast) {
        const bsToast = window.bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2500 });
        bsToast.show();
    } else {
        toastEl.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastEl.classList.remove('show');
        }, 2500);
    }
}

/**
 * Delegated click handler for any copy button or element with data-copy
 */
export async function handleCopyClick(event) {
    const btn = event.target.closest('[data-copy]');
    if (!btn) return;

    event.preventDefault();
    const textToCopy = btn.getAttribute('data-copy') || 'timothybibat654@gmail.com';

    const success = await copyToClipboard(textToCopy);
    if (!success) return;

    // Visual feedback on all matching copy buttons currently rendered in the DOM
    const allMatchingBtns = document.querySelectorAll(`[data-copy="${textToCopy}"]`);
    
    allMatchingBtns.forEach(el => {
        const icon = el.querySelector('.copy-icon') || el.querySelector('i');
        const textSpan = el.querySelector('.copy-text') || el.querySelector('.copy-label');
        
        el.classList.add('copied');

        if (icon && !el._origIconClass) {
            el._origIconClass = icon.className;
        }
        if (textSpan && !el._origText) {
            el._origText = textSpan.textContent;
        }

        if (icon) {
            icon.className = 'fas fa-check copy-icon';
        }
        if (textSpan) {
            textSpan.textContent = 'Copied!';
        }

        setTimeout(() => {
            el.classList.remove('copied');
            if (icon && el._origIconClass) {
                icon.className = el._origIconClass;
                delete el._origIconClass;
            }
            if (textSpan && el._origText) {
                textSpan.textContent = el._origText;
                delete el._origText;
            }
        }, 2500);
    });

    // Show transient toast
    showCopyToast('Copied to clipboard!', textToCopy);
}

export function initCopyHandler() {
    document.addEventListener('click', handleCopyClick);
}

export function initContactForm() {
    document.addEventListener('submit', handleContactSubmit);
    initCopyHandler();
}

export async function handleContactSubmit(event) {
    const form = event.target.closest('#contact-form');
    if (!form) return;

    event.preventDefault();

    const submitBtn = form.querySelector('#contact-submit-btn') || form.querySelector('button[type="submit"]');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnLoading = submitBtn ? submitBtn.querySelector('.btn-loading') : null;
    const statusDiv = document.getElementById('contact-status');

    // Set loading state on button
    if (submitBtn) {
        submitBtn.disabled = true;
        if (btnText && btnLoading) {
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
        } else {
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
        }
    }

    // Hide previous status message
    if (statusDiv) {
        statusDiv.style.display = 'none';
        statusDiv.innerHTML = '';
    }

    const formData = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            form.reset();
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="alert alert-success alert-dismissible fade show d-flex align-items-center rounded-4 shadow-sm p-3 mb-3 animate-in" role="alert">
                        <i class="fas fa-check-circle fs-4 me-3 flex-shrink-0"></i>
                        <div class="me-auto">
                            <h6 class="alert-heading fw-bold mb-0">Message sent!</h6>
                            <p class="mb-0 small opacity-90">I'll get back to you soon.</p>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                statusDiv.style.display = 'block';
                statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            let errorMessage = "Oops! There was a problem submitting your message. Please try again.";
            try {
                const data = await response.json();
                if (data && data.errors && data.errors.length > 0) {
                    errorMessage = data.errors.map(err => err.message).join(', ');
                }
            } catch (_) {}

            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center rounded-4 shadow-sm p-3 mb-3 animate-in" role="alert">
                        <i class="fas fa-exclamation-circle fs-4 me-3 flex-shrink-0"></i>
                        <div class="me-auto">
                            <h6 class="alert-heading fw-bold mb-0">Submission failed</h6>
                            <p class="mb-0 small opacity-90">${errorMessage}</p>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                statusDiv.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Contact form submission error:', error);
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center rounded-4 shadow-sm p-3 mb-3 animate-in" role="alert">
                    <i class="fas fa-wifi fs-4 me-3 flex-shrink-0"></i>
                    <div class="me-auto">
                        <h6 class="alert-heading fw-bold mb-0">Network Error</h6>
                        <p class="mb-0 small opacity-90">Unable to reach server. Please check your internet connection or email directly at <a href="mailto:timothybibat654@gmail.com" class="alert-link text-decoration-underline">timothybibat654@gmail.com</a>.</p>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            statusDiv.style.display = 'block';
        }
    } finally {
        // Restore button state
        if (submitBtn) {
            submitBtn.disabled = false;
            if (btnText && btnLoading) {
                btnText.classList.remove('d-none');
                btnLoading.classList.add('d-none');
            } else {
                submitBtn.innerHTML = 'Send Message <i class="fas fa-arrow-right ms-2"></i>';
            }
        }
    }
}
