#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LiveActivityManager, NSObject)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

RCT_EXTERN_METHOD(startActivity:(NSString *)patientName
                status:(NSString *)status
                issueSummary:(NSString *)issueSummary
                withResolver:(RCTPromiseResolveBlock)resolve
                withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateActivity:(NSString *)status
                issueSummary:(NSString *)issueSummary
                withResolver:(RCTPromiseResolveBlock)resolve
                withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(endActivity:(RCTPromiseResolveBlock)resolve
                withRejecter:(RCTPromiseRejectBlock)reject)

@end
