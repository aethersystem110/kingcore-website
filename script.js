/* ============================================
   KING CORE — Scrollytelling Engine
   Scroll = Time. The user controls the story.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ============================================
     PROGRESS BAR
     ============================================ */
  const progressBar = document.getElementById('progressBar');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = progress + '%';
  });

  /* ============================================
     CHAPTER NAV — Active dot tracking
     ============================================ */
  const chapterDots = document.querySelectorAll('.chapter-dot');
  const chapters = document.querySelectorAll('.chapter');

  chapters.forEach((chapter, i) => {
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActiveChapter(i),
      onEnterBack: () => setActiveChapter(i)
    });
  });

  function setActiveChapter(index) {
    chapterDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  // Click to scroll to chapter
  chapterDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.chapter);
      const target = chapters[index];
      if (target) {
        window.scrollTo({
          top: target.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ============================================
     PROLOGUE — "What holds it all together?"
     ============================================ */

  // Rings pulse on load
  gsap.to('.ring-core', {
    opacity: 1,
    duration: 2,
    delay: 0.5,
    ease: 'power2.out'
  });

  gsap.to(['.ring-1', '.ring-2', '.ring-3', '.ring-4'], {
    scale: 1.05,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    stagger: 0.3
  });

  // Word-by-word reveal of the question
  const words = document.querySelectorAll('.word-reveal');
  const prologueTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.chapter-prologue',
      start: 'top top',
      end: '30% top',
      scrub: 1
    }
  });

  words.forEach((word, i) => {
    prologueTL.to(word, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.4,
      ease: 'power3.out'
    }, i * 0.12);
  });

  // Answer lines — slide in one by one
  const answerLines = document.querySelectorAll('.answer-line');
  const answerTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.chapter-prologue',
      start: '30% top',
      end: '60% top',
      scrub: 1
    }
  });

  answerTL.to('#prologueAnswer', { opacity: 1, duration: 0.1 });

  answerLines.forEach((line, i) => {
    answerTL.to(line, {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: 'power3.out'
    }, i * 0.2);
  });

  // Brand reveal
  gsap.timeline({
    scrollTrigger: {
      trigger: '.chapter-prologue',
      start: '65% top',
      end: '85% top',
      scrub: 1
    }
  })
  .to('.prologue-question', { opacity: 0.2, y: -30, duration: 0.5 })
  .to('#prologueAnswer', { opacity: 0.2, y: -20, duration: 0.5 }, '<')
  .to('#prologueReveal', {
    opacity: 1,
    scale: 1,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.3')
  .to('.ring-core', {
    scale: 3,
    opacity: 0.8,
    duration: 1,
    ease: 'power2.out'
  }, '<');

  /* ============================================
     CHAPTER 1 — THE RAW
     ============================================ */

  // Title entry
  const rawTitleTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.chapter-raw',
      start: 'top 80%',
      end: 'top 20%',
      scrub: 1
    }
  });

  rawTitleTL
    .to('#sceneRawTitle', { opacity: 1, duration: 0.3 })
    .to('#sceneRawTitle .ct-word', {
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.15,
      ease: 'power3.out'
    }, '-=0.2')
    .to('#sceneRawTitle .cinematic-sub', {
      opacity: 1,
      y: 0,
      duration: 0.4
    }, '-=0.2');

  // Title fades, materials appear
  const rawMaterialsTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.chapter-raw',
      start: '15% top',
      end: '85% top',
      scrub: 1
    }
  });

  rawMaterialsTL
    .to('#sceneRawTitle', { opacity: 0, duration: 0.3 })
    .to('#sceneRawMaterials', { opacity: 1, duration: 0.3 });

  // Each material slides in at different scroll points
  const materials = ['#matStrawboard', '#matCoreboard', '#matFinishing', '#matDextrine'];

  materials.forEach((mat, i) => {
    const startPct = 20 + (i * 15);
    const endPct = startPct + 12;

    gsap.to(mat, {
      scrollTrigger: {
        trigger: '.chapter-raw',
        start: startPct + '% top',
        end: endPct + '% top',
        scrub: 1
      },
      opacity: 1,
      x: 0,
      duration: 1,
      ease: 'power3.out'
    });
  });

  /* ============================================
     CHAPTER 2 — THE CRAFT
     ============================================ */

  // Title entry
  const craftTitleTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.chapter-craft',
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1
    }
  });

  craftTitleTL.to('.scene-craft .ct-word', {
    y: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.15,
    ease: 'power3.out'
  })
  .to('.scene-craft .cinematic-sub', {
    opacity: 1,
    y: 0,
    duration: 0.4
  }, '-=0.2');

  // Craft steps — each step takes a portion of the scroll
  const craftSteps = document.querySelectorAll('.craft-step');
  const craftProgressFill = document.getElementById('craftProgressFill');
  const craftProgressLabel = document.getElementById('craftProgressLabel');
  const totalCraftSteps = craftSteps.length;

  // Divide the chapter scroll into step segments
  craftSteps.forEach((step, i) => {
    const segmentStart = 10 + (i * (80 / totalCraftSteps));
    const segmentEnd = segmentStart + (80 / totalCraftSteps);

    ScrollTrigger.create({
      trigger: '.chapter-craft',
      start: segmentStart + '% top',
      end: segmentEnd + '% top',
      onEnter: () => activateCraftStep(i),
      onEnterBack: () => activateCraftStep(i)
    });
  });

  function activateCraftStep(index) {
    craftSteps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });

    const progress = ((index + 1) / totalCraftSteps) * 100;
    craftProgressFill.style.setProperty('--progress', progress + '%');
    craftProgressLabel.textContent = (index + 1) + ' / ' + totalCraftSteps;
  }

  // Activate first step by default
  craftSteps[0].classList.add('active');

  /* ============================================
     CHAPTER 3 — THE CORE (Products)
     ============================================ */

  // Title entry
  const coreTitleTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.chapter-core',
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1
    }
  });

  coreTitleTL.to('.scene-core .ct-word', {
    y: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.15,
    ease: 'power3.out'
  })
  .to('.scene-core .cinematic-sub', {
    opacity: 1,
    y: 0,
    duration: 0.4
  }, '-=0.2');

  // Products — one at a time
  const coreProducts = document.querySelectorAll('.core-product');
  const totalProducts = coreProducts.length;

  coreProducts.forEach((product, i) => {
    const segmentStart = 10 + (i * (80 / totalProducts));
    const segmentEnd = segmentStart + (80 / totalProducts);

    ScrollTrigger.create({
      trigger: '.chapter-core',
      start: segmentStart + '% top',
      end: segmentEnd + '% top',
      onEnter: () => activateProduct(i),
      onEnterBack: () => activateProduct(i)
    });
  });

  function activateProduct(index) {
    coreProducts.forEach((p, i) => {
      p.classList.toggle('active', i === index);
    });
  }

  coreProducts[0].classList.add('active');

  /* ============================================
     CHAPTER 4 — THE SCALE
     ============================================ */

  // Title
  const scaleTitleTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.chapter-scale',
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1
    }
  });

  scaleTitleTL.to('.scene-scale .ct-word', {
    y: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.15,
    ease: 'power3.out'
  });

  // Stats appear and count
  let countersStarted = false;

  ScrollTrigger.create({
    trigger: '.chapter-scale',
    start: '20% top',
    onEnter: () => {
      if (countersStarted) return;
      countersStarted = true;

      const stats = document.querySelectorAll('.scale-stat');
      const quote = document.querySelector('.scale-quote');

      stats.forEach((stat, i) => {
        setTimeout(() => {
          stat.classList.add('visible');

          // Start counter
          const counter = stat.querySelector('.counter');
          if (counter) animateCounter(counter);
        }, i * 200);
      });

      setTimeout(() => {
        quote.classList.add('visible');
      }, stats.length * 200 + 400);
    }
  });

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ============================================
     CHAPTER 5 — THE FUTURE
     ============================================ */

  gsap.from('.future-intro', {
    scrollTrigger: {
      trigger: '.chapter-future',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  // Title words
  gsap.to('.scene-future .ct-word', {
    scrollTrigger: {
      trigger: '.chapter-future',
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });

  gsap.from('.future-contact', {
    scrollTrigger: {
      trigger: '.chapter-future',
      start: 'top 50%',
      toggleActions: 'play none none reverse'
    },
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  /* ============================================
     CONTACT FORM (demo)
     ============================================ */
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.future-btn');
    const original = btn.textContent;
    btn.textContent = 'Message Sent';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      contactForm.reset();
    }, 3000);
  });
});
