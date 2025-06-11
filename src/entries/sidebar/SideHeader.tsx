import { X, Sparkles } from "lucide-react"

type SideHeaderProps = {
	onClose: () => void
}

export default function SideHeader({ onClose }: SideHeaderProps) {
	return (
		<header className="flex justify-between items-center px-6 py-4 relative">
			{/* Logo和标题 */}
			<div className="flex items-center gap-3">
				<div className="relative">
					<div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-soft hover-glow">
						<Sparkles size={20} className="text-white" />
					</div>
					{/* 装饰性光点 */}
					<div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-green rounded-full animate-pulse-soft" />
				</div>

				<div>
					<h1 className="text-xl font-bold font-sassy-frass tracking-wide bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
						Wordwise
					</h1>
					<p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
						智能翻译助手
					</p>
				</div>
			</div>

			{/* 关闭按钮 */}
			<button
				type="button"
				onClick={onClose}
				className="group relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover-lift"
				aria-label="关闭侧边栏"
			>
				<X
					size={18}
					className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200"
				/>

				{/* 悬浮提示背景 */}
				<div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
			</button>
		</header>
	)
}
