gsap.registerPlugin(ScrollTrigger);

/* ── Helper: detect mobile ── */
function isMobile() {
  return window.innerWidth <= 768;
}
function isTablet() {
  return window.innerWidth <= 1024 && window.innerWidth > 768;
}

/* ── Hamburger menu toggle ── */
const hamburgerBtn = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

if (hamburgerBtn && navMenu) {
  hamburgerBtn.addEventListener("click", () => {
    hamburgerBtn.classList.toggle("active");
    navMenu.classList.toggle("open");
    // Prevent body scroll when menu is open
    document.body.style.overflow = navMenu.classList.contains("open") ? "hidden" : "";
  });

  // Close menu when a link is clicked
  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburgerBtn.classList.remove("active");
      navMenu.classList.remove("open");
      document.body.style.overflow = "";
    });
  });
}

/* ── Core elements ── */
const logoWrapper = document.querySelector(".logo-wrapper");
const introSection = document.querySelector(".intro");
const heroSection = document.querySelector(".hero-section");

const floatsUp = document.querySelectorAll(".intro-float[data-dir='up']");
const floatsDown = document.querySelectorAll(".intro-float[data-dir='down']");
const allFloats = document.querySelectorAll(".intro-float");

/* ── Hero child elements ── */
const heroPill = heroSection.querySelector(".tag-pill");
const heroH1 = heroSection.querySelector("h1");
const heroP = heroSection.querySelector(".hero-content p");
const heroNavbar = heroSection.querySelector(".navbar");
const heroFloats = heroSection.querySelectorAll(".float");

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Hero is FULLY SHARP + OPAQUE from frame 0.
   The purple intro bg fades fast, so the hero
   becomes visible through the logo's transparent
   holes as it zooms.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
gsap.set(logoWrapper, { transformOrigin: "50% 50%", force3D: true });

/* Hero: fully visible & sharp immediately */
gsap.set(heroSection, { opacity: 1, filter: "blur(0px)", scale: 1 });

/* Hero children: hidden, will assemble AFTER logo exits */
gsap.set(heroNavbar, { opacity: 0, y: -30 });
gsap.set(heroPill, { opacity: 0, y: 40 });
gsap.set(heroH1, { opacity: 0, y: 50 });
gsap.set(heroP, { opacity: 0, y: 40 });
gsap.set(heroFloats, { opacity: 0, y: 30, scale: 0.85 });

gsap.set(allFloats, { opacity: 1, y: 0, rotation: 0, scale: 1, force3D: true });

/* ── IDLE FLOAT tweens ── */
let idleTweens = [];
let idleKilled = false;

