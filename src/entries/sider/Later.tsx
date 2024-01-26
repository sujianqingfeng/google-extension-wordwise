import { Readability } from '@mozilla/readability'

export default function Later() {
  const onLater = () => {
    const result = new Readability(document).parse()
    console.log('🚀 ~ onLater ~ result:', result)
  }

  return (
    <div>
      <button onClick={onLater}>later</button>
    </div>
  )
}
