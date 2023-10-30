import { useState } from 'react'
import { fetchCreateWordApi, fetchQueryWordApi } from '../../api'
import Search from './Search'
import Favorite from '../../assets/favorite.svg?react'

export default function Query() {
  const [translation, setTranslation] = useState('')
  const [word, setWord] = useState('')
  const onQuery = async (text: string) => {
    const [isOk, data] = await fetchQueryWordApi(text)
    if (!isOk) {
      return
    }
    setWord(text)
    const { translation } = data
    setTranslation(translation)
  }

  const onFavorite = async () => {
    const [isOk] = await fetchCreateWordApi({ word })
    console.log('🚀 ~ file: index.tsx:21 ~ onFavorite ~ isOk:', isOk)
    if (!isOk) {
      return
    }
  }

  return (
    <div className="w-full h-full flex justify-center items-start pt-20 text-black">
      <div className="w-[400px] bg-white p-2 rounded-md shadow">
        <Search onQuery={onQuery} />

        <div>
          <button onClick={onFavorite}>
            <Favorite />
          </button>
        </div>
        <div>{translation}</div>
      </div>
    </div>
  )
}
