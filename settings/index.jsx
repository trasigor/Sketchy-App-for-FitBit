import { getWeatherProviders } from "./getWeatherProviders.js"
import { getLocation } from "./getLocation.js"
import { getOpenWeatherMapLocation } from "./getOpenWeatherMapLocation.js"

let weatherProviders = [];
let selectedWeatherProvider = false;

function checkLocation(location, weatherProvider, apiKey, props) {
  if (!location && 'undefined' !== typeof props.settings.custom_location) {
    location = JSON.parse(props.settings.custom_location);
  }
  
  if (location && '' !== location.name) {
    if (!weatherProvider) {
      if (props.settings.weather_provider) {
        weatherProvider = JSON.parse(props.settings.weather_provider);
      }
      else {
        weatherProvider = {"values":[weatherProviders[0]],"selected":[0]};
      }
    }
    
    if (!apiKey && props.settings.api_key_openweathermap) {
      apiKey = JSON.parse(props.settings.api_key_openweathermap);
    }

    if (isWeatherProviderSelected(weatherProvider, "OpenWeatherMap") && apiKey && apiKey.name) {
      getOpenWeatherMapLocation(location.name, apiKey.name).then(function(locationFound) {
        props.settingsStorage.setItem('location_found', JSON.stringify({name: locationFound}));
      });
    }
    else {
      getLocation(location.name, weatherProvider.values[0].value).then(function(locationFound) {
        props.settingsStorage.setItem('location_found', JSON.stringify({name: locationFound}));
      });
    }
  }
  else {
    props.settingsStorage.setItem('location_found', JSON.stringify({name: ''}));
  }
}

function isWeatherProviderSelected(weatherProviderData, weatherProviderName) {
  return weatherProviderData && weatherProviderData.values && typeof weatherProviderData.values[0] === 'object' &&
    weatherProviderData.values[0].value && !weatherProviderData.values[0].value.localeCompare(weatherProviderName);
}

function settings(props) {
  if (false === selectedWeatherProvider) {
    selectedWeatherProvider = props.settingsStorage.getItem('weather_provider');
    if ('undefined' === typeof selectedWeatherProvider) {
      // ? reset selection
    }
    else {
      selectedWeatherProvider = JSON.parse(selectedWeatherProvider);

      if (!weatherProviders.map(provider => provider.value).includes(selectedWeatherProvider.values[0].value)) {
        selectedWeatherProvider = {"values":[weatherProviders[0]],"selected":[0]};
        props.settingsStorage.setItem("weather_provider", JSON.stringify(selectedWeatherProvider));
        props.settings.weather_provider = selectedWeatherProvider;
      }
      else {
        let mappedWeatherProviders = Object.fromEntries(
          weatherProviders.map(
            function (provider, index) {
              return [provider.value, index];
            }
          )
        );

        if (mappedWeatherProviders[selectedWeatherProvider.selected[0]] !== selectedWeatherProvider.values[0].value) {
          selectedWeatherProvider.selected = [mappedWeatherProviders[selectedWeatherProvider.values[0].value]];
          props.settingsStorage.setItem('weather_provider', JSON.stringify(selectedWeatherProvider));
          props.settings.weather_provider = selectedWeatherProvider;
        }
        selectedWeatherProvider = JSON.stringify(selectedWeatherProvider);
      }
    }
  }

  return getSettingsPage(props);
}

function getSettingsPage(props) {
  let openWeatherMapApiKeySection = () => {};
  if (props.settings.weather_provider && (
    'string' === typeof props.settings.weather_provider
    && isWeatherProviderSelected(JSON.parse(props.settings.weather_provider), "OpenWeatherMap")
    || 'object' === typeof props.settings.weather_provider
    && isWeatherProviderSelected(props.settings.weather_provider, "OpenWeatherMap")
  )) {
    openWeatherMapApiKeySection = getOpenWeatherMapApiKeySection;
  }

  return (
    <Page>
      {getThemeSection()}
      {getWeatherProviderSection(props)}
      {openWeatherMapApiKeySection(props)}
      {getTemperatureScaleSection()}
      {getCustomLocationSection(props)}
      {getBatteryChargeSection()}
      {getContactMeSection()}
    </Page>
  );
}

