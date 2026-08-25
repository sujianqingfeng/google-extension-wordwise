import { useSuspenseQuery } from "@tanstack/react-query"
import { createBackgroundMessage } from "@/messaging/background"
import Auth from "./Auth"
import Dashboard from "./Dashboard"

export default function IfAuth() {
	const { data, refetch } = useSuspenseQuery({
		queryKey: ["user"],
		queryFn: async () => {
			return await createBackgroundMessage().getUser()
		},
	})

	if (data) {
		return <Dashboard user={data} />
	}

	return <Auth success={refetch} />
}
