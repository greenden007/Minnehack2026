//
//  IncrementIntent.swift
//  RunAnywhereStarter
//
//  Created by Stefan Hermann on 2/15/26.
//

import Foundation
import AppIntents

struct IncrementIntent: AppIntent {
  static var title: LocalizedStringResource = "Increment Value"
  
  let userDefaultKey = "myKey"
  
  func perform() async throws -> some IntentResult {
    if let userDefaults = UserDefaults(suiteName: "local-storage") {
      let currentValue = userDefaults.integer(forKey: userDefaultKey)
      let newValue = currentValue + 1
      userDefaults.set(newValue, forKey: userDefaultKey)
    }
    
    return .result()
  }
}
