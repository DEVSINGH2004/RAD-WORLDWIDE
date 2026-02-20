gsap.registerPlugin(ScrollTrigger);

const logoWrapper  = document.querySelector(".logo-wrapper");
const introSection = document.querySelector(".intro");
const heroSection  = document.querySelector(".hero-section");

const floatsUp   = document.querySelectorAll(".intro-float[data-dir='up']");
const floatsDown = document.querySelectorAll(".intro-float[data-dir='down']");
const allFloats  = document.querySelectorAll(".intro-float");

/* ── Hero child elements ── */
const heroPill   = heroSection.querySelector(".tag-pill");
const heroH1     = heroSection.querySelector("h1");
const heroP      = heroSection.querySelector(".hero-content p");
const heroNavbar = heroSection.querySelector(".navbar");
const heroFloats = heroSection.querySelectorAll(".float");

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   KEY CHANGE vs before:
   Hero is FULLY SHARP + OPAQUE from frame 0.
   The purple intro bg fades fast, so the hero
   becomes visible through the logo's transparent
   holes (the A counter) as it zooms — exactly
   like the reference video's "d" hole reveal.
   No blur. No opacity fade on the hero shell.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
gsap.set(logoWrapper, { transformOrigin: "50% 50%", force3D: true });

/* Hero: fully visible & sharp immediately */
gsap.set(heroSection, { opacity: 1, filter: "blur(0px)", scale: 1 });

/* Hero children: hidden, will assemble AFTER logo exits */
gsap.set(heroNavbar, { opacity: 0, y: -30 });
gsap.set(heroPill,   { opacity: 0, y: 40  });
gsap.set(heroH1,     { opacity: 0, y: 50  });
gsap.set(heroP,      { opacity: 0, y: 40  });
gsap.set(heroFloats, { opacity: 0, y: 30, scale: 0.85 });

gsap.set(allFloats, { opacity: 1, y: 0, rotation: 0, scale: 1, force3D: true });

/* ── IDLE FLOAT tweens ── */
const idleTweens = [];
allFloats.forEach((el, i) => {
  idleTweens.push(gsap.to(el, {
    y: -14, rotation: 2,
    duration: 2.4 + i * 0.2,
    ease: "sine.inOut",
    yoyo: true, repeat: -1,
    delay: i * 0.22
  }));
});

let idleKilled = false;
function killIdleFloats() {
  if (idleKilled) return;
  idleKilled = true;
  idleTweens.forEach(t => t.kill());
}

const sub = (p, s, e) => gsap.utils.clamp(0, 1, (p - s) / (e - s));

