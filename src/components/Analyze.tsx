import Markdown from "react-markdown"

type AnalyzeProps = {
	result?: string
}

export default function Analyze({ result }: AnalyzeProps) {
	if (!result) {
		return null
	}

	return (
		<div className="dark:text-gray-400 text-black p-2 word-wise-markdown max-h-[400px] overflow-y-auto">
			<Markdown>{result}</Markdown>
		</div>
	)
}
