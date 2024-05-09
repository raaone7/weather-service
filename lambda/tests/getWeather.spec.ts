import { describe, it, beforeAll, expect } from "vitest";
import { getWeather } from "../src/functions/getWeather.js";
import { createLogger } from "../src/helpers/logger.js";
import type { GetWeatherOutput } from "../src/types/function.js";
import { CityTable } from "../src/helpers/database/City.js";

describe("getWeather - test", () => {
	const city = "Melbourne";
	let getWeatherOutput: GetWeatherOutput;

	beforeAll(async () => {
		getWeatherOutput = await getWeather({
			logger: createLogger({ test: "test" }),
			payload: { city },
			metadata: { requestId: "testId" },
		});
	});

	it("should return weather data", () => {
		expect(getWeatherOutput.data?.city).to.be.eq(city);
		expect(getWeatherOutput.data?.weather).to.be.not.null;
		expect(getWeatherOutput.data?.weatherData).to.be.not.null;
	});

	it("a city record should be saved in DB", async () => {
		const cityItem = await CityTable.instance.getItem({ city });
		expect(cityItem).to.be.not.null;
		expect(cityItem?.city).to.be.eq(city);
	});
});
