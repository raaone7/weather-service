import { handleFunction } from "./utils.js";
import type { HandlerOutput, LambdaEventHandlerParams, Event } from "../../types/handler.js";

export const handleEvent = async (params: LambdaEventHandlerParams): Promise<HandlerOutput> => {
	const { lambdaEvent, getHandlerFunction, logger } = params;
	const event = lambdaEvent as Event;
	const action = event.action;
	const handlerFunction = getHandlerFunction(action);
	if (!handlerFunction) {
		return params.handleError(`action:${action} is not supported`, "UNSUPPORTED_ACTION");
	}

	const payload = event.payload ?? {};

	const response = await handleFunction({
		action,
		handlerFunction,
		payload,
		metadata: params.metadata,
		logger,
		additionalMetadata: event.metadata,
	});
	logger.info("REQUEST_RESPONSE", { request: lambdaEvent, response });
	return response;
};
