<div class="stability">
  <span class="badge ios green"> </span>
  <span class="badge android red"> </span>
</div>

<!-- toc -->

# Process

The `process` object is a global object and can be accessed from anywhere. It is an instance of [`EventEmitter`][].

> **Note:** While some methods and properties are platform specific they still exist in all environments, either executing as expected or returning a suitable value should you depend on them.

## Event: `didBecomeActive`
This event is emitted to let you know that your app moved from the inactive to active state. This can occur because your app was launched by the user or the system. Apps can also return to the active state if the user chooses to ignore an interruption (such as an incoming phone call or SMS message) that sent the app temporarily to the inactive state.

You should use this event to restart any tasks that were paused (or not yet started) while the app was inactive. For example, you could use it to restart timers. If your app was previously in the background, you could also use it to refresh your app’s user interface.

## Event: `didEnterBackground`
Use this event to release shared resources, invalidate timers, and store enough app state information to restore your app to its current state in case it is terminated later. You should also disable updates to your app’s user interface and avoid using some types of shared system resources (such as the user’s contacts database).

Your implementation of this method has approximately five seconds to perform any tasks and return. If you need additional time to perform any final tasks, you can request additional execution time from the system by calling [`process.executeInBackground`][]. In practice, you should return from this event as quickly as possible. If the method does not return before time runs out your app is terminated and purged from memory.

## Event: `didReceiveRemoteNotification`
Use this event to process incoming remote notifications for your app. If you enabled the remote notifications background mode, the system launches your app (or wakes it from the suspended state) and puts it in the background state when a remote notification arrives. However, the system does not automatically launch your app if the user has force-quit it. In that situation, the user must relaunch your app or restart the device before the system attempts to launch your app automatically again.

> **Note:** If the user opens your app from the system-displayed alert, the system may call this method again when your app is about to enter the foreground so that you can update your user interface and display information pertaining to the notification.

When a remote notification arrives, the system displays the notification to the user and launches the app in the background (if needed) so that it can post this event. Launching your app in the background gives you time to process the notification and download any data associated with it, minimizing the amount of time that elapses between the arrival of the notification and displaying that data to the user.

As soon as you finish processing the notification, you must call `done` or your app will be terminated. Your app has up to 30 seconds of wall-clock time to process the notification and call the specified completion handler block. In practice, you should call `done` as soon as you are done processing the notification. The system tracks the elapsed time, power usage, and data costs for your app’s background downloads. Apps that use significant amounts of power when processing remote notifications may not always be woken up early to process future notifications.

Example:
```js
process.on("didReceiveRemoteNotification", (payload, done) => {
  if (payload.url) {
    download(payload.url, (error) => {
      if (error) {
        done(process.BACKGROUND_FETCH_RESULT_FAILED);
      } else {
        done(process.BACKGROUND_FETCH_RESULT_NEW_DATA);
      }
    });
  } else {
    done(process.BACKGROUND_FETCH_RESULT_NO_DATA);
  }
});
```

## Event: `didReceiveNotificationWithAction`
Called when your app has been activated by the user selecting an action from a local or remote notification.

Example:
```js
process.on("didReceiveNotificationWithAction", (local, action, payload, done) => {
  // Handle it -- i.e.:
  if (action == "ActionIdentifierDownload") {
    // ...
  }
  
  // Notify the system that we're done
  done();
});
```

## Event: `didRegisterForNotifications`
Posted to tell you the types of local and remote notifications that can be used to get the user's attention.

> Apps that use local or remote notifications to alert the user to new information must register the types of notifications they want to use by calling [`process.registerForNotifications`][]. The system compares your app’s request with the user’s preferences to determine the types of local and remote notifications allowed, and returns the results to your app by calling this method. Check the contents of the `types` parameter whenever this method is called.

