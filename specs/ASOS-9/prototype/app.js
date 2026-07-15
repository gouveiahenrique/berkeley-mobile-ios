/* ============================================================
   Berkeley Mobile iOS — ASOS-9 Event Detail All-Day Prototype
   Navigation engine + interactive toggle
   ============================================================ */

'use strict';

/* ── State ─────────────────────────────────────────────────── */
let currentState = 'bug'; // 'bug' | 'fix'

/* ── Toggle between buggy and fixed states (interactive phone) */
function toggleState(state) {
  if (currentState === state) return;
  currentState = state;

  const bugDisplay  = document.getElementById('time-display-bug');
  const fixDisplay  = document.getElementById('time-display-fix');
  const btnBug      = document.getElementById('toggle-bug');
  const btnFix      = document.getElementById('toggle-fix');

  if (state === 'fix') {
    // Show the All Day capsule, hide the plain time
    bugDisplay.style.display = 'none';
    fixDisplay.style.display = 'inline-flex';
    btnFix.classList.add('active');
    btnBug.classList.remove('active');

    // Animate the capsule in
    fixDisplay.style.opacity = '0';
    fixDisplay.style.transform = 'scale(0.85)';
    fixDisplay.style.transition = 'opacity 220ms ease, transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fixDisplay.style.opacity = '1';
        fixDisplay.style.transform = 'scale(1)';
      });
    });
  } else {
    // Show the plain time, hide the capsule
    fixDisplay.style.display = 'none';
    bugDisplay.style.display = 'inline';
    btnBug.classList.add('active');
    btnFix.classList.remove('active');
  }
}

/* ── Generic nav utilities (not used in this 1-screen issue,
      but kept per workflow so the engine is available) ────── */

let navStack = [];

function pushScreen(fromId, toId) {
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);
  if (!to) return;

  to.style.transform = 'translateX(100%)';
  to.style.opacity = '0';
  to.classList.add('active');

  requestAnimationFrame(() => {
    to.style.transition = 'transform 300ms ease, opacity 300ms ease';
    to.style.transform = 'translateX(0)';
    to.style.opacity = '1';
  });

  if (from) {
    from.style.transition = 'transform 300ms ease, opacity 300ms ease';
    from.style.transform = 'translateX(-30%)';
    from.style.opacity = '0.6';
    setTimeout(() => {
      from.classList.remove('active');
      from.style.transform = '';
      from.style.opacity = '';
      from.style.transition = '';
    }, 300);
  }

  navStack.push(toId);
}

function popScreen() {
  if (navStack.length < 2) return;
  const current = navStack.pop();
  const prev    = navStack[navStack.length - 1];

  const currentEl = document.getElementById(current);
  const prevEl    = document.getElementById(prev);

  if (currentEl) {
    currentEl.style.transition = 'transform 300ms ease, opacity 300ms ease';
    currentEl.style.transform = 'translateX(100%)';
    currentEl.style.opacity = '0';
    setTimeout(() => {
      currentEl.classList.remove('active');
      currentEl.style.transform = '';
      currentEl.style.opacity = '';
      currentEl.style.transition = '';
    }, 300);
  }

  if (prevEl) {
    prevEl.classList.add('active');
    prevEl.style.transform = 'translateX(-30%)';
    prevEl.style.opacity = '0.6';
    requestAnimationFrame(() => {
      prevEl.style.transition = 'transform 300ms ease, opacity 300ms ease';
      prevEl.style.transform = 'translateX(0)';
      prevEl.style.opacity = '1';
    });
    setTimeout(() => {
      prevEl.style.transition = '';
    }, 310);
  }
}

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // The interactive phone starts in 'bug' state — capsule hidden
  const fixDisplay = document.getElementById('time-display-fix');
  if (fixDisplay) fixDisplay.style.display = 'none';
});
