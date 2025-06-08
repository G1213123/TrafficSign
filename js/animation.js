// Animation System - Fade-in effects for all pages
// This script provides a common fade-in animation system for all pages

document.addEventListener('DOMContentLoaded', function() {
    console.log('Animation system loading...');
    initCommonScrollAnimations();
    console.log('Animation system initialized');
});

// Expose the function globally so other scripts can use it
window.initCommonScrollAnimations = initCommonScrollAnimations;

function initCommonScrollAnimations() {
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

    // Define selectors for elements that should animate on each page
    let animatedSelectors = [
        // Common elements across all pages
        '.feature-card',
        '.step-card', 
        '.demo-item',
        '.demo-container',
        '.about-text',
        '.about-visual',
        '.svg-gallery',
        
        // About page specific
        '.about-feature',
        '.about-intro-section',
        '.timeline-item',
        '.timeline',
        '.about-detailed',
        '.intro-image',
        '.timeline-image',
        
        // Getting Started page specific
        '.tutorial-section',
        '.video-placeholder',
        '.image-placeholder',
        '.tips-section',
        '.tip-item',
        '.steps-grid > div',
        
        // Changelog page specific
        '.changelog-entry',
        '.changelog-intro',
        '.changelog-cta',
        '.version-tag',
        
        // General content sections
        '.section-title',
        '.section-subtitle',
        '.hero-content',
        '.content-section',
        '.cta-section',
        '.footer-section'
    ];

    // Find all elements that match any of the selectors
    const animatedElements = document.querySelectorAll(animatedSelectors.join(', '));
    
    console.log(`Found ${animatedElements.length} elements to animate`);
    
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}
