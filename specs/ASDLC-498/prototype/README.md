# iOS Prototype: ASDLC-498 — Event Detail All Day Indicator

## Scope
This prototype covers ONLY: the **Event Detail Page** (`EventDetailView` / `BMDetailHeaderView`), specifically the time row behaviour when `isAllDay = true`.

One screen, one interaction. Nothing else.

## Design System Source
Extracted from the codebase via CodeGraph:

| Token | Value | Source |
|-------|-------|--------|
| Accent color | `#5870B9` | `BMColor.Calendar.dayOfWeekHeader` |
| Background | `#FAFAFA` / dark `#414141` | `BMColor.modalBackground` |
| Surface | `#FFFFFF` / dark `#484747` | `BMColor.cardBackground` |
| Primary text | `#2C2C2D` / dark `#FAFAFA` | `BMColor.Calendar.blackText` |
| Muted text | `#626162` / dark `#AAAAAA` | `BMColor.Calendar.grayedText` |
| Pill background | `rgba(120,120,128,0.18)` | `AllDayEventBannerView` `.gray.opacity(0.5)` |
| Button accent | `#FB9B8E` | `BMColor.selectedButtonBackground` |
| Font family | `Apercu` (falls back to `-apple-system`) | `BMFont.regular/bold/light` in `Fonts.swift` |
| Card radius | `12px` | `BMDetailHeaderView` `cornerRadius: 12` |
| Row radius | `10px` | `RoundedRectangle(cornerRadius: 10)` across views |

## How to Run
1. Open `specs/ASDLC-498/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens

| Screen ID            | Name            | Description                                      |
|----------------------|-----------------|--------------------------------------------------|
| `screen-event-detail`| Event Detail    | `BMDetailHeaderView` with time row + demo toggle |

## Navigation Flows
Single-screen prototype — no navigation required.

## Interactions Implemented

| Interaction | Element | Effect |
|-------------|---------|--------|
| Toggle "All Day Event" switch OFF | iOS switch | Time row shows `12:00 AM` (current / broken behaviour) |
| Toggle "All Day Event" switch ON | iOS switch | Time row shows `All Day` capsule/pill (fixed behaviour) |

The before/after comparison section below the toggle permanently shows both states side by side for quick reference.

## Acceptance Criteria Coverage

| AC | Screen | Interaction | Status |
|----|--------|-------------|--------|
| Time row currently shows `12:00 AM` for all-day events | `screen-event-detail` | Toggle OFF | Demonstrated |
| Time row should show "All Day" capsule for all-day events | `screen-event-detail` | Toggle ON | Demonstrated |
| "All Day" indicator should be a capsule/pill shape | `screen-event-detail` | Toggle ON | Covered — `.all-day-pill` uses `border-radius: 100px` matching `AllDayEventBannerView`'s `Capsule()` shape |
| Timed events should still show their time normally | `screen-event-detail` | Toggle OFF | Covered — non-all-day path shows time string |
