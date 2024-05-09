import { DateTime } from "luxon";
import type { GetWeatherHistory } from "../types/function.js";
import { WeatherHistoryTable } from "../helpers/database/WeatherHistory.js";

const method = "getWeatherHistory";
export const getWeatherHistory: GetWeatherHistory = async (params) => {
	const {
		city,
		start = DateTime.now().minus({ week: 1 }).toUTC().toISO(),
		end = DateTime.now().toUTC().toISO(),
		limit = 50,
		nextKey,
	} = params.payload;
	const logger = params.logger.newLogger({
		method,
		city,
		start,
		end,
		limit,
		nextKey,
	});

	logger.debug("fetching history");
	const { history } = await WeatherHistoryTable.instance.getAllByCity(city, {
		start,
		end,
		limit,
		nextKey,
	});
	logger.debug("history fetched");

	return {
		city,
		start,
		end,
		count: history.length,
		history,
	};
};
