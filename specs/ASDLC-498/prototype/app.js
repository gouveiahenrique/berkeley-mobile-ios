'use strict';

const app = (() => {
  // ── State ──────────────────────────────────────────────────
  let isAllDay = false;

  // ── DOM refs ───────────────────────────────────────────────
  const timeBefore = document.getElementById('time-before');
  const timeAfter  = document.getElementById('time-after');

  // ── Toggle handler ─────────────────────────────────────────
  function setAllDay(value) {
    isAllDay = value;

    if (isAllDay) {
      // AFTER state: hide the misleading time text, show the All Day capsule
      timeBefore.style.display = 'none';
      timeAfter.style.display  = 'inline-flex';
    } else {
      // BEFORE state: show the misleading "12:00 AM" text
      timeBefore.style.display = 'inline';
      timeAfter.style.display  = 'none';
    }
  }

  // ── Navigation helpers (no-op for single-screen prototype) ──
  function pushScreen(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.remove('exiting');
    target.classList.add('active');
  }

  function popScreen(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add('exiting');
    setTimeout(() => target.classList.remove('active', 'exiting'), 310);
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    // Ensure the toggle starts un-checked (showing BEFORE state)
    const toggle = document.getElementById('allDayToggle');
    if (toggle) {
      toggle.checked = false;
    }
    setAllDay(false);
  }

  document.addEventListener('DOMContentLoaded', init);

  return { setAllDay, pushScreen, popScreen };
})();
