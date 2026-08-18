'use strict';

// ----------------------------------------------------------------
// Prototype state
// ----------------------------------------------------------------
let isFixed = false;  // false = bug state, true = fixed state

// ----------------------------------------------------------------
// Toggle between before (bug) and after (fixed) states
// ----------------------------------------------------------------
function toggleState() {
  isFixed = !isFixed;

  const toggleBtn  = document.getElementById('toggle-btn');
  const toggleKnob = document.getElementById('toggle-knob');
  const lblBefore  = document.getElementById('lbl-before');
  const lblAfter   = document.getElementById('lbl-after');
  const timeBug    = document.getElementById('time-bug');
  const timeFix    = document.getElementById('time-fix');

  if (isFixed) {
    // --- Fixed state: show "All Day" capsule badge ---
    toggleBtn.classList.add('on');
    lblBefore.classList.remove('active');
    lblAfter.classList.add('active');

    // Hide the bug text, show the capsule badge with animation
    timeBug.classList.add('hidden');
    timeFix.classList.remove('hidden');
    timeFix.classList.remove('entering');
    // Force reflow so animation re-triggers
    void timeFix.offsetWidth;
    timeFix.classList.add('entering');
  } else {
    // --- Bug state: show "12:00 AM" plain text ---
    toggleBtn.classList.remove('on');
    lblBefore.classList.add('active');
    lblAfter.classList.remove('active');

    timeFix.classList.add('hidden');
    timeFix.classList.remove('entering');
    timeBug.classList.remove('hidden');
  }
}

// ----------------------------------------------------------------
// Calendar button tap — prototype interaction
// ----------------------------------------------------------------
function handleCalendarTap() {
  showToast('Add to Calendar — tap to add "Cal Day 2026"', 2800);
}

// ----------------------------------------------------------------
// Action button handlers
// ----------------------------------------------------------------
function handleLearnMore() {
  showToast('Opening event page in Safari…', 2200);
}

function handleRegister() {
  showToast('Opening registration page in Safari…', 2200);
}

// ----------------------------------------------------------------
// Toast helper
// ----------------------------------------------------------------
function showToast(message, duration) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('visible');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, duration || 2500);
}

// ----------------------------------------------------------------
// Init — start in "bug" state (Before)
// ----------------------------------------------------------------
(function init() {
  const lblBefore = document.getElementById('lbl-before');
  if (lblBefore) lblBefore.classList.add('active');
})();
