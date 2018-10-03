import { me } from "appbit";
import { display } from "display";
import { today } from "user-activity";

let watchID, activityCallback;
let lastReading = 0;
let heartRate;

export function initialize(callback) {
  if (me.permissions.granted("access_activity")) {
    activityCallback = callback;
    setupEvents();
    start();
  } else {
    console.log("Denied User Activity permission");
    activityCallback({
      steps: 0,
      calories: 0,
      distance: 0,
      elevationGain: 0,
      activeMinutes: 0
    });
  }
}

function getReading() {
  activityCallback({
    steps: (today.adjusted.steps || 0),
    calories: (today.adjusted.calories || 0),
    distance: (today.adjusted.distance || 0),
    elevationGain: (today.adjusted.elevationGain || 0),
    activeMinutes: (today.adjusted.activeMinutes || 0)
  });
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