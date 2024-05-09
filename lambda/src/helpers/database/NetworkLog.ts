import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { NetworkLogRequest, NetworkLogResponse } from "../../types/database.js";
import type { AnyJson } from "../../types/utils.js";
import { DynamoDBBaseTable } from "../base/dynamodb.js";

export type NetworkLogDBKey = {
	id: string;
};

export type NetworkLogDBItem = NetworkLogDBKey & {
	supplementaryId?: string;
	request: NetworkLogRequest;
	response: NetworkLogResponse & { milliseconds: number };
	vendor: string;
	service: string;
	serviceAction: string;
	additionalData?: AnyJson;
	createdAt: string;
	updatedAt: string;
	version: string;
};

// Table
export class NetworkLogTable extends DynamoDBBaseTable<NetworkLogDBKey, NetworkLogDBItem> {
	private constructor() {
		super("NetworkLog");
	}

	static #instance: NetworkLogTable;
	static get instance() {
		if (!this.#instance) this.#instance = new this();
		return this.#instance;
	}

	async getById(id: NetworkLogDBKey["id"]) {
		const {
			items: [item],
		} = await super.paginatedQuery({
			KeyConditionExpression: "#id=:id",
			ExpressionAttributeNames: { "#id": "id" },
			ExpressionAttributeValues: { ":id": id },
		});
		if (!item) return undefined;
		return item;
	}
}

export type NetworkLogRequestInput = {
	method: "GET" | "PUT" | "POST" | "DELETE" | "PATCH";
	fullUrl?: string;
	path: string;
	headers?: AnyJson;
	queryParams?: AnyJson;
	body?: AnyJson;
};

export type ParseOptions = {
	requestParse?: (request: NetworkLogRequest) => NetworkLogRequest;
	responseParse?: (response: NetworkLogResponse) => NetworkLogResponse;
	additionalRequestData?: AnyJson;
	skipNetworkLog?: boolean;
};

export class NetworkLog {
	#networkLogDBItem: NetworkLogDBItem;
	#networkLogTable: NetworkLogTable;
	#startMs = 0;
	#baseUrl: string;
	#requestParse?: (request: NetworkLogRequest) => NetworkLogRequest;
	#responseParse?: (request: NetworkLogResponse) => NetworkLogResponse;
	constructor(
		params: {
			supplementaryId?: string;
			vendor: string;
			category: string;
			operation: string;
			baseUrl: string;
		},
		options: ParseOptions = {},
	) {
		this.#networkLogTable = NetworkLogTable.instance;
		this.#baseUrl = params.baseUrl;
		this.#requestParse = options.requestParse;
		this.#responseParse = options.responseParse;
		const data: Omit<NetworkLogDBItem, "request" | "response"> = {
			id: randomUUID(),
			supplementaryId: params.supplementaryId,
			vendor: params.vendor,
			service: params.category,
			serviceAction: params.operation,
			version: randomUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		if (options.additionalRequestData) data.additionalData = options.additionalRequestData;
		this.#networkLogDBItem = data as NetworkLogDBItem;
	}

	async saveRequest(request: NetworkLogRequestInput) {
		this.#startMs = performance.now();
		const { fullUrl: full_url, path, ...rest } = request;
		const url = full_url ?? `${this.#baseUrl}/${path}`;
		const savedRequest = this.#requestParse
			? this.#requestParse({ ...rest, url })
			: { ...rest, url };
		this.#networkLogDBItem.request = savedRequest;
		this.#networkLogDBItem.updatedAt = new Date().toISOString();
		try {
			await this.#networkLogTable.putItem(this.#networkLogDBItem);
		} catch {
			// ignore
		}
	}

	async saveResponse(response: NetworkLogResponse) {
		const milliseconds = performance.now() - this.#startMs;
		if (!this.#networkLogDBItem?.request) throw new Error("request not set");
		const savedResponse = this.#responseParse ? this.#responseParse(response) : response;
		this.#networkLogDBItem.response = { ...savedResponse, milliseconds };
		this.#networkLogDBItem.updatedAt = new Date().toISOString();
		const previousVersion = this.#networkLogDBItem.version;
		this.#networkLogDBItem.version = randomUUID();

		try {
			await this.#networkLogTable.putItem(this.#networkLogDBItem, {
				ConditionExpression: "#version = :previousVersion",
				ExpressionAttributeNames: { "#version": "version" },
				ExpressionAttributeValues: { ":previousVersion": previousVersion },
			});
		} catch {
			// ignore
		}
	}
}

export const makeNetworkLog = <C extends string, O extends string>(input: {
	vendor: string;
	category: C;
	baseUrl: string;
}) => {
	const createNetworkLog = (operation: O, supplementaryId?: string, options: ParseOptions = {}) => {
		const skip = options.skipNetworkLog === true;
		if (skip) return undefined;
		const data = { ...input, operation, supplementaryId };
		return new NetworkLog(data, options);
	};
	return createNetworkLog;
};
