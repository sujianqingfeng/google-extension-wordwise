import type { UserResp } from "@/api/types"
import User from "./User"

interface DashboardProps {
	user: UserResp
}

export default function Dashboard({ user }: DashboardProps) {
	return (
		<div className="animate-fade-in">
			<User {...user} />
		</div>
	)
}
