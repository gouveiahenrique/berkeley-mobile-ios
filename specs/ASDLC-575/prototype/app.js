'use strict';

// ── State ────────────────────────────────────────────────────────────────────
let currentMode = 'allday';
let toastTimer  = null;

// ── Mode switching ────────────────────────────────────────────────────────────
// Toggles the Event Detail time row between:
//   allday → "All Day" capsule/pill badge (the fixed behavior)
//   timed  → "10:00 AM – 2:00 PM" text (unchanged behavior for reference)
function setMode(mode) {
  currentMode = mode;

  const btnAllday  = document.getElementById('btn-allday');
  const btnTimed   = document.getElementById('btn-timed');
  const timeRow    = document.getElementById('time-row');
  const timeEl     = document.getElementById('time-content');
  const hintEl     = document.getElementById('mode-hint');

  btnAllday.classList.toggle('active', mode === 'allday');
  btnAllday.setAttribute('aria-selected', String(mode === 'allday'));
  btnTimed.classList.toggle('active',  mode === 'timed');
  btnTimed.setAttribute('aria-selected', String(mode === 'timed'));

  if (mode === 'allday') {
    // Fixed behavior: replace time text with "All Day" capsule
    timeEl.innerHTML = '<span class="allday-badge">All Day</span>';
    hintEl.textContent = 'Fixed: "All Day" pill replaces time (isAllDay = true)';
  } else {
    // Timed event: show normal time string
    timeEl.textContent = '10:00 AM – 2:00 PM';
    hintEl.textContent = 'Reference: standard time display (isAllDay = false)';
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  if (toastTimer) {
    clearTimeout(toastTimer);
    toast.classList.remove('visible');
    // Brief pause so the re-entry animation fires
    requestAnimationFrame(() => {
      requestAnimationFrame(() => _displayToast(toast, message));
    });
  } else {
    _displayToast(toast, message);
  }
}

function _displayToast(toast, message) {
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
    toastTimer = null;
  }, 3000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setMode('allday');
});
