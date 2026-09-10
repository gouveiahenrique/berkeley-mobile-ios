'use strict';

// ── Mode toggle: "after" (fixed) vs "before" (bug) ──────────────────────────

function setMode(mode) {
  const badge  = document.getElementById('all-day-badge');
  const bugTxt = document.getElementById('time-bug');
  const btnAfter  = document.getElementById('btn-after');
  const btnBefore = document.getElementById('btn-before');

  if (mode === 'after') {
    badge.style.display  = '';
    bugTxt.style.display = 'none';
    btnAfter.classList.add('active');
    btnBefore.classList.remove('active');
    showToast('Showing fixed behavior — "All Day" badge', 'success');
  } else {
    badge.style.display  = 'none';
    bugTxt.style.display = '';
    btnBefore.classList.add('active');
    btnAfter.classList.remove('active');
    showToast('Showing current bug — misleading "12:00 AM"', 'error');
  }
}

// ── Toast ────────────────────────────────────────────────────────────────────

let toastTimer = null;

function showToast(msg, type) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  const colors = {
    success: 'rgba(40,120,60,0.94)',
    error:   'rgba(180,30,30,0.94)',
    info:    'rgba(30,30,30,0.92)',
  };

  toast.textContent = msg;
  toast.style.background = colors[type] || colors.info;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(80px)';
  }, 2600);
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  setMode('after');
});
