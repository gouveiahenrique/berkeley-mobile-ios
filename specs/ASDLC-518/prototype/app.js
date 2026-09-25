/* =================================================================
   ASDLC-518 — Event Detail: All Day Indicator
   app.js — state management for before/after comparison
   ================================================================= */

'use strict';

let currentState = 'fixed';

/**
 * Toggle the time row between the fixed ("All Day" capsule) and
 * the current-bug ("12:00 AM" text) states.
 *
 * In the real app this is controlled by BMEventCalendarEntry.isAllDay:
 *   - isAllDay == true  → show All Day capsule  (the fix)
 *   - isAllDay == true  → show "12:00 AM"        (the bug, current behavior)
 */
function setState(newState) {
  if (newState === currentState) return;
  currentState = newState;

  const btnFixed  = document.getElementById('btn-fixed');
  const btnBuggy  = document.getElementById('btn-buggy');
  const badgeFixed = document.getElementById('badge-fixed');
  const badgeBuggy = document.getElementById('badge-buggy');

  if (newState === 'fixed') {
    btnFixed.classList.add('active');
    btnFixed.setAttribute('aria-selected', 'true');
    btnBuggy.classList.remove('active');
    btnBuggy.setAttribute('aria-selected', 'false');

    badgeFixed.style.display = 'inline-flex';
    badgeBuggy.style.display = 'none';
  } else {
    btnBuggy.classList.add('active');
    btnBuggy.setAttribute('aria-selected', 'true');
    btnFixed.classList.remove('active');
    btnFixed.setAttribute('aria-selected', 'false');

    badgeFixed.style.display = 'none';
    badgeBuggy.style.display = 'inline';
  }
}

/* Navigation helpers — single-screen prototype, all no-ops except state toggle */
function pushScreen(id)   { /* unused in this single-screen prototype */ }
function popScreen()      { /* unused in this single-screen prototype */ }

/* Initialize to fixed state on load */
document.addEventListener('DOMContentLoaded', () => {
  setState('fixed');
});
