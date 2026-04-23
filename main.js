/* ========================================
   KingCore — Main JS
   GSAP animations, ScrollTrigger, interactions
   ======================================== */

(function () {
  "use strict";

  // Bail out if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    // Show everything immediately, no animation
    document.querySelectorAll(".fade-up").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    // Set stat values immediately
    initStatsFinal();
    return;
  }

  // Wait for GSAP to load (deferred scripts)
  function onReady(fn) {
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      fn();
    } else {
      window.addEventListener("load", fn);
    }
  }

  onReady(function () {
    gsap.registerPlugin(ScrollTrigger);

    initNav();
    initHeroAnimations();
    initScrollFadeUps();
    initCardTilt();
    initStatsCountUp();
  });

  /* ----------------------------------------
     Navigation — solid bg on scroll
     ---------------------------------------- */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;

    ScrollTrigger.create({
      start: "top -72px",
      onUpdate: function (self) {
        if (self.scroll() > 72) {
          nav.classList.add("nav--scrolled");
        } else {
          nav.classList.remove("nav--scrolled");
        }
      },
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#") return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  /* ----------------------------------------
     Hero — staggered fade-up entrance
     ---------------------------------------- */
  function initHeroAnimations() {
    var heroEls = document.querySelectorAll(".hero .fade-up");
    if (!heroEls.length) return;

    // Text elements stagger
    var textEls = document.querySelectorAll(
      ".hero__eyebrow, .hero__title, .hero__sub, .hero .btn"
    );
    gsap.fromTo(
      textEls,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.12,
        delay: 0.2,
      }
    );

    // Hero media (video on desktop, image on mobile)
    var imageWrap = document.querySelector(".hero__media-wrap");
    if (imageWrap) {
      gsap.fromTo(
        imageWrap,
        { opacity: 0, scale: 1.02 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          delay: 0.4,
        }
      );
    }
  }

  /* ----------------------------------------
     Scroll-triggered fade-ups
     ---------------------------------------- */
  function initScrollFadeUps() {
    // All fade-up elements outside hero (hero is handled separately)
    var sections = document.querySelectorAll(
      ".capabilities, .specs, .serve, .contact"
    );

    sections.forEach(function (section) {
      var fadeEls = section.querySelectorAll(".fade-up");
      if (!fadeEls.length) return;

      // Determine stagger based on section type
      var isCardGrid = section.classList.contains("capabilities");
      var isTileGrid = section.classList.contains("serve");
      var staggerDelay = isCardGrid ? 0.1 : isTileGrid ? 0.08 : 0.12;

      gsap.fromTo(
        fadeEls,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: staggerDelay,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
        }
      );
    });
  }

  /* ----------------------------------------
     Card 3D tilt on hover
     ---------------------------------------- */
  function initCardTilt() {
    // Only on devices with a fine pointer (mouse)
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    var cards = document.querySelectorAll("[data-tilt]");

    cards.forEach(function (card) {
      var highlight = card.querySelector(".card__highlight");

      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        // Rotation: max 12 degrees
        var rotateX = ((y - centerY) / centerY) * -12;
        var rotateY = ((x - centerX) / centerX) * 12;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.4,
          ease: "power2.out",
          transformPerspective: 1000,
        });

        // Specular highlight follows cursor
        if (highlight) {
          highlight.style.opacity = "1";
          highlight.style.background =
            "radial-gradient(circle at " +
            x +
            "px " +
            y +
            "px, rgba(201, 169, 97, 0.08) 0%, transparent 60%)";
        }
      });

      card.addEventListener("mouseleave", function () {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: "power2.out",
        });

        if (highlight) {
          highlight.style.opacity = "0";
        }
      });
    });
  }

  /* ----------------------------------------
     Stats count-up animation
     ---------------------------------------- */
  function initStatsCountUp() {
    var stats = document.querySelectorAll(".stat__number[data-count]");
    if (!stats.length) return;

    ScrollTrigger.create({
      trigger: ".specs",
      start: "top 80%",
      once: true,
      onEnter: function () {
        stats.forEach(function (stat) {
          var target = parseFloat(stat.getAttribute("data-count"));
          var prefix = stat.getAttribute("data-prefix") || "";
          var suffix = stat.getAttribute("data-suffix") || "";
          var isDecimal = target % 1 !== 0;
          var obj = { val: 0 };

          gsap.to(obj, {
            val: target,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: function () {
              var display = isDecimal
                ? obj.val.toFixed(1)
                : Math.round(obj.val);
              stat.innerHTML = prefix + display + suffix;
            },
            onComplete: function () {
              var display = isDecimal ? target.toFixed(1) : target;
              stat.innerHTML = prefix + display + suffix;
            },
          });
        });
      },
    });
  }

  /* Set final stat values (for reduced motion) */
  function initStatsFinal() {
    document
      .querySelectorAll(".stat__number[data-count]")
      .forEach(function (stat) {
        var target = parseFloat(stat.getAttribute("data-count"));
        var prefix = stat.getAttribute("data-prefix") || "";
        var suffix = stat.getAttribute("data-suffix") || "";
        var isDecimal = target % 1 !== 0;
        var display = isDecimal ? target.toFixed(1) : target;
        stat.innerHTML = prefix + display + suffix;
      });
  }

})();
