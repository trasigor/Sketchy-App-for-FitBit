export async function getOpenWeatherMapLocation(location, apiKey) {
  let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(location) + '&APPID=' + apiKey;

  return fetch(url).then(function(response) {
    return response.json();
  }).then(function(json) {
    let locationFound = '';

    if (parseInt(json.cod) !== 404) {
      if (json.sys.country) {
          locationFound += json.sys.country;
      }
      locationFound += ((locationFound && json.name) ? ", " : "") + json.name;
    }

    return locationFound;
  }).catch(function(error) {
    console.log('getOpenWeatherMapLocation error');
  });
}