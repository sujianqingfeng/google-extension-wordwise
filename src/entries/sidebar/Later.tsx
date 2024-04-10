import { Readability } from '@mozilla/readability'
import { format, isValid, toDate } from 'date-fns'
import useSWRMutation from 'swr/mutation'
import { ICreateReadLater } from '@/api/types'

export default function Later() {
  const { token } = useToken()
  const { trigger } = useSWRMutation(
    { url: '/read-later', token },
    postWithTokenFetcher<any, ICreateReadLater>
  )

  const onLater = () => {
    const documentClone = document.cloneNode(true) as Document
    const result = new Readability(documentClone).parse()
    console.log('🚀 ~ onLater ~ result:', result)

    if (!result) {
      return
    }

    const { title, excerpt, content, publishedTime: time, byline } = result
    const publishedTime = isValid(time) ? toDate(time) : new Date()

    trigger({
      title,
      desc: excerpt,
      author: byline || '',
      content,
      publishedTime: format(publishedTime, 'yyyy-MM-dd HH:mm:ss'),
      source: location.href
    })
  }

  return (
    <div>
      <button className="bg-slate-500 w-full rounded-md p-2" onClick={onLater}>
        Read later
      </button>
    </div>
  )
}
