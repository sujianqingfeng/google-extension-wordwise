import { BACKGROUND_MESSAGE_TYPE } from '../constants'

export default function App() {
  const onAuthClick = () => {
    chrome.runtime.sendMessage({ type: BACKGROUND_MESSAGE_TYPE.GET_TOKEN })
  }

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[300px] z-9999 bg-white shadow">
      <p className="text-3xl font-bold text-red-600">wordwise</p>
      <button onClick={onAuthClick}>google auth</button>
    </div>
  )
}
