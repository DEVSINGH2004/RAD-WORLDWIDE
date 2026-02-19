gsap.registerPlugin(ScrollTrigger);

const logoWrapper  = document.querySelector(".logo-wrapper");
const introSection = document.querySelector(".intro");
const heroSection  = document.querySelector(".hero-section");

/* ── Grab the two groups of intro floats ── */
const floatsUp   = document.querySelectorAll(".intro-float[data-dir='up']");
const floatsDown = document.querySelectorAll(".intro-float[data-dir='down']");

/* ── Initial states ── */
gsap.set(logoWrapper, { transformOrigin: "50% 50%", force3D: true });
gsap.set(heroSection, { opacity: 0, filter: "blur(40px)", scale: 1.08 });

/* Floats start fully visible, no transform */
gsap.set([floatsUp, floatsDown], { opacity: 1, y: 0, force3D: true });

/* ── Single ScrollTrigger ── */
ScrollTrigger.create({
  trigger: ".intro",
  start: "top top",
  end: "+=2400",
  scrub: 0.8,
  pin: true,
  anticipatePin: 1,

  onUpdate: (self) => {
    const p = self.progress;

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       0a.  PURPLE BG FADE  —  immediate
            p: 0 → 0.45
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const bgFade = gsap.utils.clamp(0, 1, p / 0.45);
    gsap.set(introSection, {
      backgroundColor: `rgba(135, 51, 232, ${1 - bgFade})`
    });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       0b.  INTRO FLOATS EXIT
            p: 0 → 0.50
            Group A flies UP off screen
            Group B flies DOWN off screen
            Both fade out — staggered per item
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const floatDuration = 0.50;

    floatsUp.forEach((el, i) => {
      /* stagger: each item starts slightly later */
      const start  = i * 0.04;
      const fp     = gsap.utils.clamp(0, 1, (p - start) / (floatDuration - start));
      gsap.set(el, {
        y:       -fp * 130 * (1 + i * 0.15) + "vh",
        opacity: 1 - fp,
        scale:   1 - fp * 0.15,
        rotation: -fp * (8 + i * 4)
      });
    });

    floatsDown.forEach((el, i) => {
      const start  = i * 0.04;
      const fp     = gsap.utils.clamp(0, 1, (p - start) / (floatDuration - start));
      gsap.set(el, {
        y:       fp * 130 * (1 + i * 0.15) + "vh",
        opacity: 1 - fp,
        scale:   1 - fp * 0.15,
        rotation: fp * (8 + i * 4)
      });
    });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       1.  LOGO  —  zoom forward and off-screen
           p: 0 → 0.70
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const logoP = gsap.utils.clamp(0, 1, p / 0.70);
    gsap.set(logoWrapper, {
      z:     logoP * 3200,
      scale: 1 + logoP * 2.4,
      y:     logoP * 180
    });

    /* Fade logo as it exits so it doesn't hard-clip */
    const logoFade = gsap.utils.clamp(0, 1, (p - 0.52) / 0.18);
    gsap.set(logoWrapper, { opacity: 1 - logoFade });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       2.  HERO REVEAL  —  opacity + unblur
           p: 0.58 → 0.88
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const heroP = gsap.utils.clamp(0, 1, (p - 0.58) / 0.30);
    gsap.set(heroSection, {
      opacity: heroP,
      filter:  `blur(${(1 - heroP) * 40}px)`,
      scale:   1.08 - heroP * 0.08
    });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       3.  INTRO OVERLAY full fade-out
           p: 0.84 → 1.00
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const fadeP = gsap.utils.clamp(0, 1, (p - 0.84) / 0.16);
    gsap.set(introSection, { opacity: 1 - fadeP });
  },

  onLeave: () => {
    gsap.set(heroSection, { opacity: 1, filter: "blur(0px)", scale: 1 });
    gsap.set(heroSection, { zIndex: 0 });
  },

  onEnterBack: () => {
    gsap.set(heroSection, { zIndex: 10 });
    /* Restore everything for replay */
    gsap.set(introSection, {
      opacity: 1,
      backgroundColor: "rgba(135, 51, 232, 1)"
    });
    gsap.set([floatsUp, floatsDown], {
      opacity: 1, y: 0, scale: 1, rotation: 0
    });
    gsap.set(logoWrapper, { opacity: 1 });
  }
});