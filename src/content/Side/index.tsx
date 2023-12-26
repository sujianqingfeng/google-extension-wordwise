import type { IUser } from '../../api/types'
import type { BackgroundFunctions } from '../../types'
import { createBirpc } from 'birpc'
import { useEffect, useState } from 'react'
import AuthButton from './AuthButton'
import SideHeader from './SideHeader'
import User from './User'

const rpc = createBirpc<BackgroundFunctions>(
  {},
  {
    on: (data) => chrome.runtime.onMessage.addListener(data),
    post: (data) => chrome.runtime.sendMessage(data)
  }
)

type SideProps = {
  removeSide: () => void
}

export default function Side(props: SideProps) {
  const [isLogin, setIsLogin] = useState(false)
  const [user, setUser] = useState<IUser>()
  const [loading, setLoading] = useState(false)

  const onAuthClick = async () => {
    setLoading(true)
    const [isOk, user] = await rpc.getAuthUser()
    if (!isOk) {
      return
    }
    setLoading(false)
    setUser(user)
    setIsLogin(true)
  }

  useEffect(() => {
    const getInfo = async () => {
      const isLogin = await rpc.getIsLogin()
      setIsLogin(isLogin)
      if (isLogin) {
        const user = await rpc.getUser()
        setUser(user)
        console.log('🚀 ~ file: index.tsx:45 ~ getInfo ~ user:', user)
      }
    }
    getInfo()
  }, [])

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[400px] z-9999 bg-white shadow">
      <SideHeader onClose={props.removeSide} />

      {isLogin ? (
        <User {...user!} />
      ) : (
        <div className="mt-2 flex justify-center items-center">
          <AuthButton loading={loading} onAuthClick={onAuthClick} />
        </div>
      )}
    </div>
  )
}
