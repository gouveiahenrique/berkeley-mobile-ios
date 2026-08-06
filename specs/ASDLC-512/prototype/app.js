'use strict';

// ── Variant switcher ──────────────────────────────────────────────────────────
// The prototype exposes two views of the same Event Detail screen:
//   • "allday"  — the FIXED behaviour: All Day capsule badge in the time row
//   • "timed"   — the BUG state:   "12:00 AM" shown for an all-day event

function showVariant(variant) {
  var screens = document.querySelectorAll('.screen');
  var buttons = document.querySelectorAll('.scene-btn');

  screens.forEach(function(s) {
    s.classList.remove('active', 'exiting');
  });
  buttons.forEach(function(b) {
    b.classList.remove('active');
  });

  var target = document.getElementById('screen-' + variant);
  if (target) {
    // Small delay so CSS transition fires properly after removing 'active'
    requestAnimationFrame(function() {
      target.classList.add('active');
    });
  }

  var btn = document.getElementById('btn-' + variant);
  if (btn) btn.classList.add('active');
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  showVariant('allday');
});
