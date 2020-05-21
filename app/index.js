import { me as appbit } from "appbit";
import { me as device } from "device";
import clock from "clock";
import document from "document";
import * as fs from "fs";
import * as messaging from "messaging";
import { preferences, units } from "user-settings";
import * as util from "../common/utils";
import * as HRM from "./hrm";
import * as activity from "./activity";
import { battery, charger } from "power";

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

// TIME
let separator = document.getElementById("separator");
let hours1 = document.getElementById("hours1");
let hours2 = document.getElementById("hours2");
let mins1 = document.getElementById("mins1");
let mins2 = document.getElementById("mins2");

// DATE
let month = document.getElementById("month");
let date1 = document.getElementById("date1");
let date2 = document.getElementById("date2");
let day = document.getElementById("day");

// WEATHER
let weather = document.getElementById("weather");

// TEMPERATURE
let minus = document.getElementById("minus");
let temp = [
  document.getElementById("temp1"),
  document.getElementById("temp2"),
  document.getElementById("temp3")
];
let degree = document.getElementById("degree");
let scale = document.getElementById("scale");

// HUMIDITY
let humidity_icon = document.getElementById("humidity");
let humidity = [
  document.getElementById("humidity1"),
  document.getElementById("humidity2"),
  document.getElementById("humidity3"),
]
let percentage = document.getElementById("percentage");

let lastWeatherUpdate = 0;

let iconHRM = document.getElementById("iconHRM");
let imgHRM = iconHRM.getElementById("icon");
let hrm = [
  document.getElementById("hrm1"),
  document.getElementById("hrm2"),
  document.getElementById("hrm3"),
];

let statsCycle = document.getElementById("stats-cycle");
if (-1 !== device.modelName.indexOf("Versa Lite")) {
  statsCycle = document.getElementById("stats-cycle-VersaLite");
}
let statsCycleItems = statsCycle.getElementsByClassName("cycle-item");

let distance_int_part = [
  statsCycle.getElementById("distance_int1"),
  statsCycle.getElementById("distance_int2"),
  statsCycle.getElementById("distance_int3"),
];
let distance_float_part = [
  statsCycle.getElementById("distance_float1"),
  statsCycle.getElementById("distance_float2"),
];
let distance_dot = statsCycle.getElementById("distance_dot");
let distance_unit = statsCycle.getElementById("distance_unit");

let activity_h_digits = [
  statsCycle.getElementById("activity_h1"),
  statsCycle.getElementById("activity_h2"),
];
let activity_h = statsCycle.getElementById("activity_h");
let activity_m_digits = [
  statsCycle.getElementById("activity_m1"),
  statsCycle.getElementById("activity_m2"),
];
let activity_m = statsCycle.getElementById("activity_m");

let battery_body = document.getElementById("battery-body");
let battery_fill = document.getElementById("battery-fill");

if (-1 !== device.modelName.indexOf("Versa Lite")) {
  document.getElementsByClassName("hideOnVersaLite").forEach((item, index) => {
    item.class = "hide";
  });
}
else {
  document.getElementsByClassName("showOnVersaLite").forEach((item, index) => {
    item.class = "hide";
  });
}

let settings = loadSettings();
if (undefined === settings.background || undefined === settings.foreground) {
  settings.background = "black";
  settings.foreground = "white";
}
applyTheme(settings.background, settings.foreground);

clock.granularity = "seconds";

clock.ontick = evt => {
  let d = evt.date;

  // MONTH NAME
  setMonth(d.getMonth());

  // DATE
  setDate(d.getDate());

  // DAY NAME
  setDay(d.getDay());

  // HOURS
  let hours = d.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  setHours(hours);

  // MINUTES
  let minute = util.zeroPad(d.getMinutes());
  setMins(minute);
  
  if (d.getTime() > lastWeatherUpdate+1800000 && messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send("updateWeather");
    lastWeatherUpdate = d.getTime();
  }
}

