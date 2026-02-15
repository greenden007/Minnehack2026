import ActivityKit

struct LiveActivityWidgetAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var status: String
    var issueSummary: String
  }

  var name: String
}
