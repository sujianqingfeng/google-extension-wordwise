export function isEnglishText(text: string) {
  // Regular expression for English text
  const englishTextRegex = /^[A-Za-z\s.,!?;:]*$/
  // Check if the text matches the regular expression
  return englishTextRegex.test(text)
}

function isPascalCase(str: string) {
  return /^[A-Z][a-z]*$/.test(str)
}

function isCamelCase(str: string) {
  return /^[a-z][a-z]*$/.test(str)
}

export function isText(text: string) {
  const trimText = text.trim()

  if (isCamelCase(trimText) || isPascalCase(trimText)) {
    return true
  }

  return [' ', '.', ',', '!', '?', ';', ':'].some((char) =>
    trimText.includes(char)
  )
}
