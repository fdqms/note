import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	optimizeDeps: {
		exclude: ["@surrealdb/wasm"],
		esbuildOptions: {
			target: "esnext",
		},
	},
	esbuild: {
		supported: {
			"top-level-await": true,
		},
	},
});
