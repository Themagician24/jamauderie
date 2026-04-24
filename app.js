/* ═══════════════════════════════════════════
   RELAIS DE LA JAMAUDERIE — App v3
   Champagne Blush (6h–18h) · Royal Aurora (18h–6h)
   ═══════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const html = document.documentElement;

/* ══ THÈME HORAIRE ══ */
const THEMES = {
  champagne: {
    key:   'champagne',
    label: '🥂 Champagne Blush',
    hours: h => h >= 6 && h < 18,
  },
  aurora: {
    key:   'aurora',
    label: '✦ Royal Aurora',
    hours: h => h < 6 || h >= 18,
  },
};

let currentTheme = null;

function getThemeForHour(h) {
  return THEMES.aurora.hours(h) ? THEMES.aurora : THEMES.champagne;
}

function showThemeToast(label) {
  const existing = document.getElementById('theme-toast');
  if (existing) { existing.remove(); }

  const toast = document.createElement('div');
  toast.id = 'theme-toast';
  toast.className = 'theme-toast';
  toast.textContent = label;
  document.body.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

function applyTheme(theme, announce = false) {
  if (currentTheme?.key === theme.key) return;

  const prev = currentTheme;
  currentTheme = theme;

  if (prev) {
    /* Fondu discret entre les deux thèmes */
    document.body.style.transition = 'opacity .5s ease';
    document.body.style.opacity = '0';
    setTimeout(() => {
      html.setAttribute('data-theme', theme.key);
      document.body.style.opacity = '1';
      setTimeout(() => { document.body.style.transition = ''; }, 600);
    }, 500);
  } else {
    html.setAttribute('data-theme', theme.key);
  }

  if (announce) setTimeout(() => showThemeToast(theme.label), prev ? 600 : 200);
}

function syncThemeToTime(announce = false) {
  const h = new Date().getHours();
  applyTheme(getThemeForHour(h), announce);
}

/* Synchronisation initiale + vérification toutes les minutes */
syncThemeToTime(false);
setInterval(() => syncThemeToTime(true), 60_000);

/* ══ LOADER ══ */
window.addEventListener('load', () => {
  setTimeout(() => {
    $('loader').classList.add('out');
    startCounters();
    revealHero();
    /* Annonce le thème actif une fois le site chargé */
    setTimeout(() => showThemeToast(currentTheme.label), 800);
  }, 1400);
});

/* ══ SCROLL NAV ══ */
const nav = $('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 30);
}, { passive: true });

/* ══ BURGER / MENU MOBILE ══ */
const burger    = $('burger');
const mobileNav = $('mobile-nav');

function closeMenu() {
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
}

burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  mobileNav.classList.toggle('open', open);
  mobileNav.setAttribute('aria-hidden', open ? 'false' : 'true');
});

document.querySelectorAll('.m-link').forEach(l => l.addEventListener('click', closeMenu));

/* ══ ACTIVE NAV LINK ══ */
const navLinks = document.querySelectorAll('.nav-link');
const sectionIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    }
  });
}, { threshold: .35 });
document.querySelectorAll('section[id]').forEach(s => sectionIO.observe(s));

/* ══ MODE ÉCOLOGIE ══ */
const ECO_KEY = 'jamauderie-eco';
let ecoOn = localStorage.getItem(ECO_KEY) === '1';

function applyEco(on) {
  html.setAttribute('data-mode', on ? 'eco' : 'normal');
  document.querySelectorAll('.eco-btn').forEach(b => {
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  const box = $('eco-box');
  if (box) box.hidden = !on;
  localStorage.setItem(ECO_KEY, on ? '1' : '0');
}
applyEco(ecoOn);

function toggleEco() { ecoOn = !ecoOn; applyEco(ecoOn); }
$('eco-toggle').addEventListener('click', toggleEco);
$('eco-mobile')?.addEventListener('click', () => { toggleEco(); closeMenu(); });

/* ══ SCROLL REVEAL ══ */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal,.reveal-up,.reveal-left,.reveal-right')
    .forEach(el => obs.observe(el));
})();

function revealHero() {
  document.querySelectorAll('.hero .reveal,.hero .reveal-up,.hero .reveal-right')
    .forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 110));
}

/* ══ COMPTEURS ANIMÉS ══ */
function startCounters() {
  document.querySelectorAll('.stat-n').forEach(el => {
    const target = +el.dataset.target;
    const dec    = el.dataset.decimal || '';
    const t0     = performance.now();
    const dur    = 1600;
    (function tick(now) {
      const p   = Math.min((now - t0) / dur, 1);
      const val = Math.round((1 - Math.pow(1 - p, 3)) * target);
      el.textContent = p === 1 ? val + dec : val;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

/* ══ TILT 3D ÉQUIPEMENTS ══ */
document.querySelectorAll('.equip-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `translateY(-5px) perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ══ SMOOTH SCROLL ══ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 76, behavior: 'smooth' });
    closeMenu();
  });
});

/* ══ VIDÉO — TOGGLE SON ══ */
(function initVideoMute() {
  const video    = $('chevaux-video');
  const btn      = $('chevaux-mute');
  if (!video || !btn) return;
  const iconMute  = btn.querySelector('.icon-mute');
  const iconSound = btn.querySelector('.icon-sound');
  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    iconMute.style.display  = video.muted  ? '' : 'none';
    iconSound.style.display = !video.muted ? '' : 'none';
    btn.setAttribute('aria-label', video.muted ? 'Activer le son' : 'Couper le son');
  });
})();

