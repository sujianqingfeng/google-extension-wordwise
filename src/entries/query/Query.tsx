import { Suspense, useEffect, useRef, useState } from "react"
import TranslateText from "./TranslateText"
import TranslateWord from "./TranslateWord"
import { isText } from "@/utils/text"
import QueryClientProvider from "@/components/QueryClientProvider"
import Loading from "@/components/Loading"

function Fallback() {
	return (
		<div className="flex justify-center items-center h-10">
			<Loading size={20} />
		</div>
	)
}

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
	const [position, setPosition] = useState({ top: top ?? 0, left: left ?? 0 })
	const initialPosition = usePlacement({ triggerRect, contentRect: queryRect })

	useOutsideClick({
		ref: queryRef,
		onOutsideClick: removeQueryPanel,
	})

	useEffect(() => {
		setPosition({
			top: top ?? initialPosition.top,
			left: left ?? initialPosition.left,
		})
	}, [top, left, initialPosition.top, initialPosition.left])

	const onDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault()
		const startX = e.clientX - position.left
		const startY = e.clientY - position.top

		const onDrag = (e: MouseEvent) => {
			setPosition({
				top: e.clientY - startY,
				left: e.clientX - startX,
			})
		}

		const onDragEnd = () => {
			document.removeEventListener("mousemove", onDrag)
			document.removeEventListener("mouseup", onDragEnd)
		}

		document.addEventListener("mousemove", onDrag)
		document.addEventListener("mouseup", onDragEnd)
	}

	return (
		<QueryClientProvider>
			<div
				ref={queryRef}
				style={{
					top: `${position.top}px`,
					left: `${position.left}px`,
					width: `${isTextFlag ? 550 : 400}px`,
				}}
				className="fixed flex flex-col justify-center items-start bg-base z-10000 rounded-sm shadow"
			>
				<div
					className="w-full h-4 cursor-move rounded-t-md absolute top-0 left-0"
					onMouseDown={onDragStart}
				/>
				<div className="w-full bg-base rounded-md">
					<Suspense fallback={<Fallback />}>
						{text && isTextFlag && <TranslateText text={text} />}
					</Suspense>

					<Suspense fallback={<Fallback />}>
						{text && !isTextFlag && <TranslateWord word={text} />}
					</Suspense>
				</div>
			</div>
		</QueryClientProvider>
	)
}
