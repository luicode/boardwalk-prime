function initMenu() {
  const dialog = document.querySelector('[data-bp-menu]');
  if (!dialog || dialog.dataset.menuReady) return;
  dialog.dataset.menuReady = '1';
  const leaves = [...dialog.querySelectorAll('[data-bp-menu-leaf]')];
  const sections = [...dialog.querySelectorAll('[data-bp-menu-go]')];
  const previous = dialog.querySelector('[data-bp-menu-prev]');
  const next = dialog.querySelector('[data-bp-menu-next]');
  const status = dialog.querySelector('[data-bp-menu-status]');
  const stage = dialog.querySelector('[data-bp-menu-stage]');
  let page = 0;
  let turning = false;
  let timer;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function update() {
    previous.disabled = page === 0;
    next.disabled = page === leaves.length - 1;
    sections.forEach((button, index) => {
      if (index === page) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    leaves.forEach((leaf, index) => { leaf.inert = index !== page; });
    status.replaceChildren();
    status.append(`${String(page + 1).padStart(2, '0')} / ${String(leaves.length).padStart(2, '0')}`);
    const title = document.createElement('span');
    title.textContent = leaves[page].dataset.title;
    status.append(title);
  }

  function turnTo(target) {
    if (turning || target === page || target < 0 || target >= leaves.length) return;
    // Section shortcuts turn each intervening leaf, just like the bound menu.
    const forward = target > page;
    const index = forward ? page : page - 1;
    const leaf = leaves[index];
    turning = true;
    leaf.style.zIndex = '10';
    leaf.classList.add('is-turning');
    leaf.classList.toggle('is-turned', forward);
    page += forward ? 1 : -1;
    update();
    const finish = () => {
      leaf.classList.remove('is-turning');
      leaf.style.zIndex = page > index ? String(index + 1) : '';
      turning = false;
      if (page !== target && dialog.open) turnTo(target);
    };
    timer = window.setTimeout(finish, reducedMotion.matches ? 0 : 1080);
  }

  previous.addEventListener('click', () => turnTo(page - 1));
  next.addEventListener('click', () => turnTo(page + 1));
  sections.forEach((button) => button.addEventListener('click', () => turnTo(Number(button.dataset.bpMenuGo))));
  dialog.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    turnTo(event.key === 'Home' ? 0 : event.key === 'End' ? leaves.length - 1 : page + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let start;
  stage.addEventListener('touchstart', (event) => {
    start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchend', (event) => {
    if (!start || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      event.preventDefault();
      turnTo(page + (dx < 0 ? 1 : -1));
    }
  }, { passive: false });
  stage.addEventListener('touchcancel', () => { start = null; });
  // Load the high-resolution menu only when requested, keeping the landing page light.
  document.querySelector('[data-bp-modal-open="bp-menu-modal"]')?.addEventListener('click', () => {
    dialog.querySelectorAll('img[data-src]').forEach((image) => {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
  });
  dialog.addEventListener('close', () => {
    window.clearTimeout(timer);
    turning = false;
    leaves.forEach((leaf, index) => {
      leaf.classList.remove('is-turning');
      leaf.style.zIndex = index < page ? String(index + 1) : '';
    });
  });
  update();
}

document.addEventListener('turbo:load', initMenu);
document.addEventListener('DOMContentLoaded', initMenu);
