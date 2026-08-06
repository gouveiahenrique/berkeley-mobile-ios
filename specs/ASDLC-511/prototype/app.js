/* ============================================================
   Berkeley Mobile – ASDLC-511 – All Day Event Detail Prototype
   Minimal navigation engine for the event detail page
   ============================================================ */

(function () {
  'use strict';

  /* No navigation between screens needed for this prototype —
     all three comparison states are displayed simultaneously.
     This file is kept for future extensibility and any
     micro-interactions within the frames. */

  function init() {
    // Capsule shimmer on hover for the fixed state
    const capsules = document.querySelectorAll('.all-day-capsule');
    capsules.forEach(function (cap) {
      cap.addEventListener('mouseenter', function () {
        cap.style.transition = 'background 0.18s ease';
        cap.style.background = 'rgba(120,120,128,0.65)';
      });
      cap.addEventListener('mouseleave', function () {
        cap.style.background = '';
      });
    });

    // Simulate tapping the calendar badge icon – show a tiny toast
    const calIcons = document.querySelectorAll('.cal-badge-icon');
    calIcons.forEach(function (icon) {
      icon.style.cursor = 'pointer';
      icon.addEventListener('click', function () {
        showToast(icon.closest('.iphone-frame'), 'Add to Calendar?');
      });
    });
  }

  function showToast(frame, message) {
    // Remove existing toast in this frame
    var existing = frame.querySelector('.proto-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'proto-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'absolute',
      top: '64px',
      left: '50%',
      transform: 'translateX(-50%) translateY(-12px)',
      background: 'rgba(44,44,46,0.92)',
      color: '#fff',
      fontSize: '13px',
      fontWeight: '600',
      padding: '8px 18px',
      borderRadius: '20px',
      zIndex: '200',
      whiteSpace: 'nowrap',
      opacity: '0',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
      pointerEvents: 'none',
    });
    frame.querySelector('.screen-area').appendChild(toast);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    // Auto-dismiss after 2.4 s
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-12px)';
      setTimeout(function () { toast.remove(); }, 220);
    }, 2400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
