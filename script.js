gsap.registerPlugin(ScrollTrigger);

const logoWrapper = document.querySelector(".logo-wrapper");
const introSection = document.querySelector(".intro");
const heroSection = document.querySelector(".hero-section");

/* Ensure stable transform */
gsap.set(logoWrapper, {
  transformOrigin: "50% 50%",
  force3D: true
});

gsap.set(heroSection, {
  filter: "blur(40px)",
  scale: 1.1
});

ScrollTrigger.create({
  trigger: ".intro",
  start: "top top",
  end: "+=2200",
  scrub: 1.2,
  pin: true,
  anticipatePin: 1,

  onUpdate: (self) => {

    let progress = self.progress;

    /* 1️⃣ Logo push */
    gsap.set(logoWrapper, {
      z: progress * 2800,
      scale: 1 + progress * 2,
      y: progress * 150
    });

    /* 2️⃣ Hero sharpen */
    let heroProgress = gsap.utils.clamp(
      0,
      1,
      (progress - 0.45) / 0.4
    );

    gsap.set(heroSection, {
      filter: `blur(${(1 - heroProgress) * 40}px)`,
      scale: 1.1 - heroProgress * 0.1
    });

    /* 3️⃣ Fade intro */
    let fadeProgress = gsap.utils.clamp(
      0,
      1,
      (progress - 0.85) / 0.15
    );

    gsap.set(introSection, {
      opacity: 1 - fadeProgress
    });

  },

  onLeave: () => {
    /* Release hero into normal flow */
    heroSection.classList.add("active");
  },

  onEnterBack: () => {
    /* Restore portal mode when scrolling back up */
    heroSection.classList.remove("active");
  }

});
