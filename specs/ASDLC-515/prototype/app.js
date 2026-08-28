// ASDLC-515 — All Day Event Indicator Prototype
// Toggles between the fixed state (All Day capsule) and the bug state (12:00 AM)

function showState(state) {
  var fixedRow = document.getElementById('time-row-fixed');
  var bugRow   = document.getElementById('time-row-bug');
  var btnFixed = document.getElementById('btn-fixed');
  var btnBug   = document.getElementById('btn-bug');

  if (state === 'fixed') {
    fixedRow.style.display = 'flex';
    bugRow.style.display   = 'none';
    btnFixed.classList.add('seg-active');
    btnBug.classList.remove('seg-active');
  } else {
    fixedRow.style.display = 'none';
    bugRow.style.display   = 'flex';
    btnBug.classList.add('seg-active');
    btnFixed.classList.remove('seg-active');
  }
}
