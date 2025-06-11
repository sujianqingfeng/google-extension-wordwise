import { LogIn, Sparkles } from "lucide-react"
import Button from "@/components/Button"

type AuthButtonProps = {
	onAuthClick: () => void
	loading?: boolean
}

export default function AuthButton({
	onAuthClick,
	loading = false,
}: AuthButtonProps) {
	return (
		<div className="px-6 py-4">
			<Button
				variant="primary"
				size="lg"
				loading={loading}
				onClick={onAuthClick}
				className="w-full relative overflow-hidden group"
				leftIcon={
					!loading && (
						<div className="relative">
							<LogIn
								size={20}
								className="transition-transform duration-200 group-hover:scale-110"
							/>
							<Sparkles
								size={12}
								className="absolute -top-1 -right-1 text-white/80 animate-pulse-soft"
							/>
						</div>
					)
				}
			>
				{/* 背景光效 */}
				<div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

				{/* 按钮文本 */}
				<span className="relative font-medium tracking-wide">
					{loading ? "登录中..." : "使用谷歌登录"}
				</span>

				{/* 底部装饰线 */}
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
			</Button>

			{/* 提示文本 */}
			<p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3 px-2">
				安全登录，享受完整功能体验
			</p>
		</div>
	)
}
