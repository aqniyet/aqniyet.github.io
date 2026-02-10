/* ============================================
   AQNIYET — Portfolio JS
   Single IIFE, GSAP + ScrollTrigger + Lenis
   ============================================ */
;(function () {
  'use strict';

  /* -----------------------------------------
     1. CONFIG
     ----------------------------------------- */
  const CFG = {
    scrambleChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>{}[]',
    scrambleDuration: 600,   // ms per character slot
    scrambleInterval: 30,    // ms between random swaps
    loaderDuration: 2000,    // total loader time
    cursorLag: 0.15,         // lerp factor for ring
    tiltMax: 3,              // degrees
    magneticRadius: 0.4,     // proportion of element size
    parallaxHero: 100,       // px travel for hero parallax
  };

  /* -----------------------------------------
     2. UTILITIES
     ----------------------------------------- */
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
          if (frame >= revealAt) {
            str += finalText[i];
          } else {
            str += chars[Math.floor(Math.random() * chars.length)];
          }
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
    const words = text.split(' ');
    words.forEach((word, wi) => {
      const wordWrap = document.createElement('span');
      wordWrap.style.whiteSpace = 'nowrap';
      wordWrap.style.display = 'inline';
      for (const ch of word) {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        wordWrap.appendChild(span);
        chars.push(span);
      }
      el.appendChild(wordWrap);
      if (wi < words.length - 1) {
        const space = document.createElement('span');
        space.className = 'char';
        space.innerHTML = '&nbsp;';
        el.appendChild(space);
        chars.push(space);
      }
    });
    return chars;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  }

  /* -----------------------------------------
     3. LOADER / BOOT SEQUENCE
     ----------------------------------------- */
  function initLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return Promise.resolve();

    const lines = loader.querySelectorAll('.loader-line');
    const barTrack = loader.querySelector('.loader-bar-track');
    const barFill = loader.querySelector('.loader-bar-fill');

    const tl = gsap.timeline();

    lines.forEach((line, i) => {
      tl.to(line, {
        opacity: 1, y: 0, duration: 0.3, ease: 'power2.out'
      }, i * 0.35);
    });

    tl.to(barTrack, { opacity: 1, duration: 0.2 }, lines.length * 0.35);
    tl.to(barFill, { width: '100%', duration: 0.8, ease: 'power1.inOut' }, '>');
    tl.to(loader, {
      yPercent: -100,
      duration: 0.6,
      ease: 'power3.inOut',
      delay: 0.2,
      onComplete() {
        loader.style.display = 'none';
      }
    });

    return tl;
  }

  /* -----------------------------------------
     4. LENIS SMOOTH SCROLL
     ----------------------------------------- */
  let lenisInstance = null;

  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    // Sync Lenis with GSAP ticker
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Anchor scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) lenisInstance.scrollTo(target, { offset: -60 });

        // Close mobile nav if open
        const navLinks = document.querySelector('.nav-links');
        const navToggle = document.querySelector('.nav-toggle');
        if (navLinks && navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          navToggle.classList.remove('open');
        }
      });
    });
  }

  /* -----------------------------------------
     5. CUSTOM CURSOR
     ----------------------------------------- */
  function initCursor() {
    if (window.matchMedia('(hover: none)').matches || window.innerWidth < 769) return;

    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      gsap.set(dot, { x: mx, y: my });
    });

    gsap.ticker.add(() => {
      rx = lerp(rx, mx, CFG.cursorLag);
      ry = lerp(ry, my, CFG.cursorLag);
      gsap.set(ring, { x: rx, y: ry });
    });

    // Expand on interactive elements
    const interactives = 'a, button, [data-magnetic], .project-card, .contact-item, .resume-link, .cta-btn';
    document.querySelectorAll(interactives).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('expand'));
      el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
    });
  }

  /* -----------------------------------------
     6. NAVIGATION SCROLL STATE
     ----------------------------------------- */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 'top -80',
      onUpdate(self) {
        if (self.direction === 1 && self.scroll() > 80) {
          nav.classList.add('scrolled');
        } else if (self.scroll() <= 80) {
          nav.classList.remove('scrolled');
        }
      }
    });

    // Mobile toggle
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
      });
    }
  }

  /* -----------------------------------------
     7. HERO ANIMATIONS
     ----------------------------------------- */
  function initHero(loaderTl) {
    const heroName = document.querySelector('.hero-name');
    const heroSub = document.querySelector('.hero-sub');
    const heroLine = document.querySelector('.hero-line');

    const afterLoader = loaderTl
      ? loaderTl.then ? loaderTl : new Promise(r => loaderTl.eventCallback('onComplete', r))
      : Promise.resolve();

    // Wrap afterLoader to handle both gsap timeline and promise
    const start = () => {
      // Scramble hero name
      if (heroName) {
        const finalName = heroName.dataset.text || heroName.textContent;
        heroName.textContent = '';
        scrambleText(heroName, finalName, { duration: 800 });
      }

      // Scramble subtitle
      if (heroSub) {
        const finalSub = heroSub.dataset.text || heroSub.textContent;
        heroSub.style.opacity = '0';
        setTimeout(() => {
          heroSub.style.opacity = '1';
          scrambleText(heroSub, finalSub, { duration: 1000 });
        }, 400);
      }

      // Animate line
      if (heroLine) {
        gsap.to(heroLine, {
          width: '80px',
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.8
        });
      }

      // Reveal triptych — staggered fade up
      const portraits = document.querySelectorAll('.hero-bg');
      if (portraits.length) {
        gsap.fromTo(portraits,
          { opacity: 0, y: 80 },
          { opacity: 0.2, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.4, stagger: 0.2 }
        );
      }
    };

    if (afterLoader && afterLoader.then) {
      afterLoader.then(start);
    } else {
      start();
    }

    // Parallax on hero elements
    if (heroName) {
      gsap.to(heroName, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    if (heroSub) {
      gsap.to(heroSub, {
        yPercent: 50,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  /* -----------------------------------------
     8. SCROLLTRIGGER BATCH REVEALS
     ----------------------------------------- */
  function initReveals() {
    // Reveal up
    ScrollTrigger.batch('.reveal', {
      onEnter(batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out'
        });
      },
      start: 'top 88%',
      once: true
    });

    // Reveal left
    ScrollTrigger.batch('.reveal--left', {
      onEnter(batch) {
        gsap.to(batch, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out'
        });
      },
      start: 'top 88%',
      once: true
    });

    // Reveal right
    ScrollTrigger.batch('.reveal--right', {
      onEnter(batch) {
        gsap.to(batch, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out'
        });
      },
      start: 'top 88%',
      once: true
    });

    // Section dividers — line draw
    document.querySelectorAll('.section-divider').forEach(line => {
      gsap.to(line, {
        scaleX: 1,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: line,
          start: 'top 90%',
          once: true
        }
      });
    });
  }

  /* -----------------------------------------
     9. ABOUT SECTION
     ----------------------------------------- */
  function initAbout() {
    // Animated counters
    document.querySelectorAll('.metric-value').forEach(el => {
      const end = parseFloat(el.dataset.value);
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };

      gsap.to(obj, {
        val: end,
        duration: 1.5,
        ease: 'power2.out',
        snap: { val: 1 },
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        },
        onUpdate() {
          el.textContent = Math.round(obj.val) + suffix;
        }
      });
    });

    // Language bars
    document.querySelectorAll('.lang-bar-fill').forEach(bar => {
      const target = bar.dataset.width;
      gsap.to(bar, {
        width: target,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bar,
          start: 'top 90%',
          once: true
        }
      });
    });
  }

  /* -----------------------------------------
     10. PROJECT INTERACTIONS
     ----------------------------------------- */
  function initProjects() {
    document.querySelectorAll('.project-card').forEach(card => {
      // 3D tilt
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = mapRange(y, 0, rect.height, CFG.tiltMax, -CFG.tiltMax);
        const rotateY = mapRange(x, 0, rect.width, -CFG.tiltMax, CFG.tiltMax);

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      });

      // Hover text scramble on project name
      const nameEl = card.querySelector('.project-name');
      if (nameEl) {
        const originalText = nameEl.textContent;
        card.addEventListener('mouseenter', () => {
          scrambleText(nameEl, originalText, { duration: 400 });
        });
      }

      // Border draw on scroll
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        once: true,
        onEnter() {
          card.classList.add('in-view');
        }
      });
    });
  }

  /* -----------------------------------------
     11. MAGNETIC BUTTONS
     ----------------------------------------- */
  function initMagnetic() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * CFG.magneticRadius,
          y: y * CFG.magneticRadius,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  /* -----------------------------------------
     12. CONTACT HEADLINE CHAR SPLIT
     ----------------------------------------- */
  function initContact() {
    const headline = document.querySelector('.contact-headline');
    if (!headline) return;

    const chars = splitTextToChars(headline);

    ScrollTrigger.create({
      trigger: headline,
      start: 'top 80%',
      once: true,
      onEnter() {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.03,
          ease: 'power3.out'
        });
      }
    });
  }

  /* -----------------------------------------
     13. INITIALIZATION
     ----------------------------------------- */
  function init() {
    gsap.registerPlugin(ScrollTrigger);

    const loaderTl = initLoader();
    initLenis();
    initCursor();
    initNav();
    initHero(loaderTl);
    initReveals();
    initAbout();
    initProjects();
    initMagnetic();
    initContact();
  }

  // Gate on fonts + DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(init);
      } else {
        init();
      }
    });
  } else {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }
  }

})();
