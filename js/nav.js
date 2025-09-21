// Navigation + i18n bootstrap for non-homepage pages
import { i18n } from './i18n/i18n.js';

function bootstrapNavAndI18n() {
    // Prevent double-initialization if script is injected twice
    if (window.__navInitDone) {
        return;
    }
    window.__navInitDone = true;

    try {
        const saved = localStorage.getItem('appSettings');
        const loc = saved ? (JSON.parse(saved).locale || 'en') : 'en';
        i18n.setLocale(loc);
    } catch (_) {
        i18n.setLocale('en');
    }
    i18n.applyTranslations(document);
    initLanguageSwitcher();
    initMobileNavigation();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapNavAndI18n);
} else {
    // If DOM is already ready (script at end of body), initialize immediately
    bootstrapNavAndI18n();
}

function initLanguageSwitcher() {
    const btnEn = document.getElementById('lang-en');
    const btnZh = document.getElementById('lang-zh');
    const updateActive = () => {
        const loc = i18n.getLocale();
        if (btnEn && btnZh) {
            btnEn.classList.toggle('active', loc === 'en');
            btnZh.classList.toggle('active', loc === 'zh');
        }
    };
    const setLocaleAndPersist = (loc) => {
        i18n.setLocale(loc);
        try {
            const saved = localStorage.getItem('appSettings');
            const obj = saved ? JSON.parse(saved) : {};
            obj.locale = loc;
            localStorage.setItem('appSettings', JSON.stringify(obj));
        } catch (_) {}
        i18n.applyTranslations(document);
        updateActive();
    };
    if (btnEn) btnEn.addEventListener('click', () => setLocaleAndPersist('en'));
    if (btnZh) btnZh.addEventListener('click', () => setLocaleAndPersist('zh'));
    updateActive();
}

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
