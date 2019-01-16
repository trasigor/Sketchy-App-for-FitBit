import { settingsStorage } from "settings";

export function YahooWeatherAPI(){};

YahooWeatherAPI.prototype.getData = function(pos) {
  return getWeather(pos);
}

function getWeather(pos) {
  let scale = "f";
  let settings_temperature = JSON.parse(settingsStorage.getItem("temperature_scale"));
  if (settings_temperature && settings_temperature.values[0].value) {
    if (!settings_temperature.values[0].value.localeCompare("c")) {
      scale = "c";
    }
  }
  
  let location = '';
  let locationFound = JSON.parse(settingsStorage.getItem("location_found"));
  if (locationFound && locationFound.name) {
    location = 'location='+encodeURIComponent(JSON.parse(settingsStorage.getItem("custom_location")).name);
  }
  else {
    location = 'lat='+pos.latitude+'&lon='+pos.longitude;
  }
  
  // Construct URL
  let url = 'https://pebble.itigor.com/sketchy-weather/yahooweather.php?action=weather&format=json&' + location + '&u='+scale;
  
  return new Promise(function(resolve, reject) {
    // Send request to YahooWeather
    fetch(url).then(function(response) {
      return response.json();
    }).then(function(json) {
      if (typeof json !== 'object' || json.results === false || 3200 == json.condition_code) {
        // temporary blocked due to exceeding of requests limitation
        console.log(new Date() + " - Incorrect response from weather server.");
        resolve({key: "weather", error: "-", message: "Incorrect response from weather server."});
      }
      else {
        // Conditions
        let weather_image = getWeatherImage(json.condition_code);

        // Assemble dictionary using our keys
        let dictionary = {
          "key": "weather",
          "temperature": Math.round(json.temperature),
          "humidity": Math.round(json.humidity),
          "scale": scale,
          "weather_image": weather_image
        };
        
        resolve(dictionary);
      }
    }).catch(function(error) {
      reject(error);
    });
  });
}

function getWeatherImage(code) {
  let weather_image = "clean_sky_day";
  
  if (code >= 0 && code <= 2) {
    weather_image = "tornado";
  }
  else if ((code >= 3 && code <= 4) || code == 35 || (code >= 37 && code <= 39) || code == 45 || code == 47) {
    weather_image = "rain_thunderstorm";
  }
  else if ((code >= 5 && code <= 7) || code == 18) {
    weather_image = "rain_snow";
  }
  else if ((code >= 8 && code <= 12) || code == 40) {
    weather_image = "rain";
  }
  else if ((code >= 13 && code <= 16) || (code >= 41 && code <= 43) || code == 46) {
    weather_image = "snow";
  }
  else if (code == 17) {
    weather_image = "thunderstorm";
  }
  else if (code >= 19 && code <= 22) {
    weather_image = "mist_night";
  }
  else if (code >= 23 && code <= 24) {
    weather_image = "wind";
  }
  else if ((code >= 25 && code <= 28) || code == 44) {
    weather_image = "clouds";
  }
  else if (code == 29) {
    weather_image = "few_clouds_night";
  }
  else if (code == 30) {
    weather_image = "few_clouds_day";
  }
  else if (code == 31 || code == 33) {
    weather_image = "clean_sky_night";
  }
  else if (code == 32 || code == 34 || code == 36) {
    weather_image = "clean_sky_day";
  }
  
  return weather_image;
}