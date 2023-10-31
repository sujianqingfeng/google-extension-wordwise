import React, { useState } from 'react'

type SearchProps = {
  onQuery: (text: string) => void
}

export default function Search(props: SearchProps) {
  const { onQuery } = props
  const [text, setText] = useState('')

  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setText(value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onQuery(text)
    }
  }

  return (
    <header className="flex justify-start items-center gap-2">
      <input
        value={text}
        onInput={onInput}
        autoFocus
        className="flex-1 border rounded-md px-2 py-1 border-gray-300"
        placeholder="please input text"
        onKeyDown={onKeyDown}
      />
      <button
        className="bg-primary-color px-2 py-1 rounded-md"
        onClick={() => onQuery(text)}
      >
        search
      </button>
    </header>
  )
}
