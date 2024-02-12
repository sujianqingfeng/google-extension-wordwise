import { ICreateReadLater } from '@/api/types'
import { Readability } from '@mozilla/readability'
import useSWRMutation from 'swr/mutation'
import {isValid,getTime} from 'date-fns'

export default function Later() {

  const { token } = useToken()
 const { trigger } = useSWRMutation({url: '/read-later',token}, postWithTokenFetcher<any,ICreateReadLater>)


  const onLater = () => {
    const documentClone = document.cloneNode(true) as Document
    const result = new Readability(documentClone).parse()
    console.log('🚀 ~ onLater ~ result:', result)

    if(!result){
      return
    }

    const { title,excerpt,content,publishedTime: time,byline} = result
    const publishedTime = isValid(time) ? getTime(time) : Date.now()
    
    trigger({
      title,
      desc: excerpt,
      author: byline,
      content,
      publishedTime,
      source: location.href
    })
  }

  return (
    <div>
      <button className='bg-slate-500 w-full rounded-md p-2' onClick={onLater}>Read later</button>
    </div>
  )
}
