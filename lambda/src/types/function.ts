import type { WeatherHistoryDBItem } from "../helpers/database/WeatherHistory.js";
import type { SimpleHandlerFunction } from "./handler.js";

export type GetWeatherInput = {
	city: string;
};

export type GetWeatherOutput = {
	data?: WeatherHistoryDBItem;
};

export type GetWeather = SimpleHandlerFunction<GetWeatherInput, GetWeatherOutput>;

export type GetWeatherHistoryInput = {
	city: string;
	start?: string;
	end?: string;
	nextKey?: string;
	limit?: number;
};

export type GetWeatherHistoryOutput = {
	city: string;
	start: string;
	end: string;
	count: number;
	nextKey?: string;
	history: WeatherHistoryDBItem[];
};

export type GetWeatherHistory = SimpleHandlerFunction<
	GetWeatherHistoryInput,
	GetWeatherHistoryOutput
>;
