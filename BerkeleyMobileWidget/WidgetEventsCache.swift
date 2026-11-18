//
//  WidgetEventsCache.swift
//  BerkeleyMobileWidget
//
//  Created by Tech Lead Agent on 11/18/26.
//  Copyright © 2026 ASUC OCTO. All rights reserved.
//

import Foundation
import os

/// AD-4: last-good-data cache for the widget process. Firestore's own offline persistence is unreliable
/// inside an extension that runs fetch-and-exit, so the widget keeps its own small JSON file instead.
/// Contains only public event data (no PII); written to the extension's own sandboxed Caches directory.
enum WidgetEventsCache {
    private static let fileName = "campus_events_cache.json"

    private static var fileURL: URL? {
        try? FileManager.default.url(for: .cachesDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            .appendingPathComponent(fileName)
    }

    static func save(_ events: [WidgetEvent]) {
        guard let url = fileURL else { return }
        do {
            let data = try JSONEncoder().encode(events)
            try data.write(to: url, options: .atomic)
        } catch {
            Logger.eventsDataService.error("Failed to write widget events cache: \(error.localizedDescription)")
        }
    }

    /// Loads the cache and prunes events whose effective end has already passed, so a stale cache never
    /// resurrects an event the user already saw disappear.
    static func load(calendar: Calendar = .current, now: Date = Date()) -> [WidgetEvent] {
        guard let url = fileURL, let data = try? Data(contentsOf: url) else {
            return []
        }
        guard let events = try? JSONDecoder().decode([WidgetEvent].self, from: data) else {
            return []
        }
        return events.filter { EventsWidgetLogic.effectiveEnd($0, calendar: calendar) > now }
    }
}
