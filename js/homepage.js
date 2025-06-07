// Homepage JavaScript - Interactive Elements and Animations
import { DemoCanvas } from './demo/demo-canvas.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Homepage DOM loaded');
    // Initialize all homepage functionality
    initNavigation();
    initScrollAnimations();
    // Temporarily comment out demo canvas to avoid errors
    try {
        DemoCanvas.initInteractions();
    } catch (error) {
        console.warn('Demo canvas failed to initialize:', error);
    }
    initSmoothScrolling();
    initMobileNavigation();
    initSVGRoulette();
    initTpdmTooltip();
    console.log('All homepage functions initialized');
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
        
        // Close menu when clicking on a link or button
        const navLinks = document.querySelectorAll('.nav-link, .nav-button');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
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
document.querySelectorAll('a[href^="http"], a[href="design.html"]').forEach(link => {
    link.addEventListener('click', function() {
        if (this.href.includes('design.html')) {
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
    link.href = 'design.html';
    document.head.appendChild(link);
}

// Preload after a short delay
setTimeout(preloadApp, 2000);

// SVG Roulette Gallery functionality
function initSVGRoulette() {
    console.log('Initializing SVG Roulette...');
    const rouletteIndicators = document.getElementById('roulette-indicators');
    const rouletteTrack = document.getElementById('roulette-track');

    if (!rouletteIndicators || !rouletteTrack) {
        console.error('Roulette elements not found');
        return;
    }

    // Get unique SVG files (first half of items, since we have duplicates)
    const allItems = document.querySelectorAll('.roulette-item');
    const uniqueItemCount = Math.floor(allItems.length / 2);
    console.log('Items found:', allItems.length, 'Unique:', uniqueItemCount);
    
    let currentIndex = 0;
    let isAutoPlaying = true;
    let autoPlayInterval;
    let isManualControl = false;
    
    // Create indicator dots
    function createIndicators() {
        rouletteIndicators.innerHTML = '';
        for (let i = 0; i < uniqueItemCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'roulette-dot';
            dot.setAttribute('data-index', i);
            dot.setAttribute('title', `Go to slide ${i + 1}`);
            
            // Click handler
            dot.addEventListener('click', function(e) {
                console.log('DOT CLICKED:', i);
                e.preventDefault();
                e.stopPropagation();
                isManualControl = true;
                goToSlide(i);
                pauseAutoPlay();
                
                // Resume auto play after 8 seconds
                setTimeout(() => {
                    if (isManualControl) {
                        resumeAutoPlay();
                        isManualControl = false;
                    }
                }, 2000);
            });
            
            rouletteIndicators.appendChild(dot);
        }
        console.log('Created dots:', uniqueItemCount);
    }    // Go to specific slide
    function goToSlide(index) {
        console.log('Going to slide:', index);
        currentIndex = index;
        updateActiveIndicator();
        
        // Stop continuous animation
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // Calculate scroll position
        const itemWidth = 280; // item width
        const gap = 32; // 2rem gap
        const scrollPosition = -(index * (itemWidth + gap));
        
        // Update current position for continuous animation
        currentPosition = scrollPosition;
        
        // Apply transform with smooth transition
        rouletteTrack.style.animation = 'none';
        rouletteTrack.style.transition = 'transform 0.8s ease-in-out';
        rouletteTrack.style.transform = `translateX(${scrollPosition}px)`;
        
        console.log('Applied transform:', scrollPosition + 'px');
    }

    // Update active indicator
    function updateActiveIndicator() {
        const dots = document.querySelectorAll('.roulette-dot');
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentIndex]) {
            dots[currentIndex].classList.add('active');
        }
    }    // Auto-play functionality - Continuous sliding
    let animationFrameId;
    let startTime;
    let currentPosition = 0;
    const totalDistance = uniqueItemCount * (280 + 32); // Total distance to slide through all items
    const slideDuration = 60000; // 60 seconds for full cycle
    
    function startAutoPlay() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        startTime = performance.now();
        
        function animate(currentTime) {
            if (!isAutoPlaying || isManualControl) {
                return;
            }
            
            const elapsed = currentTime - startTime;
            const progress = (elapsed / slideDuration) % 1; // Loop progress from 0 to 1
            currentPosition = -(progress * totalDistance);
            
            // Update transform for continuous movement
            rouletteTrack.style.animation = 'none';
            rouletteTrack.style.transition = 'none';
            rouletteTrack.style.transform = `translateX(${currentPosition}px)`;
            
            // Update active indicator based on position
            const activeIndex = Math.floor(progress * uniqueItemCount) % uniqueItemCount;
            if (activeIndex !== currentIndex) {
                currentIndex = activeIndex;
                updateActiveIndicator();
            }
            
            animationFrameId = requestAnimationFrame(animate);
        }
        
        animationFrameId = requestAnimationFrame(animate);
    }

    // Pause auto play
    function pauseAutoPlay() {
        isAutoPlaying = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        // Store current position for resuming
        const currentTransform = rouletteTrack.style.transform;
        const match = currentTransform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        if (match) {
            currentPosition = parseFloat(match[1]);
        }
    }

    // Resume auto play
    function resumeAutoPlay() {
        isAutoPlaying = true;
        // Calculate how much progress we've made based on current position
        const progress = Math.abs(currentPosition) / totalDistance;
        const elapsedTime = progress * slideDuration;
        
        // Adjust start time to continue from current position
        startTime = performance.now() - elapsedTime;
        
        function animate(currentTime) {
            if (!isAutoPlaying || isManualControl) {
                return;
            }
            
            const elapsed = currentTime - startTime;
            const progress = (elapsed / slideDuration) % 1;
            currentPosition = -(progress * totalDistance);
            
            rouletteTrack.style.animation = 'none';
            rouletteTrack.style.transition = 'none';
            rouletteTrack.style.transform = `translateX(${currentPosition}px)`;
            
            const activeIndex = Math.floor(progress * uniqueItemCount) % uniqueItemCount;
            if (activeIndex !== currentIndex) {
                currentIndex = activeIndex;
                updateActiveIndicator();
            }
            
            animationFrameId = requestAnimationFrame(animate);
        }
        
        animationFrameId = requestAnimationFrame(animate);
    }// Pause on hover
    rouletteTrack.addEventListener('mouseenter', () => {
        pauseAutoPlay();
    });

    rouletteTrack.addEventListener('mouseleave', () => {
        if (!isManualControl) {
            resumeAutoPlay();
        }
    });

    // Initialize
    createIndicators();
    updateActiveIndicator();
    startAutoPlay();
    console.log('SVG Roulette initialized');
}

// TPDM Tooltip functionality
function initTpdmTooltip() {
    const tpdmTooltips = document.querySelectorAll('.tpdm-tooltip');
    
    tpdmTooltips.forEach(tooltip => {
        // Add click event to redirect to about page
        tooltip.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'about.html';
        });
        
        // Add keyboard accessibility
        tooltip.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = 'about.html';
            }
        });
        
        // Make it focusable for keyboard navigation
        tooltip.setAttribute('tabindex', '0');
        tooltip.setAttribute('role', 'button');
        tooltip.setAttribute('aria-label', 'Learn more about Transport Planning and Design Manual - click to go to About page');
    });
    
    console.log('TPDM tooltip initialized');
}
