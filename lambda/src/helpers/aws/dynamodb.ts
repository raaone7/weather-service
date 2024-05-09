import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	GetCommand,
	PutCommand,
	QueryCommand,
	DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

import type { GetCommandInput, PutCommandInput, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { credentials } from "./credentials.js";

export class AwsDynamoDB {
	readonly #client: DynamoDBDocumentClient;
	private constructor() {
		const ddbClient = new DynamoDBClient({
			region: process.env.AWS_REGION ?? "us-east-1",
			credentials,
		});
		this.#client = DynamoDBDocumentClient.from(ddbClient, {
			marshallOptions: {
				removeUndefinedValues: true,
			},
		});
	}

	static #instance: AwsDynamoDB;
	static get instance() {
		if (!this.#instance) this.#instance = new this();
		return this.#instance;
	}

	getCommand(params: GetCommandInput) {
		const command = new GetCommand(params);
		return this.#client.send(command);
	}

	putCommand(params: PutCommandInput) {
		const command = new PutCommand(params);
		return this.#client.send(command);
	}

	queryCommand(params: QueryCommandInput) {
		const command = new QueryCommand(params);
		return this.#client.send(command);
	}
}
