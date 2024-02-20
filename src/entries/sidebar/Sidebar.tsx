import { useEffect, useState } from 'react'
import Auth from './Auth'
import Dashboard from './Dashboard'
import SideHeader from './SideHeader'
import { createBackgroundMessage } from '../../messaging/background'
import { LoginResp } from '@/api/types'

interface SideProps {
  removeSidebar: () => void
  token?: string
}

export default function Sidebar(props: SideProps) {
  const { token = '' } = props
  const [user, setUser] = useState<LoginResp>()

  useEffect(() => {
    const fetchInfo = async () => {
      const bgs = createBackgroundMessage()
      const user = await bgs.getUser()
      if (!user) {
        return
      }
      setUser(user)
      console.log('🚀 ~ fetchInfo ~ user:', user)
    }

    fetchInfo()
  }, [])

  return (
    <TokenContext.Provider value={token}>
      <div className="fixed top-0 right-0 bottom-0 z-9999 w-[300px] bg-base shadow-sm">
        <SideHeader onClose={props.removeSidebar} />

        {user && <Dashboard user={user} />}
        {!user && <Auth authSuccess={setUser} />}
      </div>
    </TokenContext.Provider>
  )
}
