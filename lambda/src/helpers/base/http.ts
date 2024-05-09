import type { HttpCallOptions, HttpCallResponse } from "../../types/http.js";

export type GetCallOptions = HttpCallOptions;

export type HttpClientOutput<T> = Promise<HttpCallResponse<T>>;

export type HttpClientParams = {
	headers?: Record<string, string>;
	baseUrl: string;
	timeoutMs?: number;
};

export type IHttpClient = {
	get<T>(url: string, options: GetCallOptions): HttpClientOutput<T>;
};
