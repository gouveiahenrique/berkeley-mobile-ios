/* ============================================================
   ASDLC-554 Prototype — Event Detail: All Day Indicator
   Navigation engine: before/after state toggle
   ============================================================ */

'use strict';

// Show a named state ('before' or 'after') and update toggle buttons
function showState(state) {
  // Update screens
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  var target = document.getElementById('screen-' + state);
  if (target) { target.classList.add('active'); }

  // Update toggle buttons
  document.querySelectorAll('.toggle-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  var activeBtn = document.getElementById('btn-' + state);
  if (activeBtn) { activeBtn.classList.add('active'); }
}

// Boot: show 'before' state
document.addEventListener('DOMContentLoaded', function() {
  showState('before');
});
