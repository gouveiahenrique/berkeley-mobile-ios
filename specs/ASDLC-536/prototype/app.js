/* ============================================================
   ASDLC-536 — All Day Event Detail Prototype
   Navigation engine + interaction logic
   ============================================================ */

'use strict';

// ── Navigation state ──────────────────────────────────────────

let navStack = [];

function getScreen(id) {
  return document.getElementById(id);
}

function pushScreen(id) {
  const incoming = getScreen(id);
  if (!incoming) return;

  const active = document.querySelector('.screen.active');
  if (active) {
    active.classList.remove('active');
    active.classList.add('exiting');
    setTimeout(() => active.classList.remove('exiting'), 300);
    navStack.push(active.id);
  }

  incoming.classList.add('active');
}

function popScreen() {
  if (navStack.length === 0) return;
  const current = document.querySelector('.screen.active');
  const prevId  = navStack.pop();
  const prev    = getScreen(prevId);

  if (current) {
    current.classList.add('exiting');
    setTimeout(() => {
      current.classList.remove('active', 'exiting');
    }, 300);
  }

  if (prev) prev.classList.add('active');
}

// ── All Day Toggle ────────────────────────────────────────────

let isAllDay = true;   // start in All Day state to highlight the fix

function toggleAllDay() {
  isAllDay = !isAllDay;

  const toggle     = document.getElementById('allday-toggle');
  const screen     = document.getElementById('screen-event-detail');
  const valueLabel = document.getElementById('toggle-value-label');

  if (isAllDay) {
    toggle.classList.add('on');
    screen.classList.add('allday-mode');
    valueLabel.textContent = 'All Day Event';
  } else {
    toggle.classList.remove('on');
    screen.classList.remove('allday-mode');
    valueLabel.textContent = 'Timed Event';
  }
}

// ── Initialise on DOM ready ───────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

  // Start in "All Day" mode to immediately show the fix
  const toggle = document.getElementById('allday-toggle');
  const screen = document.getElementById('screen-event-detail');

  if (toggle) toggle.classList.add('on');
  if (screen) screen.classList.add('allday-mode');

  // Action button tap feedback
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const orig = btn.textContent;
      btn.textContent = orig === 'Learn More' ? 'Opening Safari…' : 'Opening Registration…';
      btn.style.opacity = '0.6';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.opacity = '';
      }, 1200);
    });
  });

  // Nav-back tap (no-op for single-screen prototype — just visual)
  const navBack = document.querySelector('.nav-back');
  if (navBack) {
    navBack.addEventListener('click', function () {
      navBack.style.opacity = '0.4';
      setTimeout(() => { navBack.style.opacity = ''; }, 300);
    });
  }
});
