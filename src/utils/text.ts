export function isEnglishText(text: string) {
  // Regular expression for English text
  const englishTextRegex = /^[A-Za-z\s.,!?;:]*$/
  // Check if the text matches the regular expression
  return englishTextRegex.test(text)
}

export function isText(text: string) {
  const trimText = text.trim()
  return [' ', '.', ',', '!', '?', ';', ':'].some((char) =>
    trimText.includes(char)
  )
}
