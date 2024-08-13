import Loading from "@/components/Loading"
import Markdown from "react-markdown"

type AnalyzeProps = {
	loading: boolean
	result?: string
}

export default function Analyze({ loading, result }: AnalyzeProps) {
	if (loading) {
		return (
			<div className="p-2">
				<Loading />
			</div>
		)
	}

	return (
		<div className="dark:text-gray-400 text-black p-2 word-wise-markdown max-h-[400px] overflow-y-auto">
			<Markdown>{result}</Markdown>
		</div>
	)
}
