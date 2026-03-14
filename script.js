/* ============================================
   JOY MEGA TRADER v2 — script.js
   ============================================ */

// ===== SCROLL PROGRESS =====
const scrollBar = document.getElementById('scrollBar');
window.addEventListener('scroll', () => {
  if (!scrollBar) return;
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  scrollBar.style.transform = `scaleX(${pct / 100})`;
}, { passive: true });

// ===== BACK TO TOP =====
const btt = document.getElementById('btt');
window.addEventListener('scroll', () => {
  if (btt) btt.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });
if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== TOP NAVBAR — scrolled state =====
const topnav = document.getElementById('topnav');
window.addEventListener('scroll', () => {
  if (topnav) topnav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ===== TOP NAVBAR — active link on scroll =====
const tnLinks  = document.querySelectorAll('.tn-link');
const sections = document.querySelectorAll('section[id], .hero-split[id]');
window.addEventListener('scroll', () => {
  const mid = window.scrollY + window.innerHeight * 0.4;
  sections.forEach(sec => {
    const link = document.querySelector(`.tn-link[href="#${sec.id}"]`);
    if (!link) return;
    link.classList.toggle('active', mid >= sec.offsetTop && mid < sec.offsetTop + sec.offsetHeight);
  });
}, { passive: true });

// ===== TOP NAVBAR — hamburger opens mobile drawer =====
const tnBurger   = document.getElementById('tnBurger');
const mobDrawer  = document.getElementById('mobDrawer');
const mobClose   = document.getElementById('mobClose');
const mobOverlay = document.getElementById('mobOverlay');

function openDrawer()  {
  if (!mobDrawer || !mobOverlay) return;
  mobDrawer.classList.add('open');
  mobOverlay.classList.add('show');
  mobDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (tnBurger) tnBurger.setAttribute('aria-expanded', 'true');
}
function closeDrawer() {
  if (!mobDrawer || !mobOverlay) return;
  mobDrawer.classList.remove('open');
  mobOverlay.classList.remove('show');
  mobDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (tnBurger) tnBurger.setAttribute('aria-expanded', 'false');
}

if (tnBurger)   tnBurger.addEventListener('click', openDrawer);
if (mobClose)   mobClose.addEventListener('click', closeDrawer);
if (mobOverlay) mobOverlay.addEventListener('click', closeDrawer);
document.querySelectorAll('.md-link').forEach(l => l.addEventListener('click', closeDrawer));

// ===== HERO STATS COUNTER =====
const heroStats = [
  { el: document.getElementById('c1'), target: 11,  suffix: '' },
  { el: document.getElementById('c2'), target: 250, suffix: '+' },
  { el: document.getElementById('c3'), target: 300, suffix: '' },
  { el: document.getElementById('c4'), target: 20,  suffix: '+' },
];
let statsRan = false;
function runCounters() {
  if (statsRan) return;
  statsRan = true;
  heroStats.forEach(({ el, target, suffix }) => {
    if (!el) return;
    const dur = 1600;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    })(start);
  });
}
// Run when hero stats strip is visible
const heroObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) runCounters(); });
}, { threshold: 0.5 });
const statStrip = document.querySelector('.hs-stat-strip');
if (statStrip) heroObs.observe(statStrip);
else runCounters(); // fallback

// ===== GALLERY DRAG SCROLL =====
const gsTrack = document.getElementById('gsTrack');
const gsPrev  = document.getElementById('gsPrev');
const gsNext  = document.getElementById('gsNext');
let isDragging = false, startX, scrollLeft;

if (gsTrack) {
  gsTrack.addEventListener('mousedown', e => {
    isDragging = true; startX = e.pageX - gsTrack.offsetLeft; scrollLeft = gsTrack.scrollLeft;
    gsTrack.style.userSelect = 'none';
  });
  document.addEventListener('mouseup',   () => { isDragging = false; gsTrack.style.userSelect = ''; });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const x = e.pageX - gsTrack.offsetLeft;
    gsTrack.scrollLeft = scrollLeft - (x - startX) * 1.4;
  });
  if (gsPrev) gsPrev.addEventListener('click', () => gsTrack.scrollBy({ left: -400, behavior: 'smooth' }));
  if (gsNext) gsNext.addEventListener('click', () => gsTrack.scrollBy({ left: 400,  behavior: 'smooth' }));

  // Touch support
  let tStart = 0;
  gsTrack.addEventListener('touchstart', e => { tStart = e.touches[0].clientX; }, { passive: true });
  gsTrack.addEventListener('touchend',   e => {
    const diff = tStart - e.changedTouches[0].clientX;
    gsTrack.scrollBy({ left: diff * 2, behavior: 'smooth' });
  });
}

// ===== SCROLL REVEAL =====
// Mark body so CSS hides .reveal elements only when JS is active
document.body.classList.add('js-ready');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

document.querySelectorAll('.reveal, .bento-tile, .ae-wrap, .ws-feat, .gs-item').forEach(el => {
  if (!el.classList.contains('reveal')) el.classList.add('reveal');
  // If already in viewport on page load, mark visible immediately
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    el.classList.add('in');
  } else {
    revealObserver.observe(el);
  }
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (contactForm && formSuccess) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.cf-submit');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    btn.disabled = true;

    // -------------------------------------------------------
    // TO SEND REAL EMAILS: replace setTimeout with a fetch call.
    // Example (Formspree — free at formspree.io):
    //
    // fetch('https://formspree.io/f/YOUR_FORM_ID', {
    //   method: 'POST',
    //   headers: { 'Accept': 'application/json' },
    //   body: new FormData(contactForm)
    // }).then(r => {
    //   if (r.ok) { showSuccess(); } else { showError(); }
    // });
    // -------------------------------------------------------

    setTimeout(() => {
      formSuccess.style.display = 'flex';
      contactForm.reset();
      btn.innerHTML = orig;
      btn.disabled  = false;
      setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
    }, 1400);
  });
}

// ===== NEWSLETTER =====
const fmSubBtn = document.getElementById('fm-sub-btn');
const fmEmail  = document.getElementById('fm-email');
if (fmSubBtn && fmEmail) {
  fmSubBtn.addEventListener('click', () => {
    if (!fmEmail.value.includes('@') || fmEmail.value.trim() === '') {
      fmEmail.style.outline = '2px solid #e06060';
      fmEmail.focus();
      setTimeout(() => { fmEmail.style.outline = ''; }, 2500);
      return;
    }
    fmSubBtn.textContent = '✓ Done!';
    fmEmail.value = '';
    setTimeout(() => { fmSubBtn.textContent = 'Subscribe'; }, 3000);
  });
}

// ===== FOOTER YEAR =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== TICKER pause on hover =====
const ticker = document.querySelector('.ticker-inner');
if (ticker) {
  ticker.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');
  ticker.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');
}