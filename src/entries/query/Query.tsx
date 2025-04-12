import { Suspense, useEffect, useRef, useState } from "react"
import TranslateText from "./TranslateText"
import TranslateWord from "./TranslateWord"
import { isText } from "@/utils/text"
import QueryClientProvider from "@/components/QueryClientProvider"
import Loading from "@/components/Loading"
import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

function Fallback() {
	return (
		<div className="flex justify-center items-center h-8">
			<Loading size={16} />
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
					width: `${isTextFlag ? 500 : 360}px`,
				}}
				className="fixed flex flex-col justify-center items-start bg-base z-10000 rounded-lg shadow-md transform hover:shadow-lg border border-gray-200/10 transition-shadow duration-200"
			>
				<div
					className="w-full h-3 cursor-move rounded-t-lg absolute top-0 left-0 bg-gradient-to-r from-gray-100/5 to-gray-200/5 hover:from-gray-100/10 hover:to-gray-200/10 transition-colors duration-200"
					onMouseDown={onDragStart}
				/>
				<div className="w-full bg-base rounded-lg overflow-hidden">
					<Suspense fallback={<Fallback />}>
						{text && isTextFlag && <TranslateText text={text} />}
					</Suspense>

					<QueryErrorResetBoundary>
						{({ reset }) => (
							<ErrorBoundary
								onReset={reset}
								fallbackRender={({ resetErrorBoundary }) => (
									<div className="p-3 flex items-center gap-2 text-red-500 text-sm">
										<span>出错了！</span>
										<button
											className="px-2 py-0.5 rounded-full border border-red-500 hover:bg-red-500/10 transition-colors duration-200 text-sm"
											type="button"
											onClick={() => resetErrorBoundary()}
										>
											重试
										</button>
									</div>
								)}
							>
								<Suspense fallback={<Fallback />}>
									{text && !isTextFlag && <TranslateWord word={text} />}
								</Suspense>
							</ErrorBoundary>
						)}
					</QueryErrorResetBoundary>
				</div>
			</div>
		</QueryClientProvider>
	)
}
