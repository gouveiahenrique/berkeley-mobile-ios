'use strict';

// ── Navigation stack ────────────────────────────────────────────────
const navStack = [];
let transitioning = false;

function getScreen(id) {
  return document.getElementById(id);
}

function pushScreen(id) {
  if (transitioning) return;
  const current = navStack[navStack.length - 1] || document.querySelector('.screen.active');
  const next = getScreen(id);
  if (!next || next === current) return;

  transitioning = true;
  navStack.push(next);

  // Prepare next screen off-screen right (already set by CSS)
  next.classList.add('active');

  // Force reflow then transition
  next.getBoundingClientRect();

  requestAnimationFrame(() => {
    if (current) current.style.transform = 'translateX(-30%)';
    next.style.transform = 'translateX(0)';
    next.style.opacity = '1';

    setTimeout(() => {
      if (current) {
        current.classList.remove('active');
        current.style.transform = '';
      }
      transitioning = false;
    }, 300);
  });
}

function popScreen() {
  if (transitioning || navStack.length === 0) return;
  const outgoing = navStack.pop();
  const incoming = navStack[navStack.length - 1] || document.getElementById('screen-events');

  transitioning = true;

  incoming.style.transform = 'translateX(-30%)';
  incoming.classList.add('active');

  requestAnimationFrame(() => {
    incoming.style.transition = 'none';
    incoming.getBoundingClientRect();
    incoming.style.transition = '';

    outgoing.style.transform = 'translateX(100%)';
    outgoing.style.opacity = '0';
    incoming.style.transform = 'translateX(0)';
    incoming.style.opacity = '1';

    setTimeout(() => {
      outgoing.classList.remove('active');
      outgoing.style.transform = '';
      outgoing.style.opacity = '';
      incoming.style.transform = '';
      incoming.style.opacity = '';
      transitioning = false;
    }, 300);
  });
}

// ── Demo mode toggle ─────────────────────────────────────────────────
// Switches between all-day and timed event detail directly
function showDemo(mode) {
  document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
  event.currentTarget.classList.add('active');

  // Reset nav stack
  navStack.length = 0;

  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.transform = '';
    s.style.opacity = '';
  });

  const targetId = mode === 'allday' ? 'screen-detail-allday' : 'screen-detail-timed';
  const target = getScreen(targetId);
  if (target) {
    target.classList.add('active');
    navStack.push(target);
  }
}

// ── Toast ─────────────────────────────────────────────────────────────
let toastTimer = null;

function showToast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
}

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Start on all-day detail to highlight the feature
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.transform = '';
    s.style.opacity = '';
  });
  const initial = getScreen('screen-detail-allday');
  if (initial) {
    initial.classList.add('active');
    navStack.push(initial);
  }
});
