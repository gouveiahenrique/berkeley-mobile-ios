'use strict';

// ── State ────────────────────────────────────────────────────────────────────
let currentView = 'bug';     // 'bug' | 'fixed'
let activeTab   = 0;          // 0 Dining | 1 Fitness | 2 Study | 3 Guides

// ── DOM refs ─────────────────────────────────────────────────────────────────
const bugPanel   = document.getElementById('view-bug');
const fixedPanel = document.getElementById('view-fixed');
const btnBug     = document.getElementById('btn-bug');
const btnFixed   = document.getElementById('btn-fixed');

// ── View switching ───────────────────────────────────────────────────────────
function switchView(view) {
  currentView = view;
  bugPanel.style.display   = view === 'bug'   ? 'flex' : 'none';
  fixedPanel.style.display = view === 'fixed' ? 'flex' : 'none';
  btnBug.classList.toggle('active',   view === 'bug');
  btnFixed.classList.toggle('active', view === 'fixed');
}

btnBug.addEventListener('click',   () => switchView('bug'));
btnFixed.addEventListener('click', () => switchView('fixed'));

// ── Segmented control tabs ───────────────────────────────────────────────────
document.querySelectorAll('.seg-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const panelId  = btn.dataset.panel;
    const tabIndex = parseInt(btn.dataset.index, 10);
    const container = btn.closest('.drawer-content, .bug-drawer-content');

    // deactivate all tabs in this drawer
    container.querySelectorAll('.seg-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    // show correct content panel
    const parent = btn.closest('.drawer');
    parent.querySelectorAll('.tab-panel').forEach(p => {
      p.style.display = p.id === panelId ? 'flex' : 'none';
    });
  });
});

// ── Drawer drag (simplified snap) ────────────────────────────────────────────
document.querySelectorAll('.drawer').forEach(drawer => {
  let startY = 0, startH = 0, dragging = false;

  drawer.querySelector('.drawer-handle').addEventListener('pointerdown', e => {
    dragging = true;
    startY = e.clientY;
    startH = drawer.getBoundingClientRect().height;
    drawer.setPointerCapture(e.pointerId);
    drawer.style.transition = 'none';
  });

  drawer.addEventListener('pointermove', e => {
    if (!dragging) return;
    const delta = startY - e.clientY;
    const newH  = Math.max(140, Math.min(680, startH + delta));
    drawer.style.height = newH + 'px';
  });

  drawer.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    drawer.style.transition = '';
    const h = parseInt(drawer.style.height || drawer.getBoundingClientRect().height);
    if      (h > 530) { drawer.style.height = '640px'; }
    else if (h > 280) { drawer.style.height = '420px'; }
    else              { drawer.style.height = '200px'; }
  });
});

// ── Init ─────────────────────────────────────────────────────────────────────
switchView('bug');
