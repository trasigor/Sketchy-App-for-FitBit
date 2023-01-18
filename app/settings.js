import { me as appbit } from "appbit";
import * as fs from "fs";

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

const defaultSettings = {
  battery_show: false,
  background: "black",
  foreground: "white",
};

let settings = defaultSettings;

appbit.onunload = function () {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
};

export default {
  weather: {},
  
  data() {
    return settings;
  },
  
  setColors(background, foreground) {
    settings.background = background;
    settings.foreground = foreground;
  },

  setBatteryShow(isShown) {
    settings.battery_show = isShown;
  },

  saveWeather(data) {
    this.weather = data;
  },

  load() {
    try {
      let savedSettings = fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
      if (typeof savedSettings === "undefined") {
        settings = defaultSettings;
      } else {
        settings = savedSettings;
      }
    } catch (ex) {
      // Defaults
      settings = defaultSettings;
    }
  },
}