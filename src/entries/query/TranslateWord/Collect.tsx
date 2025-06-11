import { Heart } from "lucide-react"

type CollectProps = {
	onCollect: (next: boolean) => void
	isCollected: boolean
}

export default function Collect({ onCollect, isCollected }: CollectProps) {
	const onClick = () => {
		onCollect(!isCollected)
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className={`
				relative group w-6 h-6 p-0 transition-all duration-300 rounded
				${
					isCollected
						? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
						: "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
				}
			`}
			aria-label={isCollected ? "取消收藏" : "添加收藏"}
		>
			<div className="relative flex items-center justify-center w-full h-full">
				{/* 心形图标 */}
				<Heart
					size={14}
					className={`
						transition-all duration-300 group-hover:scale-110 
						${isCollected ? "fill-current animate-bounce-subtle" : ""}
					`}
				/>

				{/* 收藏时的光效 */}
				{isCollected && (
					<div className="absolute inset-0 animate-ping flex items-center justify-center">
						<Heart size={14} className="fill-current text-red-300 opacity-30" />
					</div>
				)}
			</div>

			{/* 悬浮提示 */}
			<div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
				{isCollected ? "取消收藏" : "添加收藏"}
			</div>
		</button>
	)
}
