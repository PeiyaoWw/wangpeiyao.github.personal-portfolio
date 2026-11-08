const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const progress = document.querySelector('.page-progress span');
function updateProgress() {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const value = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${Math.min(Math.max(value, 0), 1)})`;
}
updateProgress();
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);

const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#siteNav');
function setMenu(open) {
  if (!menuButton || !siteNav) return;
  menuButton.setAttribute('aria-expanded', String(open));
  siteNav.classList.toggle('open', open);
}

menuButton?.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});
siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 760) setMenu(false);
});

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const clock = document.querySelector('#clock');
function updateClock() {
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());
}
updateClock();
window.setInterval(updateClock, 30000);

const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxTitle = document.querySelector('#lightboxTitle');
const lightboxOriginal = document.querySelector('#openOriginal');
const lightboxClose = document.querySelector('#lightboxClose');

function openLightbox(source, title) {
  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxOriginal) return;
  lightboxImage.src = source;
  lightboxImage.alt = `${title}高清长图`;
  lightboxTitle.textContent = title;
  lightboxOriginal.href = source;
  if (typeof lightbox.showModal === 'function') lightbox.showModal();
  else lightbox.setAttribute('open', '');
}

document.querySelectorAll('[data-image]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    openLightbox(trigger.dataset.image, trigger.dataset.title || '作品详情');
  });
});

lightboxClose?.addEventListener('click', () => lightbox?.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
