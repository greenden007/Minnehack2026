//
//  RespondrWidgetLiveActivity.swift
//  RespondrWidget
//
//  Created by Stefan Hermann on 2/15/26.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct RespondrWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct RespondrWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: CountAttribute.self) { context in
            // Lock screen/banner UI goes here
          
          LiveActivityView(state: context.state)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T")
            } minimal: {
                Text("M")
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension RespondrWidgetAttributes {
    fileprivate static var preview: RespondrWidgetAttributes {
        RespondrWidgetAttributes(name: "World")
    }
}

extension RespondrWidgetAttributes.ContentState {
    fileprivate static var smiley: RespondrWidgetAttributes.ContentState {
        RespondrWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: RespondrWidgetAttributes.ContentState {
         RespondrWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: RespondrWidgetAttributes.preview) {
   RespondrWidgetLiveActivity()
} contentStates: {
    RespondrWidgetAttributes.ContentState.smiley
    RespondrWidgetAttributes.ContentState.starEyes
}
