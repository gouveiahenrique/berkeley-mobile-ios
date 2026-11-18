//
//  CampusEventsWidgetViews.swift
//  BerkeleyMobileWidget
//
//  Created by Tech Lead Agent on 11/18/26.
//  Copyright © 2026 ASUC OCTO. All rights reserved.
//

import SwiftUI
import WidgetKit

private func bmTimeText(for event: WidgetEvent) -> Text {
    event.isAllDay ? Text("All day") : Text(event.start, style: .time)
}


// MARK: - CampusEventsEntryView

struct CampusEventsEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: EventsWidgetEntry

    private var content: EventsWidgetContent {
        EventsWidgetLogic.content(at: entry.date, events: entry.events)
    }

    private var nextEvent: WidgetEvent? {
        EventsWidgetLogic.next(entry.events, at: entry.date)
    }

    var body: some View {
        Group {
            switch family {
            case .systemSmall:
                SmallEventView(event: nextEvent)
            case .systemMedium:
                MediumEventsView(content: content)
            case .systemLarge:
                LargeAgendaView(content: content)
            case .accessoryRectangular:
                AccessoryRectangularEventView(event: nextEvent)
            case .accessoryInline:
                AccessoryInlineEventView(event: nextEvent)
            default:
                EmptyView()
            }
        }
        // Per-row `Link`s (medium/large) take priority; this is the fallback for the rest of the
        // widget surface, and the only tap target available on `.systemSmall` (BR-010).
        .widgetURL(nextEvent.map { DeepLink.eventURL(id: $0.id) } ?? DeepLink.eventsURL())
    }
}


// MARK: - SmallEventView (BR-002)

struct SmallEventView: View {
    let event: WidgetEvent?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let event {
                Text("NEXT UP")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.secondary)
                Spacer(minLength: 0)
                Text(event.name)
                    .font(.system(size: 16, weight: .bold))
                    .lineLimit(2)
                bmTimeText(for: event)
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)
                if let location = event.location {
                    Label {
                        Text(location).lineLimit(1)
                    } icon: {
                        Image(systemName: "mappin.and.ellipse")
                    }
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
                }
            } else {
                emptyState
            }
        }
        .accessibilityElement(children: .combine)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }

    private var emptyState: some View {
        VStack(alignment: .leading, spacing: 4) {
            Image(systemName: "calendar")
                .font(.system(size: 20))
                .foregroundStyle(.secondary)
            Text("No upcoming events")
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(.secondary)
        }
    }
}


// MARK: - MediumEventsView (BR-003)

struct MediumEventsView: View {
    let content: EventsWidgetContent

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(headerTitle)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.secondary)
            switch content {
            case .today(let events), .tomorrow(let events):
                eventRows(events)
            case .empty:
                Text("No upcoming events")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }

    private var headerTitle: String {
        switch content {
        case .today: return "TODAY"
        case .tomorrow: return "TOMORROW"
        case .empty: return "CAMPUS EVENTS"
        }
    }

    private func eventRows(_ events: [WidgetEvent]) -> some View {
        ForEach(events.prefix(EventsWidgetLogic.Constants.mediumLimit)) { event in
            Link(destination: DeepLink.eventURL(id: event.id)) {
                WidgetEventRow(event: event)
            }
            .buttonStyle(.plain)
        }
    }
}


// MARK: - LargeAgendaView (BR-004)

struct LargeAgendaView: View {
    let content: EventsWidgetContent

    private struct TimeGroup: Identifiable {
        let id: Date
        let label: String
        let events: [WidgetEvent]
    }

    /// Large-size row budget; days with 50+ events are truncated to what fits (Scalability NFR).
    private let maxRows = 12

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(headerTitle)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(.secondary)
            switch content {
            case .today(let events), .tomorrow(let events):
                ForEach(groupedByStartMinute(events)) { group in
                    VStack(alignment: .leading, spacing: 2) {
                        Text(group.label)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(.secondary)
                        ForEach(group.events) { event in
                            Link(destination: DeepLink.eventURL(id: event.id)) {
                                WidgetEventRow(event: event, showsTime: false)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            case .empty:
                Text("No upcoming events")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }

    private var headerTitle: String {
        switch content {
        case .today: return "TODAY'S AGENDA"
        case .tomorrow: return "TOMORROW'S AGENDA"
        case .empty: return "CAMPUS EVENTS"
        }
    }

    /// BR-004: groups by start time truncated to the minute; `events` arrives pre-sorted
    /// (all-day first, then chronological), so group order is preserved.
    private func groupedByStartMinute(_ events: [WidgetEvent]) -> [TimeGroup] {
        let calendar = Calendar.current
        var order: [Date] = []
        var buckets: [Date: [WidgetEvent]] = [:]

        for event in events.prefix(maxRows) {
            let key = event.isAllDay ? Date.distantPast : (calendar.date(bySetting: .second, value: 0, of: event.start) ?? event.start)
            if buckets[key] == nil {
                buckets[key] = []
                order.append(key)
            }
            buckets[key]?.append(event)
        }

        return order.map { key in
            let groupEvents = buckets[key] ?? []
            let label = groupEvents.first?.isAllDay == true ? "All day" : key.formatted(date: .omitted, time: .shortened)
            return TimeGroup(id: key, label: label, events: groupEvents)
        }
    }
}


// MARK: - WidgetEventRow

struct WidgetEventRow: View {
    let event: WidgetEvent
    var showsTime: Bool = true

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(event.name)
                .font(.system(size: 13, weight: .semibold))
                .lineLimit(1)
                .foregroundStyle(.primary)
            HStack(spacing: 4) {
                if showsTime {
                    bmTimeText(for: event)
                }
                if let location = event.location {
                    if showsTime {
                        Text("·").foregroundStyle(.secondary)
                    }
                    Text(location).lineLimit(1)
                }
            }
            .font(.system(size: 11))
            .foregroundStyle(.secondary)
        }
        .accessibilityElement(children: .combine)
        .padding(.vertical, 2)
    }
}


// MARK: - Lock Screen accessories (BR-013, stretch)

struct AccessoryRectangularEventView: View {
    let event: WidgetEvent?

    var body: some View {
        if let event {
            VStack(alignment: .leading, spacing: 1) {
                Text(event.name).font(.headline).lineLimit(1)
                bmTimeText(for: event).font(.caption)
                if let location = event.location {
                    Text(location).font(.caption2).lineLimit(1)
                }
            }
            .accessibilityElement(children: .combine)
        } else {
            Text("No upcoming events").font(.caption)
        }
    }
}

struct AccessoryInlineEventView: View {
    let event: WidgetEvent?

    var body: some View {
        if let event {
            let time = event.isAllDay ? "All day" : event.start.formatted(date: .omitted, time: .shortened)
            Label {
                Text("\(event.name) · \(time)")
            } icon: {
                Image(systemName: "calendar")
            }
        } else {
            Text("No upcoming events")
        }
    }
}
