import { useState } from 'react'
import { fetchQueryWordApi } from '../../api'
import Search from './Search'
import Favorite from '../../assets/favorite.svg?react'

export default function Query() {
  const [translation, setTranslation] = useState('')
  const onQuery = async (text: string) => {
    const [isOk, data] = await fetchQueryWordApi(text)
    if (!isOk) {
      return
    }
    const { translation } = data
    setTranslation(translation)
  }

  return (
    <div className="w-full h-full flex justify-center items-start pt-20 text-black">
      <div className="w-[400px] bg-white p-2 rounded-md shadow">
        <Search onQuery={onQuery} />

        <div>
          <button>
            <Favorite />
          </button>
        </div>
        <div>{translation}</div>
      </div>
    </div>
  )
}
