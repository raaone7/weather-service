import { handleFunction } from "./utils.js";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import type { Event, HandlerOutput, LambdaEventHandlerParams } from "../../types/handler.js";

const transformApiGatewayEvent = (inputEvent: APIGatewayProxyEventV2) => {
	const metadata = {
		headers: JSON.stringify(inputEvent.headers),
		path: inputEvent.rawPath,
	};

	const body = JSON.parse(inputEvent.body ?? "{}");

	const payload = {
		...(inputEvent.queryStringParameters ?? {}),
		...(inputEvent.pathParameters ?? {}),
		...body,
	};

	//
	let action = inputEvent.rawPath;
	if (inputEvent.routeKey === "GET /weather/{city}") action = "getWeather";
	if (inputEvent.routeKey === "GET /weather/history/{city}") action = "getWeatherHistory";

	const event: Event = {
		action,
		payload: payload,
	};
	return { event, metadata };
};

export const handleApiGatewayEvent = async (
	params: LambdaEventHandlerParams,
): Promise<HandlerOutput> => {
	const { lambdaEvent, getHandlerFunction, logger } = params;
	const httpsEvent = params.lambdaEvent as APIGatewayProxyEventV2
	const { event } = transformApiGatewayEvent(httpsEvent);
	const action = event.action;
	const handlerFunction = getHandlerFunction(action);
	if (!handlerFunction) {
		return params.handleError(
			`api-gateway action:${action} is not supported`,
			"UNSUPPORTED_ACTION",
		);
	}

	const payload = event.payload ?? {};

	const response = await handleFunction({
		action,
		handlerFunction: handlerFunction,
		payload,
		metadata: params.metadata,
		logger,
	});
	logger.info("REQUEST_RESPONSE", { request: lambdaEvent, response });
	return response;
};
