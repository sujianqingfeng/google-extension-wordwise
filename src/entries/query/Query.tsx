import { Suspense, useEffect, useRef, useState, type RefObject } from "react"
import TranslateText from "./TranslateText"
import TranslateWord from "./TranslateWord"
import { isText } from "@/utils/text"
import QueryClientProvider from "@/components/QueryClientProvider"
import Loading from "@/components/Loading"
import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { GripHorizontal, RefreshCw, AlertCircle } from "lucide-react"

function Fallback() {
	return (
		<div className="flex justify-center items-center h-12 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg mx-4 my-2">
			<Loading size={18} />
			<span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
				加载中...
			</span>
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
	const [isDragging, setIsDragging] = useState(false)
	const initialPosition = usePlacement({ triggerRect, contentRect: queryRect })

	useOutsideClick({
		ref: queryRef as RefObject<Element>,
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
		setIsDragging(true)
		const startX = e.clientX - position.left
		const startY = e.clientY - position.top

		const onDrag = (e: MouseEvent) => {
			setPosition({
				top: e.clientY - startY,
				left: e.clientX - startX,
			})
		}

		const onDragEnd = () => {
			setIsDragging(false)
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
					width: `${isTextFlag ? 520 : 380}px`,
				}}
				className={`
					fixed z-10000 animate-slide-in-up
					${isDragging ? "cursor-grabbing" : ""}
				`}
			>
				{/* 主容器 */}
				<div className="glass-effect rounded-xl shadow-strong border border-gray-200/20 dark:border-gray-700/20 overflow-hidden hover-glow">
					{/* 拖拽手柄 */}
					<div
						className={`
							w-full h-8 flex items-center justify-center
							bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80
							border-b border-gray-200/30 dark:border-gray-700/30
							cursor-grab active:cursor-grabbing
							hover:from-gray-100/80 hover:to-gray-200/80 dark:hover:from-gray-700/80 dark:hover:to-gray-600/80
							transition-all duration-200
							${isDragging ? "bg-primary-100/50 dark:bg-primary-900/50" : ""}
						`}
						onMouseDown={onDragStart}
					>
						<GripHorizontal
							size={16}
							className={`
								text-gray-400 dark:text-gray-500 transition-colors duration-200
								${isDragging ? "text-primary-500" : "hover:text-gray-600 dark:hover:text-gray-300"}
							`}
						/>
					</div>

					{/* 内容区域 */}
					<div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
						{/* 文本翻译 */}
						<Suspense fallback={<Fallback />}>
							{text && isTextFlag && <TranslateText text={text} />}
						</Suspense>

						{/* 单词翻译 */}
						<QueryErrorResetBoundary>
							{({ reset }) => (
								<ErrorBoundary
									onReset={reset}
									fallbackRender={({ resetErrorBoundary }) => (
										<div className="p-4 m-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
											<div className="flex items-center gap-3 text-red-600 dark:text-red-400">
												<AlertCircle size={20} />
												<div className="flex-1">
													<p className="font-medium text-sm">翻译出错了</p>
													<p className="text-xs text-red-500 dark:text-red-400 mt-1">
														请检查网络连接或稍后重试
													</p>
												</div>
												<button
													className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-700/40 text-red-600 dark:text-red-400 rounded-lg transition-colors duration-200 text-sm font-medium"
													type="button"
													onClick={() => resetErrorBoundary()}
												>
													<RefreshCw size={14} />
													重试
												</button>
											</div>
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
			</div>
		</QueryClientProvider>
	)
}
