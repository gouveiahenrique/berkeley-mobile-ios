//
//  DeepLink.swift
//  berkeley-mobile
//
//  Created by Tech Lead Agent on 11/18/26.
//  Copyright © 2026 ASUC OCTO. All rights reserved.
//

import Foundation

/// Shared with `BerkeleyMobileWidgetExtension`: builds and reads `berkeleymobile://events` URLs used
/// to deep link from the Campus Events widget into `EventsView` / `EventDetailView`.
enum DeepLink {
    static let scheme = "berkeleymobile"
    static let eventsHost = "events"
    static let idQueryItemName = "id"

    /// Only a 1-16 character lowercase hex string is accepted as an event id (matches `EventIdentity.make`'s output).
    static let idValidationPattern = "^[0-9a-f]{1,16}$"

    static func eventsURL() -> URL {
        var components = URLComponents()
        components.scheme = scheme
        components.host = eventsHost
        return components.url!
    }

    static func eventURL(id: String) -> URL {
        var components = URLComponents()
        components.scheme = scheme
        components.host = eventsHost
        components.queryItems = [URLQueryItem(name: idQueryItemName, value: id)]
        return components.url!
    }

    /// Extracts a validated event id from a `berkeleymobile://events?id=...` URL, if present.
    static func eventID(from url: URL) -> String? {
        guard url.scheme == scheme, url.host == eventsHost else {
            return nil
        }
        let rawID = URLComponents(url: url, resolvingAgainstBaseURL: false)?
            .queryItems?.first { $0.name == idQueryItemName }?.value
        guard let rawID, rawID.range(of: idValidationPattern, options: .regularExpression) != nil else {
            return nil
        }
        return rawID
    }

    static func isOurScheme(_ url: URL) -> Bool {
        url.scheme == scheme
    }
}
