/* ─────────────────────────────────────────────────────────────
   Berkeley Mobile — Campus Events Widget Prototype
   Navigation engine + event data
   ───────────────────────────────────────────────────────────── */

'use strict';

// ── Event data (domain-realistic Berkeley campus content) ──────
const EVENTS = {
  1: {
    id: 1,
    name: 'STEM Career Fair: Tech & Engineering',
    date: 'Nov 18',
    time: '10:00 AM – 4:00 PM',
    location: 'RSF Fieldhouse',
    desc: 'Connect with over 100 tech and engineering companies recruiting UC Berkeley students for internships and full-time roles. Bring printed resumes and business-casual attire.',
    type: 'academic',
    imgGradient: 'linear-gradient(135deg, #2d5be0 0%, #5b8ef5 100%)',
  },
  2: {
    id: 2,
    name: 'AI Ethics in Society Symposium',
    date: 'Nov 18',
    time: '2:00 PM – 5:00 PM',
    location: 'Sutardja Dai Hall 254',
    desc: 'Panel discussion on the societal impacts of artificial intelligence with faculty from EECS, Philosophy, and Public Policy. Open to all students and community members.',
    type: 'academic',
    imgGradient: 'linear-gradient(135deg, #6e35c8 0%, #9b6fdc 100%)',
  },
  3: {
    id: 3,
    name: 'Cal Band Practice',
    date: 'Nov 18',
    time: '4:30 PM – 6:30 PM',
    location: 'Sproul Plaza',
    desc: 'Open rehearsal for the California Marching Band. All are welcome to watch as the band prepares for the upcoming Big Game.',
    type: 'default',
    imgGradient: 'linear-gradient(135deg, #c8930a 0%, #f0b429 100%)',
  },
  4: {
    id: 4,
    name: 'Graduate Student Mixer',
    date: 'Nov 18',
    time: '6:00 PM – 9:00 PM',
    location: 'Free Speech Movement Café',
    desc: 'Informal mixer for all graduate students across departments. Light refreshments provided. A great opportunity to meet fellow grad students and faculty.',
    type: 'default',
    imgGradient: 'linear-gradient(135deg, #1a7a4a 0%, #34c778 100%)',
  },
  5: {
    id: 5,
    name: 'Bancroft Library: Fall Exhibit Opening',
    date: 'Nov 18',
    time: 'All Day',
    location: 'Bancroft Library',
    desc: 'Opening of "A Storied Campus: Cal in Fiction" — a showcase of literary works set at or inspired by UC Berkeley. Featuring book covers, excerpts, and archival photographs from The Bancroft Library.',
    type: 'exhibit',
    imgGradient: 'linear-gradient(135deg, #8b5e1a 0%, #c89040 100%)',
  },
  6: {
    id: 6,
    name: 'Undergraduate Research Colloquium',
    date: 'Nov 19',
    time: '11:00 AM – 1:00 PM',
    location: 'César Chávez Student Center',
    desc: 'Undergraduate students present their semester research projects to faculty and peers. Light refreshments provided. All are welcome to attend.',
    type: 'academic',
    imgGradient: 'linear-gradient(135deg, #1a4fa0 0%, #3a7fc8 100%)',
  },
  7: {
    id: 7,
    name: 'Fall Dance Concert',
    date: 'Nov 19',
    time: '7:30 PM – 10:00 PM',
    location: 'Zellerbach Hall',
    desc: 'Annual fall showcase by the UC Berkeley Department of Theater, Dance, and Performance Studies. Featuring student choreography and live performance across multiple dance styles.',
    type: 'default',
    imgGradient: 'linear-gradient(135deg, #b0266e 0%, #e0608a 100%)',
  },
};

// ── Navigation stack ───────────────────────────────────────────
let navStack = [];

function pushScreen(id) {
  const current = navStack.length > 0
    ? navStack[navStack.length - 1]
    : document.querySelector('.screen.active');

  const next = document.getElementById(id);
  if (!next || (current && current.id === id)) return;

  if (current) {
    current.classList.add('exiting');
    current.classList.remove('active');
    setTimeout(() => current.classList.remove('exiting'), 320);
  }

  next.style.transform = 'translateX(100%)';
  next.style.opacity = '0';
  next.style.pointerEvents = 'none';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      next.classList.add('active');
      next.style.transform = '';
      next.style.opacity = '';
      next.style.pointerEvents = '';
    });
  });

  navStack.push(next);
}

