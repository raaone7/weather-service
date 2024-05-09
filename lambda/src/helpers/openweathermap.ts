import type { AxiosError } from "axios";
import type { GeoLocation, WeatherForecast } from "../types/openWeatherMap.js";
import { NetworkLog } from "./database/NetworkLog.js";
import { AxiosHttpClient } from "./http/AxiosHttpClient.js";

const baseUrl = "http://api.openweathermap.org";
export class OpenWeatherMapClient {
	#httpClient: AxiosHttpClient;
	#apiKey: string;

	constructor() {
		this.#apiKey = process.env.OPEN_WEATHER_API_KEY as string;
		this.#httpClient = new AxiosHttpClient({ baseUrl });
	}

	async getGeoLocations(city: string): Promise<GeoLocation[] | []> {
		const networkLog = new NetworkLog({
			baseUrl,
			operation: "GET",
			category: "GEO",
			vendor: "OPEN_WEATHER_MAP",
		});
		try {
			const path = `/geo/1.0/direct?q=${city}&appid=${this.#apiKey}`;
			await networkLog.saveRequest({ method: "GET", path });
			const response = await this.#httpClient.get(path);
			await networkLog.saveResponse({
				data: response.data,
				statusCode: response.statusCode,
				statusMessage: response.statusMessage,
			});
			return response.data as GeoLocation[];
		} catch (error) {
			const axiosError = error as AxiosError;
			await networkLog.saveResponse({
				data: axiosError.response,
				statusCode: axiosError.status as number,
				statusMessage: axiosError.message,
			});
			return [];
		}
	}

	async getWeatherForecast(
		latitude: number,
		longitude: number,
	): Promise<WeatherForecast | undefined> {
		const networkLog = new NetworkLog({
			baseUrl,
			operation: "GET",
			category: "WEATHER",
			vendor: "OPEN_WEATHER_MAP",
		});
		try {
			const path = `/data/2.5/weather/?lat=${latitude}&lon=${longitude}&appid=${this.#apiKey}`;
			await networkLog.saveRequest({ method: "GET", path });
			const response = await this.#httpClient.get(path);
			await networkLog.saveResponse({
				data: response.data,
				statusCode: response.statusCode,
				statusMessage: response.statusMessage,
			});
			return response.data as WeatherForecast;
		} catch (error) {
			const axiosError = error as AxiosError;
			await networkLog.saveResponse({
				data: axiosError.response,
				statusCode: axiosError.status as number,
				statusMessage: axiosError.message,
			});
			return;
		}
	}
}