/* ── ScrollTrigger ── */
ScrollTrigger.create({
  trigger: ".intro",
  start: "top top",
  end: "+=2400",
  scrub: 0.6,          /* snappier for portal feel */
  pin: true,
  anticipatePin: 1,

  onUpdate: (self) => {
    const p = self.progress;
    if (p > 0) killIdleFloats();

    /* ━━ 0a. PURPLE BG FADES — p: 0 → 0.15 ━━
       Only the background color fades — NOT the section opacity.
       The logo stays fully visible as a mask, hero only shows
       through the transparent A-hole in the logo PNG. */
    const bgFade = sub(p, 0.40, 0.55);
    gsap.set(introSection, {
      backgroundColor: `rgba(135, 51, 232, ${1 - bgFade})`,
      opacity: 1   /* keep overlay alive — logo must stay as mask */
    });

    /* ━━ 0b. INTRO FLOATS EXIT UP ━━ */
    floatsUp.forEach((el, i) => {
      const fp = sub(p, i * 0.01, 0.18);
      gsap.set(el, {
        y: -fp * 120 * (1 + i * 0.12) + "vh",
        opacity: Math.max(0, 1 - fp * 1.3),
        scale: 1 - fp * 0.12,
        rotation: -fp * (6 + i * 3)
      });
    });
    floatsDown.forEach((el, i) => {
      const fp = sub(p, 0.02 + i * 0.02, 0.22);
      gsap.set(el, {
        y: -fp * 130 * (1 + i * 0.10) + "vh",
        opacity: Math.max(0, 1 - fp * 1.2),
        scale: 1 - fp * 0.10,
        rotation: fp * (5 + i * 3)
      });
    });

    /* ━━ 1. LOGO ZOOM — the portal expanding ━━
       As it scales up, transparent A-hole grows,
       revealing more of the sharp hero behind.
       Zoom is aggressive so the hole fills screen fast. */
    const logoP = sub(p, 0, 1.0);
    gsap.set(logoWrapper, {
      z:     logoP * 3400,
      scale: 1 + logoP * 2.6,
      y:     logoP * 160
    });

    /* Logo fades out as it exits — keeps it clean */
    const logoFade = sub(p, 0.48, 0.70);
    gsap.set(logoWrapper, {
      opacity: Math.max(0, 1 - logoFade)
    });

    /* ━━ 2. INTRO OVERLAY — fades only AFTER logo exits screen ━━
       Logo opacity goes 0 at p:0.70, so we wait till p:0.68
       before dropping the overlay — until then logo masks the hero. */
    const fadeP = sub(p, 0.68, 0.80);
    gsap.set(introSection, { opacity: 1 - fadeP });

    /* ━━ 3. HERO CONTENT — assembles as logo exits ━━
       Starts only once logo is mostly gone (p: 0.65+)
       Staggered so it feels like flying into the scene */

    const navP = sub(p, 0.10, 0.25);
    gsap.set(heroNavbar, { opacity: navP, y: -30 * (1 - navP) });

    const pillP = sub(p, 0.16, 0.30);
    gsap.set(heroPill, { opacity: pillP, y: 40 * (1 - pillP) });

    const h1P = sub(p, 0.22, 0.36);
    gsap.set(heroH1, { opacity: h1P, y: 50 * (1 - h1P) });

    const paraP = sub(p, 0.28, 0.42);
    gsap.set(heroP, { opacity: paraP, y: 40 * (1 - paraP) });

    heroFloats.forEach((el, i) => {
      const fp = sub(p, 0.34 + i * 0.02, 0.48 + i * 0.01);
      gsap.set(el, {
        opacity: fp,
        y: 30 * (1 - fp),
        scale: 0.85 + fp * 0.15
      });
    });
  },

  onLeave: () => {
    gsap.set(heroSection, { opacity: 1, filter: "blur(0px)", scale: 1, zIndex: 0 });
    gsap.set(heroNavbar,  { opacity: 1, y: 0 });
    gsap.set(heroPill,    { opacity: 1, y: 0 });
    gsap.set(heroH1,      { opacity: 1, y: 0 });
    gsap.set(heroP,       { opacity: 1, y: 0 });
    heroFloats.forEach(el => gsap.set(el, { opacity: 1, y: 0, scale: 1 }));
  },

  onEnterBack: () => {
    gsap.set(heroSection, { zIndex: 10, opacity: 1, filter: "blur(0px)", scale: 1 });
    gsap.set(heroNavbar,  { opacity: 0, y: -30 });
    gsap.set(heroPill,    { opacity: 0, y: 40  });
    gsap.set(heroH1,      { opacity: 0, y: 50  });
    gsap.set(heroP,       { opacity: 0, y: 40  });
    heroFloats.forEach(el => gsap.set(el, { opacity: 0, y: 30, scale: 0.85 }));

    gsap.set(introSection, { opacity: 1, backgroundColor: "rgba(135, 51, 232, 1)" });
    gsap.set(allFloats,    { opacity: 1, y: 0, scale: 1, rotation: 0 });
    gsap.set(logoWrapper,  { opacity: 1 });

    /* Revive idle tweens */
    idleKilled = false;
    allFloats.forEach((el, i) => {
      idleTweens.push(gsap.to(el, {
        y: -14, rotation: 2,
        duration: 2.4 + i * 0.2,
        ease: "sine.inOut",
        yoyo: true, repeat: -1,
        delay: i * 0.22
      }));
    });
  }
});