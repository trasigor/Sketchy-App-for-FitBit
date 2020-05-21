function checkLocation(location, weather_provider, props) {
  if (!location && 'undefined' !== typeof props.settings.custom_location) {
    location = JSON.parse(props.settings.custom_location);
  }
  
  if (location && '' !== location.name) {
    if (!weather_provider && props.settings.weather_provider) {
      weather_provider = JSON.parse(props.settings.weather_provider)
    }

    if (
        weather_provider && weather_provider.values && typeof weather_provider.values[0] === 'object' &&
        weather_provider.values[0].value &&
        !weather_provider.values[0].value.localeCompare("yahooweather")
    ) {
      locationFromYahooWeather(location.name).then(function(locationFound) {
        props.settingsStorage.setItem('location_found', JSON.stringify({name: locationFound}));
      });
    }
    else {
      locationFromOpenWeatherMap(location.name, props.settings.openweathermap_api_key).then(function(locationFound) {
        props.settingsStorage.setItem('location_found', JSON.stringify({name: locationFound}));
      });
    }
  }
  else {
    props.settingsStorage.setItem('location_found', JSON.stringify({name: ''}));
  }
}

function locationFromYahooWeather(location) {
  return new Promise(function(resolve, reject) {
      
    let url = 'https://pebble.itigor.com/sketchy-weather/yahooweather.php?format=json&action=location&location=' + encodeURIComponent(location);

    // Send request to YahooWeather
    fetch(url).then(function(response) {
      return response.json();
    }).then(function(json) {
      let locationFound = '';
      
      if (json.location) {
        locationFound += json.location;
      }
      
      resolve(locationFound);
    }).catch(function(error) {
      reject(error);
    });
  });
}

function locationFromOpenWeatherMap(location, apiKey) {
  return new Promise(function(resolve, reject) {
    let url = "https://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(location) +
              '&APPID=' + apiKey;

    // Send request to OpenWeatherMap
    fetch(url).then(function(response) {
      return response.json();
    }).then(function(json) {
      let locationFound = '';

      if (parseInt(json.cod) !== 404) {
        if (json.sys.country) {
            locationFound += json.sys.country;
        }
        locationFound += ((locationFound && json.name) ? ", " : "") + json.name;
      }

      resolve(locationFound);
    }).catch(function(error) {
      reject(error);
    });
  });
}

function mySettings(props) {
  return (
    <Page>
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
      <Select
        id="weather_provider"
        label="Weather Provider"
        settingsKey="weather_provider"
        title={<Text bold align="center">Weather Provider</Text>}
        options={[
           {
             name: "OpenWeatherMap",
             value: "openweathermap"
           },
           {
             name: "Yahoo Weather",
             value: "yahooweather"
           }]
        }
        onSelection={value => checkLocation(false, value, props)}
      />
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
          onChange={value => checkLocation(value, false, props)}
        />
        <TextInput
          settingsKey="location_found"
          disabled="true"
        />
      </Section>
      
      <Section
        title={<Text bold align="center">Battery Charge</Text>}
      >
        <Toggle
          label="Always Show Battery Charge"
          settingsKey="battery_show"
        />
      </Section>
      
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
        <Link source="https://www.blockchain.com/btc/payment_request?address=1PTcdcPLWzBD9KM7hmq82BXgKtuSuampPd">
          <TextImageRow
            label="Bitcoin"
            sublabel="1PTcdcPLWzBD9KM7hmq82BXgKtuSuampPd"
            icon="https://github.com/trasigor/Sketchy-App-for-FitBit/blob/master/resources/images/settings/Bitcoin.png?raw=true"
          />
        </Link>
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);