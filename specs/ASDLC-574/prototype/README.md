# iOS Prototype: ASDLC-574 — Campus Events Home Screen Widget

## Scope
This prototype covers ONLY the screens required by the issue:
- **Widget Gallery** (screen-home): iOS home screen showing all widget family sizes
- **EventsView** (screen-events): Deep-link destination showing today's campus event agenda
- **EventDetailView** (screen-detail): Event detail view reached by tapping any event

## Design System Source
Extracted from the codebase via CodeGraph:

| Token | Value | Source |
|---|---|---|
| Accent color | `#779AFC` | `BMColor.ActionButton.background` (119/154/252) |
| Calendar blue | `#5670B9` | `BMColor.Calendar.dayOfWeekHeader` (86/112/185) |
| Event blue | `#7297E6` | `BMColor.eventAcademic` (114/151/230) |
| Event warm | `#F3B659` | `BMColor.eventHoliday` (243/182/89) |
| Event gray | `#8C8C8C` | `BMColor.eventDefault` (140/140/140) |
| Background | `#FAFAFA` / `#000` dark | `BMColor.modalBackground` |
| Card surface | `#FFFFFF` / `#484747` dark | `BMColor.cardBackground` |
| Primary text | `#2C2C2D` / `#FAFAFA` dark | `BMColor.Calendar.blackText` |
| Secondary text | `#626162` / `#AAAAAA` dark | `BMColor.Calendar.grayedText` |
| Corner radius | `12px` | `BMActionButton` clipShape |
| Widget radius | `22px` | Apple standard home-screen widget |
| Font family | `Apercu`, system-ui fallback | `BMFont.regular/bold/medium` |

## How to Run
1. Open `specs/ASDLC-574/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens

| Screen ID | Name | Description |
|---|---|---|
| screen-home | Widget Gallery | iOS home-screen simulation showing all 5 widget variants |
| screen-events | EventsView | Today's campus event agenda (deep link destination) |
| screen-detail | EventDetailView | Full event detail with description and action buttons |

## Widget Families Prototyped

| Family | Size (prototype) | Content |
|---|---|---|
| `.accessoryInline` | 320×32px strip | Next event name + time (lock screen top) |
| `.accessoryRectangular` | 280×56px | Next event name, time, location (lock screen) |
| `.systemSmall` | 165×165px | Single next event: name, time pill, location |
| `.systemMedium` | 341×165px | 3 upcoming events today with time and location |
| `.systemLarge` | 341×350px | Full today's agenda grouped: All Day / Morning / Afternoon / Evening |

## Navigation Flows

```
screen-home
 ├─ tap accessoryInline        → pushScreen('screen-events')
 ├─ tap accessoryRectangular   → pushScreen('screen-events')
 ├─ tap systemSmall widget     → pushScreen('screen-events')
 ├─ tap systemMedium event row → openDetail(eventId)  → screen-detail
 ├─ tap systemLarge event row  → openDetail(eventId)  → screen-detail
 └─ tap systemLarge all-day    → openDetail(5)        → screen-detail

screen-events
 ├─ tap event row              → openDetail(eventId)  → screen-detail
 └─ Back button                → popScreen()          → screen-home

screen-detail
 ├─ calendar icon              → toggleCalendarStatus() (add/remove toast)
 ├─ Learn More button          → showOpenSafariAlert() (iOS-style alert)
 ├─ Register button            → showOpenSafariAlert()
 └─ Back button                → popScreen()          → screen-events
```

## Interactions Implemented

- Push navigation with slide-left transition (300ms cubic-bezier)
- Pop navigation with slide-right transition (280ms)
- Widget tap → navigates to events or detail
- Calendar add/remove toggle with icon change and toast notification
- iOS-style alert dialog (Open in Safari)
- All-day event banner (accessory + large widget)
- Realistic Berkeley campus event data

## Acceptance Criteria Coverage

| AC | Screen | Status |
|---|---|---|
| systemSmall: next event name, start time, location | screen-home | Covered |
| systemMedium: next 2–3 events today | screen-home | Covered |
| systemLarge: today's agenda grouped by time | screen-home | Covered |
| accessoryRectangular: compact next event | screen-home | Covered |
| accessoryInline: ultra-compact next event | screen-home | Covered |
| Tapping event deep-links to EventsView detail | screen-detail | Covered |
| Data sourced from same events as EventsView | screen-events | Covered (same 7 events) |
| All-day events shown as banner, not time | both widgets | Covered |
| Tomorrow label when today's events are over | screen-events | Covered |

## Implementation Notes for Engineers

The prototype illustrates the visual design for:
- `CampusEventsTimelineEntry` (TimelineEntry with `events: [BerkeleyEvent]`, `date: Date`)
- `CampusEventsWidgetSmallView` — single next event card
- `CampusEventsWidgetMediumView` — up to 3 event rows with dividers
- `CampusEventsWidgetLargeView` — agenda grouped by `morning/afternoon/evening`
- `CampusEventsAccessoryRectangularView` — compact 3-line lock screen card
- `CampusEventsAccessoryInlineView` — single-line lock screen strip

All widget views use `widgetURL(URL(string: "berkelymobile://events/\(event.id)"))` for deep linking. The timeline provider should add an entry at each event's end time (so finished events drop off) and schedule `.atEnd` + fixed 8-hour refresh.
