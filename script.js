/* ===============================================
   PIERUCCINI SEGUROS - Premium JavaScript
   Modern interactions, parallax, and animations
   =============================================== */

// ============= UTILITY FUNCTIONS =============
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Debounce function for performance
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for performance
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Check if element is in viewport
const isInViewport = (element, offset = 0) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight - offset) &&
        rect.bottom >= offset
    );
};

// Smooth scroll to element
const smoothScrollTo = (element, offset = 0) => {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
};

// ============= NAVIGATION =============
class Navigation {
    constructor() {
        this.navbar = $('.navbar');
        this.toggle = $('.navbar__toggle');
        this.menu = $('.navbar__menu');
        this.links = $$('.navbar__link');
        this.isOpen = false;
        this.init();
    }
    
    init() {
        // Mobile menu toggle
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleMenu());
        }
        
        // Close menu on link click
        this.links.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isOpen) this.closeMenu();
            });
        });
        
        // Navbar scroll effect
        this.handleScroll();
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menu.contains(e.target) && !this.toggle.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }
    
    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }
    
    openMenu() {
        this.isOpen = true;
        this.menu.classList.add('navbar__menu--active');
        this.toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    
    closeMenu() {
        this.isOpen = false;
        this.menu.classList.remove('navbar__menu--active');
        this.toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    handleScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('navbar--scrolled');
        } else {
            this.navbar.classList.remove('navbar--scrolled');
        }
    }
}

// ============= PARALLAX EFFECT =============
class ParallaxEffect {
    constructor() {
        this.elements = $$('.parallax__layer');
        this.init();
    }
    
    init() {
        if (this.elements.length === 0) return;
        
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        this.updateParallax();
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => this.updateParallax());
        });
        
        window.addEventListener('resize', debounce(() => {
            this.updateParallax();
        }, 250));
    }
    
    updateParallax() {
        const scrolled = window.pageYOffset;
        
        this.elements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }
}

// ============= SCROLL REVEAL =============
class ScrollReveal {
    constructor() {
        this.elements = $$('[data-reveal]');
        this.init();
    }
    
    init() {
        if (this.elements.length === 0) return;
        
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.elements.forEach(el => el.classList.add('revealed'));
            return;
        }
        
        // Use Intersection Observer for better performance
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                        
                        // Trigger counter animation if element has counter
                        const counter = entry.target.querySelector('[data-counter]');
                        if (counter && !counter.classList.contains('counted')) {
                            this.animateCounter(counter);
                        }
                    }, delay);
                    
                    // Stop observing after reveal
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        
        // Observe all elements
        this.elements.forEach(element => {
            // Add appropriate animation class based on data-reveal value
            const animationType = element.dataset.reveal || 'fade';
            element.classList.add(animationType);
            observer.observe(element);
        });
    }
    
    animateCounter(element) {
        element.classList.add('counted');
        const target = parseInt(element.dataset.counter);
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    }
}

// ============= SMOOTH SCROLL =============
class SmoothScroll {
    constructor() {
        this.links = $$('a[href^="#"]');
        this.init();
    }
    
    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                const target = $(href);
                if (target) {
                    e.preventDefault();
                    const offset = 80; // Navbar height
                    smoothScrollTo(target, offset);
                    
                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });
    }
}

// ============= CARD TILT EFFECT =============
class CardTilt {
    constructor() {
        this.cards = $$('[data-tilt]');
        this.init();
    }
    
    init() {
        if (this.cards.length === 0) return;
        
        // Check for touch device
        if ('ontouchstart' in window) return;
        
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMove(e, card));
            card.addEventListener('mouseleave', () => this.handleLeave(card));
        });
    }
    
    handleMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    }
    
    handleLeave(card) {
        card.style.transform = '';
    }
}

// ============= FORM HANDLER =============
class FormHandler {
    constructor() {
        this.form = $('.contact__form');
        if (!this.form) return;
        
        this.inputs = this.form.querySelectorAll('.form__input');
        this.phoneInput = this.form.querySelector('#phone');
        this.init();
    }
    
    init() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.parentElement.classList.contains('form__group--error')) {
                    this.validateField(input);
                }
            });
        });
        
        // Phone mask
        if (this.phoneInput) {
            this.phoneInput.addEventListener('input', (e) => this.maskPhone(e));
        }
    }
    
    maskPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d*)/, '($1');
        }
        
        e.target.value = value;
    }
    
    validateField(field) {
        const parent = field.parentElement;
        const type = field.type;
        const value = field.value.trim();
        let isValid = true;
        
        // Remove previous error state
        parent.classList.remove('form__group--error');
        
        // Required field check
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        }
        
        // Phone validation
        if (type === 'tel' && value) {
            const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
            isValid = phoneRegex.test(value);
        }
        
        // Select validation
        if (field.tagName === 'SELECT' && field.hasAttribute('required')) {
            isValid = value !== '';
        }
        
        if (!isValid) {
            parent.classList.add('form__group--error');
        }
        
        return isValid;
    }
    
    validateForm() {
        let isValid = true;
        
        this.inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            // Focus first error field
            const firstError = this.form.querySelector('.form__group--error .form__input');
            if (firstError) firstError.focus();
            return;
        }
        
        // Simulate form submission
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<span>Enviando...</span>';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Reset form
            this.form.reset();
            
            // Show success message
            const feedback = $('.form__feedback');
            const successMsg = $('.feedback--success');
            
            feedback.style.display = 'block';
            successMsg.style.display = 'flex';
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Hide message after 5 seconds
            setTimeout(() => {
                feedback.style.display = 'none';
                successMsg.style.display = 'none';
            }, 5000);
            
            // Scroll to form top
            smoothScrollTo(this.form, 100);
        }, 2000);
    }
}

