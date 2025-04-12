import Collect from "./Collect"
import Expand from "./Expand"
import Phonetic from "./Phonetic"
import Translate from "./Translate"
import { CUSTOM_EVENT_TYPE } from "@/constants"
import { createBackgroundMessage } from "@/messaging/background"
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"

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
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md ring-1 ring-gray-200 dark:ring-gray-700">
			<div className="p-3">
				<div className="flex justify-between items-center">
					<div className="flex items-end gap-1.5">
						<h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
							{result?.word}
						</h1>
						<div>
							<Phonetic type="uk" {...result} />
						</div>
					</div>
					<Collect
						onCollect={onCollect}
						isCollected={!!collectedResult?.collected}
					/>
				</div>

				{result?.examTypes && (
					<div className="mt-1.5 flex gap-1 flex-wrap">
						{result.examTypes.map((type) => (
							<span
								key={type}
								className="px-1.5 py-0.5 text-xs font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-full ring-1 ring-gray-200/50 dark:ring-gray-600/50"
							>
								{type}
							</span>
						))}
					</div>
				)}

				<div className="mt-2 space-y-1">
					{result?.translations?.map((t, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<Translate key={i} {...t} />
					))}
				</div>
			</div>

			<Expand forms={result.forms} word={word} />
		</div>
	)
}
