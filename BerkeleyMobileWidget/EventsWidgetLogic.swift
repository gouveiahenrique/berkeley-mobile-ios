//
//  EventsWidgetLogic.swift
//  BerkeleyMobileWidget
//
//  Created by Tech Lead Agent on 11/18/26.
//  Copyright © 2026 ASUC OCTO. All rights reserved.
//

import Foundation

/// Pure selection/timeline logic for the Campus Events widget (BR-002..BR-009). Kept Foundation-only,
/// with injectable `Date`/`Calendar`, so it is independently testable from the widget's `TimelineProvider`.
enum EventsWidgetLogic {
    enum Constants {
        /// Timed events with no end time are considered over one hour after they start (BR-005).
        static let fallbackDuration: TimeInterval = 3600
        /// Cadence the provider asks WidgetKit to refresh at; at least 3x/day per BR-009.
        static let refreshInterval: TimeInterval = 4 * 3600
        static let maxEntries = 60
        static let mediumLimit = 3
    }

    /// BR-005: when an event is considered finished.
    static func effectiveEnd(_ event: WidgetEvent, calendar: Calendar = .current) -> Date {
        if let end = event.end {
            if event.isAllDay && end <= event.start {
                return calendar.bmEndOfDay(for: event.start)
            }
            return end
        }
        if event.isAllDay {
            return calendar.bmEndOfDay(for: event.start)
        }
        return event.start.addingTimeInterval(Constants.fallbackDuration)
    }

    /// Today's not-yet-finished events, in BR-006 order (all-day first, then in-progress, then future; ties by name).
    static func remaining(_ events: [WidgetEvent], at now: Date, calendar: Calendar = .current) -> [WidgetEvent] {
        let today = calendar.startOfDay(for: now)
        return events
            .filter { calendar.isDate($0.snapshotDay, inSameDayAs: today) && effectiveEnd($0, calendar: calendar) > now }
            .sorted(by: sortedBefore(calendar: calendar, now: now))
    }

    /// BR-002/BR-006: the single event the small widget should show.
    static func next(_ events: [WidgetEvent], at now: Date, calendar: Calendar = .current) -> WidgetEvent? {
        remaining(events, at: now, calendar: calendar).first
    }

    /// Edge case: duplicate events (same name + start) are shown once.
    static func dedupe(_ events: [WidgetEvent]) -> [WidgetEvent] {
        var seenKeys = Set<String>()
        var result: [WidgetEvent] = []
        for event in events.sorted(by: { $0.start == $1.start ? $0.name < $1.name : $0.start < $1.start }) {
            let key = "\(event.name)|\(Int(event.start.timeIntervalSince1970))"
            guard !seenKeys.contains(key) else { continue }
            seenKeys.insert(key)
            result.append(event)
        }
        return result
    }

    /// AD-3: one timeline entry per state-change instant (`now`, every start/effective-end within the next
    /// 24h, and the next midnight), capped at `maxEntries` so a day with 50+ events still fits WidgetKit's budget.
    static func timelineDates(for events: [WidgetEvent], now: Date, calendar: Calendar = .current) -> [Date] {
        let horizon = now.addingTimeInterval(24 * 3600)
        var dates: Set<Date> = [now, calendar.startOfDay(for: horizon)]

        for event in events {
            let end = effectiveEnd(event, calendar: calendar)
            if end > now && end <= horizon {
                dates.insert(end)
            }
            if event.start > now && event.start <= horizon {
                dates.insert(event.start)
            }
        }

        return Array(dates.sorted().prefix(Constants.maxEntries))
    }

    /// BR-003: today's remaining agenda, or tomorrow's once today is over, or the empty state.
    static func content(at date: Date, events: [WidgetEvent], calendar: Calendar = .current) -> EventsWidgetContent {
        let todays = remaining(events, at: date, calendar: calendar)
        if !todays.isEmpty {
            return .today(todays)
        }

        let tomorrow = calendar.date(byAdding: .day, value: 1, to: calendar.startOfDay(for: date)) ?? date
        let tomorrowEvents = events
            .filter { calendar.isDate($0.snapshotDay, inSameDayAs: tomorrow) }
            .sorted(by: sortedBefore(calendar: calendar, now: date))
        if !tomorrowEvents.isEmpty {
            return .tomorrow(tomorrowEvents)
        }

        return .empty
    }

    private static func sortedBefore(calendar: Calendar, now: Date) -> (WidgetEvent, WidgetEvent) -> Bool {
        { lhs, rhs in
            let lhsRank = rank(lhs, now: now)
            let rhsRank = rank(rhs, now: now)
            if lhsRank != rhsRank {
                return lhsRank < rhsRank
            }
            if lhs.start != rhs.start {
                return lhs.start < rhs.start
            }
            return lhs.name < rhs.name
        }
    }

    /// All-day events for today sort before in-progress events, which sort before future events (BR-006).
    private static func rank(_ event: WidgetEvent, now: Date) -> Int {
        if event.isAllDay { return 0 }
        if event.start <= now { return 1 }
        return 2
    }
}

enum EventsWidgetContent: Equatable {
    case today([WidgetEvent])
    case tomorrow([WidgetEvent])
    case empty
}

extension Calendar {
    /// The last instant of the day containing `date` (23:59:59), used for all-day event fallback ends.
    func bmEndOfDay(for date: Date) -> Date {
        let start = startOfDay(for: date)
        return self.date(byAdding: DateComponents(day: 1, second: -1), to: start) ?? start
    }
}
