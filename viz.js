/* ============================================================
   DEPUTY deck · bespoke visualisation
   ------------------------------------------------------------
   The 168-hour week. Seven rows (days) x twenty-four columns
   (hours). One cell is the session. The other 167 are the pitch.

   Deck-specific and self-contained — the engine in main.js is
   untouched. Cells fade in on a left-to-right sweep keyed off the
   `.in-view` class the engine's IntersectionObserver already sets,
   so there is no second observer and no timing to keep in sync.
============================================================ */
(() => {
  'use strict';

  const host = document.querySelector('[data-viz="week"]');
  if (!host) return;

  const NS      = 'http://www.w3.org/2000/svg';
  const COLS    = 24;   // hours in a day
  const ROWS    = 7;    // days in a week
  const CELL    = 22;
  const GAP     = 5;
  const STEP    = CELL + GAP;
  const PAD_TOP = 34;   // room for the callout above the grid
  const PAD_BOT = 22;   // room for the hour ticks below it

  const GRID_W = COLS * STEP - GAP;
  const GRID_H = ROWS * STEP - GAP;
  const VIEW_H = PAD_TOP + GRID_H + PAD_BOT;

  /* The one hour that is yours: Wednesday, 10:00. */
  const SESSION_COL = 10;
  const SESSION_ROW = 2;

  const el = (name, attrs = {}) => {
    const n = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    return n;
  };

  const svg = el('svg', {
    class: 'week-grid',
    viewBox: `0 0 ${GRID_W} ${VIEW_H}`,
    role: 'img',
    'aria-labelledby': 'wk-title',
    preserveAspectRatio: 'xMidYMid meet',
  });

  /* One accessible description; the visual detail is decorative. */
  const title = el('title', { id: 'wk-title' });
  title.textContent =
    'A week shown as 168 cells, seven days by twenty-four hours. ' +
    'A single cell is highlighted: the one hour of the session. The remaining 167 are unlit.';
  svg.appendChild(title);

  /* --- soft glow behind the session cell --- */
  const defs   = el('defs');
  const grad   = el('radialGradient', { id: 'wkGlow' });
  grad.appendChild(el('stop', { offset: '0%',   'stop-color': '#6B9B94', 'stop-opacity': '.34' }));
  grad.appendChild(el('stop', { offset: '100%', 'stop-color': '#6B9B94', 'stop-opacity': '0' }));
  defs.appendChild(grad);
  svg.appendChild(defs);

  const sx = SESSION_COL * STEP;
  const sy = PAD_TOP + SESSION_ROW * STEP;

  const glow = el('circle', {
    class: 'wk-glow',
    cx: sx + CELL / 2,
    cy: sy + CELL / 2,
    r: CELL * 2.6,
    fill: 'url(#wkGlow)',
  });
  svg.appendChild(glow);

  /* --- the 168 cells --- */
  const cells = el('g');
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const isSession = col === SESSION_COL && row === SESSION_ROW;
      const g = el('g', { class: 'wk-cell' + (isSession ? ' is-session' : '') });
      /* Sweep left to right, so the week reads as time passing. */
      const delay = isSession ? 720 : (col * ROWS + row) * 3.4;
      g.style.transitionDelay = `${Math.round(delay)}ms`;
      g.appendChild(el('rect', {
        x: col * STEP,
        y: PAD_TOP + row * STEP,
        width: CELL,
        height: CELL,
        rx: 2.5,
      }));
      cells.appendChild(g);
    }
  }
  svg.appendChild(cells);

  /* --- callout: a leader line up from the session cell --- */
  const leadX = sx + CELL / 2;
  svg.appendChild(el('line', {
    class: 'wk-lead',
    x1: leadX, y1: 26,
    x2: leadX, y2: sy - 3,
  }));

  const call = el('text', { class: 'wk-call', x: sx - 2, y: 19 });
  [
    ['en', 'One session'],
    ['da', 'Én samtale'],
    ['de', 'Eine Sitzung'],
  ].forEach(([lang, label]) => {
    const t = el('tspan', { 'data-lang': lang, x: sx - 2, y: 19 });
    t.textContent = label;
    call.appendChild(t);
  });
  svg.appendChild(call);

  /* --- hour ticks: 00 / 06 / 12 / 18 (language-neutral) --- */
  const tickY = PAD_TOP + GRID_H + 15;
  [0, 6, 12, 18].forEach((h) => {
    const t = el('text', { class: 'wk-tick', x: h * STEP, y: tickY });
    t.textContent = String(h).padStart(2, '0');
    svg.appendChild(t);
  });

  host.appendChild(svg);
})();
