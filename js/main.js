/* ============================================
   AQNIYET — Portfolio JS (99th percentile)
   GSAP + ScrollTrigger + Lenis
   ============================================ */
;(function () {
  'use strict';

  const CFG = {
    scrambleChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>{}[]',
    scrambleDuration: 600,
    scrambleInterval: 30,
    magneticRadius: 0.35,
  };

  /* ----- UTILITIES ----- */
  function scrambleText(el, finalText, opts = {}) {
    const duration = opts.duration || CFG.scrambleDuration;
    const interval = opts.interval || CFG.scrambleInterval;
    const chars = CFG.scrambleChars;
    const len = finalText.length;
    let frame = 0;
    const totalFrames = Math.ceil(duration / interval);

    return new Promise(resolve => {
      const timer = setInterval(() => {
        let str = '';
        for (let i = 0; i < len; i++) {
          const revealAt = Math.floor((i / len) * totalFrames);
          str += frame >= revealAt ? finalText[i] : chars[Math.floor(Math.random() * chars.length)];
        }
        el.textContent = str;
        frame++;
        if (frame > totalFrames) {
          clearInterval(timer);
          el.textContent = finalText;
          resolve();
        }
      }, interval);
    });
  }

  function splitTextToChars(el) {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    const chars = [];
    text.split(' ').forEach((word, wi, arr) => {
      const wrap = document.createElement('span');
      wrap.style.cssText = 'white-space:nowrap;display:inline';
      for (const ch of word) {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        wrap.appendChild(span);
        chars.push(span);
      }
      el.appendChild(wrap);
      if (wi < arr.length - 1) {
        const space = document.createElement('span');
        space.className = 'char';
        space.innerHTML = '&nbsp;';
        el.appendChild(space);
        chars.push(space);
      }
    });
    return chars;
  }

  /* ----- LENIS SMOOTH SCROLL ----- */
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), touchMultiplier: 2 });
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) lenis.scrollTo(target, { offset: -60 });
        const navLinks = document.querySelector('.nav-links');
        const navToggle = document.querySelector('.nav-toggle');
        if (navLinks && navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          navToggle.classList.remove('open');
        }
      });
    });
  }

  /* ----- NAVIGATION ----- */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 'top -80',
      onUpdate(self) {
        nav.classList.toggle('scrolled', self.scroll() > 80);
      }
    });

    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
      });
    }
  }

  /* ----- HERO ----- */
  function initHero() {
    const heroName = document.querySelector('.hero-name');
    const heroSub = document.querySelector('.hero-sub');
    const heroLine = document.querySelector('.hero-line');
    const scrollHint = document.querySelector('.scroll-hint');
    const tl = gsap.timeline({ delay: 0.2 });

    // Scramble hero name
    if (heroName) {
      const finalName = heroName.dataset.text || heroName.textContent;
      heroName.textContent = '';
      tl.add(() => {
        heroName.style.opacity = '1';
        scrambleText(heroName, finalName, { duration: 800 });
      });
    }

    // Scramble subtitle
    if (heroSub) {
      const finalSub = heroSub.dataset.text || heroSub.textContent;
      heroSub.style.opacity = '0';
      tl.add(() => {
        heroSub.style.opacity = '1';
        scrambleText(heroSub, finalSub, { duration: 800 });
      }, '+=0.3');
    }

    // Line draw
    if (heroLine) {
      tl.to(heroLine, { width: '80px', duration: 0.8, ease: 'power2.out' }, '-=0.5');
    }

    // Scroll hint fade in
    if (scrollHint) {
      tl.to(scrollHint, { opacity: 1, duration: 0.6 }, '-=0.2');

      // Fade out on scroll
      ScrollTrigger.create({
        start: 'top -100',
        onEnter() { gsap.to(scrollHint, { opacity: 0, duration: 0.3 }); },
        onLeaveBack() { gsap.to(scrollHint, { opacity: 1, duration: 0.3 }); },
      });
    }

    // Parallax
    if (heroName) {
      gsap.to(heroName, {
        yPercent: 30, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
    if (heroSub) {
      gsap.to(heroSub, {
        yPercent: 50, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  }

  /* ----- REVEALS ----- */
  function initReveals() {
    ScrollTrigger.batch('.reveal', {
      onEnter(batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' });
      },
      start: 'top 88%',
      once: true
    });

    // Colored section dividers
    document.querySelectorAll('.section-divider').forEach(line => {
      gsap.to(line, {
        scaleX: 1, duration: 1.2, ease: 'power3.inOut',
        scrollTrigger: { trigger: line, start: 'top 92%', once: true }
      });
    });
  }

  /* ----- PROJECTS / CASE STUDY ----- */
  function initProjects() {
    // Project card border draw + hover scramble
    document.querySelectorAll('.project-card').forEach(card => {
      const nameEl = card.querySelector('.project-name');
      if (nameEl) {
        const originalText = nameEl.textContent;
        card.addEventListener('mouseenter', () => scrambleText(nameEl, originalText, { duration: 400 }));
      }
      ScrollTrigger.create({
        trigger: card, start: 'top 85%', once: true,
        onEnter() { card.classList.add('in-view'); }
      });
    });

    // Module cards — staggered reveal
    document.querySelectorAll('.case-module').forEach((mod, i) => {
      gsap.fromTo(mod,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: i * 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: mod, start: 'top 90%', once: true } }
      );
    });
  }

  /* ----- MAGNETIC BUTTONS ----- */
  function initMagnetic() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.cta-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * CFG.magneticRadius, y: y * CFG.magneticRadius, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ----- CONTACT HEADLINE ----- */
  function initContact() {
    const headline = document.querySelector('.contact-headline');
    if (!headline) return;

    const chars = splitTextToChars(headline);

    ScrollTrigger.create({
      trigger: headline, start: 'top 80%', once: true,
      onEnter() {
        gsap.to(chars, { opacity: 1, y: 0, duration: 0.6, stagger: 0.02, ease: 'power3.out' });
      }
    });
  }

  /* ----- INIT ----- */
  function init() {
    gsap.registerPlugin(ScrollTrigger);
    initLenis();
    initNav();
    initHero();
    initReveals();
    initProjects();
    initMagnetic();
    initContact();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.fonts && document.fonts.ready ? document.fonts.ready.then(init) : init();
    });
  } else {
    document.fonts && document.fonts.ready ? document.fonts.ready.then(init) : init();
  }

})();
