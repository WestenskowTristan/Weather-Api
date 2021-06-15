const WEATHER_API_KEY = "bf3afd387026477c80f7f7186fd25aaf";

const searchForLocation = async (cityName) => {
  let forcastData;
  let oneCallData;
  const forcastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${WEATHER_API_KEY}`;

  await fetch(forcastApiUrl)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      forcastData = data;
    })
    .catch((err) => {
      console.log(`There was a problem fetching data [${err.message}]`);
      throw new Error(err.message);
    });

  const { lat, lon } = forcastData.city.coord;
  const oneCallApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude={}&appid=${WEATHER_API_KEY}`;

  await fetch(oneCallApiUrl)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      oneCallData = data;
    })
    .catch((err) => {
      console.log(`There was a problem fetching data [${err.message}]`);
      throw new Error(err.message);
    });

  renderGeneralCityInfo(forcastData, oneCallData);
  renderFiveDayForcast(oneCallData);
};

const renderGeneralCityInfo = (forcastData, oneCallData) => {
  const { city } = forcastData;
  const { temp, wind_speed, humidity, uvi, weather } = oneCallData.current;

  const date = new Date();
  const dateDay = date.getDate();
  const dateMonth = date.getMonth() + 1;
  const dateYear = date.getFullYear();
  const formattedDate = `${dateMonth}/${dateDay}/${dateYear}`;
  const kelvinToFahrenheit = (temp - 273.15) * (9 / 5) + 32;

  const getUviClass = (uvIndex) => {
    if (uvIndex < 2) return "low";
    if (uvIndex < 5) return "moderate";
    if (uvIndex < 7) return "high";
    if (uvIndex < 10) return "very high";
    if (uvIndex > 11) return "extreme";
  };

  const renderedWindSpeed = `Wind ${wind_speed}`;
  const renderedHumidity = `Humidity ${humidity}`;
  const renderedUvIndex = `UV Index <span class="uvi-pill ${getUviClass(
    uvi
  )}">${uvi}</span>`;
  const renderedCityName = `${city.name} (${formattedDate})`;
  const renderedTemp = `Temp  ${Math.round(kelvinToFahrenheit)} °F`;

  const generalCityWeatherInfo = `
    <h2>${renderedCityName}</h2>
    <h5>${renderedTemp}</h5>
    <h5>${renderedWindSpeed}</h5>
    <h5>${renderedHumidity} %</h5>
    <h5>${renderedUvIndex}</h5>
  `;

  $("#general-city-weather-info").empty().html(generalCityWeatherInfo);
};

const renderFiveDayForcast = (oneCallData) => {
  console.log(oneCallData);
  const { daily } = oneCallData;

  const renderedForcastData = daily.map((item, i) => {
    const { humidity, temp, wind_speed, dt } = item;

    const date = new Date(dt * 1000);
    const dateDay = date.getDate();
    const dateMonth = date.getMonth() + 1;
    const dateYear = date.getFullYear();
    const formattedDate = `${dateMonth}/${dateDay}/${dateYear}`;

    const renderedWindSpeed = `Wind ${wind_speed}`;
    const renderedHumidity = `Humidity ${humidity}`;
    const kelvinToFahrenheit = (temp.day - 273.15) * (9 / 5) + 32;
    const renderedTemp = `Temp  ${Math.round(kelvinToFahrenheit)} °F`;

    if (i > 5 || i === 0) {
      return "";
    }

    return `
      <div class="forcast-data-card">
        <h3>${formattedDate}</h3>
        <h3>${renderedTemp}</h3>
        <h3>${renderedWindSpeed}</h3>
        <h3>${renderedHumidity}</h3>
        
      </div>
    `;
  });

  $(`#forcast`).empty().html(renderedForcastData);
};

const localStorageUtil = (action, value) => {
  if (action === "set") {
    const searches = JSON.parse(localStorage.getItem("searches") ?? "[]");
    searches.push(value);
    localStorage.setItem("searches", JSON.stringify(searches));
  } else if (action === "get") {
    return JSON.parse(localStorage.getItem("searches") ?? "[]");
  }
};

const renderSaveSearches = async () => {
  const searches = localStorageUtil("get");
  const renderedSearches = searches.map((search, i) => {
    const trimmedSearch = search.replace(/ /g, "-");
    return `
      <button id="${
        trimmedSearch + i
      }" class="recent-search-button">${search} </button>
    `;
  });
  await $("#recent-city").empty().html(renderedSearches);

  searches.map((search, i) => {
    const trimmedSearch = search.replace(/ /g, "-");
    $(`#${trimmedSearch}${i}`).click(() => {
      searchForLocation(search);
      $("#search-input").val(search);
    });
  });
};

const searchButton = $("#forcast-search-button");

searchButton.on("click", () => {
  const searchInputValue = $("#search-input").val() || "";
  if (searchInputValue !== "") {
    searchForLocation(searchInputValue);
    localStorageUtil("set", searchInputValue);
    renderSaveSearches();
  }
});
