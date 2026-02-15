#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "HybridRunAnywhereCoreSpec.hpp"
#import "HybridRunAnywhereDeviceInfoSpec.hpp"
#import "RunAnywhereCore-Swift-Cxx-Bridge.hpp"

FOUNDATION_EXPORT double RunAnywhereCoreVersionNumber;
FOUNDATION_EXPORT const unsigned char RunAnywhereCoreVersionString[];

