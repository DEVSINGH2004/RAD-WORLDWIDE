gsap.registerPlugin(ScrollTrigger);

const logoWrapper  = document.querySelector(".logo-wrapper");
const introSection = document.querySelector(".intro");
const heroSection  = document.querySelector(".hero-section");

/* ── Initial states ── */
gsap.set(logoWrapper, {
  transformOrigin: "50% 50%",
  force3D: true
});

/* Hero starts invisible and blurred */
gsap.set(heroSection, {
  opacity: 0,
  filter: "blur(40px)",
  scale: 1.08
});

/* ── Single ScrollTrigger that drives everything ── */
ScrollTrigger.create({
  trigger: ".intro",
  start: "top top",
  end: "+=2400",
  scrub: 1.4,
  pin: true,
  anticipatePin: 1,

  onUpdate: (self) => {
    const p = self.progress;

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       1.  LOGO  –  zoom forward and off-screen
           p: 0 → 0.70
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const logoP = gsap.utils.clamp(0, 1, p / 0.70);

    gsap.set(logoWrapper, {
      z:     logoP * 3200,
      scale: 1 + logoP * 2.4,
      y:     logoP * 180
    });

    /* Fade logo out as it exits so it doesn't hard-clip */
    const logoFade = gsap.utils.clamp(0, 1, (p - 0.52) / 0.18);
    gsap.set(logoWrapper, { opacity: 1 - logoFade });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       2.  HERO REVEAL  –  opacity + unblur
           starts as logo leaves (p 0.58)
           fully sharp & visible by p 0.88
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const heroP = gsap.utils.clamp(0, 1, (p - 0.58) / 0.30);

    gsap.set(heroSection, {
      opacity: heroP,
      filter:  `blur(${(1 - heroP) * 40}px)`,
      scale:   1.08 - heroP * 0.08
    });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       3.  INTRO OVERLAY fade out
           p: 0.82 → 1.00
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const fadeP = gsap.utils.clamp(0, 1, (p - 0.82) / 0.18);
    gsap.set(introSection, { opacity: 1 - fadeP });
  },

  onLeave: () => {
    /* Lock final hero state clean */
    gsap.set(heroSection, { opacity: 1, filter: "blur(0px)", scale: 1 });

    /*
      KEY FIX:
      Hero stays `position: fixed` — NEVER pulled into document flow.
      Drop z-index to 0 so the content sections (z-index: 1) scroll
      right over it naturally. No reappearance. No layout jump.
    */
    gsap.set(heroSection, { zIndex: 0 });
  },

  onEnterBack: () => {
    /* Restore hero above content so animation plays correctly on scroll-up */
    gsap.set(heroSection, { zIndex: 10 });
    gsap.set(introSection, { opacity: 1 });
  }
});