```js
process.on("didRegisterForNotifications", (types) => {
  const remote = types.remote;
  const local  = types.local;
  
  let which = "remote and local";

  if (!remote) {
    which = "local";
  }

  if (types.badge) {
    console.log(`We're able to set the badge with ${which} notifications.`);
  }

  if (types.sound) {
    console.log(`We're able to play a sound with ${which} notifications.`);
  }

  if (types.alert) {
    console.log(`We're able to show an alert with ${which} notifications.`);
  }

  if (types.actions.length > 0) {
    console.log("We're also able to support these actions:");

    for(let action of types.actions) {
      console.log(`- ${action}`);
    }
  }
});
```

## Event: `didRegisterForNotificationsWithDeviceToken`
Posted when device registration completes successfully. In your implementation of this method, connect with your push notification server and give the token to it.

> **Note:** On iOS, the app might call this method in other rare circumstances, such as when the user launches an app after having restored a device from data that is not the device’s backup data. In this exceptional case, the app won’t know the new device’s token until the user launches it.

```js
process.on("didRegisterForNotificationsWithDeviceToken", (token) => {
  pushService.register(token);
});
```

## Event: `willEnterForeground`
You can use this event to undo many of the changes you made to your app upon entering the background. This event is invariably followed by a `didBecomeActive` event, which then moves the app from the inactive to the active state.

## Event: `willResignActive`
This event is emitted when the app is about to move from an active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the app and it begins the transition to the background state. An app in the inactive state continues to run but does not dispatch incoming events to responders.

You should use this method to pause ongoing tasks, disable timers, etc. An app in the inactive state should do minimal work while it waits to transition to either the active or background state.

If your app has unsaved user data, you can save it here to ensure that it is not lost. However, it is recommended that you save user data at appropriate points throughout the execution of your app, usually in response to specific actions. For example, save data when the user dismisses a data entry screen. Do not rely on specific app state transitions to save all of your app’s critical data.

## Event: `willTerminate`
This event lets you know that your app is about to be terminated and purged from memory entirely. You should use this event to perform any final clean-up tasks for your app, such as freeing shared resources, saving user data, and invalidating timers. Your implementation of this method has approximately five seconds to perform any tasks and return. If the method does not return before time expires, the system may kill the process altogether.

This event is generally not emitted when the user quits the app because the app simply moves to the background in that case. However, it may be emitted in situations where the app is running in the background (not suspended) and the system needs to terminate it for some reason.

## Event: `significantTimeChange`
Examples of significant time changes include the arrival of midnight, an update of the time by a carrier, and the change to daylight savings time. You should listen to this event to adjust any object of the app that displays time or is sensitive to time changes.

If your app is currently suspended, this event is queued until your app returns to the foreground, at which point it is delivered. If multiple time changes occur, only the most recent one is delivered.

## Event: `taskAboutToExpire:<taskIdentifier>`
Posted just before the expiration of a task to give you a chance to end the task. If you do not call `done` for each task before time expires, the system kills the app.

## process.backgroundTimeRemaining

This property contains the amount of time the app has to run in the background before it may be forcibly killed by the system, in double precision seconds. While the app is running in the foreground, the value in this property remains suitably large. If the app starts one or more long-running tasks using the [`process.executeInBackground`][] method and then transitions to the background, the value of this property is adjusted to reflect the amount of time the app has left to run.

## process.badgeNumber

The number currently set as the badge of the app icon in Springboard. Set to `0` (zero) to hide the badge number. The default value of this property is `0`.

> **Important:** On iOS, you must call the [`process.registerForNotifications`][] method in order to use this.

## process.canReceiveRemoteNotifications

`true` if the app is registered for remote notifications and received its device token or `false` if registration has not occurred, has failed, or has been denied by the user.

> **Note:** This property reflects only the successful completion of the remote registration process that begins when you call the registerForRemoteNotifications method. This property does not reflect whether remote notifications are actually available due to connectivity issues. The value returned by this property takes into account the user’s preferences for receiving remote notifications.

## process.documentsDirectory

The absolute path to the directory to which you should save files that should be synchronized across the consumers devices. Note that the files are only synchronized if the user has that option enabled.

It is important that you do not place large files in this directory. For that, you should use [`process.downloadDirectory`][].

## process.downloadDirectory

The absolute path to the directory to which you should save file downloads (or large files in general).

## process.networkActivityIndicatorVisible

Specify `true`if the app should show network activity and `false` if it should not. The default value is `false`. A spinning indicator in the status bar shows network activity. The app may explicitly hide or show this indicator.

## process.platform

The platform we're currently running on: `ios`, `osx` or `android`.

```js
console.log(`The current platform is ${process.platform}`);
```

## process.platformVersion

The version of the current platform.

```js
console.log(`The version of the current platform is ${process.platformVersion}`);
```

## process.state

An app may be active, inactive, or running in the background. You can use the value in this property to determine which of these states the app is currently in.

```js
switch (process.state) {
case "active":
  console.log("We're currently running in the foreground.");
  break

case "background":
  console.log("We're currently running in the background.");
  break

default:
  console.log("We're currently inactive.");
  break;
}
```

## process.executeInBackground(name, fn)

*  `name` The name of the task for debugging purposes
*  `fn` A function handling the background task

This method lets your app continue to run for a period of time after it transitions to the background. You should call this method at times where leaving a task unfinished might be detrimental to your app’s user experience. For example, your app could call this method to ensure that had enough time to transfer an important file to a remote server or at least attempt to make the transfer and note any errors. You should not use this method simply to keep your app running after it moves to the background.

> **Important:** Apps running background tasks have a finite amount of time in which to run them. (You can find out how much time is available using the [`process.backgroundTimeRemaining`][] property.) If you do not call `done` for each task before time expires, the system kills the app. A [`taskAboutToExpire:<taskIdentifier>`][] event is posted before time expires to give you a chance to end the task.

You can call this method at any point in your app’s execution. You may also call this method multiple times to mark the beginning of several background tasks that run in parallel. However, each task must be ended separately.

Example:

```js
process.executeInBackground((identifier, done) => {
  if (identifier != process.BACKGROUND_TASK_INVALID) {
    const expirationListener = (taskIdentifier) => {
      // Cancel uploading file and try at a later time
      done();
    };

    // 1: Set up a listener for the expiration event
    process.once(`taskAboutToExpire:${identifier}`, expirationListener);

    // 2: Upload large file to remote server

    // 3: In case you finish the upload before the task expires
    //    remember to remove the listener and notify the app that
    //    we're done
    if (finished) {
      process.removeListener(`taskAboutToExpire:${identifier}`, expirationListener);
      done();
    }
  }
});
```

## process.nextTick(callback)

*  `callback` The function to be executed

Calls the `callback` once the event loop runs to completion. This is not a simple alias to `setTimeout(fn, 0)`. It's much more efficient. It runs before any additional I/O events (including timers) fire in subsequent ticks of the event loop.

## process.registerForNotifications(types)

If your app displays alerts, play sounds, or badges its icon, you must call this method during your launch cycle to request permission to alert the user in these ways. (You must also make this request if you want to set the [`process.badgeNumber`][] property directly.) Typically, you make this request if your app uses local or remote notifications to alert the user to new information involving your app. The first time your app launches and calls this method, the system asks the user whether your app should be allowed to deliver notifications and stores the response. Thereafter, the system uses the stored response to determine the actual types of notifications you may use.

After calling this method, the process posts the [`didRegisterForNotifications`][] event to report the results. You can use that event to determine if your request was granted or denied by the user.

It is recommended that you call this method before you schedule any local notifications or register with the push notification service. Calling this method with a new user settings object replaces the previous settings request. Apps that support custom actions must include all of their supported actions in the `types` object.

Example:
```js
process.registerForNotifications({
  remote: true,
  local: true,
  badge: true,
  alert: true,
  sound: true,
  actions: ["ActionAccept", "ActionDecline"]
});
```

[`EventEmitter`]: events.html#class-eventemitter
[`taskAboutToExpire:<taskIdentifier>`]: #event-taskabouttoexpiretaskidentifier
[`didRegisterForNotifications`]: #event-didregisterfornotifications
[`process.backgroundTimeRemaining`]: #processbackgroundtimeremaining
[`process.badgeNumber`]: #processbadgenumber
[`process.downloadDirectory`]: #processdownloaddirectory
[`process.executeInBackground`]: #processexecuteinbackgroundname-fn
[`process.registerForNotifications`]: #processregisterfornotificationstypes
