//
//  LiveActivityView.swift
//  RunAnywhereStarter
//
//  Created by Stefan Hermann on 2/15/26.
//

import Foundation
import SwiftUI
import WidgetKit
import AppIntents

struct LiveActivityView: View {
  let state: CountAttribute.ContentState
  var isDynamicIslandView: Bool = false
  
  var body: some View {
    VStack {
      Text("Count is \(state.count)")
        .font(.system(size: 16, weight: .semibold))
        .foregroundColor(isDynamicIslandView ? .white : .blue)
        .padding(.top, 5)
      Button(intent: IncrementIntent()) {
        Text("Increment Me")
      }
    }
  }
}
