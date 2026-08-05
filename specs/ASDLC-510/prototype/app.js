'use strict';

// ── Navigation stack ──────────────────────────────────────
let navStack = [];

function getEl(id) {
  return document.getElementById(id);
}

function pushScreen(id) {
  const target = getEl(id);
  if (!target) return;

  const current = navStack[navStack.length - 1];
  if (current && current.id === id) return;

  if (current) {
    current.classList.remove('active');
  }

  target.style.transition = 'none';
  target.style.transform = 'translateX(100%)';
  target.style.opacity = '1';
  target.classList.add('active');

  // Force reflow
  target.getBoundingClientRect();

  target.style.transition = 'transform 300ms ease, opacity 300ms ease';
  target.style.transform = 'translateX(0)';

  navStack.push(target);
}

function popScreen() {
  if (navStack.length <= 1) return;

  const current = navStack.pop();
  const previous = navStack[navStack.length - 1];

  current.style.transition = 'transform 300ms ease, opacity 300ms ease';
  current.style.transform = 'translateX(100%)';
  current.style.opacity = '0';

  setTimeout(() => {
    current.classList.remove('active');
    current.style.transform = '';
    current.style.opacity = '';
    current.style.transition = '';
  }, 310);

  if (previous) {
    previous.classList.add('active');
  }
}

// ── Before/After comparison toggle ───────────────────────

function showAfter() {
  getEl('time-after').style.display = 'inline-flex';
  getEl('time-before').style.display = 'none';

  getEl('btn-after').classList.add('active-btn');
  getEl('btn-before').classList.remove('active-btn');

  const label = getEl('state-label');
  label.style.background = 'rgba(86,112,185,0.12)';
  label.style.borderLeftColor = '#5670B9';
  label.querySelector('div:first-child').style.color = '#5670B9';
  label.querySelector('div:first-child').textContent = 'Expected Behavior (After Fix)';
  label.querySelector('div:last-child').innerHTML =
    'The time row shows an "All Day" capsule/pill because <code style="background:rgba(120,120,128,0.2);border-radius:4px;padding:0 3px;font-size:10px;">isAllDay == true</code>. No misleading time is displayed.';
}

function showBefore() {
  getEl('time-after').style.display = 'none';
  getEl('time-before').style.display = 'inline';

  getEl('btn-before').classList.add('active-btn');
  getEl('btn-after').classList.remove('active-btn');
  getEl('btn-before').style.background = '#FF3B30';
  getEl('btn-before').style.borderColor = '#FF3B30';
  getEl('btn-before').style.color = '#fff';

  const label = getEl('state-label');
  label.style.background = 'rgba(255,59,48,0.1)';
  label.style.borderLeftColor = '#FF3B30';
  label.querySelector('div:first-child').style.color = '#FF3B30';
  label.querySelector('div:first-child').textContent = 'Bug (Current Behavior)';
  label.querySelector('div:last-child').innerHTML =
    'The time row incorrectly shows "12:00 AM" even though <code style="background:rgba(120,120,128,0.2);border-radius:4px;padding:0 3px;font-size:10px;">isAllDay == true</code>. This is misleading — all-day events have no start time.';
}

// Reset before-button style when switching back to "after"
document.getElementById('btn-after').addEventListener('click', function() {
  const btnBefore = getEl('btn-before');
  btnBefore.style.background = '';
  btnBefore.style.borderColor = '';
  btnBefore.style.color = '';
});

// ── Boot ──────────────────────────────────────────────────
(function init() {
  const firstScreen = document.getElementById('screen-events-list');
  if (firstScreen) {
    firstScreen.style.transform = 'translateX(0)';
    firstScreen.style.opacity = '1';
    navStack.push(firstScreen);
  }
})();
