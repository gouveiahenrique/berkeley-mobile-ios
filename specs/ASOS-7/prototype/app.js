'use strict';

// ── Navigation state ────────────────────────────────────────
let currentScreen = 'screen-event-detail';

function showScreen(id) {
  const all = document.querySelectorAll('.screen');
  all.forEach(s => {
    s.classList.remove('active', 'exiting');
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    currentScreen = id;
  }
}

// ── All Day toggle ───────────────────────────────────────────
function initToggle() {
  const toggle = document.getElementById('allday-toggle');
  if (!toggle) return;

  const timeRow = document.getElementById('time-row');
  const allDayRow = document.getElementById('allday-row');

  function update() {
    if (toggle.checked) {
      // All Day is ON → show capsule, hide time text
      timeRow.style.display = 'none';
      allDayRow.style.display = 'flex';
    } else {
      // All Day is OFF → show time text, hide capsule
      timeRow.style.display = 'flex';
      allDayRow.style.display = 'none';
    }
  }

  toggle.addEventListener('change', update);
  update(); // initialise on load
}

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showScreen('screen-event-detail');
  initToggle();
});
