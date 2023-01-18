import el from "./elements";
import { setWeather } from "../weather";
import { default as settings } from "../settings";

// Apply theme colors to elements
export function applyTheme(
  background = settings.data().background,
  foreground = settings.data().foreground
) {
  settings.setColors(background, foreground);
  
  // Update elements //
  el.background.style.fill = background;
  
  el.separator.image = `fonts/rgb/${foreground}/separator.png`;
  
  el.hours1.image = el.hours1.image.replace(background, foreground);
  el.hours2.image = el.hours2.image.replace(background, foreground);
  el.mins1.image = el.mins1.image.replace(background, foreground);
  el.mins2.image = el.mins2.image.replace(background, foreground);
  
  el.month.image = el.month.image.replace(background, foreground);
  el.date1.image = el.date1.image.replace(background, foreground);
  el.date2.image = el.date2.image.replace(background, foreground);
  el.day.image = el.day.image.replace(background, foreground);
  
  el.minus.image = `fonts/rgb/${foreground}/minus.png`;
  el.temp.forEach((item, index) => {
    item.image = item.image.replace(background, foreground);
  });
  el.degree.image = `fonts/rgb/${foreground}/degree.png`;
  el.scale.image = el.scale.image.replace(background, foreground);
  
  el.humidity_icon.image = `fonts/rgb/${foreground}/humidity.png`;
  el.humidity.forEach((item, index) => {
    item.image = item.image.replace(background, foreground);
  });
  el.percentage.image = `fonts/rgb/${foreground}/percentage.png`;
  
  el.hrm.forEach((item, index) => {
    item.image = item.image.replace(background, foreground);
  });
  
  el.statsCycleItems.forEach((item, index) => {
    let item = item.firstChild.nextSibling;
    do {
      item.image = item.image.replace(background, foreground);
    } while(item = item.nextSibling);
  });
  
  setWeather();
  
  el.battery_body.style.fill = foreground;
  /////////////////////
}
