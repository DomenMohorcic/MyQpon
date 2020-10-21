# MyQpon app

## Building

```bash
ionic cordova build ios|android --release --prod
```

## Signing
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks platforms/android/build/outputs/apk/android-release-unsigned.apk my-alias
```
and
```bash
zipalign -f -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/outputs/apk/android-release.apk
```