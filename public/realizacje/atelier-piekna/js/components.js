// components.js — Interactive UI components for Atelier Piękna beauty salon
// Depends on: data.js (SERVICES, REVIEWS, PACKAGES, GALLERY, TAB_KEYS, TAB_LABELS)
// Loaded after data.js, before animations.js and main.js

// ─────────────────────────────────────────────
// Step 1: TabsComponent
// Renders service cards from SERVICES data.
// Switches tabs, renders cards grid, animates pill indicator.
// ─────────────────────────────────────────────
const TabsComponent = {
    currentTab: 'twarz',

    init() {
        this.tabsNav = document.querySelector('.tabs-nav');
        this.cardsGrid = document.querySelector('.services-grid');
        if (!this.tabsNav || !this.cardsGrid) return;
        this.renderTabs();
        this.renderCards(this.currentTab);
    },

    renderTabs() {
        this.tabsNav.innerHTML = TAB_KEYS.map((key, i) =>
            `<button class="tab-btn${i === 0 ? ' active' : ''}" data-tab="${key}" type="button">
                ${TAB_LABELS[key]}
            </button>`
        ).join('');

        this.tabsNav.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
    },

    renderCards(category) {
        const items = SERVICES[category] || [];
        this.cardsGrid.innerHTML = items.map(item => `
            <div class="service-card fade-in">
                <div class="service-card-image" style="background-image: url('${item.image}')"></div>
                <div class="service-card-body">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                    <div class="service-meta">
                        <span class="service-price">${item.pricePrefix ? item.pricePrefix + ' ' : ''}${item.price} zł</span>
                        <span class="service-duration">${item.duration ? item.duration + ' min' : ''}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    switchTab(category) {
        this.currentTab = category;

        // Update active class on tab buttons
        this.tabsNav.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === category);
        });

        this.renderCards(category);

        // If GSAP available, stagger animate new cards
        if (typeof gsap !== 'undefined') {
            gsap.from('.service-card', {
                opacity: 0,
                y: 20,
                stagger: 0.08,
                duration: 0.4,
                ease: 'power2.out'
            });
        }
    }
};


// ─────────────────────────────────────────────
// Step 2: AccordionComponent
// Renders pricing from accordion items already in HTML.
// Expands/collapses with smooth height animation.
// ─────────────────────────────────────────────
const AccordionComponent = {
    init() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const body = item.querySelector('.accordion-body');
                const isOpen = item.classList.contains('open');

                // Close all others
                document.querySelectorAll('.accordion-item.open').forEach(openItem => {
                    openItem.classList.remove('open');
                    openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    openItem.querySelector('.accordion-body').style.maxHeight = null;
                });

                // Open clicked item (if it wasn't already open)
                if (!isOpen) {
                    item.classList.add('open');
                    header.setAttribute('aria-expanded', 'true');
                    body.style.maxHeight = body.scrollHeight + 'px';
                }
            });
        });
    }
};


// ─────────────────────────────────────────────
// Step 3: CarouselComponent
// Renders reviews from REVIEWS data.
// Auto-play 5s, pause on hover/focus, dots + arrows nav.
// ─────────────────────────────────────────────
const CarouselComponent = {
    current: 0,
    interval: null,

    init() {
        this.track = document.querySelector('.carousel-track');
        this.container = document.querySelector('.carousel');
        if (!this.track || !this.container) return;
        this.total = REVIEWS.length;
        this.renderSlides();
        this.renderDots();
        this.bindArrows();
        this.startAutoPlay();

        // Pause on hover/focus (WCAG 2.2.2)
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        this.container.addEventListener('focusin', () => this.stopAutoPlay());
        this.container.addEventListener('focusout', () => this.startAutoPlay());
    },

    renderSlides() {
        this.track.innerHTML = REVIEWS.map(review => {
            const fullStars = Math.floor(review.rating);
            const emptyStars = 5 - fullStars;
            return `
                <div class="carousel-slide">
                    <div class="quote-mark">"</div>
                    <p class="review-text">${review.text}</p>
                    <div class="review-author">
                        <img class="review-avatar" src="${review.avatar}" alt="${review.name}" width="48" height="48">
                        <div>
                            <div class="review-name">${review.name}</div>
                            <div class="review-stars">${'★'.repeat(fullStars)}${'☆'.repeat(emptyStars)}</div>
                            <div class="review-rating">${review.rating}/5</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderDots() {
        const dotsContainer = document.querySelector('.carousel-dots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = REVIEWS.map((_, i) =>
            `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Opinia ${i + 1}" type="button"></button>`
        ).join('');

        dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('carousel-dot')) {
                this.goTo(parseInt(e.target.dataset.index, 10));
            }
        });
    },

    bindArrows() {
        document.querySelector('.carousel-prev')?.addEventListener('click', () => this.prev());
        document.querySelector('.carousel-next')?.addEventListener('click', () => this.next());
    },

    goTo(index) {
        this.current = index;
        this.track.style.transform = `translateX(-${this.current * 100}%)`;

        // Update active dot
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === this.current);
        });
    },

    next() { this.goTo((this.current + 1) % this.total); },
    prev() { this.goTo((this.current - 1 + this.total) % this.total); },

    startAutoPlay() {
        this.stopAutoPlay();
        this.interval = setInterval(() => this.next(), 5000);
    },

    stopAutoPlay() {
        clearInterval(this.interval);
    }
};


