import { today } from "user-activity";
import document from "document";

const el = {
  background: document.getElementById("background"),
  
  // TIME
  separator: document.getElementById("separator"),
  hours1: document.getElementById("hours1"),
  hours2: document.getElementById("hours2"),
  mins1: document.getElementById("mins1"),
  mins2: document.getElementById("mins2"),

  // DATE
  month: document.getElementById("month"),
  date1: document.getElementById("date1"),
  date2: document.getElementById("date2"),
  day: document.getElementById("day"),

  // WEATHER
  weather: document.getElementById("weather"),

  // TEMPERATURE
  minus: document.getElementById("minus"),
  temp: [
    document.getElementById("temp1"),
    document.getElementById("temp2"),
    document.getElementById("temp3")
  ],
  degree: document.getElementById("degree"),
  scale: document.getElementById("scale"),

  // HUMIDITY
  humidity_icon: document.getElementById("humidity"),
  humidity: [
    document.getElementById("humidity1"),
    document.getElementById("humidity2"),
    document.getElementById("humidity3"),
  ],
  percentage: document.getElementById("percentage"),

  // HRM
  iconHRM: document.getElementById("iconHRM"),
  hrm: [
    document.getElementById("hrm1"),
    document.getElementById("hrm2"),
    document.getElementById("hrm3"),
  ],

  // ACTIVITY
  statsCycle: undefined === today.local.elevationGain
    ? document.getElementById("stats-cycle")
    : document.getElementById("stats-cycle-with-elevation"),
  
  battery_body: document.getElementById("battery-body"),
  battery_fill: document.getElementById("battery-fill"),
};

// HRM
el.imgHRM = el.iconHRM.getElementById("icon");

// ACTIVITY
el.statsCycleItems = el.statsCycle.getElementsByClassName("cycle-item");

el.distance_int_part = [
  el.statsCycle.getElementById("distance_int1"),
  el.statsCycle.getElementById("distance_int2"),
  el.statsCycle.getElementById("distance_int3"),
];
el.distance_float_part = [
  el.statsCycle.getElementById("distance_float1"),
  el.statsCycle.getElementById("distance_float2"),
];
el.distance_dot = el.statsCycle.getElementById("distance_dot");
el.distance_unit = el.statsCycle.getElementById("distance_unit");

el.activity_h_digits = [
  el.statsCycle.getElementById("activity_h1"),
  el.statsCycle.getElementById("activity_h2"),
];
el.activity_h = el.statsCycle.getElementById("activity_h");
el.activity_m_digits = [
  el.statsCycle.getElementById("activity_m1"),
  el.statsCycle.getElementById("activity_m2"),
];
el.activity_m = el.statsCycle.getElementById("activity_m");

if (undefined === today.local.elevationGain) {
  document.getElementsByClassName("stats-cycle-with-elevation").forEach((item, index) => {
    item.class = "hide";
  });
}
else {
  document.getElementsByClassName("stats-cycle").forEach((item, index) => {
    item.class = "hide";
  });
}

export default el;