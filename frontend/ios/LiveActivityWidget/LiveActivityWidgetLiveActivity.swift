//
//  LiveActivityWidgetLiveActivity.swift
//  LiveActivityWidget
//
//  Created by Rohan Cherukuri on 2/15/26.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct LiveActivityWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: LiveActivityWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack(alignment: .leading, spacing: 8) {
                Text("Patient Name: \(context.attributes.name)")
                    .font(.headline)
                Text("Condition: \(context.state.status)")
                    .font(.subheadline)
                Text("Issue: \(context.state.issueSummary)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
        } dynamicIsland: { context in
            // Dynamic Island UI goes here
            DynamicIsland {
                // Expanded UI goes here
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading) {
                        Text(context.attributes.name)
                            .font(.headline)
                        Text(context.state.status)
                            .font(.caption)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("🏥")
                        .font(.title)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.issueSummary)
                        .font(.caption)
                        .lineLimit(2)
                }
            } compactLeading: {
                Text("🏥")
            } compactTrailing: {
                Text(context.state.status)
                    .font(.caption2)
            } minimal: {
                Text("🏥")
            }
        }
    }
}

extension LiveActivityWidgetAttributes {
    fileprivate static var preview: LiveActivityWidgetAttributes {
        LiveActivityWidgetAttributes(name: "John Doe")
    }
}

#Preview("Notification", as: .content, using: LiveActivityWidgetAttributes.preview) {
    LiveActivityWidgetLiveActivity()
} contentStates: {
    LiveActivityWidgetAttributes.ContentState(
        status: "Stable",
        issueSummary: "No issues"
    )
    LiveActivityWidgetAttributes.ContentState(
        status: "Critical",
        issueSummary: "Dynamic"
    )
}
