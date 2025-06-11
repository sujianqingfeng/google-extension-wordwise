import { User as UserIcon, Mail, Crown } from "lucide-react"
import Card from "@/components/Card"

type UserProps = {
	name: string
	email: string
	avatar: string
}

export default function User({ avatar, name, email }: UserProps) {
	return (
		<div className="mx-4 mt-4 animate-slide-in-up">
			{/* 用户信息卡片 */}
			<Card hover>
				{/* 头像区域 */}
				<div className="flex flex-col items-center mb-4">
					<div className="relative group">
						{/* 头像背景光环 */}
						<div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300" />

						{/* 头像容器 */}
						<div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-br from-primary-400 to-primary-600 shadow-soft">
							<img
								src={avatar}
								alt={`${name}的头像`}
								className="w-full h-full rounded-full object-cover bg-white"
								onError={(e) => {
									// 头像加载失败时的备用方案
									const target = e.target as HTMLImageElement
									target.style.display = "none"
									target.nextElementSibling?.classList.remove("hidden")
								}}
							/>
							{/* 备用头像图标 */}
							<div className="hidden absolute inset-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
								<UserIcon size={24} className="text-gray-400" />
							</div>
						</div>

						{/* 在线状态指示器 */}
						<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-green rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-soft">
							<Crown size={12} className="text-white" />
						</div>
					</div>
				</div>

				{/* 用户信息 */}
				<div className="text-center space-y-2">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
						{name}
					</h3>

					<div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
						<Mail size={14} />
						<span className="truncate">{email}</span>
					</div>
				</div>

				{/* 装饰性分隔线 */}
				<div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
					<div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
						<div className="w-2 h-2 bg-accent-green rounded-full animate-pulse-soft" />
						<span>已登录</span>
					</div>
				</div>
			</Card>
		</div>
	)
}
