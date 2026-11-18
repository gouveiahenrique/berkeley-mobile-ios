# Business Requirements: Home drawer stucks (ASDLC-573)

Date: 2026-11-17 | Complexity: S

## 1. Executive Summary
While the Home drawer is still loading its data, its content (loading indicator and, per the report, the category segmented control) is vertically centered in the drawer instead of anchored at the top. This makes the drawer look broken or "stuck". The drawer content must be top-aligned while loading, in the same position it occupies once loading finishes.

## 2. Problem Statement
- **Current state**: During loading, drawer content floats in the vertical middle of the drawer. When loading completes, the content jumps to the top, causing a visible layout jump and an impression that the drawer is stuck or malfunctioning.
- **Desired state**: During loading, content is pinned to the top of the drawer. The loaded content appears in that same position with no vertical jump.
- **Business impact**: Students using the Home drawer (Dining, Fitness, Study, Guides) get a consistent, polished first impression; fewer perceived-broken-app reports.
- **Personas**: Primary: Berkeley students/visitors using the home map drawer. Secondary: app maintainers/QA.

### Responsibility boundaries (system capabilities)
- The app (client) owns the drawer layout and the loading display; no backend change is required.
- The app already determines when loading starts and ends; this issue changes only where content is positioned.

### Gaps / Assumptions
- A: The report says the segmented control is centered during loading. Observed in the current app behavior, the loading state shows the loading indicator (the segmented control is displayed after loading). Requirement BR-003 covers both cases: whichever elements are shown while loading are top-aligned. Whether the segmented control becomes visible during loading is not part of this issue.
- A: Applies to all drawer sizes (detents) the drawer supports.

## 3. Business Rules
- BR-001: While the Home drawer is loading, all drawer content must be aligned to the top of the drawer, not vertically centered.
- BR-002: The top offset of the content while loading must equal the top offset of the content after loading, so no vertical jump occurs at the transition.
- BR-003: If the segmented control is displayed while loading, it must be top-aligned in the same position as in the loaded state.
- BR-004: The loading indicator must keep its "LOADING" label and remain visible until loading completes.
- BR-005: Loaded-state behavior (tabs, lists, navigation to details) must be unchanged.

## 4. Acceptance Criteria
```gherkin
Feature: Home drawer loading layout

  Scenario: Loading content is top-aligned
    Given the app is launched and Home drawer data is still loading
    When the Home drawer is displayed
    Then the loading indicator and its "LOADING" label appear at the top of the drawer
    And no content is vertically centered in the drawer

  Scenario: Segmented control is top-aligned while loading
    Given Home drawer data is still loading
    And the segmented control is displayed
    When the Home drawer is displayed
    Then the segmented control appears at the top of the drawer, in the same position as after loading

  Scenario: No layout jump when loading finishes
    Given Home drawer data is loading with content at the top
    When loading completes
    Then the segmented control and the selected tab content appear without the header moving vertically

  Scenario: Different drawer heights
    Given Home drawer data is loading
    When the drawer is at its medium height or at its expanded height
    Then the loading content is at the top in both cases

  Scenario: Loaded state unchanged
    Given Home drawer data has finished loading
    When the user switches between Dining, Fitness, Study and Guides
    Then each tab shows its content exactly as before this change

  Scenario: Reload/refetch
    Given the drawer has been displayed before
    When data is fetched again and the drawer shows the loading state
    Then the loading content is again at the top
```

## 5. Non-Functional Requirements
- Performance: No additional loading time; the layout change introduces no perceptible delay.
- Accessibility: The loading label remains readable by screen readers and supports dynamic text sizes.
- Compatibility: Works on all supported iPhone sizes and OS versions the app supports, in light and dark mode.
- Observability: No new logging required.

## 6. Edge Cases
- Very short loading time: the loading state may flash briefly; it must still be top-aligned and must not cause a jump.
- Loading failure or empty data: the existing behavior is retained; the layout in the resulting state is top-aligned like the loaded state.
- Small screens and large text sizes: the loading content stays at the top and is not clipped.
- Device rotation/iPad: content remains top-aligned.

## 7. Out of Scope
- Redesigning the loading indicator or segmented control visuals.
- Changing data fetching, caching, or loading duration.
- Adding skeleton screens or new loading states.
- Changes to the drawer's gestures, heights, or other screens.

## 8. Success Metrics
- 100% of the acceptance scenarios above pass in manual QA on at least one small and one large iPhone.
- Zero vertical position difference of the header between loading and loaded states.
- Zero recurrence reports of the centered-while-loading drawer after release.

## 9. References
- Issue ASDLC-573 "Home drawer stucks"
- Repository: https://github.com/gouveiahenrique/berkeley-mobile-ios.git
