import { preferences } from "user-settings";
import el from "./html/elements";
import { default as settings } from "./settings";
import { zeroPad } from "./utils/zeroPad";

let month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function drawDigit(val, place) {
  place.image = `fonts/rgb/${settings.data().foreground}/digits/${val}.png`;
}

function getMonthImg(index) {
  return `fonts/rgb/${settings.data().foreground}/month/${month[index]}.png`;
}

function getDayImg(index) {
  return `fonts/rgb/${settings.data().foreground}/day_of_the_week/${days[index]}.png`;
}

function setMins(val) {
  val = zeroPad(val);
  drawDigit(Math.floor(val / 10), el.mins1);
  drawDigit(Math.floor(val % 10), el.mins2);
}

function setHours(val) {
  if (preferences.clockDisplay === "12h") {
    // 12h format
    val = val % 12 || 12;
  } else {
    // 24h format
    val = zeroPad(val);
  }
  
  drawDigit(Math.floor(val / 10), el.hours1);
  drawDigit(Math.floor(val % 10), el.hours2);
}

function setDay(val) {
  el.day.image = getDayImg(val);
}

function setDate(val) {
  if (0 === Math.floor(val / 10)) {
    el.month.x = 73;
    el.date1.style.display = "none";
    drawDigit(Math.floor(val % 10), el.date2);
  }
  else {
    el.month.x = 53;
    el.date1.style.display = "inline";
    drawDigit(Math.floor(val / 10), el.date1);
    drawDigit(Math.floor(val % 10), el.date2);
  }
}

function setMonth(val) {
  el.month.image = getMonthImg(val);
}

export function setTime(d) {
  setMonth(d.getMonth());
  setDate(d.getDate());
  setDay(d.getDay());
  setHours(d.getHours());
  setMins(d.getMinutes());
}