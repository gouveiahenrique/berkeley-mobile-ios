//
//  TodayView.swift
//  berkeley-mobile
//
//  Created by Justin Wong on 3/10/26.
//  Copyright © 2026 ASUC OCTO. All rights reserved.

import FactoryKit
import SwiftUI

struct TodayView: View {
    private enum Route: Hashable {
        case events
    }

    @InjectedObservable(\.deepLinkRouter) private var deepLinkRouter

    @State private var path = NavigationPath()

    init() {
        UINavigationBar.appearance().largeTitleTextAttributes = [.font : BMFont.bold(30)]
    }

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    headerView

                    TodayTilingLayout(columnCount: 4, spacing: 12) {
                        ForEach(TodayTiles.allCases) { tile in
                            let viewAttributes = tile.viewAttributes()
                            TodayTileView(attributes: viewAttributes) {
                                tile.view()
                            }
                            .todayTileSpan(viewAttributes.span)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 24)
            }
            .background(backgroundGradient.ignoresSafeArea())
            .navigationTitle("Today")
            .navigationDestination(for: Route.self) { route in
                switch route {
                case .events:
                    EventsView()
                }
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        path.append(Route.events)
                    } label: {
                        Image(systemName: "calendar")
                    }
                }
            }
        }
        .onAppear {
            presentEventsIfDeepLinked()
        }
        .onChange(of: deepLinkRouter.showEvents) { _, _ in
            presentEventsIfDeepLinked()
        }
    }

    /// Pushes `EventsView` when the Campus Events widget (or a Lock Screen variant) deep links in,
    /// whether the app launches cold or is already running (BR-010).
    private func presentEventsIfDeepLinked() {
        guard deepLinkRouter.showEvents else { return }
        deepLinkRouter.showEvents = false
        path.append(Route.events)
    }

    private var headerView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Your day at a glance")
                .font(Font(BMFont.bold(22)))
                .foregroundStyle(Color.primary)

            Text("Tiles surface the key events and highlights of your day.")
                .font(Font(BMFont.regular(16)))
                .foregroundStyle(Color.primary.opacity(0.7))
        }
    }

    private var backgroundGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color(.systemGroupedBackground),
                Color(.secondarySystemGroupedBackground)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}

#Preview {
    TodayView()
}
