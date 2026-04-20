/* ============================================
   KING CORE — Scroll Animations (GSAP)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* --- Loader --- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      delay: 0.8,
      onComplete: () => {
        loader.classList.add('hidden');
        animateHero();
      }
    });
  });

  // Fallback if load event already fired
  if (document.readyState === 'complete') {
    setTimeout(() => {
      loader.classList.add('hidden');
      animateHero();
    }, 1000);
  }

  /* --- Navigation --- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  });

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });

  /* --- Hero Particles --- */
  const particlesContainer = document.getElementById('heroParticles');
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.className = 'hero-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particlesContainer.appendChild(particle);

    gsap.to(particle, {
      opacity: Math.random() * 0.4 + 0.1,
      duration: Math.random() * 3 + 2,
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 3
    });

    gsap.to(particle, {
      y: (Math.random() - 0.5) * 100,
      x: (Math.random() - 0.5) * 50,
      duration: Math.random() * 10 + 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  /* --- Hero Animation --- */
  function animateHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero-word', {
      y: 0,
      duration: 1,
      stagger: 0.15
    })
    .to('.hero-badge', {
      opacity: 1,
      y: 0,
      duration: 0.8
    }, '-=0.5')
    .to('.hero-sub', {
      opacity: 1,
      y: 0,
      duration: 0.8
    }, '-=0.4')
    .to('.hero-cta', {
      opacity: 1,
      y: 0,
      duration: 0.8
    }, '-=0.4');
  }

  /* --- Hero Parallax --- */
  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    },
    y: 150,
    opacity: 0.3
  });

  /* --- About Section --- */
  gsap.from('.about-left', {
    scrollTrigger: {
      trigger: '.about',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    x: -60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  gsap.from('.about-right .about-text', {
    scrollTrigger: {
      trigger: '.about-right',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power3.out'
  });

  gsap.to('.about-value', {
    scrollTrigger: {
      trigger: '.about-values',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.15,
    ease: 'power3.out'
  });

  /* --- Products Horizontal Scroll --- */
  const productsTrack = document.getElementById('productsTrack');
  const cards = productsTrack.querySelectorAll('.product-card');
  const totalScrollWidth = productsTrack.scrollWidth - window.innerWidth + 100;

  gsap.to(productsTrack, {
    x: () => -totalScrollWidth,
    ease: 'none',
    scrollTrigger: {
      trigger: '.products',
      start: 'top top',
      end: () => '+=' + totalScrollWidth,
      scrub: 1,
      pin: true,
      invalidateOnRefresh: true,
      anticipatePin: 1
    }
  });

  // Stagger card entry
  cards.forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: '.products',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power3.out'
    });
  });

  /* --- Process Scrollytelling --- */
  const steps = document.querySelectorAll('.process-step');
  const processProgress = document.getElementById('processProgress');
  const processStepNum = document.getElementById('processStepNum');
  const processTitle = document.getElementById('processTitle');
  const processDesc = document.getElementById('processDesc');
  const totalSteps = steps.length;
  const circumference = 2 * Math.PI * 130; // r=130

  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => updateProcess(i),
      onEnterBack: () => updateProcess(i)
    });
  });

  function updateProcess(index) {
    const step = steps[index];
    const progress = (index + 1) / totalSteps;

    // Update ring
    const offset = circumference - (progress * circumference);
    processProgress.style.strokeDashoffset = offset;

    // Update step number
    processStepNum.textContent = String(index + 1).padStart(2, '0');

    // Update text with fade
    gsap.to([processTitle, processDesc], {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        processTitle.textContent = step.dataset.title;
        processDesc.textContent = step.dataset.desc;
        gsap.to([processTitle, processDesc], {
          opacity: 1,
          duration: 0.4
        });
      }
    });
  }

  /* --- Stats Counter --- */
  const statCards = document.querySelectorAll('.stat-card');

  gsap.to(statCards, {
    scrollTrigger: {
      trigger: '.stats',
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out',
    onComplete: () => {
      document.querySelectorAll('.stat-number').forEach(num => {
        animateCounter(num);
      });
    }
  });

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  /* --- Materials Cards --- */
  gsap.to('.material-card', {
    scrollTrigger: {
      trigger: '.materials-grid',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.12,
    ease: 'power3.out'
  });

  /* --- Contact Section --- */
  gsap.from('.contact-left', {
    scrollTrigger: {
      trigger: '.contact',
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    x: -40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.contact-right', {
    scrollTrigger: {
      trigger: '.contact',
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    x: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  /* --- Contact Form (demo handler) --- */
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn');
    const originalText = btn.textContent;
    btn.textContent = 'Message Sent!';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      contactForm.reset();
    }, 3000);
  });

  /* --- Smooth scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        gsap.to(window, {
          scrollTo: { y: target, offsetY: 80 },
          duration: 1,
          ease: 'power3.inOut'
        });
      }
    });
  });
});
