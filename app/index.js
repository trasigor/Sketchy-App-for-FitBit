import clock from "clock";
import * as messaging from "messaging";
import * as HRM from "./hrm";
import * as activity from "./activity";
import * as battery from "./battery";
import { default as settings } from "./settings";
import { setWeather } from "./weather";
import { applyTheme } from "./html/theme";
import { setTime } from "./time";

let lastWeatherUpdate = 0;

settings.load();

applyTheme();

clock.granularity = "seconds";
clock.ontick = evt => {
  setTime(evt.date)

  if (
    evt.date.getTime() > lastWeatherUpdate+1800000 &&
    messaging.peerSocket.readyState === messaging.peerSocket.OPEN
  ) {
    messaging.peerSocket.send("updateWeather");
    lastWeatherUpdate = evt.date.getTime();
  }
}

HRM.initialize();

activity.initialize();

battery.update();

// Listen for the onmessage event
messaging.peerSocket.onmessage = evt => {
  if ("weather" === evt.data.key) {
    if (evt.data.error) {
      // check weather in 5 minutes
      console.log("Weather answer error, re-try in 5 minutes.");
      lastWeatherUpdate -= 1500000;
    }
    else {
      setWeather(evt.data);
    }
  }
  else if ("theme" === evt.data.key) {
    applyTheme(evt.data.background, evt.data.foreground);
  }
  else if ("battery_show" === evt.data.key) {
    settings.setBatteryShow(0 === evt.data.value.localeCompare("true"));
    battery.update();
  }
  else {
    console.log("else message");
    console.log(JSON.stringify(evt));
  }
}
