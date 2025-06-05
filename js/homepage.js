// Homepage JavaScript - Interactive Elements and Animations
import { DemoCanvas } from './demo/demo-canvas.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all homepage functionality
    initNavigation();
    initScrollAnimations();
    DemoCanvas.initInteractions();
    initSmoothScrolling();
    initMobileNavigation();
    initSVGRoulette();
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
    const animatedElements = document.querySelectorAll('.feature-card, .demo-item, .about-text, .about-visual, .svg-gallery');
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

// SVG Roulette Gallery functionality
function initSVGRoulette() {
    const rouletteIndicators = document.getElementById('roulette-indicators');
    const rouletteTrack = document.getElementById('roulette-track');

    if (!rouletteIndicators || !rouletteTrack) {
        return; // Elements not found, skip initialization
    }

    // Get unique SVG files (first half of items, since we have duplicates)
    const allItems = document.querySelectorAll('.roulette-item');
    const uniqueItemCount = Math.floor(allItems.length / 2); // Half since we have duplicates
    
    let currentIndex = 0;
    let autoPlayInterval;
    let isAutoPlaying = true;
    
    // Create indicator dots based on unique SVGs only
    function createIndicators() {
        rouletteIndicators.innerHTML = '';
        for (let i = 0; i < uniqueItemCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'roulette-dot';
            dot.setAttribute('data-index', i);
            
            // Add click event to each dot
            dot.addEventListener('click', () => {
                goToSlide(i);
                pauseAutoPlay();
                // Resume auto play after 10 seconds
                setTimeout(() => {
                    if (!isAutoPlaying) {
                        resumeAutoPlay();
                    }
                }, 10000);
            });
            
            rouletteIndicators.appendChild(dot);
        }
    }

    // Go to specific slide
    function goToSlide(index) {
        currentIndex = index;
        updateActiveIndicator();
        
        // Calculate position to scroll to
        const itemWidth = 280 + 32; // item width + gap (2rem = 32px)
        const scrollPosition = -(index * itemWidth);
        
        // Pause CSS animation and set manual position
        rouletteTrack.style.animationPlayState = 'paused';
        rouletteTrack.style.transform = `translateX(${scrollPosition}px)`;
        
        // Add smooth transition
        rouletteTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Remove transition after animation completes
        setTimeout(() => {
            rouletteTrack.style.transition = '';
        }, 600);
    }

    // Update active indicator
    function updateActiveIndicator() {
        const dots = document.querySelectorAll('.roulette-dot');
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentIndex]) {
            dots[currentIndex].classList.add('active');
        }
    }

    // Auto-play functionality
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if (isAutoPlaying) {
                currentIndex = (currentIndex + 1) % uniqueItemCount;
                updateActiveIndicator();
            }
        }, 60000 / uniqueItemCount); // Sync with CSS animation duration
    }

    // Pause auto play
    function pauseAutoPlay() {
        isAutoPlaying = false;
        rouletteTrack.style.animationPlayState = 'paused';
    }

    // Resume auto play
    function resumeAutoPlay() {
        isAutoPlaying = true;
        rouletteTrack.style.animationPlayState = 'running';
        rouletteTrack.style.transform = ''; // Reset manual transform
    }

    // Pause on hover
    rouletteTrack.addEventListener('mouseenter', () => {
        rouletteTrack.style.animationPlayState = 'paused';
    });

    rouletteTrack.addEventListener('mouseleave', () => {
        if (isAutoPlaying) {
            rouletteTrack.style.animationPlayState = 'running';
        }
    });

    // Initialize
    createIndicators();
    updateActiveIndicator();
    startAutoPlay();
}
