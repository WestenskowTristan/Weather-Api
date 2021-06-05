
const WEATHER_API_KEY = 'bf3afd387026477c80f7f7186fd25aaf';

const searchForLocation = async (cityName) => {
  let forcastData;
  let uvIndex;
  const forcastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${WEATHER_API_KEY}`;

  await fetch(forcastApiUrl).then(res => {
    return res.json();
  }).then(data => {
    console.log(data)
    forcastData = data;
  }).catch (err => {
    console.log(`There was a problem fetching data [${err.message}]`);
    throw new Error(err.message);
  });
    
  const { lat, lon } = forcastData.city.coord;
  const oneCallApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude={part}&appid=${WEATHER_API_KEY}`;

  await fetch(oneCallApiUrl).then(res => {
    return res.json();
  }).then(data => {
    console.log(data.current.uvi);
    uvIndex = data.current.uvi;
  }).catch(err => {
    console.log(`There was a problem fetching data [${serr.message}]`);
    throw new Error(err.message);
  });

};

const searchButton = document.getElementById('forcast-search-button');

searchButton.addEventListener('click', () =>  {
  const searchInputValue = document.getElementById('search-input').value;
  searchForLocation(searchInputValue);
});



  