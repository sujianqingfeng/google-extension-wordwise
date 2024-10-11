import react from "@vitejs/plugin-react"
import { defineConfig } from "wxt"

export default defineConfig({
	srcDir: "src",
	entrypointsDir: "entries",
	outDir: "output",
	manifest: {
		name: "wordwise",
		permissions: ["identity", "storage", "identity.email"],
		action: { default_popup: "" },
		// @ts-ignore
		key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApyPlTYNRy66gAw07db1FNrix+rqO2X2L+y402Lp0UKPDSKRTxCu2bieWs+r/7yISvpXMqBto88CI+L1pHCJIAy00xsHicbtdXMU/BAHDwfBdADsGcREOofSVHLsESM573GB+lJ6ZaJNPyexL1gtwm5M5lFRrhicdOLj8ZKZ01tlBRbb5FMAdMS42fO8pLaXOpd0hOvXhITCqb9a4sxUr4uYuSxOksBoODOhFWwqEIydIKRBwNzd+XxryGJMxL9Z5YopQA4SrVAj4N2pGCuGLOxoTTYDw+0s7UGPnLmCeQBP4Y2KmrO4FYUbHEtNeoSu9SzNcHmxvFzVB/UwF9zDMXQIDAQAB",
		oauth2: {
			client_id:
				"760731858259-16mtvml2m9lqss4138me5cmi0hntj4qe.apps.googleusercontent.com",
			scopes: ["openid", "email", "profile"],
		},
	},
	runner: {
		disabled: true,
	},
	vite: () => ({
		plugins: [react()],
	}),
})
