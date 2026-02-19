gsap.registerPlugin(ScrollTrigger);

const logoWrapper  = document.querySelector(".logo-wrapper");
const introSection = document.querySelector(".intro");
const heroSection  = document.querySelector(".hero-section");

const floatsUp   = document.querySelectorAll(".intro-float[data-dir='up']");
const floatsDown = document.querySelectorAll(".intro-float[data-dir='down']");
const allFloats  = document.querySelectorAll(".intro-float");

/* ── Initial states ── */
gsap.set(logoWrapper, { transformOrigin: "50% 50%", force3D: true });
gsap.set(heroSection, { opacity: 0, filter: "blur(40px)", scale: 1.08 });
gsap.set(allFloats,   { opacity: 1, y: 0, rotation: 0, scale: 1, force3D: true });

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   IDLE FLOAT — pure GSAP tweens, no CSS animation
   Store refs so we can kill them when scroll starts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const idleTweens = [];

allFloats.forEach((el, i) => {
  const t = gsap.to(el, {
    y:        -14,
    rotation: 2,
    duration: 2.4 + i * 0.2,
    ease:     "sine.inOut",
    yoyo:     true,
    repeat:   -1,
    delay:    i * 0.22
  });
  idleTweens.push(t);
});

let idleKilled = false;

function killIdleFloats() {
  if (idleKilled) return;
  idleKilled = true;
  idleTweens.forEach(t => t.kill());
}

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

    /* Kill idle tweens the moment user starts scrolling */
    if (p > 0) killIdleFloats();

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       0a.  PURPLE BG FADE  p: 0 → 0.45
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const bgFade = gsap.utils.clamp(0, 1, p / 0.45);
    gsap.set(introSection, {
      backgroundColor: `rgba(135, 51, 232, ${1 - bgFade})`
    });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       0b.  FLOATS EXIT — both groups go UP
            Group A: p 0.00 → 0.45  (fast)
            Group B: p 0.05 → 0.60  (slower, delayed)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    /* GROUP A — fast wave */
    floatsUp.forEach((el, i) => {
      const start = i * 0.03;
      const fp    = gsap.utils.clamp(0, 1, (p - start) / (0.45 - start));
      gsap.set(el, {
        y:        -fp * 120 * (1 + i * 0.12) + "vh",
        opacity:  Math.max(0, 1 - fp * 1.2),
        scale:    1 - fp * 0.12,
        rotation: -fp * (6 + i * 3)
      });
    });

    /* GROUP B — slow wave, exits second */
    floatsDown.forEach((el, i) => {
      const start = 0.05 + i * 0.04;
      const fp    = gsap.utils.clamp(0, 1, (p - start) / (0.60 - start));
      gsap.set(el, {
        y:        -fp * 130 * (1 + i * 0.10) + "vh",
        opacity:  Math.max(0, 1 - fp * 1.1),
        scale:    1 - fp * 0.10,
        rotation: fp * (5 + i * 3)
      });
    });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       1.  LOGO ZOOM  p: 0 → 0.70
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const logoP = gsap.utils.clamp(0, 1, p / 0.70);
    gsap.set(logoWrapper, {
      z:     logoP * 3200,
      scale: 1 + logoP * 2.4,
      y:     logoP * 180
    });

    const logoFade = gsap.utils.clamp(0, 1, (p - 0.52) / 0.18);
    gsap.set(logoWrapper, { opacity: 1 - logoFade });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       2.  HERO REVEAL  p: 0.58 → 0.88
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const heroP = gsap.utils.clamp(0, 1, (p - 0.58) / 0.30);
    gsap.set(heroSection, {
      opacity: heroP,
      filter:  `blur(${(1 - heroP) * 40}px)`,
      scale:   1.08 - heroP * 0.08
    });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       3.  INTRO OVERLAY FADE  p: 0.84 → 1.00
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    const fadeP = gsap.utils.clamp(0, 1, (p - 0.84) / 0.16);
    gsap.set(introSection, { opacity: 1 - fadeP });
  },

  onLeave: () => {
    gsap.set(heroSection, { opacity: 1, filter: "blur(0px)", scale: 1 });
    gsap.set(heroSection, { zIndex: 0 });
  },

  onEnterBack: () => {
    /* Revive idle tweens on scroll back */
    idleKilled = false;
    gsap.set(heroSection, { zIndex: 10 });
    gsap.set(introSection, {
      opacity: 1,
      backgroundColor: "rgba(135, 51, 232, 1)"
    });
    gsap.set(allFloats, { opacity: 1, y: 0, scale: 1, rotation: 0 });
    gsap.set(logoWrapper, { opacity: 1 });

    /* Restart idle tweens */
    allFloats.forEach((el, i) => {
      const t = gsap.to(el, {
        y:        -14,
        rotation: 2,
        duration: 2.4 + i * 0.2,
        ease:     "sine.inOut",
        yoyo:     true,
        repeat:   -1,
        delay:    i * 0.22
      });
      idleTweens.push(t);
    });
  }
});