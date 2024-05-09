import { DateTime } from "luxon";
import type { AnyJson } from "../../types/utils.js";
import { DynamoDBBaseTable } from "../base/dynamodb.js";
import { WeatherServiceError } from "../error.js";

export type WeatherHistoryDBKey = {
	city: string;
	createdAt: string;
};

export type WeatherHistoryDBItem = WeatherHistoryDBKey & {
	weather: {
		temperature: number;
		temperatureMin: number;
		temperatureMax: number;
	};
	weatherData: AnyJson;
};

// Table
export class WeatherHistoryTable extends DynamoDBBaseTable<
	WeatherHistoryDBKey,
	WeatherHistoryDBItem
> {
	private constructor() {
		super("WeatherHistory");
	}

	static #instance: WeatherHistoryTable;
	static get instance() {
		if (!this.#instance) this.#instance = new this();
		return this.#instance;
	}

	async getAllByCity(
		city: string,
		options: { start: string; end: string; limit: number; nextKey?: string },
	) {
		if (options.start > DateTime.now().toISO())
			throw new WeatherServiceError("400", "Invalid start date");
		if (options.start > options.end)
			throw new WeatherServiceError("400", "Start date cannot be after End date");

		const { items: weatherHistory, lastEvaluatedKey } = await this.paginatedQuery({
			KeyConditionExpression: "city = :city AND createdAt BETWEEN :start AND :end",
			ExpressionAttributeValues: {
				":city": city,
				":start": options.start,
				":end": options.end,
			},
			Limit: options.limit,
			ScanIndexForward: false,
		});
		return { history: weatherHistory, nextKey: lastEvaluatedKey };
	}
}
