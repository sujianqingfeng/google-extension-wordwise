import type { UserResp } from "@/api/types"
import Later from "./Later"
import User from "./User"

interface DashboardProps {
  user: UserResp
}
export default function Dashboard({ user }: DashboardProps) {
  return (
    <div className="p-2">
      <User {...user} />
      <Later />
    </div>
  )
}
