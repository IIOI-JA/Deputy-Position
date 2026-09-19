/* ============================================================
   Cinematic deck · interaction engine
   ------------------------------------------------------------
   Zero dependencies. Everything is driven by native scroll-snap +
   one IntersectionObserver. Read top to bottom; each block is
   independent and safe to delete if a deck doesn't use it.

   Blocks:
     1. Cross-window sync (speaker <-> audience mirror)
     2. Loader dismiss
     3. Language toggle (OPTIONAL — delete if monolingual)
     4. Speaker / audience modes
     5. In-view observer (drives reveals + counter + sync)
     6. Navigation (dots / keyboard)
     7. Count-up numbers (OPTIONAL)
     8. Auto-advance carousel (OPTIONAL)
   ============================================================ */

(() => {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const dots   = Array.from(document.querySelectorAll('.slide-nav .dot'));
  const ctrNum = document.querySelector('.ctr-num');
  const ctrTot = document.querySelector('.ctr-tot');
  const body   = document.body;
  const html   = document.documentElement;

  if (ctrTot) ctrTot.textContent = String(slides.length).padStart(2, '0');

  /* ============================================================
     1. CROSS-WINDOW SYNC  (speaker window <-> audience window)
     Both windows are the same origin, so BroadcastChannel mirrors
     state between them (localStorage is the fallback for browsers
     without BroadcastChannel). Each window stamps messages with a
     random ORIGIN_ID so it ignores its own echoes; `applyingRemote`
     stops the IntersectionObserver from re-broadcasting a change it
     only made because it received one (the feedback-loop guard).
     Change CHANNEL to something unique per deck.
  ============================================================ */
  const CHANNEL  = 'deputy-showcase-sync';
  const ORIGIN_ID = Math.random().toString(36).slice(2);
  const bc = ('BroadcastChannel' in window) ? new BroadcastChannel(CHANNEL) : null;
  let applyingRemote = false;

  const syncIndicator = document.querySelector('[data-sync-status]');
  let syncTimer = null;
  const flashSync = () => {
    if (!syncIndicator) return;
    syncIndicator.hidden = false;
    syncIndicator.classList.add('is-on');
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncIndicator.classList.remove('is-on'), 1100);
  };

  const broadcast = (payload) => {
    if (applyingRemote) return;
    const msg = { ...payload, _origin: ORIGIN_ID, _ts: Date.now() };
    if (bc) { try { bc.postMessage(msg); } catch {} }
    try { localStorage.setItem(CHANNEL, JSON.stringify(msg)); } catch {}
  };

  const onRemote = (msg) => {
    if (!msg || msg._origin === ORIGIN_ID) return;
    applyingRemote = true;
    try {
      if (msg.type === 'slide' && typeof msg.i === 'number' && slides[msg.i]) {
        slides[msg.i].scrollIntoView({ behavior: 'smooth', block: 'start' });
        flashSync();
      } else if (msg.type === 'lang' && typeof applyLang === 'function') {
        applyLang(msg.lang); flashSync();
      }
      // notes state is intentionally NOT mirrored — it's speaker-only.
    } finally {
      // give the smooth-scroll + IO a beat to settle before we allow
      // this window to broadcast again, else it echoes back.
      setTimeout(() => { applyingRemote = false; }, 900);
    }
  };

  if (bc) bc.onmessage = (e) => onRemote(e.data);
  window.addEventListener('storage', (e) => {
    if (e.key !== CHANNEL || !e.newValue) return;
    try { onRemote(JSON.parse(e.newValue)); } catch {}
  });

  /* ============================================================
     2. LOADER dismiss
  ============================================================ */
  const hideLoader = () => {
    const wait = Math.max(0, 700 - performance.now());
    setTimeout(() => body.classList.remove('is-loading'), wait);
  };
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader, { once: true });

  /* ============================================================
     3. LANGUAGE TOGGLE  (OPTIONAL)
     Every bilingual element wraps text in
       <span data-lang="en">…</span><span data-lang="da">…</span>
     and CSS hides the inactive language. Delete this whole block
     (and the [data-set-lang] buttons in the HTML) for a single-
     language deck. `applyLang` is referenced by the sync block via
     typeof-guard, so removing it is safe.
  ============================================================ */
  const langButtons = Array.from(document.querySelectorAll('[data-set-lang]'));
  let applyLang;
  if (langButtons.length) {
    const STORAGE_LANG = CHANNEL + '.lang';
    applyLang = (lang) => {
      const langs = langButtons.map(b => b.dataset.setLang);
      if (!langs.includes(lang)) lang = langs[0];
      body.dataset.lang = lang;
      html.setAttribute('lang', lang);
      langButtons.forEach((b) => {
        const active = b.dataset.setLang === lang;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      try { localStorage.setItem(STORAGE_LANG, lang); } catch {}
      broadcast({ type: 'lang', lang });
    };
    const initialLang = (() => {
      try { const s = localStorage.getItem(STORAGE_LANG); if (s) return s; } catch {}
      const u = new URL(location.href);
      if (u.searchParams.get('lang')) return u.searchParams.get('lang');
      return body.dataset.lang || langButtons[0].dataset.setLang;
    })();
    applyLang(initialLang);
    langButtons.forEach((b) => b.addEventListener('click', (e) => {
      e.preventDefault(); applyLang(b.dataset.setLang);
    }));
  }

  /* ============================================================
     4. SPEAKER / AUDIENCE modes
     ?speaker=1 (or ?notes=1)  -> body[data-speaker]  -> reveals the
       Notes + Audience-view buttons. The default (audience-facing)
       URL hides all of that, so the projector stays clean.
     ?audience=1               -> body[data-audience] -> marks this as
       the mirror window. (By default the audience view == main view;
       only the notes drawer is force-hidden, see CSS.)
     Shift+N toggles speaker mode live; N toggles the notes drawer;
     A (in speaker mode) opens the audience window.
  ============================================================ */
  const url = new URL(location.href);
  const setSpeaker  = (on) => on ? body.setAttribute('data-speaker', '1')  : body.removeAttribute('data-speaker');
  const setAudience = (on) => on ? body.setAttribute('data-audience', '1') : body.removeAttribute('data-audience');
  setSpeaker(url.searchParams.has('speaker') || url.searchParams.has('notes'));
  setAudience(url.searchParams.has('audience'));

  const notesBtn   = document.querySelector('[data-toggle-notes]');
  const notesAsides = Array.from(document.querySelectorAll('.slide .notes'));
  const setNotes = (on) => {
    body.classList.toggle('notes-on', on);
    if (notesBtn) notesBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    notesAsides.forEach((a) => { a.hidden = !on; });
  };
  setNotes(false);
  notesBtn?.addEventListener('click', () => setNotes(!body.classList.contains('notes-on')));

  const openAudienceBtn = document.querySelector('[data-open-audience]');
  let audienceWin = null;
  const openAudienceWindow = () => {
    const u = new URL(location.href);
    u.searchParams.delete('speaker'); u.searchParams.delete('notes');
    u.searchParams.set('audience', '1');
    if (audienceWin && !audienceWin.closed) { audienceWin.focus(); return; }
    audienceWin = window.open(u.toString(), 'deck-audience', 'popup=yes,width=1280,height=800');
  };
  openAudienceBtn?.addEventListener('click', openAudienceWindow);

  /* ============================================================
     5. IN-VIEW OBSERVER  — the single source of truth
     One observer per deck: adds .in-view (fires the CSS reveal
     cascade) and, when a slide passes 50% visibility, marks it
     active (updates dots + counter + broadcasts to the mirror).
  ============================================================ */
  let active = 0;
  const setActive = (i) => {
    active = i;
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
    if (ctrNum) ctrNum.textContent = String(i + 1).padStart(2, '0');
    broadcast({ type: 'slide', i });
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const idx = slides.indexOf(e.target);
        e.target.classList.add('in-view');
        if (idx >= 0 && e.intersectionRatio > .5) {
          setActive(idx);
          if (typeof animateCounters === 'function') animateCounters(e.target);
        }
      }
    });
  }, { threshold: [0, .15, .5, .75], rootMargin: '-5% 0px -5% 0px' });
  slides.forEach((s) => io.observe(s));

  /* ============================================================
     6. NAVIGATION — dots + keyboard. Both just scrollIntoView; the
     observer above handles activation. One source of truth.
  ============================================================ */
  dots.forEach((d) => d.addEventListener('click', () => {
    slides[Number(d.dataset.go)]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  const go = (delta) => {
    const next = Math.max(0, Math.min(slides.length - 1, active + delta));
    slides[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    switch (e.key) {
      case 'ArrowDown': case 'PageDown': case ' ': e.preventDefault(); go(+1); break;
      case 'ArrowUp':   case 'PageUp':            e.preventDefault(); go(-1); break;
      case 'Home': e.preventDefault(); slides[0].scrollIntoView({ behavior: 'smooth' }); break;
      case 'End':  e.preventDefault(); slides[slides.length - 1].scrollIntoView({ behavior: 'smooth' }); break;
      case 'n': case 'N':
        e.preventDefault();
        if (e.shiftKey) setSpeaker(!body.hasAttribute('data-speaker'));
        else if (body.hasAttribute('data-speaker')) setNotes(!body.classList.contains('notes-on'));
        break;
      case 'a': case 'A':
        if (body.hasAttribute('data-speaker')) { e.preventDefault(); openAudienceWindow(); }
        break;
      case 'l': case 'L':
        if (typeof applyLang === 'function' && langButtons.length) {
          e.preventDefault();
          const langs = langButtons.map(b => b.dataset.setLang);
          applyLang(langs[(langs.indexOf(body.dataset.lang) + 1) % langs.length]);
        }
        break;
    }
  });

  /* ============================================================
     7. COUNT-UP NUMBERS  (OPTIONAL)
     Any element with data-count="182" animates 0 -> 182 the first
     time its slide enters view. Delete if no stat callouts.
  ============================================================ */
  function animateCounters(scope) {
    if (scope.dataset.counted) return;
    const els = scope.querySelectorAll('[data-count]');
    if (!els.length) return;
    scope.dataset.counted = '1';
    els.forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const dur = 1600, start = performance.now() + 150;
      const step = (now) => {
        const t = Math.max(0, Math.min(1, (now - start) / dur));
        const e = 1 - Math.pow(1 - t, 3);           // ease-out cubic
        el.textContent = Math.round(target * e).toString();
        if (t < 1) requestAnimationFrame(step); else el.textContent = String(target);
      };
      requestAnimationFrame(step);
    });
  }
  // expose so the observer (declared above) can call it
  window.__animateCounters = animateCounters;

  /* ============================================================
     8. AUTO-ADVANCE CAROUSEL  (OPTIONAL)
     Markup: a [data-cycler] element containing .cyc-item children
     (one .is-active). Optional [data-cyc-bar] progress fill,
     [data-go-cyc] dot buttons, [data-cyc-index] counter.
     Items crossfade via CSS opacity (position:absolute; inset:0).
     Auto-advances only while its slide is in view; pauses on hover.
  ============================================================ */
  document.querySelectorAll('[data-cycler]').forEach((cycler) => {
    const items = Array.from(cycler.querySelectorAll('.cyc-item'));
    if (!items.length) return;
    const cdots = Array.from(cycler.querySelectorAll('[data-go-cyc]'));
    const bar   = cycler.querySelector('[data-cyc-bar]');
    const idxEl = cycler.querySelector('[data-cyc-index]');
    const DURATION = Number(cycler.dataset.cycMs || 10000);

    let ci = 0, paused = false, inView = false, timer = null, raf = 0, barStart = 0;

    const set = (n) => {
      ci = ((n % items.length) + items.length) % items.length;
      items.forEach((el, k) => el.classList.toggle('is-active', k === ci));
      cdots.forEach((d, k) => d.classList.toggle('is-active', k === ci));
      if (idxEl) idxEl.textContent = String(ci + 1);
      restartBar();
    };
    const tick = (now) => {
      if (bar && !paused && inView) bar.style.width = Math.min(100, ((now - barStart) / DURATION) * 100) + '%';
      raf = requestAnimationFrame(tick);
    };
    const restartBar = () => { barStart = performance.now(); if (bar) bar.style.width = '0%'; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
    const arm = () => { clearTimeout(timer); timer = setTimeout(() => { if (!paused && inView) { set(ci + 1); arm(); } }, DURATION); };

    cdots.forEach((d) => d.addEventListener('click', () => { set(Number(d.dataset.goCyc)); arm(); }));
    cycler.addEventListener('mouseenter', () => { paused = true; });
    cycler.addEventListener('mouseleave', () => { paused = false; restartBar(); arm(); });
    cycler.addEventListener('focusin',  () => { paused = true; });
    cycler.addEventListener('focusout', () => { paused = false; restartBar(); arm(); });

    new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && e.intersectionRatio > .35) { if (!inView) { inView = true; restartBar(); arm(); } }
      else { inView = false; clearTimeout(timer); }
    }), { threshold: [0, .35, .75] }).observe(cycler.closest('.slide'));
  });

})();
