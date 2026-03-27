const AnimationsManager = {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

    init() {
        if (this.prefersReducedMotion) return; // Skip all GSAP
        gsap.registerPlugin(ScrollTrigger);
        // SplitText may not be available (it's a premium plugin)
        if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
        this.heroAnimations();
        this.sectionReveals();
        this.counterAnimations();
        this.galleryStagger();
        this.magneticCTA();
    },

    heroAnimations() {
        // SplitText heading (only if SplitText is available)
        const heading = document.querySelector('.hero-heading');
        if (heading && typeof SplitText !== 'undefined') {
            const split = new SplitText(heading, { type: 'chars' });
            gsap.from(split.chars, {
                opacity: 0, y: 50, rotateX: -40,
                stagger: 0.03, duration: 0.8, ease: 'back.out(1.7)',
                delay: 0.3
            });
        } else if (heading) {
            // Fallback: simple fade in
            gsap.from(heading, { opacity: 0, y: 30, duration: 0.8, delay: 0.3 });
        }

        // Parallax background
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            gsap.to(heroBg, {
                yPercent: 30,
                scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
            });
        }

        // Subtitle and CTAs fade in
        gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8, delay: 0.8 });
        gsap.from('.hero-ctas', { opacity: 0, y: 30, duration: 0.8, delay: 1.0 });
        gsap.from('.hero-badge', { opacity: 0, scale: 0.8, duration: 0.6, delay: 1.2, ease: 'back.out(1.7)' });
    },

    sectionReveals() {
        // All elements with .fade-in class animate on scroll
        gsap.utils.toArray('.fade-in').forEach(el => {
            gsap.from(el, {
                opacity: 0, y: 40,
                duration: 0.6, ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            });
        });

        // Section headings
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                opacity: 0, y: 30,
                duration: 0.6, ease: 'power2.out',
                scrollTrigger: { trigger: title, start: 'top 85%', once: true }
            });
        });
    },

    counterAnimations() {
        document.querySelectorAll('[data-counter]').forEach(el => {
            const target = parseInt(el.dataset.counter);
            const obj = { val: 0 };
            gsap.to(obj, {
                val: target,
                duration: 2,
                ease: 'power1.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true },
                onUpdate() {
                    el.textContent = Math.ceil(obj.val).toLocaleString();
                }
            });
        });
    },

    galleryStagger() {
        const items = document.querySelectorAll('.masonry-item');
        if (items.length === 0) return;
        gsap.from(items, {
            opacity: 0, scale: 0.85, y: 30,
            stagger: 0.08, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: '.masonry', start: 'top 80%', once: true }
        });
    },

    magneticCTA() {
        document.querySelectorAll('.btn-magnetic').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
            });
        });
    }
};
