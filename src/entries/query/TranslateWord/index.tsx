import Collect from "./Collect"
import Expand from "./Expand"
import Phonetic from "./Phonetic"
import Translate from "./Translate"
import { CUSTOM_EVENT_TYPE } from "@/constants"
import { createBackgroundMessage } from "@/messaging/background"
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { BookOpen } from "lucide-react"
import { useEffect } from "react"
import { playAudioByUrl } from "@/utils/audio"

const bgs = createBackgroundMessage()

type TranslateWordProps = {
	word: string
}

export default function TranslateWord({ word: _word }: TranslateWordProps) {
	const word = _word.toLowerCase()

	const { data: result } = useSuspenseQuery({
		queryKey: ["word", word],
		queryFn: () => bgs.fetchDictionQuery(word),
	})

	const { data: collectedResult, refetch: fetchWordCollected } = useQuery({
		queryKey: ["collected", word],
		queryFn: () => bgs.fetchWordCollected(word),
	})

	const { mutateAsync: collectWord } = useMutation({
		mutationFn: bgs.fetchAddWordCollected,
	})

	const { mutateAsync: removeWord } = useMutation({
		mutationFn: bgs.fetchRemoveWordCollected,
	})

	// 自动播放发音
	useEffect(() => {
		if (result) {
			// 使用与Phonetic组件相同的方法来避免CORS问题
			const playAutoPronunciation = async () => {
				try {
					// 优先使用英式发音，如果没有则使用美式发音
					const type = result.ukSpeech ? "1" : "2" // 1=英式, 2=美式
					const audioBase64 = await bgs.fetchAudioBase64FromDictionUrl(
						word,
						type,
					)
					playAudioByUrl(audioBase64)
				} catch (error) {
					console.warn("自动发音失败:", error)
				}
			}

			playAutoPronunciation()
		}
	}, [result, word])

	const onCollect = async (next: boolean) => {
		// no query result
		if (!result) {
			return
		}

		next ? await collectWord(word) : await removeWord(word)

		// TODO: remove range words
		if (next) {
			document.dispatchEvent(
				new CustomEvent(CUSTOM_EVENT_TYPE.RANGE_WORDS, { detail: [word] }),
			)
		}
		fetchWordCollected()
	}

	return (
		<div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-soft ring-1 ring-gray-200/50 dark:ring-gray-700/50 overflow-hidden hover-glow animate-slide-in-up">
			{/* 头部区域 */}
			<div className="px-3 py-2 bg-gradient-to-r from-primary-50/30 via-white to-primary-50/30 dark:from-primary-900/10 dark:via-slate-800 dark:to-primary-900/10 border-b border-gray-200/30 dark:border-gray-700/30">
				<div className="flex justify-between items-start gap-2">
					<div className="flex items-start gap-2 flex-1 min-w-0">
						{/* 单词图标 */}
						<div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-soft flex-shrink-0 mt-0.5">
							<BookOpen size={14} className="text-white" />
						</div>

						<div className="flex-1 min-w-0">
							{/* 单词标题和音标 */}
							<div className="flex items-center gap-2 mb-1">
								<h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent truncate">
									{result?.word}
								</h1>
								<Phonetic type="uk" {...result} />
							</div>

							{/* 考试类型标签 */}
							{result?.examTypes && (
								<div className="flex gap-1 flex-wrap">
									{result.examTypes.map((type) => (
										<span
											key={type}
											className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded border border-primary-200/50 dark:border-primary-700/50"
										>
											{type}
										</span>
									))}
								</div>
							)}
						</div>
					</div>

					{/* 收藏按钮 */}
					<div className="flex-shrink-0">
						<Collect
							onCollect={onCollect}
							isCollected={!!collectedResult?.collected}
						/>
					</div>
				</div>
			</div>

			{/* 翻译内容区域 */}
			<div className="px-3 py-2">
				<div className="space-y-1">
					{result?.translations?.map((t, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<Translate key={i} {...t} />
					))}
				</div>
			</div>

			{/* 扩展区域 */}
			<Expand forms={result.forms} word={word} />
		</div>
	)
}
