import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type {
	GetCallOptions,
	HttpClientOutput,
	HttpClientParams,
	IHttpClient,
} from "../base/http.js";
import type { HttpCallResponse, HttpResponseHeaders, RequestOptions } from "../../types/http.js";

const parseError = (error: unknown, method: string): never => {
	if (error instanceof Error) {
		error.message = `[httpClient.${method}] - ${error.message}`;
		throw error;
	}
	throw error;
};

export class AxiosHttpClient implements IHttpClient {
	readonly #client: AxiosInstance;
	constructor(params: HttpClientParams) {
		this.#client = axios.create({
			baseURL: params.baseUrl,
			headers: params.headers,
			timeout: params.timeoutMs,
		});
	}

	#createOutput<T>(response: AxiosResponse<T>): HttpCallResponse<T> {
		return {
			data: response.data,
			statusCode: response.status,
			statusMessage: response.statusText,
			headers: response.headers as HttpResponseHeaders,
		};
	}

	static async request<T>(options: RequestOptions): HttpClientOutput<T> {
		const response = await axios.request({
			method: options.method,
			url: options.url,
			headers: options.headers,
			timeout: options.timeoutMs,
			maxBodyLength: options.maxBodyLength,
			maxContentLength: options.maxContentLength,
			data: options.body,
		});
		return {
			data: response.data,
			statusCode: response.status,
			statusMessage: response.statusText,
			headers: response.headers as HttpResponseHeaders,
		};
	}

	async get<T>(path: string, options: GetCallOptions = {}): HttpClientOutput<T> {
		try {
			const response = await this.#client.get<T>(path, {
				headers: options.headers,
				timeout: options.timeoutMs,
				maxBodyLength: options.maxBodyLength,
				maxContentLength: options.maxContentLength,
			});
			return this.#createOutput(response);
		} catch (error) {
			return parseError(error, "get");
		}
	}
}
