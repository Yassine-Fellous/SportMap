#!/bin/bash
FILE="/Users/kenshi/Documents/Workspace/SportMap/Mobile/ios/Pods/MapboxMaps/Sources/MapboxMaps/Annotations/ViewAnnotationManager.swift"

sed -i '' -e '66,70c\
    public var annotations: [UIView: ViewAnnotationOptions] {\
        var result = [UIView: ViewAnnotationOptions]()\
        for (view, id) in idsByView {\
            if let options = try? mapboxMap.options(forViewAnnotationWithId: id) {\
                result[view] = options\
            }\
        }\
        return result\
    }' "$FILE"
