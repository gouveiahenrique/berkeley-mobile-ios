'use strict';

// ── State ──────────────────────────────────────────────────
let currentMode = 'fixed'; // 'fixed' | 'buggy'

// ── Mode toggle: switch between fixed (All Day badge) and buggy (12:00 AM) ──
function setMode(mode) {
  currentMode = mode;

  const badge   = document.getElementById('allday-badge');
  const bugTime = document.getElementById('bug-time');
  const btnFixed = document.getElementById('btn-fixed');
  const btnBuggy = document.getElementById('btn-buggy');

  if (mode === 'fixed') {
    badge.style.display   = 'inline-flex';
    bugTime.style.display = 'none';
    btnFixed.classList.add('active');
    btnBuggy.classList.remove('active');
  } else {
    badge.style.display   = 'none';
    bugTime.style.display = 'inline';
    btnBuggy.classList.add('active');
    btnFixed.classList.remove('active');
  }
}

// ── Navigation helpers (push/pop pattern, kept minimal for single screen) ──
function pushScreen(id) {
  const target = document.getElementById(id);
  if (!target) return;
  document.querySelectorAll('.screen.active').forEach(s => {
    s.classList.remove('active');
    s.classList.add('exiting');
    setTimeout(() => s.classList.remove('exiting'), 320);
  });
  target.classList.add('active');
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setMode('fixed'); // start with the fixed state visible
});
