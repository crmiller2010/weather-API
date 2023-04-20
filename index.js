// DOM Elements
const cityFormEl = document.querySelector('#search-form');
const cityInputEl = document.querySelector('#search-input');
const searchHistoryEl = document.querySelector('#search-history');
const currentWeatherEl = document.querySelector('#current-weather');
const forecastEl = document.querySelector('#future-weather');

// Local Storage
const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Functions
function displayWeather(weather) {
  currentWeatherEl.innerHTML = `
    <h2>${weather.city} (${weather.date})<img src="${weather.icon}" alt="${weather.description}"/></h2>
    <p>Temperature: ${weather.temperature} °C</p>
    <p>Humidity: ${weather.humidity} %</p>
    <p>Wind Speed: ${weather.wind} km/h</p>
  `;
}

function displayForecast(forecast) {
  forecastEl.innerHTML = `
    
    <div class="forecast-container">
      ${forecast.map(day => `
        <div class="forecast-card">
          <h3>${day.date}</h3>
          <img src="${day.icon}" alt="${day.description}"/>
          <p>Temperature: ${day.temperature} °C</p>
          <p>Humidity: ${day.humidity} %</p>
          <p>Wind Speed: ${day.wind} km/h</p>
        </div>
      `).join('')}
    </div>
  `;
}

function addCityToHistory(city) {
  if (searchHistory.indexOf(city) === -1) {
    searchHistory.push(city);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
  }
}

function displaySearchHistory() {
  searchHistoryEl.innerHTML = `
    ${searchHistory.map(city => `
      <li><button class="btn btn-link" data-city="${city}">${city}</button></li>
    `).join('')}
  `;
}

function getWeather(city) {
    const API_KEY = '7b1cb3ba4e49a68681c6edaaa4b9360d';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const weather = {
          city: data.name,
          date: new Date().toLocaleDateString(),
          icon: `https://openweathermap.org/img/w/${data.weather[0].icon}.png`,
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          wind: Math.round(data.wind.speed),
        };
        displayWeather(weather);
        addCityToHistory(city);
  
        // Get the 5-day forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=imperial`;
        fetch(forecastUrl)
          .then(response => response.json())
          .then(data => {
            const forecast = data.list
              .filter(item => item.dt_txt.includes('12:00:00'))
              .map(item => ({
                date: new Date(item.dt * 1000).toLocaleDateString(),
                icon: `https://openweathermap.org/img/w/${item.weather[0].icon}.png`,
                description: item.weather[0].description,
                temperature: Math.round(item.main.temp),
                humidity: item.main.humidity,
                wind: Math.round(item.wind.speed),
              }))
              .slice(0, 5);
            displayForecast(forecast);
          })
          .catch(error => console.error('Error:', error));
      })
      .catch(error => console.error('Error:', error));
  }
  

// Event Listeners
cityFormEl.addEventListener('submit', event => {
  event.preventDefault();
  const city = cityInputEl.value.trim();
  if (city) {
    getWeather(city);
    cityInputEl.value = '';
  }
});
cityFormEl.addEventListener('submit', displayForecast);

searchHistoryEl.addEventListener('click', event => {
  if (event.target.matches('button')) {
    const city = event.target.getAttribute('data-city');
    getWeather(city);
  }
});

// Initial Render
displaySearchHistory();
if (searchHistory.length > 0) {
  getWeather(searchHistory[searchHistory.length - 1]);
}