// ─────────────────────────────────────────────
// Step 4: LightboxComponent
// Custom lightbox for gallery images.
// Keyboard nav (Escape, ArrowLeft, ArrowRight). Focus trap.
// ─────────────────────────────────────────────
const LightboxComponent = {
    current: 0,
    previousFocus: null,

    init() {
        this.lightbox = document.querySelector('.lightbox');
        this.img = this.lightbox?.querySelector('.lightbox-img');
        if (!this.lightbox || !this.img) return;

        // Close, prev, next buttons
        this.lightbox.querySelector('.lightbox-close')?.addEventListener('click', () => this.close());
        this.lightbox.querySelector('.lightbox-prev')?.addEventListener('click', () => this.prev());
        this.lightbox.querySelector('.lightbox-next')?.addEventListener('click', () => this.next());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        // Click backdrop to close
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) this.close();
        });
    },

    open(index) {
        this.current = index;
        this.img.src = GALLERY[index].src;
        this.img.alt = GALLERY[index].alt;
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.previousFocus = document.activeElement;
        this.lightbox.querySelector('.lightbox-close')?.focus();
    },

    close() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
        this.previousFocus?.focus();
    },

    next() { this.open((this.current + 1) % GALLERY.length); },
    prev() { this.open((this.current - 1 + GALLERY.length) % GALLERY.length); }
};


// ─────────────────────────────────────────────
// Step 5: GalleryRenderer
// Renders GALLERY data into masonry grid with lazy loading.
// Adds click handlers for lightbox.
// ─────────────────────────────────────────────
const GalleryRenderer = {
    init() {
        const container = document.querySelector('.masonry');
        if (!container) return;

        container.innerHTML = GALLERY.map((img, i) => `
            <div class="masonry-item" data-index="${i}">
                <img src="${img.src}" alt="${img.alt}" loading="lazy" width="400" height="300">
                <div class="masonry-caption"><span>${img.caption}</span></div>
            </div>
        `).join('');

        // Bind lightbox click
        container.querySelectorAll('.masonry-item').forEach((item, i) => {
            item.addEventListener('click', () => {
                if (typeof LightboxComponent !== 'undefined') LightboxComponent.open(i);
            });
        });
    }
};


// ─────────────────────────────────────────────
// Step 6: FormComponent
// Floating labels, real-time validation, phone mask (+48),
// service select population, time slots, submit → success state.
// ─────────────────────────────────────────────
const FormComponent = {
    init() {
        this.form = document.querySelector('.reservation-form');
        if (!this.form) return;
        this.setupServiceSelect();
        this.setupTimeSlots();
        this.setupPhoneMask();
        this.setupValidation();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    setupServiceSelect() {
        // Populate the service <select> from all SERVICES categories
        const select = this.form.querySelector('select[name="service"]');
        if (!select) return;

        // Preserve placeholder option
        const placeholder = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (placeholder) select.appendChild(placeholder);

        TAB_KEYS.forEach(key => {
            const group = document.createElement('optgroup');
            group.label = TAB_LABELS[key];
            SERVICES[key].forEach(service => {
                const option = document.createElement('option');
                option.value = service.name;
                option.textContent = `${service.name} — ${service.pricePrefix ? service.pricePrefix + ' ' : ''}${service.price} zł`;
                group.appendChild(option);
            });
            select.appendChild(group);
        });
    },

    setupTimeSlots() {
        // Generate time options: 9:00, 9:30, 10:00, ..., 19:00
        const select = this.form.querySelector('select[name="time"]');
        if (!select) return;

        const placeholder = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (placeholder) select.appendChild(placeholder);

        for (let h = 9; h <= 19; h++) {
            for (let m = 0; m < 60; m += 30) {
                if (h === 19 && m > 0) break;
                const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                select.appendChild(option);
            }
        }
    },

    setupPhoneMask() {
        // Format phone input: auto-insert spaces after +48 prefix: XXX XXX XXX
        const phoneInput = this.form.querySelector('input[name="phone"]');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            // Strip leading country code 48 if present
            if (val.startsWith('48') && val.length > 9) val = val.slice(2);
            if (val.length > 9) val = val.slice(0, 9);

            // Format: XXX XXX XXX
            let formatted = '';
            for (let i = 0; i < val.length; i++) {
                if (i === 3 || i === 6) formatted += ' ';
                formatted += val[i];
            }
            e.target.value = formatted;
        });
    },

    setupValidation() {
        // Real-time validation on blur, re-validate on input if already in error state
        this.form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) this.validateField(input);
            });
        });
    },

    validateField(input) {
        const name = input.name;
        let valid = true;
        let message = '';

        // Required check
        if (input.hasAttribute('required') && !input.value.trim()) {
            valid = false;
            message = 'To pole jest wymagane';
        }

        // Email format check
        if (valid && name === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                valid = false;
                message = 'Podaj prawidłowy adres e-mail';
            }
        }

        // Phone digit count check (expect 9 digits)
        if (valid && name === 'phone' && input.value) {
            const digits = input.value.replace(/\D/g, '');
            if (digits.length !== 9) {
                valid = false;
                message = 'Podaj 9-cyfrowy numer telefonu';
            }
        }

        // Toggle error class and error message element
        input.classList.toggle('error', !valid);
        let errorEl = input.parentElement.querySelector('.form-error');

        if (!valid) {
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'form-error';
                input.parentElement.appendChild(errorEl);
            }
            errorEl.textContent = message;
        } else if (errorEl) {
            errorEl.remove();
        }

        return valid;
    },

    validateAll() {
        let valid = true;
        this.form.querySelectorAll('[required]').forEach(input => {
            if (!this.validateField(input)) valid = false;
        });
        return valid;
    },

    handleSubmit(e) {
        e.preventDefault();
        if (!this.validateAll()) return;

        // Show success state, hide form
        this.form.style.display = 'none';
        const success = document.querySelector('.form-success');
        if (success) success.classList.add('show');
    }
};
