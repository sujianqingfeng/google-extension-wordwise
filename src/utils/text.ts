export function isEnglishText(text: string) {
	const englishTextRegex = /^[A-Za-z\s.,!?;_:'"“”’\-=\>\u2019]*$/
	return englishTextRegex.test(text)
}

export function similarPascalCase(str: string): boolean {
	const customPatternRegex = /^[A-Z][a-zA-Z]*[A-Z][a-zA-Z]*$/
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

	return [" ", ".", ",", "!", "?", ";", ":"].some((char) =>
		trimText.includes(char),
	)
}

export function breakChar(char: string) {
	return [
		" ",
		",",
		".",
		"!",
		"?",
		";",
		":",
		"(",
		")",
		"[",
		"]",
		"{",
		"}",
	].includes(char)
}
