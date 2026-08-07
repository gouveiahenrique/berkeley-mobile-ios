//
//  BMCalendarEvent.swift
//  berkeley-mobile
//
//  Created by Kevin Hu on 9/22/20.
//  Copyright © 2020 ASUC OCTO. All rights reserved.
//

import Foundation
import UIKit

/// Items conforming to this protocol are events that can be represented on a calendar.
protocol BMCalendarEvent {

    /// The name of the event.
    var name: String { get set }

    /// The date and time that the event starts.
    var startDate: Date { get set }

    /// Formatted date string to display. Shows "Date / Time" or "Today / All Day".
    var dateString: String { get }

    /// The end date for the event. This value can be `nil` (e.g. for a deadline or reminder).
    var end: Date? { get set }

    /// Whether this event spans the entire day with no specific start/end time.
    var isAllDay: Bool? { get }

    /// An optional description for the event.
    var descriptionText: String? { get set }

    /// Subclass specific additional description to include when adding the event to the user's calendar. Should be used to include details like gym class trainer, links, etc.
    var additionalDescription: String { get }

    /// A string describing where the event will be held.
    var location: String? { get set }
}

extension BMCalendarEvent {
    var isAllDay: Bool? { nil }

    var dateString: String {
        get {
            var dateString = ""

            if startDate.dateOnly() == Date().dateOnly() {
                dateString += "Today"
            } else if Date.isDateTomorrow(baseDate: Date(), date: startDate) {
                dateString += "Tomorrow"
            } else {
                dateString += startDate.getDateString(withFormat: "MM/dd/yyyy")
            }
            dateString += " / "

            // Prefer the explicit isAllDay flag; fall back to time-component heuristic.
            let isAllDayEvent = isAllDay == true || (
                startDate.doesDateComponentsAreEqualTo(hour: 0, minute: 0, sec: 0) &&
                (end?.doesDateComponentsAreEqualTo(hour: 11, minute: 59, sec: 59) ?? false)
            )
            if isAllDayEvent {
                return dateString + "All Day"
            }

            dateString += startDate.getDateString(withFormat: "h:mm a")

            if let end {
                dateString += " - \(end.getDateString(withFormat: "h:mm a"))"
            }

            return dateString
        }
    }
    
    var endDate: Date {
        end ?? startDate
    }
}
