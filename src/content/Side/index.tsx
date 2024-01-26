import type { IAuthProvidersRespItem, IUser } from '../../api/types'
import type { BackgroundFunctions } from '../../types'
import { createBirpc } from 'birpc'
import { useEffect, useState } from 'react'
import { fetchAuthProvidersApi } from '../../api'
import AuthButton from '../../entries/sider/AuthButton'
import Later from '../../entries/sider/Later'
import SideHeader from '../../entries/sider/SideHeader'
import User from '../../entries/sider/User'

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
  const [authProvides, setAuthProviders] = useState<IAuthProvidersRespItem[]>(
    []
  )

  const onAuthClick = async (item: IAuthProvidersRespItem) => {
    setLoading(true)
    const [isOk, user] = await rpc.getAuthUser(item.authUrl)
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
        return
      }

      const [isOk, data] = await fetchAuthProvidersApi()
      if (!isOk) {
        return
      }
      setAuthProviders(data)
    }
    getInfo()
  }, [])

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[400px] z-9999 bg-base shadow">
      <SideHeader onClose={props.removeSide} />

      {isLogin ? (
        <div>
          <User {...user!} />
          <Later />
        </div>
      ) : (
        <div className="mt-2 flex justify-center items-center">
          {authProvides.map((item) => (
            <AuthButton
              key={item.provider}
              loading={loading}
              onAuthClick={() => onAuthClick(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
