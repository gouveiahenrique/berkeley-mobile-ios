# iOS Prototype: ASDLC-573 — Home Drawer Loading Layout Fix

## Scope
This prototype covers ONLY the two states of the Home drawer described in the issue:
- **Before (Bug)**: Loading state where content including the segmented control is vertically centered
- **After (Fix)**: Loading state where the segmented control is pinned to the top and only the spinner is centered below it

## Design System Source
- Accent color: #779AFC (from `BMColor.ActionButton.background` / `barGraphEntryCurrent`)
- Segmented highlight: #FAD47E (from `BMColor.segmentedControlHighlight`)
- Modal background: #FAFAFA light / #414141 dark (from `BMColor.modalBackground`)
- Font family: Apercu → system-ui fallback (from `BMFont` in `Assets/Fonts.swift`)
- Corner radius: 15px (from `DrawerViewController.setupBackgroundView`)
- Spacing unit: 16px (from `DrawerViewController.viewDidLoad` layoutMargins)

## How to Run
1. Open `specs/ASDLC-573/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens

| Screen ID         | Name              | Description                                             |
|-------------------|-------------------|---------------------------------------------------------|
| view-bug          | Bug State         | Drawer loading with centered content (broken layout)    |
| view-fixed        | Fixed State       | Drawer loading with seg control pinned to top (fixed)   |

## Navigation Flows
- **Before/After**: tap "Before (Bug)" / "After (Fix)" toggle at the bottom
- **Fixed view loading state**: tap "Loading" / "Loaded" sub-toggle to see both states

## Interactions Implemented
- Before/After view toggle showing bug vs. fixed layout
- Loading → Loaded state transition in the fixed view
- Segmented control tab switching (fixed view, loaded state)
- Drawer drag to resize (drag the pill handle)

## Root Cause
In `HomeView.swift` (`homeDrawerContentView`), the loading branch used a bare `Group` inside `NavigationStack`:

```swift
// BEFORE (bug)
Group {
    if homeViewModel.isFetching {
        ProgressView("LOADING").padding(.vertical, 20)
        Spacer()           // <-- Spacer has no effect without explicit VStack
    } else {
        segmentedControlHeader
        // tab content...
    }
}
```

Without an explicit `VStack`, SwiftUI centers the Group's content in the available space. The `Spacer()` has no effect because there is no VStack to push against.

## Fix Applied (`berkeley-mobile/Home/HomeView.swift`)
```swift
// AFTER (fix)
VStack(alignment: .leading) {
    segmentedControlHeader          // always visible at top
    if homeViewModel.isFetching {
        ProgressView("LOADING")
            .padding(.vertical, 20)
            .frame(maxWidth: .infinity)
        Spacer()
    } else {
        // tab content...
    }
}
```

Wrapping in `VStack(alignment: .leading)` and hoisting `segmentedControlHeader` outside the conditional ensures the segmented control is always at the top of the drawer, regardless of loading state.

## Acceptance Criteria Coverage

| AC                                                           | Screen       | Status  |
|--------------------------------------------------------------|--------------|---------|
| Segmented control is at the top during loading               | view-fixed   | Covered |
| Loading spinner appears below the segmented control          | view-fixed   | Covered |
| Layout is consistent between loading and loaded states       | view-fixed   | Covered |
| Bug (centered layout during loading) is visually demonstrated| view-bug     | Covered |