function createIdleTweens() {
  idleTweens.forEach(t => t.kill());
  idleTweens = [];
  if (isMobile() || isTablet()) return; // No idle floats on small screens (they're hidden via CSS)

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

createIdleTweens();

function killIdleFloats() {
  if (idleKilled) return;
  idleKilled = true;
  idleTweens.forEach(t => t.kill());
}

const sub = (p, s, e) => gsap.utils.clamp(0, 1, (p - s) / (e - s));

/* ── Responsive scroll distance ── */
function getScrollDistance() {
  const vw = window.innerWidth;
  if (vw <= 480) return 1400;
  if (vw <= 768) return 1600;
  if (vw <= 1024) return 2000;
  return 2400;
}

/* ── Responsive logo zoom values ── */
function getLogoZoom() {
  const vw = window.innerWidth;
  if (vw <= 480) return { z: 1800, scale: 1.8, yShift: 80 };
  if (vw <= 768) return { z: 2200, scale: 2.0, yShift: 100 };
  if (vw <= 1024) return { z: 2800, scale: 2.3, yShift: 120 };
  return { z: 3400, scale: 2.6, yShift: 160 };
}

/* ── ScrollTrigger — main intro animation ── */
let mainST;

function createMainScrollTrigger() {
  // Kill existing trigger if re-creating
  if (mainST) {
    mainST.kill();
  }

  const scrollDist = getScrollDistance();
  const logoZoom = getLogoZoom();

  mainST = ScrollTrigger.create({
    trigger: ".intro",
    start: "top top",
    end: "+=" + scrollDist,
    scrub: 0.6,
    pin: true,
    anticipatePin: 1,

    onUpdate: (self) => {
      const p = self.progress;
      if (p > 0) killIdleFloats();

      /* ━━ 0a. PURPLE BG FADES — p: 0 → 0.15 ━━ */
      const bgFade = sub(p, 0.40, 0.55);
      gsap.set(introSection, {
        backgroundColor: `rgba(135, 51, 232, ${1 - bgFade})`,
        opacity: 1
      });

      /* ━━ 0b. INTRO FLOATS EXIT UP ━━ */
      if (!isMobile() && !isTablet()) {
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
      }

      /* ━━ 1. LOGO ZOOM — the portal expanding ━━ */
      const logoP = sub(p, 0, 1.0);
      gsap.set(logoWrapper, {
        z: logoP * logoZoom.z,
        scale: 1 + logoP * logoZoom.scale,
        y: logoP * logoZoom.yShift
      });

      /* Logo fades out as it exits */
      const logoFade = sub(p, 0.48, 0.70);
      gsap.set(logoWrapper, {
        opacity: Math.max(0, 1 - logoFade)
      });

      /* ━━ 2. INTRO OVERLAY — fades only AFTER logo exits ━━ */
      const fadeP = sub(p, 0.68, 0.80);
      gsap.set(introSection, { opacity: 1 - fadeP });

      /* ━━ 3. HERO CONTENT — assembles as logo exits ━━ */
      const navP = sub(p, 0.10, 0.25);
      gsap.set(heroNavbar, { opacity: navP, y: -30 * (1 - navP) });

      const pillP = sub(p, 0.16, 0.30);
      gsap.set(heroPill, { opacity: pillP, y: 40 * (1 - pillP) });

      const h1P = sub(p, 0.22, 0.36);
      gsap.set(heroH1, { opacity: h1P, y: 50 * (1 - h1P) });

      const paraP = sub(p, 0.28, 0.42);
      gsap.set(heroP, { opacity: paraP, y: 40 * (1 - paraP) });

      if (!isMobile() && !isTablet()) {
        heroFloats.forEach((el, i) => {
          const fp = sub(p, 0.34 + i * 0.02, 0.48 + i * 0.01);
          gsap.set(el, {
            opacity: fp,
            y: 30 * (1 - fp),
            scale: 0.85 + fp * 0.15
          });
        });
      }
    },

    onLeave: () => {
      gsap.set(heroSection, { opacity: 1, filter: "blur(0px)", scale: 1, zIndex: 0, visibility: "hidden" });
      gsap.set(heroNavbar, { opacity: 1, y: 0 });
      gsap.set(heroPill, { opacity: 1, y: 0 });
      gsap.set(heroH1, { opacity: 1, y: 0 });
      gsap.set(heroP, { opacity: 1, y: 0 });
      heroFloats.forEach(el => gsap.set(el, { opacity: 1, y: 0, scale: 1 }));
    },

    onEnterBack: () => {
      gsap.set(heroSection, { visibility: "visible", zIndex: 10, opacity: 1, filter: "blur(0px)", scale: 1 });
      gsap.set(heroNavbar, { opacity: 0, y: -30 });
      gsap.set(heroPill, { opacity: 0, y: 40 });
      gsap.set(heroH1, { opacity: 0, y: 50 });
      gsap.set(heroP, { opacity: 0, y: 40 });
      heroFloats.forEach(el => gsap.set(el, { opacity: 0, y: 30, scale: 0.85 }));

      gsap.set(introSection, { opacity: 1, backgroundColor: "rgba(135, 51, 232, 1)" });
      gsap.set(allFloats, { opacity: 1, y: 0, scale: 1, rotation: 0 });
      gsap.set(logoWrapper, { opacity: 1 });

      /* Revive idle tweens */
      idleKilled = false;
      createIdleTweens();
    }
  });
}

createMainScrollTrigger();

/* ═══════════════════════════════════════════════════════
   SERVICES — stacked card scroll animation
   Each card slides UP off screen one by one,
   revealing the card underneath, in sync with scroll.
═══════════════════════════════════════════════════════ */
let serviceST;

function createServiceAnimation() {
  // Kill existing service animation
  if (serviceST) {
    serviceST.kill();
  }

  const scene = document.querySelector(".service-stack-scene");
  const cards = gsap.utils.toArray(".service-card").reverse();

  if (!scene || cards.length === 0) return;

  /* Skip GSAP pin on mobile — CSS flex order handles layout */
  if (isMobile()) return;

  /* How far each card flies up when dismissed */
  const EXIT_Y = "-110%";

  /* Set initial peek positions for cards 2-4 */
  const peekY = [0, 18, 36, 54];
  const peekScale = [1, 0.97, 0.94, 0.91];

  cards.forEach((card, i) => {
    gsap.set(card, { y: peekY[i], scale: peekScale[i] });
  });

  /* Responsive scroll per card */
  const scrollPerCard = window.innerWidth <= 1024 ? 280 : 340;

  /* Build a timeline */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: "top 15%",
      end: `+=${cards.length * scrollPerCard}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    }
  });

  serviceST = tl.scrollTrigger;

  cards.forEach((card, i) => {
    const remaining = cards.slice(i + 1);

    tl.to(card, {
      y: EXIT_Y,
      scale: 1,
      opacity: 0,
      ease: "power2.in",
      duration: 1
    }, i * 1.2);

    remaining.forEach((below, j) => {
      tl.to(below, {
        y: peekY[j],
        scale: peekScale[j],
        ease: "power2.out",
        duration: 1
      }, i * 1.2);
    });
  });
}

createServiceAnimation();

/* ═══════════════════════════════════════════════════════
   RESIZE HANDLER — Rebuild animations on breakpoint change
═══════════════════════════════════════════════════════ */
let lastWidth = window.innerWidth;
let resizeTimer;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const newWidth = window.innerWidth;
    // Only rebuild if we crossed a breakpoint
    const breakpoints = [480, 768, 1024, 1200, 1400];
    const crossedBreakpoint = breakpoints.some(bp =>
      (lastWidth <= bp && newWidth > bp) || (lastWidth > bp && newWidth <= bp)
    );

    if (crossedBreakpoint) {
      lastWidth = newWidth;

      // Refresh all ScrollTriggers
      ScrollTrigger.getAll().forEach(st => st.kill());

      // Reset service card styles on mobile
      if (isMobile()) {
        document.querySelectorAll(".service-card").forEach(card => {
          gsap.set(card, { clearProps: "all" });
        });
      }

      // Recreate animations
      createMainScrollTrigger();
      createServiceAnimation();
      createIdleTweens();

      ScrollTrigger.refresh();
    }
  }, 250);
});

/* ── Initial refresh to ensure correct calculations ── */
window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});