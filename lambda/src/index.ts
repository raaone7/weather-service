import { getHandlerFunction } from "./functions/index.js";
import { makeLambdaHandler } from "./helpers/function/index.js";

export const handler = makeLambdaHandler(getHandlerFunction);