function getThemeSection() {
  return (
    <Select
      label="Theme"
      settingsKey="theme"
      title={<Text bold align="center">Theme</Text>}
      options={[
         {
           name: "Black on White",
           value: {
             background: "white",
             foreground: "black"
           }
         },
         {
           name: "White on Black",
           value: {
             background: "black",
             foreground: "white"
           }
         }]
      }
    />
  );
}

function getWeatherProviderSection(props) {
  return (
    <Select
      id="weather_provider"
      label="Weather Provider"
      settingsKey="weather_provider"
      title={<Text bold align="center">Weather Provider</Text>}
      options={weatherProviders}
      onSelection={value => checkLocation(false, value, false, props)}
    />
  );
}

function getOpenWeatherMapApiKeySection(props) {
  return (
    <TextInput
      label="API Key (optional)"
      settingsKey="api_key_openweathermap"
      onChange={value => checkLocation(false, false, value, props)}
    />
  );
}

function getTemperatureScaleSection() {
  return (
    <Select
      label="Temperature Scale"
      settingsKey="temperature_scale"
      title={<Text bold align="center">Temperature Scale</Text>}
      options={[
         {
           name: "Metric",
           value: "c"
         },
         {
           name: "Imperial",
           value: "f"
         }]
      }
    />
  );
}

function getCustomLocationSection(props) {
  return (
    <Section
      settingsKey="location_found2"
      title={<Text bold align="center">Custom Location</Text>}
      description="Enter a city name. If field is empty, then will be used your current location."
    >
      <TextInput
        id="geolocation"
        label="Enter Location"
        placeholder="London"
        settingsKey="custom_location"
        onChange={value => checkLocation(value, false, false, props)}
      />
      <TextInput
        settingsKey="location_found"
        disabled="true"
      />
    </Section>
  );
}

function getBatteryChargeSection() {
  return (
    <Section
      title={<Text bold align="center">Battery Charge</Text>}
    >
      <Toggle
        label="Always Show Battery Charge"
        settingsKey="battery_show"
      />
    </Section>
  );
}

function getContactMeSection() {
  return (
    <Section
      title={<Text bold align="center">Contact Me</Text>}>
      <Text>
        Please don't hesitate to contact me with any questions or suggestions. This app will always be free. If you really like my app please consider buying me a coffee. Thanks!
      </Text>
      <Link source="https://rawgit.com/trasigor/Sketchy-App-for-FitBit/master/settings/email.html">
        <TextImageRow
          label="Email"
          sublabel="trasigor@gmail.com"
          icon="https://github.com/trasigor/Sketchy-App-for-FitBit/blob/master/resources/images/settings/Email.png?raw=true"
        />
      </Link>
      <Link source="https://github.com/trasigor">
        <TextImageRow
          label="Github"
          sublabel="https://github.com/trasigor"
          icon="https://github.com/trasigor/Sketchy-App-for-FitBit/blob/master/resources/images/settings/Github.png?raw=true"
        />
      </Link>
      <Link source="https://paypal.me/Trasigor">
        <TextImageRow
          label="PayPal"
          sublabel="funnel.from.trua@gmail.com"
          icon="https://github.com/trasigor/Sketchy-App-for-FitBit/blob/master/resources/images/settings/Paypal.png?raw=true"
        />
      </Link>
    </Section>
  );
}

getWeatherProviders().then(function(weatherProvidersLoaded) {
  weatherProviders = weatherProvidersLoaded;
}).then(function() {
  registerSettingsPage(settings);
}).catch(function(error) {
  console.log('settings error')
});