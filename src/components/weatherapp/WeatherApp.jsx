import React, { useState, useEffect } from "react";
import "./WeatherApp.css";
import search_icon from "../assets/search.png";
import cloud_icon from "../assets/cloud.png";
import clear_icon from "../assets/clear.png";
import drizzle_icon from "../assets/drizzle.png";
import humidity_icon from "../assets/humidity.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";

const WeatherApp = () => {
  const api_key = "f8055877d55538a3abc3a65d57ed864b";

  const [weatherData, setWeatherData] = useState({
    icon: cloud_icon,
    temperature: "",
    location: "",
    humidity: "",
    windSpeed: "",
    description: "",
    minTemperature: "",
    maxTemperature: "",
  });

  const [forecastData, setForecastData] = useState([]);
  const [temperatureUnit, setTemperatureUnit] = useState("metric");
  const [currentPage, setCurrentPage] = useState(1);

  const toggleTemperatureUnit = () =>
    setTemperatureUnit((prevUnit) =>
      prevUnit === "metric" ? "imperial" : "metric"
    );

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      "01d": clear_icon,
      "01n": clear_icon,
      "02d": cloud_icon,
      "02n": cloud_icon,
      "03d": drizzle_icon,
      "03n": drizzle_icon,
      "04d": drizzle_icon,
      "04n": drizzle_icon,
      "10d": rain_icon,
      "10n": rain_icon,
      "09d": rain_icon,
      "09n": rain_icon,
      "13d": snow_icon,
      "13n": snow_icon,
    };
    return iconMap[iconCode] || clear_icon;
  };
  const [loading, setLoading] = useState(false);

  const Search = async () => {
    const element = document.getElementsByClassName("Cityinput");
    if (!element[0].value) {
      // Display an error message for empty input
      alert("Please enter a city name.");
      return;
    }
  
    try {
      // Set loading state
      setLoading(true);
  
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${element[0].value}&units=${temperatureUnit}&appid=${api_key}`;
      const response = await fetch(url);
  
      if (!response.ok) {
        // Display an error message for unsuccessful API response
        alert("City not found. Please enter a valid city name.");
        return;
      }
  
      const data = await response.json();
  
      setWeatherData({
        icon: getWeatherIcon(data.weather[0].icon),
        temperature: `${Math.floor(data.main.temp)}°${
          temperatureUnit === "metric" ? "C" : "F"
        }`,
        location: data.name,
        humidity: `${data.main.humidity}%`,
        windSpeed: `${Math.floor(data.wind.speed)} km/h`,
        description: data.weather[0].description,
        minTemperature: `${Math.floor(data.main.temp_min)}°${
          temperatureUnit === "metric" ? "C" : "F"
        }`,
        maxTemperature: `${Math.floor(data.main.temp_max)}°${
          temperatureUnit === "metric" ? "C" : "F"
        }`,
      });
  
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&units=${temperatureUnit}&appid=${api_key}`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
  
      const formattedForecastData = forecastData.list.map((item) => ({
        date: new Date(item.dt_txt).toLocaleDateString(),
        avgTemperature: `${Math.floor(item.main.temp)}°${
          temperatureUnit === "metric" ? "C" : "F"
        }`,
        description: item.weather[0].description,
      }));
  
      setForecastData(formattedForecastData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      // Display a generic error message for unexpected errors
      alert("An error occurred. Please try again later.");
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };
  

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const visibleForecastData = forecastData.slice(
    (currentPage - 1) * 5,
    currentPage * 5
  );

  return (
    <div className="container">
      <div className="card-container">
        <div className="card">
          <div className="top-bar">
            <input type="text" className="Cityinput" placeholder="Search" />
            <div className="search-icon" onClick={Search}>
              <img src={search_icon} alt="" />
            </div>
          </div>

          <div className="weather-info">
            <div className="weather-img">
              <img src={weatherData.icon} alt="" />
            </div>
            <div className="weather-temp">{weatherData.temperature}</div>
            <div className="weather-location">{weatherData.location}</div>
            <div className="data-container">
              <WeatherDataElement
                icon={humidity_icon}
                value={`${weatherData.humidity}`}
                text="Humidity"
              />
              <WeatherDataElement
                icon={wind_icon}
                value={`${weatherData.windSpeed}`}
                text="Wind Speed"
              />
              <WeatherDataElement
                value={`Description: ${weatherData.description}`}
              />
              <WeatherDataElement
                value={`Min Temp: ${weatherData.minTemperature}`}
              />
              <WeatherDataElement
                value={`Max Temp: ${weatherData.maxTemperature}`}
              />
            </div>
          </div>

          <div className="toggle-unit">
            <span
              onClick={toggleTemperatureUnit}
              className={temperatureUnit === "metric" ? "active" : ""}
            >
              °C
            </span>
            <span
              onClick={toggleTemperatureUnit}
              className={temperatureUnit === "imperial" ? "active" : ""}
            >
              °F
            </span>
          </div>
        </div>

        <div className="card forecast-card">
          <div className="forecast-container">
            <h2>5-Day Forecast</h2>
            <div className="forecast-scroll-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>
                      Temperature ({temperatureUnit === "metric" ? "C" : "F"})
                    </th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleForecastData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.date}</td>
                      <td>{item.avgTemperature}</td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt; Prev
              </button>
              {Array.from(
                { length: Math.ceil(forecastData.length / 5) },
                (_, i) => i + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={currentPage === pageNumber ? "active" : ""}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(forecastData.length / 5)}
              >
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WeatherDataElement = ({ icon, value, text }) => (
  <div className="elements">
    {icon && <img src={icon} alt="" className="icon" />}
    <div className="data">
      <div className={text ? "humidity-precent" : ""}>{value}</div>
      {text && <div className="text">{text}</div>}
    </div>
  </div>
);

export default WeatherApp;
