gsap.registerPlugin(ScrollTrigger);

let logoWrapper = document.querySelector(".logo-wrapper");
let hero = document.querySelector(".hero");
let heroTitle = document.querySelector(".hero-title");

ScrollTrigger.create({
  trigger: ".intro",
  start: "top top",
  end: "+=3000",
  scrub: 1.2,
  pin: true,
  anticipatePin: 1,
  onUpdate: (self) => {

    let progress = self.progress;

    /* ----------------------------- */
    /* 1️⃣ Camera Entering Lower A  */
    /* ----------------------------- */

    // Push logo far forward so it exits frame
    let logoZ = gsap.utils.interpolate(0, 2000, progress);

    // Slight downward drift into lower gap
    let logoY = gsap.utils.interpolate(-200, 0, progress);

    gsap.set(logoWrapper, {
      z: logoZ,
      y: logoY,
      scale: 1 + progress * 1.5
    });

    /* ----------------------------- */
    /* 2️⃣ Hero Coming From Behind  */
    /* ----------------------------- */

    let entryPoint = 0.55;

    if (progress > entryPoint) {

      let heroProgress = (progress - entryPoint) / (1 - entryPoint);
      heroProgress = gsap.utils.clamp(0, 1, heroProgress);

      let heroZ = gsap.utils.interpolate(-800, 0, heroProgress);

      gsap.set(hero, {
        z: heroZ
      });

      gsap.set(heroTitle, {
        opacity: heroProgress,
        scale: 0.8 + heroProgress * 0.2,
        filter: `blur(${(1 - heroProgress) * 20}px)`
      });

    } else {

      gsap.set(heroTitle, {
        opacity: 0,
        filter: "blur(20px)"
      });

      gsap.set(hero, {
        z: -800
      });
    }

  }
});
