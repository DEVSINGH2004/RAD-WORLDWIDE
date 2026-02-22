gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

document.documentElement.style.overflowX = "hidden";
document.body.style.overflowX = "hidden";

/* Helpers */
function disableStack() {
  return window.innerHeight < 500;
}

/* Elements */
const logoWrapper  = document.querySelector(".logo-wrapper");
const introSection = document.querySelector(".intro");
const heroSection  = document.querySelector(".hero-section");

const floatsUp   = document.querySelectorAll(".intro-float[data-dir='up']");
const floatsDown = document.querySelectorAll(".intro-float[data-dir='down']");
const allFloats  = document.querySelectorAll(".intro-float");

const heroNavbar = heroSection.querySelector(".navbar");
const heroPill   = heroSection.querySelector(".tag-pill");
const heroH1     = heroSection.querySelector("h1");
const heroP      = heroSection.querySelector(".hero-content p");
const heroFloats = heroSection.querySelectorAll(".float");

/* ================= INITIAL STATE ================= */
function setInitialState() {

  gsap.set(heroSection, {
    opacity: 0,
    scale: 1,
    zIndex: 5
  });

  gsap.set([heroNavbar, heroPill, heroH1, heroP], {
    opacity: 0,
    y: 60
  });

  gsap.set(heroFloats, {
    opacity: 0,
    y: 40,
    scale: 0.9
  });

  gsap.set(allFloats, {
    opacity: 1,
    y: 0,
    rotation: 0,
    scale: 1
  });

  gsap.set(introSection, {
    opacity: 1,
    backgroundColor: "rgba(135,51,232,1)"
  });

  /* Camera aimed slightly upward into A gap */
  gsap.set(logoWrapper, { 
    opacity: 1, 
    transformOrigin: "50% 42%" 
  });
}

setInitialState();

/* ================= INTRO SCROLL ================= */
let introST;

function createIntro() {

  if (introST) introST.kill();

  const scrollDist = window.innerHeight * 1.8;

  introST = ScrollTrigger.create({
    trigger: ".intro",
    start: "top top",
    end: `+=${scrollDist}`,
    scrub: 0.9,
    pin: true,
    anticipatePin: 1,

    onUpdate: (self) => {

      const p = self.progress;

      /* LOGO ZOOM (through A gap) */
      gsap.set(logoWrapper, {
        scale: 1 + p * 3.2,
        z: p * window.innerHeight * 3,
        y: p * window.innerHeight * 0.15,
        force3D: true
      });

      /* Floating objects fly out */
      floatsUp.forEach((el, i) => {
        const fp = gsap.utils.clamp(0,1,(p - 0.05 - i*0.02)/0.25);
        gsap.set(el, {
          y: -fp * 200 + "vh",
          opacity: 1 - fp
        });
      });

      floatsDown.forEach((el, i) => {
        const fp = gsap.utils.clamp(0,1,(p - 0.08 - i*0.02)/0.25);
        gsap.set(el, {
          y: fp * 200 + "vh",
          opacity: 1 - fp
        });
      });

      /* INTRO fades smoothly */
      const fadeIntro = gsap.utils.clamp(0,1,(p - 0.70)/0.10);
      gsap.set(introSection, { opacity: 1 - fadeIntro });

      /* HERO fully set by ~90% gap entry */
      const reveal = gsap.utils.clamp(0,1,(p - 0.75)/0.30);

      gsap.set(heroSection, { opacity: reveal });

      gsap.set(heroNavbar, { opacity: reveal, y: -50*(1-reveal) });
      gsap.set(heroPill,   { opacity: reveal, y:  60*(1-reveal) });
      gsap.set(heroH1,     { opacity: reveal, y:  70*(1-reveal) });
      gsap.set(heroP,      { opacity: reveal, y:  60*(1-reveal) });

      heroFloats.forEach(el => {
        gsap.set(el, {
          opacity: reveal,
          y: 40*(1-reveal),
          scale: 0.9 + reveal*0.1
        });
      });
    },

    onLeave: () => {
      gsap.set(introSection, {
        opacity: 0
      });

      gsap.set(heroSection, { 
        zIndex: -1, 
        opacity: 1 
      });
    },

    onEnterBack: () => {
      gsap.set(heroSection, { zIndex: 5 });
    },

    onLeaveBack: () => {
      /* Restore exact original purple state */
      gsap.set(introSection, {
        opacity: 1,
        backgroundColor: "rgba(135,51,232,1)"
      });

      gsap.set(heroSection, { opacity: 0 });
    }
  });
}

createIntro();

/* ================= SERVICES STACK ================= */
let serviceST;

function createServices() {

  if (serviceST) {
    serviceST.kill();
    serviceST = null;
  }

  if (disableStack()) return;

  const scene = document.querySelector(".service-stack-scene");
  const cards = gsap.utils.toArray(".service-card");

  if (!scene || !cards.length) return;

  const reversed = [...cards].reverse();

  const peekY = [0, 20, 40, 60];
  const peekScale = [1, 0.97, 0.94, 0.91];

  reversed.forEach((card, i) => {
    gsap.set(card, {
      y: peekY[i] || 0,
      scale: peekScale[i] || 1,
      zIndex: reversed.length - i
    });
  });

  const scrollPerCard = window.innerHeight * 0.75;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: "top 20%",
      end: `+=${(reversed.length - 1) * scrollPerCard}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1
    }
  });

  serviceST = tl.scrollTrigger;

  for (let i = 0; i < reversed.length - 1; i++) {

    const remaining = reversed.slice(i + 1);

    tl.to(reversed[i], {
      y: "-130%",
      ease: "power2.in",
      duration: 1
    }, i);

    remaining.forEach((card, j) => {
      tl.to(card, {
        y: peekY[j] || 0,
        scale: peekScale[j] || 1,
        ease: "power2.out",
        duration: 1
      }, i);
    });
  }
}

createServices();

/* ================= REBUILD ================= */
let resizeTimer;
let lastW = window.innerWidth;
let lastH = window.innerHeight;

function rebuild() {
  ScrollTrigger.getAll().forEach(st => st.kill());
  setInitialState();
  createIntro();
  createServices();
  ScrollTrigger.refresh(true);
}

function scheduleRebuild() {

  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {

    const w = window.innerWidth;
    const h = window.innerHeight;

    if (Math.abs(w - lastW) > 30 || Math.abs(h - lastH) > 120) {
      lastW = w;
      lastH = h;
      rebuild();
    }

  }, 250);
}

window.addEventListener("resize", scheduleRebuild);
window.addEventListener("orientationchange", scheduleRebuild);

window.addEventListener("load", () => {
  ScrollTrigger.refresh(true);
});