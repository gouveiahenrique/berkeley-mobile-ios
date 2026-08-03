'use strict';

// DOM refs
const btnAllDay  = document.getElementById('btn-allday');
const btnTimed   = document.getElementById('btn-timed');
const allDayCapsule  = document.getElementById('allday-capsule');
const timeTextWrong  = document.getElementById('time-text-wrong');
const timeTextTimed  = document.getElementById('time-text-timed');
const stateLabel     = document.getElementById('state-label');

/**
 * setMode — switches the prototype between the two event-type states.
 *
 * 'allday' → shows the All Day capsule (the expected fixed behaviour)
 * 'timed'  → shows a normal time range for comparison
 *
 * The "wrong" (buggy) state can be activated by passing 'wrong' —
 * not exposed in the UI but useful for QA / design review.
 */
function setMode(mode) {
  // Update toggle button styles
  btnAllDay.classList.toggle('active', mode === 'allday');
  btnTimed.classList.toggle('active',  mode === 'timed');

  // Drive time-row content
  switch (mode) {
    case 'allday':
      allDayCapsule.style.display  = 'inline-flex';
      timeTextWrong.style.display  = 'none';
      timeTextTimed.style.display  = 'none';
      updateStateLabel('new', 'Expected (Fixed)',
        'The time row displays an "All Day" capsule instead of 12:00 AM');
      break;

    case 'wrong':
      // Demonstrates the current buggy behaviour (12:00 AM for all-day)
      allDayCapsule.style.display  = 'none';
      timeTextWrong.style.display  = 'inline';
      timeTextTimed.style.display  = 'none';
      updateStateLabel('old', 'Current (Bug)',
        'All-day event incorrectly shows 12:00 AM — misleading and inaccurate');
      btnAllDay.classList.remove('active');
      btnTimed.classList.remove('active');
      break;

    case 'timed':
    default:
      allDayCapsule.style.display  = 'none';
      timeTextWrong.style.display  = 'none';
      timeTextTimed.style.display  = 'inline';
      updateStateLabel('new', 'Timed Event (no change)',
        'Regular timed events continue to display the start–end time as before');
      break;
  }
}

function updateStateLabel(badgeClass, badgeText, descText) {
  const badge = stateLabel.querySelector('.state-badge');
  const desc  = stateLabel.querySelector('.state-desc');
  badge.className = 'state-badge ' + badgeClass;
  badge.textContent = badgeText;
  desc.textContent  = descText;
}

// Initialise in All Day (fixed) state
setMode('allday');
