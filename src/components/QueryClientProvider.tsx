import { QueryClient } from "@tanstack/react-query"
import { QueryClientProvider as ReactQueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
		},
	},
})

export default function QueryClientProvider({
	children,
}: { children: ReactNode }) {
	return (
		<ReactQueryClientProvider client={queryClient}>
			{children}
		</ReactQueryClientProvider>
	)
}
