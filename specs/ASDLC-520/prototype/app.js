// =============================================================
//  Berkeley Mobile – ASDLC-520 Prototype
//  Navigation engine + All-Day indicator demo toggle
// =============================================================

let navStack = [];
let currentMode = 'expected'; // 'expected' | 'current'

// ---- Screen navigation ----------------------------------------

function pushScreen(id) {
  const current = navStack.length > 0
    ? document.getElementById(navStack[navStack.length - 1])
    : document.querySelector('.screen.active');

  const next = document.getElementById(id);
  if (!next || next === current) return;

  // Start next off-screen to the right
  next.style.transition = 'none';
  next.style.transform = 'translateX(100%)';
  next.style.opacity = '0';
  next.style.pointerEvents = 'none';

  // Activate after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      next.style.transition = 'transform 300ms ease, opacity 300ms ease';
      next.style.transform = 'translateX(0)';
      next.style.opacity = '1';
      next.style.pointerEvents = 'all';
    });
  });

  if (current) {
    current.style.transition = 'transform 300ms ease, opacity 300ms ease';
    current.style.transform = 'translateX(-40%)';
    current.style.opacity = '0';
    current.style.pointerEvents = 'none';
    navStack.push(current.id);
  }
}

function popScreen() {
  if (navStack.length === 0) return;

  const prevId = navStack.pop();
  const prev = document.getElementById(prevId);
  const curr = document.querySelector('.screen[style*="translateX(0)"]') ||
               Array.from(document.querySelectorAll('.screen'))
                 .find(s => s.style.transform === 'translateX(0px)' || s.style.opacity === '1');

  // Restore previous screen
  if (prev) {
    prev.style.transition = 'transform 300ms ease, opacity 300ms ease';
    prev.style.transform = 'translateX(0)';
    prev.style.opacity = '1';
    prev.style.pointerEvents = 'all';
  }

  // Slide current off to the right
  if (curr && curr !== prev) {
    curr.style.transition = 'transform 300ms ease, opacity 300ms ease';
    curr.style.transform = 'translateX(100%)';
    curr.style.opacity = '0';
    curr.style.pointerEvents = 'none';
  }
}

// ---- All-Day indicator demo mode --------------------------------

function setMode(mode) {
  currentMode = mode;

  // Update segment buttons
  document.querySelectorAll('.demo-seg-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Toggle time-row content
  const capsuleEl = document.getElementById('time-allday-capsule');
  const bugEl     = document.getElementById('time-bug-text');
  const annotEl   = document.getElementById('demo-annotation');

  if (mode === 'expected') {
    if (capsuleEl) capsuleEl.style.display = 'inline-flex';
    if (bugEl)     bugEl.style.display     = 'none';
    if (annotEl) {
      annotEl.querySelector('.annotation-dot').className = 'annotation-dot fix';
      annotEl.querySelector('.annotation-text').textContent =
        'Expected behavior: "All Day" capsule replaces the misleading "12:00 AM" time value when isAllDay is true.';
    }
  } else {
    if (capsuleEl) capsuleEl.style.display = 'none';
    if (bugEl)     bugEl.style.display     = 'block';
    if (annotEl) {
      annotEl.querySelector('.annotation-dot').className = 'annotation-dot bug';
      annotEl.querySelector('.annotation-text').textContent =
        'Current behavior (bug): "12:00 AM" is shown even when the event is marked as All Day — misleading and inaccurate.';
    }
  }
}

// ---- Init -------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Mark first screen as active via JS (so CSS transition base is set)
  const first = document.getElementById('screen-events-list');
  if (first) {
    first.style.transform = 'translateX(0)';
    first.style.opacity   = '1';
    first.style.pointerEvents = 'all';
  }

  // Default to 'expected' mode
  setMode('expected');
});
