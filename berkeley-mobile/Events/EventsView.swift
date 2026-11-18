//
//  EventsView.swift
//  berkeley-mobile
//
//  Created by Justin Wong on 3/4/25.
//  Copyright © 2025 ASUC OCTO. All rights reserved.
//

import FactoryKit
import SwiftUI

struct EventsView: View {
    @InjectedObservable(\.eventsViewModel) private var eventsViewModel
    @InjectedObservable(\.deepLinkRouter) private var deepLinkRouter

    @State private var deepLinkSelectedEvent: BMEventCalendarEntry?

    var body: some View {
        ZStack {
            BMTopBlobView(imageName: "BlobTopRight", xOffset: 50, yOffset: -45, width: 300, height: 150)
            NavigationStack {
                Group {
                    if eventsViewModel.eventsGroupedByDate.isEmpty {
                        BMContentUnavailableView(iconName: "", title: "No Events Available", subtitle: "Please try again.")
                    } else {
                        List(eventsViewModel.eventsGroupedByDate, id: \.0) { dayEvents in
                            EventsDateSectionView(date: dayEvents.0, events: dayEvents.1) { event in
                                Group {
                                    if event.isAllDay == true {
                                        AllDayEventBannerView(event: event)
                                    } else {
                                        EventRowView(event: event)
                                            .padding(.horizontal)

                                    }
                                }
                                .background(
                                    NavigationLink("") {
                                        EventDetailView(event: event)
                                            .presentAlert(alert: $eventsViewModel.alert)
                                    }
                                    .opacity(0)
                                )
                            }
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                        }
                        .scrollContentBackground(.hidden)
                    }
                }
                .navigationDestination(isPresented: Binding(
                    get: { deepLinkSelectedEvent != nil },
                    set: { isPresented in
                        if !isPresented {
                            deepLinkSelectedEvent = nil
                        }
                    }
                )) {
                    if let event = deepLinkSelectedEvent {
                        EventDetailView(event: event)
                            .presentAlert(alert: $eventsViewModel.alert)
                    }
                }
            }
            .onAppear {
                eventsViewModel.logCampuswideTabAnalytics()
                resolveDeepLinkEventIfNeeded()
            }
            .onChange(of: eventsViewModel.isProcessingEventsExistence) { _, _ in
                resolveDeepLinkEventIfNeeded()
            }
            .onChange(of: eventsViewModel.eventsGroupedByDate.isEmpty) { _, _ in
                resolveDeepLinkEventIfNeeded()
            }
        }
        .navigationTitle("Events")
        .background(Color(BMColor.cardBackground))
    }

    /// Resolves a Campus Events widget deep link (BR-010) to the matching `BMEventCalendarEntry`,
    /// computing the same stable id the widget used (`EventIdentity`). Falls back to this list
    /// (i.e. does nothing further) once loading has finished and no match was found.
    private func resolveDeepLinkEventIfNeeded() {
        guard let pendingEventID = deepLinkRouter.pendingEventID else { return }

        let allEvents = eventsViewModel.eventsGroupedByDate.flatMap { $0.1 }
        if let match = allEvents.first(where: {
            EventIdentity.make(name: $0.name, start: $0.startDate, end: $0.end) == pendingEventID
        }) {
            deepLinkSelectedEvent = match
            deepLinkRouter.pendingEventID = nil
        } else if !eventsViewModel.isProcessingEventsExistence {
            deepLinkRouter.pendingEventID = nil
        }
    }
}

#Preview {
    EventsView()
}