// Apply theme colors to elements
function applyTheme(background, foreground) {
  let items = document.getElementsByClassName("background");
  items.forEach(function(item) {
    item.style.fill = background;
  });
  
  settings.background = background;
  settings.foreground = foreground;
  
  // Update elements //
  separator.image = `fonts/rgb/${settings.foreground}/separator.png`;
  
  hours1.image = hours1.image.replace(background, foreground);
  hours2.image = hours2.image.replace(background, foreground);
  mins1.image = mins1.image.replace(background, foreground);
  mins2.image = mins2.image.replace(background, foreground);
  
  month.image = month.image.replace(background, foreground);
  date1.image = date1.image.replace(background, foreground);
  date2.image = date2.image.replace(background, foreground);
  day.image = day.image.replace(background, foreground);
  
  minus.image = `fonts/rgb/${settings.foreground}/minus.png`;
  degree.image = `fonts/rgb/${settings.foreground}/degree.png`;
  
  humidity_icon.image = `fonts/rgb/${settings.foreground}/humidity.png`;
  percentage.image = `fonts/rgb/${settings.foreground}/percentage.png`;
  
  hrm[0].image = hrm[0].image.replace(background, foreground);
  hrm[1].image = hrm[1].image.replace(background, foreground);
  hrm[2].image = hrm[2].image.replace(background, foreground);
  
  statsCycleItems.forEach((item, index) => {
    let item = item.firstChild.nextSibling;
    do {
      item.image = item.image.replace(background, foreground);
    } while(item = item.nextSibling);
  });
  
  if (undefined !== settings.weather) {
    updateWeather(settings.weather);
  }
  
  battery_body.style.fill = foreground;
  /////////////////////
}

function updateWeather(data) {
  weather.image = `images/weather/${data.weather_image}.png`;
  
  /////////// TEMPERATURE ///////////
  let temp_position = 190;
  let temp_indent = 20;
  if (data.temperature < 0) {
    minus.style.display = "inline";
    minus.x = temp_position;
    temp_position += temp_indent;
    data.temperature *= -1;
  }
  else {
    minus.style.display = "none";
  }

  temp_position = util.showNumber(data.temperature, temp, temp_position, temp_indent, settings.foreground);

  degree.x = temp_position;
  temp_position += temp_indent;
  scale.image = `fonts/rgb/${settings.foreground}/${data.scale}.png`;
  scale.x = temp_position;
  ///////////////////////////////////

  //////////// HUMIDITY /////////////
  let humidity_position = 210;
  let humidity_indent = 20;
  humidity_position = util.showNumber(data.humidity, humidity, humidity_position, humidity_indent, settings.foreground);
  percentage.x = humidity_position;
  ///////////////////////////////////
}

function setHours(val) {
  //if (val > 9 || preferences.clockDisplay === "24h") {
    drawDigit(Math.floor(val / 10), hours1);
  //} else {
  //  drawDigit("", hours1);
  //}
  drawDigit(Math.floor(val % 10), hours2);
}

function setMins(val) {
  drawDigit(Math.floor(val / 10), mins1);
  drawDigit(Math.floor(val % 10), mins2);
}

function setMonth(val) {
  month.image = getMonthImg(val);
}

function setDate(val) {
  if (0 === Math.floor(val / 10)) {
    month.x = 73;
    date1.style.display = "none";
    drawDigit(Math.floor(val % 10), date2);
  }
  else {
    month.x = 53;
    date1.style.display = "inline";
    drawDigit(Math.floor(val / 10), date1);
    drawDigit(Math.floor(val % 10), date2);
  }
}

function setDay(val) {
  day.image = getDayImg(val);
}

function drawDigit(val, place) {
  place.image = `fonts/rgb/${settings.foreground}/digits/${val}.png`;
}

function getMonthImg(index) {
  let month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  return `fonts/rgb/${settings.foreground}/month/${month[index]}.png`;
}

function getDayImg(index) {
  let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return `fonts/rgb/${settings.foreground}/day_of_the_week/${days[index]}.png`;
}

/* -------- HRM ------------- */
function hrmCallback(data) {
  if ("--" === data.bpm || "???" === data.bpm || null === data.bpm) {
    hrm[0].image = `fonts/rgb/${settings.foreground}/minus.png`;
    hrm[0].style.display = "inline";
    hrm[0].x = 28;
    hrm[1].image = `fonts/rgb/${settings.foreground}/minus.png`;
    hrm[1].style.display = "inline";
    hrm[1].x = 46;
    hrm[2].style.display = "none";
  }
  else {
    let hrm_position = 28;
    let hrm_indent = 18;
    util.showNumber(data.bpm, hrm, hrm_position, hrm_indent, settings.foreground);
    iconHRM.animate("highlight");
  }
  
  if (data.zone === "out-of-range") {
    imgHRM.href = "images/heart_open.png";
  } else {
    imgHRM.href = "images/heart_solid.png";
  }
}

