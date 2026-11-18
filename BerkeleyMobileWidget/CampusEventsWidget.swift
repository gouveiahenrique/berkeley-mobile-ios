//
//  CampusEventsWidget.swift
//  BerkeleyMobileWidget
//
//  Created by Tech Lead Agent on 11/18/26.
//  Copyright © 2026 ASUC OCTO. All rights reserved.
//

import SwiftUI
import WidgetKit
import os

struct EventsWidgetEntry: TimelineEntry {
    let date: Date
    let events: [WidgetEvent]

    static let sample = EventsWidgetEntry(
        date: .now,
        events: [
            WidgetEvent(
                id: "sample1",
                name: "Career Fair",
                start: Date().addingTimeInterval(3600),
                end: Date().addingTimeInterval(7200),
                isAllDay: false,
                location: "Sproul Plaza",
                snapshotDay: Calendar.current.startOfDay(for: .now),
                imageURL: nil
            ),
            WidgetEvent(
                id: "sample2",
                name: "Evening Concert",
                start: Date().addingTimeInterval(14_400),
                end: nil,
                isAllDay: false,
                location: "Greek Theatre",
                snapshotDay: Calendar.current.startOfDay(for: .now),
                imageURL: nil
            ),
            WidgetEvent(
                id: "sample3",
                name: "Cal Day",
                start: Calendar.current.startOfDay(for: .now),
                end: nil,
                isAllDay: true,
                location: nil,
                snapshotDay: Calendar.current.startOfDay(for: .now),
                imageURL: nil
            )
        ]
    )
}


// MARK: - CampusEventsProvider

struct CampusEventsProvider: TimelineProvider {
    func placeholder(in context: Context) -> EventsWidgetEntry {
        .sample
    }

    func getSnapshot(in context: Context, completion: @escaping (EventsWidgetEntry) -> Void) {
        if context.isPreview {
            completion(.sample)
            return
        }
        Task {
            completion(EventsWidgetEntry(date: .now, events: await loadEvents()))
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<EventsWidgetEntry>) -> Void) {
        Task {
            let now = Date()
            let events = await loadEvents()
            let dates = EventsWidgetLogic.timelineDates(for: events, now: now)
            let entries = dates.map { EventsWidgetEntry(date: $0, events: events) }
            let refreshDate = min(now.addingTimeInterval(EventsWidgetLogic.Constants.refreshInterval), dates.last ?? now)
            completion(Timeline(entries: entries, policy: .after(refreshDate)))
        }
    }

    /// Fetches fresh events, with a bounded timeout so the extension always completes within its budget,
    /// falling back to the last-good cache on any failure (AD-4).
    private func loadEvents() async -> [WidgetEvent] {
        do {
            let snapshots = try await withTimeout(seconds: 20) {
                try await EventsDataService.shared.fetchDaySnapshots()
            }
            let events = EventsWidgetLogic.dedupe(snapshots.flatMap { snapshot -> [WidgetEvent] in
                guard let day = snapshot.date else { return [] }
                return snapshot.events.compactMap { WidgetEvent.make(from: $0, snapshotDate: day) }
            })
            WidgetEventsCache.save(events)
            return events
        } catch {
            Logger.eventsDataService.error("Campus Events widget fetch failed: \(error.localizedDescription)")
            return WidgetEventsCache.load()
        }
    }
}

private enum WidgetTimeoutError: Error {
    case timedOut
}

private func withTimeout<T: Sendable>(seconds: TimeInterval, operation: @escaping @Sendable () async throws -> T) async throws -> T {
    try await withThrowingTaskGroup(of: T.self) { group in
        group.addTask { try await operation() }
        group.addTask {
            try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
            throw WidgetTimeoutError.timedOut
        }
        guard let result = try await group.next() else {
            throw WidgetTimeoutError.timedOut
        }
        group.cancelAll()
        return result
    }
}


// MARK: - CampusEventsWidget

struct CampusEventsWidget: Widget {
    let kind = "CampusEventsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CampusEventsProvider()) { entry in
            CampusEventsEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Campus Events")
        .description("See what's happening on campus today or next.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular, .accessoryInline])
    }
}

#Preview(as: .systemSmall) {
    CampusEventsWidget()
} timeline: {
    EventsWidgetEntry.sample
}

#Preview(as: .systemMedium) {
    CampusEventsWidget()
} timeline: {
    EventsWidgetEntry.sample
}

#Preview(as: .systemLarge) {
    CampusEventsWidget()
} timeline: {
    EventsWidgetEntry.sample
}
