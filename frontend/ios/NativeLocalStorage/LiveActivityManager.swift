//
//  LiveActivityManager.swift
//  RunAnywhereStarter
//
//  Created by Stefan Hermann on 2/15/26.
//

import Foundation
import ActivityKit

final class LiveActivityManager {
  static let shared = LiveActivityManager()
  private var currentLiveActivitiesArray: [Activity<CountAttribute>] = []
  
  var isLiveActivityUpdateOnce = false
  
  let userDefaultsKey = "myKey"
  
  func createLiveActivityRequest(count: Int) async {
    currentLiveActivitiesArray.removeAll()
    let countAttributes = CountAttribute(name: "Hello World")
    let initialValue: CountAttribute.ContentState = CountAttribute.ContentState(count: count)
    
    let activityContent = ActivityContent(state: initialValue.self, staleDate: nil)
    
    do {
      let activity = try ActivityKit.Activity.request(attributes: countAttributes, content: activityContent, pushType: nil)
      
      currentLiveActivitiesArray.append(activity)
    } catch {
      print("Error in creating a live activity: ", error.localizedDescription)
    }
  }
  
  func updateLiveActivityRequest(count: Int) async {
    guard let activity = currentLiveActivitiesArray.first else { return }
    
    let updatedState = CountAttribute.ContentState(count: count)
    let updateContent = ActivityContent(state: updatedState.self, staleDate: nil)
    let alertConfig = AlertConfiguration(title: "Updating the Live Activity.", body: "", sound: .default)
    
    await activity.update(updateContent, alertConfiguration: alertConfig)
  }
  
  func deleteLiveActivityRequest(count: Int) async {
    guard let activity = currentLiveActivitiesArray.first else { return }
    let updatedState = CountAttribute.ContentState(count: count)
    let updateContent = ActivityContent(state: updatedState.self, staleDate: nil)
    await activity.end(updateContent, dismissalPolicy: .immediate)
    isLiveActivityUpdateOnce = false
    currentLiveActivitiesArray.removeAll()
  }
}
