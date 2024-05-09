import { pino } from "pino";
import type { Logger as PinoLogger, LoggerOptions } from "pino";

type PinoBaseLogLevel = "debug" | "info" | "warn" | "error";
type LoggerLogLevel = PinoBaseLogLevel;

export type LogLevel = "debug" | "info";
export type LoggerProperties = Record<string, unknown>;
export type Options = {
	logLevel?: LogLevel;
	transport?: LoggerOptions["transport"];
};

export class Logger {
	readonly #PinoLogger: PinoLogger<LoggerLogLevel>;
	constructor(properties: LoggerProperties, options: Options = {}) {
		const loggerOptions: LoggerOptions<LoggerLogLevel> = {
			base: properties,
			formatters: {
				level(label, number) {
					return { level: label ?? number };
				},
			},
			level: options.logLevel ?? process.env.LOG_LEVEL ?? "info",
			messageKey: "message",
			nestedKey: "payload",
			timestamp: pino.stdTimeFunctions.isoTime,
		};
		this.#PinoLogger = pino(loggerOptions);
	}

	debug(message: string, payload?: object) {
		this.#PinoLogger.debug(payload, message);
	}

	info(message: string, payload?: object) {
		this.#PinoLogger.info(payload, message);
	}

	warn(message: string, payload?: object) {
		this.#PinoLogger.warn(payload, message);
	}

	error(message: string, payload?: object) {
		this.#PinoLogger.error(payload, message);
	}

	newLogger(properties: LoggerProperties = {}, options: LoggerOptions = {}) {
		const currentProperties = this.#PinoLogger.bindings();
		const updatedProperties = { ...currentProperties, ...properties };
		const newChildLogger = createLogger(updatedProperties, options);
		return newChildLogger;
	}
}

export const createLogger = (baseProperties: LoggerProperties, options: LoggerOptions = {}) =>
	new Logger(baseProperties, options);
