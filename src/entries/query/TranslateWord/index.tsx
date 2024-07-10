import Collect from "./Collect"
import Expand from "./Expand"
import Phonetic from "./Phonetic"
import Translate from "./Translate"
import Loading from "@/components/Loading"
import { CUSTOM_EVENT_TYPE } from "@/constants"
import { createBackgroundMessage } from "@/messaging/background"
import { useMutation, useQuery } from "@tanstack/react-query"

const bgs = createBackgroundMessage()

type TranslateWordProps = {
	word: string
}
export default function TranslateWord({ word: _word }: TranslateWordProps) {
	const word = _word.toLowerCase()

	const { data: result, isLoading: loading } = useQuery({
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

	if (loading) {
		return (
			<div className="flex justify-center items-center h-10">
				<Loading />
			</div>
		)
	}

	return (
		<div>
			<div className="p-2">
				<div className="flex justify-between items-center text-black dark:text-gray-300">
					<div className="text-[20px] font-bold">{result?.word}</div>
					<Collect
						onCollect={onCollect}
						isCollected={!!collectedResult?.collected}
					/>
				</div>
				<div className="flex justify-start items-center gap-2 mt-1">
					<Phonetic
						label="uk"
						phonetic={result?.ukPhonetic}
						speech={result?.ukSpeech}
					/>
					<Phonetic
						label="us"
						phonetic={result?.usPhonetic}
						speech={result?.usSpeech}
					/>
				</div>

				{result?.examTypes && (
					<div className="mt-2 text-[10px] flex gap-1 flex-wrap dark:text-gray-400 text-black">
						{result.examTypes.join("/")}
					</div>
				)}

				<div className="flex flex-col gap-1 mt-2 dark:text-gray-400 text-black">
					{result?.translations?.map((trs, i) => (
						<Translate key={i} {...trs} />
					))}
				</div>
			</div>

			<Expand forms={result?.forms} />
		</div>
	)
}
