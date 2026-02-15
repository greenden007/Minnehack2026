//
//  MySwift.swift
//  RunAnywhereStarter
//
//  Created by Stefan Hermann on 2/15/26.
//

import Foundation
import WidgetKit

@objcMembers class MySwift: NSObject {
  
  let userDefaultKey = "myKey"
  
  func createActivityWithKey(key: String) async {
    if let userDefaults = UserDefaults(suiteName: "local-storage") {
      let storedValue = userDefaults.integer(forKey: key)
      await LiveActivityManager.shared.createLiveActivityRequest(count: storedValue)
    }
  }
  
  func updateActivityWithKey(key: String) async {
    if let userDefaults = UserDefaults(suiteName: "local-storage") {
      let storedValue = userDefaults.integer(forKey: key)
      Task {
        await LiveActivityManager.shared.updateLiveActivityRequest(count: storedValue)
      }
    }
  }
  
  func deleteActivityWithKey(key: String) async {
    if let userDefaults = UserDefaults(suiteName: "local-storage") {
      let storedValue = userDefaults.integer(forKey: key)
      Task {
        await LiveActivityManager.shared.deleteLiveActivityRequest(count: storedValue)
      }
    }
  }
}
