/* ============================================================
   Berkeley Mobile — Event Detail "All Day" Indicator
   Prototype Navigation Engine + Event Data
   ============================================================ */

// ────────────────────────────────────────────────────────────
// Event Data  (matches BerkeleyEvent / BMEventCalendarEntry shape)
// ────────────────────────────────────────────────────────────
const EVENTS = [
  {
    id: 'calday',
    name: 'Cal Day Open House',
    date: 'Saturday, April 18',
    time: null,
    isAllDay: true,
    location: 'UC Berkeley Campus',
    description: 'Join us for Cal Day, UC Berkeley\'s annual open house. Explore academic departments, attend info sessions, meet current students, and experience life at Berkeley firsthand. All prospective students and families are welcome.',
    type: 'academic',
    color: '#7297E6',
    hasLearnMore: true,
    hasRegister: false
  },
  {
    id: 'careerfair',
    name: 'Spring Engineering Career Fair',
    date: 'Monday, April 20',
    time: '10:00 AM – 3:00 PM',
    isAllDay: false,
    location: 'Recreational Sports Facility',
    description: 'Connect with recruiters from 60+ leading companies including Google, Apple, Meta, and NVIDIA. Bring printed resumes and dress professionally. Open to all UC Berkeley students.',
    type: 'academic',
    color: '#779AFC',
    hasLearnMore: true,
    hasRegister: true
  },
  {
    id: 'holiday',
    name: 'César E. Chávez Day',
    date: 'Tuesday, March 31',
    time: null,
    isAllDay: true,
    location: '',
    description: 'University holiday in honor of César E. Chávez. All UC Berkeley administrative offices will be closed. Students should check with individual instructors regarding class meetings.',
    type: 'holiday',
    color: '#F3B659',
    hasLearnMore: false,
    hasRegister: false
  },
  {
    id: 'colloquium',
    name: 'Physics Colloquium: Quantum Computing Frontiers',
    date: 'Tuesday, April 21',
    time: '2:00 PM – 3:30 PM',
    isAllDay: false,
    location: '2 LeConte Hall',
    description: 'Prof. Sarah Kim (MIT) presents recent advances in fault-tolerant quantum computing, including new surface-code error correction techniques and progress toward practical quantum advantage in chemistry simulation.',
    type: 'academic',
    color: '#7297E6',
    hasLearnMore: true,
    hasRegister: false
  }
];

// ────────────────────────────────────────────────────────────
// Navigation State
// ────────────────────────────────────────────────────────────
let activeScreen = 'screen-events';

function pushScreen(targetId) {
  const current = document.getElementById(activeScreen);
  const next = document.getElementById(targetId);
  if (!current || !next || current === next) return;

  // Slide current screen left (30% — iOS parallax effect)
  current.classList.add('slide-out');

  // Bring next screen into view from the right
  next.classList.add('active');
  activeScreen = targetId;

  // Clean up slide-out class after transition
  setTimeout(() => current.classList.remove('active', 'slide-out'), 340);
}

function popScreen(targetId) {
  const current = document.getElementById(activeScreen);
  const prev = document.getElementById(targetId);
  if (!current || !prev) return;

  // Remove active from current (slides it back to the right via CSS default)
  current.classList.remove('active');

  // Restore previous screen from its left-parallax offset
  prev.classList.remove('slide-out');
  prev.classList.add('active');
  activeScreen = targetId;
}

