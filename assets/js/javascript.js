const serach = async (cityName) => {
  let forcast;
  let oneCall;
  // api key
  var key = "bf3afd387026477c80f7f7186fd25aaf";
  // api fetch to get forcast
  await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${key}`
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      forcast = data;
    })
    .catch((err) => {
      console.log(`There was a problem fetching data [${err.message}]`);
      throw new Error(err.message);
    });
  const { lat, lon } = forcast?.city?.coord;
  // api fetch to get city info
  await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude={}&appid=${key}`
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      oneCall = data;
    })
    .catch((err) => {
      console.log(`There was a problem fetching data [${err.message}]`);
      throw new Error(err.message);
    });
  // renders five day forcast
  fiveDayForcast(oneCall);
  // renders city info
  cityInfo(forcast, oneCall);
};
const cityInfo = (forcast, oneCall) => {
  let { city } = forcast;
  let { temp, wind_speed, humidity, uvi } = oneCall.current;
  // creates date format
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  const uviClass = (i) => {
    if (i < 2) return "low";
    if (i < 5) return "moderate";
    if (i < 7) return "high";
    if (i < 10) return "very high";
    if (i > 11) return "extreme";
  };
  // elements to show weather info
  const weatherInfo = `
    <h2>${city.name} (${month}/${day}/${year})</h2>
    <h5>Temp  ${Math.round((temp - 273.15) * (9 / 5) + 32)} °F</h5>
    <h5>Wind ${wind_speed}</h5>
    <h5>Humidity ${humidity} %</h5>
    <h5>UV Index <span class="uvi-pill ${uviClass(uvi)}">${uvi}</span></h5>
  `;
  // render weather info in container
  $("#weather-info").empty().html(weatherInfo);
};
const fiveDayForcast = (oneCall) => {
  const { daily } = oneCall;
  // create forcast elements
  const forcast = daily.map((item, i) => {
    let { humidity, temp, wind_speed, dt } = item;
    let date = new Date(dt * 1000);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    // show every forcast day except current day and after fifth day
    if (i > 5 || i === 0) {
      return "";
    }
    return `
      <div class="forcast-data-card">
        <h3>${month}/${day}/${year}</h3>
        <h3> Temp  ${Math.round((temp.day - 273.15) * (9 / 5) + 32)} °F</h3>
        <h3> Wind ${wind_speed}</h3>
        <h3> Humidity ${humidity}</h3>
      </div>
    `;
  });
  // renders forcast elements into container
  $(`#forcast`).empty().html(forcast);
};
// saves recent searches to local storage
const utility = (action, value) => {
  if (action === "set") {
    const searches = JSON.parse(localStorage.getItem("searches") ?? "[]");
    searches.push(value);
    localStorage.setItem("searches", JSON.stringify(searches));
  } else if (action === "get") {
    return JSON.parse(localStorage.getItem("searches") ?? "[]");
  }
};
// renders those saved searches and makes them a clickable button
const savedSearches = () => {
  const renderedSearches = utility("get").map((search, i) => {
    return `
      <button id="${
        search.replace(/ /g, "-") + i
      }" class="recent-search">${search} </button>
    `;
  });
  $("#recent").empty().html(renderedSearches);
  utility("get").map((search, i) => {
    $(`#${search.replace(/ /g, "-")}${i}`).click(() => {
      serach(search);
      $("#search-input").val(search);
    });
  });
};
// searches for city typed into search bar
const searchButton = $("#search-button");
searchButton.on("click", () => {
  if ($("#search-input").val() || "" !== "") {
    serach($("#search-input").val() || "");
    utility("set", $("#search-input").val() || "");
    savedSearches();
  } else {
    // do nothing!
  }
});
