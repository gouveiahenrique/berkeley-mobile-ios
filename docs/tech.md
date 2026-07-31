# Technology Stack

**Last updated:** 2026-07-31

## Summary

Berkeley Mobile is a native iOS application written in Swift, using SwiftUI as the primary UI framework with UIKit for legacy and complex interactive components. Data is fetched exclusively from Google Cloud Firestore via the Firebase SDK.

## Languages

- **Primary Language:** Swift 5.0+
- **Secondary Languages:** None (pure Swift; no Objective-C)

## Frameworks

### Application

- **UI Framework:** SwiftUI (primary) + UIKit (legacy views, map, drawer)
- **UIKit-SwiftUI Bridge:** `UIViewControllerRepresentable` / `UIHostingController`
- **Navigation:** `UITabBarController` (root) + SwiftUI `NavigationStack` per tab
- **Widget Extension:** WidgetKit (iOS 14+ home-screen widget)
- **Maps:** MapKit (`MKMapView`, `MKCoordinateRegion`, map annotations)
- **Push Notifications:** `UserNotifications` framework + Firebase Cloud Messaging

### Data & Backend

- **Backend-as-a-Service:** Google Cloud Firestore (read-only from app)
- **Authentication:** Firebase Auth + Google Sign-In
- **Analytics:** Firebase Analytics
- **Realtime Push:** Firebase Cloud Messaging (FCM)

## Major Dependencies

### CocoaPods (Podfile.lock)

| Pod | Version | Purpose |
|-----|---------|---------|
| Firebase | 11.2.0 | Firebase umbrella pod |
| FirebaseAnalytics | 11.2.0 | Event analytics |
| FirebaseAuth | 11.2.0 | User authentication |
| FirebaseFirestore | 11.2.0 | Cloud database client |
| FirebaseMessaging | 11.4.0 | Push notifications (FCM) |
| GoogleSignIn | 8.0.0 | OAuth sign-in with Google |
| AppAuth | 1.7.5 | OAuth 2.0 / OIDC client |
| GTMAppAuth | 4.1.1 | Google auth token management |
| GTMSessionFetcher | 3.5.0 | HTTP session fetching |
| PromisesObjC | — | Async promise support (Firebase transitive) |
| nanopb | — | Protocol Buffers (Firestore transitive) |

### Swift Package Manager (Package.resolved)

| Package | Version | Purpose |
|---------|---------|---------|
| Factory (FactoryKit) | 2.5.3 | Compile-time dependency injection container |
| Glur | 1.1.0 | Progressive blur effect for SwiftUI views |

## Build Tools

- **Package Manager:** CocoaPods (pods) + Swift Package Manager (SPM packages)
- **IDE / Build System:** Xcode 15+ (`xcworkspace` required — never open `.xcodeproj` directly)
- **Task Runner:** Xcode build targets / schemes only (no Makefile or shell scripts)

## Development Tools

- **Linter / Formatter:** None configured (no `.swiftlint.yml`, SwiftFormat, or Prettier)
- **Type Checker:** Swift compiler (built into Xcode)
- **Pre-commit Hooks:** None configured

## Runtime Environment

- **Platform:** iOS 18.0+ (main app target); widget target requires iOS 17.0+
- **Simulator / Device:** Xcode Simulator or physical iOS device
- **Xcode Requirement:** Xcode 15+ (Swift 5 toolchain)
- **Container / CI:** No Docker. CI/CD pipeline not present in repo (App Store distribution assumed via Xcode Organizer / Fastlane externally).

## External Services

- **Backend Database:** Google Cloud Firestore (project key in `GoogleService-Info.plist`, not committed)
- **Authentication:** Firebase Auth + Google OAuth 2.0
- **Analytics:** Firebase Analytics
- **Push Notifications:** Firebase Cloud Messaging (FCM)

## Constraints

- `GoogleService-Info.plist` is **not** included in the repository. Developers must obtain it from the ASUC OCTO team before building.
- CocoaPods is required: run `pod install` in the repo root before opening in Xcode.
- Always open `berkeley-mobile.xcworkspace`, not `berkeley-mobile.xcodeproj`.
- Minimum iOS deployment target is **iOS 18.0** for the main app and **iOS 17.0** for the widget extension.
- App version: **11.14.1** (MARKETING_VERSION in project settings).