// ────────────────────────────────────────────────────────────
// Inline SVG Icons
// ────────────────────────────────────────────────────────────
const SVG = {
  calendar: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="2.5" width="14" height="12.5" rx="2.5" stroke="currentColor" stroke-width="1.3"/>
    <path d="M5 1v3M11 1v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M1 7h14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`,

  clock: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/>
    <path d="M8 4.5V8.5l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  mappin: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1.5C5.52 1.5 3.5 3.52 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.48-2.02-4.5-4.5-4.5z" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="8" cy="6" r="1.6" stroke="currentColor" stroke-width="1.3"/>
  </svg>`,

  chevronRight: `<svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 1.5L6.5 6.5L1.5 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  chevronLeft: `<svg width="10" height="17" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 1.5L1.5 8.5L8.5 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  calendarBadgePlus: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3.5" width="15" height="14" rx="2.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M5.5 1.5v4M11.5 1.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M1 9h15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M16.5 14.5h5M19 12v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  signal: `<svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="8" width="3" height="4" rx="1"/>
    <rect x="4.5" y="5.5" width="3" height="6.5" rx="1"/>
    <rect x="9" y="3" width="3" height="9" rx="1"/>
    <rect x="13.5" y="0" width="3" height="12" rx="1"/>
  </svg>`,

  wifi: `<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="11" r="1.4"/>
    <path d="M5.1 8.2C5.9 7.4 6.9 7 8 7s2.1.4 2.9 1.2l1.2-1.2C11 5.8 9.6 5 8 5s-3 .8-4.1 2l1.2 1.2z" opacity="0.75"/>
    <path d="M2 4.9C3.4 3.4 5.6 2.5 8 2.5s4.6.9 6 2.4l1.2-1.2C13.4 2 10.9 1 8 1 5.1 1 2.6 2 .8 3.7L2 4.9z" opacity="0.45"/>
  </svg>`,

  battery: `<svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.7" y="1" width="20" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.38"/>
    <rect x="2" y="2.5" width="15.5" height="7" rx="2"/>
    <path d="M22.2 4.5v3c.9-.4 1.5-1 1.5-1.5s-.6-1.1-1.5-1.5z" opacity="0.38"/>
  </svg>`
};

// ────────────────────────────────────────────────────────────
// Status Bar HTML (shared)
// ────────────────────────────────────────────────────────────
function statusBarHTML() {
  return `
    <div class="status-bar">
      <span class="status-time">9:41</span>
      <div class="status-icons">
        ${SVG.signal}
        ${SVG.wifi}
        ${SVG.battery}
      </div>
    </div>`;
}

// ────────────────────────────────────────────────────────────
// Build Events List Screen
// ────────────────────────────────────────────────────────────
function buildEventsScreen() {
  const screen = document.getElementById('screen-events');

  // Section: March 31
  const march31Events = EVENTS.filter(e => e.id === 'holiday');
  // Section: April 18-21
  const aprilEvents = EVENTS.filter(e => e.id !== 'holiday');

  function eventRowHTML(e) {
    const dot = `<div class="event-type-dot" style="background:${e.color}"></div>`;
    const timeEl = e.isAllDay
      ? `<span class="event-allday-pill">All Day</span>`
      : `<span class="event-time-text">${e.time}</span>`;
    return `
      <div class="event-row" onclick="openDetail('${e.id}')">
        ${dot}
        <div class="event-info">
          <div class="event-name">${e.name}</div>
          <div class="event-meta">${timeEl}</div>
        </div>
        <div class="event-chevron">${SVG.chevronRight}</div>
      </div>`;
  }

  screen.innerHTML = `
    ${statusBarHTML()}
    <div class="nav-bar">
      <div class="nav-title">Events</div>
    </div>
    <div class="events-tab-strip">
      <button class="events-tab-btn active">Campus Wide</button>
      <button class="events-tab-btn">Academic Calendar</button>
    </div>
    <div class="scroll-content">
      <div class="section-header">March 31</div>
      ${march31Events.map(eventRowHTML).join('')}
      <div class="section-header">April 18 – 21</div>
      ${aprilEvents.map(eventRowHTML).join('')}
    </div>
    <div class="home-indicator"><div class="home-bar"></div></div>
  `;
}

// ────────────────────────────────────────────────────────────
// Open Detail for a specific event
// ────────────────────────────────────────────────────────────
function openDetail(eventId) {
  const event = EVENTS.find(e => e.id === eventId);
  if (!event) return;
  buildDetailScreen(event);
  pushScreen('screen-detail');
}

// ────────────────────────────────────────────────────────────
// Build Event Detail Screen
// ────────────────────────────────────────────────────────────
function buildDetailScreen(event) {
  const screen = document.getElementById('screen-detail');

  // Initials for the thumbnail
  const words = event.name.split(' ');
  const initials = words.length >= 2
    ? words[0][0] + words[1][0]
    : words[0].slice(0, 2);

  // Time row content: All Day badge OR time string
  const timeContent = event.isAllDay
    ? `<span class="all-day-badge">All Day</span>`
    : `<span>${event.time}</span>`;

  // Location row: only render if location is non-empty
  const locationRow = event.location
    ? `<div class="detail-info-row">
         ${SVG.mappin}
         <span>${event.location}</span>
       </div>`
    : '';

  // Action buttons
  const btnLearnMore = event.hasLearnMore
    ? `<button class="action-btn" onclick="handleLearnMore()">Learn More</button>`
    : '';
  const btnRegister = event.hasRegister
    ? `<button class="action-btn" onclick="handleRegister()">Register</button>`
    : '';

  // Background gradient for the hero card (simulates blurred event image)
  const bgGradient = `linear-gradient(135deg, ${event.color}cc 0%, ${event.color}66 60%, ${adjustColor(event.color, -30)}44 100%)`;

  screen.innerHTML = `
    ${statusBarHTML()}
    <div class="nav-bar">
      <button class="nav-btn" onclick="popScreen('screen-events')">
        ${SVG.chevronLeft}
        <span>Events</span>
      </button>
      <div class="nav-title">${truncate(event.name, 18)}</div>
      <button class="nav-btn" onclick="showCalendarConfirm()">
        ${SVG.calendarBadgePlus}
      </button>
    </div>
    <div class="detail-scroll">
      <!-- Hero card: ZStack(bg image + glass overlay) replicating BMDetailHeaderView -->
      <div class="detail-hero">
        <div class="detail-hero-bg" style="background: ${bgGradient}; height: 300px;"></div>
        <div class="detail-hero-glass">
          <div class="detail-thumb-wrap">
            <div class="detail-thumb" style="background: linear-gradient(135deg, ${event.color}, ${adjustColor(event.color, -20)})">
              ${initials.toUpperCase()}
            </div>
          </div>
          <div class="detail-event-name-label">${event.name}</div>
          <div class="detail-info-rows">
            <div class="detail-info-row">
              ${SVG.calendar}
              <span>${event.date}</span>
            </div>
            <div class="detail-info-row">
              ${SVG.clock}
              ${timeContent}
            </div>
            ${locationRow}
          </div>
        </div>
      </div>

      <!-- Description card: BMDetailDescriptionView -->
      <div class="desc-card">
        <div class="desc-title">Description</div>
        <div class="desc-body">${event.description}</div>
      </div>

      <!-- Action buttons: BMActionButton -->
      ${btnLearnMore}
      ${btnRegister}
    </div>
    <div class="home-indicator"><div class="home-bar"></div></div>
  `;
}

// ────────────────────────────────────────────────────────────
// Utility helpers
// ────────────────────────────────────────────────────────────

// Darken/lighten a hex color by `amount` (negative = darker)
function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

// ────────────────────────────────────────────────────────────
// Toast notification (simulates BMAlert / calendar prompts)
// ────────────────────────────────────────────────────────────
function showToast(msg) {
  const existing = document.getElementById('toast-el');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-el';
  toast.style.cssText = `
    position: absolute;
    top: 64px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    background: rgba(44,44,45,0.92);
    color: #fff;
    padding: 10px 18px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    z-index: 999;
    transition: transform 0.25s ease, opacity 0.25s ease;
    opacity: 0;
    font-family: -apple-system, system-ui, sans-serif;
  `;
  toast.textContent = msg;
  document.querySelector('.screen-area').appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-12px)';
    setTimeout(() => toast.remove(), 280);
  }, 2800);
}

function showCalendarConfirm() {
  showToast('📅 Event added to Calendar');
}

function handleLearnMore() {
  showToast('Opening in Safari…');
}

function handleRegister() {
  showToast('Opening registration page…');
}

// ────────────────────────────────────────────────────────────
// Init
// ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildEventsScreen();
  document.getElementById('screen-events').classList.add('active');
});
