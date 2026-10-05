function shuffle(items) {
  const list = [...items];

  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }

  return list;
}

function initSplashMedia() {
  const root = document.querySelector("[data-bp-splash]");
  if (!root || root.dataset.bpMediaReady === "1") return;

  const media = Array.from(root.querySelectorAll("[data-bp-media]"));
  if (!media.length) return;

  root.dataset.bpMediaReady = "1";

  const videos = media.filter((item) => item.dataset.bpKind === "video");
  const images = shuffle(media.filter((item) => item.dataset.bpKind === "image"));
  const sequence = [...videos, ...images];
  const imageDuration = 6800;
  const minimumVideoDuration = 7200;
  let index = 0;
  let timer = null;

  const clearTimer = () => {
    if (timer) window.clearTimeout(timer);
    timer = null;
  };

  const mediaDuration = (item) => {
    if (item.dataset.bpKind !== "video") return imageDuration;
    const duration = Number.isFinite(item.duration) && item.duration > 0 ? item.duration * 1000 : minimumVideoDuration;
    return Math.max(minimumVideoDuration, Math.min(duration, 15000));
  };

  const scheduleNext = (item) => {
    clearTimer();
    timer = window.setTimeout(() => show((index + 1) % sequence.length), mediaDuration(item));
  };

  const show = (nextIndex) => {
    const current = sequence[index];
    const next = sequence[nextIndex];
    index = nextIndex;

    if (current && current.dataset.bpKind === "video") {
      current.pause();
    }

    sequence.forEach((item) => item.classList.toggle("is-active", item === next));

    if (next.dataset.bpKind === "video") {
      next.currentTime = 0;
      next.play().catch(() => {});
    }

    scheduleNext(next);
  };

  sequence.forEach((item) => item.classList.remove("is-active"));
  sequence[0].classList.add("is-active");

  if (sequence[0].dataset.bpKind === "video") {
    sequence[0].play().catch(() => {});
  }

  scheduleNext(sequence[0]);
}

function initEmailForm() {
  const form = document.querySelector("[data-bp-email-form]");
  const toast = document.querySelector("[data-bp-toast]");
  if (!form || !toast || form.dataset.bpReady === "1") return;

  form.dataset.bpReady = "1";
  let toastTimer = null;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");

    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3800);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = form.querySelector("input[type='email']");
    if (!input || !input.checkValidity()) {
      form.reportValidity();
      return;
    }

    const token = document.querySelector("meta[name='csrf-token']")?.content;
    const submitButton = form.querySelector("button[type='submit']");

    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: form.method || "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { "X-CSRF-Token": token } : {})
        },
        body: JSON.stringify({ email_signup: { email: input.value } })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        input.setCustomValidity((payload.errors || ["Please enter a valid email address."]).join(" "));
        form.reportValidity();
        input.setCustomValidity("");
        return;
      }

      input.value = "";
      showToast(payload.message || "Thank you for your e-mail. We'll be in touch!");
    } catch (_error) {
      showToast("Sorry, something went wrong. Please try again.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

document.addEventListener("turbo:load", () => {
  initSplashMedia();
  initEmailForm();
});

document.addEventListener("DOMContentLoaded", () => {
  initSplashMedia();
  initEmailForm();
});
