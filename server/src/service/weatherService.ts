import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates{
  latitude: number;
  longitude: number;
}
// TODO: Define a class for the Weather object
// city, date, icon, iconDescription, tempF, windSpeed, humidity
class Weather{
  city: string;
  date: string;
  tempF: number;
  icon: string;
  iconDescription: string;
  humidity: number;
  windSpeed: number;
  
  constructor(city: string, date: string, tempF: number, icon: string, iconDescription: string, humidity: number, windSpeed: number){
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private cityName: string;
  
  constructor(){
    this.baseURL = process.env.API_BASE_URL || ' ';
    this.apiKey = process.env.API_KEY || ' ';
    this.cityName = ' ';
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(_query: string) {
    const response = await fetch(this.buildGeocodeQuery());
    const data = await response.json();
    console.log(data)
    return this.destructureLocationData(data[0]);
    
  }
  // TODO: Create destructureLocationData method
   
  private destructureLocationData(locationData: any): Coordinates{
    return{
      latitude: locationData.lat,
      longitude: locationData.lon,
    };
  }
  // TODO: Create buildGeocodeQuery method

    private buildGeocodeQuery(): string {
      return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
    }
  // TODO: Create buildWeatherQuery method
   private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=imperial`;
   }

   private buildForecastQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=imperial`;
   }
  // TODO: Create fetchAndDestructureLocationData method
    private async fetchAndDestructureLocationData() {
      const locationData = await this.fetchLocationData(this.cityName);
      console.log(locationData)
      return locationData;
     
    }
  // TODO: Create fetchWeatherData method
   private async fetchWeatherData(coordinates: Coordinates) {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    const data = await response.json();
    return this.parseCurrentWeather(data);
   }
  // TODO: Build parseCurrentWeather method
     private parseCurrentWeather(response: any): Weather {
      console.log(response)

      return new Weather(
        this.cityName,
        new Date().toDateString(),
        response.main.temp,
        response.weather[0].icon,
        response.weather[0].description,
        response.main.humidity,
        response.wind.speed
      );
     }
  // TODO: Complete buildForecastArray method
     private buildForecastArray(_currentWeather: Weather, weatherData: any[]): Weather[]{
      console.log(weatherData)
      return weatherData.map(data => new Weather(
        this.cityName,
        data.dt_txt,
        data.main.temp,
        data.weather[0].icon,
        data.weather[0].description,
        data.main.humidity,
        data.wind.speed
      ));
     }
  // TODO: Complete getWeatherForCity method
    async getWeatherForCity(city: string) {
      this.cityName = city;
      const coordinate = await this.fetchAndDestructureLocationData();
      console.log(coordinate)
      const currentWeather = await this.fetchWeatherData(coordinate);

      const response =await fetch(this.buildForecastQuery(coordinate));
      const data = await response.json();

      // console.log(data);

      const selectedData = data.list.filter((weather: any) => {
        return weather.dt_txt.includes("12:00:00")
      })

      console.log(selectedData)

      const forcastArray = this.buildForecastArray(currentWeather, selectedData);

      return [currentWeather, ...forcastArray];
      // return [currentWeather]
    }
}

export default new WeatherService();
