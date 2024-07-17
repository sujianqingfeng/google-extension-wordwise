import { Suspense, useRef } from "react"
import TranslateText from "./TranslateText"
import TranslateWord from "./TranslateWord"
import { useClientRect } from "../../hooks/use-client-rect"
import { useOutsideClick } from "../../hooks/use-element"
import { usePlacement } from "../../hooks/use-placement"
import { isText } from "../../utils/text"
import QueryClientProvider from "@/components/QueryClientProvider"
import Loading from "@/components/Loading"

export type QueryProps = {
	top?: number
	left?: number
	removeQueryPanel: () => void
	text?: string
	autoFocus?: boolean
	triggerRect?: DOMRect | null
}

export default function Query({
	top,
	left,
	removeQueryPanel,
	text = "",
	triggerRect = null,
}: QueryProps) {
	const isTextFlag = isText(text)

	const queryRef = useRef<HTMLDivElement>(null)
	const [queryRect] = useClientRect(queryRef)

	useOutsideClick({
		ref: queryRef,
		onOutsideClick() {
			removeQueryPanel()
		},
	})

	const position = usePlacement({ triggerRect, contentRect: queryRect })

	return (
		<QueryClientProvider>
			<div
				ref={queryRef}
				style={{ top: top ?? position.top, left: left ?? position.left }}
				className="fixed flex justify-center items-start bg-base z-9999"
			>
				<div className="w-[350px] bg-base rounded-md shadow">
					<Suspense
						fallback={
							<div className="flex justify-center items-center h-10">
								<Loading />
							</div>
						}
					>
						{text && isTextFlag && <TranslateText text={text} />}
					</Suspense>
					{text && !isTextFlag && <TranslateWord word={text} />}
				</div>
			</div>
		</QueryClientProvider>
	)
}
