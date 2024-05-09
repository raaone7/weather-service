export type ClientErrorHttpCode = 400 | 401 | 404;
export type ServerErrorHttpCode = 500 | 501 | 502 | 503;
export type HTTPErrorCode = ClientErrorHttpCode | ServerErrorHttpCode;
export type HTTPSuccessCode = 200 | 201;

export type HttpResponseHeaders = Record<string, string>;
export type HttpRequestHeaders = Record<string, string>;

export type HttpCallOptions = {
	headers?: HttpRequestHeaders;
	timeoutMs?: number;
	maxBodyLength?: number;
	maxContentLength?: number;
};

export type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE" | "PATCH";

export type RequestOptions = HttpCallOptions & {
	method: HTTPMethod;
	url: string;
	body?: unknown;
};

export type HttpCallResponse<T> = {
	data: T;
	statusCode: number;
	statusMessage: string;
	headers?: HttpResponseHeaders;
	ip?: string;
};
