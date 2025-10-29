document.addEventListener('DOMContentLoaded', function () {
    document.body.style.opacity = '1';

    // Navigation functionality - ONLY for main navigation, NOT project tabs
    const navLinks = document.querySelectorAll('#navbar .nav-link'); // Only main navigation
    let isScrolling = false;

    // Function to update active navigation
    function updateActiveNav(targetId) {
        navLinks.forEach(nav => {
            nav.classList.remove('bg-primary', 'text-white');
            nav.classList.add('text-muted');
        });

        const activeLink = document.querySelector(`#navbar .nav-link[href="#${targetId}"]`);
        if (activeLink) {
            activeLink.classList.remove('text-muted');
            activeLink.classList.add('bg-primary', 'text-white');
        }
    }

    // Main navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                isScrolling = true;

                updateActiveNav(targetId);

                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                setTimeout(() => {
                    isScrolling = false;
                }, 1000);
            }
        });

        link.addEventListener('mouseenter', function () {
            if (!this.classList.contains('bg-primary')) {
                this.classList.remove('text-muted');
                this.classList.add('text-primary');
            }
        });

        link.addEventListener('mouseleave', function () {
            if (!this.classList.contains('bg-primary')) {
                this.classList.remove('text-primary');
                this.classList.add('text-muted');
            }
        });
    });

    // Scroll spy functionality
    window.addEventListener('scroll', function () {
        if (isScrolling) return;

        let current = '';
        const scrollPosition = window.scrollY + 200;
        const sections = document.querySelectorAll('[id="about"], [id="skills"], [id="projects"], [id="contact"]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        if (window.scrollY < 100) {
            current = 'about';
        }
        if (current) {
            updateActiveNav(current);
        }
    });

    // Content cards hover effects
    const contentCards = document.querySelectorAll('[id="about"], [id="skills"], [id="projects"]');
    contentCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
        });
    });

    // Initialize everything
    updateActiveNav('about');
    
    console.log('Navigation initialized');
});