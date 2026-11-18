/* ─────────────────────────────────────────────────
   ASDLC-572 Prototype — Navigation Engine
   Switches between All Day and Timed event screens
───────────────────────────────────────────────── */

'use strict';

/**
 * Switch the active screen panel and update the demo toggle.
 * @param {string} screenId - ID of the screen div to show
 * @param {HTMLElement} [triggerBtn] - The demo button that was clicked
 */
function showScreen(screenId, triggerBtn) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(function (s) {
    s.classList.remove('active');
  });

  // Show the target screen
  var target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }

  // Update demo toggle buttons
  document.querySelectorAll('.demo-btn').forEach(function (b) {
    b.classList.remove('active');
  });
  if (triggerBtn) {
    triggerBtn.classList.add('active');
  }
}

// Convenience wrappers for the onclick handlers
function showAllDay() {
  showScreen('screen-allday', document.getElementById('btn-allday'));
}

function showTimed() {
  showScreen('screen-timed', document.getElementById('btn-timed'));
}

// Ensure the first screen is visible on load
document.addEventListener('DOMContentLoaded', function () {
  var first = document.querySelector('.screen');
  if (first && !document.querySelector('.screen.active')) {
    first.classList.add('active');
  }
});
