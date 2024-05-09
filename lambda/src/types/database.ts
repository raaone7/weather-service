import type { HttpCallResponse } from "./http.js";
import type { AnyJson } from "./utils.js";

export type NetworkLogRequest = {
	method: "GET" | "PUT" | "POST" | "DELETE" | "PATCH";
	url: string;
	headers?: AnyJson;
	queryParams?: AnyJson;
	body?: AnyJson;
};

export type NetworkLogResponse = HttpCallResponse<unknown>;
