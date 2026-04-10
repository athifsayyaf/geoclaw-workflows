/* ============================================================
   GeoClaw — Modern Brand Design JS
   ============================================================ */

// ========== NAVBAR SCROLL ==========
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    nav.classList.toggle('scrolled', currentScroll > 40);
    lastScroll = currentScroll;
});

// ========== MOBILE MENU ==========
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// ========== REVEAL ON SCROLL ==========
const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply reveal to major elements
document.querySelectorAll('.tile, .service-row, .approach-card, .stat, .about-card, .section-header').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s`;
    revealObserver.observe(el);
});

// ========== TILE HOVER CURSOR EFFECT ==========
const tiles = document.querySelectorAll('.tile');
tiles.forEach(tile => {
    tile.addEventListener('mousemove', (e) => {
        const rect = tile.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotX = ((y - centerY) / centerY) * -2;
        const rotY = ((x - centerX) / centerX) * 2;
        tile.style.transform = `translateY(-6px) perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    tile.addEventListener('mouseleave', () => {
        tile.style.transform = '';
    });
});

// ========== SMOOTH SCROLL FOR ANCHORS ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ========== FOOTER BRAND PARALLAX ==========
const footerBrand = document.querySelector('.footer-brand h1');
if (footerBrand) {
    window.addEventListener('scroll', () => {
        const rect = footerBrand.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const progress = 1 - (rect.top / window.innerHeight);
            footerBrand.style.transform = `translateY(${progress * -30}px)`;
        }
    });
}

// ========== CONSOLE SIGNATURE ==========
console.log('%cGeoClaw — Satellite Intelligence for Ground Safety', 'color:#1e5f3e;font-size:14px;font-weight:700;');
console.log('%cCrafted with modern web design principles.', 'color:#6b6b6b;font-size:11px;');
