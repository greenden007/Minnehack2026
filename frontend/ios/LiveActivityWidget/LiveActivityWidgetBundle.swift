//
//  LiveActivityWidgetBundle.swift
//  LiveActivityWidget
//
//  Created by Rohan Cherukuri on 2/15/26.
//

import WidgetKit
import SwiftUI

@main
struct LiveActivityWidgetBundle: WidgetBundle {
    var body: some Widget {
        LiveActivityWidget()
        LiveActivityWidgetControl()
        LiveActivityWidgetLiveActivity()
    }
}
