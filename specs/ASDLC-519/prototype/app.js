'use strict';

const navStack = [];

function pushScreen(toId) {
  const current = navStack.length ? document.getElementById(navStack[navStack.length - 1]) : null;
  const next = document.getElementById(toId);
  if (!next || (current && current.id === toId)) return;

  // Incoming screen starts off-right
  next.classList.remove('active', 'slide-left');
  next.style.transform = 'translateX(100%)';
  next.style.opacity = '0';
  next.style.pointerEvents = 'none';

  // Force reflow
  next.getBoundingClientRect();

  // Activate next
  next.style.transform = '';
  next.style.opacity = '';
  next.style.pointerEvents = '';
  next.classList.add('active');

  // Slide current to left
  if (current) {
    current.classList.remove('active');
    current.classList.add('slide-left');
    current.style.pointerEvents = 'none';
  }

  navStack.push(toId);
}

function popScreen() {
  if (navStack.length <= 1) return;

  const currentId = navStack.pop();
  const current = document.getElementById(currentId);
  const prevId = navStack[navStack.length - 1];
  const prev = document.getElementById(prevId);

  if (!current || !prev) return;

  // Restore previous from left
  prev.classList.remove('slide-left');
  prev.classList.add('active');
  prev.style.pointerEvents = '';

  // Slide current to right (off-screen)
  current.classList.remove('active');
  current.style.transform = 'translateX(100%)';
  current.style.opacity = '0';
  current.style.pointerEvents = 'none';

  // Clean up after transition
  setTimeout(() => {
    current.style.transform = '';
    current.style.opacity = '';
  }, 340);
}

// Init: show first screen
document.addEventListener('DOMContentLoaded', () => {
  const first = document.querySelector('.screen[data-initial]');
  if (first) {
    first.classList.add('active');
    navStack.push(first.id);
  }
});
