// Simple Navigation JavaScript for non-homepage pages
// Mobile navigation functionality only

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page DOM loaded - initializing navigation');
    initMobileNavigation();
});

// Mobile navigation
function initMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        console.log('Navigation elements found, setting up mobile nav');
        
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            console.log('Nav toggled, active:', navMenu.classList.contains('active'));
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
    } else {
        console.warn('Navigation elements not found');
    }
}
