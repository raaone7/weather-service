import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
	reservedActionMap,
	validReservedActions,
	type ReservedAction,
} from "../../types/handler.js";
import type { HTTPErrorCode } from "../../types/http.js";
import type {
	Event,
	GetHandlerFunction,
	HandlerOutput,
	LambdaEvent,
	LambdaEventHandlerParams,
	LambdaEventType,
	MainLambdaHandler,
} from "../../types/handler.js";

import { createLogger } from "../logger.js";
import { WeatherServiceError } from "../error.js";
import { handleApiGatewayEvent } from "./apiGateway.js";
import { handleEvent } from "./event.js";
import { createHandlerErrorResponse, handleHandlerError } from "./utils.js";

const HTTPErrorCodes = new Set(["400", "401", "404", "500", "502", "503"]);

const defaultCodeToHttpErrorCode = (code: string): HTTPErrorCode => {
	return HTTPErrorCodes.has(code) ? (Number(code) as HTTPErrorCode) : 500;
};

const sendLambdaOutput = (d: HandlerOutput<unknown>) => {
	// const { httpCode, ...response } = d;
	// const isError = response.status === "ERROR";
	// if (isError) throw new Error(JSON.stringify({ httpCode, response }));
	return d;
};

const getLambdaEventType = (lambdaEvent: LambdaEvent): LambdaEventType => {
	if ((lambdaEvent as Event)?.action) {
		const action = (lambdaEvent as Event).action;
		if (validReservedActions.has(action as ReservedAction)) {
			throw new Error("event.action is a reserved keyword");
		}
		return reservedActionMap.DEFAULT;
	}

	if (
		(lambdaEvent as APIGatewayProxyEventV2)?.version &&
		(lambdaEvent as APIGatewayProxyEventV2)?.routeKey
	) {
		return reservedActionMap.API_GATEWAY_HTTP;
	}

	throw new Error("unknown event");
};

const handleLambdaEvent = async (
	eventType: LambdaEventType,
	params: LambdaEventHandlerParams,
): Promise<HandlerOutput> => {
	try {
		if (eventType === "API_GATEWAY_HTTP") {
			const handlerOutput = await handleApiGatewayEvent(params);
			return handlerOutput;
		}
		const handlerOutput = await handleEvent(params);
		return handlerOutput;
	} catch (error) {
		const r = handleHandlerError({
			error: error as WeatherServiceError,
			codeToStatus: defaultCodeToHttpErrorCode,
		});
		params.logger.error("EVENT_UNKNOWN_ERROR", r.error);
		params.logger.info("REQUEST_RESPONSE", { request: params.lambdaEvent, response: r.response });
		return r.response;
	}
};

export const makeLambdaHandler = (getHandlerFunction: GetHandlerFunction) => {
	const lambdaHandler: MainLambdaHandler = async (lambdaEvent, lambdaContext) => {
		lambdaContext.callbackWaitsForEmptyEventLoop = false;

		const handleError = (message: string, code: string) => {
			const response = createHandlerErrorResponse(new WeatherServiceError(code, message), 400);
			logger.info("REQUEST_RESPONSE", { request: lambdaEvent, response, code });
			return response;
		};

		const loggerOptions = {
			awsTraceId: process.env._X_AMZN_TRACE_ID,
			awsRequestId: lambdaContext.awsRequestId,
		};
		const logger = createLogger(loggerOptions);

		let eventType: LambdaEventType;
		try {
			eventType = getLambdaEventType(lambdaEvent);
		} catch (error) {
			const err = error as WeatherServiceError;
			return sendLambdaOutput(handleError(err.message, "UNKNOWN_EVENT"));
		}

		const metadata = { requestId: lambdaContext.awsRequestId };

		const params = {
			eventType,
			getHandlerFunction,
			lambdaContext,
			lambdaEvent,
			logger,
			handleError,
			metadata,
		};

		const handlerOutput = await handleLambdaEvent(eventType, params);
		return sendLambdaOutput(handlerOutput);
	};
	return lambdaHandler;
};
