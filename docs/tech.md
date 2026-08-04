# Technology Stack

**Last updated:** 2026-08-04

## Summary

Berkeley Mobile iOS is a native Swift application for UC Berkeley students, providing campus dining, library, gym, event, safety, and resource information. It uses Firebase as its backend and CocoaPods + Swift Package Manager for dependency management.

## Languages

- **Primary Language:** Swift 5.0
- **Minimum iOS Deployment Target:** iOS 18.0 (main app), iOS 17.0 (widget extension)

## Frameworks

### iOS SDK

- **UI:** SwiftUI (primary for new screens), UIKit (legacy screens bridged via `UIViewControllerRepresentable`)
- **Maps:** MapKit
- **Notifications:** UserNotifications, EventKit
- **Concurrency:** Swift Concurrency (async/await, `Task`, `@MainActor`), DispatchQueue (legacy)
- **Observation:** `@Observable` macro (Swift 5.9+) and `ObservableObject` / `@Published` (legacy)

### Backend & Analytics

- **Main Framework:** Firebase 11.2.0 (via CocoaPods)
  - `Firebase/Analytics` — usage analytics (FirebaseAnalytics 11.2.0)
  - `Firebase/Auth` — Google Sign-In authentication
  - `Firebase/Firestore` — primary NoSQL database (FirebaseFirestore 11.2.0)
  - `FirebaseMessaging` 11.4.0 — push notifications (FCM)
- **Authentication:** GoogleSignIn 8.0.0

### Dependency Injection

- **Factory 2.5.3** — Swift Package Manager; DI container via `FactoryKit` module

### UI Enhancements

- **Glur 1.1.0** — Swift Package Manager; blur effects for SwiftUI views

## Major Dependencies

### CocoaPods (Podfile.lock — CocoaPods 1.16.2)

| Library | Version | Purpose |
|---------|---------|---------|
| Firebase | 11.2.0 | Core Firebase umbrella |
| FirebaseAnalytics | 11.2.0 | Event tracking |
| FirebaseAuth | 11.2.0 | User authentication |
| FirebaseFirestore | 11.2.0 | Cloud database |
| FirebaseMessaging | 11.4.0 | Push notifications |
| GoogleSignIn | 8.0.0 | Google OAuth |

### Swift Package Manager (Package.resolved v3)

| Library | Version | Purpose |
|---------|---------|---------|
| Factory (FactoryKit) | 2.5.3 | Dependency injection container |
| Glur | 1.1.0 | SwiftUI blur effects |

## Build Tools

- **Package Manager:** CocoaPods 1.16.2 (primary) + Swift Package Manager (integrated in Xcode)
- **IDE:** Xcode (xcworkspace — must open `berkeley-mobile.xcworkspace`, not `.xcodeproj`)
- **Workspace:** `berkeley-mobile.xcworkspace`

## Targets

| Target | Bundle ID | Min iOS | Marketing Version |
|--------|-----------|---------|-------------------|
| berkeley-mobile | org.asuc.ASUC | 18.0 | 11.14.1 |
| BerkeleyMobileWidgetExtension | org.asuc.ASUC.BerkeleyMobileWidget | 17.0 | 1.0 |

## Development Tools

- **Linter:** None configured (no `.swiftlint.yml` found)
- **Formatter:** None configured
- **CI/CD:** None configured in repository (no `.github/workflows`)

## Runtime Environment

- **Platform:** iOS 18.0+ (iPhone/iPad)
- **Widget Extension:** iOS 17.0+ (WidgetKit)
- **Build system:** Xcode build system via `.xcworkspace`

## External Services

- **Database:** Google Cloud Firestore (primary data store)
- **Analytics:** Firebase Analytics
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Authentication:** Firebase Auth + Google Sign-In

## Secrets & Configuration

- `berkeley-mobile/GoogleService-Info.plist` — **NOT in repo** (gitignored); required for Firebase
- `berkeley-mobile/Secrets.swift` — **NOT in repo** (gitignored); likely contains API keys

## Constraints

- Must open `berkeley-mobile.xcworkspace` (not `.xcodeproj`) after running `pod install`
- `GoogleService-Info.plist` must be provided manually for Firebase to work
- Swift 5.0 compiler; `@Observable` macro requires Xcode 15+
- iOS 18.0+ deployment target requires Xcode 16+
