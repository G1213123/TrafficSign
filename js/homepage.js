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
    // Demo canvas interactions
    const demoCanvases = document.querySelectorAll('.demo-canvas');
    
    demoCanvases.forEach((canvas, index) => {
        const placeholder = canvas.querySelector('.demo-placeholder');
        
        canvas.addEventListener('click', function() {
            switch(index) {
                case 0:
                    simulateAddSymbol(canvas, placeholder);
                    break;
                case 1:
                    simulateDragDrop(canvas, placeholder);
                    break;
                case 2:
                    simulateTextAdd(canvas, placeholder);
                    break;
                case 3:
                    simulateBorderAdd(canvas, placeholder);
                    break;
            }
        });
        
        // Reset on mouse leave
        canvas.addEventListener('mouseleave', function() {
            setTimeout(() => resetDemo(canvas, placeholder), 2000);
        });
    });
}

// Demo simulation functions
function simulateAddSymbol(canvas, placeholder) {
    placeholder.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i><p>Symbol Added!</p>';
    canvas.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    
    // Add a simple animation
    const icon = placeholder.querySelector('i');
    icon.style.transform = 'scale(1.2)';
    setTimeout(() => {
        icon.style.transform = 'scale(1)';
    }, 200);
}

function simulateDragDrop(canvas, placeholder) {
    placeholder.innerHTML = '<i class="fas fa-arrows-alt"></i><p>Dragging...</p>';
    canvas.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    
    // Simulate movement
    let position = 0;
    const interval = setInterval(() => {
        position += 10;
        placeholder.style.transform = `translateX(${Math.sin(position * 0.1) * 20}px)`;
        if (position > 100) {
            clearInterval(interval);
            placeholder.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i><p>Snapped to Grid!</p>';
            placeholder.style.transform = 'translateX(0)';
        }
    }, 50);
}

function simulateTextAdd(canvas, placeholder) {
    placeholder.innerHTML = '<i class="fas fa-keyboard"></i><p>Typing...</p>';
    canvas.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    
    const texts = ['A', 'AB', 'ABC', 'ABCD', 'ROAD SIGN'];
    let textIndex = 0;
    
    const interval = setInterval(() => {
        placeholder.innerHTML = `<i class="fas fa-font"></i><p>${texts[textIndex]}</p>`;
        textIndex++;
        if (textIndex >= texts.length) {
            clearInterval(interval);
            setTimeout(() => {
                placeholder.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i><p>Text Added!</p>';
            }, 500);
        }
    }, 300);
}

function simulateBorderAdd(canvas, placeholder) {
    placeholder.innerHTML = '<i class="fas fa-square"></i><p>Adding Border...</p>';
    canvas.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    
    // Simulate border drawing
    canvas.style.border = '4px solid #f59e0b';
    setTimeout(() => {
        placeholder.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i><p>Border Complete!</p>';
    }, 1000);
}

function resetDemo(canvas, placeholder) {
    // Reset to original state
    const originalContent = {
        0: '<i class="fas fa-plus-circle"></i><p>Click & Add Symbols</p>',
        1: '<i class="fas fa-arrows-alt"></i><p>Drag & Drop</p>',
        2: '<i class="fas fa-font"></i><p>Add Text</p>',
        3: '<i class="fas fa-border-style"></i><p>Custom Borders</p>'
    };
    
    const index = Array.from(document.querySelectorAll('.demo-canvas')).indexOf(canvas);
    placeholder.innerHTML = originalContent[index];
    placeholder.style.transform = 'translateX(0)';
    canvas.style.background = 'linear-gradient(135deg, #f1f5f9, #e2e8f0)';
    canvas.style.border = 'none';
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
