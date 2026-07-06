var contactForm = document.getElementById('contactForm');
var hamburgerIcon = document.querySelector('.hamburger-icon');

(function () {
    emailjs.init('SAgyJYBURfhW8zjz9');
})();

function validateForm(formData) {
    let isValid = true;
    const errors = [];
    const name = formData.get('name');
    if (!name || !name.trim()) {
        errors.push('Name is required');
        isValid = false;
    } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
        isValid = false;
    }
    const email = formData.get('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Valid email is required');
        isValid = false;
    }
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
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    try {
        formData.append('time', new Date().toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }));
        await emailjs.sendForm('service_bflauor', 'template_10cy6yb', e.target);
        alert('Thank you! Your message has been sent successfully. I will get back to you soon!');
        e.target.reset();
    } catch (error) {
        if (error.status === 0) {
            alert('Network error. Please check your internet connection and try again.');
        } else if (error.text) {
            alert('Error: ' + error.text);
        } else {
            alert('Sorry, there was an error sending your message. Please try again.');
        }
        const formDataObj = Object.fromEntries(formData);
        localStorage.setItem('last_contact_message', JSON.stringify({
            ...formDataObj,
            timestamp: new Date().toISOString()
        }));
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function initFloatingIcons() {
    const floatingIcons = document.querySelectorAll('.icon-float');
    if (!floatingIcons || floatingIcons.length === 0) return;
    floatingIcons.forEach(function (icon, index) {
        icon.style.animationDelay = index * 1.5 + 's';
        icon.addEventListener('mouseenter', function () {
            icon.style.transform = 'scale(1.15) rotate(10deg)';
            icon.style.zIndex = '12';
        });
        icon.addEventListener('mouseleave', function () {
            icon.style.transform = '';
            icon.style.zIndex = '11';
        });
    });
}

function init() {
    if (contactForm) contactForm.addEventListener('submit', handleSubmit);
    if (hamburgerIcon) {
        hamburgerIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMenu();
        });
    }
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                var header = document.querySelector('header');
                var headerHeight = header ? header.offsetHeight : 80;
                window.scrollTo({ top: targetElement.offsetTop - headerHeight, behavior: 'smooth' });
                if (hamburgerIcon && hamburgerIcon.classList.contains('open')) toggleMenu();
            }
        });
    });
    initFloatingIcons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

var style = document.createElement('style');
style.textContent = [
    '.nav-links a.active { color: var(--primary-color); font-weight: 600; }',
    '.nav-links a.active::after { width: 100%; }',
    '.menu-links a.active { background-color: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }',
    '.back-to-top { transition: all 0.3s ease; }',
    '.back-to-top.show { display: flex; animation: fadeIn 0.3s ease; }',
    '@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }'
].join('\n');
document.head.appendChild(style);
