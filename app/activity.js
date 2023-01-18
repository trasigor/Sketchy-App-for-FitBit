import { me as appbit } from "appbit";
import { display } from "display";
import { today } from "user-activity";
import { units } from "user-settings";
import el from "./html/elements";
import { default as settings } from "./settings";
import { showNumber } from "./utils/showNumber";

let watchID;
let lastReading = 0;
let heartRate;

function getReading() {
  if (undefined === today.local.elevationGain) {
    drawData({
      steps: (today.adjusted.steps || 0),
      calories: (today.adjusted.calories || 0),
      distance: (today.adjusted.distance || 0),
      activeZoneMinutes: (today.adjusted.activeZoneMinutes.total || 0)
    });
  } else {
    drawData({
      steps: (today.adjusted.steps || 0),
      calories: (today.adjusted.calories || 0),
      distance: (today.adjusted.distance || 0),
      elevationGain: (today.adjusted.elevationGain || 0),
      activeZoneMinutes: (today.adjusted.activeZoneMinutes.total || 0)
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

function drawData(data) {
  let indent = 18;
  let start_position = 58;
  if (data.steps>=100000 || data.calories>=100000 || data.distance>=10000 || data.activeZoneMinutes>=600) {
    start_position = 38;
  }
  
  el.statsCycleItems.forEach((item, index) => {
    let img = item.firstChild;
    let numberArr = [];
    let digit = img.nextSibling;
    let position = start_position;
    
    img.x = position - 28;
    
    if (
      -1 !== item.class.indexOf("steps") ||
      -1 !== item.class.indexOf("calories") ||
      -1 !== item.class.indexOf("floors")
    ) {
      do {
        numberArr.push(digit);
      } while(digit = digit.nextSibling);
      
      showNumber(data[Object.keys(data)[index]], numberArr, position, indent, settings.data().foreground);
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

      position = showNumber(integer, el.distance_int_part, position, indent, settings.data().foreground);
      el.distance_dot.x = position;
      position += 6;
      if (float < 10) {
        el.distance_float_part[0].image = `fonts/rgb/${settings.data().foreground}/digits/0.png`;
        el.distance_float_part[0].x = position;
        position += indent;
      }
      position = showNumber(float, el.distance_float_part, position, indent, settings.data().foreground);
      if (float < 10) {
        el.distance_float_part[0].style.display = "inline";
      }
      el.distance_unit.x = position;
      el.distance_unit.image = `fonts/rgb/${settings.data().foreground}/${u}.png`;
    }
    else if (-1 !== item.class.indexOf("active-zone-minutes")) {
      let hours = Math.floor(data["activeZoneMinutes"]/60);
      let minutes = data["activeZoneMinutes"]%60;
      
      if (hours <= 0) {
        el.activity_h_digits[0].style.display = "none";
        el.activity_h_digits[1].style.display = "none";
        el.activity_h.style.display = "none";
      }
      else {
        position = showNumber(hours, el.activity_h_digits, position, indent, settings.data().foreground);
        el.activity_h.style.display = "inline";
        el.activity_h.x = position;
        position += 18;
      }
      
      position = showNumber(minutes, el.activity_m_digits, position, indent, settings.data().foreground);
      el.activity_m.x = position;
    }
  });
}

export function initialize() {
  if (appbit.permissions.granted("access_activity")) {
    setupEvents();
    start();
  } else {
    console.log("Denied User Activity permission");
    if (undefined === today.local.elevationGain) {
      drawData({
        steps: 0,
        calories: 0,
        distance: 0,
        activeZoneMinutes: 0
      });
    } else {
      drawData({
        steps: 0,
        calories: 0,
        distance: 0,
        elevationGain: 0,
        activeZoneMinutes: 0
      });
    }
  }
}