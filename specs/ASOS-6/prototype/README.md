# iOS Prototype: ASOS-6 — All Day Event Indicator on Event Detail Page

## Scope
This prototype covers ONLY the Event Detail page (`EventDetailView` / `BMDetailHeaderView`) in two states:
- **"Timed Event (Before)"** — current buggy behavior: the time row shows `12:00 AM` even when the event is All Day
- **"All-Day Event (After)"** — expected fixed behavior: the time row shows an `All Day` capsule/pill badge instead

No other screens, tabs, or navigation flows are included.

## Design System Source
Extracted from codebase via CodeGraph:

| Token | Value | Source |
|-------|-------|--------|
| Accent color | `#5670B9` | `BMColor.Calendar.dayOfWeekHeader` (Colors+Calendar.swift) |
| Map annotation blue | `#7B9AFC` | `BMColor.mapAnnotationColor` (Colors.swift) |
| Modal background (light) | `#FAFAFA` | `BMColor.modalBackground` (Colors.swift) |
| Modal background (dark) | `#414141` | `BMColor.modalBackground` (Colors.swift) |
| Card background (light) | `#FFFFFF` | `BMColor.cardBackground` (Colors.swift) |
| Card background (dark) | `#484747` | `BMColor.cardBackground` (Colors.swift) |
| Primary text (light) | `#2C2C2D` | `BMColor.Calendar.blackText` (Colors+Calendar.swift) |
| Primary text (dark) | `#FAFAFA` | `BMColor.Calendar.blackText` (Colors+Calendar.swift) |
| Secondary text (light) | `#626162` | `BMColor.Calendar.grayedText` (Colors+Calendar.swift) |
| Secondary text (dark) | `#AAAAAA` | `BMColor.Calendar.grayedText` (Colors+Calendar.swift) |
| Font family | `Apercu` | `BMFont` (Assets/Fonts.swift) |
| Corner radius (image) | `10px` | `RoundedRectangle(cornerRadius: 10)` (EventDetailView.swift:111) |
| Corner radius (overlay) | `12px` | `RoundedRectangle(cornerRadius: 12)` (EventDetailView.swift:133) |
| Navigation pattern | NavigationStack push | `EventDetailView` opened from `EventsView` |

## How to Run
1. Open `specs/ASOS-6/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)
4. Use the two buttons above the frame to toggle between current and expected behavior

## Screens
| Screen State | Name | Description |
|---|---|---|
| Timed (Before) | Event Detail — Current | Time row shows `12:00 AM` (the bug) for an All Day event |
| All-Day (After) | Event Detail — Fixed | Time row shows an `All Day` capsule badge (the fix) |

## Navigation Flows
- **Toggle controls** above frame → `switchDemo('timed')` / `switchDemo('allday')` → updates body class and time row content

## Interactions Implemented
- Toggle between "before" and "after" states via demo control buttons
- `All Day` capsule animates in with a spring pop (cubic-bezier scale) when switching to all-day mode
- Nav bar back button and calendar toolbar button have tap feedback
- Action buttons (Learn More, Register) have press-state animation
- Dark mode support via `@media (prefers-color-scheme: dark)`

## Acceptance Criteria Coverage
| AC | Screen State | Status |
|---|---|---|
| All Day event should NOT show `12:00 AM` | Timed (Before) — shows the bug | Demonstrated |
| All Day event should show `All Day` capsule/pill in the time row | All-Day (After) | Covered |
| Capsule/pill shape for the All Day indicator | All-Day (After) — `border-radius: 20px` on `.all-day-pill` | Covered |
| Timed events continue showing time normally | Timed (Before) — `10:00 AM – 11:30 AM` on a real event | Covered |

## File Structure
```
specs/ASOS-6/prototype/
├── index.html   — single HTML, both states as body-class-toggled visibility
├── styles.css   — design tokens from CodeGraph + iPhone frame + component styles
├── app.js       — switchDemo() toggle + tap feedback
└── README.md    — this file
```
