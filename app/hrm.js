import { me } from "appbit";
import { display } from "display";
import { HeartRateSensor } from "heart-rate";
import { user } from "user-profile";
import el from "./html/elements";
import { default as settings } from "./settings";
import { showNumber } from "./utils/showNumber";

let hrm, watchID;
let lastReading = 0;
let heartRate;

function getReading() {
  if (hrm.timestamp === lastReading) {
    heartRate = "--";
  } else {
    heartRate = hrm.heartRate;
  }
  lastReading = hrm.timestamp;
  drawData({
    bpm: heartRate,
    zone: user.heartRateZone(hrm.heartRate || 0),
    restingHeartRate: user.restingHeartRate
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
    hrm.start();
    getReading();
    watchID = setInterval(getReading, 1000);
  }
}

function stop() {
  hrm.stop();
  clearInterval(watchID);
  watchID = null;
}

function drawData(data) {
  if ("--" === data.bpm || "???" === data.bpm || null === data.bpm) {
    el.hrm[0].image = `fonts/rgb/${settings.data().foreground}/minus.png`;
    el.hrm[0].style.display = "inline";
    el.hrm[0].x = 28;
    el.hrm[1].image = `fonts/rgb/${settings.data().foreground}/minus.png`;
    el.hrm[1].style.display = "inline";
    el.hrm[1].x = 46;
    el.hrm[2].style.display = "none";
  }
  else {
    let hrm_position = 28;
    let hrm_indent = 18;
    showNumber(data.bpm, el.hrm, hrm_position, hrm_indent, settings.data().foreground);
    el.iconHRM.animate("highlight");
  }
  
  if (data.zone === "out-of-range") {
    el.imgHRM.href = "images/heart_open.png";
  } else {
    el.imgHRM.href = "images/heart_solid.png";
  }
}

export function initialize() {
  if (me.permissions.granted("access_heart_rate") && me.permissions.granted("access_user_profile")) {
    hrm = new HeartRateSensor();
    setupEvents();
    start();
    lastReading = hrm.timestamp;
  } else {
    console.log("Denied Heart Rate or User Profile permissions");
    callback({
      bpm: "???",
      zone: "denied",
      restingHeartRate: "???"
    });
  }
}