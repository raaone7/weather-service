import event from "./event.json";
import { handler } from "../src/index.js";
import type { Context } from "aws-lambda";
import type { LambdaEvent, MainLambdaHandler } from "../src/types/handler.js";

const SPACER = "-------";
const LINE = "--------------";

const lambdaContext = { awsRequestId: "awsRequestId.testLambda" } as Context;
export const testLambda = async (handler: MainLambdaHandler, lambdaEvent: LambdaEvent) => {
	console.log(`${SPACER} STARTING REQUEST ${SPACER}`);
	try {
		const response = await handler(lambdaEvent, lambdaContext);
		console.log(`${SPACER} END REQUEST (SUCCESS) ${SPACER}`);
		console.log(`${SPACER} RESPONSE ${SPACER}`);
		console.log(JSON.stringify(response, null, 2));
		console.log(LINE);
		console.log("\n");
	} catch (error) {
		const { httpCode, response } = JSON.parse((error as Error).message);
		console.log(`${SPACER} END REQUEST (ERROR) ${SPACER}`);
		console.log(`${SPACER} HTTP CODE:${httpCode} ${SPACER}`);
		console.log(JSON.stringify(response, null, 2));
		console.log(LINE);
		console.log("\n");
	}
};

await testLambda(handler, event);
