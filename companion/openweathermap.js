import { settingsStorage } from "settings";

export function OpenWeatherMapAPI(){};

OpenWeatherMapAPI.prototype.getData = function(pos) {
  return getWeather(pos);
}

function getWeather(pos) {
  let scale = "f";
  let temperature_scale = "imperial";
  let settings_temperature = JSON.parse(settingsStorage.getItem("temperature_scale"));
  if (settings_temperature && settings_temperature.values[0].value) {
    if (!settings_temperature.values[0].value.localeCompare("c")) {
      scale = "c";
      temperature_scale = "metric";
    }
  }

  // Construct URL
  let urlCurrent = "",
      urlMain = "https://api.openweathermap.org/data/2.5/";
  let locationFound = JSON.parse(settingsStorage.getItem("location_found"));
  if (locationFound && locationFound.name) {
    urlCurrent = urlMain + "weather?q=" + encodeURIComponent(JSON.parse(settingsStorage.getItem("custom_location")).name);
  }
  else {
    urlCurrent = urlMain + "weather?lat=" + pos.latitude + "&lon=" + pos.longitude;
  }
  urlCurrent += '&units=' + temperature_scale;

  if (getApiKey()) {
    urlCurrent += '&APPID='+getApiKey();
  }

  // Send request to OpenWeatherMap
  return fetch(urlCurrent).then(function(response) {
    return response.json();
  }).then(function(json) {
    if (parseInt(json.cod) === 200) {
      // Conditions
      let weather_image = getWeatherImage(json.weather[0].icon, json.weather[0].id);

      // Assemble dictionary using our keys
      let dictionary = {
        "key": "weather",
        "temperature": Math.round(json.main.temp),
        "humidity": Math.round(json.main.humidity),
        "scale": scale,
        "weather_image": weather_image
      };

      return dictionary;
    }
    else {
      console.log(new Date() + " - Error response from openweathermap weather server. One more try.");
      return {
        key: "weather",
        error: json.cod,
        message: json.message
      };
    }
  });
}

function getWeatherImage(icon, code) {
  let weather_image = "clean_sky_day";
  
  if (!icon.localeCompare("01d") || code == 904) {
    weather_image = "clean_sky_day";
  }
  else if (!icon.localeCompare("01n")) {
    weather_image = "clean_sky_night";
  }
  else if (!icon.localeCompare("02d")) {
    weather_image = "few_clouds_day";
  }
  else if (!icon.localeCompare("02n")) {
    weather_image = "few_clouds_night";
  }
  else if (code >= 200 && code <= 232) {
    weather_image = "rain_thunderstorm";
  }
  else if ((code >= 300 && code <= 504) || (code >= 520 && code <= 531)) {
    weather_image = "rain";
  }
  else if (code == 511 || (code >= 611 && code <= 616)) {
    weather_image = "rain_snow";
  }
  else if ((code >= 600 && code <= 602) || (code >= 620 && code <= 622)) {
    weather_image = "snow";
  }
  else if (code >= 701 && code <= 762) {
    weather_image = "mist_night";
  }
  else if (code == 771 || code == 905 || (code >= 952 && code <= 957)) {
    weather_image = "wind";
  }
  else if (code == 781 || (code >= 900 && code <= 902) || (code >= 958 && code <= 962)) {
    weather_image = "tornado";
  }
  else if ((code >= 802 && code <= 804) || code == 903 || code == 951) {
    weather_image = "clouds";
  }
  else if (code == 906) {
    weather_image = "thunderstorm";
  }
  
  return weather_image;
}

export function getApiKey() {
  return settingsStorage.getItem("api_key_openweathermap") ? JSON.parse(settingsStorage.getItem("api_key_openweathermap")).name : null;
}
