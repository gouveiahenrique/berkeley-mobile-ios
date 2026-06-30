'use strict';

// ── Demo state ────────────────────────────────────────────────────────────────
// The prototype shows ONE Event Detail screen in two modes:
//   "timed"  — current (buggy) behavior: shows "12:00 AM" even for All Day
//   "allday" — expected behavior: shows "All Day" capsule

let currentMode = 'timed';

/**
 * Switch between "timed" and "allday" demo modes.
 * Updates body class, button styles, and the label below the frame.
 */
function switchDemo(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  const body = document.body;
  const btnTimed  = document.getElementById('btn-timed');
  const btnAllday = document.getElementById('btn-allday');
  const frameLabel = document.getElementById('frame-label');
  const timeTimed  = document.getElementById('time-timed');

  if (mode === 'allday') {
    // Expected (fixed) behavior: All Day capsule
    body.classList.add('mode-allday');
    btnAllday.classList.add('active');
    btnTimed.classList.remove('active');
    frameLabel.textContent = 'Expected Behavior — "All Day" capsule replaces time value';
  } else {
    // Current (buggy) behavior: raw time string shown
    body.classList.remove('mode-allday');
    btnTimed.classList.add('active');
    btnAllday.classList.remove('active');
    frameLabel.textContent = 'Current Behavior — 12:00 AM shown for All Day event';

    // In current behavior, show the misleading 12:00 AM value
    timeTimed.textContent = '12:00 AM';
  }
}

// ── Initialise ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Start in "timed" (current / buggy) mode
  // The time-timed span already shows "12:00 AM" to replicate the bug
  const timeTimed = document.getElementById('time-timed');
  timeTimed.textContent = '12:00 AM';

  // Nav bar back button — no-op in prototype (single-screen scope)
  const backBtn = document.querySelector('.nav-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Simulate subtle tap feedback
      backBtn.style.opacity = '0.5';
      setTimeout(() => { backBtn.style.opacity = ''; }, 150);
    });
  }

  // Calendar toolbar button — no-op, shows visual tap feedback
  const calBtn = document.querySelector('.nav-action');
  if (calBtn) {
    calBtn.addEventListener('click', () => {
      calBtn.style.opacity = '0.5';
      setTimeout(() => { calBtn.style.opacity = ''; }, 150);
    });
  }

  // Action buttons — subtle press animation (no navigation in scope)
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('pointerdown', () => {
      btn.style.transform = 'scale(0.97)';
      btn.style.opacity = '0.88';
    });
    btn.addEventListener('pointerup', () => {
      btn.style.transform = '';
      btn.style.opacity = '';
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
      btn.style.opacity = '';
    });
  });
});
