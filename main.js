// ПЕРЕМЕННЫЕ
const API_KEY = "ede78e3022d87546d1d3b7279f811096";
let airQualityIndexArr = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
let months = [
    "Jan",
    "Feb",

    "Mar",
    "Apr",
    "May",

    "Jun",
    "Jul",
    "Aug",

    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const headerInput = document.querySelector(".header__input");
const headerSearchBtn = document.querySelector(".header__btn--search");
const headerLocationBtn = document.querySelector(".header__btn--location");

const currentWeatherDiv = document.querySelector(".current__weather");
const weekForecastUl = document.querySelector(".week-forecast__list");

const airQualityIndexHighlightLi = document.querySelector(".highlight--air-quality-index");
const sunriseSunsetHighlightLi = document.querySelector(".highlight--sunrise-sunset");
const humidityP = document.querySelector(".highlight--humidity .highlight__content p");
const pressureP = document.querySelector(".highlight--pressure .highlight__content p");
const visibilityP = document.querySelector(".highlight--visibility .highlight__content p");
const windSpeedP = document.querySelector(".highlight--wind-speed .highlight__content p");
const feelsLikeP = document.querySelector(".highlight--feels-like .highlight__content p");

const todayUl = document.querySelector(".today__list");

// ФУНКЦИИ
async function getWeatherDetails(name, lat, lon, country, state) {
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    let WHEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    let AIR_POLLUTION_API_URL = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    
    await fetch(WHEATHER_API_URL).then(res => res.json()).then(data => {
        let date = new Date();
        currentWeatherDiv.innerHTML = `
            <h2 class="current__weather-title">Now</h2>
            <div class="current__weather-degrees">
                <p>${Math.trunc((data.main.temp - 273.15).toFixed(2))}&deg;C</p>
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
            </div>
            <div class="current__weather-wrap--haze">
                <span>${data.weather[0].description}</span>
            </div>
            <p class="current__weather-date">
                <i class="fa-light fa-calendar"></i>
                ${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]}
            </p>
            <p class="current__weather-location">
                <i class="fa-light fa-location-dot"></i>
                ${data.name}, ${country}
            </p>
        `;

        let {sunrise, sunset} = data.sys;
        let {timezone, visibility} = data;
        let {humidity, pressure, feels_like} = data.main;
        let {speed} = data.wind;
        let sunriseTime = moment.utc(sunrise, "X").add(timezone, "seconds").format("hh:mm A");
        let sunsetTime = moment.utc(sunset, "X").add(timezone, "seconds").format("hh:mm A");
        sunriseSunsetHighlightLi.innerHTML = `
            <h2 class="highlight__title">Sunrise & Sunset</h2>
            <ul class="highlight__times">
                <li class="highlight__time">
                    <i class="fa-light fa-sunrise fa-4x"></i>
                    <div class="highlight__content">
                        <span>Sunrise</span>
                        <time datetime="${sunriseTime}">${sunriseTime}</time>
                    </div>
                </li>
                <li class="highlight__time">
                    <i class="fa-light fa-sunset fa-4x"></i>
                    <div class="highlight__content">
                        <span>Sunset</span>
                        <time datetime="${sunsetTime}">${sunsetTime}</time>
                    </div>
                </li>
            </ul>
        `;

        humidityP.innerHTML = `${humidity}%`;
        pressureP.innerHTML = `${pressure}hPA`;
        visibilityP.innerHTML = `${visibility / 1000}km`;
        windSpeedP.innerHTML = `${speed}m/s`;
        feelsLikeP.innerHTML = `${(feels_like - 273.15).toFixed(2)}&deg;C`;
    }).catch(() => {
        `Failed to get the weather :(`
    });
    
    await fetch(FORECAST_API_URL).then(res => res.json()).then(data => {
        let uniqueForecastDays = [];
        const weekForecast = data.list.filter(forecast => {
            let date = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(date)) return uniqueForecastDays.push(date);
        });
        
        weekForecastUl.innerHTML = "";
        for(let i = 1; i < weekForecast.length; i++) {
            let date = new Date(weekForecast[i].dt_txt);

            weekForecastUl.innerHTML += `
                <li class="week-forecast__item">
                    <div class="week-forecast__degrees">
                        <img src="https://openweathermap.org/img/wn/${weekForecast[i].weather[0].icon}.png">
                        <p>${Math.trunc((weekForecast[i].main.temp - 273.15).toFixed(2))}&deg;C</p>
                    </div>
                    <span class="week-forecast__item-date">${date.getDate()} ${months[date.getMonth()]}</span>
                    <span class="week-forecast__item-day">${days[date.getDay()]}</span>
                </li>
            `;
        };

        let todayForecast = data.list;
        todayUl.innerHTML = "";
        for(let i = 0; i < 8; i++) {
            let todayForecastDate = new Date(todayForecast[i].dt_txt);
            let hour = todayForecastDate.getHours();
            let dayPart = "PM";
            if(hour < 12) dayPart = "AM";
            if(hour === 0) hour = 12;
            if(hour > 12) hour = hour - 12;
            todayUl.innerHTML += `
                <li class="today__item">
                    <time datetime="6:00" class="today__time">${hour} ${dayPart}</time>
                    <img src="https://openweathermap.org/img/wn/${todayForecast[i].weather[0].icon}.png">
                    <span class="today__degrees">${(todayForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
                </li>
            `;
        }
    }).catch(() => {
        `Failed to get the forecast :(`
    });
    
    await fetch(AIR_POLLUTION_API_URL).then(res => res.json()).then(data => {
        let {co, no, no2, o3, so2, pm2_5, pm10, nh3} = data.list[0].components;
        airQualityIndexHighlightLi.innerHTML = `
            <div class="highlight__top">
                <h3 class="highlight__title">Air Quality Index</h3>
                <span class="highlight__mark highlight__mark--${data.list[0].main.aqi}">${airQualityIndexArr[data.list[0].main.aqi - 1]}</span>
            </div>
            <ul class="highlight-metrics">
                <li class="highlight-metric">
                    <i class="fa-regular fa-wind fa-3x"></i>
                </li>
                <li class="highlight-metric">
                    <span>PM2 5</span>
                    <p>${pm2_5}</p>
                </li>
                <li class="highlight-metric">
                    <span>PM2 10</span>
                    <p>${pm10}</p>
                </li>
                <li class="highlight-metric">
                    <span>SO2</span>
                    <p>${so2}</p>
                </li>
                <li class="highlight-metric">
                    <span>CO</span>
                    <p>${co}</p>
                </li>
                <li class="highlight-metric">
                    <span>NO</span>
                    <p>${no}</p>
                </li>
                <li class="highlight-metric">
                    <span>NO2</span>
                    <p>${no2}</p>
                </li>
                <li class="highlight-metric">
                    <span>NH3</span>
                    <p>${nh3}</p>
                </li>
                <li class="highlight-metric">
                    <span>O3</span>
                    <p>${o3}</p>
                </li>
            </ul>
        `;
    }).catch(() => {
        `Failed to get air quality ind}ex :(`
    });
};
async function getCityCoordinates(cityName) {
    if(!cityName) return;
    let GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

    const response = await fetch(GEOCODING_API_URL);
    if(!response.ok) alert(`HTTP Error: ${response.status}`);

    const data = await response.json();
    if(data.length === 0) alert(`Failed to get coordinates of ${cityName} :(`);
    
    let {name, lat, lon, country, state} = data[0];
    getWeatherDetails(name, lat, lon, country, state);
};
async function getUserGeolocation(REVERSE_GEOCODING_API, latitude, longitude) {
    await fetch(REVERSE_GEOCODING_API).then(res => res.json()).then(data => {
        let {name, country, state} = data[0];
        getWeatherDetails(name, latitude, longitude, country, state);
    }).catch(() => {
        alert(`Failed to get your coordinates :(`);
    });
}
async function getUserCoordinates() {
    navigator.geolocation.getCurrentPosition(position => {
        let {latitude, longitude} = position.coords;
        getUserGeolocation(`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`, latitude, longitude);
    }, error => {
        if(error.code === error.PERMISSION_DENIED) alert("Geolocation permission denied. Please reset location permission to grant access again");
    });
};

// ОБРАБОТЧИКИ СОБЫТИЙ
headerSearchBtn.addEventListener("click", () => {
    getCityCoordinates(headerInput.value.trim());
});
headerLocationBtn.addEventListener("click", getUserCoordinates);
headerInput.addEventListener("keyup", (e) => {
    if(e.key === "Enter") getCityCoordinates(headerInput.value.trim());
});
window.addEventListener("load", getUserCoordinates());