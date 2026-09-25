# iOS Prototype: ASDLC-518 — Event Detail All Day Indicator

## Scope

This prototype covers **only** the screen explicitly described in the issue:

| Screen | Description |
|--------|-------------|
| Event Detail Page | Shows an all-day event with a before/after comparison toggle |

The toggle lets reviewers directly compare:
- **Fixed** — the "All Day" capsule/pill badge in the time row (`isAllDay = true`)
- **Current Bug** — the misleading "12:00 AM" plain text that currently appears

## Design System Source

Extracted from `berkeley-mobile-ios` via CodeGraph:

| Token | Value | Source |
|-------|-------|--------|
| Accent color | `#566EB9` | `BMColor.Calendar.dayOfWeekHeader` — `Colors+Calendar.swift` |
| Background (light) | `#FAFAFA` | `BMColor.modalBackground` — `Colors.swift` |
| Background (dark) | `#414141` | `BMColor.modalBackground` dark — `Colors.swift` |
| Card surface (light) | `#FFFFFF` | `BMColor.cardBackground` — `Colors.swift` |
| Card surface (dark) | `#484747` | `BMColor.cardBackground` dark — `Colors.swift` |
| Label (light) | `#2C2C2D` | `BMColor.Calendar.blackText` — `Colors+Calendar.swift` |
| Label (dark) | `#FAFAFA` | `BMColor.Calendar.blackText` dark — `Colors+Calendar.swift` |
| Muted text (light) | `#626162` | `BMColor.Calendar.grayedText` — `Colors+Calendar.swift` |
| Muted text (dark) | `#AAAAAA` | `BMColor.Calendar.grayedText` dark — `Colors+Calendar.swift` |
| All Day badge fill | `rgba(142,142,147,0.5)` | `Capsule().fill(.gray.opacity(0.5))` — `AllDayEventBannerView.swift` |
| Corner radius | `12px` | `RoundedRectangle(cornerRadius: 12)` — `EventDetailView.swift` |
| Thumb radius | `10px` | `clipShape(RoundedRectangle(cornerRadius: 10))` — `EventDetailView.swift` |
| Font family | Apercu → system-ui | `BMFont.regular/bold/light` — `Assets/Fonts.swift` |
| Nav pattern | NavigationStack (push) | `EventsView.swift` → `EventDetailView` |

## How to Run

1. Open `specs/ASDLC-518/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852px, Dynamic Island)

## Screens

| Screen ID      | Name         | Description                                      |
|----------------|--------------|--------------------------------------------------|
| screen-detail  | Event Detail | All-day event detail with time row comparison    |

## Interactions Implemented

| Element | Action | Result |
|---------|--------|--------|
| "Fixed ✓" tab | Click | Time row shows **All Day** capsule badge |
| "Current Bug" tab | Click | Time row shows **12:00 AM** plain text |
| "Learn More" button | Click | Visual press state (tap feedback) |
| "Register" button | Click | Visual press state (tap feedback) |
| Add to Calendar (nav) | Click | Visual press state (calendar badge icon) |
| Scroll | Swipe/scroll | Description and buttons scroll under fixed nav |

## The Fix — Visual Specification

When `BMEventCalendarEntry.isAllDay == true`, the time row in `BMDetailHeaderView.timeView` should replace the plain time text with a capsule badge:

```
BEFORE (bug):
  🕐  12:00 AM                 ← plain text, misleading for all-day events

AFTER (fix):
  🕐  ╭─────────╮              ← gray capsule with 0.5 opacity
      │ All Day │              ← Capsule().fill(.gray.opacity(0.5))
      ╰─────────╯              ← border-radius: 100px, padding: 3px 10px
```

CSS for the capsule (mirrors `AllDayEventBannerView` `Capsule` shape):
```css
.all-day-badge {
  background: rgba(142, 142, 147, 0.5);  /* .gray.opacity(0.5) */
  border-radius: 100px;                   /* Capsule shape */
  padding: 3px 10px;
  font-size: 13px;
  font-weight: 600;
}
```

## Acceptance Criteria Coverage

| Acceptance Criterion | Screen | Status |
|----------------------|--------|--------|
| All-day event shows "All Day" indicator in the time row instead of "12:00 AM" | screen-detail (Fixed tab) | ✅ Covered |
| Indicator uses a capsule/pill-shaped label | screen-detail (Fixed tab) | ✅ Covered — `border-radius: 100px` |
| Non-all-day events continue to show their time value | screen-detail (Current Bug tab shows how it works for comparison) | ✅ Covered |
| Dark mode support | screen-detail | ✅ Covered via `@media (prefers-color-scheme: dark)` |
