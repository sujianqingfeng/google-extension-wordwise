import { createBirpc } from 'birpc'
import { useEffect, useState } from 'react'
import AuthButton from './AuthButton'
import SideHeader from './SideHeader'
import User from './User'
import { LoginResp } from '../../api/types'
import { BACKGROUND_MESSAGE_TYPE } from '../../constants'
import { BackgroundFunctions } from '../../types'

type SideProps = {
  removeSide: () => void
}

export default function Side(props: SideProps) {
  const [isLogin, setIsLogin] = useState(false)
  const [user, setUser] = useState<LoginResp>()
  const [loading, setLoading] = useState(false)

  const onAuthClick = async () => {
    console.log(
      '🚀 ~ file: index.tsx:43 ~ onAuthClick ~ onAuthClick:',
      onAuthClick
    )
    const rpc = createBirpc<BackgroundFunctions>(
      {},
      {
        on: (data) => chrome.runtime.onMessage.addListener(data),
        post: (data) => chrome.runtime.sendMessage(data)
      }
    )
    const a = await rpc.getToken()
    console.log('🚀 ~ file: index.tsx:32 ~ onAuthClick ~ a:', a)

    // setLoading(true)
    // const user = await chrome.runtime.sendMessage({
    //   type: BACKGROUND_MESSAGE_TYPE.GET_TOKEN
    // })
    // console.log('🚀 ~ file: Side.tsx:8 ~ onAuthClick ~ user:', user)
    // setLoading(false)
    // setUser(user)
    // setIsLogin(true)
  }

  useEffect(() => {
    const getInfo = async () => {
      const isLogin = await chrome.runtime.sendMessage({
        type: BACKGROUND_MESSAGE_TYPE.GET_IS_LOGIN
      })
      // setIsLogin(isLogin)
      if (isLogin) {
        const user = await chrome.runtime.sendMessage({
          type: BACKGROUND_MESSAGE_TYPE.GET_USER
        })
        console.log('user🚀 ~ file: Side.tsx:8 ~ onAuthClick ~ user:', user)
        setUser(user)
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