/* ══ AVIS (localStorage) ══ */
(function initAvis() {
  const KEY    = 'jamauderie-avis';
  const LABELS = ['', 'Déçu(e)', 'Passable', 'Bien', 'Très bien', 'Excellent !'];

  const DEFAULTS = [
    { id: 1, prenom: 'Marie D.',  ville: 'Auxerre', rating: 5,
      comment: 'Séjour magnifique ! Le relais est exactement comme sur les photos, très chaleureux. La cuisine professionnelle nous a permis de préparer un repas gastronomique pour tout le groupe. On reviendra sans hésiter !',
      date: '2024-09-12' },
    { id: 2, prenom: 'Pierre L.', ville: 'Dijon',   rating: 5,
      comment: 'Parfait pour notre réunion de famille. 18 personnes hébergées confortablement, la grande salle à manger est superbe avec son insert. Cadre naturel exceptionnel en Bourgogne, très calme.',
      date: '2024-08-03' },
    { id: 3, prenom: 'Sophie M.', ville: 'Paris',   rating: 4,
      comment: "Très beau gîte, calme et bien équipé. Petit bémol sur la direction GPS pas toujours précise, mais une fois arrivés c'est le coup de cœur immédiat ! Hôtes disponibles et attentionnés.",
      date: '2024-07-19' },
  ];

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || DEFAULTS; } catch { return DEFAULTS; } };
  const save = list => localStorage.setItem(KEY, JSON.stringify(list));

  const fmtDate  = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const stars    = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const initials = n => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  function renderSummary(list) {
    const avg = list.reduce((s, a) => s + a.rating, 0) / list.length;
    const r   = Math.round(avg * 10) / 10;
    const scoreEl = $('rating-score');
    const starsEl = $('rating-stars');
    const countEl = $('rating-count');
    if (scoreEl) scoreEl.textContent = r.toFixed(1);
    if (starsEl) { const n = Math.round(avg); starsEl.textContent = '★'.repeat(n) + '☆'.repeat(5 - n); }
    if (countEl) countEl.textContent = `${list.length} avis vérifié${list.length > 1 ? 's' : ''}`;
    const counts = [0, 0, 0, 0, 0];
    list.forEach(a => counts[a.rating - 1]++);
    document.querySelectorAll('.rbar-fill').forEach((bar, i) => {
      bar.style.width = (list.length ? Math.round(counts[4 - i] / list.length * 100) : 0) + '%';
    });
  }

  function renderCard(avis, delay = 0) {
    const art = document.createElement('article');
    art.className = 'r-card reveal-up';
    art.style.setProperty('--d', delay + 's');
    art.innerHTML = `
      <div class="r-head">
        <div class="r-avatar" aria-hidden="true">${initials(avis.prenom)}</div>
        <div>
          <div class="r-name">${avis.prenom}</div>
          ${avis.ville ? `<div class="r-city">${avis.ville}</div>` : ''}
        </div>
        <div class="r-date">${fmtDate(avis.date)}</div>
      </div>
      <div class="r-stars" aria-label="${avis.rating} étoiles">${stars(avis.rating)}</div>
      <p class="r-text">${avis.comment}</p>`;
    return art;
  }

  function renderAll() {
    const list = load();
    const grid = $('reviews-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = '<p class="reviews-empty">Aucun avis pour l\'instant. Soyez le premier !</p>';
    } else {
      list.forEach((a, i) => {
        const card = renderCard(a, i * .06);
        grid.appendChild(card);
        requestAnimationFrame(() => card.classList.add('visible'));
      });
    }
    renderSummary(list);
  }

  /* Étoiles interactives */
  let selected = 0;
  const starBtns = document.querySelectorAll('.star-btn');
  const starHint  = $('star-hint');

  starBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      const v = +btn.dataset.v;
      starBtns.forEach(s => s.classList.toggle('hover', +s.dataset.v <= v));
      if (starHint) starHint.textContent = LABELS[v];
    });
    btn.addEventListener('mouseleave', () => {
      starBtns.forEach(s => { s.classList.remove('hover'); s.classList.toggle('on', +s.dataset.v <= selected); });
      if (starHint) starHint.textContent = selected ? LABELS[selected] : 'Sélectionnez une note';
    });
    btn.addEventListener('click', () => {
      selected = +btn.dataset.v;
      starBtns.forEach(s => s.classList.toggle('on', +s.dataset.v <= selected));
      if (starHint) { starHint.textContent = LABELS[selected]; starHint.style.color = 'var(--gold)'; }
    });
  });

  const form = $('avis-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const prenom  = $('r-prenom').value.trim();
      const ville   = $('r-ville').value.trim();
      const comment = $('r-comment').value.trim();
      if (!prenom || !comment || !selected) {
        if (!selected && starHint) { starHint.textContent = '⚠ Veuillez choisir une note'; starHint.style.color = '#f87171'; }
        return;
      }
      const list = load();
      list.unshift({ id: Date.now(), prenom, ville, rating: selected, comment, date: new Date().toISOString().slice(0, 10) });
      save(list);
      renderAll();
      form.reset();
      selected = 0;
      starBtns.forEach(s => s.classList.remove('on', 'hover'));
      if (starHint) { starHint.textContent = 'Sélectionnez une note'; starHint.style.color = ''; }
      document.getElementById('avis')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  renderAll();
})();

/* ══ FORMULAIRE CONTACT ══ */
(function initContact() {
  const form = $('contact-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn      = this.querySelector('button[type=submit]');
    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';
    setTimeout(() => {
      this.reset();
      btn.disabled = false;
      btn.innerHTML = origHTML;
      const ok = $('form-ok');
      if (ok) { ok.hidden = false; setTimeout(() => { ok.hidden = true; }, 5000); }
    }, 1100);
  });
})();
