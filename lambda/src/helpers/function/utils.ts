import type { HTTPErrorCode, HTTPSuccessCode } from "../../types/http.js";
import type {
	FunctionOutput,
	HandlerErrorResponse,
	HandlerFunction,
	HandlerSuccessResponse,
} from "../../types/handler.js";

import type { Logger } from "../logger.js";
import type { WeatherServiceError } from "../error.js";

const HTTPSuccessCodes = new Set(["200", "201"]);
const HTTPErrorCodes = new Set(["400", "401", "404", "500", "502", "503"]);

const defaultCodeToHttpSuccessCode = (code: string): HTTPSuccessCode => {
	return HTTPSuccessCodes.has(code) ? (Number(code) as HTTPSuccessCode) : 200;
};

const defaultCodeToHttpErrorCode = (code: string): HTTPErrorCode => {
	return HTTPErrorCodes.has(code) ? (Number(code) as HTTPErrorCode) : 500;
};

export const createHandlerErrorResponse = (
	error: WeatherServiceError,
	httpCode: HTTPErrorCode,
): HandlerErrorResponse => {
	return { status: "ERROR", httpCode, error };
};

const createHandlerSuccessResponse = <T>(
	result: FunctionOutput<T>,
	httpCode: HTTPSuccessCode = 200,
): HandlerSuccessResponse<T> => {
	return { status: "SUCCESS", result, httpCode };
};

export const handleHandlerSuccess = <T>(params: {
	result: FunctionOutput<T>;
	codeToStatus: (code: string) => HTTPSuccessCode;
}) => {
	const code = params.result.code ?? "200";
	const httpCode = params?.codeToStatus(code) ?? 200;
	const response = createHandlerSuccessResponse(params.result, httpCode);
	return { response };
};

export const handleHandlerError = (params: {
	error: WeatherServiceError;
	codeToStatus: (code: string) => HTTPErrorCode;
}) => {
	const { codeToStatus } = params;
	const error = params.error;
	const code = error.code ?? "500";
	const httpCode = codeToStatus(code);
	const response = createHandlerErrorResponse(error, httpCode);
	return { response, error };
};

export const handleFunction = async <Payload, OutputData, Metadata>(params: {
	logger: Logger;
	handlerFunction: HandlerFunction<Payload, OutputData, Metadata>;
	action: string;
	payload: Payload;
	metadata: Metadata;
	additionalMetadata?: Record<string, unknown>;
	successCodeToStatus?: (code: string) => HTTPSuccessCode;
	errorCodeToStatus?: (code: string) => HTTPErrorCode;
}) => {
	const { handlerFunction, action, payload } = params;
	const logger = params.logger.newLogger({ handler: action });
	const metadata = { ...params.metadata, ...(params.additionalMetadata ?? {}) };

	try {
		const functionResponse = await handlerFunction({ logger, payload, metadata });
		const { response } = handleHandlerSuccess({
			result: functionResponse,
			codeToStatus: params.successCodeToStatus ?? defaultCodeToHttpSuccessCode,
		});
		return response;
	} catch (err) {
		const { error, response } = handleHandlerError({
			error: err as WeatherServiceError,
			codeToStatus: params.errorCodeToStatus ?? defaultCodeToHttpErrorCode,
		});
		logger.error(action, error);
		return response;
	}
};
