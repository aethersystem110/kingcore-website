/* ============================================
   KingCore — Main JS (GSAP + ScrollTrigger)
   ============================================ */

(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 768px)').matches;

  gsap.registerPlugin(ScrollTrigger);

  // ============================================
  // NAV scroll state
  // ============================================
  const nav = document.getElementById('nav');
  const setNavScrolled = () => {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  setNavScrolled();
  window.addEventListener('scroll', setNavScrolled, { passive: true });

  // ============================================
  // Smooth-scroll for in-page links (CSS handles most; ensure offset)
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  // ============================================
  // HERO entrance
  // ============================================
  const heroImg = document.getElementById('heroImg');
  const heroEyebrow = document.querySelector('.reveal-eyebrow');
  const heroWords = document.querySelectorAll('.hero-h1 .word');
  const heroRule = document.querySelector('.hero-rule');
  const heroSub = document.querySelector('.hero-sub');
  const heroCtas = document.querySelector('.hero-ctas');

  if (prefersReduced) {
    gsap.set([heroImg, heroEyebrow, ...heroWords, heroSub, heroCtas], { opacity: 1, y: 0, filter: 'none' });
    gsap.set(heroRule, { width: 80 });
  } else {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(heroImg, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
      .to(heroEyebrow, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
      .to(heroWords, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out'
      }, 0.4)
      .to(heroRule, { width: 80, duration: 0.4, ease: 'power2.out' }, 0.9)
      .to(heroSub, { opacity: 1, y: 0, duration: 0.8 }, 1.0)
      .to(heroCtas, { opacity: 1, y: 0, duration: 0.8 }, 1.2);

    // Ken Burns infinite loop
    gsap.to(heroImg, {
      scale: 1.04,
      duration: 12,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    // Parallax on scroll
    gsap.to('.hero-media', {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // ============================================
  // NARRATIVE — sentence stagger on scroll
  // ============================================
  const narrSentences = document.querySelectorAll('.narrative-body .n-sentence');
  if (narrSentences.length) {
    if (prefersReduced) {
      gsap.set(narrSentences, { opacity: 1, y: 0 });
    } else {
      gsap.to(narrSentences, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.narrative',
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      });
    }
  }

  // ============================================
  // CAPABILITIES — pinned scroll narrative (desktop only)
  // ============================================
  if (!isMobile) {
    const capPin = document.querySelector('.cap-pin');
    const capPanels = document.querySelectorAll('.cap-panel');
    const capImgs = document.querySelectorAll('.cap-img');
    const csmCurrent = document.getElementById('csmCurrent');

    if (capPin && capPanels.length && capImgs.length) {
      // Set initial active
      capPanels[0].classList.add('is-active');

      let currentIdx = 0;
      const setStage = (idx) => {
        if (idx === currentIdx) return;
        currentIdx = idx;
        capPanels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
        capImgs.forEach((img, i) => {
          gsap.to(img, { opacity: i === idx ? 1 : 0, duration: prefersReduced ? 0 : 0.6, ease: 'power2.out' });
        });
        if (csmCurrent) csmCurrent.textContent = String(idx + 1).padStart(2, '0');
      };

      ScrollTrigger.create({
        trigger: capPin,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.cap-stage',
        pinSpacing: false,
        scrub: prefersReduced ? false : 1,
        onUpdate: (self) => {
          const p = self.progress;
          let idx = 0;
          if (p > 0.66) idx = 2;
          else if (p > 0.33) idx = 1;
          setStage(idx);

          // Subtle breathing scale on the active image
          if (!prefersReduced) {
            const active = capImgs[idx];
            if (active) {
              // sub-progress within each stage (0-1)
              const localP = idx === 0
                ? p / 0.33
                : idx === 1
                  ? (p - 0.33) / 0.33
                  : (p - 0.66) / 0.34;
              const clamped = Math.max(0, Math.min(1, localP));
              gsap.set(active, { scale: 1 + clamped * 0.05 });
            }
          }
        }
      });
    }
  } else {
    // Mobile: fade-in each capm-item
    const items = document.querySelectorAll('.capm-item');
    items.forEach(item => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 80%',
        onEnter: () => item.classList.add('is-in')
      });
    });
  }

  // ============================================
  // SPECS — count-up stats
  // ============================================
  const statEls = document.querySelectorAll('.stat-num');
  const formatters = {
    diameter: (v) => {
      // target 6 — then replace with "3–6″"
      if (v >= 5.95) return '3–6″';
      return Math.round(v) + '″';
    },
    wall: (v) => {
      if (v >= 14.95) return '3–15mm';
      return Math.round(v) + 'mm';
    },
    tons: (v) => Math.round(v) + '+',
    tol: (v) => '±' + v.toFixed(1) + 'mm'
  };
  const targets = { diameter: 6, wall: 15, tons: 400, tol: 0.5 };

  statEls.forEach(el => {
    const key = el.dataset.stat;
    const sv = el.querySelector('.sv');
    const target = targets[key];
    const fmt = formatters[key];

    if (prefersReduced) {
      sv.textContent = fmt(target);
      return;
    }

    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => { sv.textContent = fmt(obj.v); },
          onComplete: () => { sv.textContent = fmt(target); }
        });
      }
    });
  });

  // ============================================
  // INDUSTRIES — row fade-in
  // ============================================
  const indRows = document.querySelectorAll('.ind-row');
  if (indRows.length) {
    if (prefersReduced) {
      indRows.forEach(r => r.classList.add('is-in'));
    } else {
      ScrollTrigger.create({
        trigger: '.ind-list',
        start: 'top 75%',
        onEnter: () => {
          indRows.forEach((row, i) => {
            setTimeout(() => row.classList.add('is-in'), i * 100);
          });
        }
      });
    }
  }

  // ============================================
  // CONTACT — line reveal on scroll
  // ============================================
  const contactLines = document.querySelectorAll('.contact-h2 .contact-line');
  const contactBody = document.querySelector('.contact-body');
  const contactBtn = document.querySelector('.contact-btn');
  const contactFoot = document.querySelector('.contact-foot');

  if (prefersReduced) {
    gsap.set([contactLines, contactBody, contactBtn, contactFoot], { opacity: 1, y: 0 });
  } else {
    gsap.timeline({
      scrollTrigger: { trigger: '.contact', start: 'top 70%' },
      defaults: { ease: 'power3.out' }
    })
    .to(contactLines, { opacity: 1, y: 0, duration: 0.9, stagger: 0.15 })
    .to(contactBody, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
    .to(contactBtn, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
    .to(contactFoot, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
  }

  // ============================================
  // BG chapter tint shift
  // ============================================
  if (!prefersReduced) {
    ScrollTrigger.create({
      trigger: '.specs',
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => document.documentElement.style.setProperty('--tint', '1'),
      onLeaveBack: () => document.documentElement.style.setProperty('--tint', '0')
    });
  }

  // Refresh triggers once everything's set up
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
