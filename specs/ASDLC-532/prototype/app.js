/* ═══════════════════════════════════════════════════════════════
   Berkeley Mobile — Event Detail Prototype
   ASDLC-532: All Day Indicator in Event Detail time row
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ─── Navigation engine (minimal — single screen prototype) ───

let currentMode = 'regular';

/**
 * Switch between regular event (shows time text) and all-day event
 * (shows "All Day" capsule badge) in the time row.
 *
 * Issue context: BMDetailHeaderView.timeView currently renders
 * EventDetailRow(systemImageName: "clock", text: timePart) even
 * when timePart == "All Day". The fix replaces the text with a
 * capsule badge when the event is all-day.
 */
function setEventMode(mode) {
  currentMode = mode;

  const timeText  = document.getElementById('time-text');
  const alldayBadge = document.getElementById('allday-badge');
  const btnRegular  = document.getElementById('btn-regular');
  const btnAllday   = document.getElementById('btn-allday');
  const demoDesc    = document.getElementById('demo-desc');

  if (mode === 'allday') {
    // ── All Day event: hide time string, show capsule badge ──
    timeText.style.display    = 'none';
    alldayBadge.style.display = 'inline-flex';

    btnRegular.classList.remove('active');
    btnAllday.classList.add('active');

    demoDesc.textContent = '✓ Expected behavior — "All Day" capsule replaces the time value';
    demoDesc.style.color = 'rgba(119, 154, 252, 0.85)';

  } else {
    // ── Regular event: show time string, hide capsule badge ──
    timeText.style.display    = '';
    alldayBadge.style.display = 'none';

    btnRegular.classList.add('active');
    btnAllday.classList.remove('active');

    demoDesc.textContent = 'Shows time range in the time row (current / pre-fix behavior)';
    demoDesc.style.color = '';
  }
}

// ─── Screen navigation helpers (for future multi-screen use) ───

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

// ─── Init ───

document.addEventListener('DOMContentLoaded', () => {
  // Ensure correct initial state (regular mode)
  setEventMode('regular');

  // Add tactile press feedback to action buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(btn.textContent.trim() + ' tapped');
    });
  });

  // Tab bar tap feedback
  document.querySelectorAll('.tab-item').forEach((tab, i) => {
    tab.addEventListener('click', () => {
      if (!tab.classList.contains('active')) {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      }
    });
  });

  // Nav action button tap
  const navAction = document.querySelector('.nav-action');
  if (navAction) {
    navAction.addEventListener('click', () => {
      showToast('Added to Calendar');
    });
  }
});

// ─── Toast notification ───

let toastTimer = null;

function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  clearTimeout(toastTimer);

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: absolute;
    top: 68px;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
    background: rgba(44,44,45,0.92);
    color: #FAFAFA;
    font-family: var(--font-family, system-ui);
    font-size: 14px;
    font-weight: 500;
    padding: 10px 18px;
    border-radius: 24px;
    white-space: nowrap;
    z-index: 999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
  `;

  const screenArea = document.querySelector('.screen-area');
  screenArea.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  // Auto-dismiss after 2.5s
  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-8px)';
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}
