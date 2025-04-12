import Markdown from "react-markdown"
import remarkBreaks from "remark-breaks"

type AnalyzeProps = {
	result?: string
}

export default function Analyze({ result }: AnalyzeProps) {
	if (!result) {
		return null
	}

	// 确保Markdown内容中的换行符被保留，但减少额外换行
	const formattedResult = result
		.replace(/### /g, "\n### ") // 只在标题前添加一个换行
		.replace(/\d+\. /g, "$&") // 不添加额外换行

	return (
		<div className="dark:text-gray-400 text-black px-3 py-1.5 word-wise-markdown overflow-y-auto text-xs">
			<Markdown remarkPlugins={[remarkBreaks]} className="whitespace-pre-wrap">
				{formattedResult}
			</Markdown>
		</div>
	)
}
