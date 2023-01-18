export async function getLocation(location, weatherProvider) {
  let locationUrl = 'https://weather.itigor.com/api/v1/location?location=' + encodeURIComponent(location) + '&provider=' + weatherProvider;
  
  return fetch(locationUrl).then(function(response) {
    return response.json();
  }).then(function(json) {
    return undefined !== json.results && false === json.results ? '' : json.location;
  }).catch(function(error) {
    console.log('getLocation error');
  });
}