HRM.initialize(hrmCallback);
/* -------------------------- */

/* ------- ACTIVITY --------- */
function activityCallback(data) {
  let indent = 18;
  let start_position = 58;
  if (data.steps>=100000 || data.calories>=100000 || data.distance>=10000 || data.activeMinutes>=600) {
    start_position = 38;
  }
  
  statsCycleItems.forEach((item, index) => {
    let img = item.firstChild;
    let numberArr = [];
    let digit = img.nextSibling;
    let position = start_position;
    
    img.x = position - 28;
    
    if (-1 !== item.class.indexOf("steps") || -1 !== item.class.indexOf("calories") || -1 !== item.class.indexOf("floors")) {
      do {
        numberArr.push(digit);
      } while(digit = digit.nextSibling);
      
      util.showNumber(data[Object.keys(data)[index]], numberArr, position, indent, settings.foreground);
    }
    else if (-1 !== item.class.indexOf("distance")) {
      let val = data["distance"];
      let u = "km";
      if(units.distance === "us") {
        val *= 0.621371;
        u = "mi";
      }
      let integer = Math.floor(val / 1000);
      let float = Math.floor((val % 1000) / 10);

      position = util.showNumber(integer, distance_int_part, position, indent, settings.foreground);
      distance_dot.x = position;
      position += 6;
      if (float < 10) {
        distance_float_part[0].image = `fonts/rgb/${settings.foreground}/digits/0.png`;
        distance_float_part[0].x = position;
        position += indent;
      }
      position = util.showNumber(float, distance_float_part, position, indent, settings.foreground);
      if (float < 10) {
        distance_float_part[0].style.display = "inline";
      }
      distance_unit.x = position;
      distance_unit.image = `fonts/rgb/${settings.foreground}/${u}.png`;
    }
    else if (-1 !== item.class.indexOf("active-minutes")) {
      let hours = Math.floor(data["activeMinutes"]/60);
      let minutes = data["activeMinutes"]%60;
      
      if (hours <= 0) {
        activity_h_digits[0].style.display = "none";
        activity_h_digits[1].style.display = "none";
        activity_h.style.display = "none";
      }
      else {
        position = util.showNumber(hours, activity_h_digits, position, indent, settings.foreground);
        activity_h.style.display = "inline";
        activity_h.x = position;
        position += 18;
      }
      
      position = util.showNumber(minutes, activity_m_digits, position, indent, settings.foreground);
      activity_m.x = position;
    }
  });
}

activity.initialize(activityCallback);
/* -------------------------- */

/* ------- BATTERY --------- */
function batteryUpdate () {
  if (settings.battery_show && !charger.connected) {
    let chargeLevel = Math.ceil(battery.chargeLevel/5);
    let color = "#00a629";
    if (chargeLevel <= 8) {
      color = "#fc6b3a";
    }
    if (chargeLevel <= 4) {
      color = "#f83c40";
    }

    battery_fill.style.fill = color;
    battery_fill.width = chargeLevel;
    battery_fill.style.display = "inline";
    battery_body.style.display = "inline";
  }
  
  if (settings.battery_show && 8 >= battery.chargeLevel || !settings.battery_show || charger.connected) {
    battery_body.style.display = "none";
    battery_fill.style.display = "none";
  }
}

batteryUpdate();
battery.onchange = function(){batteryUpdate()};
charger.onchange = function(){batteryUpdate()};
/* ------------------------- */

// Listen for the onmessage event
messaging.peerSocket.onmessage = evt => {
  if ("weather" === evt.data.key) {
    if (evt.data.error) {
      // check weather in 5 minutes
      console.log("Weather answer error, re-try in 5 minutes.");
      lastWeatherUpdate -= 1500000;
    }
    else {
      settings.weather = evt.data;
      updateWeather(evt.data);
    }
  }
  else if ("theme" === evt.data.key) {
    applyTheme(evt.data.background, evt.data.foreground);
  }
  else if ("battery_show" === evt.data.key) {
    settings.battery_show = (0 === evt.data.value.localeCompare("true")) ? true : false;
    batteryUpdate();
  }
  else {
    console.log("else message");
    console.log(JSON.stringify(evt));
  }
}

// Register for the unload event
appbit.onunload = saveSettings;

function loadSettings() {
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    // Defaults
    return {
    }
  }
}

function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}
