/**
 * Arpan Portfolio - JavaScript
 * Handles smooth scrolling, mobile navigation, and scroll animations
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // Navigation Scroll Effect
    // ========================================
    const navbar = document.getElementById('navbar');
    
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Throttle scroll events for better performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial check
    handleScroll();
    
    // ========================================
    // Mobile Navigation Toggle
    // ========================================
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = navLinks.querySelectorAll('a');
    
    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu when clicking a link
    navLinkItems.forEach(function(link) {
        link.addEventListener('click', function() {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navLinks.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // ========================================
    // Smooth Scrolling for Anchor Links
    // ========================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                event.preventDefault();
                
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========================================
    // Intersection Observer for Fade-in Animations
    // ========================================
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger animation when element is 100px from bottom
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);
    
    fadeElements.forEach(function(element) {
        observer.observe(element);
    });
    
    // ========================================
    // Active Navigation Link Highlighting
    // ========================================
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavLink() {
        const scrollPosition = window.scrollY + navbarHeight + 100;
        
        sections.forEach(function(section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinkItems.forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Get navbar height after it's rendered
    let navbarHeight = navbar.offsetHeight;
    
    // Update navbar height on resize
    window.addEventListener('resize', function() {
        navbarHeight = navbar.offsetHeight;
    });
    
    // Add scroll listener for active link highlighting
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                highlightNavLink();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // ========================================
    // Add active class styling for nav links
    // ========================================
    const style = document.createElement('style');
    style.textContent = `
        .nav-links a.active {
            color: var(--color-black);
        }
        .nav-links a.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(style);
    
    // ========================================
    // Performance: Lazy loading for images
    // ========================================
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(function(img) {
            img.src = img.dataset.src;
        });
    }
    
    // ========================================
    // Console message for developers
    // ========================================
    console.log('%cArpan Portfolio', 'font-size: 20px; font-weight: bold; color: #0071e3;');
    console.log('%cPremium Video Editing Services', 'font-size: 14px; color: #888888;');
    
});
