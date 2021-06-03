fetch(
  "https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={bf3afd387026477c80f7f7186fd25aaf}"
)
  .then((response) => response.json())
  .then((data) => console.log(data));
