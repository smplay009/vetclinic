
(function () {
  "use strict";

  const root = document.getElementById("rk-clinic-services");

  if (!root || root.dataset.rkInitialized === "true") {
    return;
  }

  root.dataset.rkInitialized = "true";

  /* =====================================
     ⚠️ آدرس عکس‌ها
     چون این فایل JS جداست، {% static %} کار نمی‌کنه.
     باید آدرس‌های نهایی رو اینجا بذاری.
     مثال:
       "/static/images/brown-pussy-after-surgery.jpg"
     یا از یه data-attribute توی HTML بخونی.
  ===================================== */
  const IMAGE_SRCS = [
    "/static/images/brown-pussy-after-surgery-injection-animal-vet-mittens-with-injection.jpg",
    "/static/images/alexander-mass-fQeLC7WlNm8-unsplash.jpg",
    "/static/images/pexels-gustavo-fring-6816851.jpg",
    "/static/images/karsten-winegeart-loJL4ijUobg-unsplash.jpg",
    "/static/images/mirkosajkov-veterinary-4940425.jpg",
    "/static/images/pexels-tima-miroshnichenko-6235239.jpg"
  ];

  const FACE_NAMES = [
    "خدمات پایه",
    "خدمات پایه",
    "خدمات پایه",
    "خدمات پایه",
    "خدمات پایه",
    "خدمات پایه"
  ];

  const N = IMAGE_SRCS.length;

  const cube = root.querySelector("#rk-services-cube");
  const faces = Array.from(root.querySelectorAll(".rk-services-face"));
  const hudPct = root.querySelector("#rk-services-hud-pct");
  const progFill = root.querySelector("#rk-services-prog-fill");
  const sceneName = root.querySelector("#rk-services-scene-name");
  const captionName = root.querySelector("#rk-services-face-caption-name");
  const dots = Array.from(root.querySelectorAll(".rk-services-scene-dot"));
  const sections = Array.from(root.querySelectorAll(".rk-services-section"));
  const cards = Array.from(root.querySelectorAll(".rk-services-text-card"));

  let rootTop = 0;
  let rootHeight = 1;
  let maxScroll = 1;
  let sectionTops = [];
  let currentSection = -1;
  let targetProgress = 0;
  let smoothProgress = 0;
  let active = false;
  let ticking = false;
  let animationFrameId = null;

  /* =====================================
     LOAD IMAGES
  ===================================== */

  function preloadImage(src) {
    return new Promise(function (resolve) {
      const img = new Image();

      img.onload = function () {
        resolve(img);
      };

      img.onerror = function () {
        resolve(null);
      };

      img.src = src;

      if (img.complete) {
        resolve(img.naturalWidth ? img : null);
      }
    });
  }

  async function setFaceImage(faceIndex, imageIndex) {
    const face = faces[faceIndex];
    const src = IMAGE_SRCS[imageIndex];

    if (!face || !src) {
      return;
    }

    const loadedImage = await preloadImage(src);

    if (!loadedImage || !root.isConnected) {
      return;
    }

    let img = face.querySelector("img");

    if (!img) {
      img = document.createElement("img");
      img.alt = FACE_NAMES[imageIndex] || "تصویر خدمات کلینیک";
      img.loading = "eager";
      face.appendChild(img);
    }

    img.src = src;
  }

  IMAGE_SRCS.forEach(function (src, index) {
    setFaceImage(index, index);
  });

  /* =====================================
     CUBE ROTATION
  ===================================== */

  const STOPS = [
    { rx: 90, ry: 0 },
    { rx: 0, ry: 0 },
    { rx: 0, ry: -90 },
    { rx: 0, ry: -180 },
    { rx: 0, ry: -270 },
    { rx: -90, ry: -360 }
  ];

  function easeInOut(t) {
    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function setCubeTransform(progress) {
    const t = Math.max(0, Math.min(1, progress)) * (N - 1);
    const index = Math.min(Math.floor(t), N - 2);
    const fraction = easeInOut(t - index);

    const start = STOPS[index];
    const end = STOPS[index + 1];

    const rx = start.rx + (end.rx - start.rx) * fraction;
    const ry = start.ry + (end.ry - start.ry) * fraction;

    cube.style.transform =
      "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
  }

  /* =====================================
     MEASURE THIS SECTION ONLY
  ===================================== */

  function resize() {
    const rect = root.getBoundingClientRect();

    rootTop = rect.top + window.scrollY;
    rootHeight = root.offsetHeight;

    maxScroll = Math.max(1, rootHeight - window.innerHeight);

    sectionTops = sections.map(function (section) {
      return section.offsetTop;
    });
  }

  function getSectionIndex(progress) {
    const localPosition = progress * maxScroll + window.innerHeight * 0.5;

    let index = 0;

    for (let i = 0; i < sectionTops.length; i++) {
      if (localPosition >= sectionTops[i]) {
        index = i;
      }
    }

    return Math.min(index, N - 1);
  }

  function updateHUD(progress) {
    const percentage = Math.round(progress * 100);

    hudPct.textContent =
      String(percentage).padStart(3, "0") + "%";

    progFill.style.width = percentage + "%";

    const index = getSectionIndex(progress);

    if (index !== currentSection) {
      currentSection = index;

      const name = FACE_NAMES[index] || "خدمات کلینیک";

      sceneName.textContent = name;
      captionName.textContent = name;

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle(
          "rk-services-dot-active",
          dotIndex === index
        );
      });
    }
  }

  /* =====================================
     REVEAL TEXT
  ===================================== */

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("rk-services-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    cards.forEach(function (card) {
      revealObserver.observe(card);
    });
  } else {
    cards.forEach(function (card) {
      card.classList.add("rk-services-visible");
    });
  }

  /* =====================================
     ACTIVE STATE
     مکعب فقط در محدوده همین سکشن
  ===================================== */

  function updateActiveState() {
    const rect = root.getBoundingClientRect();

    const visible =
      rect.bottom > 0 &&
      rect.top < window.innerHeight;

    if (visible !== active) {
      active = visible;
      root.classList.toggle("rk-services-active", visible);
    }

    if (!visible) {
      return;
    }

    const localScroll = window.scrollY - rootTop;

    targetProgress = Math.max(
      0,
      Math.min(1, localScroll / maxScroll)
    );

    if (localScroll <= 0) {
      targetProgress = 0;
      smoothProgress = 0;
      setCubeTransform(0);
    }
  }

  /* =====================================
     SMOOTH CUBE ANIMATION
  ===================================== */

  function frame() {
    if (!root.isConnected) {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      return;
    }

    if (active) {
      smoothProgress +=
        (targetProgress - smoothProgress) * 0.09;

      if (Math.abs(targetProgress - smoothProgress) < 0.0001) {
        smoothProgress = targetProgress;
      }

      setCubeTransform(smoothProgress);
      updateHUD(smoothProgress);
    }

    animationFrameId = requestAnimationFrame(frame);
  }

  /* =====================================
     SCROLL UPDATES
  ===================================== */

  function update() {
    resize();
    updateActiveState();
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  /* =====================================
     NAVIGATION DOTS
  ===================================== */

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const index = Number(dot.dataset.rkTarget);
      const target = sections[index];

      if (!target) {
        return;
      }

      const targetY = rootTop + target.offsetTop;

      window.scrollTo({
        top: targetY,
        behavior: "smooth"
      });
    });
  });

  /* =====================================
     INITIALIZE
  ===================================== */

  window.addEventListener("scroll", requestUpdate, {
    passive: true
  });

  window.addEventListener("resize", requestUpdate);

  window.addEventListener("load", requestUpdate);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestUpdate);
  }

  resize();
  updateActiveState();
  setCubeTransform(0);
  updateHUD(0);
  animationFrameId = requestAnimationFrame(frame);

})();


const pinnedImg = document.querySelector("#pinnedImg");
const steps = document.querySelectorAll(".pinned__step");
let currentImg = pinnedImg.src;

function updateImg(step) {
  const img = step.dataset.img;
  if (!img || currentImg.includes(img.split("?")[0])) return;
  currentImg = img;

  gsap.to(pinnedImg, {
    opacity: 0,
    duration: 0.35,
    onComplete: () => {
      pinnedImg.src = img;
      gsap.to(pinnedImg, { opacity: 0.5, duration: 0.6 });
    }
  });
}

steps.forEach((step) => {
  ScrollTrigger.create({
    trigger: step,
    start: "top center",
    end: "bottom center",
    onEnter: () => updateImg(step),
    onEnterBack: () => updateImg(step)
  });
});

// اضافه کردن نور پررنگ با JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const categorySection = document.querySelector('.category-section');
  const lightElement = document.createElement('div');
  lightElement.className = 'section-light';
  lightElement.innerHTML = `
  <style>
    .section-light {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%);
      animation: shine 2.5s linear infinite;
      pointer-events: none;
      z-index: 0;
      }
      @keyframes shine {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        </style>
        `;
        categorySection.appendChild(lightElement);
      });
