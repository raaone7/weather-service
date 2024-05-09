import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		env: {
			LOG_LEVEL: "error",
		},
		setupFiles: ["dotenv/config"],
	},
});
