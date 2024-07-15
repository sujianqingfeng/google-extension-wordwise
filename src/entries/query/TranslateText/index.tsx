import type {} from "@/api/types"
import Loading from "@/components/Loading"
import { RxMagicWand } from "react-icons/rx"
import { useQuery } from "@tanstack/react-query"
import { createBackgroundMessage } from "@/messaging/background"
import Markdown from "react-markdown"

type TranslateTextProps = {
	text: string
}

const bgs = createBackgroundMessage()

export default function TranslateText({ text }: TranslateTextProps) {
	const { data: translateResult, isLoading } = useQuery({
		queryKey: ["translate", text],
		queryFn: () => bgs.fetchTranslate({ text, provider: "deepL" }),
	})

	const {
		data: analyzeResult,
		refetch: fetchAnalyzeGrammar,
		isLoading: analyzeLoading,
	} = useQuery({
		queryKey: ["analyze", text],
		queryFn: () => bgs.fetchAnalyzeGrammar({ text, provider: "deepSeek" }),
		enabled: false,
	})

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-10">
				<Loading />
			</div>
		)
	}

	const onAnalyze = async () => {
		fetchAnalyzeGrammar()
	}

	return (
		<div className="text-sm font-normal dark:text-gray-400 text-black">
			<div className="p-2">
				<div className="mt-2">{text}</div>
				<div className="mt-2">{translateResult}</div>
			</div>

			{analyzeResult && (
				<div className="dark:text-gray-400 text-black p-2 word-wise-markdown">
					<Markdown>{analyzeResult}</Markdown>
				</div>
			)}

			<div className="px-2 py-1 flex justify-end bg-gray-100 dark:bg-slate-400/10">
				{analyzeLoading ? (
					<Loading size={14} />
				) : (
					<RxMagicWand
						className="cursor-pointer dark:text-gray-400 text-black"
						onClick={onAnalyze}
					/>
				)}
			</div>
		</div>
	)
}
