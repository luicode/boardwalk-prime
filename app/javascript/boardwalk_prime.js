function setNavState() {
  const nav = document.querySelector(".bp-nav");
  if (!nav) return;
  if (window.scrollY > 12) nav.classList.add("bp-nav-solid");
  else nav.classList.remove("bp-nav-solid");
}

function initMenuTabs() {
  const tabButtons = document.querySelectorAll("[data-bp-tab]");
  const panels = document.querySelectorAll("[data-bp-panel]");
  if (!tabButtons.length || !panels.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-bp-tab");

      tabButtons.forEach((b) => {
        b.classList.remove("btn-light");
        b.classList.add("btn-outline-light");
      });
      btn.classList.add("btn-light");
      btn.classList.remove("btn-outline-light");

      panels.forEach((p) => {
        p.classList.toggle("d-none", p.getAttribute("data-bp-panel") !== key);
      });
    });
  });
}

function initGalleryModal() {
  const modal = document.getElementById("bpGalleryModal");
  if (!modal) return;

  modal.addEventListener("show.bs.modal", (event) => {
    const trigger = event.relatedTarget;
    if (!trigger) return;

    const src = trigger.getAttribute("data-bp-src");
    const title = trigger.getAttribute("data-bp-title") || "Photo";

    const img = document.getElementById("bpGalleryImg");
    const h = document.getElementById("bpGalleryTitle");

    if (img) img.src = src;
    if (h) h.textContent = title;
  });
}

function initHeroSoundToggle() {
  const video = document.querySelector(".bp-hero-video");
  const btn = document.getElementById("bpToggleSound");
  if (!video || !btn) return;

  btn.addEventListener("click", () => {
    video.muted = !video.muted;
    const icon = btn.querySelector("i");
    if (video.muted) {
      if (icon) icon.className = "bi bi-volume-mute";
      btn.blur();
    } else {
      if (icon) icon.className = "bi bi-volume-up";
    }
  });
}

document.addEventListener("turbo:load", () => {
  setNavState();
  initMenuTabs();
  initGalleryModal();
  initHeroSoundToggle();
  window.addEventListener("scroll", setNavState, { passive: true });
});