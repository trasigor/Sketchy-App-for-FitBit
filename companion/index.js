import { me } from "companion";
import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { geolocation } from "geolocation";

import { OpenWeatherMapAPI, getApiKey as getOpenWeatherMapApiKey } from "./openweathermap.js"
import { WeatherAPI } from "./weather.js"

let timeoutId = false;

settingsStorage.onchange = function(evt) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    if (evt.key === "temperature_scale" || evt.key === "location_found") {
      getWeather();
    }
    else if (evt.key === "weather_provider") {
      let location = JSON.parse(settingsStorage.getItem("location_found"));
      if (null === location || '' === location.name) {
        getWeather();
      }
    }
    else if (evt.key === "theme") {
      let data = JSON.parse(evt.newValue);
      data["values"][0].value.key = "theme";
      messaging.peerSocket.send(data["values"][0].value);
    }
    else if (evt.key === "battery_show") {
      messaging.peerSocket.send({key: "battery_show", value: evt.newValue});
    }
  }
}

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  // Ready to send or receive messages
  console.log("peerSocket open");
}

messaging.peerSocket.onerror = (err) => {
  console.log(`Connection error: ${err.code} - ${err.message}`);
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = (evt) => {
  // Output the message to the console
  console.log(JSON.stringify(evt.data));
  
  if (!evt.data.localeCompare("updateWeather")) {
    getWeather();
  }
}

function getWeather() {
  if (me.permissions.granted("access_internet")) {
    let locationFound = JSON.parse(settingsStorage.getItem("location_found"));
    if (locationFound && locationFound.name) {
      getWeatherData(false);
    }
    else if (me.permissions.granted("access_location")) {
      let timeout = new Promise(function(resolve, reject) {
        timeoutId = setTimeout(function() {
          clearTimeout(timeoutId);
          let savedCoords = settingsStorage.getItem("saved_coords");
          if (savedCoords) {
            resolve(getWeatherData(JSON.parse(savedCoords)));
          }
        }, 1000)
      });
      
      let promise = new Promise(function(resolve, reject) {
        geolocation.getCurrentPosition(function(position) {
          clearTimeout(timeoutId);
          if (position.coords.latitude && position.coords.longitude) {
            settingsStorage.setItem("saved_coords", JSON.stringify({latitude: position.coords.latitude, longitude: position.coords.longitude}));
          resolve(getWeatherData(position.coords));
          }
        });
      });
      
      return Promise.race([
        promise,
        timeout
      ]);
    }
    else {
      console.log(new Date() + " - Error: no access to Location.");
    }
  }
  else {
    console.log(new Date() + " - Error: no access to the Internet.");
  }
}

function getWeatherData(coords) {
  let weather_provider = JSON.parse(settingsStorage.getItem("weather_provider"));
  let weatherAPI = new WeatherAPI();
  if (weather_provider && weather_provider.values[0].value && !weather_provider.values[0].value.localeCompare("OpenWeatherMap") && getOpenWeatherMapApiKey()) {
    weatherAPI = new OpenWeatherMapAPI();
  }

  weatherAPI.getData(coords).then(function(dictionary) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(dictionary);
    }
  });
}