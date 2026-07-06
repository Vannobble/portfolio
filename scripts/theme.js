var themeToggle = document.getElementById('themeToggle');
var themeToggleMobile = document.getElementById('themeToggleMobile');
var themeToggleMobileOutside = document.getElementById('themeToggleMobileOutside');
var backToTopBtn = document.getElementById('backToTop');
var hamburgerIcon = document.querySelector('.hamburger-icon');
var menuLinks = document.querySelector('.menu-links');

function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    var moon = '<i class="fas fa-moon"></i>';
    var sun = '<i class="fas fa-sun"></i>';
    if (themeToggle) themeToggle.innerHTML = theme === 'light' ? moon : sun;
    if (themeToggleMobile) themeToggleMobile.innerHTML = theme === 'light' ? moon + ' Toggle Theme' : sun + ' Toggle Theme';
    if (themeToggleMobileOutside) themeToggleMobileOutside.innerHTML = theme === 'light' ? moon : sun;
}

function initTheme() {
    var saved = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
}

function toggleMenu() {
    if (hamburgerIcon && menuLinks) {
        hamburgerIcon.classList.toggle('open');
        menuLinks.classList.toggle('open');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleScroll() {
    if (backToTopBtn) {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
    var sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;
    var scrollPos = window.scrollY + 100;
    sections.forEach(function (section) {
        var id = section.getAttribute('id');
        var top = section.offsetTop;
        var h = section.clientHeight;
        var match = scrollPos >= top && scrollPos < top + h;
        document.querySelectorAll('.nav-links a[href="#' + id + '"]').forEach(function (a) {
            a.classList.toggle('active', match);
        });
        document.querySelectorAll('.menu-links a[href="#' + id + '"]').forEach(function (a) {
            a.classList.toggle('active', match);
        });
    });
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);
if (themeToggleMobileOutside) themeToggleMobileOutside.addEventListener('click', toggleTheme);
if (backToTopBtn) backToTopBtn.addEventListener('click', scrollToTop);
window.addEventListener('scroll', handleScroll);

document.addEventListener('click', function (e) {
    if (hamburgerIcon && hamburgerIcon.classList.contains('open') &&
        !e.target.closest('#hamburger-nav') && !e.target.closest('.menu-links')) {
        toggleMenu();
    }
});

document.querySelectorAll('.menu-links a').forEach(function (link) {
    link.addEventListener('click', function () {
        if (hamburgerIcon && hamburgerIcon.classList.contains('open')) toggleMenu();
    });
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        initTheme();
        handleScroll();
    });
} else {
    initTheme();
    handleScroll();
}
