import { describe, it, beforeAll, expect } from "vitest";
import { getWeatherHistory } from "../src/functions/getWeatherHistory.js";
import { createLogger } from "../src/helpers/logger.js";
import type { GetWeatherHistoryOutput } from "../src/types/function.js";

describe("getWeatherHistory - test", () => {
	const city = "Melbourne";
	let getWeatherHistoryOutput: GetWeatherHistoryOutput;

	beforeAll(async () => {
		getWeatherHistoryOutput = await getWeatherHistory({
			logger: createLogger({ test: "test" }),
			payload: { city },
			metadata: { requestId: "testId" },
		});
	});

	it("should return weather history", () => {
		expect(getWeatherHistoryOutput.city).to.be.eq(city);
		expect(getWeatherHistoryOutput.count).to.be.gt(1);
		expect(getWeatherHistoryOutput.history).to.be.not.empty;
		expect(getWeatherHistoryOutput.count).to.be.eq(getWeatherHistoryOutput.history.length);
	});
});
