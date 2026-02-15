//
//  RCTNativeLocalStorage.m
//  RunAnywhereStarter
//
//  Created by Stefan Hermann on 2/15/26.
//

//  RCTNativeLocalStorage.m
//  TurboModuleExample

#import "RCTNativeLocalStorage.h"
#import "RunAnywhereStarter-Swift.h"

static NSString *const RCTNativeLocalStorageKey = @"local-storage";

@interface RCTNativeLocalStorage()
@property (strong, nonatomic) NSUserDefaults *localStorage;
@end

@implementation RCTNativeLocalStorage

- (id) init {
  if (self = [super init]) {
    _localStorage = [[NSUserDefaults alloc] initWithSuiteName:RCTNativeLocalStorageKey];
  }
  return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeLocalStorageSpecJSI>(params);
}

- (NSString * _Nullable)getItem:(NSString *)key {
  return [self.localStorage stringForKey:key];
}

- (void)setItem:(NSString *)key {
  NSInteger currentValue = [self.localStorage stringForKey:key];
  NSInteger newValue = currentValue + 1;
  [self.localStorage setInteger:newValue forKey:key];
}

- (void)createActivity:(NSString *)key resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [MySwift createActivityWithKey:key];
}

- (void)updateActivity:(NSString *)key resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [MySwift updateActivityWithKey:key];
}

- (void)deleteActivity:(NSString *)key resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [MySwift deleteActivityWithKey:key];
}


+ (NSString *)moduleName
{
  return @"NativeLocalStorage";
}

@end
