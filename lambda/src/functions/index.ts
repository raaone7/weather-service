import type { GetHandlerFunction, HandlerFunction } from "../types/handler.js";
import { getWeather } from "./getWeather.js";
import { getWeatherHistory } from "./getWeatherHistory.js";

//@ts-ignore
const handlers: Record<string, HandlerFunction> = {
	getWeather,
	getWeatherHistory,
};

export const getHandlerFunction: GetHandlerFunction = (eventAction: string) =>
	handlers[eventAction];
