const apiKey = "9793d7c8eb8256fb9854470f0f21b2db";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");

const cityName = document.querySelector("#city-name");
const dateEl = document.querySelector("#date");
const weatherIcon = document.querySelector("#weather-icon");
const temperature = document.querySelector("#temperature");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#wind-speed");

const forecastCards = document.querySelector("#forecast-cards");

const historyList = document.querySelector("#history-list");

let citySearchHistory = [];

// Get current weather data from OpenWeatherMap API
async function getCurrentWeather(city) {
  const apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;
  const response = await fetch(apiURL);
  const data = await response.json();
  console.log(data);

  // Update current weather information in the HTML
  cityName.textContent = data.name;
  const currentDate = dayjs(data.dt * 1000).format("MM/DD/YYYY");
  dateEl.textContent = "(" + currentDate + ")";
  weatherIcon.setAttribute("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
  weatherIcon.setAttribute("alt", data.weather[0].description);
  temperature.textContent = "Temperature: " + data.main.temp + " °F";
  humidity.textContent = "Humidity: " + data.main.humidity + "%";
  windSpeed.textContent = "Wind Speed: " + data.wind.speed + " m/s";

  // Get forecast data and update forecast cards
  const forecastData = await getForecast(city);
  console.log(forecastData);
  updateForecastCards(forecastData);
}

// Get forecast data from OpenWeatherMap API
async function getForecast(city) {
  const apiURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=" + apiKey;
  const response = await fetch(apiURL);
  const data = await response.json();
  console.log(data);

  // Group forecast data by date
  const groupedData = data.list.reduce(function(acc, curr) {
    const date = curr.dt_txt.split(" ")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(curr);
    return acc;
  }, {});

  // Convert grouped data to array
  const dataArray = Object.entries(groupedData);

  // Get 5-day forecast data with consecutive dates starting from the current date
  const currentDate = dayjs().startOf('day');
  const forecastData = dataArray.slice(0, 5).map(function(data, index) {
    const date = currentDate.add(index + 1, 'day').format("MM/DD/YYYY");
    const weatherData = data[1][0];
    return {
      date: date,
      iconURL: "https://openweathermap.org/img/w/" + weatherData.weather[0].icon + ".png",
      temperature: weatherData.main.temp + " °F",
      windSpeed: weatherData.wind.speed + " mph",
      humidity: weatherData.main.humidity + "%",    
    };
  });

  return forecastData;
}
// Update forecast cards with data
function updateForecastCards(data) {
    forecastCards.innerHTML = "";
    // Get current date
    const currentDate = dayjs();
    // Loop through the forecast data and create cards for each day
    for (let i = 0; i < data.length; i++) {
      // Calculate the date for the current forecast card
      const forecastDate = currentDate.add(i + 1, "day").format("MM/DD/YYYY");
      const card = document.createElement("div");
      card.classList.add("forecast-card");
      card.innerHTML = "<h3>" + forecastDate + "</h3>" +
        "<img src='" + data[i].iconURL + "' alt='Weather icon'>" +
        "<p>Temp: " + data[i].temperature + "</p>" +
        "<p>Wind: " + data[i].windSpeed + "</p>" +
        "<p>Humidity: " + data[i].humidity + "</p>";
      forecastCards.appendChild(card);
    }
  }
  
  // Add search history item to the HTML
  function addSearchHistory(city) {
    const listItem = document.createElement("li");
    listItem.textContent = city;
    historyList.appendChild(listItem);
    citySearchHistory.push(city);
  }
  
  // Search for city weather when form is submitted
  searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const city = searchInput.value;
    getCurrentWeather(city);
    addSearchHistory(city);
    searchInput.value = "";
  });
  
  // Search for city weather when search history item is clicked
  historyList.addEventListener("click", function(event) {
    if (event.target.tagName === "LI") {
      const city = event.target.textContent;
      getCurrentWeather(city);
    }
  });
  
  // Get and display weather for the last searched city on page load
  if (localStorage.getItem("citySearchHistory")) {
    citySearchHistory = JSON.parse(localStorage.getItem("citySearchHistory"));
    const lastSearchedCity = citySearchHistory[citySearchHistory.length - 1];
    getCurrentWeather(lastSearchedCity);
    citySearchHistory.forEach(function(city) {
      addSearchHistory(city);
    });
  }
  
  // Save search history to local storage
  window.addEventListener("beforeunload", function() {
    localStorage.setItem("citySearchHistory", JSON.stringify(citySearchHistory));
  });
  
  // Clear search history if it exceeds 10 records
  function clearSearchHistory() {
    const maxHistoryLength = 10;
    if (citySearchHistory.length > maxHistoryLength) {
      const newHistory = citySearchHistory.slice(citySearchHistory.length - maxHistoryLength);
      localStorage.setItem("citySearchHistory", JSON.stringify(newHistory));
      citySearchHistory = newHistory;
      const historyItems = historyList.querySelectorAll("li");
      for (let i = 1; i < historyItems.length; i++) {
        historyList.removeChild(historyItems[i]);
      }
    }
  }
  
  // Call function to clear search history on page load
  clearSearchHistory();