// ============= BACK TO TOP =============
class BackToTop {
    constructor() {
        this.button = $('.back-to-top');
        if (!this.button) return;
        this.init();
    }
    
    init() {
        // Show/hide button on scroll
        window.addEventListener('scroll', throttle(() => {
            if (window.pageYOffset > window.innerHeight * 0.5) {
                this.button.classList.add('back-to-top--visible');
            } else {
                this.button.classList.remove('back-to-top--visible');
            }
        }, 200));
        
        // Scroll to top on click
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ============= ANIMATED COUNTERS =============
class AnimatedCounters {
    constructor() {
        this.counters = $$('[data-counter]');
        this.init();
    }
    
    init() {
        if (this.counters.length === 0) return;
        
        const options = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    this.animateValue(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        
        this.counters.forEach(counter => {
            observer.observe(counter);
        });
    }
    
    animateValue(element) {
        element.classList.add('counted');
        const target = parseInt(element.dataset.counter);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current = Math.min(current + step, target);
            element.textContent = Math.floor(current);
            
            if (current < target) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    }
}

// ============= HERO SCROLL INDICATOR =============
class HeroScroll {
    constructor() {
        this.indicator = $('.hero__scroll');
        if (!this.indicator) return;
        this.init();
    }
    
    init() {
        this.indicator.addEventListener('click', () => {
            const nextSection = $('#produtos');
            if (nextSection) {
                smoothScrollTo(nextSection, 80);
            }
        });
    }
}

// ============= LAZY LOADING IMAGES =============
class LazyImages {
    constructor() {
        this.images = $$('img[loading="lazy"]');
        this.init();
    }
    
    init() {
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            return;
        }
        
        // Fallback for older browsers
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        this.images.forEach(img => imageObserver.observe(img));
    }
}

// ============= PARTNER SLIDER =============
class PartnerSlider {
    constructor() {
        this.track = $('.partners__track');
        if (!this.track) return;
        this.init();
    }
    
    init() {
        // Check for reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.track.style.animation = 'none';
            return;
        }
        
        // Pause on hover
        this.track.addEventListener('mouseenter', () => {
            this.track.style.animationPlayState = 'paused';
        });
        
        this.track.addEventListener('mouseleave', () => {
            this.track.style.animationPlayState = 'running';
        });
    }
}

// ============= ACCESSIBILITY HELPERS =============
class AccessibilityHelpers {
    constructor() {
        this.init();
    }
    
    init() {
        // Skip to main content
        this.setupSkipLink();
        
        // Focus visible only for keyboard users
        this.setupFocusVisible();
        
        // Escape key to close modals/menus
        this.setupEscapeKey();
        
        // Announce dynamic content changes
        this.setupAriaLive();
    }
    
    setupSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#home';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.style.cssText = `
            position: fixed;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            padding: 1rem 2rem;
            background: var(--green-light);
            color: var(--black);
            text-decoration: none;
            border-radius: var(--radius-md);
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '1rem';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-100px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    setupFocusVisible() {
        // Remove focus styles for mouse users
        document.addEventListener('mousedown', () => {
            document.body.classList.add('using-mouse');
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.remove('using-mouse');
            }
        });
    }
    
    setupEscapeKey() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals, menus, etc.
                const event = new CustomEvent('escape-pressed');
                document.dispatchEvent(event);
            }
        });
    }
    
    setupAriaLive() {
        // Create aria-live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
        
        // Helper function to announce messages
        window.announce = (message) => {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        };
    }
}

// ============= PERFORMANCE MONITORING =============
class PerformanceMonitor {
    constructor() {
        this.init();
    }
    
    init() {
        if (!window.performance || !window.performance.timing) return;
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
                const firstPaintTime = this.getFirstPaintTime();
                
                console.group('Performance Metrics');
                console.log(`Page Load Time: ${loadTime}ms`);
                console.log(`DOM Ready Time: ${domReadyTime}ms`);
                if (firstPaintTime) {
                    console.log(`First Paint Time: ${firstPaintTime}ms`);
                }
                console.groupEnd();
            }, 0);
        });
    }
    
    getFirstPaintTime() {
        if (window.performance && window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            return firstPaint ? Math.round(firstPaint.startTime) : null;
        }
        return null;
    }
}

// ============= SERVICE WORKER REGISTRATION =============
class ServiceWorkerManager {
    constructor() {
        this.init();
    }
    
    init() {
        if ('serviceWorker' in navigator && location.protocol === 'https:') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registered:', registration);
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed:', error);
                    });
            });
        }
    }
}

// ============= INITIALIZATION =============
class App {
    constructor() {
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }
    
    initComponents() {
        // Core components
        new Navigation();
        new SmoothScroll();
        new FormHandler();
        new BackToTop();
        
        // Visual effects
        new ParallaxEffect();
        new ScrollReveal();
        new CardTilt();
        new AnimatedCounters();
        new HeroScroll();
        new PartnerSlider();
        
        // Utilities
        new LazyImages();
        new AccessibilityHelpers();
        
        // Optional components (only in production)
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            new PerformanceMonitor();
            // new ServiceWorkerManager(); // Uncomment when SW is ready
        }
        
        // Log successful initialization
        console.log('🚀 Pieruccini Seguros - Site initialized successfully');
        
        // Add loaded class to body for CSS animations
        document.body.classList.add('loaded');
    }
}

// Start the application
const app = new App();

// ============= UTILITY EXPORTS =============
// Export utilities for potential use in other scripts
window.PierucciniUtils = {
    smoothScrollTo,
    isInViewport,
    debounce,
    throttle,
    announce: window.announce
};