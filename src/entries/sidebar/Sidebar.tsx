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
			<div className="fixed top-0 right-0 bottom-0 z-9999 w-[320px] bg-base shadow-lg transition-all duration-300 ease-in-out">
				<div className="flex flex-col h-full">
					<SideHeader onClose={removeSidebar} />
					<div className="flex-1 overflow-y-auto">
						<Suspense fallback={<Loading />}>
							<IfAuth />
						</Suspense>
					</div>
				</div>
			</div>
		</QueryClientProvider>
	)
}
