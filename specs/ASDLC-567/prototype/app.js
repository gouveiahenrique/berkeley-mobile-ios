'use strict';

/**
 * ASDLC-567 — All Day Event Detail Prototype
 *
 * Navigation engine: single screen, no push/pop needed.
 * Primary interaction: before/after state toggle (outside iPhone frame)
 * to show Current Bug vs Expected Fix for the All Day indicator.
 */

const iphone    = document.getElementById('iphone');
const btnBug    = document.getElementById('btn-bug');
const btnFix    = document.getElementById('btn-fix');
const badge     = document.getElementById('state-badge');

/**
 * Switch prototype between "bug" (shows 12:00 AM) and "fix" (shows All Day capsule).
 * CSS on .iphone-frame[data-state] hides/shows .time-row-bug / .time-row-fix.
 */
function setState(state) {
  iphone.setAttribute('data-state', state);

  if (state === 'fix') {
    btnFix.classList.add('active');
    btnBug.classList.remove('active');
    badge.className = 'proto-state-badge fix';
    badge.textContent = 'All Day capsule shown';
  } else {
    btnBug.classList.add('active');
    btnFix.classList.remove('active');
    badge.className = 'proto-state-badge bug';
    badge.textContent = '12:00 AM shown — bug state';
  }
}

// Action buttons — show a simple in-screen toast for demo
document.querySelectorAll('.bm-action-button').forEach(btn => {
  btn.addEventListener('click', () => {
    showToast(btn.textContent.trim() === 'Register'
      ? 'Opening registration page in Safari…'
      : 'Opening event page in Safari…');
  });
});

// Nav back — no-op in single-screen prototype
document.querySelector('.nav-back')?.addEventListener('click', () => {
  showToast('Back to Events list');
});

// Calendar badge button
document.querySelector('.nav-action')?.addEventListener('click', () => {
  showToast('Add to Calendar? — would show alert');
});

/**
 * Simple toast notification (slides down from nav bar, auto-dismisses).
 */
let toastTimer = null;

function showToast(msg) {
  let existing = document.querySelector('.proto-toast');
  if (existing) existing.remove();
  if (toastTimer) clearTimeout(toastTimer);

  const toast = document.createElement('div');
  toast.className = 'proto-toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position:     'absolute',
    top:          '108px',
    left:         '16px',
    right:        '16px',
    background:   'rgba(30,30,30,0.88)',
    backdropFilter: 'blur(12px)',
    color:        '#fff',
    fontSize:     '13px',
    fontFamily:   'var(--font-family, system-ui)',
    fontWeight:   '500',
    padding:      '10px 14px',
    borderRadius: '12px',
    zIndex:       '200',
    transform:    'translateY(-20px)',
    opacity:      '0',
    transition:   'transform 0.25s ease, opacity 0.25s ease',
    textAlign:    'center',
    pointerEvents: 'none',
  });

  document.querySelector('.screen-area').appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity   = '1';
    });
  });

  toastTimer = setTimeout(() => {
    toast.style.transform = 'translateY(-20px)';
    toast.style.opacity   = '0';
    setTimeout(() => toast.remove(), 260);
  }, 2800);
}

// Initialise to "fix" state (the expected behavior)
setState('fix');
