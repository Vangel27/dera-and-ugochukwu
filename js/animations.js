document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     SCROLL REVEAL
  ====================================================== */

  const revealElements =
    document.querySelectorAll(".reveal");

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
    revealElements.forEach(element => element.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);

        });

      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px"
      }
    );


    revealElements.forEach(element => {

      revealObserver.observe(element);

    });
  }


  /* =====================================================
     STAGGERED EVENT CARDS
  ====================================================== */

  document
    .querySelectorAll(".event-card")
    .forEach((card, index) => {

      if (!prefersReducedMotion) {
        card.style.transitionDelay = `${index * 120}ms`;
      }

    });


  /* =====================================================
     INFO CARDS
  ====================================================== */

  document
    .querySelectorAll(".info-card")
    .forEach((card, index) => {

      if (!prefersReducedMotion) {
        card.style.transitionDelay = `${index * 120}ms`;
      }

    });


  /* =====================================================
     TIMELINE STAGGER
  ====================================================== */

  document
    .querySelectorAll(".timeline-item")
    .forEach((item, index) => {

      if (!prefersReducedMotion) {
        item.style.transitionDelay = `${index * 100}ms`;
      }

    });


  /* =====================================================
     PREVENT ANCHOR JUMP BEFORE INVITATION OPENS
  ====================================================== */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach(link => {

      link.addEventListener("click", event => {

        const targetId =
          link.getAttribute("href");

        const target =
          document.querySelector(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });

      });

    });


  /* =====================================================
     PARALLAX-LIKE HERO MOTION
  ====================================================== */

  const hero =
    document.querySelector(".hero-content");

  if (hero && !prefersReducedMotion) {

    window.addEventListener(
      "scroll",
      () => {

        const scrollY =
          window.scrollY;

        if (scrollY < window.innerHeight) {

          hero.style.transform =
            `translateY(${scrollY * .12}px)`;

          hero.style.opacity =
            String(
              Math.max(
                0,
                1 - scrollY / 700
              )
            );

        }

      },
      { passive: true }
    );

  }

});
