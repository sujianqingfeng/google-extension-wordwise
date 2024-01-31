type SearchProps = {
  onQuery: (text: string) => void
  onTextChange?: (text: string) => void
  text?: string
  autoFocus?: boolean
}

export default function Search(props: SearchProps) {
  const { onQuery, text, onTextChange, autoFocus = false } = props

  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    onTextChange && onTextChange(value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && text) {
      onQuery(text)
    }
  }

  const onSearchClick = () => {
    if (!text) {
      return
    }
    onQuery(text)
  }

  return (
    <header className="flex justify-start items-center gap-2">
      <input
        value={text}
        onInput={onInput}
        autoFocus={autoFocus}
        className="flex-1 border rounded-md px-2 py-1 border-gray-300"
        placeholder="please input text"
        onKeyDown={onKeyDown}
      />
      <button
        className="bg-primary-color px-2 py-1 rounded-md"
        onClick={onSearchClick}
      >
        search
      </button>
    </header>
  )
}
