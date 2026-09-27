'use strict';

// Current event mode: 'allday' | 'timed'
let currentMode = 'allday';

/**
 * Switch the time row between "All Day" capsule badge and a time range string.
 * This mirrors the fix described in ASDLC-533:
 *   - When isAllDay == true  → show AllDay capsule (no time value)
 *   - When isAllDay == false → show start/end time text
 */
function setEventMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  const alldayEl = document.getElementById('time-allday');
  const timedEl  = document.getElementById('time-timed');
  const btnAllday = document.getElementById('btn-allday');
  const btnTimed  = document.getElementById('btn-timed');

  if (mode === 'allday') {
    // Show the All Day capsule badge
    alldayEl.style.display = 'flex';
    timedEl.style.display  = 'none';

    // Trigger re-animation of the badge
    const badge = alldayEl.querySelector('.all-day-badge');
    badge.style.animation = 'none';
    badge.offsetHeight; // force reflow
    badge.style.animation = '';

    btnAllday.classList.add('active');
    btnTimed.classList.remove('active');
  } else {
    // Show the time text
    alldayEl.style.display = 'none';
    timedEl.style.display  = 'flex';

    btnTimed.classList.add('active');
    btnAllday.classList.remove('active');
  }
}

// Tapping the nav back button has no navigation (single-screen prototype)
document.querySelector('.nav-back').addEventListener('click', () => {
  // Visual feedback only — this is a one-screen prototype
  const btn = document.querySelector('.nav-back');
  btn.style.opacity = '0.5';
  setTimeout(() => { btn.style.opacity = '1'; }, 150);
});

// Tapping action buttons shows a quick visual tap feedback
document.querySelectorAll('.bm-action-btn').forEach(btn => {
  btn.addEventListener('pointerdown', () => { btn.style.opacity = '0.75'; });
  btn.addEventListener('pointerup',   () => { btn.style.opacity = '1'; });
  btn.addEventListener('pointerout',  () => { btn.style.opacity = '1'; });
});
