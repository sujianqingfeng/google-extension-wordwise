import { BACKGROUND_MESSAGE_TYPE } from '../constants'

export default function App() {
  const onAuthClick = () => {
    chrome.runtime.sendMessage({ type: BACKGROUND_MESSAGE_TYPE.GET_TOKEN })
  }

  const onQueryWordClick = () => {
    chrome.runtime.sendMessage({
      type: BACKGROUND_MESSAGE_TYPE.QUERY_WORD,
      payload: { word: 'hello' }
    })
  }

  return (
    <div>
      <p className="text-3xl font-bold text-red-600">wordwise</p>
      <button onClick={onAuthClick}>google auth</button>
      <button onClick={onQueryWordClick}>query</button>
    </div>
  )
}
