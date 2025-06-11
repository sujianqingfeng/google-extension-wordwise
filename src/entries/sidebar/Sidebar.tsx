import { Suspense } from "react"
import SideHeader from "./SideHeader"
import Loading from "@/components/Loading"
import IfAuth from "./IfAuth"
import QueryClientProvider from "@/components/QueryClientProvider"

type SideProps = {
	removeSidebar: () => void
}

export default function Sidebar({ removeSidebar }: SideProps) {
	return (
		<QueryClientProvider>
			<div className="fixed top-0 right-0 bottom-0 z-9999 w-[380px] slide-in-right">
				{/* 背景遮罩 */}
				<div
					className="absolute inset-0 bg-black/20 backdrop-blur-xs -left-[100vw] w-[100vw]"
					onClick={removeSidebar}
				/>

				{/* 侧边栏主体 */}
				<div className="relative h-full glass-effect border-l border-gray-200/30 dark:border-gray-700/30 shadow-strong">
					{/* 装饰性渐变背景 */}
					<div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-primary-100/20 dark:from-primary-900/20 dark:via-transparent dark:to-primary-800/10 pointer-events-none" />

					{/* 内容区域 */}
					<div className="relative flex flex-col h-full">
						<SideHeader onClose={removeSidebar} />

						{/* 分隔线 */}
						<div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700 mx-4" />

						{/* 主要内容区域 */}
						<div className="flex-1 overflow-y-auto custom-scrollbar p-1">
							<Suspense
								fallback={
									<div className="flex justify-center items-center h-32">
										<Loading size={24} />
									</div>
								}
							>
								<IfAuth />
							</Suspense>
						</div>

						{/* 底部装饰 */}
						<div className="h-2 bg-gradient-to-r from-primary-200/20 via-primary-300/30 to-primary-200/20 dark:from-primary-800/20 dark:via-primary-700/30 dark:to-primary-800/20" />
					</div>
				</div>
			</div>
		</QueryClientProvider>
	)
}
