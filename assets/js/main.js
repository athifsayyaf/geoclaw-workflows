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
        card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0, 102, 204, 0.07), var(--bg-alt) 60%)`;
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

// ========== DECK CAROUSEL ==========
const carousel = document.getElementById('carousel');
if (carousel) {
    const track = document.getElementById('carouselTrack');
    const slides = track.querySelectorAll('.slide');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsWrap = document.getElementById('carouselDots');
    const counter = document.getElementById('carouselCounter');
    const total = slides.length;
    let current = 0;
    let autoplayTimer = null;
    const AUTOPLAY_MS = 7000;

    // Build dots
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    }
    const dots = dotsWrap.querySelectorAll('.carousel-dot');

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function update() {
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
        counter.textContent = `${pad(current + 1)} / ${pad(total)}`;
    }

    function goTo(i) {
        current = (i + total) % total;
        update();
        resetAutoplay();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // Keyboard navigation when carousel in view
    document.addEventListener('keydown', (e) => {
        const rect = carousel.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
        if (!inView) return;
        if (e.key === 'ArrowRight') next();
        else if (e.key === 'ArrowLeft') prev();
    });

    // Touch / swipe
    let touchStartX = 0, touchEndX = 0;
    carousel.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) (diff > 0 ? next : prev)();
    }, { passive: true });

    // Autoplay (pauses on hover)
    function startAutoplay() {
        autoplayTimer = setInterval(next, AUTOPLAY_MS);
    }
    function stopAutoplay() {
        if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }
    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // Start once carousel scrolls into view
    const carouselIntersect = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) startAutoplay();
            else stopAutoplay();
        });
    }, { threshold: 0.25 });
    carouselIntersect.observe(carousel);

    update();
}

// ========== CONSOLE SIGNATURE ==========
console.log('%cGeoAgentix — Agentic AI for Satellite Ground Intelligence', 'color:#2563eb;font-size:14px;font-weight:700;');
console.log('%cBuilt with modern web design principles.', 'color:#5b6b80;font-size:11px;');
