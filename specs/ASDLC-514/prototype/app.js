/* ══════════════════════════════════════════════════════════════
   ASDLC-514 Prototype — Navigation Engine
   Replicates NavigationStack push/pop behaviour from the app
   ══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Navigation stack ── */
let navStack = [];

/**
 * Push a new screen onto the stack (slide in from right).
 * Mirrors NavigationStack's navigationDestination push.
 */
function pushScreen(id) {
  const next = document.getElementById(id);
  if (!next || next.classList.contains('active')) return;

  /* Push current active screen to "behind" state */
  const current = getActiveScreen();
  if (current) {
    current.classList.remove('active');
    current.classList.add('behind');
    navStack.push(current.id);
  }

  /* Bring in the new screen */
  next.style.transition = 'none';
  next.style.transform = 'translateX(100%)';
  next.style.opacity = '0';
  next.classList.remove('exiting', 'behind');

  /* Force reflow so the initial transform is applied */
  next.getBoundingClientRect();

  next.style.transition = '';
  next.style.transform = '';
  next.style.opacity = '';
  next.classList.add('active');

  next.style.pointerEvents = 'none';
  setTimeout(() => { next.style.pointerEvents = ''; }, 320);
}

/**
 * Pop the current screen off the stack (slide out to right).
 * Mirrors NavigationStack back navigation.
 */
function popScreen() {
  const current = getActiveScreen();
  if (!current || navStack.length === 0) return;

  const prevId = navStack.pop();
  const prev = document.getElementById(prevId);

  /* Slide current screen out */
  current.classList.remove('active');
  current.classList.add('exiting');

  /* Restore previous screen */
  if (prev) {
    prev.classList.remove('behind');
    prev.classList.add('active');
  }

  /* Cleanup exiting state after transition */
  setTimeout(() => {
    current.classList.remove('exiting');
    current.style.transform = '';
    current.style.opacity = '';
  }, 320);
}

/** Returns the currently .active screen element, or null. */
function getActiveScreen() {
  return document.querySelector('.screen.active');
}

/* ── Swipe-to-go-back gesture (right-edge swipe) ── */
(function initSwipeBack() {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  const screenArea = document.querySelector('.screen-area');
  if (!screenArea) return;

  screenArea.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    tracking = startX < 40; /* only from left edge */
  }, { passive: true });

  screenArea.addEventListener('touchend', (e) => {
    if (!tracking) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = Math.abs(touch.clientY - startY);
    if (dx > 60 && dy < 80 && navStack.length > 0) {
      popScreen();
    }
    tracking = false;
  }, { passive: true });
})();