function popScreen() {
  if (navStack.length === 0) return;

  const current = navStack.pop();
  const previous = navStack.length > 0
    ? navStack[navStack.length - 1]
    : document.getElementById('screen-home');

  if (current) {
    current.style.transition = 'transform 280ms cubic-bezier(0.4,0,0.2,1), opacity 280ms ease';
    current.style.transform = 'translateX(100%)';
    current.style.opacity = '0';
    setTimeout(() => {
      current.classList.remove('active');
      current.style.transform = '';
      current.style.opacity = '';
      current.style.transition = '';
    }, 290);
  }

  if (previous) {
    previous.classList.add('active');
  }
}

// ── Open detail screen with event data ────────────────────────
function openDetail(eventId) {
  const event = EVENTS[eventId];
  if (!event) return;

  // Populate detail view fields
  document.getElementById('detail-event-name').textContent = event.name;
  document.getElementById('detail-date').textContent = event.date;
  document.getElementById('detail-time').textContent = event.time;
  document.getElementById('detail-location').textContent = event.location;
  document.getElementById('detail-desc-text').textContent = event.desc;

  const imageBg = document.getElementById('detail-image-bg');
  const imageThumb = document.getElementById('detail-image-thumb');
  if (imageBg) imageBg.style.background = event.imgGradient;
  if (imageThumb) imageThumb.style.background = event.imgGradient;

  // Show/hide buttons based on event type
  const learnBtn = document.getElementById('detail-learn-btn');
  const registerBtn = document.getElementById('detail-register-btn');
  if (learnBtn) learnBtn.style.display = 'block';
  if (registerBtn) {
    registerBtn.style.display = event.type === 'academic' ? 'block' : 'none';
  }

  // Reset calendar icon
  resetCalendarIcon();

  pushScreen('screen-detail');
}

// ── Calendar toggle (simulates add/remove) ────────────────────
let calendarAdded = false;

function toggleCalendarStatus() {
  calendarAdded = !calendarAdded;

  const addIcon   = document.getElementById('cal-icon-add');
  const checkIcon = document.getElementById('cal-icon-check');

  if (addIcon && checkIcon) {
    addIcon.style.display   = calendarAdded ? 'none'  : 'block';
    checkIcon.style.display = calendarAdded ? 'block' : 'none';
  }

  showToast(calendarAdded ? 'Added to Calendar' : 'Removed from Calendar');
}

function resetCalendarIcon() {
  calendarAdded = false;
  const addIcon   = document.getElementById('cal-icon-add');
  const checkIcon = document.getElementById('cal-icon-check');
  if (addIcon) addIcon.style.display = 'block';
  if (checkIcon) checkIcon.style.display = 'none';
}

// ── Alert ──────────────────────────────────────────────────────
function showOpenSafariAlert() {
  const overlay = document.getElementById('alert-overlay');
  if (overlay) overlay.classList.add('visible');
}

function dismissAlert() {
  const overlay = document.getElementById('alert-overlay');
  if (overlay) overlay.classList.remove('visible');
}

// ── Toast notification (slide down from top) ──────────────────
function showToast(message) {
  const existing = document.getElementById('toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: absolute;
    top: 110px;
    left: 50%;
    transform: translateX(-50%) translateY(-30px);
    background: rgba(44,44,46,0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: white;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    padding: 10px 20px;
    border-radius: 20px;
    z-index: 999;
    opacity: 0;
    transition: transform 250ms ease, opacity 250ms ease;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  `;

  const screenDetail = document.getElementById('screen-detail');
  if (screenDetail) screenDetail.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-30px)';
    setTimeout(() => toast.remove(), 260);
  }, 2200);
}

// ── Medium widget row tap handler ─────────────────────────────
function handleMediumWidgetTap(e) {
  const row = e.target.closest('[data-event-id]');
  if (row) {
    const id = parseInt(row.dataset.eventId, 10);
    openDetail(id);
  } else {
    pushScreen('screen-events');
  }
}

// ── Init: set screen-home as first active screen ──────────────
document.addEventListener('DOMContentLoaded', () => {
  const homeScreen = document.getElementById('screen-home');
  if (homeScreen) homeScreen.classList.add('active');
});
