'use strict';

// ── Navigation stack (single screen for this issue) ──────────────────────────
let navStack = [];
let activeTab = 0;

function pushScreen(id) {
  const next = document.getElementById(id);
  if (!next) return;
  const current = document.querySelector('.screen.active');
  if (current) {
    current.classList.remove('active');
    current.classList.add('exiting');
    setTimeout(() => current.classList.remove('exiting'), 300);
  }
  next.classList.add('active');
  navStack.push(id);
}

function popScreen() {
  if (navStack.length === 0) return;
  const currentId = navStack.pop();
  const current = document.getElementById(currentId);
  if (current) {
    current.classList.remove('active');
    current.classList.add('exiting');
    setTimeout(() => current.classList.remove('exiting'), 300);
  }
  const prevId = navStack[navStack.length - 1];
  if (prevId) {
    const prev = document.getElementById(prevId);
    if (prev) prev.classList.add('active');
  }
}

// ── Comparison toggle: Fix vs Bug ─────────────────────────────────────────────
function setMode(mode) {
  const fixEl  = document.getElementById('time-fix');
  const bugEl  = document.getElementById('time-bug');
  const btnFix = document.getElementById('toggle-fix');
  const btnBug = document.getElementById('toggle-bug');

  if (mode === 'fix') {
    fixEl.style.display = '';
    bugEl.style.display = 'none';
    btnFix.classList.add('active');
    btnBug.classList.remove('active');
  } else {
    fixEl.style.display = 'none';
    bugEl.style.display = '';
    btnFix.classList.remove('active');
    btnBug.classList.add('active');
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer = null;

function showToast(message, type) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  if (toastTimer) clearTimeout(toastTimer);

  const colors = {
    success: '#34C759',
    error:   '#FF3B30',
    info:    '#1C1C1E',
  };
  toast.style.background = colors[type] || colors.info;
  toast.textContent = message;
  toast.style.top = '60px';

  toastTimer = setTimeout(() => {
    toast.style.top = '-60px';
    toastTimer = null;
  }, 3000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Ensure the main screen is active
  const main = document.getElementById('screen-event-detail');
  if (main && !main.classList.contains('active')) {
    main.classList.add('active');
  }
  navStack.push('screen-event-detail');
});
