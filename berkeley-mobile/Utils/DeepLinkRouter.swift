//
//  DeepLinkRouter.swift
//  berkeley-mobile
//
//  Created by Tech Lead Agent on 11/18/26.
//  Copyright © 2026 ASUC OCTO. All rights reserved.
//

import Foundation

/// App-only. Receives `berkeleymobile://events` URLs opened via `SceneDelegate` (from the Campus Events
/// widget or its Lock Screen variants) and exposes the pending navigation state for `TodayView`/`EventsView`.
@MainActor
@Observable
final class DeepLinkRouter {
    var showEvents = false
    var pendingEventID: String?

    func handle(_ url: URL) {
        guard DeepLink.isOurScheme(url) else {
            return
        }
        pendingEventID = DeepLink.eventID(from: url)
        showEvents = true
    }
}
