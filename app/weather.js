import { showNumber } from "./utils/showNumber";
import { default as settings } from "./settings";
import el from "./html/elements";

export function setWeather(data = settings.weather) {
  if (0 === Object.keys(data).length) {
    return;
  }
  
  settings.saveWeather(data);
  
  el.weather.image = `images/weather/${data.weather_image}.png`;
  
  /////////// TEMPERATURE ///////////
  let temp_position = 190;
  let temp_indent = 20;
  if (data.temperature < 0) {
    el.minus.style.display = "inline";
    el.minus.x = temp_position;
    temp_position += temp_indent;
    data.temperature *= -1;
  }
  else {
    el.minus.style.display = "none";
  }

  temp_position = showNumber(
    data.temperature,
    el.temp,
    temp_position,
    temp_indent,
    settings.data().foreground
  );

  el.degree.x = temp_position;
  temp_position += temp_indent;
  el.scale.image = `fonts/rgb/${settings.data().foreground}/${data.scale}.png`;
  el.scale.x = temp_position;
  ///////////////////////////////////

  //////////// HUMIDITY /////////////
  let humidity_position = 210;
  let humidity_indent = 20;
  humidity_position = showNumber(
    data.humidity,
    el.humidity,
    humidity_position,
    humidity_indent,
    settings.data().foreground
  );
  el.percentage.x = humidity_position;
  ///////////////////////////////////
}