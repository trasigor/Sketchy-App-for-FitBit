import { me as appbit } from "appbit";
import { me as device } from "device";
import { display } from "display";
import { today } from "user-activity";

let watchID, activityCallback;
let lastReading = 0;
let heartRate;

export function initialize(callback) {
  if (appbit.permissions.granted("access_activity")) {
    activityCallback = callback;
    setupEvents();
    start();
  } else {
    console.log("Denied User Activity permission");
    if (-1 !== device.modelName.indexOf("Versa Lite")) {
      activityCallback({
        steps: 0,
        calories: 0,
        distance: 0,
        activeMinutes: 0
      });
    } else {
      activityCallback({
        steps: 0,
        calories: 0,
        distance: 0,
        elevationGain: 0,
        activeMinutes: 0
      });
    }
  }
}

function getReading() {
  if (-1 !== device.modelName.indexOf("Versa Lite")) {
    activityCallback({
      steps: (today.adjusted.steps || 0),
      calories: (today.adjusted.calories || 0),
      distance: (today.adjusted.distance || 0),
      activeMinutes: (today.adjusted.activeMinutes || 0)
    });
  } else {
    activityCallback({
      steps: (today.adjusted.steps || 0),
      calories: (today.adjusted.calories || 0),
      distance: (today.adjusted.distance || 0),
      elevationGain: (today.adjusted.elevationGain || 0),
      activeMinutes: (today.adjusted.activeMinutes || 0)
    });
  }
}

function setupEvents() {
  display.addEventListener("change", function() {
    if (display.on) {
      start();
    } else {
      stop();
    }
  });
}

function start() {
  if (!watchID) {
    getReading();
    watchID = setInterval(getReading, 1000);
  }
}

function stop() {
  clearInterval(watchID);
  watchID = null;
}