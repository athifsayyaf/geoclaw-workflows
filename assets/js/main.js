/* ============================================================
   GeoAgentix — Modern Brand Design JS
   ============================================================ */

// ========== NAVBAR SCROLL ==========
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
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
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.tile, .service-row, .approach-card, .stat, .about-card, .section-header, .offer-card, .data-item').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s`;
    revealObserver.observe(el);
});

// ========== TILE TILT EFFECT ==========
document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('mousemove', (e) => {
        const rect = tile.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotX = ((e.clientY - rect.top - centerY) / centerY) * -3;
        const rotY = ((e.clientX - rect.left - centerX) / centerX) * 3;
        tile.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    tile.addEventListener('mouseleave', () => { tile.style.transform = ''; });
});

// ========== OFFER CARD CURSOR-GLOW MICROINTERACTION ==========
document.querySelectorAll('.offer-card, .approach-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(45, 134, 89, 0.08), var(--bg-alt) 60%)`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
});

// ========== STAT NUMBER COUNT-UP ON REVEAL ==========
const statNums = document.querySelectorAll('.stat-num, .about-card-num, .ss-num');
const countUp = (el) => {
    const text = el.textContent.trim();
    const match = text.match(/^([±><~]?)(\d+(\.\d+)?)([^\d].*)?$/);
    if (!match) return;
    const prefix = match[1] || '';
    const target = parseFloat(match[2]);
    const suffix = match[4] || '';
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.textContent = prefix + (target % 1 === 0 ? Math.round(value) : value.toFixed(1)) + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = text;
    };
    requestAnimationFrame(tick);
};
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            countUp(entry.target);
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.4 });
statNums.forEach(el => statObserver.observe(el));

// ========== SMOOTH SCROLL FOR ANCHORS ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }
    });
});

// ========== PARALLAX (footer brand + hero globe + section eyebrows) ==========
const footerBrand = document.querySelector('.footer-brand h1');
const heroGlobe = document.querySelector('.hero-globe');
const ctaGlobe = document.querySelector('.cta-globe');

let parallaxTicking = false;
function onScrollParallax() {
    if (parallaxTicking) return;
    parallaxTicking = true;
    requestAnimationFrame(() => {
        const y = window.scrollY;

        if (footerBrand) {
            const rect = footerBrand.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const progress = 1 - (rect.top / window.innerHeight);
                footerBrand.style.transform = `translateY(${progress * -30}px)`;
            }
        }
        if (heroGlobe && y < window.innerHeight * 1.5) {
            heroGlobe.style.transform = `translateY(calc(-50% + ${y * 0.18}px))`;
        }
        if (ctaGlobe) {
            const rect = ctaGlobe.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const offset = (rect.top - window.innerHeight / 2) * 0.08;
                ctaGlobe.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
            }
        }
        parallaxTicking = false;
    });
}
window.addEventListener('scroll', onScrollParallax, { passive: true });

// ========== CONTACT FORM ==========
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(contactForm);
        const details = [
            `Name: ${formData.get('name') || ''}`,
            `Email: ${formData.get('email') || ''}`,
            `Phone: ${formData.get('phone') || ''}`,
            `Company: ${formData.get('company') || ''}`,
            '',
            'Message:',
            formData.get('message') || ''
        ].join('\n');
        const subject = encodeURIComponent('GeoAgentix website contact request');
        const body = encodeURIComponent(details);
        window.location.href = `mailto:athif.sayyaf@geoagentix.com?subject=${subject}&body=${body}`;
    });
}

// ========== CONSOLE SIGNATURE ==========
console.log('%cGeoAgentix — Agentic AI for Satellite Ground Intelligence', 'color:#1e5f3e;font-size:14px;font-weight:700;');
console.log('%cBuilt with modern web design principles.', 'color:#5b6b80;font-size:11px;');
