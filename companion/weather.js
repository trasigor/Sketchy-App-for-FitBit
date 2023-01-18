import { settingsStorage } from "settings";
import { getWeatherProviders } from "./../settings/getWeatherProviders.js"

export function WeatherAPI(){};

WeatherAPI.prototype.getData = function(pos) {
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

  let location = '';
  let locationFound = JSON.parse(settingsStorage.getItem("location_found"));
  if (locationFound && locationFound.name) {
    location = '&location='+encodeURIComponent(JSON.parse(settingsStorage.getItem("custom_location")).name);
  }
  else {
    location = '&lat='+pos.latitude+'&lon='+pos.longitude;
  }

  return new Promise(function(resolve, reject) {
    let provider = settingsStorage.getItem('weather_provider');
    if (provider) {
      resolve(JSON.parse(provider).values);
    }
    else {
      return resolve(getWeatherProviders());
    }
  }).then(function(provider) {
    provider = provider[0].value;

    // Construct URL
    let url = 'https://weather.itigor.com/api/v1/weather?provider=' + provider + location + '&units='+temperature_scale;

    return fetch(url);
  }).then(function(response) {
    return response.json();
  }).then(function(json) {
    if (typeof json !== 'object' || json.results === false) {
      console.log(new Date() + " - Incorrect response from weather server.");
      return {
        key: "weather",
        error: "-",
        message: "Incorrect response from weather server."
      };
    }
    else {
      // Assemble dictionary using our keys
      let dictionary = {
        "key": "weather",
        "temperature": Math.round(json.temperature),
        "humidity": Math.round(json.humidity),
        "scale": scale,
        "weather_image": json.condition_image
      };

      return dictionary;
    }
  });
}
