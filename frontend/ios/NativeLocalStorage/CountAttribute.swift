//
//  CountAttribute.swift
//  RunAnywhereStarter
//
//  Created by Stefan Hermann on 2/15/26.
//

import Foundation
import ActivityKit

struct CountAttribute: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var count: Int
    
    init(count: Int = 0) {
      self.count = count
    }
  }
  let name: String
}
