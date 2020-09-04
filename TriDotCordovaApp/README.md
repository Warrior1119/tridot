# Installing prerequisites for Android platform  (for OS X)

1. Java 8
`brew tap adoptopenjdk/openjdk`
`brew cask install adoptopenjdk8`

2. Gradle
`brew install gradle`

3. Android Studio
`brew cask install android-studio`

4. Add SDK packages: 
- Need to install: Android SDK Platform 28
- How to: Android Studio > Menu > Preferences... > Appearance & Behavior > System Settings > Android SDK

5. Set environment variables:
export ANDROID_SDK=$HOME/Library/Android/sdk
export PATH=$ANDROID_SDK/emulator:$ANDROID_SDK/tools:$PATH
- How to: https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#setting-environment-variables

6. Create Android virtual device:
- Need to download an image: "Android 9.0 x86 - Pie - API Level 28"
- How to: https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#setting-up-an-emulator

More info: https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html

# Installing prerequisites for iOS platform (for OS X)

1. Download and install XCode

   The current version of Xcode can be accessed either through the App store, or the Xcode downloads page: https://developer.apple.com/xcode/downloads/

   Older versions of Xcode can be found by logging into the Apple Developer Downloads page and searching for the version of Xcode you need: https://developer.apple.com/downloads/more/

2. Sign up an Apple Developer account and obtain Apple Developer's license for testing on real devices, and for building binaries.

More info: https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html#installing-the-requirements

# Debugging for Android

- `npm run cordova:android:start` 
   
   This build script generates and builds Android app (.apk binary) in DEBUG mode.

# Building for Android

- `npm run cordova:android:build`
   
   This build script generates and builds Android app (SIGNED .apk binary) in RELEASE mode.

# Debugging for iOS

- `npm run cordova:ios:start`
   
   The build script generates iOS app project. 
   - Note: use OS X and XCode to run on emulator.

# Building for iOS

- `npm run cordova:ios:build`
   
   The build script generates iOS app project.
   - Note 1: Use OS X and XCode to upload to the App Store. 
   - Note 2: Obtain apple developer's license before uploading to the App Store.

#How to release your Cordova app for iOS
- Build a deployable iOS project
- Run the following command: `cordova build ios`
  As soon as the building is completed successfully, you will find the project in /platforms/ios/iOSApp
- Open the project in Xcode. From the command line: `open ./platforms/ios/iOSApp.xcworkspace/`
- Finally, sign and publish your app on the App Store

#How to release your Cordova app for Android
- Update your release information
- Open the config.xml and package.json files in your project’s directory.
- Edit all the release details you need: the widget ID, app icon, and versioning.
- Make sure you build properly
- From the Cordova directory execute the following: `cordova platform remove android`
  Open config.xml and add the following bracket where instabug is the name of your domain and androidapp is the name of your app. The result will look like this:

``` config.xml
<widget id="com.instabug.androidapp"> 
```
 
Specify if you want the icon to apply to all platforms or Android only
This can be done by adding the following:

``` config.xml
<widget>
...
  <icon src="/path/to/generic/icon" /> # for all platforms icon
  <platform name="android">
    <icon src="/path/to/android/icon" /> # android specific icon
  </platform
...
</widget>
```


- Specify the version of your app
  Remember to increment every time when building a new release. This can be done by adding the following: `config.xml <widget version="2.0.0">`
- Add the Android platform back `cordova platform add android`
- Sign your Android app
  Cordova has a built-in way to let you sign Android apps quickly. This is done with a config file, `build.json`, which will carry all the needed information to sign the app. The file should look like this:

   ```
   {
      "android": {
         "debug": {
               "keystore": "../android.keystore",
               "storePassword": "android",
               "alias": "mykey1",
               "password" : "password",
               "keystoreType": ""
         },
         "release": {
               "keystore": "../android.keystore",
               "storePassword": "",
               "alias": "mykey2",
               "password" : "password",
               "keystoreType": ""
         }
      }
   }
   ```

- Edit the config file to your liking.
- When it’s ready, execute the following command: `cordova build android -- release -- buildConfig=build.json`
- Now you should have your final product: `app-release.apk`
- Finally, upload your APK to the Google Play Store