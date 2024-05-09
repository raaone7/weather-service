import type { AnyJson } from "../../types/utils.js";
import { DynamoDBBaseTable } from "../base/dynamodb.js";

export type CityDBKey = {
	city: string;
};

export type CityDBItem = CityDBKey & {
	createdAt: string;
	coordinates: {
		latitude: number;
		longitude: number;
	};
	cityData: AnyJson;
};

// Table
export class CityTable extends DynamoDBBaseTable<CityDBKey, CityDBItem> {
	private constructor() {
		super("City");
	}

	static #instance: CityTable;
	static get instance() {
		if (!this.#instance) this.#instance = new this();
		return this.#instance;
	}
}
