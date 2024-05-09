import { CityTable } from "../helpers/database/City.js";
import type { GetWeather } from "../types/function.js";
import { OpenWeatherMapClient } from "../helpers/openweathermap.js";
import { WeatherServiceError } from "../helpers/error.js";
import {
	WeatherHistoryTable,
	type WeatherHistoryDBItem,
} from "../helpers/database/WeatherHistory.js";

const method = "getWeather";
export const getWeather: GetWeather = async (params) => {
	const logger = params.logger.newLogger({ method });
	logger.info("INPUT", { input: params.payload, metadata: params.metadata })
	const { city: cityName } = params.payload;

	const openWeatherMapClient = new OpenWeatherMapClient();

	logger.debug("checking city");
	let city = await CityTable.instance.getItem({ city: cityName });
	if (!city) {
		logger.debug("city not found locally, fetching from open weather map");
		const geoLocations = await openWeatherMapClient.getGeoLocations(cityName);
		const cityDetail = geoLocations.find((city) => city.name === cityName);
		if (!cityDetail) throw new WeatherServiceError("404", "City detail not found");
		logger.debug("city detail fetched from open weather map");
		city = {
			city: cityDetail.name,
			coordinates: {
				latitude: cityDetail.lat,
				longitude: cityDetail.lon,
			},
			cityData: cityDetail,
			createdAt: new Date().toISOString(),
		};
		logger.debug("saving city locally for next time use");
		await CityTable.instance.putItem(city);
	}

	logger.debug("fetching weather forecast");
	const weatherForecast = await openWeatherMapClient.getWeatherForecast(
		city.coordinates.latitude,
		city.coordinates.longitude,
	);
	if (!weatherForecast) {
		logger.debug("no weather forecast returned by client");
		return {};
	}
	logger.debug("saving weather forecast as history");
	const weatherHistory: WeatherHistoryDBItem = {
		city: city.city,
		createdAt: new Date().toISOString(),
		weather: {
			temperature: weatherForecast.main.temp,
			temperatureMin: weatherForecast.main.temp_min,
			temperatureMax: weatherForecast.main.temp_max,
		},
		weatherData: weatherForecast,
	};
	await WeatherHistoryTable.instance.putItem(weatherHistory);

	return {
		data: weatherHistory,
	};
};
