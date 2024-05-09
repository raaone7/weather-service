import type { WeatherServiceError } from "../helpers/error.js";
import type { Logger } from "../helpers/logger.js";
import type { HTTPErrorCode, HTTPSuccessCode } from "./http.js";
import type { Context, APIGatewayProxyEventV2 } from "aws-lambda";

export type Event = {
	action: string;
	payload: Record<string, unknown>;
	metadata?: SimpleMetadata;
};

// INPUT
export type FunctionInput<Payload, Metadata> = {
	logger: Logger;
	payload: Payload;
	metadata: Metadata;
};

export type FunctionOutputBase = {
	message?: string;
	code?: string;
	requestId?: string;
};

// OUTPUT
export type FunctionOutput<Data = undefined> = Data extends undefined
	? FunctionOutputBase
	: Data & FunctionOutputBase;

// FUNCTION
export type HandlerFunction<Payload, Output, Metadata> = (
	input: FunctionInput<Payload, Metadata>,
) => Promise<FunctionOutput<Output>>;

export type SimpleMetadata = {
	requestId: string;
};

export type GetHandlerFunction = <I, O, M>(action: string) => HandlerFunction<I, O, M> | undefined;
export type SimpleHandlerFunction<Payload, Output = unknown> = HandlerFunction<
	Payload,
	Output,
	SimpleMetadata
>;

export type HandlerSuccessResponse<Data> = {
	httpCode: HTTPSuccessCode;
	status: "SUCCESS";
	result: FunctionOutput<Data>;
};

export type HandlerErrorResponse = {
	httpCode: HTTPErrorCode;
	status: "ERROR";
	error: WeatherServiceError;
};

export type HandlerOutput<Data = undefined> = HandlerSuccessResponse<Data> | HandlerErrorResponse;

type ReservedActionMap = {
	[status in ReservedAction]: status;
};
export const reservedActionMap: ReservedActionMap = {
	API_GATEWAY_HTTP: "API_GATEWAY_HTTP",
	DEFAULT: "DEFAULT",
};
export const validReservedActions = new Set(Object.values(reservedActionMap));

export type LambdaEventType = ReservedAction;
export type LambdaEvent = Event | APIGatewayProxyEventV2;
export type LambdaEventHandlerParams = {
	eventType: LambdaEventType;
	getHandlerFunction: GetHandlerFunction;
	lambdaContext: Context;
	lambdaEvent: LambdaEvent;
	logger: Logger;
	handleError: (message: string, code: string) => HandlerErrorResponse;
	metadata: SimpleMetadata;
};

export type MainLambdaHandler = (
	lambdaEvent: LambdaEvent,
	lambdaContext: Context,
) => Promise<HandlerOutput>;
// ) => Promise<FunctionOutputBase>;

export type ReservedAction = "API_GATEWAY_HTTP" | "DEFAULT";
