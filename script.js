// ===== DOM Elements =====
const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');
const backToTopBtn = document.getElementById('backToTop');
const contactForm = document.getElementById('contactForm');
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const hamburgerIcon = document.querySelector('.hamburger-icon');
const menuLinks = document.querySelector('.menu-links');

// ===== EmailJS Configuration =====
// Inisialisasi EmailJS dengan Public Key Anda
(function() {
    // GANTI DENGAN PUBLIC KEY ANDA dari EmailJS Dashboard
    emailjs.init('SAgyJYBURfhW8zjz9');
})();

// ===== Theme Toggle =====
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update icon
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    // Update mobile icon
    if (themeToggleMobile) {
        const mobileIcon = themeToggleMobile.querySelector('i');
        mobileIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set correct icon
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    if (themeToggleMobile) {
        const mobileIcon = themeToggleMobile.querySelector('i');
        mobileIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ===== Hamburger Menu =====
function toggleMenu() {
    if (hamburgerIcon && menuLinks) {
        hamburgerIcon.classList.toggle('open');
        menuLinks.classList.toggle('open');
    }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (hamburgerIcon && hamburgerIcon.classList.contains('open')) {
        if (!e.target.closest('#hamburger-nav') && !e.target.closest('.menu-links')) {
            toggleMenu();
        }
    }
});

// ===== Back to Top Button =====
function handleScroll() {
    if (!backToTopBtn) return;
    
    // Show/hide back to top button
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
    
    // Add active class to nav links based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        // Desktop nav links
        const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
        if (navLink) {
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
        
        // Mobile nav links
        const mobileNavLink = document.querySelector(`.menu-links a[href="#${sectionId}"]`);
        if (mobileNavLink) {
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                mobileNavLink.classList.add('active');
            } else {
                mobileNavLink.classList.remove('active');
            }
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ===== Project Filter =====
function filterProjects(category) {
    if (!projectCards || projectCards.length === 0) return;
    
    projectCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// ===== Form Validation =====
function validateForm(formData) {
    let isValid = true;
    const errors = [];
    
    // Name validation
    const name = formData.get('name');
    if (!name || !name.trim()) {
        errors.push('Name is required');
        isValid = false;
    } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
        isValid = false;
    }
    
    // Email validation
    const email = formData.get('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Valid email is required');
        isValid = false;
    }
    
    // Message validation
    const message = formData.get('message');
    if (!message || !message.trim()) {
        errors.push('Message is required');
        isValid = false;
    } else if (message.trim().length < 10) {
        errors.push('Message must be at least 10 characters');
        isValid = false;
    }
    
    return { isValid, errors };
}

// ===== Form Submission with EmailJS =====
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!contactForm) return;
    
    const formData = new FormData(e.target);
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        // Tambahkan timestamp ke form data
        formData.append('time', new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }));
        
        // Kirim email menggunakan EmailJS
        // GANTI SERVICE_ID dan TEMPLATE_ID dengan milik Anda
        const response = await emailjs.sendForm(
            'service_bflauor',     // Service ID dari EmailJS
            'template_10cy6yb',    // Template ID dari EmailJS
            e.target                    // Form element
        );
        
        console.log('EmailJS Response:', response);
        
        // Success message
        alert('✅ Thank you! Your message has been sent successfully. I will get back to you soon!');
        e.target.reset();
        
    } catch (error) {
        console.error('EmailJS Error:', error);
        
        // User-friendly error messages
        if (error.status === 0) {
            alert('⚠️ Network error. Please check your internet connection and try again.');
        } else if (error.text) {
            alert(`⚠️ Error: ${error.text}`);
        } else {
            alert('⚠️ Sorry, there was an error sending your message. Please try again.');
        }
        
        // Fallback: Simpan di localStorage untuk debugging
        const formDataObj = Object.fromEntries(formData);
        localStorage.setItem('last_contact_message', JSON.stringify({
            ...formDataObj,
            timestamp: new Date().toISOString()
        }));
        
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ===== Demo Mode (jika tidak menggunakan EmailJS) =====
async function handleSubmitDemo(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        // Simulasi pengiriman
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Success message untuk demo
        alert('✅ Message sent successfully! (Demo Mode)\n\nIn production, this would send to:\ndoshansel@example.com');
        
        // Simpan data untuk debugging
        const formDataObj = Object.fromEntries(formData);
        console.log('Form Data (Demo):', formDataObj);
        
        // Reset form
        e.target.reset();
        
    } catch (error) {
        console.error('Demo Error:', error);
        alert('⚠️ Demo error occurred. Please try again.');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ===== Animate Skills Bars =====
function animateSkills() {
    const skillBars = document.querySelectorAll('.skill-progress');
    if (!skillBars || skillBars.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.style.width;
                entry.target.style.width = '0';
                
                setTimeout(() => {
                    entry.target.style.transition = 'width 1.5s ease';
                    entry.target.style.width = width;
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => observer.observe(bar));
}

// ===== Typing Effect =====
function typeWriter() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }
    
    // Start typing when hero section is in view
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            setTimeout(type, 500);
            observer.unobserve(entries[0].target);
        }
    }, { threshold: 0.5 });
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        observer.observe(heroSection);
    }
}

