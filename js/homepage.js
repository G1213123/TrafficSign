// Homepage JavaScript - Interactive Elements and Animations
import { DemoCanvas } from './demo-canvas.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all homepage functionality
    initNavigation();
    initScrollAnimations();
    initDemoInteractions();
    initSmoothScrolling();
    initMobileNavigation();
});

// Navigation functionality
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Mobile navigation
function initMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Add fade-in class to elements and observe them
    const animatedElements = document.querySelectorAll('.feature-card, .demo-item, .about-text, .about-visual');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Animate stats counter
    animateStatsCounter();
}

// Animate statistics numbers
function animateStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    const animateCounter = (element, target) => {
        let count = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                element.textContent = target + (target === 100 ? '%' : '+');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(count) + (target === 100 ? '%' : '+');
            }
        }, 20);
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target.textContent.replace(/[^0-9]/g, '');
                animateCounter(entry.target, parseInt(target));
                observer.unobserve(entry.target);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

// Demo interactions
function initDemoInteractions() {
    // Wait for DOM to be fully loaded and then initialize the demo canvas
    setTimeout(() => {
        if (DemoCanvas && document.getElementById('demo-canvas')) {
            try {
                DemoCanvas.init();
                console.log('Demo canvas initialized successfully');
            } catch (error) {
                console.error('Error initializing demo canvas:', error);
            }
        } else {
            console.warn('Demo canvas or DemoCanvas object not available');
        }
    }, 100);
    
    const demoButtons = document.querySelectorAll('.demo-btn');
    
    demoButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            demoButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const demoType = this.dataset.demo;
            executeDemo(demoType);
        });
    });
}

// Execute demo actions using real canvas
function executeDemo(type) {
    if (!DemoCanvas) {
        console.warn('DemoCanvas not available');
        return;
    }
    
    try {
        switch(type) {
            case 'symbol':
                DemoCanvas.createSymbol();
                console.log('Demo symbol created');
                break;
            case 'text':
                DemoCanvas.createText();
                console.log('Demo text created');
                break;
            case 'drag':
                DemoCanvas.simulateDrag();
                console.log('Demo drag simulation started');
                break;
            case 'border':
                DemoCanvas.createBorder();
                console.log('Demo border created');
                break;
            case 'reset':
                DemoCanvas.reset();
                // Remove active class from all buttons
                document.querySelectorAll('.demo-btn').forEach(btn => btn.classList.remove('active'));
                console.log('Demo canvas reset');
                break;
            default:
                console.warn('Unknown demo type:', type);
        }
    } catch (error) {
        console.error('Error executing demo:', error);
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Add loading states for external links
document.querySelectorAll('a[href^="http"], a[href="app.html"]').forEach(link => {
    link.addEventListener('click', function() {
        if (this.href.includes('app.html')) {
            this.classList.add('loading');
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        }
    });
});

// Add hover effects to cards
document.querySelectorAll('.feature-card, .demo-item').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(function() {
    // Any scroll-based animations can go here
}, 16); // ~60fps

window.addEventListener('scroll', debouncedScrollHandler);

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    }
});

// Preload the app page for faster navigation
function preloadApp() {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'app.html';
    document.head.appendChild(link);
}

// Preload after a short delay
setTimeout(preloadApp, 2000);
