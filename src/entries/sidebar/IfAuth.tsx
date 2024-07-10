import { createBackgroundMessage } from "@/messaging/background"
import { useSuspenseQuery } from "@tanstack/react-query"
import Dashboard from "./Dashboard"
import Auth from "./Auth"

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
