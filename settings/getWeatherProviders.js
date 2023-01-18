export async function getWeatherProviders() {
  let weatherProvidersUrl = 'https://weather.itigor.com/api/v1/weather-services';
  
  return fetch(weatherProvidersUrl).then(function(response) {
    return response.json();
  }).then(function(json) {
    let weatherProvidersLoaded = [];
    if (Array.isArray(json)) {
      for (let index in json) {
        weatherProvidersLoaded.push({
          name: json[index],
          value: json[index]
        });
      }
    }

    return weatherProvidersLoaded;
  }).catch(function(error) {
    console.log('getWeatherProviders error');
  });
}
