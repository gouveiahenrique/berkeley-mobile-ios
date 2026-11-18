//
//  EventsDataService.swift
//  berkeley-mobile
//
//  Created by Tech Lead Agent on 11/18/26.
//  Copyright © 2026 ASUC OCTO. All rights reserved.
//

import FirebaseFirestore
import Foundation
import os

fileprivate let kEventsDataServiceEndpoint = "Events"

extension Logger {
    static let eventsDataService = Logger(
        subsystem: Bundle.main.bundleIdentifier!,
        category: String(describing: EventsDataService.self)
    )
}

struct BerkeleyEventsDaySnapshot: Codable {
    var date: Date?
    var displayDate: String?
    var scrapedAt: Date?
    var events: [BerkeleyEvent]
}

struct BerkeleyEvent: Codable {
    let startTime: Date?
    let endTime: Date?
    let eventName: String?
    let eventDescription: String?
    let eventRegisterLinkURL: URL?
    let eventImageURL: URL?
    let eventURL: URL?
    let isAllDay: Bool?
    let location: String?
}

/// Shared with `BerkeleyMobileWidgetExtension`; keep this file free of UIKit/FirebaseAnalytics imports.
class EventsDataService {
    static var shared = EventsDataService()

    private let db = Firestore.firestore()

    /// Throws on fetch failure; documents that fail to decode are logged and skipped.
    func fetchDaySnapshots() async throws -> [BerkeleyEventsDaySnapshot] {
        let snap = try await db.collection(kEventsDataServiceEndpoint).getDocuments()
        return snap.documents.compactMap { doc in
            do {
                return try doc.data(as: BerkeleyEventsDaySnapshot.self)
            } catch {
                Logger.eventsDataService.error("Cannot decode BerkeleyEventsDaySnapshot: \(error.localizedDescription)")
                return nil
            }
        }
    }
}
