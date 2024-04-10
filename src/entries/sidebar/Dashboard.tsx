import type { LoginResp } from '@/api/types'
import Later from './Later'
import User from './User'

interface DashboardProps {
  user: LoginResp
}

export default function Dashboard(props: DashboardProps) {
  const { user } = props

  return (
    <div className='p-2'>
      <User {...user!} />
      <Later />
    </div>
  )
}
