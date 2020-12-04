## Setup

```
1) npm install
2) npm start

// for iOS
3) react-native run-ios // run in a second window. Launches app on iOS simulator (via xCode)

// for Android
3) Create & launch an android simulator via androidStudio
4) react-native run-android // launches app on the android device in simulator
```

## Debug
Debug in VS code, iOS: https://medium.com/@tunvirrahmantusher/react-native-debug-with-vscode-in-simple-steps-bf39b6331e67
Android: https://medium.com/@tunvirrahmantusher/android-debug-with-vscode-for-react-native-96f54d73462a

**Debug the webview**
Once a webview is showing, the displayed site can be debugged via chrome [inspect/#devices](chrome://inspect/#devices)

## If things doesn't work?

**iOS**
Navigate to project and into subfolder `ios` and run `pod install`

## Run app on physical iOS device

* Connect your device via USB
* Open up xCode and select your device (top left)
* Launch a build
* App should build and automatically launch on your device
