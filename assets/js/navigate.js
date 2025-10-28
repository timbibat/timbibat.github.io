document.addEventListener('DOMContentLoaded', function () {
    document.body.style.opacity = '1';

    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            navLinks.forEach(nav => {
                nav.classList.remove('bg-primary', 'text-white');
                nav.classList.add('text-muted');
            });
            this.classList.remove('text-muted');
            this.classList.add('bg-primary', 'text-white');
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
        let current = '';
        const scrollPosition = window.scrollY + 150;
        const sections = document.querySelectorAll('[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('bg-primary', 'text-white');
            link.classList.add('text-muted');

            if (link.getAttribute('href') === '#' + current) {
                link.classList.remove('text-muted');
                link.classList.add('bg-primary', 'text-white');
            }
        });
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

    // Setup toggle button
    function setupToggleButton() {
        const toggleBtn = document.getElementById('toggleBtn');
        const toggleContainer = document.getElementById('toggleContainer');

        // Show toggle button only if there are more than 4 projects
        if (projects.length > 4) {
            toggleContainer.style.display = 'block';
        }

        toggleBtn.addEventListener('click', function () {
            isExpanded = !isExpanded;

            if (isExpanded) {
                // Show all projects
                document.querySelectorAll('.project-item').forEach(item => {
                    item.classList.add('visible');
                });
                this.innerHTML = '<i class="fas fa-chevron-up me-2"></i>Show Less';
            } else {
                // Show only first 4 projects
                document.querySelectorAll('.project-item').forEach((item, index) => {
                    if (index >= 4) {
                        item.classList.remove('visible');
                    }
                });
                this.innerHTML = '<i class="fas fa-chevron-down me-2"></i>Show More';
            }
        });
    }

    // Initialize everything after DOM loads
    setupToggleButton();
});