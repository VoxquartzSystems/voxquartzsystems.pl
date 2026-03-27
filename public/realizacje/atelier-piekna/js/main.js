const ThemeManager = {
    init() {
        const toggle = document.querySelector('.theme-toggle');
        const saved = localStorage.getItem('theme');
        if (saved) document.documentElement.dataset.theme = saved;
        toggle?.addEventListener('click', () => {
            const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = next;
            localStorage.setItem('theme', next);
        });
    }
};

const ScrollSpy = {
    init() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                    active?.classList.add('active');
                }
            });
        }, { rootMargin: '-20% 0px -80% 0px' });
        sections.forEach(s => observer.observe(s));
    }
};

const Navbar = {
    init() {
        const nav = document.getElementById('navbar');
        const toggle = document.querySelector('.nav-toggle');
        const menu = document.querySelector('.nav-menu');

        // Scroll effect
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });

        // Mobile menu
        toggle?.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            toggle.setAttribute('aria-label', expanded ? 'Otwórz menu' : 'Zamknij menu');
            menu.classList.toggle('open');
            document.body.classList.toggle('menu-open');
        });

        // Close on link click
        menu?.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Otwórz menu');
                menu.classList.remove('open');
                document.body.classList.remove('menu-open');
            });
        });
    }
};

const SmoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    Navbar.init();
    ScrollSpy.init();
    SmoothScroll.init();

    // Init components (from components.js)
    if (typeof TabsComponent !== 'undefined') TabsComponent.init();
    if (typeof AccordionComponent !== 'undefined') AccordionComponent.init();
    if (typeof CarouselComponent !== 'undefined') CarouselComponent.init();
    if (typeof LightboxComponent !== 'undefined') LightboxComponent.init();
    if (typeof FormComponent !== 'undefined') FormComponent.init();
    if (typeof GalleryRenderer !== 'undefined') GalleryRenderer.init();

    // Init animations (from animations.js)
    if (typeof AnimationsManager !== 'undefined') AnimationsManager.init();
});
