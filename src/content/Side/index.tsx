import { useEffect, useState } from 'react'
import SideHeader from './SideHeader'
import User from './User'
import { LoginResp } from '../../api/types'
import { BACKGROUND_MESSAGE_TYPE } from '../../constants'

type SideProps = {
  removeSide: () => void
}

export default function Side(props: SideProps) {
  const [isLogin, setIsLogin] = useState(false)
  const [user, setUser] = useState<LoginResp>()

  const onAuthClick = async () => {
    const user = await chrome.runtime.sendMessage({
      type: BACKGROUND_MESSAGE_TYPE.GET_TOKEN
    })
    console.log('🚀 ~ file: Side.tsx:8 ~ onAuthClick ~ user:', user)
    setUser(user)
    setIsLogin(true)
  }

  useEffect(() => {
    const getInfo = async () => {
      const isLogin = await chrome.runtime.sendMessage({
        type: BACKGROUND_MESSAGE_TYPE.GET_IS_LOGIN
      })
      setIsLogin(isLogin)
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
    <div className="fixed right-0 top-0 bottom-0 w-[400px] z-9999 bg-white shadow p-2">
      <SideHeader onClose={props.removeSide} />

      {isLogin ? (
        <User {...user!} />
      ) : (
        <div className="mt-2 flex justify-center items-center">
          <button
            className="bg-slate-100 rounded-md uppercase p-2 text-md"
            onClick={onAuthClick}
          >
            google auth
          </button>
        </div>
      )}
    </div>
  )
}
