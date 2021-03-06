//Core React Native modules
import { Platform } from "react-native";

//3rd Party Libraries
const PushNotification = require("react-native-push-notification");
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import moment from "moment";

//Utilities
import { theWeekNumericalValues } from "../utilities/theWeekNumericalValues";
import theWeek from "../utilities/theWeek";
import reminderTimes from "../utilities/reminderTimes";

//Functions
import {
  getTask,
  checkTask,
  deleteTask,
} from "../controllers/database/Tasks/tasks";
import {
  getAllUncheckedTaskIdsForASingleDay,
  getAllTaskIdsForASingleDay,
  getAllCheckedTaskIdsForASingleDay,
} from "../controllers/database/Tasks/tasks";
import {
  getDailyUpdateTime,
  getDailyUpdate,
  getTaskReminders,
  getAppFunctionality,
} from "../controllers/database/Settings/settings";

const configure = async (): Promise<void> => {
  PushNotification.configure({
    onRegister: function (token: any) {
      console.log("when is a token generated?");
      //process token
    },

    onNotification: function (notification: any) {
      //console.log("NOTIFICATION:", notification);
      if (notification.alertAction === "view") {
        global.notificationClicked = true;
        global.notificationId = Number(notification.id);
      }

      // process the notification
      // required on iOS only
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction: async function (notification: any) {
      //console.log("NOTIFICATION:", notification);
      switch (notification.action) {
        case "CHECK":
          await checkTask(Number(notification.id), false);
          break;
        case "DELETE":
          await deleteTask(Number(notification.id));
          break;
        default:
          break;
      }

      // process the action
    },

    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    popInitialNotification: true,
    requestPermissions: Platform.OS === "ios",
  });
};

const testLocalNotifications = (): void => {
  try {
    PushNotification.localNotificationSchedule({
      /* Android Only Properties */
      ticker: "My Notification Ticker", // (optional)
      showWhen: true, // (optional) default: true
      autoCancel: true, // (optional) default: true
      largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
      largeIconUrl: undefined, // (optional) default: undefined
      smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
      bigText: "Test Message", // (optional) default: "message" prop
      subText: "", // (optional) default: none
      bigPictureUrl: undefined, // (optional) default: undefined
      color: "red", // (optional) default: system default
      vibrate: true, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      ongoing: false, // (optional) set whether this is an "ongoing" notification
      priority: "high", // (optional) set notification priority, default: high
      visibility: "private", // (optional) set notification visibility, default: private
      importance: "high", // (optional) set notification importance, default: high
      allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
      ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
      onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
      actions: '["CHECK", "DELETE"]', // (Android only) See the doc for notification actions to know more
      invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

      /* iOS only properties */
      alertAction: "view", // (optional) default: view
      category: "", // (optional) default: empty string
      userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

      /* iOS and Android properties */
      title: "Test", // (optional)
      message: "Test Message", // (required)
      date: moment().add(10, "s").toDate(), // (required)
      playSound: true, // (optional) default: true
      soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
    });
  } catch (err) {
    console.log(err);
  }
};

const addARepeatingLocalNotification = async (
  taskId: number,
  delay: boolean = false
): Promise<void> => {
  try {
    let task = await getTask(taskId);
    await updateADailyRepeatingNotification(task.day);

    const showingTasks = await getTaskReminders();
    if (!showingTasks) {
      return;
    } else {
      if (task.reminderTime === "N/A" || task.isChecked === true) {
        return;
      }

      let currentDayComparator = moment().isoWeekday();
      let taskDayComparator: number = theWeekNumericalValues[task.day];
      let validId = task.id.toString();

      if (currentDayComparator > taskDayComparator) {
        PushNotification.localNotificationSchedule({
          /* Android Only Properties */
          id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
          ticker: "My Notification Ticker", // (optional)
          showWhen: true, // (optional) default: true
          autoCancel: true, // (optional) default: true
          largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
          largeIconUrl: undefined, // (optional) default: undefined
          smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
          bigText: task.text, // (optional) default: "message" prop
          subText: "", // (optional) default: none
          bigPictureUrl: undefined, // (optional) default: undefined
          color: "#404040", // (optional) default: system default
          vibrate: true, // (optional) default: true
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
          ongoing: false, // (optional) set whether this is an "ongoing" notification
          priority: "high", // (optional) set notification priority, default: high
          visibility: "private", // (optional) set notification visibility, default: private
          importance: "high", // (optional) set notification importance, default: high
          allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
          ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
          onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
          actions: '["CHECK", "DELETE"]', // (Android only) See the doc for notification actions to know more
          invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

          /* iOS only properties */
          alertAction: "view", // (optional) default: view
          category: "", // (optional) default: empty string
          userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

          /* iOS and Android properties */
          title: task.day + " Task", // (optional)
          message: task.text, // (required)
          date: moment()
            .startOf("isoWeek")
            .add(1, "w")
            .add(taskDayComparator - 1, "d")
            .add(task.reminderTimeValue, "h")
            .toDate(), // (required)
          playSound: true, // (optional) default: true
          soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
          repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
        });
      } else if (currentDayComparator < taskDayComparator) {
        PushNotification.localNotificationSchedule({
          /* Android Only Properties */
          id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
          ticker: "My Notification Ticker", // (optional)
          showWhen: true, // (optional) default: true
          autoCancel: true, // (optional) default: true
          largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
          largeIconUrl: undefined, // (optional) default: undefined
          smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
          bigText: task.text, // (optional) default: "message" prop
          subText: "", // (optional) default: none
          bigPictureUrl: undefined, // (optional) default: undefined
          color: "#404040", // (optional) default: system default
          vibrate: true, // (optional) default: true
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
          ongoing: false, // (optional) set whether this is an "ongoing" notification
          priority: "high", // (optional) set notification priority, default: high
          visibility: "private", // (optional) set notification visibility, default: private
          importance: "high", // (optional) set notification importance, default: high
          allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
          ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
          onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
          actions: '["CHECK", "DELETE"]', // (Android only) See the doc for notification actions to know more
          invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

          /* iOS only properties */
          alertAction: "view", // (optional) default: view
          category: "", // (optional) default: empty string
          userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

          /* iOS and Android properties */
          title: task.day + " Task", // (optional)
          message: task.text, // (required)
          date: moment()
            .startOf("isoWeek")
            .add(delay ? 1 : 0, "w")
            .add(taskDayComparator - 1, "d")
            .add(task.reminderTimeValue, "h")
            .toDate(), // (required)
          playSound: true, // (optional) default: true
          soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
          repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
        });
      } else if (currentDayComparator === taskDayComparator) {
        let currentTime: string = moment().format("H:mm A");
        let momentCurrentTime = moment(currentTime, "H:mm A");
        let momentSavedTime = moment(task.reminderTime, "H:mm A");
        if (momentCurrentTime.isBefore(momentSavedTime) === false) {
          PushNotification.localNotificationSchedule({
            /* Android Only Properties */
            id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
            ticker: "My Notification Ticker", // (optional)
            showWhen: true, // (optional) default: true
            autoCancel: true, // (optional) default: true
            largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
            largeIconUrl: undefined, // (optional) default: undefined
            smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
            bigText: task.text, // (optional) default: "message" prop
            subText: "", // (optional) default: none
            bigPictureUrl: undefined, // (optional) default: undefined
            color: "#404040", // (optional) default: system default
            vibrate: true, // (optional) default: true
            vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
            ongoing: false, // (optional) set whether this is an "ongoing" notification
            priority: "high", // (optional) set notification priority, default: high
            visibility: "private", // (optional) set notification visibility, default: private
            importance: "high", // (optional) set notification importance, default: high
            allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
            ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
            onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
            actions: '["CHECK", "DELETE"]', // (Android only) See the doc for notification actions to know more
            invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

            /* iOS only properties */
            alertAction: "view", // (optional) default: view
            category: "", // (optional) default: empty string
            userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

            /* iOS and Android properties */
            title: task.day + " Task", // (optional)
            message: task.text, // (required)
            date: moment()
              .startOf("isoWeek")
              .add(1, "w")
              .add(taskDayComparator - 1, "d")
              .add(task.reminderTimeValue, "h")
              .toDate(), // (required)
            playSound: true, // (optional) default: true
            soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
            repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
          });
        } else {
          PushNotification.localNotificationSchedule({
            /* Android Only Properties */
            id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
            ticker: "My Notification Ticker", // (optional)
            showWhen: true, // (optional) default: true
            autoCancel: true, // (optional) default: true
            largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
            largeIconUrl: undefined, // (optional) default: undefined
            smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
            bigText: task.text, // (optional) default: "message" prop
            subText: "", // (optional) default: none
            bigPictureUrl: undefined, // (optional) default: undefined
            color: "#404040", // (optional) default: system default
            vibrate: true, // (optional) default: true
            vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
            ongoing: false, // (optional) set whether this is an "ongoing" notification
            priority: "high", // (optional) set notification priority, default: high
            visibility: "private", // (optional) set notification visibility, default: private
            importance: "high", // (optional) set notification importance, default: high
            allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
            ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
            onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
            actions: '["CHECK", "DELETE"]', // (Android only) See the doc for notification actions to know more
            invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

            /* iOS only properties */
            alertAction: "view", // (optional) default: view
            category: "", // (optional) default: empty string
            userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

            /* iOS and Android properties */
            title: task.day + " Task", // (optional)
            message: task.text, // (required)
            date: moment()
              .startOf("isoWeek")
              .add(delay ? 1 : 0, "w")
              .add(taskDayComparator - 1, "d")
              .add(task.reminderTimeValue, "h")
              .toDate(), // (required)
            playSound: true, // (optional) default: true
            soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
            repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
          });
        }

        //Handle daily notification updating
      } else {
        throw "Something went wrong.";
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const checkingATaskNotification = async (
  taskId: number,
  delay: boolean
): Promise<void> => {
  try {
    await removeALocalScheduledNotification(taskId);
    await addARepeatingLocalNotification(taskId, delay);
  } catch (err) {
    console.log(err);
  }
};

const removeALocalScheduledNotification = async (
  taskId: number
): Promise<void> => {
  try {
    let validId = taskId.toString();
    PushNotification.cancelLocalNotifications({ id: validId });
  } catch (err) {
    console.log(err);
  }
};

//Needs to be more specific
const removeAllLocalNotifications = async (): Promise<void> => {
  try {
    PushNotificationIOS.removeAllDeliveredNotifications();
    PushNotification.cancelAllLocalNotifications();
  } catch (err) {
    console.log(err);
  }
};

const createDailyRepeatingNotification = async (
  reminderTime: string = "9:00 AM",
  id: number = 1000000
): Promise<void> => {
  const areDailyNotificationsEnabled = await getDailyUpdate();
  if (areDailyNotificationsEnabled === false) {
    return;
  }

  //Remove past notifications before adding/recreating new ones
  try {
    await removeDailyRepeatingNotifications();
  } catch (err) {
    console.log(err);
  }

  let appFunctionality = getAppFunctionality();

  try {
    let currentDay = moment().format("dddd");
    let currentIndexBasedOfDay = theWeek.indexOf(currentDay);

    //Notifications for today and onwards until the end of the week
    for (let i = currentIndexBasedOfDay; i < theWeek.length; i++) {
      let taskIdsForADay = await getAllTaskIdsForASingleDay(theWeek[i]);
      let uncheckedTaskIdsForADay = await getAllUncheckedTaskIdsForASingleDay(
        theWeek[i]
      );

      let validId = (id + i).toString();
      let delayedValidId = (id + i + 7).toString();

      if (i === currentIndexBasedOfDay) {
        let currentTime: string = moment().format("H:mm A");
        let momentCurrentTime: moment.Moment = moment(currentTime, "H:mm A");
        let momentSavedTime: moment.Moment = moment(reminderTime, "H:mm A");
        if (momentCurrentTime.isBefore(momentSavedTime) === false) {
          PushNotification.localNotificationSchedule({
            /* Android Only Properties */
            id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
            ticker: "My Notification Ticker", // (optional)
            showWhen: true, // (optional) default: true
            autoCancel: true, // (optional) default: true
            largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
            largeIconUrl: undefined, // (optional) default: undefined
            smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
            bigText: `You have ${
              appFunctionality === "standard"
                ? taskIdsForADay.length
                : uncheckedTaskIdsForADay.length
            } tasks remaining today.`, // (optional) default: "message" prop
            subText: "", // (optional) default: none
            bigPictureUrl: undefined, // (optional) default: undefined
            color: "red", // (optional) default: system default
            vibrate: true, // (optional) default: true
            vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
            ongoing: false, // (optional) set whether this is an "ongoing" notification
            priority: "high", // (optional) set notification priority, default: high
            visibility: "private", // (optional) set notification visibility, default: private
            importance: "high", // (optional) set notification importance, default: high
            allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
            ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
            onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
            actions: '["Yes", "No"]', // (Android only) See the doc for notification actions to know more
            invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

            /* iOS only properties */
            alertAction: "view", // (optional) default: view
            category: "", // (optional) default: empty string
            userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

            /* iOS and Android properties */
            title: `${theWeek[i]}'s Tasks`, // (optional)
            message: `You have ${
              appFunctionality === "standard"
                ? taskIdsForADay.length
                : uncheckedTaskIdsForADay.length
            } tasks remaining today.`, // (required)
            date: moment()
              .startOf("isoWeek")
              .add(1, "w")
              .add(i, "d")
              .add(reminderTimes[reminderTime], "h")
              .toDate(), // (required)
            playSound: true, // (optional) default: true
            soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
            repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
          });
        } else {
          //Setting up two notifications here
          PushNotification.localNotificationSchedule({
            /* Android Only Properties */
            id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
            ticker: "My Notification Ticker", // (optional)
            showWhen: true, // (optional) default: true
            autoCancel: true, // (optional) default: true
            largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
            largeIconUrl: undefined, // (optional) default: undefined
            smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
            bigText: `You have ${uncheckedTaskIdsForADay.length} tasks remaining today.`, // (optional) default: "message" prop
            subText: "", // (optional) default: none
            bigPictureUrl: undefined, // (optional) default: undefined
            color: "#404040", // (optional) default: system default
            vibrate: true, // (optional) default: true
            vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
            ongoing: false, // (optional) set whether this is an "ongoing" notification
            priority: "high", // (optional) set notification priority, default: high
            visibility: "private", // (optional) set notification visibility, default: private
            importance: "high", // (optional) set notification importance, default: high
            allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
            ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
            onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
            invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

            /* iOS only properties */
            alertAction: "view", // (optional) default: view
            category: "", // (optional) default: empty string
            userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

            /* iOS and Android properties */
            title: `${theWeek[i]}'s Tasks`, // (optional)
            message: `You have ${uncheckedTaskIdsForADay.length} tasks remaining today.`, // (required)
            date: moment()
              .startOf("isoWeek")
              .add(i, "d")
              .add(reminderTimes[reminderTime], "h")
              .toDate(), // (required)
            playSound: true, // (optional) default: true
            soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
          });

          PushNotification.localNotificationSchedule({
            /* Android Only Properties */
            id: delayedValidId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
            ticker: "My Notification Ticker", // (optional)
            showWhen: true, // (optional) default: true
            autoCancel: true, // (optional) default: true
            largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
            largeIconUrl: undefined, // (optional) default: undefined
            smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
            bigText: `You have ${
              appFunctionality === "standard"
                ? taskIdsForADay.length
                : uncheckedTaskIdsForADay.length
            } tasks remaining today.`, // (optional) default: "message" prop
            subText: "", // (optional) default: none
            bigPictureUrl: undefined, // (optional) default: undefined
            color: "#404040", // (optional) default: system default
            vibrate: true, // (optional) default: true
            vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
            ongoing: false, // (optional) set whether this is an "ongoing" notification
            priority: "high", // (optional) set notification priority, default: high
            visibility: "private", // (optional) set notification visibility, default: private
            importance: "high", // (optional) set notification importance, default: high
            allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
            ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
            onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
            invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

            /* iOS only properties */
            alertAction: "view", // (optional) default: view
            category: "", // (optional) default: empty string
            userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

            /* iOS and Android properties */
            title: `${theWeek[i]}'s Tasks`, // (optional)
            message: `You have ${
              appFunctionality === "standard"
                ? taskIdsForADay.length
                : uncheckedTaskIdsForADay.length
            } tasks remaining today.`, // (required)
            date: moment()
              .startOf("isoWeek")
              .add(1, "w")
              .add(i, "d")
              .add(reminderTimes[reminderTime], "h")
              .toDate(), // (required)
            playSound: true, // (optional) default: true
            soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
            repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
          });
        }
      } else {
        //Setting up two notifications here
        PushNotification.localNotificationSchedule({
          /* Android Only Properties */
          id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
          ticker: "My Notification Ticker", // (optional)
          showWhen: true, // (optional) default: true
          autoCancel: true, // (optional) default: true
          largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
          largeIconUrl: undefined, // (optional) default: undefined
          smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
          bigText: `You have ${uncheckedTaskIdsForADay.length} tasks remaining today.`, // (optional) default: "message" prop
          subText: "", // (optional) default: none
          bigPictureUrl: undefined, // (optional) default: undefined
          color: "#404040", // (optional) default: system default
          vibrate: true, // (optional) default: true
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
          ongoing: false, // (optional) set whether this is an "ongoing" notification
          priority: "high", // (optional) set notification priority, default: high
          visibility: "private", // (optional) set notification visibility, default: private
          importance: "high", // (optional) set notification importance, default: high
          allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
          ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
          onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
          invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

          /* iOS only properties */
          alertAction: "view", // (optional) default: view
          category: "", // (optional) default: empty string
          userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

          /* iOS and Android properties */
          title: `${theWeek[i]}'s Tasks`, // (optional)
          message: `You have ${uncheckedTaskIdsForADay.length} tasks remaining today.`, // (required)
          date: moment()
            .startOf("isoWeek")
            .add(i, "d")
            .add(reminderTimes[reminderTime], "h")
            .toDate(), // (required)
          playSound: true, // (optional) default: true
          soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        });

        PushNotification.localNotificationSchedule({
          /* Android Only Properties */
          id: delayedValidId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
          ticker: "My Notification Ticker", // (optional)
          showWhen: true, // (optional) default: true
          autoCancel: true, // (optional) default: true
          largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
          largeIconUrl: undefined, // (optional) default: undefined
          smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
          bigText: `You have ${
            appFunctionality === "standard"
              ? taskIdsForADay.length
              : uncheckedTaskIdsForADay.length
          } tasks remaining today.`, // (optional) default: "message" prop
          subText: "", // (optional) default: none
          bigPictureUrl: undefined, // (optional) default: undefined
          color: "#404040", // (optional) default: system default
          vibrate: true, // (optional) default: true
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
          ongoing: false, // (optional) set whether this is an "ongoing" notification
          priority: "high", // (optional) set notification priority, default: high
          visibility: "private", // (optional) set notification visibility, default: private
          importance: "high", // (optional) set notification importance, default: high
          allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
          ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
          onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
          invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

          /* iOS only properties */
          alertAction: "view", // (optional) default: view
          category: "", // (optional) default: empty string
          userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

          /* iOS and Android properties */
          title: `${theWeek[i]}'s Tasks`, // (optional)
          message: `You have ${
            appFunctionality === "standard"
              ? taskIdsForADay.length
              : uncheckedTaskIdsForADay.length
          } tasks remaining today.`, // (required)
          date: moment()
            .startOf("isoWeek")
            .add(1, "w")
            .add(i, "d")
            .add(reminderTimes[reminderTime], "h")
            .toDate(), // (required)
          playSound: true, // (optional) default: true
          soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
          repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
        });
      }
    }

    //Notifications prior to today, starting at the start of the week
    for (let i = 0; i < currentIndexBasedOfDay; i++) {
      let taskIdsForADay = await getAllTaskIdsForASingleDay(theWeek[i]);
      let uncheckedTaskIdsForADay = await getAllUncheckedTaskIdsForASingleDay(
        theWeek[i]
      );

      let validId = (id + i).toString();

      PushNotification.localNotificationSchedule({
        /* Android Only Properties */
        id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
        ticker: "My Notification Ticker", // (optional)
        showWhen: true, // (optional) default: true
        autoCancel: true, // (optional) default: true
        largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
        largeIconUrl: undefined, // (optional) default: undefined
        smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
        bigText: `You have ${
          appFunctionality === "standard"
            ? taskIdsForADay.length
            : uncheckedTaskIdsForADay.length
        } tasks remaining today.`, // (optional) default: "message" prop
        subText: "", // (optional) default: none
        bigPictureUrl: undefined, // (optional) default: undefined
        color: "#404040", // (optional) default: system default
        vibrate: true, // (optional) default: true
        vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        ongoing: false, // (optional) set whether this is an "ongoing" notification
        priority: "high", // (optional) set notification priority, default: high
        visibility: "private", // (optional) set notification visibility, default: private
        importance: "high", // (optional) set notification importance, default: high
        allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
        ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
        onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
        invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

        /* iOS only properties */
        alertAction: "view", // (optional) default: view
        category: "", // (optional) default: empty string
        userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

        /* iOS and Android properties */
        title: `${theWeek[i]}'s Tasks`, // (optional)
        message: `You have ${
          appFunctionality === "standard"
            ? taskIdsForADay.length
            : uncheckedTaskIdsForADay.length
        } tasks remaining today.`, // (required)
        date: moment()
          .startOf("isoWeek")
          .add(1, "w")
          .add(i, "d")
          .add(reminderTimes[reminderTime], "h")
          .toDate(), // (required)
        playSound: true, // (optional) default: true
        soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const removeDailyRepeatingNotifications = async (): Promise<void> => {
  //Completely depends on the IDs supplied for the createDailyRepeatingNotification function
  try {
    for (let i = 1000000; i < 1000014; i++) {
      let validId = i.toString();
      PushNotification.cancelLocalNotifications({ id: validId });
    }
  } catch (err) {
    console.log(err);
  }
};

const updateADailyRepeatingNotification = async (
  day: string
): Promise<void> => {
  try {
    const areDailyNotificationsEnabled = await getDailyUpdate();
    if (areDailyNotificationsEnabled === false) {
      return;
    }

    let appFunctionality = getAppFunctionality();

    const dayIndex = theWeekNumericalValues[day] - 1;
    let validId: string = (1000000 + dayIndex).toString();
    let delayedValidId: string = (1000007 + dayIndex).toString();

    //Id depends on what IDs are specified when creating the daily notifications.
    PushNotification.cancelLocalNotifications({ id: validId });
    PushNotification.cancelLocalNotifications({ id: delayedValidId });

    const taskIdsForADay = await getAllTaskIdsForASingleDay(day);
    const uncheckedTaskIdsForADay = await getAllUncheckedTaskIdsForASingleDay(
      day
    );
    const reminderTime = await getDailyUpdateTime();
    const currentDay = theWeekNumericalValues[moment().format("dddd")];
    const savedDay = theWeekNumericalValues[day];

    if (currentDay < savedDay) {
      //Setting up two notifications here
      PushNotification.localNotificationSchedule({
        /* Android Only Properties */
        id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
        ticker: "My Notification Ticker", // (optional)
        showWhen: true, // (optional) default: true
        autoCancel: true, // (optional) default: true
        largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
        largeIconUrl: undefined, // (optional) default: undefined
        smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
        bigText: `You have ${uncheckedTaskIdsForADay.length} tasks remaining today.`, // (optional) default: "message" prop
        subText: "", // (optional) default: none
        bigPictureUrl: undefined, // (optional) default: undefined
        color: "#404040", // (optional) default: system default
        vibrate: true, // (optional) default: true
        vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        ongoing: false, // (optional) set whether this is an "ongoing" notification
        priority: "high", // (optional) set notification priority, default: high
        visibility: "private", // (optional) set notification visibility, default: private
        importance: "high", // (optional) set notification importance, default: high
        allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
        ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
        onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
        invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

        /* iOS only properties */
        alertAction: "view", // (optional) default: view
        category: "", // (optional) default: empty string
        userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

        /* iOS and Android properties */
        title: `${day}'s Tasks`, // (optional)
        message: `You have ${uncheckedTaskIdsForADay.length} tasks remaining today.`, // (required)
        date: moment()
          .startOf("isoWeek")
          .add(dayIndex, "d")
          .add(reminderTimes[reminderTime], "h")
          .toDate(), // (required)
        playSound: true, // (optional) default: true
        soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      });

      PushNotification.localNotificationSchedule({
        /* Android Only Properties */
        id: delayedValidId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
        ticker: "My Notification Ticker", // (optional)
        showWhen: true, // (optional) default: true
        autoCancel: true, // (optional) default: true
        largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
        largeIconUrl: undefined, // (optional) default: undefined
        smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
        bigText: `You have ${
          appFunctionality === "standard"
            ? taskIdsForADay.length
            : uncheckedTaskIdsForADay.length
        } tasks remaining today.`, // (optional) default: "message" prop
        subText: "", // (optional) default: none
        bigPictureUrl: undefined, // (optional) default: undefined
        color: "#404040", // (optional) default: system default
        vibrate: true, // (optional) default: true
        vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        ongoing: false, // (optional) set whether this is an "ongoing" notification
        priority: "high", // (optional) set notification priority, default: high
        visibility: "private", // (optional) set notification visibility, default: private
        importance: "high", // (optional) set notification importance, default: high
        allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
        ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
        onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
        invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

        /* iOS only properties */
        alertAction: "view", // (optional) default: view
        category: "", // (optional) default: empty string
        userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

        /* iOS and Android properties */
        title: `${day}'s Tasks`, // (optional)
        message: `You have ${
          appFunctionality === "standard"
            ? taskIdsForADay.length
            : uncheckedTaskIdsForADay.length
        } tasks remaining today.`, // (required)
        date: moment()
          .startOf("isoWeek")
          .add(1, "w")
          .add(dayIndex, "d")
          .add(reminderTimes[reminderTime], "h")
          .toDate(), // (required)
        playSound: true, // (optional) default: true
        soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
      });
    } else if (currentDay > savedDay) {
      PushNotification.localNotificationSchedule({
        /* Android Only Properties */
        id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
        ticker: "My Notification Ticker", // (optional)
        showWhen: true, // (optional) default: true
        autoCancel: true, // (optional) default: true
        largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
        largeIconUrl: undefined, // (optional) default: undefined
        smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
        bigText: `You have ${
          appFunctionality === "standard"
            ? taskIdsForADay.length
            : uncheckedTaskIdsForADay.length
        } tasks remaining today.`, // (optional) default: "message" prop
        subText: "", // (optional) default: none
        bigPictureUrl: undefined, // (optional) default: undefined
        color: "#404040", // (optional) default: system default
        vibrate: true, // (optional) default: true
        vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        ongoing: false, // (optional) set whether this is an "ongoing" notification
        priority: "high", // (optional) set notification priority, default: high
        visibility: "private", // (optional) set notification visibility, default: private
        importance: "high", // (optional) set notification importance, default: high
        allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
        ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
        onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
        invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

        /* iOS only properties */
        alertAction: "view", // (optional) default: view
        category: "", // (optional) default: empty string
        userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

        /* iOS and Android properties */
        title: `${day}'s Tasks`, // (optional)
        message: `You have ${
          appFunctionality === "standard"
            ? taskIdsForADay.length
            : uncheckedTaskIdsForADay.length
        } tasks remaining today.`, // (required)
        date: moment()
          .startOf("isoWeek")
          .add(1, "w")
          .add(dayIndex, "d")
          .add(reminderTimes[reminderTime], "h")
          .toDate(), // (required)
        playSound: true, // (optional) default: true
        soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
      });
    } else if (currentDay === savedDay) {
      const currentTime = moment().format("H:mm A");
      const momentCurrenttime = moment(currentTime, "H:mm A");
      const momentReminderTime = moment(reminderTime, "H:mm A");

      if (momentCurrenttime.isBefore(momentReminderTime)) {
        //Setting up two reminders here
        PushNotification.localNotificationSchedule({
          /* Android Only Properties */
          id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
          ticker: "My Notification Ticker", // (optional)
          showWhen: true, // (optional) default: true
          autoCancel: true, // (optional) default: true
          largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
          largeIconUrl: undefined, // (optional) default: undefined
          smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
          bigText: `You have ${uncheckedTaskIdsForADay.length} tasks remaining today.`, // (optional) default: "message" prop
          subText: "", // (optional) default: none
          bigPictureUrl: undefined, // (optional) default: undefined
          color: "#404040", // (optional) default: system default
          vibrate: true, // (optional) default: true
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
          ongoing: false, // (optional) set whether this is an "ongoing" notification
          priority: "high", // (optional) set notification priority, default: high
          visibility: "private", // (optional) set notification visibility, default: private
          importance: "high", // (optional) set notification importance, default: high
          allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
          ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
          onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
          invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

          /* iOS only properties */
          alertAction: "view", // (optional) default: view
          category: "", // (optional) default: empty string
          userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

          /* iOS and Android properties */
          title: `${day}'s Tasks`, // (optional)
          message: `You have ${uncheckedTaskIdsForADay.length} tasks remaining today.`, // (required)
          date: moment()
            .startOf("isoWeek")
            .add(dayIndex, "d")
            .add(reminderTimes[reminderTime], "h")
            .toDate(), // (required)
          playSound: true, // (optional) default: true
          soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        });

        PushNotification.localNotificationSchedule({
          /* Android Only Properties */
          id: delayedValidId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
          ticker: "My Notification Ticker", // (optional)
          showWhen: true, // (optional) default: true
          autoCancel: true, // (optional) default: true
          largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
          largeIconUrl: undefined, // (optional) default: undefined
          smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
          bigText: `You have ${
            appFunctionality === "standard"
              ? taskIdsForADay.length
              : uncheckedTaskIdsForADay.length
          } tasks remaining today.`, // (optional) default: "message" prop
          subText: "", // (optional) default: none
          bigPictureUrl: undefined, // (optional) default: undefined
          color: "#404040", // (optional) default: system default
          vibrate: true, // (optional) default: true
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
          ongoing: false, // (optional) set whether this is an "ongoing" notification
          priority: "high", // (optional) set notification priority, default: high
          visibility: "private", // (optional) set notification visibility, default: private
          importance: "high", // (optional) set notification importance, default: high
          allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
          ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
          onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
          invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

          /* iOS only properties */
          alertAction: "view", // (optional) default: view
          category: "", // (optional) default: empty string
          userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

          /* iOS and Android properties */
          title: `${day}'s Tasks`, // (optional)
          message: `You have ${
            appFunctionality === "standard"
              ? taskIdsForADay.length
              : uncheckedTaskIdsForADay.length
          } tasks remaining today.`, // (required)
          date: moment()
            .startOf("isoWeek")
            .add(1, "w")
            .add(dayIndex, "d")
            .add(reminderTimes[reminderTime], "h")
            .toDate(), // (required)
          playSound: true, // (optional) default: true
          soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
          repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
        });
      } else {
        PushNotification.localNotificationSchedule({
          /* Android Only Properties */
          id: validId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
          ticker: "My Notification Ticker", // (optional)
          showWhen: true, // (optional) default: true
          autoCancel: true, // (optional) default: true
          largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
          largeIconUrl: undefined, // (optional) default: undefined
          smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
          bigText: `You have ${
            appFunctionality === "standard"
              ? taskIdsForADay.length
              : uncheckedTaskIdsForADay.length
          } tasks remaining today.`, // (optional) default: "message" prop
          subText: "", // (optional) default: none
          bigPictureUrl: undefined, // (optional) default: undefined
          color: "#404040", // (optional) default: system default
          vibrate: true, // (optional) default: true
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
          ongoing: false, // (optional) set whether this is an "ongoing" notification
          priority: "high", // (optional) set notification priority, default: high
          visibility: "private", // (optional) set notification visibility, default: private
          importance: "high", // (optional) set notification importance, default: high
          allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
          ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
          onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
          invokeApp: false, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

          /* iOS only properties */
          alertAction: "view", // (optional) default: view
          category: "", // (optional) default: empty string
          userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)

          /* iOS and Android properties */
          title: `${day}'s Tasks`, // (optional)
          message: `You have ${
            appFunctionality === "standard"
              ? taskIdsForADay.length
              : uncheckedTaskIdsForADay.length
          } tasks remaining today.`, // (required)
          date: moment()
            .startOf("isoWeek")
            .add(1, "w")
            .add(dayIndex, "d")
            .add(reminderTimes[reminderTime], "h")
            .toDate(), // (required)
          playSound: true, // (optional) default: true
          soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
          repeatType: "week", // (optional) Repeating interval. Check 'Repeating Notifications' section for more info.
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const removingAllTasksNotifications = async (): Promise<void> => {
  try {
    for (let day of theWeek) {
      let taskIdArray = await getAllTaskIdsForASingleDay(day);
      //Make parallel later
      taskIdArray.forEach(async (taskId: number) => {
        await removeALocalScheduledNotification(taskId);
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const addingAllTasksNotifications = async (): Promise<void> => {
  try {
    const currentDay = moment().format("dddd");
    const currentIndexBasedOffDay = theWeek.indexOf(currentDay);

    for (let i = currentIndexBasedOffDay; i < theWeek.length; i++) {
      let uncheckedTaskIdsArray = await getAllUncheckedTaskIdsForASingleDay(
        theWeek[i]
      );
      let checkedTaskIdsArray = await getAllCheckedTaskIdsForASingleDay(
        theWeek[i]
      );

      uncheckedTaskIdsArray.forEach(async (taskId: number) => {
        await addARepeatingLocalNotification(taskId);
      });

      checkedTaskIdsArray.forEach(async (taskId: number) => {
        await addARepeatingLocalNotification(taskId, 1);
      });
    }

    for (let i = 0; i < currentIndexBasedOffDay; i++) {
      let taskIdsArray = await getAllTaskIdsForASingleDay(theWeek[i]);
      taskIdsArray.forEach(async (taskId: number) => {
        await addARepeatingLocalNotification(taskId, 1);
      });
    }

    //Update daily repeating notification
    const dailyUpdateTime = await getDailyUpdateTime();
    await createDailyRepeatingNotification(dailyUpdateTime);
  } catch (err) {
    console.log(err);
  }
};

const setApplicationIconBadgeNumber = (number: number): void => {
  try {
    PushNotification.setApplicationIconBadgeNumber(number);
  } catch (err) {
    console.log(err);
  }
};

const removeDeliveredNotifications = () => {
  PushNotificationIOS.removeAllDeliveredNotifications();
};

export {
  configure,
  testLocalNotifications,
  addARepeatingLocalNotification,
  checkingATaskNotification,
  removeALocalScheduledNotification,
  removeAllLocalNotifications,
  setApplicationIconBadgeNumber,
  removeDeliveredNotifications,
  createDailyRepeatingNotification,
  removeDailyRepeatingNotifications,
  updateADailyRepeatingNotification,
  removingAllTasksNotifications,
  addingAllTasksNotifications,
};
