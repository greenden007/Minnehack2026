import Foundation
import ActivityKit
import React

@available(iOS 16.1, *)
@objc(LiveActivityManager)
class LiveActivityManager: NSObject {
  
  private var currentActivity: Activity<LiveActivityWidgetAttributes>?
  
  @objc
  func startActivity(_ patientName: String,
                     status: String,
                     issueSummary: String,
                     withResolver resolve: @escaping RCTPromiseResolveBlock,
                     withRejecter reject: @escaping RCTPromiseRejectBlock) {
    print("LiveActivityManager: Starting activity for \(patientName)")
    let authInfo = ActivityAuthorizationInfo()
    print("LiveActivityManager: areActivitiesEnabled: \(authInfo.areActivitiesEnabled)")
    guard authInfo.areActivitiesEnabled else {
      print("LiveActivityManager: Live Activities are disabled")
      reject("LIVE_ACTIVITY_DISABLED", "Live Activities are disabled for this device/app.", nil)
      return
    }

    let attributes = LiveActivityWidgetAttributes(name: patientName)
    let state = LiveActivityWidgetAttributes.ContentState(
      status: status,
      issueSummary: issueSummary
    )

    do {
      print("LiveActivityManager: Requesting activity...")
      // Using the iOS 16.1 compatible request method
      currentActivity = try Activity<LiveActivityWidgetAttributes>.request(
        attributes: attributes,
        contentState: state,
        pushType: nil
      )
      print("LiveActivityManager: Activity requested successfully: \(currentActivity?.id ?? "unknown")")
      resolve(nil)
    } catch {
      print("LiveActivityManager: Error starting activity: \(error.localizedDescription)")
      reject("LIVE_ACTIVITY_START_FAILED", "Error starting Live Activity: \(error.localizedDescription)", error)
    }
  }
  
  @objc
  func updateActivity(_ status: String,
                      issueSummary: String,
                      withResolver resolve: @escaping RCTPromiseResolveBlock,
                      withRejecter reject: @escaping RCTPromiseRejectBlock) {
    guard currentActivity != nil else {
      reject("LIVE_ACTIVITY_NOT_RUNNING", "No Live Activity is currently running.", nil)
      return
    }

    Task {
      let state = LiveActivityWidgetAttributes.ContentState(
        status: status,
        issueSummary: issueSummary
      )
      await currentActivity?.update(using: state)
      resolve(nil)
    }
  }
  
  @objc
  func endActivity(_ resolve: @escaping RCTPromiseResolveBlock,
                   withRejecter reject: @escaping RCTPromiseRejectBlock) {
    guard currentActivity != nil else {
      resolve(nil)
      return
    }

    Task {
      await currentActivity?.end(dismissalPolicy: .immediate)
      currentActivity = nil
      resolve(nil)
    }
  }
}
