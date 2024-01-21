export function isEnglishText(text: string) {
  // Regular expression for English text
  const englishTextRegex = /^[A-Za-z\s.,!?;:]*$/
  // Check if the text matches the regular expression
  return englishTextRegex.test(text)
}

export function similarPascalCase(str: string): boolean {
  const customPatternRegex = /^[A-Z][a-zA-Z]*[A-Z][a-zA-Z]*$/

  // Test if the string matches the custom pattern
  return customPatternRegex.test(str)
}

export function similarCamelCase(str: string) {
  const customPatternRegex = /^[a-z]+[A-Z][a-zA-Z0-9]*$/
  return customPatternRegex.test(str)
}

export function isText(text: string) {
  const trimText = text.trim()

  if (similarCamelCase(trimText) || similarPascalCase(trimText)) {
    return true
  }

  return [' ', '.', ',', '!', '?', ';', ':'].some((char) =>
    trimText.includes(char)
  )
}
