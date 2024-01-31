import type { IAuthProvidersRespItem, LoginResp } from '@/api/types'
import { useState } from 'react'
import useSWR from 'swr'
import AuthButton from './AuthButton'
import { createBackgroundMessage } from '@/messaging/background'
import { withTokenFetcher } from '@/utils/request'

interface AuthProps {
  authSuccess: (user: LoginResp) => void
}
export default function Auth(props: AuthProps) {
  const { authSuccess } = props
  const { data } = useSWR(
    { url: '/auth/providers' },
    withTokenFetcher<IAuthProvidersRespItem[]>
  )

  const [loading, setLoading] = useState(false)

  const onAuthClick = async (item: IAuthProvidersRespItem) => {
    setLoading(true)
    const bgs = createBackgroundMessage()
    const user = await bgs.auth(item.authUrl)
    setLoading(false)
    authSuccess(user)
  }

  return (
    <div className="mt-2 flex justify-center items-center">
      {data?.map((item) => (
        <AuthButton
          key={item.provider}
          loading={loading}
          onAuthClick={() => onAuthClick(item)}
        />
      ))}
    </div>
  )
}
