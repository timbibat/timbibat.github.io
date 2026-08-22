/**
 * Contact Form Module
 * Handles AJAX submission to Formspree without page redirection.
 */

export function initContactForm() {
    document.addEventListener('submit', handleContactSubmit);
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