// ===== Floating Icons Animation =====
function initFloatingIcons() {
    const floatingIcons = document.querySelectorAll('.icon-float');
    if (!floatingIcons || floatingIcons.length === 0) return;
    
    floatingIcons.forEach((icon, index) => {
        // Set animation delay
        icon.style.animationDelay = `${index * 1.5}s`;
        
        // Add hover effect
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'scale(1.15) rotate(10deg)';
            icon.style.zIndex = '12';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = '';
            icon.style.zIndex = '11';
        });
    });
}

// ===== Initialize Everything =====
function init() {
    console.log('Initializing portfolio...');
    
    // Initialize theme
    initTheme();
    
    // Event Listeners
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }
    
    window.addEventListener('scroll', handleScroll);
    
    // Project filtering
    if (filterBtns && filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter projects
                const filterCategory = btn.dataset.filter || 'all';
                filterProjects(filterCategory);
            });
        });
    }
    
    // Form submission - Gunakan salah satu:
    if (contactForm) {
        // Pilih salah satu:
        // 1. Untuk EmailJS (produksi)
        contactForm.addEventListener('submit', handleSubmit);
        
        // 2. Untuk Demo (testing)
        // contactForm.addEventListener('submit', handleSubmitDemo);
    }
    
    // Hamburger menu
    if (hamburgerIcon) {
        hamburgerIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }
    
    // Close menu when clicking a link
    document.querySelectorAll('.menu-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburgerIcon && hamburgerIcon.classList.contains('open')) {
                toggleMenu();
            }
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (hamburgerIcon && hamburgerIcon.classList.contains('open')) {
                    toggleMenu();
                }
            }
        });
    });
    
    // Initialize animations
    animateSkills();
    typeWriter();
    initFloatingIcons();
    
    // Set initial scroll state
    handleScroll();
    
    // Log initialization
    console.log('Portfolio initialized successfully!');
}

// ===== Run when DOM is loaded =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}

// ===== Performance Optimizations =====

// Debounce scroll events
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleScroll, 100);
});

// Lazy load images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize lazy loading after DOM is ready
setTimeout(initLazyLoading, 1000);

// ===== Add CSS for loaded images =====
const style = document.createElement('style');
style.textContent = `
    img[data-src] {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    img.loaded {
        opacity: 1;
    }
    
    /* Smooth transitions */
    .certification-card,
    .project-card,
    .skill-category {
        transition: all 0.3s ease;
    }
    
    /* Active nav link styling */
    .nav-links a.active {
        color: var(--primary-color);
        font-weight: 600;
    }
    
    .nav-links a.active::after {
        width: 100%;
    }
    
    .menu-links a.active {
        background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
        color: var(--primary-color);
    }
    
    /* Loading spinner */
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Back to top button */
    .back-to-top {
        transition: all 0.3s ease;
    }
    
    .back-to-top.show {
        display: flex;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// ===== Error Handling =====
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// ===== Responsive Checks =====
function checkResponsive() {
    const isMobile = window.innerWidth <= 991;
    
    if (isMobile) {
        // Mobile-specific adjustments
        document.body.classList.add('is-mobile');
    } else {
        document.body.classList.remove('is-mobile');
    }
}

// Check on load and resize
checkResponsive();
window.addEventListener('resize', checkResponsive);

// ===== Utility Functions =====
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

// ===== Export for module usage (optional) =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleTheme,
        toggleMenu,
        handleSubmit,
        handleSubmitDemo,
        filterProjects,
        animateSkills,
        typeWriter
    };
}