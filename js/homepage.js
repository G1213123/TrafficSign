// Homepage JavaScript - Interactive Elements and Animations

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
    const demoButtons = document.querySelectorAll('.demo-btn');
    const demoContent = document.getElementById('demo-sign-content');
    
    if (!demoContent) return;
    
    demoButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            demoButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const demoType = this.dataset.demo;
            simulateDemo(demoType, demoContent);
        });
    });
}

// Demo simulation functions
function simulateDemo(type, content) {
    switch(type) {
        case 'symbol':
            simulateAddSymbol(content);
            break;
        case 'text':
            simulateAddText(content);
            break;
        case 'drag':
            simulateDragDrop(content);
            break;
        case 'border':
            simulateAddBorder(content);
            break;
        case 'reset':
            resetDemo(content);
            break;
    }
}

function simulateAddSymbol(content) {
    content.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
            <div style="font-size: 4rem; color: #dc2626; margin-bottom: 1rem;">🛑</div>
            <div style="color: #374151; font-weight: 600;">STOP</div>
            <div style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">Symbol added successfully!</div>
        </div>
    `;
}

function simulateAddText(content) {
    content.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
            <div style="font-size: 2rem; color: #1f2937; font-weight: bold; margin-bottom: 1rem;">HIGHWAY 101</div>
            <div style="font-size: 1.25rem; color: #374151;">Next Exit 2 km</div>
            <div style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">Text added with professional typography!</div>
        </div>
    `;
}

function simulateDragDrop(content) {
    content.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; position: relative;">
            <div id="draggable-demo" style="padding: 1rem; background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 8px; cursor: move; transition: all 0.3s ease;">
                <div style="font-size: 1.5rem;">📍</div>
                <div style="font-size: 0.875rem; color: #92400e;">Drag me around!</div>
            </div>
        </div>
    `;
    
    // Add simple drag simulation
    const draggable = document.getElementById('draggable-demo');
    let isMoving = false;
    
    const animateDrag = () => {
        if (isMoving) return;
        isMoving = true;
        
        const positions = [
            { x: 0, y: 0 },
            { x: 50, y: -30 },
            { x: -30, y: 40 },
            { x: 0, y: 0 }
        ];
        
        let index = 0;
        const moveInterval = setInterval(() => {
            if (index < positions.length) {
                draggable.style.transform = `translate(${positions[index].x}px, ${positions[index].y}px)`;
                index++;
            } else {
                clearInterval(moveInterval);
                isMoving = false;
            }
        }, 800);
    };
    
    setTimeout(animateDrag, 500);
}

function simulateAddBorder(content) {
    content.style.border = '4px solid #dc2626';
    content.style.borderRadius = '12px';
    content.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
            <div style="color: #dc2626; font-weight: bold; font-size: 1.5rem;">WARNING</div>
            <div style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">Custom border applied!</div>
        </div>
    `;
}

function resetDemo(content) {
    content.style.border = '2px solid var(--border-color)';
    content.style.borderRadius = '8px';
    content.innerHTML = `
        <div class="demo-placeholder-text">
            Click any button above to see the feature in action
        </div>
    `;
    
    // Remove active class from all buttons
    document.querySelectorAll('.demo-btn').forEach(btn => btn.classList.remove('active'));
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
