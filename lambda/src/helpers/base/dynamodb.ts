import type { GetCommandInput, PutCommandInput, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { AwsDynamoDB } from "../aws/dynamodb.js";

type DynamoDBItem = Record<string, unknown>;
type DynamoDBItemKey = Record<string, unknown>;

export type GetItemParams = Omit<GetCommandInput, "TableName" | "Key">;
export type PutItemParams = Omit<PutCommandInput, "TableName" | "Item"> & {
	removeEmptyStrings?: boolean;
};

export type QueryItemsParams = Omit<QueryCommandInput, "TableName">;
export type PaginatedQueryParams = Omit<QueryCommandInput, "TableName" | "FilterExpression">;
export type PaginatedQueryResult<DbItem, DbKey> = Promise<{
	items: DbItem[];
	lastEvaluatedKey: DbKey | undefined;
}>;

const getDynamodbLimit = (limit?: number) => {
	const l = limit ?? 0;
	return l > 0 ? l : undefined;
};

export class DynamoDBBaseTable<K extends DynamoDBItemKey, T extends DynamoDBItem> {
	readonly #tableName: string;
	#instance = AwsDynamoDB.instance;
	constructor(tableName: string) {
		this.#tableName = tableName;
	}

	get TableName() {
		return this.#tableName;
	}

	#parseError(error: unknown, classMethod: string): never {
		if (error instanceof Error) {
			const method = `dynamodb.${this.#tableName}.${classMethod}`;
			const message = `${method} - ${error?.message ?? "Unknown message"}`;
			throw new Error(message);
		}
		throw error;
	}

	async getItem(key: K, params: GetItemParams = {}): Promise<T | undefined> {
		try {
			const result = await this.#instance.getCommand({
				TableName: this.#tableName,
				Key: key,
				...params,
			});
			return result.Item as T;
		} catch (error) {
			this.#parseError(error, this.getItem.name);
		}
	}

	async putItem(record: T, params: PutItemParams = {}): Promise<void> {
		try {
			const { removeEmptyStrings, ..._params } = params;
			if (removeEmptyStrings === true) {
				for (const key in record) {
					// @ts-ignore
					if (record[key] === "") record[key] = undefined;
				}
			}
			await this.#instance.putCommand({ TableName: this.#tableName, Item: record, ..._params });
		} catch (error) {
			this.#parseError(error, this.putItem.name);
		}
	}

	async paginatedQuery(params: PaginatedQueryParams = {}): Promise<PaginatedQueryResult<T, K>> {
		try {
			const { Limit, ...rest } = params;
			const queryParams: QueryItemsParams = { ...rest };
			queryParams.Limit = getDynamodbLimit(Limit);

			const data = await this.#instance.queryCommand({
				TableName: this.#tableName,
				...queryParams,
			});
			const items = (data.Items ?? []) as T[];
			const lastEvaluatedKey = data.LastEvaluatedKey as K | undefined;
			return { items, lastEvaluatedKey };
		} catch (error) {
			this.#parseError(error, this.paginatedQuery.name);
		}
	}
}
