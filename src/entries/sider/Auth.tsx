import useSWR from 'swr'
import { withTokenFetcher } from '@/utils/request'

export default function Auth() {
  const { data } = useSWR({ url: '/auth/providers', args: {} }, (options) => {
    console.log('🚀 ~ const{data}=useSWR ~ options:', options)
  })
  console.log('🚀 ~ Auth ~ data:', data)
  return <div>fff</div>
}
