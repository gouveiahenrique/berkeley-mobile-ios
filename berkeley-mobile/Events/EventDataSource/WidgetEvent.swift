//
//  WidgetEvent.swift
//  berkeley-mobile
//
//  Created by Tech Lead Agent on 11/18/26.
//  Copyright © 2026 ASUC OCTO. All rights reserved.
//

import CryptoKit
import Foundation

/// Shared with `BerkeleyMobileWidgetExtension`: a pure, `Codable` representation of a campus event
/// decoded from `BerkeleyEvent`, used both for the widget's JSON cache and its timeline logic.
struct WidgetEvent: Codable, Identifiable, Equatable {
    let id: String
    let name: String
    let start: Date
    let end: Date?
    let isAllDay: Bool
    let location: String?
    let snapshotDay: Date
    let imageURL: URL?
}

enum EventIdentity {
    /// Stable id shared by the widget and the app so a widget tap can be matched back to its
    /// `BMEventCalendarEntry` in `EventsView`. Not a security boundary; used for in-memory lookup only.
    static func make(name: String, start: Date, end: Date?) -> String {
        let raw = "\(name)|\(Int(start.timeIntervalSince1970))|\(Int(end?.timeIntervalSince1970 ?? 0))"
        return SHA256.hash(data: Data(raw.utf8)).prefix(8).map { String(format: "%02x", $0) }.joined()
    }
}

extension WidgetEvent {
    /// - Returns: `nil` when the event has no usable name (BR-007: nameless events are dropped).
    static func make(from event: BerkeleyEvent, snapshotDate: Date, calendar: Calendar = .current) -> WidgetEvent? {
        guard let name = event.eventName?.trimmingCharacters(in: .whitespacesAndNewlines), !name.isEmpty else {
            return nil
        }

        let day = calendar.startOfDay(for: snapshotDate)
        let start = event.startTime ?? day
        let location = event.location?.trimmingCharacters(in: .whitespacesAndNewlines)

        return WidgetEvent(
            id: EventIdentity.make(name: name, start: start, end: event.endTime),
            name: name,
            start: start,
            end: event.endTime,
            isAllDay: event.isAllDay == true || event.startTime == nil,
            location: (location?.isEmpty == false) ? location : nil,
            snapshotDay: day,
            imageURL: event.eventImageURL
        )
    }
}
