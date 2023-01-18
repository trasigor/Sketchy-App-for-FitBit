import { battery, charger } from "power";
import el from "./html/elements";
import { default as settings } from "./settings";

battery.onchange = function(){update()};
charger.onchange = function(){update()};

export function update () {
  if (settings.data().battery_show && !charger.connected) {
    let chargeLevel = Math.ceil(battery.chargeLevel/5);
    let color = "#00a629";
    if (chargeLevel <= 8) {
      color = "#fc6b3a";
    }
    if (chargeLevel <= 4) {
      color = "#f83c40";
    }

    el.battery_fill.style.fill = color;
    el.battery_fill.width = chargeLevel;
    el.battery_fill.style.display = "inline";
    el.battery_body.style.display = "inline";
  }
  
  if (settings.data().battery_show && 8 >= battery.chargeLevel || !settings.data().battery_show || charger.connected) {
    el.battery_body.style.display = "none";
    el.battery_fill.style.display = "none";
  }
}