# iOS Prototype: ASDLC-512 — Event Detail: All Day Indicator

## Scope
This prototype covers **only** the screen and interaction explicitly described in the issue:
- **Event Detail Page** — showing an All Day event with the time row in both bug state and fixed state

## Design System Source
Extracted via CodeGraph from `berkeley-mobile/Assets/Colors/` and `berkeley-mobile/Assets/Fonts.swift`:

| Token | Value | Source |
|---|---|---|
| Accent color | `#7B9AFC` | `BMColor.ActionButton.background` (displayP3 119/154/252) |
| Background | `#FAFAFA` (light) / `#414141` (dark) | `BMColor.modalBackground` |
| Surface | `#FFFFFF` (light) / `#484747` (dark) | `BMColor.cardBackground` |
| Primary text | `#2C2C2D` (light) / `#FAFAFA` (dark) | `BMColor.Calendar.blackText` |
| Secondary text | `#626162` (light) / `#AAAAAA` (dark) | `BMColor.Calendar.grayedText` |
| All Day capsule bg | `rgba(142,142,147,0.45)` | `.gray.opacity(0.5)` from `AllDayEventBannerView` |
| Font family | `Apercu` → system-ui | `BMFont` in `Fonts.swift` |
| Corner radius | `12px` (cards/buttons), `10px` (thumbnail) | `ActionButton`, `BMDetailHeaderView` |
| Spacing | `16px` | `EventDetailView .padding(.horizontal)` |

## How to Run
1. Open `specs/ASDLC-512/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens

| Screen ID | Name | Description |
|---|---|---|
| `screen-event-detail` | Event Detail | BMDetailHeaderView with date/time/location rows; description card; action buttons |

## Prototype Controls
A **Before / After toggle** sits above the iPhone frame:

| Toggle state | What you see in the time row |
|---|---|
| **Before (Bug)** | Clock icon + plain `"12:00 AM"` text (the current incorrect behavior) |
| **After (Fixed)** | Clock icon + `"All Day"` capsule/pill badge (the desired fix) |

Click the toggle pill to switch between the two states. The badge uses a capsule shape and `rgba(142,142,147,0.45)` fill, matching the `AllDayEventBannerView` already in the codebase.

## Navigation Flows
- Tap **"Learn More"** → toast confirming external link open
- Tap **"Register"** → toast confirming registration link open
- Tap **calendar icon** (top-right of nav bar) → toast confirming add-to-calendar intent

## Key Interaction Implemented
- **Time row state toggle**: switches `EventDetailRow`'s time display between the bug state (`"12:00 AM"`) and the fixed state (an "All Day" capsule badge with fade-in animation)

## Acceptance Criteria Coverage

| AC | Screen | Status |
|---|---|---|
| All-day events show "All Day" instead of "12:00 AM" in the time row | `screen-event-detail` (After/Fixed state) | Covered |
| Indicator uses a capsule/pill shape | `screen-event-detail` | Covered (`.border-radius: 999px` capsule) |
| Timed events continue to show their time (unchanged) | Toggle back to Before state | Covered |
